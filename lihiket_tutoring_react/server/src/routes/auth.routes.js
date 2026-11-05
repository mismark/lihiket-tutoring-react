const express = require('express');
const router  = express.Router();

const {
  register,
  login,
  forgotPassword,
  verifyOTP,
  setNewPassword,
  getMe,
  updateProfile,
  changePassword,
  createFirstAdmin,
} = require('../controllers/auth.controller');
const { protect }         = require('../middleware/auth.middleware');
const { requireVerified } = require('../middleware/verified.middleware');
const { uploadCVCloud, uploadAvatarCloud } = require('../middleware/upload.middleware');

// WebAuthn (passkey / fingerprint login) routes
const webauthnRoutes = require('./webauthn.routes');

// Public auth endpoints
router.post('/register', ...uploadCVCloud, register);
router.post('/login', login);

// ── First-time admin setup ────────────────────────────────────────────────────
router.post('/create-admin', createFirstAdmin);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/set-new-password', setNewPassword);

// WebAuthn routes
router.use('/webauthn', webauthnRoutes);

// Protected auth endpoints
router.get('/me',              protect, requireVerified, getMe);
router.put('/profile',         protect, requireVerified, ...uploadAvatarCloud, updateProfile);
router.put('/change-password', protect, requireVerified, changePassword);

module.exports = router;
