const express    = require('express');
const router     = express.Router();
const { protect }   = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  getStats,
  getActivity,
  getRevenue,
  getEnrollmentStats,
  issueCertificate,
} = require('../controllers/admin.controller');

// All admin routes require a valid JWT + admin role
router.use(protect, authorize('admin'));

// ── Dashboard stats ───────────────────────────────────────────────────────────
router.get('/stats',            getStats);
router.get('/activity',         getActivity);
router.get('/revenue',          getRevenue);
router.get('/enrollment-stats', getEnrollmentStats);

// ── Certificate management (admin-issued) ─────────────────────────────────────
router.post('/certificates', issueCertificate);

module.exports = router;
