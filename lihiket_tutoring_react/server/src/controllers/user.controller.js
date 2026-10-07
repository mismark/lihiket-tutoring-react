const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Parent  = require('../models/Parent');
const Admin   = require('../models/Admin');
const AppError = require('../utils/AppError');

// ── helpers ───────────────────────────────────────────────────────────────────
const MODEL_MAP = {
  teacher: Teacher,
  student: Student,
  parent:  Parent,
  admin:   Admin,
};

function getModel(userType) {
  const Model = MODEL_MAP[userType];
  if (!Model) throw new AppError('Invalid user type', 400);
  return Model;
}

// @desc    Get all pending users (unverified)
// @route   GET /api/users/pending
// @access  Private (Admin)
exports.getPendingUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    let users = [];

    if (!role || role === 'teacher') {
      const teachers = await Teacher.find({ isVerified: false })
        .select('firstName lastName email phone specializedSubject qualifications experience cvDocument role createdAt')
        .sort({ createdAt: -1 });
      users = [...users, ...teachers.map(t => ({ ...t.toObject(), userType: 'teacher' }))];
    }

    if (!role || role === 'student') {
      const students = await Student.find({ isVerified: false })
        .select('firstName lastName email phone gradeLevel parentFullName parentEmail parentPhone role createdAt')
        .sort({ createdAt: -1 });
      users = [...users, ...students.map(s => ({ ...s.toObject(), userType: 'student' }))];
    }

    if (!role || role === 'parent') {
      const parents = await Parent.find({ isVerified: false })
        .select('firstName lastName email phone country role createdAt')
        .sort({ createdAt: -1 });
      users = [...users, ...parents.map(p => ({ ...p.toObject(), userType: 'parent' }))];
    }

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (verified)
// @route   GET /api/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, isActive } = req.query;
    // Only apply isActive filter when explicitly set to 'true' or 'false'
    const isActiveFilter = isActive === 'true' ? { isActive: true }
                         : isActive === 'false' ? { isActive: false }
                         : {};
    let users = [];

    if (!role || role === 'teacher') {
      const teachers = await Teacher.find(isActiveFilter)
        .select('userId firstName lastName email phone specializedSubject qualifications experience cvDocument isVerified isActive role createdAt')
        .sort({ createdAt: -1 });
      users = [...users, ...teachers.map(t => ({ ...t.toObject(), userType: 'teacher' }))];
    }

    if (!role || role === 'student') {
      const students = await Student.find(isActiveFilter)
        .select('userId firstName lastName email phone gradeLevel parentFullName parentEmail parentPhone isVerified isActive role createdAt')
        .sort({ createdAt: -1 });
      users = [...users, ...students.map(s => ({ ...s.toObject(), userType: 'student' }))];
    }

    if (!role || role === 'parent') {
      const parents = await Parent.find(isActiveFilter)
        .select('userId firstName lastName email phone country isVerified isActive role createdAt')
        .sort({ createdAt: -1 });
      users = [...users, ...parents.map(p => ({ ...p.toObject(), userType: 'parent' }))];
    }

    if (!role || role === 'admin') {
      const admins = await Admin.find()
        .select('userId firstName lastName email phone isVerified isActive role createdAt')
        .sort({ createdAt: -1 });
      users = [...users, ...admins.map(a => ({ ...a.toObject(), userType: 'admin' }))];
    }

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve user
// @route   POST /api/users/:id/approve
// @access  Private (Admin)
exports.approveUser = async (req, res, next) => {
  try {
    const { userType } = req.body;
    const adminId = req.user.id;

    let user;
    if (userType === 'teacher') {
      user = await Teacher.findById(req.params.id);
    } else if (userType === 'student') {
      user = await Student.findById(req.params.id);
    } else if (userType === 'parent') {
      user = await Parent.findById(req.params.id);
    }

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.isVerified) {
      return next(new AppError('User is already verified', 400));
    }

    user.isVerified = true;
    user.verifiedAt = new Date();
    user.verifiedBy = adminId;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User approved successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject user
// @route   DELETE /api/users/:id/reject
// @access  Private (Admin)
exports.rejectUser = async (req, res, next) => {
  try {
    const { userType } = req.body;

    let user;
    if (userType === 'teacher') {
      user = await Teacher.findById(req.params.id);
    } else if (userType === 'student') {
      user = await Student.findById(req.params.id);
    } else if (userType === 'parent') {
      user = await Parent.findById(req.params.id);
    }

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Delete the user instead of just marking as rejected
    if (userType === 'teacher') {
      await Teacher.findByIdAndDelete(req.params.id);
    } else if (userType === 'student') {
      await Student.findByIdAndDelete(req.params.id);
    } else if (userType === 'parent') {
      await Parent.findByIdAndDelete(req.params.id);
    }

    res.status(200).json({
      success: true,
      message: 'User rejected and deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PATCH /api/users/:id/toggle-active
// @access  Private (Admin)
exports.toggleUserActive = async (req, res, next) => {
  try {
    const { userType } = req.body;

    let user;
    if (userType === 'teacher') {
      user = await Teacher.findById(req.params.id);
    } else if (userType === 'student') {
      user = await Student.findById(req.params.id);
    } else if (userType === 'parent') {
      user = await Parent.findById(req.params.id);
    } else if (userType === 'admin') {
      user = await Admin.findById(req.params.id);
    }

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all teachers
// @route   GET /api/users/teachers
// @access  Private (Admin)
exports.getAllTeachers = async (req, res, next) => {
  try {
    const teachers = await Teacher.find({ isVerified: true, isActive: true })
      .select('firstName lastName email specializedSubject experience')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by id + userType query param
// @route   GET /api/users/:id?userType=teacher
// @access  Private (Admin)
exports.getUser = async (req, res, next) => {
  try {
    const { userType } = req.query;
    const Model = getModel(userType);
    const user = await Model.findById(req.params.id).select('-password');
    if (!user) return next(new AppError('User not found', 404));
    res.status(200).json({ success: true, data: { ...user.toObject(), userType } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user fields (admin can edit any non-password field)
// @route   PUT /api/users/:id?userType=teacher
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { userType } = req.query;
    const Model = getModel(userType);

    // Never allow password, OTP, or userId fields to be changed via this endpoint
    const PROTECTED = ['password', 'passwordResetOTP', 'otpExpires', 'userId'];
    PROTECTED.forEach(f => delete req.body[f]);

    // Check email uniqueness across all collections if email is being changed
    if (req.body.email) {
      const normalized = req.body.email.trim().toLowerCase();
      const [t, s, p, a] = await Promise.all([
        Teacher.findOne({ email: normalized, _id: { $ne: req.params.id } }),
        Student.findOne({ email: normalized, _id: { $ne: req.params.id } }),
        Parent.findOne({ email: normalized,  _id: { $ne: req.params.id } }),
        Admin.findOne({   email: normalized, _id: { $ne: req.params.id } }),
      ]);
      if (t || s || p || a) return next(new AppError('Email is already in use by another account', 409));
      req.body.email = normalized;
    }

    // Check username uniqueness across all collections if username is being changed
    if (req.body.username) {
      const normalized = req.body.username.trim().toLowerCase();
      const [t, s, p, a] = await Promise.all([
        Teacher.findOne({ username: normalized, _id: { $ne: req.params.id } }),
        Student.findOne({ username: normalized, _id: { $ne: req.params.id } }),
        Parent.findOne({ username: normalized,  _id: { $ne: req.params.id } }),
        Admin.findOne({   username: normalized, _id: { $ne: req.params.id } }),
      ]);
      if (t || s || p || a) return next(new AppError('Username is already taken', 409));
      req.body.username = normalized;
    }

    const updated = await Model.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updated) return next(new AppError('User not found', 404));

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { ...updated.toObject(), userType },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Permanently delete a user
// @route   DELETE /api/users/:id?userType=teacher
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const { userType } = req.query;
    if (userType === 'admin') return next(new AppError('Admin accounts cannot be deleted via this endpoint', 403));
    const Model = getModel(userType);
    const user = await Model.findByIdAndDelete(req.params.id);
    if (!user) return next(new AppError('User not found', 404));
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get parent's children with their enrollments
// @route   GET /api/users/my-children
// @access  Private (parent)
exports.getMyChildren = async (req, res, next) => {
  try {
    const parent = await require('../models/Parent')
      .findById(req.user._id)
      .populate({
        path: 'children',
        select: 'firstName lastName email phone gradeLevel profilePicture isActive isVerified username bio',
      });

    if (!parent) return next(new AppError('Parent not found', 404));

    const children = parent.children || [];

    // For each child, get their active enrollments
    const Enrollment = require('../models/Enrollment');
    const childrenWithData = await Promise.all(
      children.map(async (child) => {
        const enrollments = await Enrollment.find({
          student: child._id,
          status: 'active',
        }).populate('subject', 'name code gradeLevel category price isActive');

        return {
          ...child.toObject(),
          enrollments,
          enrollmentCount: enrollments.length,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: childrenWithData.length,
      data: childrenWithData,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PARENT ↔ CHILD LINKING
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Link a student to the logged-in parent
//          Body: { studentUserId: "LIKST10001" }  OR  { studentId: "<mongoId>" }
// @route   POST /api/users/link-child
// @access  Private (parent)
exports.linkChild = async (req, res, next) => {
  try {
    const { studentUserId, studentId } = req.body;

    if (!studentUserId && !studentId) {
      return next(new AppError('Provide studentUserId (e.g. LIKST10001) or studentId', 400));
    }

    // Find the student
    const query = studentId
      ? { _id: studentId }
      : { userId: studentUserId.trim().toUpperCase() };

    const student = await Student.findOne(query).select(
      'firstName lastName email userId gradeLevel profilePicture isActive isVerified username'
    );
    if (!student) {
      return next(new AppError('Student not found. Check the Student ID and try again.', 404));
    }

    // Load the parent record
    const Parent = require('../models/Parent');
    const parent = await Parent.findById(req.user._id);
    if (!parent) return next(new AppError('Parent not found', 404));

    // Check if already linked
    const alreadyLinked = parent.children.some(
      (c) => c.toString() === student._id.toString()
    );
    if (alreadyLinked) {
      return next(new AppError(`${student.firstName} is already linked to your account`, 409));
    }

    parent.children.push(student._id);
    await parent.save();

    res.status(200).json({
      success: true,
      message: `${student.firstName} ${student.lastName} has been linked to your account`,
      data: student,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Unlink a student from the logged-in parent
// @route   DELETE /api/users/unlink-child/:studentId
// @access  Private (parent)
exports.unlinkChild = async (req, res, next) => {
  try {
    const Parent = require('../models/Parent');
    const parent = await Parent.findById(req.user._id);
    if (!parent) return next(new AppError('Parent not found', 404));

    const before = parent.children.length;
    parent.children = parent.children.filter(
      (c) => c.toString() !== req.params.studentId
    );

    if (parent.children.length === before) {
      return next(new AppError('This student is not linked to your account', 404));
    }

    await parent.save();

    res.status(200).json({
      success: true,
      message: 'Student unlinked successfully',
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CHILD PROGRESS
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Get full academic progress for one child of the logged-in parent.
//          Returns: enrollments, assignment submissions (with marks), quiz
//          results, exam results, upcoming/past live classes.
// @route   GET /api/users/child-progress/:studentId
// @access  Private (parent)
exports.getChildProgress = async (req, res, next) => {
  try {
    const Parent = require('../models/Parent');
    const parent = await Parent.findById(req.user._id);
    if (!parent) return next(new AppError('Parent not found', 404));

    // Guard: only allow access to the parent's own children
    const isLinked = parent.children.some(
      (c) => c.toString() === req.params.studentId
    );
    if (!isLinked) {
      return next(new AppError('This student is not linked to your account', 403));
    }

    const sid = req.params.studentId;

    const Enrollment           = require('../models/Enrollment');
    const Assignment           = require('../models/Assignment');
    const AssignmentSubmission = require('../models/AssignmentSubmission');
    const Quiz                 = require('../models/Quiz');
    const QuizResult           = require('../models/QuizResult');
    const Exam                 = require('../models/Exam');
    const ExamResult           = require('../models/ExamResult');
    const LiveClass            = require('../models/LiveClass');
    const Payment              = require('../models/Payment');

    // Run all queries in parallel for speed
    const [
      enrollments,
      submissions,
      quizResults,
      examResults,
      student,
      payments,
    ] = await Promise.all([
      // Active subject enrollments
      Enrollment.find({ student: sid, status: 'active' })
        .populate('subject', 'name code gradeLevel category price isActive')
        .sort({ enrolledAt: -1 })
        .lean(),

      // All assignment submissions for this student
      AssignmentSubmission.find({ student: sid })
        .populate({
          path: 'assignment',
          select: 'title description dueDate totalMarks status subject gradeLevel',
          populate: { path: 'subject', select: 'name code' },
        })
        .sort({ submittedAt: -1 })
        .lean(),

      // Quiz results
      QuizResult.find({ student: sid })
        .populate({
          path: 'quiz',
          select: 'title totalMarks passMark passMarkPercent subject gradeLevel',
          populate: { path: 'subject', select: 'name code' },
        })
        .sort({ createdAt: -1 })
        .lean(),

      // Exam results
      ExamResult.find({ student: sid })
        .populate({
          path: 'exam',
          select: 'title totalMarks passMark passMarkPercent subject gradeLevel duration',
          populate: { path: 'subject', select: 'name code' },
        })
        .sort({ submittedAt: -1 })
        .lean(),

      // Student profile
      Student.findById(sid).select(
        'firstName lastName email userId gradeLevel profilePicture isActive isVerified username bio phone createdAt'
      ).lean(),

      // Payment history (exclude raw Chapa data)
      Payment.find({ student: sid })
        .populate('subject', 'name code gradeLevel')
        .select('-_chapaRaw')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    if (!student) return next(new AppError('Student not found', 404));

    // Live classes for the student's enrolled subjects
    const enrolledSubjectIds = enrollments.map((e) => e.subject?._id).filter(Boolean);
    const liveClasses = enrolledSubjectIds.length
      ? await LiveClass.find({ subject: { $in: enrolledSubjectIds } })
          .select('title subject scheduledAt duration status platform meetingLink recordingUrl gradeLevel')
          .populate('subject', 'name code')
          .sort({ scheduledAt: -1 })
          .limit(30)
          .lean()
      : [];

    // ── Summary stats ────────────────────────────────────────────────────────
    const gradedSubmissions = submissions.filter((s) => s.marks !== null && s.marks !== undefined);
    const totalAssignmentMarks = gradedSubmissions.reduce((sum, s) => sum + (s.assignment?.totalMarks || 0), 0);
    const earnedAssignmentMarks = gradedSubmissions.reduce((sum, s) => sum + (s.marks || 0), 0);

    const totalQuizMarks  = quizResults.reduce((sum, r) => sum + (r.totalMarks || 0), 0);
    const earnedQuizMarks = quizResults.reduce((sum, r) => sum + (r.score   || 0), 0);

    const totalExamMarks  = examResults.reduce((sum, r) => sum + (r.totalMarks || 0), 0);
    const earnedExamMarks = examResults.reduce((sum, r) => sum + (r.score   || 0), 0);

    const overallTotal  = totalAssignmentMarks + totalQuizMarks + totalExamMarks;
    const overallEarned = earnedAssignmentMarks + earnedQuizMarks + earnedExamMarks;
    const overallPct    = overallTotal > 0 ? Math.round((overallEarned / overallTotal) * 100) : null;

    const totalAmountPaid = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        student,
        summary: {
          enrollments:        enrollments.length,
          assignmentsTotal:   submissions.length,
          assignmentsGraded:  gradedSubmissions.length,
          quizzesAttempted:   quizResults.length,
          examsAttempted:     examResults.length,
          liveClassesTotal:   liveClasses.length,
          paymentsTotal:      payments.length,
          amountPaid:         totalAmountPaid,
          overallScore:       overallTotal > 0 ? `${overallEarned}/${overallTotal}` : null,
          overallPercent:     overallPct,
        },
        enrollments,
        assignments: submissions,
        quizzes:     quizResults,
        exams:       examResults,
        liveClasses,
        payments,
      },
    });
  } catch (err) {
    next(err);
  }
};
