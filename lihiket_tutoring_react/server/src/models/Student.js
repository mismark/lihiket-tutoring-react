const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const baseUserFields = require('./base/baseUserFields');
const { GRADE_LEVELS } = require('../constants/grades');

const StudentSchema = new mongoose.Schema(
  {
    ...baseUserFields,
    role:           { type: String, default: 'student' },
    gradeLevel:     { type: String, required: [true, 'Grade level is required'], enum: GRADE_LEVELS },
    parentFullName: { type: String, default: '' },
    parentEmail:    { type: String, default: '' },
    parentPhone:    { type: String, default: '' },
    parentCountry:  { type: String, default: '' },
  },
  { timestamps: true, collection: 'students' }
);

// Hash password before save
StudentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
StudentSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

// Virtual: full name
StudentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Student', StudentSchema);
