const mongoose = require('mongoose');
const { GRADE_LEVELS } = require('../constants/grades');

/**
 * A home-tutoring subject that an admin creates.
 * Students browse these subjects and book sessions.
 */
const HomeTutoringSubjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    gradeLevel: {
      type: String,
      required: [true, 'Grade level is required'],
      enum: GRADE_LEVELS,
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Price per hour is required'],
      min: [0, 'Price cannot be negative'],
    },
    currency: { type: String, default: 'ETB' },
    description: { type: String, default: '', trim: true },
    // Short outcome bullets shown on the card
    outcomes: { type: [String], default: [] },
    // e.g. 'STEM', 'Languages', 'Arts', 'Social Studies'
    category: { type: String, default: 'General', trim: true },
    // Max sessions per day for this subject (capacity planning)
    maxStudentsPerDay: { type: Number, default: 5, min: 1 },
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    // Optional cover image URL
    imageUrl: { type: String, default: null },
  },
  { timestamps: true, collection: 'home_tutoring_subjects' }
);

// Compound index: same subject name allowed in different grade levels,
// but not duplicated within the same grade.
HomeTutoringSubjectSchema.index({ name: 1, gradeLevel: 1 }, { unique: true });

module.exports = mongoose.model('HomeTutoringSubject', HomeTutoringSubjectSchema);
