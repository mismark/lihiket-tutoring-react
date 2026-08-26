const Document  = require('../models/Document');
const AppError  = require('../utils/AppError');
const path      = require('path');
const fs        = require('fs');

// ── helpers ───────────────────────────────────────────────────────────────────
function fileUrl(filePath) {
  if (!filePath) return null;
  const p = filePath.replace(/\\/g, '/');
  const idx = p.indexOf('uploads/');
  return idx === -1 ? null : `/${p.slice(idx)}`;
}

// ── GET /api/documents ────────────────────────────────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const { subject, gradeLevel, category, search, page = 1, limit = 20 } = req.query;

    const filter = { isPublished: true };

    // Non-staff only see published; staff see all
    if (req.userRole === 'admin' || req.userRole === 'teacher') {
      delete filter.isPublished;
      if (req.query.isPublished !== undefined) filter.isPublished = req.query.isPublished === 'true';
    }

    if (subject)    filter.subject    = subject;
    if (gradeLevel) filter.gradeLevel = gradeLevel;
    if (category)   filter.category   = category;
    if (search) {
      const re = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
      filter.$or = [{ title: re }, { description: re }, { tags: re }];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Document.countDocuments(filter);

    const docs = await Document.find(filter)
      .populate('subject', 'name code gradeLevel')
      .populate('uploadedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), count: docs.length, data: docs });
  } catch (err) { next(err); }
};

// ── GET /api/documents/:id ────────────────────────────────────────────────────
exports.getOne = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id)
      .populate('subject', 'name code gradeLevel')
      .populate('uploadedBy', 'firstName lastName');
    if (!doc) return next(new AppError('Document not found', 404));
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// ── POST /api/documents ───────────────────────────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('A file is required', 400));
    const { title, description, subject, gradeLevel, category, allowDownload, tags, isPublished } = req.body;
    if (!title) return next(new AppError('title is required', 400));

    const url = fileUrl(req.file.path);

    const doc = await Document.create({
      title:           title.trim(),
      description:     description?.trim() || '',
      fileUrl:         url,
      fileName:        req.file.originalname,
      fileSize:        req.file.size,
      mimeType:        req.file.mimetype,
      subject:         subject || null,
      gradeLevel:      gradeLevel || '',
      category:        category || 'other',
      allowDownload:   allowDownload !== 'false',
      tags:            tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      isPublished:     isPublished !== 'false',
      uploadedBy:      req.user._id,
      uploadedByModel: req.userRole === 'admin' ? 'Admin' : 'Teacher',
    });

    await doc.populate('subject', 'name code gradeLevel');
    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// ── PUT /api/documents/:id ────────────────────────────────────────────────────
exports.update = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return next(new AppError('Document not found', 404));

    if (req.userRole === 'teacher' && doc.uploadedBy.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only edit your own documents', 403));
    }

    const ALLOWED = ['title','description','subject','gradeLevel','category','allowDownload','tags','isPublished'];
    ALLOWED.forEach(f => {
      if (req.body[f] !== undefined) doc[f] = req.body[f];
    });

    if (typeof req.body.tags === 'string') {
      doc.tags = req.body.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    if (typeof req.body.allowDownload === 'string') doc.allowDownload = req.body.allowDownload !== 'false';
    if (typeof req.body.isPublished   === 'string') doc.isPublished   = req.body.isPublished   !== 'false';

    // Replace file if a new one was uploaded
    if (req.file) {
      doc.fileUrl  = fileUrl(req.file.path);
      doc.fileName = req.file.originalname;
      doc.fileSize = req.file.size;
      doc.mimeType = req.file.mimetype;
    }

    await doc.save();
    await doc.populate('subject', 'name code gradeLevel');
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// ── DELETE /api/documents/:id ─────────────────────────────────────────────────
exports.remove = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return next(new AppError('Document not found', 404));

    if (req.userRole === 'teacher' && doc.uploadedBy.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only delete your own documents', 403));
    }

    // Delete physical file
    if (doc.fileUrl) {
      const abs = path.join(__dirname, '../../', doc.fileUrl);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) { next(err); }
};
