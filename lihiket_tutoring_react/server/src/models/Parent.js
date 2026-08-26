const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const baseUserFields = require('./base/baseUserFields');

const ParentSchema = new mongoose.Schema(
  {
    ...baseUserFields,
    role:     { type: String, default: 'parent' },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    country:  { type: String, default: '' },
  },
  { timestamps: true, collection: 'parents' }
);

ParentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

ParentSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

ParentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Parent', ParentSchema);
