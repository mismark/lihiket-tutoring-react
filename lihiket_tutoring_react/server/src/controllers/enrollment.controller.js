const Enrollment = require('../models/Enrollment');
const Subject    = require('../models/Subject');
const Teacher    = require('../models/Teacher');
const Student    = require('../models/Student');
const AppError   = require('../utils/AppError');
const notify     = require('../utils/notify');
const { EVENTS } = require('../constants/events');

// @desc   Get all enrollments for the logged-in student
// @route  GET /api/enrollments
// @access Private (student)
exports.getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({
      student: req.user._id,
      status:  'active',
    }).populate('subject').sort({ enrolledAt: -1 });

    res.status(200).json({ success: true, count: enrollments.length, data: enrollments });
  } catch (err) { next(err); }
};

// @desc   Get all active enrollments for a subject (admin / teacher view)
// @route  GET /api/enrollments/subject/:subjectId
// @access Private (admin, teacher)
exports.getEnrolledStudentsBySubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.subjectId);
    if (!subject) return next(new AppError('Subject not found', 404));

    const enrollments = await Enrollment.find({
      subject: req.params.subjectId,
      status:  'active',
    })
      .populate('student', 'firstName lastName email phone gradeLevel username profilePicture')
      .sort({ enrolledAt: -1 });

    res.status(200).json({ success: true, count: enrollments.length, data: enrollments });
  } catch (err) { next(err); }
};

// @desc   Admin removes a student's enrollment
// @route  DELETE /api/enrollments/subject/:subjectId/student/:studentId
// @access Private (admin)
exports.removeEnrollmentByAdmin = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({
      subject: req.params.subjectId,
      student: req.params.studentId,
      status:  'active',
    });
    if (!enrollment) return next(new AppError('Enrollment not found', 404));

    enrollment.status = 'dropped';
    await enrollment.save();

    res.status(200).json({ success: true, message: 'Student removed from subject' });
  } catch (err) { next(err); }
};

// @desc   Enroll in a subject
// @route  POST /api/enrollments/:subjectId
// @access Private (student)
exports.enroll = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.subjectId);
    if (!subject)            return next(new AppError('Subject not found', 404));
    if (!subject.isActive)   return next(new AppError('This subject is not currently active', 400));

    // Upsert: if a dropped record exists, reactivate it; else create new
    const enrollment = await Enrollment.findOneAndUpdate(
      { student: req.user._id, subject: req.params.subjectId },
      { status: 'active', enrolledAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await enrollment.populate('subject');

    // ── Notify all teachers assigned to this subject ──────────────────────
    const student          = await Student.findById(req.user._id).select('firstName lastName gradeLevel');
    const assignedTeachers = await Teacher.find({ assignedSubjects: subject._id }).select('_id');

    await Promise.all(
      assignedTeachers.map(t =>
        notify({
          userId:    t._id,
          userModel: 'Teacher',
          type:      EVENTS.STUDENT_ENROLLED,
          title:     'New Student Enrolled',
          message:   `${student?.firstName} ${student?.lastName} enrolled in "${subject.name}" (${subject.gradeLevel}).`,
          link:      '/my-subjects',
        })
      )
    );

    res.status(200).json({
      success: true,
      message: `Enrolled in ${subject.name} successfully`,
      data:    enrollment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Unenroll (drop) from a subject
// @route  DELETE /api/enrollments/:subjectId
// @access Private (student)
exports.unenroll = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      subject: req.params.subjectId,
      status:  'active',
    });

    if (!enrollment) return next(new AppError('You are not enrolled in this subject', 404));

    enrollment.status = 'dropped';
    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Unenrolled successfully',
    });
  } catch (err) {
    next(err);
  }
};
