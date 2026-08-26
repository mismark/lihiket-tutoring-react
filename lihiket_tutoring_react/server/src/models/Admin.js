const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const baseUserFields = require('./base/baseUserFields');

const AdminSchema = new mongoose.Schema(
  {
    ...baseUserFields,
    role:        { type: String, default: 'admin' },
    permissions: { type: [String], default: ['manage_users', 'manage_courses'] },
    // Admins are always verified — override the default
    isVerified:  { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'admins' }
);

AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

AdminSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

AdminSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Admin', AdminSchema);
