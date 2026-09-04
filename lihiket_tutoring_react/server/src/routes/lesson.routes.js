const express = require('express');
const router  = express.Router();
const {
  getLessonsByCourse,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
} = require('../controllers/lesson.controller');
const { protect }          = require('../middleware/auth.middleware');
const { requireVerified }  = require('../middleware/verified.middleware');
const { authorize }        = require('../middleware/role.middleware');
const { uploadLessonCloud } = require('../middleware/upload.middleware');

// ── Routes ────────────────────────────────────────────────────────────────────
const auth  = [protect, requireVerified];
const all   = [...auth, authorize('admin', 'teacher', 'student')];
const staff = [...auth, authorize('admin', 'teacher')];

router.get('/course/:courseId', all,   getLessonsByCourse);
router.get('/:id',              all,   getLesson);
router.post('/',                staff, ...uploadLessonCloud, createLesson);
router.put('/:id',              staff, ...uploadLessonCloud, updateLesson);
router.delete('/:id',           staff, deleteLesson);

module.exports = router;
