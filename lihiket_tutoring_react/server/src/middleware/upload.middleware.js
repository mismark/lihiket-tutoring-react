const multer = require('multer');
const path   = require('path');
const config = require('../config/index');
const { uploadToCloudinary } = require('../config/cloudinary');

const MAX_BYTES  = config.upload.maxFileSizeMB * 1024 * 1024;
const AVATAR_MAX = config.upload.avatarMaxMB   * 1024 * 1024;

// ─── Always memory storage — files go straight to Cloudinary ─────────────────
const mem = multer.memoryStorage();

// ─── File type detection ──────────────────────────────────────────────────────
const EXT = {
  image:    /\.(jpeg|jpg|png|gif|webp|svg)$/i,
  video:    /\.(mp4|webm|mov|avi|mkv)$/i,
  document: /\.(pdf|doc|docx|ppt|pptx|xls|xlsx|txt|csv|zip|rar)$/i,
  any:      /.+/,
};

/**
 * Determine the correct Cloudinary resource_type for a file.
 * - image files  → 'image'
 * - video files  → 'video'
 * - everything else (PDF, doc, etc.) → 'raw'
 */
function getResourceType(filename) {
  if (EXT.image.test(filename))  return 'image';
  if (EXT.video.test(filename))  return 'video';
  return 'raw';
}

// ─── Multer instances ─────────────────────────────────────────────────────────
const uploadAvatar     = multer({ storage: mem, limits: { fileSize: AVATAR_MAX }, fileFilter: (_r, f, cb) => cb(null, EXT.image.test(f.originalname))    }).single('avatar');
const uploadDocument   = multer({ storage: mem, limits: { fileSize: MAX_BYTES  }, fileFilter: (_r, f, cb) => cb(null, EXT.document.test(f.originalname)) }).single('file');
const uploadVideo      = multer({ storage: mem, limits: { fileSize: MAX_BYTES  }, fileFilter: (_r, f, cb) => cb(null, EXT.video.test(f.originalname))    }).single('video');
const uploadLesson     = multer({ storage: mem, limits: { fileSize: 1000 * 1024 * 1024 }, fileFilter: (_r, f, cb) => cb(null, EXT.any.test(f.originalname))      }).single('file');
const uploadCV         = multer({ storage: mem, limits: { fileSize: MAX_BYTES  }, fileFilter: (_r, f, cb) => cb(null, EXT.document.test(f.originalname)) }).single('cv');
const uploadAssignment = multer({ storage: mem, limits: { fileSize: MAX_BYTES  }, fileFilter: (_r, f, cb) => cb(null, EXT.any.test(f.originalname))      }).single('file');

// ─── Cloudinary push middleware ───────────────────────────────────────────────
/**
 * After multer puts the file in req.file.buffer, this middleware uploads it
 * to Cloudinary and sets req.file.path = the Cloudinary secure URL.
 *
 * @param {string} folder       - Cloudinary folder (e.g. 'lihiket/documents')
 * @param {string} resourceType - 'auto' | 'image' | 'video' | 'raw' | 'detect'
 *                                Use 'detect' to auto-pick from file extension.
 */
const pushToCloudinary = (folder, resourceType = 'detect') => async (req, res, next) => {
  if (!req.file) return next(); // no file → skip

  try {
    const ext      = path.extname(req.file.originalname).replace('.', '').toLowerCase();
    const resType  = resourceType === 'detect'
      ? getResourceType(req.file.originalname)
      : resourceType;

    const publicId = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;

    const url = await uploadToCloudinary(req.file.buffer, {
      folder,
      resource_type:   resType,
      public_id:       publicId,
      // Add format only for raw (so URL includes extension like .pdf)
      // Image/video resource types handle format automatically
      ...(resType === 'raw' && ext ? { format: ext } : {}),
      use_filename:    false,
      unique_filename: false,
    });

    req.file.path = url;
    console.log(`✅ Uploaded to Cloudinary [${resType}]: ${url}`);
    next();
  } catch (err) {
    console.error('❌ Cloudinary upload error:', err.message);
    return res.status(500).json({ success: false, message: 'File upload failed. Please try again.' });
  }
};

// ─── Ready-to-use combined middleware arrays ──────────────────────────────────
// Each array: [multer middleware, cloudinary push middleware]
// Usage in routes: router.post('/route', ...uploadCVCloud, handler)

/** CV upload — PDFs and docs → stored in lihiket/cvs */
const uploadCVCloud = [
  uploadCV,
  pushToCloudinary('lihiket/cvs', 'detect'),
];

/** Avatar upload — images only → stored in lihiket/avatars */
const uploadAvatarCloud = [
  uploadAvatar,
  pushToCloudinary('lihiket/avatars', 'image'),
];

/** Document upload — PDFs, Word, Excel, PPT → stored in lihiket/documents */
const uploadDocumentCloud = [
  uploadDocument,
  pushToCloudinary('lihiket/documents', 'detect'),
];

/** Lesson upload — videos AND documents → stored in lihiket/lessons or lihiket/documents */
const uploadLessonCloud = [
  uploadLesson,
  pushToCloudinary('lihiket/lessons', 'detect'),
];

/** Assignment upload — any file type → stored in lihiket/assignments */
const uploadAssignmentCloud = [
  uploadAssignment,
  pushToCloudinary('lihiket/assignments', 'detect'),
];

module.exports = {
  // Individual multer instances (no Cloudinary — for custom use)
  uploadAvatar,
  uploadDocument,
  uploadVideo,
  uploadLesson,
  uploadCV,
  uploadAssignment,

  // Cloudinary-backed combined arrays (multer + upload)
  uploadCVCloud,
  uploadAvatarCloud,
  uploadDocumentCloud,
  uploadLessonCloud,
  uploadAssignmentCloud,

  // Helper for custom upload scenarios
  pushToCloudinary,
};
