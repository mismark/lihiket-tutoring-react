const express = require('express');
const router  = express.Router();
const {
  getFeed, getPost, createPost, updatePost, deletePost,
  toggleLike, sharePost,
  addComment, deleteComment, toggleCommentLike,
  addReply, deleteReply, toggleReplyLike,
} = require('../controllers/post.controller');

const { protect }          = require('../middleware/auth.middleware');
const { requireVerified }  = require('../middleware/verified.middleware');
const { uploadAvatarCloud, pushToCloudinary } = require('../middleware/upload.middleware');
const multer = require('multer');

// ── Post image upload (images only, max 10 MB, stored in lihiket/posts) ───────
const uploadPostImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /\.(jpeg|jpg|png|gif|webp)$/i.test(file.originalname);
    cb(null, ok);
  },
}).single('image');

const uploadPost = [uploadPostImage, pushToCloudinary('lihiket/posts', 'image')];

const auth = [protect, requireVerified];

// ── Feed ─────────────────────────────────────────────────────────────────────
router.get('/',    ...auth, getFeed);
router.get('/:id', ...auth, getPost);

// ── Post CRUD ─────────────────────────────────────────────────────────────────
router.post('/',    ...auth, ...uploadPost, createPost);
router.put('/:id',  ...auth, ...uploadPost, updatePost);
router.delete('/:id', ...auth, deletePost);

// ── Reactions ─────────────────────────────────────────────────────────────────
router.post('/:id/like',  ...auth, toggleLike);
router.post('/:id/share', ...auth, sharePost);

// ── Comments ──────────────────────────────────────────────────────────────────
router.post('/:id/comments',           ...auth, addComment);
router.delete('/:id/comments/:cid',    ...auth, deleteComment);
router.post('/:id/comments/:cid/like', ...auth, toggleCommentLike);

// ── Replies ───────────────────────────────────────────────────────────────────
router.post('/:id/comments/:cid/replies',            ...auth, addReply);
router.delete('/:id/comments/:cid/replies/:rid',     ...auth, deleteReply);
router.post('/:id/comments/:cid/replies/:rid/like',  ...auth, toggleReplyLike);

module.exports = router;
