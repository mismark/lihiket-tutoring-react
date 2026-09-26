const mongoose = require('mongoose');
const { GRADE_LEVELS } = require('../constants/grades');

/**
 * A student's booking for a specific home-tutoring subject.
 * Created when a student (or guest) books a session from the subject catalogue.
 */
const HomeTutoringBookingSchema = new mongoose.Schema(
  {
    // ── Subject being booked ────────────────────────────────────────────────
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HomeTutoringSubject',
      required: true,
    },
    // Snapshot fields stored at booking time (so subject edits don't affect old records)
    subjectName:  { type: String, required: true },
    gradeLevel:   { type: String, required: true, enum: GRADE_LEVELS },
    pricePerHour: { type: Number, required: true },
    currency:     { type: String, default: 'ETB' },

    // ── Who booked ──────────────────────────────────────────────────────────
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null, // null = guest booking
    },
    fullName: { type: String, required: true, trim: true },
    email:    { type: String, required: true, trim: true, lowercase: true },
    phone:    { type: String, required: true, trim: true },

    // ── Scheduling ──────────────────────────────────────────────────────────
    hoursPerWeek:      { type: Number, default: 4, min: 1, max: 40 },
    preferredSchedule: { type: String, default: '' },
    startDate:         { type: Date,   default: null },

    // ── Location ────────────────────────────────────────────────────────────
    address:  { type: String, required: true, trim: true },
    city:     { type: String, default: '',    trim: true },
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    mapLink:  { type: String, default: null },

    // ── Status & admin management ───────────────────────────────────────────
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

    // Optional student message
    message: { type: String, default: '' },
  },
  { timestamps: true, collection: 'home_tutoring_bookings' }
);

HomeTutoringBookingSchema.index({ student: 1, createdAt: -1 });
HomeTutoringBookingSchema.index({ subject: 1, status: 1 });
HomeTutoringBookingSchema.index({ status: 1, gradeLevel: 1 });

module.exports = mongoose.model('HomeTutoringBooking', HomeTutoringBookingSchema);
