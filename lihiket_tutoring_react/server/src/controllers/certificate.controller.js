/**
 * Certificate Controller
 *
 * Endpoints:
 *   GET  /api/certificates                  – list my certificates (student) or all (admin)
 *   GET  /api/certificates/:id              – get one certificate by Mongo _id
 *   GET  /api/certificates/verify/:certId   – public verify by certificateId (CERT-xxxx)
 *   GET  /api/certificates/:id/download     – stream a PDF to the browser
 *   POST /api/certificates                  – issue (admin only, also in admin.routes)
 *   PATCH /api/certificates/:id/revoke      – revoke (admin only)
 */

const PDFDocument = require('pdfkit');
const QRCode      = require('qrcode');
const Certificate = require('../models/Certificate');
const Enrollment  = require('../models/Enrollment');
const Student     = require('../models/Student');
const AppError    = require('../utils/AppError');
const config      = require('../config/index');
const notify      = require('../utils/notify');
const { EVENTS }  = require('../constants/events');

// ── helper: populate paths reused across handlers ──────────────────────────────
const POPULATE = [
  { path: 'student',  select: 'firstName lastName email userId gradeLevel' },
  { path: 'subject',  select: 'name code gradeLevel description' },
  { path: 'issuedBy', select: 'firstName lastName' },
];

// ── @desc   List certificates
//            · Student → their own certificates
//            · Admin   → all certificates (paginated)
// ── @route  GET /api/certificates
// ── @access Private (student, admin)
exports.getMyCertificates = async (req, res) => {
  const role  = req.userRole;
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const skip  = (page - 1) * limit;

  let filter = {};
  if (role === 'student') {
    filter = { student: req.user._id };
  }
  // admin sees all; teachers/parents should not hit this route (secured in routes file)

  const [docs, total] = await Promise.all([
    Certificate.find(filter)
      .populate(POPULATE)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Certificate.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count:   docs.length,
    total,
    page,
    pages:   Math.ceil(total / limit),
    data:    docs,
  });
};

// ── @desc   Get one certificate by Mongo _id
// ── @route  GET /api/certificates/:id
// ── @access Private
exports.getCertificate = async (req, res) => {
  const cert = await Certificate.findById(req.params.id).populate(POPULATE);
  if (!cert) throw new AppError('Certificate not found', 404);

  // Students may only see their own
  if (req.userRole === 'student' && cert.student?._id?.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorised to view this certificate', 403);
  }

  res.json({ success: true, data: cert });
};

// ── @desc   Public certificate verification (no auth required)
// ── @route  GET /api/certificates/verify/:certId
// ── @access Public
exports.verifyCertificate = async (req, res) => {
  const cert = await Certificate.findOne({ certificateId: req.params.certId }).populate(POPULATE);

  if (!cert) {
    return res.json({ success: false, valid: false, message: 'Certificate not found' });
  }

  res.json({
    success: true,
    valid:   cert.isValid,
    data: {
      certificateId:  cert.certificateId,
      studentName:    `${cert.student?.firstName} ${cert.student?.lastName}`,
      studentId:      cert.student?.userId,
      subjectName:    cert.subject?.name,
      subjectCode:    cert.subject?.code,
      gradeLevel:     cert.subject?.gradeLevel,
      grade:          cert.grade,
      completionDate: cert.completionDate,
      issuedAt:       cert.createdAt,
      isValid:        cert.isValid,
      revokedReason:  cert.isValid ? null : cert.revokedReason,
    },
  });
};

// ── @desc   Issue a new certificate
// ── @route  POST /api/certificates
// ── @access Private (admin)
exports.issueCertificate = async (req, res) => {
  const { studentId, subjectId, grade, completionDate } = req.body;

  if (!studentId || !subjectId) {
    throw new AppError('studentId and subjectId are required', 400);
  }

  // Verify active enrollment
  const enrollment = await Enrollment.findOne({
    student: studentId,
    subject: subjectId,
    status:  'active',
  });
  if (!enrollment) throw new AppError('Student is not actively enrolled in this subject', 400);

  // Prevent duplicates
  const existing = await Certificate.findOne({ student: studentId, subject: subjectId });
  if (existing) throw new AppError('Certificate already issued for this student/subject pair', 409);

  // Generate QR code pointing to the public verify page
  let qrCode = null;
  try {
    // We create the cert first to get its certificateId, then update
    const tempCert = new Certificate({
      student:        studentId,
      subject:        subjectId,
      issuedBy:       req.user._id,
      grade:          grade || null,
      completionDate: completionDate ? new Date(completionDate) : new Date(),
    });

    const verifyUrl = `${config.clientUrl}/certificates/verify/${tempCert.certificateId}`;
    qrCode = await QRCode.toDataURL(verifyUrl);
    tempCert.qrCode = qrCode;

    await tempCert.save();
    await tempCert.populate(POPULATE);

    // Notify student
    await notify({
      userId:    studentId,
      userModel: 'Student',
      type:      EVENTS.CERTIFICATE_ISSUED,
      title:     'Certificate Issued 🎓',
      message:   `Congratulations! You have been awarded a certificate for "${tempCert.subject?.name}".`,
      link:      '/certificates',
    });

    return res.status(201).json({ success: true, data: tempCert });
  } catch (err) {
    if (err.code === 11000) throw new AppError('Certificate already exists for this student/subject', 409);
    throw err;
  }
};

// ── @desc   Revoke a certificate
// ── @route  PATCH /api/certificates/:id/revoke
// ── @access Private (admin)
exports.revokeCertificate = async (req, res) => {
  const { reason } = req.body;

  const cert = await Certificate.findById(req.params.id);
  if (!cert) throw new AppError('Certificate not found', 404);
  if (!cert.isValid) throw new AppError('Certificate is already revoked', 400);

  cert.isValid       = false;
  cert.revokedReason = reason || 'Revoked by administrator';
  await cert.save();
  await cert.populate(POPULATE);

  res.json({ success: true, message: 'Certificate revoked', data: cert });
};

// ── @desc   Download certificate as PDF
// ── @route  GET /api/certificates/:id/download
// ── @access Private (student — own cert, or admin)
exports.downloadCertificate = async (req, res) => {
  const cert = await Certificate.findById(req.params.id).populate(POPULATE);
  if (!cert) throw new AppError('Certificate not found', 404);

  // Students may only download their own
  if (req.userRole === 'student' && cert.student?._id?.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorised to download this certificate', 403);
  }

  if (!cert.isValid) throw new AppError('This certificate has been revoked', 400);

  const studentName  = `${cert.student?.firstName} ${cert.student?.lastName}`;
  const subjectName  = cert.subject?.name  || 'Unknown Subject';
  const subjectCode  = cert.subject?.code  || '';
  const gradeLevel   = cert.subject?.gradeLevel || '';
  const completedOn  = cert.completionDate
    ? new Date(cert.completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';
  const certId       = cert.certificateId;
  const grade        = cert.grade || null;

  // ── Build PDF ────────────────────────────────────────────────────────────────
  const doc = new PDFDocument({
    size:    'A4',
    layout:  'landscape',
    margins: { top: 40, bottom: 40, left: 60, right: 60 },
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="certificate-${certId}.pdf"`
  );
  doc.pipe(res);

  const W = doc.page.width;   // 841.89
  const H = doc.page.height;  // 595.28

  // Background
  doc.rect(0, 0, W, H).fill('#0f172a');  // dark slate

  // Gold border frame
  const PAD = 20;
  doc
    .rect(PAD, PAD, W - PAD * 2, H - PAD * 2)
    .lineWidth(3)
    .stroke('#f59e0b');

  // Inner white panel
  doc
    .rect(PAD + 8, PAD + 8, W - (PAD + 8) * 2, H - (PAD + 8) * 2)
    .fill('#ffffff');

  // Header band
  doc.rect(PAD + 8, PAD + 8, W - (PAD + 8) * 2, 80).fill('#1e293b');

  // Platform name
  doc
    .fillColor('#f59e0b')
    .font('Helvetica-Bold')
    .fontSize(22)
    .text('LIHIKET TUTORING', 0, PAD + 22, { align: 'center' });

  // Sub-header
  doc
    .fillColor('#94a3b8')
    .font('Helvetica')
    .fontSize(11)
    .text('Certificate of Completion', 0, PAD + 52, { align: 'center' });

  // Recipient label
  doc
    .fillColor('#475569')
    .font('Helvetica')
    .fontSize(12)
    .text('This is to certify that', 0, 140, { align: 'center' });

  // Student name
  doc
    .fillColor('#0f172a')
    .font('Helvetica-Bold')
    .fontSize(30)
    .text(studentName, 0, 162, { align: 'center' });

  // Divider line under name
  const lineY = 205;
  doc
    .moveTo(W / 2 - 160, lineY).lineTo(W / 2 + 160, lineY)
    .strokeColor('#f59e0b').lineWidth(1.5).stroke();

  // Body text
  doc
    .fillColor('#475569')
    .font('Helvetica')
    .fontSize(12)
    .text('has successfully completed the subject', 0, 215, { align: 'center' });

  // Subject name
  doc
    .fillColor('#1e40af')
    .font('Helvetica-Bold')
    .fontSize(20)
    .text(`${subjectName}${subjectCode ? ' (' + subjectCode + ')' : ''}`, 0, 234, { align: 'center' });

  // Grade level + grade (if present)
  const detailParts = [];
  if (gradeLevel) detailParts.push(gradeLevel);
  if (grade)      detailParts.push(`Grade: ${grade}`);
  if (detailParts.length) {
    doc
      .fillColor('#64748b')
      .font('Helvetica')
      .fontSize(11)
      .text(detailParts.join('  ·  '), 0, 262, { align: 'center' });
  }

  if (completedOn) {
    doc
      .fillColor('#475569')
      .font('Helvetica')
      .fontSize(11)
      .text(`Completed on ${completedOn}`, 0, 285, { align: 'center' });
  }

  // Certificate ID footer
  doc
    .fillColor('#94a3b8')
    .font('Helvetica')
    .fontSize(9)
    .text(`Certificate ID: ${certId}`, PAD + 20, H - PAD - 30);

  // QR code (if available)
  if (cert.qrCode) {
    try {
      // qrCode is a data URL: data:image/png;base64,...
      const base64Data = cert.qrCode.replace(/^data:image\/\w+;base64,/, '');
      const qrBuffer   = Buffer.from(base64Data, 'base64');
      const qrSize     = 70;
      doc.image(qrBuffer, W - PAD - qrSize - 20, H - PAD - qrSize - 16, {
        width:  qrSize,
        height: qrSize,
      });
    } catch {
      // QR render failed — skip silently, cert still valid
    }
  }

  // Signature line
  doc
    .moveTo(W / 2 - 70, H - PAD - 45)
    .lineTo(W / 2 + 70, H - PAD - 45)
    .strokeColor('#94a3b8').lineWidth(1).stroke();

  doc
    .fillColor('#64748b')
    .font('Helvetica')
    .fontSize(9)
    .text('Authorised Signature', 0, H - PAD - 38, { align: 'center' });

  doc.end();
};
