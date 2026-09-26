const express = require('express');
const router  = express.Router();
const {
  getActiveSubjects,
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} = require('../controllers/hometutorsubject.controller');

const { protect }         = require('../middleware/auth.middleware');
const { requireVerified } = require('../middleware/verified.middleware');
const { authorize }       = require('../middleware/role.middleware');

// Helper: try to attach auth without blocking unauthenticated callers
const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return protect(req, res, (err) => {
      if (err) return next(); // invalid token → proceed as guest
      requireVerified(req, res, (err2) => {
        if (err2) return next(); // deactivated → proceed as guest
        next();
      });
    });
  }
  next();
};

// ── Subject routes ────────────────────────────────────────────────────────────

// Admin — full catalogue MUST be before /:id to avoid 'admin' matching as param
router.get(
  '/subjects/admin/all',
  protect, requireVerified, authorize('admin'),
  getAllSubjects
);

// Public — active subjects only
router.get('/subjects',     getActiveSubjects);
router.get('/subjects/:id', getSubjectById);
router.post(
  '/subjects',
  protect, requireVerified, authorize('admin'),
  createSubject
);
router.put(
  '/subjects/:id',
  protect, requireVerified, authorize('admin'),
  updateSubject
);
router.delete(
  '/subjects/:id',
  protect, requireVerified, authorize('admin'),
  deleteSubject
);

// ── Booking routes ────────────────────────────────────────────────────────────

// Public + optional auth — anyone can book
router.post('/bookings', optionalAuth, createBooking);

// Authenticated student
router.get(
  '/bookings/my',
  protect, requireVerified, authorize('student'),
  getMyBookings
);

// Admin
router.get(
  '/bookings',
  protect, requireVerified, authorize('admin'),
  getAllBookings
);
router.get(
  '/bookings/:id',
  protect, requireVerified, authorize('admin'),
  getBookingById
);
router.patch(
  '/bookings/:id',
  protect, requireVerified, authorize('admin'),
  updateBooking
);
router.delete(
  '/bookings/:id',
  protect, requireVerified, authorize('admin'),
  deleteBooking
);

module.exports = router;
