const express = require('express');
const router  = express.Router();
const {
  initiatePayment,
  verifyPayment,
  chapaWebhook,
  getPaymentMethods,
  getMyPayments,
  getAllPayments,
} = require('../controllers/payment.controller');
const { protect }         = require('../middleware/auth.middleware');
const { requireVerified } = require('../middleware/verified.middleware');
const { authorize }       = require('../middleware/role.middleware');

// ── Chapa webhook — no auth, raw body preserved for HMAC verification ────────
// express.raw() captures the raw buffer so we can verify the HMAC signature.
// The controller also falls back to JSON.stringify(req.body) if rawBody absent.
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    // Store raw body as string for HMAC verification
    if (Buffer.isBuffer(req.body)) {
      req.rawBody = req.body.toString('utf8');
      try { req.body = JSON.parse(req.rawBody); } catch { req.body = {}; }
    }
    next();
  },
  chapaWebhook
);

// ── Public: supported payment methods ────────────────────────────────────────
router.get('/methods', getPaymentMethods);

// ── Student routes ────────────────────────────────────────────────────────────
router.post('/initiate',   protect, requireVerified, authorize('student'), initiatePayment);
router.get('/verify',      protect, requireVerified, authorize('student'), verifyPayment);
router.get('/my-payments', protect, requireVerified, authorize('student'), getMyPayments);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get('/all', protect, requireVerified, authorize('admin'), getAllPayments);

module.exports = router;
