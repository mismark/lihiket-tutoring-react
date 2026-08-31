/** Returns a secure 6-digit OTP as a zero-padded string */
const crypto = require('crypto');

const generateOTP = () => {
  // Use crypto.randomInt for cryptographically secure OTP
  const otp = crypto.randomInt(100000, 999999);
  return String(otp);
};

module.exports = generateOTP;
