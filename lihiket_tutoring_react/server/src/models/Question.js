const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  label: { type: String, required: true },   // A, B, C, D
  text:  { type: String, required: true },
}, { _id: false });

const QuestionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['multiple_choice', 'true_false', 'short_answer', 'essay'],
      default: 'multiple_choice',
    },
    options: {
      type: [OptionSchema],
      default: [],
      // Required for multiple_choice; ignored for others
    },
    correctAnswer: {
      type: String,
      required: [true, 'Correct answer is required'],
      trim: true,
      // For multiple_choice: option label e.g. "A"
      // For true_false: "True" or "False"
      // For short_answer / essay: model answer text
    },
    explanation: {
      type: String,
      default: '',
      trim: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      default: null,
    },
    gradeLevel: {
      type: String,
      default: '',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    tags: {
      type: [String],
      default: [],
    },
    marks: {
      type: Number,
      default: 1,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'createdByModel',
      required: true,
    },
    createdByModel: {
      type: String,
      enum: ['Admin', 'Teacher'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, collection: 'questions' }
);

// Text index for fast search
QuestionSchema.index({ text: 'text', tags: 'text' });
QuestionSchema.index({ subject: 1, gradeLevel: 1, difficulty: 1, type: 1 });

module.exports = mongoose.model('Question', QuestionSchema);
