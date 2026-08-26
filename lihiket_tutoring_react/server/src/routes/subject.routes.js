const express = require('express');
const router = express.Router();
const {
  getAllSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  assignSubjectToTeacher,
  removeSubjectFromTeacher,
  getSubjectTeachers,
  backfillSlugs,
} = require('../controllers/subject.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireVerified } = require('../middleware/verified.middleware');
const { authorize } = require('../middleware/role.middleware');

// Backfill slugs for existing subjects (admin only, safe to call multiple times)
router.post('/backfill-slugs', protect, requireVerified, authorize('admin'), backfillSlugs);

// Protected routes — all verified users can read subjects
router.get('/', protect, requireVerified, authorize('admin', 'teacher', 'student'), getAllSubjects);
router.get('/:id', protect, requireVerified, authorize('admin', 'teacher', 'student'), getSubject);
router.get('/:id/teachers', protect, requireVerified, authorize('admin'), getSubjectTeachers);

// Admin only routes
router.post('/', protect, requireVerified, authorize('admin'), createSubject);
router.put('/:id', protect, requireVerified, authorize('admin'), updateSubject);
router.delete('/:id', protect, requireVerified, authorize('admin'), deleteSubject);
router.post('/:id/assign', protect, requireVerified, authorize('admin'), assignSubjectToTeacher);
router.delete('/:id/assign/:teacherId', protect, requireVerified, authorize('admin'), removeSubjectFromTeacher);

module.exports = router;
