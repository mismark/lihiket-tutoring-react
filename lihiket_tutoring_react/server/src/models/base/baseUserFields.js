const mongoose = require('mongoose');

/**
 * Shared fields reused across Admin, Teacher, Student, Parent models.
 * Import and spread into each schema definition.
 */
const baseUserFields = {
  firstName:        { type: String, required: [true, 'First name is required'], trim: true },
  lastName:         { type: String, required: [true, 'Last name is required'],  trim: true },
  username:         { type: String, required: [true, 'Username is required'],   trim: true, unique: true, lowercase: true },
  email:            { type: String, required: [true, 'Email is required'],      trim: true, unique: true, lowercase: true },
  password:         { type: String, required: [true, 'Password is required'],   select: false },
  phone:            { type: String, required: [true, 'Phone number is required'] },
  profilePicture:   { type: String, default: null },
  bio:              { type: String, default: '' },
  dateOfBirth:      { type: Date,   default: null },
  address:          { type: String, default: '' },
  isVerified:       { type: Boolean, default: false },
  isActive:         { type: Boolean, default: true },
  verifiedAt:       { type: Date,   default: null },
  verifiedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  passwordResetOTP: { type: String, default: null, select: false },
  otpExpires:       { type: Date,   default: null, select: false },
};

module.exports = baseUserFields;
