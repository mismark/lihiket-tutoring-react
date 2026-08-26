const Question = require('../models/Question');
const Teacher  = require('../models/Teacher');
const AppError = require('../utils/AppError');

// ── helper: get the subject IDs a teacher is assigned to ─────────────────────
async function getTeacherSubjectIds(teacherId) {
  const teacher = await Teacher.findById(teacherId).select('assignedSubjects');
  return teacher?.assignedSubjects?.map(id => id.toString()) || [];
}

// ── GET /api/question-bank ────────────────────────────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const {
      subject, gradeLevel, difficulty, type,
      search, tags, page = 1, limit = 20,
    } = req.query;

    const filter = { isActive: true };

    // Teachers only see questions for their assigned subjects
    if (req.userRole === 'teacher') {
      const assignedIds = await getTeacherSubjectIds(req.user._id);
      if (assignedIds.length === 0) {
        return res.json({ success: true, total: 0, page: 1, pages: 0, count: 0, data: [] });
      }
      // If a subject filter is applied, verify it is one of their assigned subjects
      if (subject) {
        if (!assignedIds.includes(subject)) {
          return next(new AppError('You are not assigned to this subject', 403));
        }
        filter.subject = subject;
      } else {
        filter.subject = { $in: assignedIds };
      }
    } else {
      if (subject) filter.subject = subject;
    }

    if (gradeLevel) filter.gradeLevel = gradeLevel;
    if (difficulty) filter.difficulty = difficulty;
    if (type)       filter.type       = type;
    if (tags)       filter.tags       = { $in: tags.split(',').map(t => t.trim()) };
    if (search) {
      // Partial/fuzzy match across multiple fields using case-insensitive regex
      const re = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
      filter.$or = [
        { text:          re },
        { explanation:   re },
        { correctAnswer: re },
        { tags:          re },
        { gradeLevel:    re },
      ];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Question.countDocuments(filter);

    const questions = await Question.find(filter)
      .populate('subject', 'name code gradeLevel')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page:   Number(page),
      pages:  Math.ceil(total / Number(limit)),
      count:  questions.length,
      data:   questions,
    });
  } catch (err) { next(err); }
};

// ── GET /api/question-bank/:id ────────────────────────────────────────────────
exports.getOne = async (req, res, next) => {
  try {
    const q = await Question.findById(req.params.id)
      .populate('subject', 'name code gradeLevel')
      .populate('createdBy', 'firstName lastName');
    if (!q) return next(new AppError('Question not found', 404));

    // Teacher must be assigned to the question's subject
    if (req.userRole === 'teacher') {
      const assignedIds = await getTeacherSubjectIds(req.user._id);
      if (q.subject && !assignedIds.includes(q.subject._id?.toString())) {
        return next(new AppError('Access denied — not assigned to this subject', 403));
      }
    }

    res.json({ success: true, data: q });
  } catch (err) { next(err); }
};

// ── POST /api/question-bank ───────────────────────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const {
      text, type, options, correctAnswer, explanation,
      subject, gradeLevel, difficulty, tags, marks,
    } = req.body;

    if (!text || !correctAnswer) {
      return next(new AppError('text and correctAnswer are required', 400));
    }

    // Teacher must be assigned to the subject they are creating a question for
    if (req.userRole === 'teacher') {
      if (!subject) {
        return next(new AppError('Teachers must assign a question to one of their subjects', 400));
      }
      const assignedIds = await getTeacherSubjectIds(req.user._id);
      if (!assignedIds.includes(subject)) {
        return next(new AppError('You can only create questions for your assigned subjects', 403));
      }
    }

    const question = await Question.create({
      text:           text.trim(),
      type:           type           || 'multiple_choice',
      options:        options        || [],
      correctAnswer:  correctAnswer.trim(),
      explanation:    explanation?.trim() || '',
      subject:        subject        || null,
      gradeLevel:     gradeLevel     || '',
      difficulty:     difficulty     || 'medium',
      tags:           Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      marks:          Number(marks)  || 1,
      createdBy:      req.user._id,
      createdByModel: 'Teacher',   // only teachers create questions
    });

    await question.populate('subject', 'name code gradeLevel');
    res.status(201).json({ success: true, data: question });
  } catch (err) { next(err); }
};

// ── PUT /api/question-bank/:id ────────────────────────────────────────────────
exports.update = async (req, res, next) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return next(new AppError('Question not found', 404));

    // Teachers can only edit questions they created
    if (q.createdBy.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only edit your own questions', 403));
    }

    // If changing subject, verify teacher is assigned to it
    if (req.body.subject && req.body.subject !== q.subject?.toString()) {
      const assignedIds = await getTeacherSubjectIds(req.user._id);
      if (!assignedIds.includes(req.body.subject)) {
        return next(new AppError('You can only assign questions to your own subjects', 403));
      }
    }

    const ALLOWED = [
      'text','type','options','correctAnswer','explanation',
      'subject','gradeLevel','difficulty','tags','marks','isActive',
    ];
    ALLOWED.forEach(f => {
      if (req.body[f] !== undefined) q[f] = req.body[f];
    });

    if (typeof req.body.tags === 'string') {
      q.tags = req.body.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    await q.save();
    await q.populate('subject', 'name code gradeLevel');
    res.json({ success: true, data: q });
  } catch (err) { next(err); }
};

// ── DELETE /api/question-bank/:id ─────────────────────────────────────────────
exports.remove = async (req, res, next) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return next(new AppError('Question not found', 404));

    // Teachers can only delete questions they created
    if (q.createdBy.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only delete your own questions', 403));
    }

    await Question.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Question deleted' });
  } catch (err) { next(err); }
};
