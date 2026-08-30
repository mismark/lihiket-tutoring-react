const mongoose = require('mongoose');

const QuizQuestionSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  marks:    { type: Number, default: 1 },
}, { _id: false });

const QuizSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true, trim: true },
    description:  { type: String, default: '', trim: true },
    subject:      { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
    gradeLevel:   { type: String, default: '' },
    questions:    { type: [QuizQuestionSchema], default: [] },
    duration:     { type: Number, default: 15 },  // minutes
    totalMarks:   { type: Number, default: 0 },
    passMark:     { type: Number, default: 0 },   // absolute marks (computed from passMarkPercent)
    passMarkPercent: { type: Number, default: 50, min: 0, max: 100 }, // percentage (0-100)
    allowRetake:  { type: Boolean, default: true },
    showAnswers:  { type: Boolean, default: true },
    status:       { type: String, enum: ['draft','published','closed'], default: 'draft' },
    createdBy:    { type: mongoose.Schema.Types.ObjectId, refPath: 'createdByModel', required: true },
    createdByModel: { type: String, enum: ['Admin','Teacher'], required: true },
  },
  { timestamps: true, collection: 'quizzes' }
);

module.exports = mongoose.model('Quiz', QuizSchema);
