const mongoose = require('mongoose');

const QuizAnswerSchema = new mongoose.Schema({
  question:  { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  answer:    { type: String, default: '' },
  isCorrect: { type: Boolean, default: false },
  marks:     { type: Number, default: 0 },
}, { _id: false });

const QuizResultSchema = new mongoose.Schema(
  {
    quiz:        { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz',    required: true },
    student:     { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    answers:     { type: [QuizAnswerSchema], default: [] },
    score:       { type: Number, default: 0 },
    totalMarks:  { type: Number, default: 0 },
    passed:      { type: Boolean, default: false },
    timeTaken:   { type: Number, default: 0 },
    attempt:     { type: Number, default: 1 },
  },
  { timestamps: true, collection: 'quizresults' }
);

module.exports = mongoose.model('QuizResult', QuizResultSchema);
