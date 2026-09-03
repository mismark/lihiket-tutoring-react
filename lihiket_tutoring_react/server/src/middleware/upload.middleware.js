const multer = require('multer');
const path   = require('path');
const config = require('../config/index');
const { uploadToCloudinary } = require('../config/cloudinary');

const MAX_BYTES  = config.upload.maxFileSizeMB * 1024 * 1024;
const AVATAR_MAX = config.upload.avatarMaxMB   * 1024 * 1024;

// ─── Always use memory storage — files go to Cloudinary, not disk ─────────────
const memStorage = multer.memoryStorage();

// ─── File filters ─────────────────────────────────────────────────────────────
const imageFilter = (_req, file, cb) => {
  cb(null, /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase()));
};
const documentFilter = (_req, file, cb) => {
  cb(null, /pdf|doc|docx|ppt|pptx|xls|xlsx|txt|zip/.test(path.extname(file.originalname).toLowerCase()));
};
const videoFilter = (_req, file, cb) => {
  cb(null, /mp4|webm|mov|avi/.test(path.extname(file.originalname).toLowerCase()));
};
const anyFilter = (_req, _file, cb) => cb(null, true);

// ─── Multer instances (memory storage) ───────────────────────────────────────
const uploadAvatar     = multer({ storage: memStorage, limits: { fileSize: AVATAR_MAX }, fileFilter: imageFilter    }).single('avatar');
const uploadDocument   = multer({ storage: memStorage, limits: { fileSize: MAX_BYTES  }, fileFilter: documentFilter }).single('file');
const uploadLesson     = multer({ storage: memStorage, limits: { fileSize: MAX_BYTES  }, fileFilter: videoFilter    }).single('video');
const uploadCV         = multer({ storage: memStorage, limits: { fileSize: MAX_BYTES  }, fileFilter: documentFilter }).single('cv');
const uploadAssignment = multer({ storage: memStorage, limits: { fileSize: MAX_BYTES  }, fileFilter: anyFilter      }).single('file');

// ─── Cloudinary upload helpers ────────────────────────────────────────────────

/**
 * After multer populates req.file.buffer, push the file to Cloudinary.
 * Attaches req.file.path = the Cloudinary secure URL (keeps controllers unchanged).
 */
const pushToCloudinary = (folder, resourceType = 'raw') => async (req, res, next) => {
  if (!req.file) return next();
  try {
    const ext    = path.extname(req.file.originalname).replace('.', '').toLowerCase();
    const baseId = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const url = await uploadToCloudinary(req.file.buffer, {
      folder,
      resource_type:   resourceType,
      public_id:       baseId,
      format:          ext || undefined,  // tells Cloudinary the file type
      use_filename:    false,
      unique_filename: false,
    });
    req.file.path = url;
    next();
  } catch (err) {
    console.error('Cloudinary upload error:', err.message);
    return res.status(500).json({ success: false, message: 'File upload failed. Please try again.' });
  }
};

// ─── Combined middleware arrays ───────────────────────────────────────────────
// Usage in routes: router.post('/route', ...uploadCVCloud, handler)

const uploadCVCloud = [
  uploadCV,
  pushToCloudinary('lihiket/cvs', 'raw'),
];

const uploadAvatarCloud = [
  uploadAvatar,
  pushToCloudinary('lihiket/avatars', 'image'),
];

const uploadDocumentCloud = [
  uploadDocument,
  pushToCloudinary('lihiket/documents', 'raw'),
];

const uploadLessonCloud = [
  uploadLesson,
  pushToCloudinary('lihiket/lessons', 'video'),
];

const uploadAssignmentCloud = [
  uploadAssignment,
  pushToCloudinary('lihiket/assignments', 'raw'),
];

module.exports = {
  // Legacy single-middleware exports (kept for backward compat, no Cloudinary)
  uploadAvatar,
  uploadDocument,
  uploadLesson,
  uploadCV,
  uploadAssignment,
  // Cloudinary-backed combined arrays
  uploadCVCloud,
  uploadAvatarCloud,
  uploadDocumentCloud,
  uploadLessonCloud,
  uploadAssignmentCloud,
};
