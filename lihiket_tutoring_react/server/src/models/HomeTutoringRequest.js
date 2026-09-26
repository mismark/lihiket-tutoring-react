const mongoose = require('mongoose');
const { GRADE_LEVELS } = require('../constants/grades');

/**
 * Home Tutoring Request
 * Created when a student (or anonymous visitor) books a home tutor.
 * Stores contact info, grade level, location (address + optional GPS coords),
 * preferred subjects, scheduling preferences, and admin-managed status.
 */
const HomeTutoringRequestSchema = new mongoose.Schema(
  {
    // ── Requester info ─────────────────────────────────────────────────────────
    // If the student is logged in, link to their account; otherwise null
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
    },

    // Contact details (required whether logged-in or not)
    fullName:  { type: String, required: [true, 'Full name is required'],   trim: true },
    email:     { type: String, required: [true, 'Email is required'],       trim: true, lowercase: true },
    phone:     { type: String, required: [true, 'Phone number is required'], trim: true },

    // ── Academic info ──────────────────────────────────────────────────────────
    gradeLevel: {
      type: String,
      required: [true, 'Grade level is required'],
      enum: GRADE_LEVELS,
    },
    subjects: {
      type: [String],   // e.g. ['Mathematics', 'Physics']
      default: [],
    },

    // ── Scheduling ─────────────────────────────────────────────────────────────
    // How many hours per week the student wants
    hoursPerWeek: { type: Number, default: 4, min: 1, max: 40 },
    // Preferred days / time slot in free text (e.g. "Mon/Wed afternoons")
    preferredSchedule: { type: String, default: '' },
    // When they want to start
    startDate: { type: Date, default: null },

    // ── Location ───────────────────────────────────────────────────────────────
    // Human-readable address
    address: { type: String, required: [true, 'Address is required'], trim: true },
    // Optional city / sub-city for quick grouping
    city:    { type: String, default: '', trim: true },
    // GPS coordinates from browser Geolocation API
    location: {
      lat:  { type: Number, default: null },
      lng:  { type: Number, default: null },
    },
    // Optional shareable Google Maps link auto-built on the client
    mapLink: { type: String, default: null },

    // ── Pricing snapshot ───────────────────────────────────────────────────────
    // Stored at booking time so price changes don't affect old records
    pricePerHour: { type: Number, required: true, min: 0 },
    currency:     { type: String, default: 'ETB' },

    // ── Admin management ───────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'confirmed', 'assigned', 'cancelled', 'completed'],
      default: 'pending',
      index: true,
    },
    // Which teacher was assigned (optional — admin sets this)
    assignedTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      default: null,
    },
    // Admin notes (internal, not visible to students)
    adminNotes: { type: String, default: '' },

    // ── Extras ────────────────────────────────────────────────────────────────
    message: { type: String, default: '' }, // student's optional message
  },
  { timestamps: true, collection: 'home_tutoring_requests' }
);

// Index for quick look-ups by student and by status
HomeTutoringRequestSchema.index({ student: 1, createdAt: -1 });
HomeTutoringRequestSchema.index({ status: 1, gradeLevel: 1 });

module.exports = mongoose.model('HomeTutoringRequest', HomeTutoringRequestSchema);
