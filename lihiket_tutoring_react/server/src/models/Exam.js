const mongoose = require('mongoose');

const ExamQuestionSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  marks:    { type: Number, default: 1 },
}, { _id: false });

const ExamSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true, trim: true },
    description:  { type: String, default: '', trim: true },
    instructions: { type: String, default: '', trim: true },
    subject:      { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
    gradeLevel:   { type: String, default: '' },
    questions:    { type: [ExamQuestionSchema], default: [] },
    duration:     { type: Number, default: 60 },   // minutes
    totalMarks:   { type: Number, default: 0 },
    passMark:     { type: Number, default: 0 },
    status:       { type: String, enum: ['draft','published','closed'], default: 'draft' },
    startTime:    { type: Date, default: null },
    endTime:      { type: Date, default: null },
    createdBy:    { type: mongoose.Schema.Types.ObjectId, refPath: 'createdByModel', required: true },
    createdByModel: { type: String, enum: ['Admin','Teacher'], required: true },
    allowReview:  { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'exams' }
);

module.exports = mongoose.model('Exam', ExamSchema);
