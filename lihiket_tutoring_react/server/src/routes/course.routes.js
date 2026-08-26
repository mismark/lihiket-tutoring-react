const express = require('express');
const router  = express.Router();
const {
  getCoursesBySubject,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/course.controller');
const { protect }         = require('../middleware/auth.middleware');
const { requireVerified } = require('../middleware/verified.middleware');
const { authorize }       = require('../middleware/role.middleware');

const auth    = [protect, requireVerified];
const all     = [...auth, authorize('admin', 'teacher', 'student')];
const staff   = [...auth, authorize('admin', 'teacher')];
const adminOnly = [...auth, authorize('admin')];

router.get('/subject/:subjectId', all,   getCoursesBySubject);
router.get('/:id',                all,   getCourse);
router.post('/',                  staff, createCourse);
router.put('/:id',                staff, updateCourse);
router.delete('/:id',             staff, deleteCourse);

module.exports = router;
