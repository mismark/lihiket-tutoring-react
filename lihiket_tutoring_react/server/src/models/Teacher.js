const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const baseUserFields = require('./base/baseUserFields');

const TeacherSchema = new mongoose.Schema(
  {
    ...baseUserFields,
    role:               { type: String, default: 'teacher' },
    specializedSubject: { type: String, required: [true, 'Specialized subject is required'], trim: true },
    cvDocument:         { type: String, default: null },      // file path
    qualifications:     { type: String, default: '' },
    experience:         { type: Number, default: 0 },         // years
    assignedSubjects:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  },
  { timestamps: true, collection: 'teachers' }
);

TeacherSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

TeacherSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

TeacherSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Teacher', TeacherSchema);
