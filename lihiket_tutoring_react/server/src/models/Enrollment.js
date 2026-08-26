const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'dropped', 'pending_payment'],
      default: 'active',
    },
    // Payment tracking
    paymentStatus: {
      type: String,
      enum: ['free', 'pending', 'paid', 'failed'],
      default: 'free',
    },
    txRef: {
      type: String,
      default: null,
      index: true,   // fast lookup on webhook/callback
    },
    paidAt: {
      type: Date,
      default: null,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, collection: 'enrollments' }
);

// One student can only have one enrollment record per subject
EnrollmentSchema.index({ student: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
