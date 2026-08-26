const Subject    = require('../models/Subject');
const Document   = require('../models/Document');
const Assignment = require('../models/Assignment');
const Quiz       = require('../models/Quiz');
const Exam       = require('../models/Exam');
const LiveClass  = require('../models/LiveClass');
const Course     = require('../models/Course');
const Lesson     = require('../models/Lesson');

// ── GET /api/search?q=...&type=... ────────────────────────────────────────────
exports.search = async (req, res, next) => {
  try {
    const { q, type } = req.query;
    if (!q || q.trim().length < 2)
      return res.json({ success: true, data: {}, total: 0 });

    const re       = { $regex: q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    const isStudent = req.userRole === 'student';
    const results  = {};

    const run = async (key, model, filter, select, populate) => {
      if (type && type !== key) return;
      try {
        let query = model.find(filter).select(select).limit(10);
        if (populate) query = query.populate(...populate);
        results[key] = await query;
      } catch { results[key] = []; }
    };

    const KEYS = ['subjects','courses','lessons','liveClasses','documents','assignments','quizzes','exams'];

    const tasks = [
      run('subjects', Subject,
        { $or: [{ name: re }, { code: re }, { description: re }], isActive: true },
        'name code gradeLevel category description isActive price', null),

      run('courses', Course,
        { $or: [{ title: re }, { description: re }], isPublished: true },
        'title description isPublished',
        ['subject', 'name code gradeLevel']),

      run('lessons', Lesson,
        { $or: [{ title: re }, { content: re }], isPublished: true },
        'title type duration course subject',
        ['course', 'title subject']),

      run('documents', Document,
        { $or: [{ title: re }, { description: re }, { tags: re }],
          ...(isStudent ? { isPublished: true } : {}) },
        'title description category gradeLevel fileName allowDownload',
        ['subject', 'name code']),

      run('assignments', Assignment,
        { $or: [{ title: re }, { description: re }],
          ...(isStudent ? { status: { $in: ['published','closed'] } } : {}) },
        'title description status dueDate totalMarks gradeLevel',
        ['subject', 'name code']),

      run('quizzes', Quiz,
        { $or: [{ title: re }, { description: re }],
          ...(isStudent ? { status: 'published' } : {}) },
        'title description status duration totalMarks gradeLevel allowRetake',
        ['subject', 'name code']),

      run('exams', Exam,
        { $or: [{ title: re }, { description: re }],
          ...(isStudent ? { status: 'published' } : {}) },
        'title description status duration totalMarks gradeLevel',
        ['subject', 'name code']),

      run('liveClasses', LiveClass,
        { $or: [{ title: re }, { description: re }, { notes: re }],
          ...(isStudent ? { status: { $in: ['scheduled','live','ended'] } } : {}) },
        'title description status platform scheduledAt duration meetingLink recordingUrl',
        ['subject', 'name code']),
    ];

    await Promise.allSettled(tasks);

    const total = Object.values(results).reduce((s, arr) => s + arr.length, 0);

    res.json({ success: true, query: q.trim(), total, data: results });
  } catch (err) { next(err); }
};
