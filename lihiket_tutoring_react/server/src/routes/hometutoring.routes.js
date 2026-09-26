const express = require('express');
const router  = express.Router();
const {
  getPricing,
  updatePricing,
  createRequest,
  getMyRequests,
  getAllRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
} = require('../controllers/hometutoring.controller');
const { protect }         = require('../middleware/auth.middleware');
const { requireVerified } = require('../middleware/verified.middleware');
const { authorize }       = require('../middleware/role.middleware');

// ── Public ────────────────────────────────────────────────────────────────────
// Anyone (guest or logged in) can view the pricing table
router.get('/pricing', getPricing);

// Anyone can submit a booking request.
// We use optional auth: if a valid token is present protect() attaches req.user,
// but we don't block unauthenticated callers.
router.post('/requests', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    // Try to attach user — if token is invalid just skip (don't block)
    return protect(req, res, (err) => {
      if (err) return next(); // bad token → proceed as guest
      requireVerified(req, res, (err2) => {
        if (err2) return next(); // deactivated → proceed as guest anyway
        next();
      });
    });
  }
  next();
}, createRequest);

// ── Authenticated student ─────────────────────────────────────────────────────
router.get(
  '/my-requests',
  protect, requireVerified, authorize('student'),
  getMyRequests
);

// ── Admin only ────────────────────────────────────────────────────────────────
router.put(
  '/pricing',
  protect, requireVerified, authorize('admin'),
  updatePricing
);

router.get(
  '/requests',
  protect, requireVerified, authorize('admin'),
  getAllRequests
);

router.get(
  '/requests/:id',
  protect, requireVerified, authorize('admin'),
  getRequestById
);

router.patch(
  '/requests/:id',
  protect, requireVerified, authorize('admin'),
  updateRequest
);

router.delete(
  '/requests/:id',
  protect, requireVerified, authorize('admin'),
  deleteRequest
);

module.exports = router;
