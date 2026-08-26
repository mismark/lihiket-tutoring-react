const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    student:    { type: mongoose.Schema.Types.ObjectId, ref: 'Student',    required: true },
    text:       { type: String, default: '' },
    fileUrl:    { type: String, default: null },
    fileName:   { type: String, default: null },
    fileSize:   { type: Number, default: 0 },
    marks:      { type: Number, default: null },     // null = not graded yet
    feedback:   { type: String, default: '' },
    status:     { type: String, enum: ['submitted','graded','returned'], default: 'submitted' },
    late:       { type: Boolean, default: false },
    submittedAt:{ type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'assignmentsubmissions' }
);

SubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('AssignmentSubmission', SubmissionSchema);
