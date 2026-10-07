/**
 * Admin Controller
 *
 * Platform-wide statistics and administrative helpers for the admin dashboard.
 * All routes are protected with protect + authorize('admin').
 */

const Student    = require('../models/Student');
const Teacher    = require('../models/Teacher');
const Parent     = require('../models/Parent');
const Admin      = require('../models/Admin');
const Subject    = require('../models/Subject');
const Enrollment = require('../models/Enrollment');
const Payment    = require('../models/Payment');
const Course     = require('../models/Course');
const LiveClass  = require('../models/LiveClass');
const Assignment = require('../models/Assignment');
const Quiz       = require('../models/Quiz');
const Exam       = require('../models/Exam');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const AppError   = require('../utils/AppError');

// ── @desc   Get platform-wide dashboard statistics
// ── @route  GET /api/admin/stats
// ── @access Private (admin)
exports.getStats = async (req, res) => {
  const [
    totalStudents,
    totalTeachers,
    totalParents,
    totalAdmins,
    totalSubjects,
    activeSubjects,
    totalCourses,
    totalEnrollments,
    activeEnrollments,
    paidEnrollments,
    totalPayments,
    paidPayments,
    totalRevenue,
    totalCertificates,
    totalLiveClasses,
    liveLiveClasses,
  ] = await Promise.all([
    Student.countDocuments(),
    Teacher.countDocuments(),
    Parent.countDocuments(),
    Admin.countDocuments(),
    Subject.countDocuments(),
    Subject.countDocuments({ isActive: true }),
    Course.countDocuments(),
    Enrollment.countDocuments(),
    Enrollment.countDocuments({ status: 'active' }),
    Enrollment.countDocuments({ status: 'active', paymentStatus: 'paid' }),
    Payment.countDocuments(),
    Payment.countDocuments({ status: 'paid' }),
    Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Certificate.countDocuments(),
    LiveClass.countDocuments(),
    LiveClass.countDocuments({ status: 'live' }),
  ]);

  const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

  res.json({
    success: true,
    data: {
      users: {
        total:    totalStudents + totalTeachers + totalParents + totalAdmins,
        students: totalStudents,
        teachers: totalTeachers,
        parents:  totalParents,
        admins:   totalAdmins,
      },
      subjects: {
        total:    totalSubjects,
        active:   activeSubjects,
        inactive: totalSubjects - activeSubjects,
      },
      courses: {
        total: totalCourses,
      },
      enrollments: {
        total:  totalEnrollments,
        active: activeEnrollments,
        paid:   paidEnrollments,
        free:   activeEnrollments - paidEnrollments,
      },
      payments: {
        total:   totalPayments,
        paid:    paidPayments,
        revenue, // total ETB collected
      },
      certificates: {
        total: totalCertificates,
      },
      liveClasses: {
        total: totalLiveClasses,
        live:  liveLiveClasses,
      },
    },
  });
};

// ── @desc   Get recent activity feed (last 20 events across payments + enrollments)
// ── @route  GET /api/admin/activity
// ── @access Private (admin)
exports.getActivity = async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);

  const [recentPayments, recentEnrollments, recentUsers] = await Promise.all([
    Payment.find({ status: 'paid' })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate('student', 'firstName lastName email userId')
      .populate('subject', 'name code')
      .select('amount status txRef student subject createdAt updatedAt'),

    Enrollment.find({ status: 'active' })
      .sort({ enrolledAt: -1 })
      .limit(limit)
      .populate('student', 'firstName lastName email userId')
      .populate('subject', 'name code'),

    Student.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('firstName lastName email userId gradeLevel createdAt'),
  ]);

  res.json({
    success: true,
    data: {
      recentPayments,
      recentEnrollments,
      recentUsers,
    },
  });
};

// ── @desc   Get revenue breakdown by subject
// ── @route  GET /api/admin/revenue
// ── @access Private (admin)
exports.getRevenue = async (req, res) => {
  const revenueBySubject = await Payment.aggregate([
    { $match: { status: 'paid' } },
    {
      $group: {
        _id:   '$subject',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
    { $limit: 20 },
    {
      $lookup: {
        from:         'subjects',
        localField:   '_id',
        foreignField: '_id',
        as:           'subject',
      },
    },
    { $unwind: { path: '$subject', preserveNullAndEmpty: false } },
    {
      $project: {
        _id:   0,
        name:  '$subject.name',
        code:  '$subject.code',
        total: 1,
        count: 1,
      },
    },
  ]);

  // Monthly revenue for last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyRevenue = await Payment.aggregate([
    { $match: { status: 'paid', updatedAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year:  { $year:  '$updatedAt' },
          month: { $month: '$updatedAt' },
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({
    success: true,
    data: {
      bySubject: revenueBySubject,
      monthly:   monthlyRevenue,
    },
  });
};

// ── @desc   Get enrollment stats per subject
// ── @route  GET /api/admin/enrollment-stats
// ── @access Private (admin)
exports.getEnrollmentStats = async (req, res) => {
  const stats = await Enrollment.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id:   '$subject',
        count: { $sum: 1 },
        paid:  { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] } },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 20 },
    {
      $lookup: {
        from:         'subjects',
        localField:   '_id',
        foreignField: '_id',
        as:           'subject',
      },
    },
    { $unwind: { path: '$subject', preserveNullAndEmpty: false } },
    {
      $project: {
        _id:    0,
        name:   '$subject.name',
        code:   '$subject.code',
        grade:  '$subject.gradeLevel',
        count:  1,
        paid:   1,
        free:   { $subtract: ['$count', '$paid'] },
      },
    },
  ]);

  res.json({ success: true, data: stats });
};

// ── @desc   Issue a certificate to a student for a subject
// ── @route  POST /api/admin/certificates
// ── @access Private (admin)
exports.issueCertificate = async (req, res) => {
  const { studentId, subjectId, grade, completionDate } = req.body;

  if (!studentId || !subjectId) {
    throw new AppError('studentId and subjectId are required', 400);
  }

  // Verify enrollment is active
  const enrollment = await Enrollment.findOne({
    student: studentId,
    subject: subjectId,
    status:  'active',
  });
  if (!enrollment) {
    throw new AppError('Student is not actively enrolled in this subject', 400);
  }

  // Prevent duplicate certificates
  const existing = await Certificate.findOne({ student: studentId, subject: subjectId });
  if (existing) {
    throw new AppError('Certificate already issued for this student/subject combination', 409);
  }

  const certificate = await Certificate.create({
    student:        studentId,
    subject:        subjectId,
    issuedBy:       req.user._id,
    grade:          grade || null,
    completionDate: completionDate || new Date(),
  });

  await certificate.populate([
    { path: 'student', select: 'firstName lastName email userId' },
    { path: 'subject', select: 'name code gradeLevel' },
  ]);

  // Notify student
  const notify = require('../utils/notify');
  const { EVENTS } = require('../constants/events');
  await notify({
    userId:    studentId,
    userModel: 'Student',
    type:      EVENTS.CERTIFICATE_ISSUED,
    title:     'Certificate Issued',
    message:   `Congratulations! You have been awarded a certificate for "${certificate.subject.name}".`,
    link:      '/certificates',
  });

  res.status(201).json({ success: true, data: certificate });
};
