const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  answer:   { type: String, default: '' },
  isCorrect:{ type: Boolean, default: false },
  marks:    { type: Number, default: 0 },
}, { _id: false });

const ExamResultSchema = new mongoose.Schema(
  {
    exam:       { type: mongoose.Schema.Types.ObjectId, ref: 'Exam',    required: true },
    student:    { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    answers:    { type: [AnswerSchema], default: [] },
    score:      { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    passed:     { type: Boolean, default: false },
    submittedAt:{ type: Date, default: Date.now },
    timeTaken:  { type: Number, default: 0 }, // seconds
  },
  { timestamps: true, collection: 'examresults' }
);

ExamResultSchema.index({ exam: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('ExamResult', ExamResultSchema);
