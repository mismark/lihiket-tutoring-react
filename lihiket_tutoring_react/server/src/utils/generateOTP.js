/** Returns a 4-digit OTP as a string */
const generateOTP = () => String(Math.floor(1000 + Math.random() * 9000));

module.exports = generateOTP;
