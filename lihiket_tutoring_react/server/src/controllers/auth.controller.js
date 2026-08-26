const bcrypt = require('bcryptjs');
const Student  = require('../models/Student');
const Teacher  = require('../models/Teacher');
const Parent   = require('../models/Parent');
const Admin    = require('../models/Admin');
const OTP      = require('../models/OTP');
const AppError = require('../utils/AppError');
const generateToken = require('../utils/generateToken');
const generateOTP   = require('../utils/generateOTP');
const sendEmail     = require('../utils/sendEmail');
const notify        = require('../utils/notify');
const { EVENTS }    = require('../constants/events');

// ─── Model map ───────────────────────────────────────────────────────────
const MODEL_MAP = {
  student: { Model: Student, collection: 'students' },
  teacher: { Model: Teacher, collection: 'teachers' },
  parent:  { Model: Parent,  collection: 'parents'  },
  admin:   { Model: Admin,   collection: 'admins'   },
};

const ALL_MODELS = [
  { model: Student, role: 'student', col: 'students' },
  { model: Teacher, role: 'teacher', col: 'teachers' },
  { model: Parent,  role: 'parent',  col: 'parents'  },
  { model: Admin,   role: 'admin',   col: 'admins'   },
];

// ─── POST /api/auth/register ──────────────────────────────────────────────────
exports.register = async (req, res) => {
  const {
    role, firstName, lastName, username, email, password,
    phone, gradeLevel, specializedSubject, qualifications,
    experience, parentFullName, parentEmail, parentPhone, parentCountry,
    country,
  } = req.body;

  // Validate role
  if (!role || !['student', 'teacher', 'parent'].includes(role)) {
    throw new AppError('Role must be student, teacher, or parent.', 400);
  }

  if (!email || !password || !firstName || !lastName || !username || !phone) {
    throw new AppError('Please fill in all required fields.', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim().toLowerCase();

  const { Model } = MODEL_MAP[role];

  // Check duplicate email across all 4 collections
  const [existsInStudents, existsInTeachers, existsInParents, existsInAdmins] =
    await Promise.all([
      Student.findOne({ email: normalizedEmail }),
      Teacher.findOne({ email: normalizedEmail }),
      Parent.findOne({ email: normalizedEmail }),
      Admin.findOne({ email: normalizedEmail }),
    ]);

  if (existsInStudents || existsInTeachers || existsInParents || existsInAdmins) {
    throw new AppError('An account with this email already exists.', 409);
  }

  // Check duplicate username across all 4 collections
  const [uStudent, uTeacher, uParent, uAdmin] = await Promise.all([
    Student.findOne({ username: normalizedUsername }),
    Teacher.findOne({ username: normalizedUsername }),
    Parent.findOne({ username: normalizedUsername }),
    Admin.findOne({ username: normalizedUsername }),
  ]);

  if (uStudent || uTeacher || uParent || uAdmin) {
    throw new AppError('Username is already taken. Please choose another.', 409);
  }

  // Build user data
  const userData = {
    firstName: firstName.trim(),
    lastName:  lastName.trim(),
    username:  normalizedUsername,
    email:     normalizedEmail,
    password,
    phone:     phone.trim(),
    isVerified: false,
    isActive:   true,
  };

  // Role-specific fields
  if (role === 'student') {
    if (!gradeLevel) throw new AppError('Grade level is required for students.', 400);
    Object.assign(userData, {
      gradeLevel,
      parentFullName: parentFullName ? parentFullName.trim() : '',
      parentEmail:    parentEmail ? parentEmail.trim().toLowerCase() : '',
      parentPhone:    parentPhone ? parentPhone.trim() : '',
      parentCountry:  parentCountry ? parentCountry.trim() : '',
    });
  }

  if (role === 'teacher') {
    if (!specializedSubject) throw new AppError('Specialized subject is required for teachers.', 400);
    Object.assign(userData, {
      specializedSubject: specializedSubject.trim(),
      qualifications:     qualifications ? qualifications.trim() : '',
      experience:         Number(experience) || 0,
      cvDocument:         req.file ? req.file.path : null,
    });
  }

  if (role === 'parent') {
    Object.assign(userData, { country: country ? country.trim() : '' });
  }

  // Create user (password hashed in pre-save hook)
  const user = await Model.create(userData);

  // Auto-link student to parent if parentEmail provided and parent exists
  if (role === 'student' && userData.parentEmail) {
    try {
      const parentRecord = await Parent.findOne({ email: userData.parentEmail });
      if (parentRecord && !parentRecord.children.includes(user._id)) {
        parentRecord.children.push(user._id);
        await parentRecord.save();
      }
    } catch (linkErr) {
      console.error('Parent auto-link error:', linkErr.message);
    }
  }

  // Notify all admins about new registration
  try {
    const admins = await Admin.find({ isActive: true }).select('_id');
    const notifyPromises = admins.map((admin) =>
      notify({
        userId:    admin._id,
        userModel: 'Admin',
        type:      EVENTS.NEW_REGISTRATION,
        title:     'New User Registration',
        message:   `New ${role} registration pending review: ${userData.firstName} ${userData.lastName} (${userData.email})`,
        link:      `/admin/pending-users`,
      })
    );
    await Promise.allSettled(notifyPromises);
  } catch (notifyErr) {
    console.error('Error notifying admins:', notifyErr.message);
  }

  res.status(201).json({
    success: true,
    message: 'Registration submitted successfully. Your account is awaiting admin approval.',
    data: {
      id:        user._id,
      firstName: user.firstName,
      lastName:  user.lastName,
      username:  user.username,
      email:     user.email,
      role:      user.role,
      isVerified: user.isVerified,
    },
  });
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required.', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Search across all collections
  let user = null;
  let collection = null;

  for (const item of ALL_MODELS) {
    const found = await item.model.findOne({ email: normalizedEmail }).select('+password');
    if (found) {
      user = found;
      collection = item.col;
      break;
    }
  }

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (!user.isVerified) {
    return res.status(403).json({
      success: false,
      code: 'ACCOUNT_PENDING',
      message: 'Your account is pending admin verification. You will be able to log in once approved.',
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      code: 'ACCOUNT_DEACTIVATED',
      message: 'Your account has been deactivated. Please contact platform support.',
    });
  }

  const token = generateToken({ id: user._id, role: user.role, collection });

  res.json({
    success: true,
    message: 'Login successful.',
    data: {
      token,
      user: {
        id:             user._id,
        firstName:      user.firstName,
        lastName:       user.lastName,
        username:       user.username,
        email:          user.email,
        role:           user.role,
        profilePicture: user.profilePicture,
        gradeLevel:     user.gradeLevel,
        specializedSubject: user.specializedSubject,
      },
    },
  });
};

// ─── POST /api/auth/forgot-password ───────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    throw new AppError('Please provide a valid email address.', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check if user exists in any of the 4 collections
  let userExists = false;
  let userFound = null;

  for (const item of ALL_MODELS) {
    const found = await item.model.findOne({ email: normalizedEmail });
    if (found) {
      userExists = true;
      userFound = found;
      break;
    }
  }

  if (!userExists) {
    throw new AppError('No account found with this email address.', 404);
  }

  // Generate 4-digit OTP code
  const otpCode = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Invalidate any active OTPs for this email
  await OTP.deleteMany({ email: normalizedEmail });

  // Store new OTP
  await OTP.create({
    email: normalizedEmail,
    otp: otpCode,
    expiresAt,
    isUsed: false,
  });

  // Send email with OTP
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #1e3a8a; margin: 0;">Lihiket Tutoring</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Password Reset Request</p>
      </div>
      <p style="color: #334155; font-size: 15px;">Hello <strong>${userFound.firstName}</strong>,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
        You recently requested to reset your password for your Lihiket account. Use the 4-digit verification code below to proceed:
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <span style="display: inline-block; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #2563eb; background: #eff6ff; padding: 14px 28px; border-radius: 12px; border: 2px dashed #93c5fd;">
          ${otpCode}
        </span>
      </div>
      <p style="color: #64748b; font-size: 13px; text-align: center;">
        This code is valid for <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
        © ${new Date().getFullYear()} Lihiket Online Tutoring Platform. All rights reserved.
      </p>
    </div>
  `;

  await sendEmail({
    to: normalizedEmail,
    toName: `${userFound.firstName} ${userFound.lastName}`,
    subject: `Your Lihiket Password Reset OTP: ${otpCode}`,
    html,
    text: `Your Lihiket password reset OTP is: ${otpCode}. It expires in 10 minutes.`,
  });

  res.json({
    success: true,
    message: `A 4-digit OTP has been sent to ${normalizedEmail}.`,
    data: { email: normalizedEmail },
  });
};

// ─── POST /api/auth/verify-otp ────────────────────────────────────────────────
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new AppError('Email and 4-digit OTP code are required.', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedOTP = String(otp).trim();

  const record = await OTP.findOne({
    email: normalizedEmail,
    otp: normalizedOTP,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });

  if (!record) {
    throw new AppError('Invalid or expired OTP code. Please request a new one.', 400);
  }

  res.json({
    success: true,
    message: 'OTP verified successfully.',
    data: { email: normalizedEmail, valid: true },
  });
};

// ─── POST /api/auth/set-new-password ──────────────────────────────────────────
exports.setNewPassword = async (req, res) => {
  const { email, otp, password } = req.body;

  if (!email || !otp || !password) {
    throw new AppError('Email, OTP, and new password are required.', 400);
  }

  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters long.', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedOTP = String(otp).trim();

  // Validate OTP
  const record = await OTP.findOne({
    email: normalizedEmail,
    otp: normalizedOTP,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });

  if (!record) {
    throw new AppError('Invalid or expired verification session. Please restart password reset.', 400);
  }

  // Find user across all 4 collections
  let targetUser = null;
  for (const item of ALL_MODELS) {
    const found = await item.model.findOne({ email: normalizedEmail });
    if (found) {
      targetUser = found;
      break;
    }
  }

  if (!targetUser) {
    throw new AppError('User account not found.', 404);
  }

  // Update password (triggers bcrypt hash in pre-save hook)
  targetUser.password = password;
  await targetUser.save();

  // Mark OTP as used
  record.isUsed = true;
  await record.save();

  // Clean up old OTPs for this email
  await OTP.deleteMany({ email: normalizedEmail });

  res.json({
    success: true,
    message: 'Your password has been reset successfully. You can now sign in with your new password.',
  });
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.json({
    success: true,
    data: {
      id:                 req.user._id,
      firstName:          req.user.firstName,
      lastName:           req.user.lastName,
      username:           req.user.username,
      email:              req.user.email,
      phone:              req.user.phone,
      role:               req.user.role,
      profilePicture:     req.user.profilePicture,
      bio:                req.user.bio,
      address:            req.user.address,
      dateOfBirth:        req.user.dateOfBirth,
      isVerified:         req.user.isVerified,
      isActive:           req.user.isActive,
      gradeLevel:         req.user.gradeLevel,
      parentFullName:     req.user.parentFullName,
      parentEmail:        req.user.parentEmail,
      parentPhone:        req.user.parentPhone,
      parentCountry:      req.user.parentCountry,
      specializedSubject: req.user.specializedSubject,
      qualifications:     req.user.qualifications,
      experience:         req.user.experience,
      cvDocument:         req.user.cvDocument,
      assignedSubjects:   req.user.assignedSubjects,
      country:            req.user.country,
      createdAt:          req.user.createdAt,
    },
  });
};

// ─── PUT /api/auth/profile ────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  const PROTECTED = ['password', 'isVerified', 'verifiedAt', 'verifiedBy',
                     'passwordResetOTP', 'otpExpires', 'role'];
  PROTECTED.forEach(f => delete req.body[f]);

  // Uniqueness checks if email or username is changing
  if (req.body.email) {
    const normalized = req.body.email.trim().toLowerCase();
    const [t, s, p, a] = await Promise.all([
      Teacher.findOne({ email: normalized, _id: { $ne: req.user._id } }),
      Student.findOne({ email: normalized, _id: { $ne: req.user._id } }),
      Parent.findOne({  email: normalized, _id: { $ne: req.user._id } }),
      Admin.findOne({   email: normalized, _id: { $ne: req.user._id } }),
    ]);
    if (t || s || p || a) throw new AppError('Email is already in use by another account.', 409);
    req.body.email = normalized;
  }

  if (req.body.username) {
    const normalized = req.body.username.trim().toLowerCase();
    const [t, s, p, a] = await Promise.all([
      Teacher.findOne({ username: normalized, _id: { $ne: req.user._id } }),
      Student.findOne({ username: normalized, _id: { $ne: req.user._id } }),
      Parent.findOne({  username: normalized, _id: { $ne: req.user._id } }),
      Admin.findOne({   username: normalized, _id: { $ne: req.user._id } }),
    ]);
    if (t || s || p || a) throw new AppError('Username is already taken.', 409);
    req.body.username = normalized;
  }

  // Pick the right model using collection stored in JWT
  const models = { admins: Admin, teachers: Teacher, students: Student, parents: Parent };
  const Model  = models[req.userCollection];
  if (!Model) throw new AppError('Invalid session. Please log in again.', 401);

  const updated = await Model.findByIdAndUpdate(
    req.user._id,
    { $set: req.body },
    { new: true, runValidators: true }
  ).select('-password');

  if (!updated) throw new AppError('User not found.', 404);

  res.json({
    success: true,
    message: 'Profile updated successfully.',
    data: updated,
  });
};

// ─── PUT /api/auth/change-password ────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new AppError('Current password, new password, and confirmation are required.', 400);
  }
  if (newPassword.length < 8) {
    throw new AppError('New password must be at least 8 characters long.', 400);
  }
  if (newPassword !== confirmPassword) {
    throw new AppError('New password and confirmation do not match.', 400);
  }
  if (currentPassword === newPassword) {
    throw new AppError('New password must be different from the current password.', 400);
  }

  const models = { admins: Admin, teachers: Teacher, students: Student, parents: Parent };
  const Model  = models[req.userCollection];
  if (!Model) throw new AppError('Invalid session. Please log in again.', 401);

  const user = await Model.findById(req.user._id).select('+password');
  if (!user) throw new AppError('User not found.', 404);

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) throw new AppError('Current password is incorrect.', 401);

  user.password = newPassword; // bcrypt hash triggered by pre-save hook
  await user.save();

  res.json({ success: true, message: 'Password changed successfully.' });
};
