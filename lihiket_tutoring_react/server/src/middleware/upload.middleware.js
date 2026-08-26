const multer = require('multer');
const path = require('path');
const config = require('../config/index');

const MAX_BYTES = config.upload.maxFileSizeMB * 1024 * 1024;
const AVATAR_MAX = config.upload.avatarMaxMB * 1024 * 1024;

// ─── Storage engines ──────────────────────────────────────────────────────────

const makeStorage = (folder) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.join(__dirname, '../../uploads', folder)),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });

// ─── File filters ─────────────────────────────────────────────────────────────

const imageFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
};

const documentFilter = (_req, file, cb) => {
  const allowed = /pdf|doc|docx|ppt|pptx|xls|xlsx|txt|zip/;
  cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
};

const videoFilter = (_req, file, cb) => {
  const allowed = /mp4|webm|mov|avi/;
  cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
};

// ─── Exportable middleware ────────────────────────────────────────────────────

const uploadAvatar = multer({
  storage: makeStorage('avatars'),
  limits: { fileSize: AVATAR_MAX },
  fileFilter: imageFilter,
}).single('avatar');

const uploadDocument = multer({
  storage: makeStorage('documents'),
  limits: { fileSize: MAX_BYTES },
  fileFilter: documentFilter,
}).single('file');

const uploadLesson = multer({
  storage: makeStorage('lessons'),
  limits: { fileSize: MAX_BYTES },
  fileFilter: videoFilter,
}).single('video');

const uploadCV = multer({
  storage: makeStorage('cvs'),
  limits: { fileSize: MAX_BYTES },
  fileFilter: documentFilter,
}).single('cv');

const uploadAssignment = multer({
  storage: makeStorage('assignments'),
  limits: { fileSize: MAX_BYTES },
  fileFilter: documentFilter,
}).single('file');

module.exports = { uploadAvatar, uploadDocument, uploadLesson, uploadCV, uploadAssignment };
