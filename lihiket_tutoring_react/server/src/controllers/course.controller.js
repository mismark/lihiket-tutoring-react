const Course    = require('../models/Course');
const Lesson    = require('../models/Lesson');
const Subject   = require('../models/Subject');
const Enrollment = require('../models/Enrollment');
const AppError  = require('../utils/AppError');

// ── Resolve a slug OR ObjectId → Course document ─────────────────────────────
async function resolveCourse(slugOrId) {
  const isObjectId = /^[a-f\d]{24}$/i.test(slugOrId);
  return isObjectId
    ? Course.findById(slugOrId)
    : Course.findOne({ slug: slugOrId });
}

// ── Resolve a slug OR ObjectId → Subject document ────────────────────────────
async function resolveSubject(slugOrId) {
  const isObjectId = /^[a-f\d]{24}$/i.test(slugOrId);
  return isObjectId
    ? Subject.findById(slugOrId)
    : Subject.findOne({ slug: slugOrId });
}

// ── helpers ───────────────────────────────────────────────────────────────────

// Check if the requesting student is enrolled in the subject
async function requireEnrollment(studentId, subjectId, next) {
  const enrollment = await Enrollment.findOne({
    student: studentId,
    subject: subjectId,
    status: 'active',
    paymentStatus: { $in: ['free', 'paid'] },
  });
  if (!enrollment) {
    next(new AppError('You must be enrolled in this subject to access its content.', 403));
    return false;
  }
  return true;
}

// ── GET /api/courses/subject/:subjectId ───────────────────────────────────────
// Returns all courses for a subject with their lesson list
exports.getCoursesBySubject = async (req, res, next) => {
  try {
    const subject = await resolveSubject(req.params.subjectId);
    if (!subject) return next(new AppError('Subject not found', 404));
    const subjectId = subject._id;

    // Students must be enrolled
    if (req.userRole === 'student') {
      const ok = await requireEnrollment(req.user._id, subjectId, next);
      if (!ok) return;
    }

    // Admin/teacher see all courses; students only see published
    const filter = { subject: subjectId };
    if (req.userRole === 'student') filter.isPublished = true;

    const courses = await Course.find(filter)
      .populate('teacher', 'firstName lastName profilePicture specializedSubject')
      .sort({ order: 1, createdAt: 1 });

    // Attach lessons — admin/teacher see all, students only published
    const courseIds = courses.map(c => c._id);
    const lessonFilter = { course: { $in: courseIds } };
    if (req.userRole === 'student') lessonFilter.isPublished = true;

    const lessons = await Lesson.find(lessonFilter).sort({ order: 1, createdAt: 1 });

    const lessonMap = {};
    for (const l of lessons) {
      const key = l.course.toString();
      if (!lessonMap[key]) lessonMap[key] = [];
      lessonMap[key].push(l);
    }

    const data = courses.map(c => ({
      ...c.toObject(),
      lessons: lessonMap[c._id.toString()] || [],
    }));

    res.json({ success: true, count: data.length, data });
  } catch (err) { next(err); }
};

// ── GET /api/courses/:id ──────────────────────────────────────────────────────
exports.getCourse = async (req, res, next) => {
  try {
    const course = await resolveCourse(req.params.id);
    if (!course) return next(new AppError('Course not found', 404));
    await course.populate('teacher', 'firstName lastName profilePicture specializedSubject');
    await course.populate('subject', 'name code gradeLevel slug');

    if (req.userRole === 'student') {
      const ok = await requireEnrollment(req.user._id, course.subject._id, next);
      if (!ok) return;
    }

    const lessons = await Lesson.find({ course: course._id, isPublished: true })
      .sort({ order: 1, createdAt: 1 });

    res.json({ success: true, data: { ...course.toObject(), lessons } });
  } catch (err) { next(err); }
};

// ── POST /api/courses ─────────────────────────────────────────────────────────
// Admin or assigned teacher
exports.createCourse = async (req, res, next) => {
  try {
    const { title, description, subjectId, order } = req.body;
    if (!title || !subjectId) return next(new AppError('title and subjectId are required', 400));

    const subject = await resolveSubject(subjectId);
    if (!subject) return next(new AppError('Subject not found', 404));

    const course = await Course.create({
      title: title.trim(),
      description: description?.trim() || '',
      subject: subject._id,
      teacher: req.user._id,
      order: Number(order) || 0,
    });

    await course.populate('teacher', 'firstName lastName');
    res.status(201).json({ success: true, data: course });
  } catch (err) { next(err); }
};

// ── PUT /api/courses/:id ──────────────────────────────────────────────────────
exports.updateCourse = async (req, res, next) => {
  try {
    const { title, description, order, isPublished } = req.body;
    const course = await resolveCourse(req.params.id);
    if (!course) return next(new AppError('Course not found', 404));

    // Teachers can only edit their own courses
    if (req.userRole === 'teacher' && course.teacher.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only edit your own courses', 403));
    }

    if (title)                        course.title       = title.trim();
    if (description !== undefined)    course.description = description.trim();
    if (order !== undefined)          course.order       = Number(order);
    if (isPublished !== undefined)    course.isPublished = isPublished;
    await course.save();

    res.json({ success: true, data: course });
  } catch (err) { next(err); }
};

// ── DELETE /api/courses/:id ───────────────────────────────────────────────────
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return next(new AppError('Course not found', 404));

    if (req.userRole === 'teacher' && course.teacher.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only delete your own courses', 403));
    }

    // Delete all lessons in the course
    await Lesson.deleteMany({ course: req.params.id });
    await Course.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Course and all its lessons deleted' });
  } catch (err) { next(err); }
};
