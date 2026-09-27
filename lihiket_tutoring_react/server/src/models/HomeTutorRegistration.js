const mongoose = require('mongoose');
const { GRADE_LEVELS } = require('../constants/grades');

/**
 * A student (or parent) registering for home tutoring.
 * No subject reference needed — admin assigns a tutor after reviewing.
 */
const HomeTutorRegistrationSchema = new mongoose.Schema(
  {
    // ── Student account link (optional — guests can register too) ───────────
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
    },

    // ── Personal details ────────────────────────────────────────────────────
    fullName: { type: String, required: [true, 'Full name is required'], trim: true },
    age:      { type: Number, required: [true, 'Age is required'], min: 3, max: 100 },
    sex:      {
      type: String,
      required: [true, 'Sex is required'],
      enum: ['male', 'female', 'other'],
    },
    email:    { type: String, required: [true, 'Email is required'], trim: true, lowercase: true },
    phone:    { type: String, required: [true, 'Phone is required'], trim: true },

    // ── Academic ────────────────────────────────────────────────────────────
    gradeLevel: {
      type: String,
      required: [true, 'Grade level is required'],
      enum: GRADE_LEVELS,
    },
    subjects: {
      type: [String],
      default: [],             // subjects the student needs help with
    },

    // ── Scheduling preferences ──────────────────────────────────────────────
    hoursPerWeek:      { type: Number, default: 4, min: 1, max: 40 },
    preferredSchedule: { type: String, default: '' },   // e.g. "Mon/Wed afternoons"
    startDate:         { type: Date,   default: null },

    // ── Full address ────────────────────────────────────────────────────────
    city:              { type: String, required: [true, 'City is required'], trim: true },
    subcity:           { type: String, default: '', trim: true },
    street:            { type: String, default: '', trim: true },
    address:           { type: String, required: [true, 'House No. / main address is required'], trim: true },
    additionalAddress: { type: String, default: '', trim: true }, // landmark, floor, gate colour…

    // ── GPS ─────────────────────────────────────────────────────────────────
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    mapLink: { type: String, default: null },

    // ── Extra ────────────────────────────────────────────────────────────────
    message: { type: String, default: '' },

    // ── Admin management ────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'confirmed', 'assigned', 'cancelled', 'completed'],
      default: 'pending',
      index: true,
    },
    assignedTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      default: null,
    },
    adminNotes: { type: String, default: '' },
  },
  { timestamps: true, collection: 'home_tutor_registrations' }
);

HomeTutorRegistrationSchema.index({ student: 1, createdAt: -1 });
HomeTutorRegistrationSchema.index({ status: 1, gradeLevel: 1 });

module.exports = mongoose.model('HomeTutorRegistration', HomeTutorRegistrationSchema);
