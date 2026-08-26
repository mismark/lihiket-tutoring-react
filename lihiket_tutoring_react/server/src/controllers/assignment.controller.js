const Assignment           = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const AppError             = require('../utils/AppError');
const path                 = require('path');
const fs                   = require('fs');

function fileUrl(p) {
  if (!p) return null;
  const clean = p.replace(/\\/g, '/');
  const idx   = clean.indexOf('uploads/');
  return idx === -1 ? null : `/${clean.slice(idx)}`;
}

// ── GET /api/assignments ──────────────────────────────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const { subject, status, gradeLevel } = req.query;
    const filter = {};
    if (subject)    filter.subject    = subject;
    if (gradeLevel) filter.gradeLevel = gradeLevel;
    if (status)     filter.status     = status;
    if (req.userRole === 'student') filter.status = { $in: ['published','closed'] };

    const assignments = await Assignment.find(filter)
      .populate('subject', 'name code gradeLevel')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Attach student submission if student
    let mySubmissions = {};
    if (req.userRole === 'student') {
      const subs = await AssignmentSubmission.find({
        student: req.user._id,
        assignment: { $in: assignments.map(a => a._id) }
      });
      subs.forEach(s => { mySubmissions[s.assignment.toString()] = s; });
    }

    const data = assignments.map(a => ({
      ...a.toObject(),
      mySubmission: mySubmissions[a._id.toString()] || null,
    }));

    res.json({ success: true, count: data.length, data });
  } catch (err) { next(err); }
};

// ── GET /api/assignments/:id ──────────────────────────────────────────────────
exports.getOne = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('subject', 'name code gradeLevel')
      .populate('createdBy', 'firstName lastName');
    if (!assignment) return next(new AppError('Assignment not found', 404));

    const mySubmission = req.userRole === 'student'
      ? await AssignmentSubmission.findOne({ assignment: assignment._id, student: req.user._id })
      : null;

    res.json({ success: true, data: { ...assignment.toObject(), mySubmission } });
  } catch (err) { next(err); }
};

// ── POST /api/assignments ─────────────────────────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const { title, description, instructions, subject, gradeLevel, dueDate, totalMarks, allowLate } = req.body;
    if (!title) return next(new AppError('title is required', 400));

    const a = await Assignment.create({
      title, description: description || '', instructions: instructions || '',
      subject: subject || null, gradeLevel: gradeLevel || '',
      dueDate: dueDate || null,
      totalMarks: Number(totalMarks) || 10,
      allowLate: allowLate === 'true' || allowLate === true,
      attachmentUrl:  req.file ? fileUrl(req.file.path) : null,
      attachmentName: req.file ? req.file.originalname  : null,
      status: 'draft',
      createdBy: req.user._id,
      createdByModel: req.userRole === 'admin' ? 'Admin' : 'Teacher',
    });
    await a.populate('subject', 'name code');
    res.status(201).json({ success: true, data: a });
  } catch (err) { next(err); }
};

// ── PUT /api/assignments/:id ──────────────────────────────────────────────────
exports.update = async (req, res, next) => {
  try {
    const a = await Assignment.findById(req.params.id);
    if (!a) return next(new AppError('Assignment not found', 404));
    if (req.userRole === 'teacher' && a.createdBy.toString() !== req.user._id.toString())
      return next(new AppError('You can only edit your own assignments', 403));

    const ALLOWED = ['title','description','instructions','subject','gradeLevel',
                     'dueDate','totalMarks','allowLate','status'];
    ALLOWED.forEach(f => { if (req.body[f] !== undefined) a[f] = req.body[f]; });
    if (typeof req.body.allowLate !== 'undefined') a.allowLate = req.body.allowLate === 'true' || req.body.allowLate === true;

    if (req.file) {
      a.attachmentUrl  = fileUrl(req.file.path);
      a.attachmentName = req.file.originalname;
    }
    await a.save();
    res.json({ success: true, data: a });
  } catch (err) { next(err); }
};

// ── DELETE /api/assignments/:id ───────────────────────────────────────────────
exports.remove = async (req, res, next) => {
  try {
    const a = await Assignment.findById(req.params.id);
    if (!a) return next(new AppError('Assignment not found', 404));
    if (req.userRole === 'teacher' && a.createdBy.toString() !== req.user._id.toString())
      return next(new AppError('You can only delete your own assignments', 403));
    await AssignmentSubmission.deleteMany({ assignment: a._id });
    if (a.attachmentUrl) {
      const abs = path.join(__dirname, '../../', a.attachmentUrl);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    }
    await Assignment.findByIdAndDelete(a._id);
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (err) { next(err); }
};

// ── POST /api/assignments/:id/submit ─────────────────────────────────────────
exports.submit = async (req, res, next) => {
  try {
    const a = await Assignment.findById(req.params.id);
    if (!a || a.status === 'draft') return next(new AppError('Assignment not available', 404));

    const existing = await AssignmentSubmission.findOne({ assignment: a._id, student: req.user._id });
    if (existing) return next(new AppError('You have already submitted this assignment', 400));

    const late = a.dueDate && new Date() > new Date(a.dueDate);
    if (late && !a.allowLate) return next(new AppError('The deadline has passed and late submissions are not allowed', 403));

    const sub = await AssignmentSubmission.create({
      assignment: a._id, student: req.user._id,
      text:     req.body.text     || '',
      fileUrl:  req.file ? fileUrl(req.file.path) : null,
      fileName: req.file ? req.file.originalname  : null,
      fileSize: req.file ? req.file.size           : 0,
      late, status: 'submitted',
    });
    res.status(201).json({ success: true, data: sub });
  } catch (err) { next(err); }
};

// ── GET /api/assignments/:id/submissions ──────────────────────────────────────
exports.getSubmissions = async (req, res, next) => {
  try {
    const subs = await AssignmentSubmission.find({ assignment: req.params.id })
      .populate('student', 'firstName lastName email gradeLevel profilePicture')
      .sort({ submittedAt: 1 });
    res.json({ success: true, count: subs.length, data: subs });
  } catch (err) { next(err); }
};

// ── PUT /api/assignments/:id/submissions/:studentId/grade ─────────────────────
exports.grade = async (req, res, next) => {
  try {
    const sub = await AssignmentSubmission.findOne({
      assignment: req.params.id, student: req.params.studentId,
    });
    if (!sub) return next(new AppError('Submission not found', 404));
    sub.marks    = Number(req.body.marks);
    sub.feedback = req.body.feedback || '';
    sub.status   = 'graded';
    await sub.save();
    res.json({ success: true, data: sub });
  } catch (err) { next(err); }
};
