const axios      = require('axios');
const crypto     = require('crypto');
const https      = require('https');
const Enrollment = require('../models/Enrollment');
const Subject    = require('../models/Subject');
const AppError   = require('../utils/AppError');
const config     = require('../config/index');

// ── Chapa axios instance ──────────────────────────────────────────────────────
const httpsAgent = new https.Agent({ keepAlive: true, timeout: 20000 });

const chapaApi = axios.create({
  baseURL:    config.chapa.baseUrl,
  timeout:    25000,
  httpsAgent,
  headers: {
    Authorization:  `Bearer ${config.chapa.secretKey}`,
    'Content-Type': 'application/json',
  },
});

// ── helpers ───────────────────────────────────────────────────────────────────
function generateTxRef(studentId, subjectId) {
  const rand = crypto.randomBytes(6).toString('hex');
  return `lihiket-${studentId.toString().slice(-6)}-${subjectId.toString().slice(-6)}-${rand}`;
}

function chapaError(err) {
  // Log for debugging
  if (err.response) {
    console.error('[Chapa Error] Status:', err.response.status, 'Data:', JSON.stringify(err.response.data));
  } else {
    console.error('[Chapa Error] Code:', err.code, 'Message:', err.message);
  }

  // Extract message — could be string or object
  const data = err.response?.data;
  let msg;
  if (typeof data?.message === 'string') msg = data.message;
  else if (typeof data?.message === 'object') msg = JSON.stringify(data.message);
  else if (typeof data === 'string') msg = data;

  if (msg) return msg;
  const c = err.code;
  if (c === 'ECONNRESET' || c === 'ECONNREFUSED')
    return 'Cannot connect to payment gateway. Please check your internet and try again.';
  if (c === 'ETIMEDOUT' || c === 'ECONNABORTED')
    return 'Payment gateway timed out. Please try again.';
  return err.message || 'Payment gateway error. Please try again.';
}

// ── POST /api/payments/initiate ───────────────────────────────────────────────
exports.initiatePayment = async (req, res, next) => {
  try {
    const { subjectId } = req.body;
    if (!subjectId) return next(new AppError('subjectId is required', 400));

    const subject = await Subject.findById(subjectId);
    if (!subject)          return next(new AppError('Subject not found', 404));
    if (!subject.isActive) return next(new AppError('Subject is not active', 400));
    if (!subject.price || subject.price <= 0)
      return next(new AppError('This subject is free — use the regular enroll endpoint', 400));

    const txRef     = generateTxRef(req.user._id, subjectId);
    const returnUrl = `${config.clientUrl}/payment/verify?tx_ref=${txRef}`;

    // Upsert pending enrollment
    await Enrollment.findOneAndUpdate(
      { student: req.user._id, subject: subjectId },
      { status: 'pending_payment', paymentStatus: 'pending', txRef },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const payload = {
      amount:        Number(subject.price).toFixed(2),
      currency:      'ETB',
      email:         req.user.email,
      first_name:    req.user.firstName,
      last_name:     req.user.lastName,
      phone_number:  req.user.phone || '0900000000',
      tx_ref:        txRef,
      callback_url:  config.chapa.callbackUrl,
      return_url:    returnUrl,
      customization: {
        // Chapa: title max 16 chars, description: letters/numbers/hyphens/underscores/spaces/dots only
        title:       subject.name.slice(0, 16),
        description: `${subject.gradeLevel || ''} ${subject.category || ''} Lihiket`
                       .replace(/[^a-zA-Z0-9\-_ .]/g, '')
                       .slice(0, 100)
                       .trim(),
      },
    };

    const chapaRes = await chapaApi.post('/transaction/initialize', payload);
    if (chapaRes.data?.status !== 'success')
      return next(new AppError('Failed to initiate payment with Chapa', 502));

    res.status(200).json({
      success:     true,
      checkoutUrl: chapaRes.data.data.checkout_url,
      txRef,
    });
  } catch (err) {
    next(new AppError(chapaError(err), 502));
  }
};

// ── GET /api/payments/verify?tx_ref=... ──────────────────────────────────────
exports.verifyPayment = async (req, res, next) => {
  try {
    const { tx_ref } = req.query;
    if (!tx_ref) return next(new AppError('tx_ref is required', 400));

    const enrollment = await Enrollment.findOne({ txRef: tx_ref }).populate('subject');
    if (!enrollment) return next(new AppError('Transaction not found', 404));

    // Already verified
    if (enrollment.paymentStatus === 'paid') {
      return res.json({ success: true, message: 'Already enrolled', data: enrollment });
    }

    // Verify with Chapa
    const chapaRes = await chapaApi.get(`/transaction/verify/${tx_ref}`);
    const tx       = chapaRes.data?.data;

    if (!tx || tx.status !== 'success') {
      enrollment.paymentStatus = 'failed';
      await enrollment.save();
      return next(new AppError('Payment was not successful', 402));
    }

    // Activate enrollment
    enrollment.status        = 'active';
    enrollment.paymentStatus = 'paid';
    enrollment.paidAt        = new Date();
    enrollment.amountPaid    = Number(tx.amount);
    enrollment.enrolledAt    = new Date();
    await enrollment.save();
    await enrollment.populate('subject');

    res.json({
      success: true,
      message: `Successfully enrolled in ${enrollment.subject?.name}`,
      data:    enrollment,
    });
  } catch (err) {
    next(new AppError(chapaError(err), 502));
  }
};

// ── POST /api/payments/webhook ────────────────────────────────────────────────
exports.chapaWebhook = async (req, res) => {
  try {
    const { tx_ref, status } = req.body;
    if (!tx_ref || status !== 'success') return res.sendStatus(200);

    const enrollment = await Enrollment.findOne({ txRef: tx_ref });
    if (!enrollment || enrollment.paymentStatus === 'paid') return res.sendStatus(200);

    enrollment.status        = 'active';
    enrollment.paymentStatus = 'paid';
    enrollment.paidAt        = new Date();
    enrollment.enrolledAt    = new Date();
    await enrollment.save();

    res.sendStatus(200);
  } catch {
    res.sendStatus(200); // always 200 to Chapa
  }
};

// ── GET /api/payments/my-payments ────────────────────────────────────────────
exports.getMyPayments = async (req, res, next) => {
  try {
    const payments = await Enrollment.find({
      student:       req.user._id,
      paymentStatus: { $in: ['paid', 'pending', 'failed'] },
    })
      .populate('subject', 'name code gradeLevel price')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: payments.length, data: payments });
  } catch (err) { next(err); }
};

// ── GET /api/payments/all (admin) ─────────────────────────────────────────────
exports.getAllPayments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const filter = { paymentStatus: { $in: ['paid', 'pending', 'failed'] } };
    if (status) filter.paymentStatus = status;

    const payments = await Enrollment.find(filter)
      .populate('student', 'firstName lastName email phone gradeLevel')
      .populate('subject', 'name code gradeLevel price')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Enrollment.countDocuments(filter);
    res.json({ success: true, total, count: payments.length, data: payments });
  } catch (err) { next(err); }
};
