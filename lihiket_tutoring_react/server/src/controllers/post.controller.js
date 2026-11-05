/**
 * Post / Social Feed Controller
 *
 * GET    /api/posts              — paginated public feed
 * POST   /api/posts              — create post (image optional)
 * GET    /api/posts/:id          — single post
 * PUT    /api/posts/:id          — edit own post
 * DELETE /api/posts/:id          — soft-delete own post (admin can delete any)
 * POST   /api/posts/:id/like     — toggle like on post
 * POST   /api/posts/:id/share    — increment share count
 *
 * POST   /api/posts/:id/comments           — add comment
 * DELETE /api/posts/:id/comments/:cid      — delete comment
 * POST   /api/posts/:id/comments/:cid/like — toggle like on comment
 *
 * POST   /api/posts/:id/comments/:cid/replies           — add reply
 * DELETE /api/posts/:id/comments/:cid/replies/:rid      — delete reply
 * POST   /api/posts/:id/comments/:cid/replies/:rid/like — toggle like on reply
 */

const Post     = require('../models/Post');
const AppError = require('../utils/AppError');

// ── helpers ───────────────────────────────────────────────────────────────────
function authorSnap(req) {
  const u = req.user;
  return {
    author: { userId: u._id, userModel: cap(req.userRole) },
    authorName: `${u.firstName} ${u.lastName}`.trim(),
    authorPic:  u.profilePicture || null,
    authorRole: req.userRole || '',
  };
}
function cap(s) {
  if (!s) return 'Student';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function isOwner(req, post) {
  return post.author.userId.toString() === req.user._id.toString();
}

// ── GET /api/posts ─────────────────────────────────────────────────────────────
exports.getFeed = async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(30, parseInt(req.query.limit) || 15);
  const skip  = (page - 1) * limit;

  const filter = { isDeleted: false };
  // Optional: filter by author
  if (req.query.authorId) filter['author.userId'] = req.query.authorId;

  const [posts, total] = await Promise.all([
    Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Post.countDocuments(filter),
  ]);

  res.json({
    success: true,
    page,
    pages: Math.ceil(total / limit),
    total,
    data: posts,
  });
};

// ── GET /api/posts/:id ────────────────────────────────────────────────────────
exports.getPost = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.isDeleted) return next(new AppError('Post not found', 404));
  res.json({ success: true, data: post });
};

// ── POST /api/posts ───────────────────────────────────────────────────────────
exports.createPost = async (req, res, next) => {
  const { text } = req.body;
  const imageUrl = req.file?.path || null;   // Cloudinary URL from upload middleware

  if (!text?.trim() && !imageUrl) {
    return next(new AppError('Post must have text or an image', 400));
  }

  const post = await Post.create({
    ...authorSnap(req),
    text:     text?.trim() || '',
    imageUrl,
  });

  res.status(201).json({ success: true, data: post });
};

// ── PUT /api/posts/:id ────────────────────────────────────────────────────────
exports.updatePost = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.isDeleted) return next(new AppError('Post not found', 404));
  if (!isOwner(req, post) && req.userRole !== 'admin')
    return next(new AppError('Not authorised to edit this post', 403));

  if (req.body.text !== undefined) post.text = req.body.text.trim();
  if (req.file?.path) post.imageUrl = req.file.path;
  await post.save();

  res.json({ success: true, data: post });
};

// ── DELETE /api/posts/:id ─────────────────────────────────────────────────────
exports.deletePost = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.isDeleted) return next(new AppError('Post not found', 404));
  if (!isOwner(req, post) && req.userRole !== 'admin')
    return next(new AppError('Not authorised to delete this post', 403));

  post.isDeleted = true;
  await post.save();
  res.json({ success: true, message: 'Post deleted.' });
};

// ── POST /api/posts/:id/like ──────────────────────────────────────────────────
exports.toggleLike = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.isDeleted) return next(new AppError('Post not found', 404));

  const uid   = req.user._id.toString();
  const idx   = post.likes.findIndex(l => l.userId.toString() === uid);
  let liked;

  if (idx === -1) {
    post.likes.push({ userId: req.user._id, userModel: cap(req.userRole) });
    liked = true;
  } else {
    post.likes.splice(idx, 1);
    liked = false;
  }
  await post.save();
  res.json({ success: true, liked, likeCount: post.likes.length });
};

// ── POST /api/posts/:id/share ─────────────────────────────────────────────────
exports.sharePost = async (req, res, next) => {
  const post = await Post.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { $inc: { shareCount: 1 } },
    { new: true }
  );
  if (!post) return next(new AppError('Post not found', 404));
  res.json({ success: true, shareCount: post.shareCount });
};

// ── POST /api/posts/:id/comments ─────────────────────────────────────────────
exports.addComment = async (req, res, next) => {
  const { text } = req.body;
  if (!text?.trim()) return next(new AppError('Comment text is required', 400));

  const post = await Post.findById(req.params.id);
  if (!post || post.isDeleted) return next(new AppError('Post not found', 404));

  const u = req.user;
  post.comments.push({
    author:     { userId: u._id, userModel: cap(req.userRole) },
    authorName: `${u.firstName} ${u.lastName}`.trim(),
    authorPic:  u.profilePicture || null,
    authorRole: req.userRole || '',
    text:       text.trim(),
  });
  await post.save();

  res.status(201).json({ success: true, data: post.comments[post.comments.length - 1] });
};

// ── DELETE /api/posts/:id/comments/:cid ──────────────────────────────────────
exports.deleteComment = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.isDeleted) return next(new AppError('Post not found', 404));

  const comment = post.comments.id(req.params.cid);
  if (!comment) return next(new AppError('Comment not found', 404));

  const isCommentOwner = comment.author.userId.toString() === req.user._id.toString();
  if (!isCommentOwner && !isOwner(req, post) && req.userRole !== 'admin')
    return next(new AppError('Not authorised', 403));

  comment.deleteOne();
  await post.save();
  res.json({ success: true, message: 'Comment deleted.' });
};

// ── POST /api/posts/:id/comments/:cid/like ────────────────────────────────────
exports.toggleCommentLike = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.isDeleted) return next(new AppError('Post not found', 404));

  const comment = post.comments.id(req.params.cid);
  if (!comment) return next(new AppError('Comment not found', 404));

  const uid = req.user._id.toString();
  const idx = comment.likes.findIndex(id => id.toString() === uid);
  let liked;
  if (idx === -1) { comment.likes.push(req.user._id); liked = true; }
  else            { comment.likes.splice(idx, 1);     liked = false; }

  await post.save();
  res.json({ success: true, liked, likeCount: comment.likes.length });
};

// ── POST /api/posts/:id/comments/:cid/replies ────────────────────────────────
exports.addReply = async (req, res, next) => {
  const { text } = req.body;
  if (!text?.trim()) return next(new AppError('Reply text is required', 400));

  const post = await Post.findById(req.params.id);
  if (!post || post.isDeleted) return next(new AppError('Post not found', 404));

  const comment = post.comments.id(req.params.cid);
  if (!comment) return next(new AppError('Comment not found', 404));

  const u = req.user;
  comment.replies.push({
    author:     { userId: u._id, userModel: cap(req.userRole) },
    authorName: `${u.firstName} ${u.lastName}`.trim(),
    authorPic:  u.profilePicture || null,
    authorRole: req.userRole || '',
    text:       text.trim(),
  });
  await post.save();

  res.status(201).json({ success: true, data: comment.replies[comment.replies.length - 1] });
};

// ── DELETE /api/posts/:id/comments/:cid/replies/:rid ─────────────────────────
exports.deleteReply = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.isDeleted) return next(new AppError('Post not found', 404));

  const comment = post.comments.id(req.params.cid);
  if (!comment) return next(new AppError('Comment not found', 404));

  const reply = comment.replies.id(req.params.rid);
  if (!reply) return next(new AppError('Reply not found', 404));

  const isReplyOwner = reply.author.userId.toString() === req.user._id.toString();
  if (!isReplyOwner && req.userRole !== 'admin')
    return next(new AppError('Not authorised', 403));

  reply.deleteOne();
  await post.save();
  res.json({ success: true, message: 'Reply deleted.' });
};

// ── POST /api/posts/:id/comments/:cid/replies/:rid/like ───────────────────────
exports.toggleReplyLike = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.isDeleted) return next(new AppError('Post not found', 404));

  const comment = post.comments.id(req.params.cid);
  if (!comment) return next(new AppError('Comment not found', 404));

  const reply = comment.replies.id(req.params.rid);
  if (!reply) return next(new AppError('Reply not found', 404));

  const uid = req.user._id.toString();
  const idx = reply.likes.findIndex(id => id.toString() === uid);
  let liked;
  if (idx === -1) { reply.likes.push(req.user._id); liked = true; }
  else            { reply.likes.splice(idx, 1);     liked = false; }

  await post.save();
  res.json({ success: true, liked, likeCount: reply.likes.length });
};
