const mongoose = require('mongoose');

/**
 * Payment record — created when a student initiates payment.
 * Tracks the full lifecycle: pending → paid / failed / refunded.
 *
 * Chapa handles the actual routing to Telebirr, CBE, BOA, Dashen,
 * Mpesa, cards, etc. We store the method they chose so we can
 * show it in payment history.
 */
const PaymentSchema = new mongoose.Schema(
  {
    // Who paid
    student:     { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },

    // What they paid for
    subject:     { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    enrollment:  { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment' },

    // Transaction identifiers
    txRef:       { type: String, required: true, unique: true, index: true },
    chapaRef:    { type: String, default: null },   // Chapa's own reference (from verify response)

    // Money
    amount:      { type: Number, required: true },
    currency:    { type: String, default: 'ETB' },

    // Payment method chosen on Chapa checkout
    // Chapa normalises these: 'telebirr' | 'cbebirr' | 'boa' | 'dashen_bank' |
    //   'abyssinia_bank' | 'mpesa' | 'card' | 'hello_cash' | 'ebirr' | 'other'
    paymentMethod: { type: String, default: null },

    // Status
    status: {
      type:    String,
      enum:    ['pending', 'paid', 'failed', 'refunded', 'cancelled'],
      default: 'pending',
      index:   true,
    },

    // Timestamps from Chapa
    paidAt:     { type: Date, default: null },
    failedAt:   { type: Date, default: null },

    // Raw Chapa verify response (stored for auditing, never exposed to clients)
    _chapaRaw:  { type: mongoose.Schema.Types.Mixed, select: false },

    // IP of the student when they initiated (for fraud detection / audit)
    initiatedFrom: { type: String, default: null },
  },
  { timestamps: true }
);

// Compound index for student payment history
PaymentSchema.index({ student: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', PaymentSchema);
