const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    otp: {
      type: String,
      required: [true, 'OTP is required'],
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      index: { expireAfterSeconds: 0 }, // TTL: delete document AT expiresAt time
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, collection: 'otps' }
);

module.exports = mongoose.model('OTP', OTPSchema);
