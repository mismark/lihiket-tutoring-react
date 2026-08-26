const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true, trim: true },
    description:  { type: String, default: '', trim: true },
    instructions: { type: String, default: '', trim: true },
    subject:      { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
    gradeLevel:   { type: String, default: '' },
    dueDate:      { type: Date, default: null },
    totalMarks:   { type: Number, default: 10 },
    allowLate:    { type: Boolean, default: false },
    attachmentUrl:  { type: String, default: null },
    attachmentName: { type: String, default: null },
    status:       { type: String, enum: ['draft','published','closed'], default: 'draft' },
    createdBy:    { type: mongoose.Schema.Types.ObjectId, refPath: 'createdByModel', required: true },
    createdByModel: { type: String, enum: ['Admin','Teacher'], required: true },
  },
  { timestamps: true, collection: 'assignments' }
);

module.exports = mongoose.model('Assignment', AssignmentSchema);
