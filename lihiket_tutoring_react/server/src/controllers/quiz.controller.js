const Quiz       = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const Question   = require('../models/Question');
const AppError   = require('../utils/AppError');

exports.getAll = async (req, res, next) => {
  try {
    const { subject, status, gradeLevel } = req.query;
    const filter = {};
    if (subject)    filter.subject    = subject;
    if (gradeLevel) filter.gradeLevel = gradeLevel;
    if (status)     filter.status     = status;
    if (req.userRole === 'student') filter.status = 'published';

    const quizzes = await Quiz.find(filter)
      .populate('subject', 'name code gradeLevel')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    let myResults = {};
    if (req.userRole === 'student') {
      const rs = await QuizResult.find({ student: req.user._id, quiz: { $in: quizzes.map(q => q._id) } })
        .sort({ attempt: -1 });
      rs.forEach(r => {
        if (!myResults[r.quiz.toString()]) myResults[r.quiz.toString()] = r;
      });
    }

    const data = quizzes.map(q => ({
      ...q.toObject(),
      questionCount: q.questions.length,
      questions: undefined,
      myResult: myResults[q._id.toString()] || null,
    }));

    res.json({ success: true, count: data.length, data });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('subject', 'name code gradeLevel')
      .populate('createdBy', 'firstName lastName')
      .populate('questions.question');
    if (!quiz) return next(new AppError('Quiz not found', 404));
    if (req.userRole === 'student' && quiz.status !== 'published')
      return next(new AppError('This quiz is not available', 403));

    const myResults = req.userRole === 'student'
      ? await QuizResult.find({ quiz: quiz._id, student: req.user._id }).sort({ attempt: -1 })
      : null;

    res.json({ success: true, data: { ...quiz.toObject(), myResults } });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, subject, gradeLevel, questionIds,
            duration, passMark, allowRetake, showAnswers } = req.body;
    if (!title) return next(new AppError('title is required', 400));

    let questions = [];
    if (Array.isArray(questionIds) && questionIds.length) {
      const qs = await Question.find({ _id: { $in: questionIds } });
      questions = questionIds.map(id => {
        const q = qs.find(x => x._id.toString() === id);
        return q ? { question: q._id, marks: q.marks || 1 } : null;
      }).filter(Boolean);
    }

    const quiz = await Quiz.create({
      title, description: description || '',
      subject: subject || null, gradeLevel: gradeLevel || '',
      questions, duration: Number(duration) || 15,
      totalMarks: questions.reduce((s, q) => s + q.marks, 0),
      passMark: Number(passMark) || 0,
      allowRetake: allowRetake !== false,
      showAnswers: showAnswers !== false,
      status: 'draft',
      createdBy: req.user._id,
      createdByModel: req.userRole === 'admin' ? 'Admin' : 'Teacher',
    });

    await quiz.populate('subject', 'name code');
    res.status(201).json({ success: true, data: quiz });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return next(new AppError('Quiz not found', 404));
    if (req.userRole === 'teacher' && quiz.createdBy.toString() !== req.user._id.toString())
      return next(new AppError('You can only edit your own quizzes', 403));

    const ALLOWED = ['title','description','subject','gradeLevel','duration',
                     'passMark','allowRetake','showAnswers','status'];
    ALLOWED.forEach(f => { if (req.body[f] !== undefined) quiz[f] = req.body[f]; });

    if (Array.isArray(req.body.questionIds)) {
      const qs = await Question.find({ _id: { $in: req.body.questionIds } });
      quiz.questions = req.body.questionIds.map(id => {
        const q = qs.find(x => x._id.toString() === id);
        return q ? { question: q._id, marks: q.marks || 1 } : null;
      }).filter(Boolean);
      quiz.totalMarks = quiz.questions.reduce((s, q) => s + q.marks, 0);
    }

    await quiz.save();
    res.json({ success: true, data: quiz });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return next(new AppError('Quiz not found', 404));
    if (req.userRole === 'teacher' && quiz.createdBy.toString() !== req.user._id.toString())
      return next(new AppError('You can only delete your own quizzes', 403));
    await QuizResult.deleteMany({ quiz: quiz._id });
    await Quiz.findByIdAndDelete(quiz._id);
    res.json({ success: true, message: 'Quiz deleted' });
  } catch (err) { next(err); }
};

exports.submit = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('questions.question');
    if (!quiz || quiz.status !== 'published') return next(new AppError('Quiz not available', 404));

    if (!quiz.allowRetake) {
      const prev = await QuizResult.findOne({ quiz: quiz._id, student: req.user._id });
      if (prev) return next(new AppError('Retakes are not allowed for this quiz', 400));
    }

    const attempt = (await QuizResult.countDocuments({ quiz: quiz._id, student: req.user._id })) + 1;
    const { answers = {}, timeTaken = 0 } = req.body;

    let score = 0;
    const answerList = quiz.questions.map(({ question: q, marks }) => {
      const given     = (answers[q._id.toString()] || '').trim();
      const isCorrect = ['multiple_choice','true_false'].includes(q.type)
        ? given.toLowerCase() === q.correctAnswer.toLowerCase()
        : false;
      if (isCorrect) score += marks;
      return { question: q._id, answer: given, isCorrect, marks: isCorrect ? marks : 0 };
    });

    const result = await QuizResult.create({
      quiz: quiz._id, student: req.user._id,
      answers: answerList, score, totalMarks: quiz.totalMarks,
      passed: score >= quiz.passMark, timeTaken, attempt,
    });

    // Populate question text + correct answer if showAnswers
    const populated = quiz.showAnswers
      ? await QuizResult.findById(result._id).populate('answers.question', 'text correctAnswer explanation type')
      : result;

    res.status(201).json({ success: true, data: populated });
  } catch (err) { next(err); }
};

exports.getResults = async (req, res, next) => {
  try {
    const results = await QuizResult.find({ quiz: req.params.id })
      .populate('student', 'firstName lastName email gradeLevel')
      .sort({ score: -1 });
    res.json({ success: true, count: results.length, data: results });
  } catch (err) { next(err); }
};
