const Lesson     = require('../models/Lesson');
const Course     = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const AppError   = require('../utils/AppError');
const path       = require('path');
const { notifyEnrolledStudents } = require('../utils/notify');
const { EVENTS } = require('../constants/events');

// ── Resolve slug OR ObjectId → Course ────────────────────────────────────────
async function resolveCourse(slugOrId) {
  const isObjectId = /^[a-f\d]{24}$/i.test(slugOrId);
  return isObjectId
    ? Course.findById(slugOrId)
    : Course.findOne({ slug: slugOrId });
}

// ── helpers ───────────────────────────────────────────────────────────────────
function fileUrl(filePath) {
  if (!filePath) return null;
  const idx = filePath.replace(/\\/g, '/').indexOf('uploads/');
  if (idx === -1) return null;
  return `/${filePath.replace(/\\/g, '/').slice(idx)}`;
}

// ── GET /api/lessons/course/:courseId ─────────────────────────────────────────
exports.getLessonsByCourse = async (req, res, next) => {
  try {
    const course = await resolveCourse(req.params.courseId);
    if (!course) return next(new AppError('Course not found', 404));

    // Students need enrollment
    if (req.userRole === 'student') {
      const enrollment = await Enrollment.findOne({
        student: req.user._id,
        subject: course.subject,
        status: 'active',
        paymentStatus: { $in: ['free', 'paid'] },
      });
      if (!enrollment) return next(new AppError('You must be enrolled to access lessons', 403));
    }

    const lessons = await Lesson.find({ course: course._id, isPublished: true })
      .sort({ order: 1, createdAt: 1 });

    res.json({ success: true, count: lessons.length, data: lessons });
  } catch (err) { next(err); }
};

// ── GET /api/lessons/:id ──────────────────────────────────────────────────────
exports.getLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course');
    if (!lesson) return next(new AppError('Lesson not found', 404));

    if (req.userRole === 'student') {
      const enrollment = await Enrollment.findOne({
        student: req.user._id,
        subject: lesson.subject,
        status: 'active',
        paymentStatus: { $in: ['free', 'paid'] },
      });
      if (!enrollment) return next(new AppError('You must be enrolled to access this lesson', 403));
    }

    res.json({ success: true, data: lesson });
  } catch (err) { next(err); }
};

// ── POST /api/lessons ─────────────────────────────────────────────────────────
exports.createLesson = async (req, res, next) => {
  try {
    const { title, content, courseId, order, type, duration, videoUrl: externalVideo } = req.body;
    if (!title || !courseId) return next(new AppError('title and courseId are required', 400));

    const course = await resolveCourse(courseId);
    if (!course) return next(new AppError('Course not found', 404));

    if (req.userRole === 'teacher' && course.teacher.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only add lessons to your own courses', 403));
    }

    // Handle uploaded files
    let videoPath = externalVideo || null;
    let filePath  = null;
    let fileName  = null;

    if (req.files?.video?.[0]) {
      videoPath = fileUrl(req.files.video[0].path);
    }
    if (req.files?.file?.[0]) {
      filePath = fileUrl(req.files.file[0].path);
      fileName = req.files.file[0].originalname;
    }
    // Single file upload (multer single)
    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      const isVideo = ['.mp4', '.webm', '.mov', '.avi'].includes(ext);
      if (isVideo) videoPath = fileUrl(req.file.path);
      else {
        filePath = fileUrl(req.file.path);
        fileName = req.file.originalname;
      }
    }

    const lesson = await Lesson.create({
      title:         title.trim(),
      content:       content?.trim() || '',
      course:        course._id,
      subject:       course.subject,
      type:          type || (videoPath ? 'video' : filePath ? 'document' : 'text'),
      videoUrl:      videoPath,
      fileUrl:       filePath,
      fileName,
      duration:      duration || null,
      order:         Number(order) || 0,
      isPublished:   true,
      allowDownload: req.body.allowDownload === 'true' || req.body.allowDownload === true,
    });

    res.status(201).json({ success: true, data: lesson });

    // ── Notify enrolled students (fire after response for speed) ──────────
    setImmediate(() =>
      notifyEnrolledStudents(course.subject, {
        type:    EVENTS.NEW_LESSON,
        title:   'New Lesson Added',
        message: `A new lesson "${lesson.title}" has been added to "${course.title}".`,
        link:    `/subjects/${course.subject}/courses/${course.slug || course._id}/lessons`,
      })
    );
  } catch (err) { next(err); }
};

// ── PUT /api/lessons/:id ──────────────────────────────────────────────────────
exports.updateLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course');
    if (!lesson) return next(new AppError('Lesson not found', 404));

    if (req.userRole === 'teacher' &&
        lesson.course?.teacher?.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only edit your own lessons', 403));
    }

    const { title, content, order, type, duration, isPublished } = req.body;
    if (title       !== undefined) lesson.title       = title.trim();
    if (content     !== undefined) lesson.content     = content;
    if (order       !== undefined) lesson.order       = Number(order);
    if (type        !== undefined) lesson.type        = type;
    if (duration    !== undefined) lesson.duration    = duration;
    if (isPublished !== undefined) lesson.isPublished = isPublished;
    if (req.body.allowDownload !== undefined)
      lesson.allowDownload = req.body.allowDownload === 'true' || req.body.allowDownload === true;

    if (req.file) {
      const ext     = path.extname(req.file.originalname).toLowerCase();
      const isVideo = ['.mp4', '.webm', '.mov', '.avi'].includes(ext);
      if (isVideo) lesson.videoUrl = fileUrl(req.file.path);
      else { lesson.fileUrl = fileUrl(req.file.path); lesson.fileName = req.file.originalname; }
    }

    await lesson.save();

    // ── Notify enrolled students ──────────────────────────────────────────
    setImmediate(() =>
      notifyEnrolledStudents(lesson.subject, {
        type:    EVENTS.LESSON_UPDATED,
        title:   'Lesson Updated',
        message: `The lesson "${lesson.title}" has been updated.`,
        link:    `/subjects/${lesson.subject}/courses/${lesson.course}/lessons`,
      })
    );

    res.json({ success: true, data: lesson });
  } catch (err) { next(err); }
};

// ── DELETE /api/lessons/:id ───────────────────────────────────────────────────
exports.deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course');
    if (!lesson) return next(new AppError('Lesson not found', 404));

    if (req.userRole === 'teacher' &&
        lesson.course?.teacher?.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only delete your own lessons', 403));
    }

    // ── Notify enrolled students before deleting ─────────────────────────
    setImmediate(() =>
      notifyEnrolledStudents(lesson.subject, {
        type:    EVENTS.LESSON_DELETED,
        title:   'Lesson Removed',
        message: `The lesson "${lesson.title}" has been removed.`,
        link:    `/subjects/${lesson.subject}/courses/${lesson.course}/lessons`,
      })
    );

    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Lesson deleted' });
  } catch (err) { next(err); }
};
