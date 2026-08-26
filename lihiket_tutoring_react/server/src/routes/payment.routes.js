const express = require('express');
const router  = express.Router();
const {
  initiatePayment,
  verifyPayment,
  chapaWebhook,
  getMyPayments,
  getAllPayments,
} = require('../controllers/payment.controller');
const { protect }         = require('../middleware/auth.middleware');
const { requireVerified } = require('../middleware/verified.middleware');
const { authorize }       = require('../middleware/role.middleware');

// Chapa webhook — no auth (server-to-server from Chapa)
router.post('/webhook', chapaWebhook);

// Student routes
router.post('/initiate',    protect, requireVerified, authorize('student'), initiatePayment);
router.get('/verify',       protect, requireVerified, authorize('student'), verifyPayment);
router.get('/my-payments',  protect, requireVerified, authorize('student'), getMyPayments);

// Admin routes
router.get('/all', protect, requireVerified, authorize('admin'), getAllPayments);

module.exports = router;
