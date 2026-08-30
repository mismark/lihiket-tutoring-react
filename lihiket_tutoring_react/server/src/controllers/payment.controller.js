/**
 * Payment Controller
 *
 * Handles all payment flows through Chapa.
 * Chapa natively supports: Telebirr, CBE Birr, BOA, Dashen Bank,
 * Awash Bank, Abyssinia Bank, M-Pesa, Hello Cash, eBirr, debit/credit cards.
 *
 * Security:
 *  - Webhook HMAC-SHA256 signature verified before any state change
 *  - Payment record created on initiate; updated only after Chapa confirms
 *  - txRef contains entropy so it cannot be guessed
 *  - No sensitive keys exposed to the client
 */

const axios      = require('axios');
const crypto     = require('crypto');
const https      = require('https');
const Enrollment = require('../models/Enrollment');
const Subject    = require('../models/Subject');
const Student    = require('../models/Student');
const Payment    = require('../models/Payment');
const AppError   = require('../utils/AppError');
const config     = require('../config/index');
const notify     = require('../utils/notify');
const { EVENTS } = require('../constants/events');

// ── Chapa API client ──────────────────────────────────────────────────────────
const chapaApi = axios.create({
  baseURL: config.chapa.baseUrl || 'https://api.chapa.co/v1',
  timeout: 25000,
  httpsAgent: new https.Agent({ keepAlive: true, timeout: 20000 }),
  headers: {
    Authorization:  `Bearer ${config.chapa.secretKey}`,
    'Content-Type': 'application/json',
  },
});

// ── Supported Chapa payment methods ──────────────────────────────────────────
// Chapa routes users to these on its hosted checkout page automatically.
// Passing `payment_method` forces a specific channel; omitting it lets
// the customer choose on the Chapa checkout page.
const CHAPA_METHODS = {
  telebirr:       'Telebirr',
  cbebirr:        'CBE Birr',
  boa:            'Bank of Abyssinia (BOA)',
  dashen_bank:    'Dashen Bank',
  awash_bank:     'Awash Bank',
  abyssinia_bank: 'Abyssinia Bank',
  mpesa:          'M-Pesa',
  hello_cash:     'Hello Cash',
  ebirr:          'eBirr',
  card:           'Debit / Credit Card',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateTxRef(studentId, subjectId) {
  // Format: lihiket-<student6>-<subject6>-<8 random hex>
  // Unique, URL-safe, and contains enough entropy to prevent guessing
  const rand = crypto.randomBytes(8).toString('hex');
  return `lihiket-${studentId.toString().slice(-6)}-${subjectId.toString().slice(-6)}-${rand}`;
}

function extractChapaError(err) {
  if (err.response) {
    console.error('[Chapa]', err.response.status, JSON.stringify(err.response.data));
    const d = err.response.data;
    if (typeof d?.message === 'string') return d.message;
    if (typeof d?.message === 'object') return JSON.stringify(d.message);
    if (typeof d === 'string') return d;
  } else {
    console.error('[Chapa Network]', err.code, err.message);
  }
  const code = err.code;
  if (code === 'ECONNRESET' || code === 'ECONNREFUSED')
    return 'Cannot connect to payment gateway. Check your internet and try again.';
  if (code === 'ETIMEDOUT' || code === 'ECONNABORTED')
    return 'Payment gateway timed out. Please try again.';
  return err.message || 'Payment gateway error. Please try again.';
}

/**
 * Verify Chapa webhook HMAC-SHA256 signature.
 * Chapa sends `Chapa-Signature` header = HMAC-SHA256(body, webhookSecret).
 */
function verifyWebhookSignature(rawBody, signatureHeader) {
  const secret = config.chapa.webhookSecret;
  if (!secret) return true; // skip check if not configured (dev mode)
  if (!signatureHeader) return false;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signatureHeader)
    );
  } catch {
    return false;
  }
}

// ── POST /api/payments/initiate ───────────────────────────────────────────────
exports.initiatePayment = async (req, res, next) => {
  try {
    const { subjectId, paymentMethod } = req.body;
    if (!subjectId) return next(new AppError('subjectId is required', 400));

    // Validate payment method if specified
    if (paymentMethod && !CHAPA_METHODS[paymentMethod]) {
      return next(new AppError(
        `Invalid payment method. Supported: ${Object.keys(CHAPA_METHODS).join(', ')}`,
        400
      ));
    }

    const subject = await Subject.findById(subjectId);
    if (!subject)          return next(new AppError('Subject not found', 404));
    if (!subject.isActive) return next(new AppError('Subject is not currently active', 400));
    if (!subject.price || subject.price <= 0)
      return next(new AppError('This subject is free — use the enroll endpoint directly', 400));

    const student = await Student.findById(req.user._id).select('firstName lastName email phone');
    if (!student) return next(new AppError('Student profile not found', 404));

    const txRef     = generateTxRef(req.user._id, subjectId);
    const returnUrl = `${config.clientUrl}/payment/verify?tx_ref=${txRef}`;

    // ── Create / upsert enrollment record (pending) ──
    const enrollment = await Enrollment.findOneAndUpdate(
      { student: req.user._id, subject: subjectId },
      {
        status:        'pending_payment',
        paymentStatus: 'pending',
        txRef,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // ── Create payment record ──
    await Payment.findOneAndUpdate(
      { txRef },
      {
        student:       req.user._id,
        subject:       subjectId,
        enrollment:    enrollment._id,
        txRef,
        amount:        Number(subject.price),
        currency:      'ETB',
        paymentMethod: paymentMethod || null,
        status:        'pending',
        initiatedFrom: req.ip || req.headers['x-forwarded-for'] || null,
      },
      { upsert: true, new: true }
    );

    // ── Build Chapa payload ──
    const payload = {
      amount:       Number(subject.price).toFixed(2),
      currency:     'ETB',
      email:        student.email,
      first_name:   student.firstName,
      last_name:    student.lastName,
      phone_number: student.phone || '0900000000',
      tx_ref:       txRef,
      callback_url: config.chapa.callbackUrl,
      return_url:   returnUrl,
      customization: {
        title:       subject.name.slice(0, 16),
        description: `${subject.gradeLevel || ''} ${subject.name} - Lihiket`
                       .replace(/[^a-zA-Z0-9\-_ .]/g, '')
                       .slice(0, 100)
                       .trim(),
        logo: config.clientUrl ? `${config.clientUrl}/logo.png` : undefined,
      },
    };

    // Optional: force a specific payment channel
    if (paymentMethod) payload.payment_method = paymentMethod;

    const chapaRes = await chapaApi.post('/transaction/initialize', payload);
    if (chapaRes.data?.status !== 'success') {
      return next(new AppError('Chapa could not create payment session', 502));
    }

    res.status(200).json({
      success:        true,
      checkoutUrl:    chapaRes.data.data.checkout_url,
      txRef,
      supportedMethods: CHAPA_METHODS, // send to client for display
    });
  } catch (err) {
    next(new AppError(extractChapaError(err), 502));
  }
};

// ── GET /api/payments/verify?tx_ref=... ──────────────────────────────────────
exports.verifyPayment = async (req, res, next) => {
  try {
    const { tx_ref } = req.query;
    if (!tx_ref) return next(new AppError('tx_ref is required', 400));

    const enrollment = await Enrollment.findOne({ txRef: tx_ref }).populate('subject');
    if (!enrollment) return next(new AppError('Transaction not found', 404));

    // Guard: student can only verify their own payment
    if (enrollment.student.toString() !== req.user._id.toString()) {
      return next(new AppError('Unauthorized', 403));
    }

    // Already verified — idempotent
    if (enrollment.paymentStatus === 'paid') {
      const payment = await Payment.findOne({ txRef: tx_ref });
      return res.json({
        success: true,
        message: `You are already enrolled in ${enrollment.subject?.name}`,
        data:    enrollment,
        payment: payment ? {
          txRef:         payment.txRef,
          amount:        payment.amount,
          currency:      payment.currency,
          paymentMethod: payment.paymentMethod,
          paidAt:        payment.paidAt,
          status:        payment.status,
        } : null,
      });
    }

    // ── Verify with Chapa ──
    const chapaRes = await chapaApi.get(`/transaction/verify/${tx_ref}`);
    const tx       = chapaRes.data?.data;

    if (!tx || tx.status !== 'success') {
      // Mark as failed
      enrollment.paymentStatus = 'failed';
      await enrollment.save();
      await Payment.findOneAndUpdate(
        { txRef: tx_ref },
        { status: 'failed', failedAt: new Date() }
      );
      return next(new AppError('Payment was not successful. Please try again.', 402));
    }

    // ── Activate enrollment ──
    enrollment.status        = 'active';
    enrollment.paymentStatus = 'paid';
    enrollment.paidAt        = new Date();
    enrollment.amountPaid    = Number(tx.amount);
    enrollment.enrolledAt    = new Date();
    await enrollment.save();

    // ── Update Payment record ──
    await Payment.findOneAndUpdate(
      { txRef: tx_ref },
      {
        status:        'paid',
        paidAt:        new Date(),
        chapaRef:      tx.reference || tx.chapa_reference || null,
        paymentMethod: tx.payment_method || tx.type || null,
        amount:        Number(tx.amount),
        _chapaRaw:     tx, // raw stored for audit — never sent to client
      }
    );

    // ── Notify student ──
    await notify({
      userId:    enrollment.student,
      userModel: 'Student',
      type:      EVENTS.PAYMENT_SUCCESS,
      title:     'Payment Confirmed',
      message:   `Your payment for "${enrollment.subject?.name}" was successful. You are now enrolled!`,
      link:      '/subjects',
    });

    const payment = await Payment.findOne({ txRef: tx_ref });

    res.json({
      success: true,
      message: `Payment confirmed! You are now enrolled in ${enrollment.subject?.name}`,
      data:    enrollment,
      payment: {
        txRef:         payment?.txRef,
        chapaRef:      payment?.chapaRef,
        amount:        payment?.amount,
        currency:      payment?.currency,
        paymentMethod: payment?.paymentMethod,
        paidAt:        payment?.paidAt,
        status:        payment?.status,
      },
    });
  } catch (err) {
    next(new AppError(extractChapaError(err), 502));
  }
};

// ── POST /api/payments/webhook ────────────────────────────────────────────────
// Chapa calls this when payment completes (server-to-server — no auth needed).
// MUST return 200 quickly — Chapa retries on failure.
exports.chapaWebhook = async (req, res) => {
  try {
    // ── 1. Verify HMAC signature ──────────────────────────────────────────
    const signature = req.headers['chapa-signature'] ||
                      req.headers['x-chapa-signature'];
    const rawBody   = req.rawBody || JSON.stringify(req.body);

    if (!verifyWebhookSignature(rawBody, signature)) {
      console.warn('[Webhook] Invalid Chapa signature — ignored');
      return res.sendStatus(200); // always 200 to prevent Chapa from retrying
    }

    const { tx_ref, status } = req.body;
    if (!tx_ref) return res.sendStatus(200);

    // ── 2. Only process successful payments ──────────────────────────────
    if (status !== 'success') {
      // Failed / cancelled — update records
      await Promise.all([
        Enrollment.findOneAndUpdate(
          { txRef: tx_ref, paymentStatus: 'pending' },
          { paymentStatus: 'failed', status: 'pending_payment' }
        ),
        Payment.findOneAndUpdate(
          { txRef: tx_ref, status: 'pending' },
          { status: 'failed', failedAt: new Date() }
        ),
      ]);
      return res.sendStatus(200);
    }

    // ── 3. Check if already processed (idempotency) ───────────────────────
    const existing = await Payment.findOne({ txRef: tx_ref });
    if (existing?.status === 'paid') return res.sendStatus(200);

    // ── 4. Activate enrollment ─────────────────────────────────────────────
    const enrollment = await Enrollment.findOneAndUpdate(
      { txRef: tx_ref },
      {
        status:        'active',
        paymentStatus: 'paid',
        paidAt:        new Date(),
        enrolledAt:    new Date(),
        amountPaid:    req.body.amount ? Number(req.body.amount) : undefined,
      },
      { new: true }
    ).populate('subject');

    // ── 5. Update Payment record ───────────────────────────────────────────
    await Payment.findOneAndUpdate(
      { txRef: tx_ref },
      {
        status:        'paid',
        paidAt:        new Date(),
        chapaRef:      req.body.reference || req.body.chapa_reference || null,
        paymentMethod: req.body.payment_method || req.body.type || null,
        amount:        req.body.amount ? Number(req.body.amount) : undefined,
        _chapaRaw:     req.body,
      }
    );

    // ── 6. Notify student ─────────────────────────────────────────────────
    if (enrollment?.student) {
      await notify({
        userId:    enrollment.student,
        userModel: 'Student',
        type:      EVENTS.PAYMENT_SUCCESS,
        title:     'Payment Confirmed',
        message:   `Your payment for "${enrollment.subject?.name}" was successful! You are now enrolled.`,
        link:      '/subjects',
      });
    }

    console.log(`[Webhook] Payment confirmed: ${tx_ref}`);
    res.sendStatus(200);
  } catch (err) {
    console.error('[Webhook] Error:', err.message);
    res.sendStatus(200); // always 200 to prevent infinite retries from Chapa
  }
};

// ── GET /api/payments/methods ─────────────────────────────────────────────────
// Returns the list of supported payment methods for the UI
exports.getPaymentMethods = (req, res) => {
  res.json({
    success: true,
    data: Object.entries(CHAPA_METHODS).map(([value, label]) => ({ value, label })),
  });
};

// ── GET /api/payments/my-payments ────────────────────────────────────────────
exports.getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ student: req.user._id })
      .populate('subject', 'name code gradeLevel price')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: payments.length, data: payments });
  } catch (err) { next(err); }
};

// ── GET /api/payments/all (admin) ─────────────────────────────────────────────
exports.getAllPayments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('student', 'firstName lastName email phone gradeLevel')
        .populate('subject', 'name code gradeLevel price')
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit)),
      Payment.countDocuments(filter),
    ]);

    res.json({ success: true, total, count: payments.length, data: payments });
  } catch (err) { next(err); }
};
