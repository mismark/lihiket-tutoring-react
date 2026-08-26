const express = require('express');
const router  = express.Router();
const {
  getMyEnrollments,
  enroll,
  unenroll,
  getEnrolledStudentsBySubject,
  removeEnrollmentByAdmin,
} = require('../controllers/enrollment.controller');
const { protect }         = require('../middleware/auth.middleware');
const { requireVerified } = require('../middleware/verified.middleware');
const { authorize }       = require('../middleware/role.middleware');

// ── Student routes ────────────────────────────────────────────────────────────
router.get(   '/',            protect, requireVerified, authorize('student'), getMyEnrollments);
router.post(  '/:subjectId',  protect, requireVerified, authorize('student'), enroll);
router.delete('/:subjectId',  protect, requireVerified, authorize('student'), unenroll);

// ── Admin / Teacher routes ────────────────────────────────────────────────────
router.get(
  '/subject/:subjectId',
  protect, requireVerified, authorize('admin', 'teacher'),
  getEnrolledStudentsBySubject
);

router.delete(
  '/subject/:subjectId/student/:studentId',
  protect, requireVerified, authorize('admin'),
  removeEnrollmentByAdmin
);

module.exports = router;
