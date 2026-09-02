const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const {
  getLessonsByCourse,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
} = require('../controllers/lesson.controller');
const { protect }            = require('../middleware/auth.middleware');
const { requireVerified }    = require('../middleware/verified.middleware');
const { authorize }          = require('../middleware/role.middleware');
const { uploadToCloudinary } = require('../config/cloudinary');

// ── Memory-storage multer — accepts any file (video or document) ──────────────
const uploadLessonFile = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 500 * 1024 * 1024 }, // 500 MB for large videos
}).single('file');

// ── Push to Cloudinary with correct resource_type ────────────────────────────
const pushLessonToCloudinary = async (req, res, next) => {
  if (!req.file) return next();
  try {
    const ext     = req.file.originalname.split('.').pop().toLowerCase();
    const isVideo = ['mp4', 'webm', 'mov', 'avi'].includes(ext);
    const url = await uploadToCloudinary(req.file.buffer, {
      folder:        isVideo ? 'lihiket/lessons' : 'lihiket/documents',
      resource_type: isVideo ? 'video'           : 'raw',
      public_id:     `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    });
    req.file.path = url;
    next();
  } catch (err) {
    console.error('Cloudinary lesson upload error:', err.message);
    return res.status(500).json({ success: false, message: 'File upload failed. Please try again.' });
  }
};

const uploadLessonCloud = [uploadLessonFile, pushLessonToCloudinary];

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
