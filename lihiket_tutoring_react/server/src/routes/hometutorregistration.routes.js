const express = require('express');
const router  = express.Router();
const {
  createRegistration,
  getMyRegistrations,
  getAllRegistrations,
  getRegistrationById,
  updateRegistration,
  deleteRegistration,
} = require('../controllers/hometutorregistration.controller');

const { protect }         = require('../middleware/auth.middleware');
const { requireVerified } = require('../middleware/verified.middleware');
const { authorize }       = require('../middleware/role.middleware');

// Optional auth helper — attach user if token present, else proceed as guest
const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return protect(req, res, (err) => {
      if (err) return next();
      requireVerified(req, res, (err2) => { if (err2) return next(); next(); });
    });
  }
  next();
};

// Public — anyone can register (logged in or guest)
router.post('/', optionalAuth, createRegistration);

// Authenticated student — own registrations
router.get('/my', protect, requireVerified, authorize('student'), getMyRegistrations);

// Admin only
router.get(   '/',    protect, requireVerified, authorize('admin'), getAllRegistrations);
router.get(   '/:id', protect, requireVerified, authorize('admin'), getRegistrationById);
router.patch( '/:id', protect, requireVerified, authorize('admin'), updateRegistration);
router.delete('/:id', protect, requireVerified, authorize('admin'), deleteRegistration);

module.exports = router;
