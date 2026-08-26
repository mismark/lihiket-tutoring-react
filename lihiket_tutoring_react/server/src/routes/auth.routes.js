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
} = require('../controllers/auth.controller');
const { protect }         = require('../middleware/auth.middleware');
const { requireVerified } = require('../middleware/verified.middleware');
const { uploadCV }        = require('../middleware/upload.middleware');

// Public auth endpoints
router.post('/register', uploadCV, register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/set-new-password', setNewPassword);

// Protected auth endpoints
router.get('/me',              protect, requireVerified, getMe);
router.put('/profile',         protect, requireVerified, updateProfile);
router.put('/change-password', protect, requireVerified, changePassword);

module.exports = router;
