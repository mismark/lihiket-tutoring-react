const mongoose = require('mongoose');
const { GRADE_LEVELS } = require('../constants/grades');

const HomeTutoringBookingSchema = new mongoose.Schema(
  {
    // ── Subject ────────────────────────────────────────────────────────────
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HomeTutoringSubject',
      required: true,
    },
    // Snapshot at booking time
    subjectName:  { type: String, required: true },
    gradeLevel:   { type: String, required: true, enum: GRADE_LEVELS },
    pricePerHour: { type: Number, required: true },
    currency:     { type: String, default: 'ETB' },

    // ── Student account (optional) ─────────────────────────────────────────
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
    },

    // ── Personal details ───────────────────────────────────────────────────
    fullName: { type: String, required: true, trim: true },
    age:      { type: Number, default: null, min: 3, max: 100 },
    sex:      { type: String, enum: ['male', 'female', 'other', ''], default: '' },
    email:    { type: String, required: true, trim: true, lowercase: true },
    phone:    { type: String, required: true, trim: true },

    // ── Scheduling ─────────────────────────────────────────────────────────
    hoursPerWeek:      { type: Number, default: 4, min: 1, max: 40 },
    preferredSchedule: { type: String, default: '' },
    startDate:         { type: Date,   default: null },

    // ── Full address ───────────────────────────────────────────────────────
    city:              { type: String, default: '', trim: true },
    subcity:           { type: String, default: '', trim: true },
    street:            { type: String, default: '', trim: true },
    address:           { type: String, required: true, trim: true }, // main address / house no
    additionalAddress: { type: String, default: '', trim: true },    // extra description / landmark

    // ── GPS ────────────────────────────────────────────────────────────────
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    mapLink: { type: String, default: null },

    // ── Admin management ───────────────────────────────────────────────────
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
    message:    { type: String, default: '' },
  },
  { timestamps: true, collection: 'home_tutoring_bookings' }
);

HomeTutoringBookingSchema.index({ student: 1, createdAt: -1 });
HomeTutoringBookingSchema.index({ subject: 1, status: 1 });
HomeTutoringBookingSchema.index({ status: 1, gradeLevel: 1 });

module.exports = mongoose.model('HomeTutoringBooking', HomeTutoringBookingSchema);
