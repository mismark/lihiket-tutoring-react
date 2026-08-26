const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

/**
 * Generate a PDF certificate with embedded QR code.
 *
 * @param {Object} opts
 * @param {string} opts.studentName
 * @param {string} opts.courseName
 * @param {string} opts.teacherName
 * @param {string} opts.issuedAt       - ISO date string
 * @param {string} opts.certificateId  - MongoDB ObjectId string
 * @param {string} opts.outputPath     - Absolute file path to write the PDF
 * @param {string} opts.verifyUrl      - Public URL for QR scan
 * @returns {Promise<string>} outputPath
 */
const generateCertificate = async ({
  studentName,
  courseName,
  teacherName,
  issuedAt,
  certificateId,
  outputPath,
  verifyUrl,
}) => {
  const qrDataUrl = await QRCode.toDataURL(verifyUrl);
  const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 60 });
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);

    // Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f9f6ef');

    // Border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .lineWidth(4)
      .stroke('#c8a96e');

    // Title
    doc.fillColor('#1a1a2e').fontSize(40).font('Helvetica-Bold')
      .text('Certificate of Completion', { align: 'center' });

    doc.moveDown(0.5);
    doc.fontSize(16).font('Helvetica').fillColor('#555')
      .text('This certifies that', { align: 'center' });

    // Student name
    doc.moveDown(0.4);
    doc.fontSize(32).font('Helvetica-BoldOblique').fillColor('#c8a96e')
      .text(studentName, { align: 'center' });

    doc.moveDown(0.4);
    doc.fontSize(16).font('Helvetica').fillColor('#555')
      .text(`has successfully completed the course`, { align: 'center' });

    // Course name
    doc.moveDown(0.3);
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#1a1a2e')
      .text(courseName, { align: 'center' });

    doc.moveDown(0.3);
    doc.fontSize(14).font('Helvetica').fillColor('#555')
      .text(`Issued on ${new Date(issuedAt).toLocaleDateString('en-GB')}   |   Instructor: ${teacherName}`, {
        align: 'center',
      });

    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#aaa')
      .text(`Certificate ID: ${certificateId}`, { align: 'center' });

    // QR code (bottom-right)
    doc.image(qrBuffer, doc.page.width - 130, doc.page.height - 130, { width: 90 });

    doc.end();
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
};

module.exports = generateCertificate;
