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
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from creation
      index: { expires: '10m' },
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, collection: 'otps' }
);

module.exports = mongoose.model('OTP', OTPSchema);
