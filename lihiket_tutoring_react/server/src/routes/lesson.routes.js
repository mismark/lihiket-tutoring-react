const express = require('express');
const router  = express.Router();
const {
  getLessonsByCourse,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
} = require('../controllers/lesson.controller');
const { protect }         = require('../middleware/auth.middleware');
const { requireVerified } = require('../middleware/verified.middleware');
const { authorize }       = require('../middleware/role.middleware');
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// ── multer for lesson uploads (video + document in one request) ───────────────
const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const isVideo = /\.(mp4|webm|mov|avi)$/i.test(file.originalname);
    const folder  = isVideo ? 'lessons' : 'documents';
    const dir     = path.join(__dirname, '../../uploads', folder);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname)}`);
  },
});

const uploadLesson = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB for videos
}).single('file'); // single field named "file"

const auth  = [protect, requireVerified];
const all   = [...auth, authorize('admin', 'teacher', 'student')];
const staff = [...auth, authorize('admin', 'teacher')];

router.get('/course/:courseId', all,   getLessonsByCourse);
router.get('/:id',              all,   getLesson);
router.post('/',                staff, uploadLesson, createLesson);
router.put('/:id',              staff, uploadLesson, updateLesson);
router.delete('/:id',           staff, deleteLesson);

module.exports = router;
