const mongoose = require('mongoose');

const USER_MODELS = ['Admin', 'Teacher', 'Student', 'Parent'];

// ── Embedded comment sub-document ─────────────────────────────────────────────
const ReplySchema = new mongoose.Schema({
  author:      { userId: { type: mongoose.Schema.Types.ObjectId, required: true }, userModel: { type: String, enum: USER_MODELS, required: true } },
  authorName:  { type: String, required: true },
  authorPic:   { type: String, default: null },
  authorRole:  { type: String, default: '' },
  text:        { type: String, required: true, trim: true, maxlength: 1000 },
  likes:       [{ type: mongoose.Schema.Types.ObjectId }],   // array of user._id who liked
}, { timestamps: true });

const CommentSchema = new mongoose.Schema({
  author:      { userId: { type: mongoose.Schema.Types.ObjectId, required: true }, userModel: { type: String, enum: USER_MODELS, required: true } },
  authorName:  { type: String, required: true },
  authorPic:   { type: String, default: null },
  authorRole:  { type: String, default: '' },
  text:        { type: String, required: true, trim: true, maxlength: 2000 },
  likes:       [{ type: mongoose.Schema.Types.ObjectId }],
  replies:     [ReplySchema],
}, { timestamps: true });

// ── Main post document ─────────────────────────────────────────────────────────
const PostSchema = new mongoose.Schema(
  {
    // ── Author ─────────────────────────────────────────────────────────────────
    author: {
      userId:    { type: mongoose.Schema.Types.ObjectId, required: true },
      userModel: { type: String, enum: USER_MODELS, required: true },
    },
    // Denormalised author snapshot (so feeds don't need extra lookups)
    authorName:  { type: String, required: true },
    authorPic:   { type: String, default: null },
    authorRole:  { type: String, default: '' },   // 'student' | 'teacher' | 'admin' | 'parent'

    // ── Content ────────────────────────────────────────────────────────────────
    text:     { type: String, default: '', trim: true, maxlength: 5000 },
    imageUrl: { type: String, default: null },    // Cloudinary URL

    // ── Engagement ────────────────────────────────────────────────────────────
    // likes: array of { userId, userModel } so we can show who liked
    likes: [{
      userId:    { type: mongoose.Schema.Types.ObjectId, required: true },
      userModel: { type: String, enum: USER_MODELS, required: true },
    }],

    comments: [CommentSchema],

    // Share count (just incremented, not storing who shared)
    shareCount: { type: Number, default: 0 },

    // ── Soft delete ───────────────────────────────────────────────────────────
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, collection: 'posts' }
);

// Fast feed queries
PostSchema.index({ createdAt: -1 });
PostSchema.index({ 'author.userId': 1, createdAt: -1 });

module.exports = mongoose.model('Post', PostSchema);
