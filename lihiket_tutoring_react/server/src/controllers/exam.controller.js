const Exam       = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
const Question   = require('../models/Question');
const Enrollment = require('../models/Enrollment');
const Student    = require('../models/Student');
const AppError   = require('../utils/AppError');
const notify     = require('../utils/notify');
const { EVENTS } = require('../constants/events');

// ── GET /api/exams ─────────────────────────────────────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const { subject, status, gradeLevel } = req.query;
    const filter = {};
    if (status)     filter.status     = status;
    if (subject)    filter.subject    = subject;
    if (gradeLevel) filter.gradeLevel = gradeLevel;

    // Students only see published exams
    if (req.userRole === 'student') filter.status = 'published';

    const exams = await Exam.find(filter)
      .populate('subject', 'name code gradeLevel')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Attach student result if student
    let results = {};
    if (req.userRole === 'student') {
      const rs = await ExamResult.find({ student: req.user._id, exam: { $in: exams.map(e => e._id) } });
      rs.forEach(r => { results[r.exam.toString()] = r; });
    }

    const data = exams.map(e => ({
      ...e.toObject(),
      questionCount: e.questions.length,
      questions: undefined, // don't leak questions in list
      myResult: results[e._id.toString()] || null,
    }));

    res.json({ success: true, count: data.length, data });
  } catch (err) { next(err); }
};

// ── GET /api/exams/:id ─────────────────────────────────────────────────────────
exports.getOne = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('subject', 'name code gradeLevel')
      .populate('createdBy', 'firstName lastName')
      .populate('questions.question');

    if (!exam) return next(new AppError('Exam not found', 404));
    if (req.userRole === 'student' && exam.status !== 'published')
      return next(new AppError('This exam is not available', 403));

    const myResult = req.userRole === 'student'
      ? await ExamResult.findOne({ exam: exam._id, student: req.user._id })
      : null;

    res.json({ success: true, data: { ...exam.toObject(), myResult } });
  } catch (err) { next(err); }
};

// ── POST /api/exams ────────────────────────────────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const { title, description, instructions, subject, gradeLevel,
            questionIds, duration, passMarkPercent, startTime, endTime, allowReview } = req.body;
    if (!title) return next(new AppError('title is required', 400));

    let questions = [];
    if (Array.isArray(questionIds) && questionIds.length) {
      const qs = await Question.find({ _id: { $in: questionIds } });
      questions = questionIds.map(id => {
        const q = qs.find(x => x._id.toString() === id);
        return q ? { question: q._id, marks: q.marks || 1 } : null;
      }).filter(Boolean);
    }

    const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
    const pct        = Math.min(100, Math.max(0, Number(passMarkPercent) || 50));
    const passMark   = Math.round((pct / 100) * totalMarks);

    const exam = await Exam.create({
      title, description, instructions,
      subject: subject || null, gradeLevel: gradeLevel || '',
      questions, duration: Number(duration) || 60,
      totalMarks, passMark, passMarkPercent: pct,
      startTime: startTime || null, endTime: endTime || null,
      allowReview: allowReview !== false,
      status: 'draft',
      createdBy: req.user._id,
      createdByModel: req.userRole === 'admin' ? 'Admin' : 'Teacher',
    });

    await exam.populate('subject', 'name code');
    res.status(201).json({ success: true, data: exam });
  } catch (err) { next(err); }
};

// ── PUT /api/exams/:id ─────────────────────────────────────────────────────────
exports.update = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return next(new AppError('Exam not found', 404));
    if (req.userRole === 'teacher' && exam.createdBy.toString() !== req.user._id.toString())
      return next(new AppError('You can only edit your own exams', 403));

    const ALLOWED = ['title','description','instructions','subject','gradeLevel',
                     'duration','passMarkPercent','startTime','endTime','status','allowReview'];
    ALLOWED.forEach(f => { if (req.body[f] !== undefined) exam[f] = req.body[f]; });

    if (Array.isArray(req.body.questionIds)) {
      const qs = await Question.find({ _id: { $in: req.body.questionIds } });
      exam.questions = req.body.questionIds.map(id => {
        const q = qs.find(x => x._id.toString() === id);
        return q ? { question: q._id, marks: q.marks || 1 } : null;
      }).filter(Boolean);
      exam.totalMarks = exam.questions.reduce((s, q) => s + q.marks, 0);
    }
    const pct      = Math.min(100, Math.max(0, Number(exam.passMarkPercent) || 50));
    exam.passMarkPercent = pct;
    exam.passMark        = Math.round((pct / 100) * (exam.totalMarks || 0));

    await exam.save();

    // ── When exam is published, notify enrolled students ──────────────────
    if (req.body.status === 'published') {
      const subjectId = exam.subject;
      if (subjectId) {
        const enrollments = await Enrollment.find({
          subject: subjectId, status: 'active',
        }).select('student');

        const startLabel = exam.startTime
          ? ` Starting: ${new Date(exam.startTime).toLocaleString()}.`
          : '';

        await Promise.all(
          enrollments.map(e =>
            notify({
              userId:    e.student,
              userModel: 'Student',
              type:      EVENTS.NEW_EXAM,
              title:     'New Exam Scheduled',
              message:   `Exam "${exam.title}" is now published. Duration: ${exam.duration} min.${startLabel}`,
              link:      '/exams',
            })
          )
        );
      }

      // Confirm to the creator (teacher)
      if (exam.createdByModel === 'Teacher') {
        await notify({
          userId:    exam.createdBy,
          userModel: 'Teacher',
          type:      EVENTS.EXAM_PUBLISHED,
          title:     'Exam Published',
          message:   `Your exam "${exam.title}" is now live for enrolled students.`,
          link:      '/exams',
        });
      }
    }

    res.json({ success: true, data: exam });
  } catch (err) { next(err); }
};

// ── DELETE /api/exams/:id ──────────────────────────────────────────────────────
exports.remove = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return next(new AppError('Exam not found', 404));
    if (req.userRole === 'teacher' && exam.createdBy.toString() !== req.user._id.toString())
      return next(new AppError('You can only delete your own exams', 403));
    await ExamResult.deleteMany({ exam: exam._id });
    await Exam.findByIdAndDelete(exam._id);
    res.json({ success: true, message: 'Exam deleted' });
  } catch (err) { next(err); }
};

// ── POST /api/exams/:id/submit ─────────────────────────────────────────────────
exports.submit = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('questions.question');
    if (!exam || exam.status !== 'published') return next(new AppError('Exam not available', 404));

    const existing = await ExamResult.findOne({ exam: exam._id, student: req.user._id });
    if (existing) return next(new AppError('You have already submitted this exam', 400));

    const { answers = {}, timeTaken = 0 } = req.body;

    let score = 0;
    const answerList = exam.questions.map(({ question: q, marks }) => {
      const given     = (answers[q._id.toString()] || '').trim();
      const isCorrect = ['multiple_choice','true_false'].includes(q.type)
        ? given.toLowerCase() === q.correctAnswer.toLowerCase()
        : false; // essay/short need manual grading
      if (isCorrect) score += marks;
      return { question: q._id, answer: given, isCorrect, marks: isCorrect ? marks : 0 };
    });

    const result = await ExamResult.create({
      exam: exam._id, student: req.user._id,
      answers: answerList, score, totalMarks: exam.totalMarks,
      passed: score >= exam.passMark, timeTaken,
    });

    // ── Notify the exam creator (teacher) ─────────────────────────────────
    if (exam.createdByModel === 'Teacher') {
      const student = await Student.findById(req.user._id).select('firstName lastName');
      await notify({
        userId:    exam.createdBy,
        userModel: 'Teacher',
        type:      EVENTS.EXAM_SUBMITTED,
        title:     'Exam Submitted',
        message:   `${student?.firstName} ${student?.lastName} submitted "${exam.title}" — scored ${score}/${exam.totalMarks}.`,
        link:      '/exams',
      });
    }

    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
};

// ── GET /api/exams/:id/results ─────────────────────────────────────────────────
exports.getMyResults = async (req, res, next) => {
  try {
    const results = await ExamResult.find({ exam: req.params.id, student: req.user._id })
      .populate('answers.question', 'text correctAnswer explanation type options')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: results.length, data: results });
  } catch (err) { next(err); }
};

exports.getResults = async (req, res, next) => {
  try {
    const results = await ExamResult.find({ exam: req.params.id })
      .populate('student', 'firstName lastName email gradeLevel')
      .sort({ score: -1 });
    res.json({ success: true, count: results.length, data: results });
  } catch (err) { next(err); }
};
