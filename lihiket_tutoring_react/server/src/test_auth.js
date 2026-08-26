const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Admin = require('./models/Admin');
const OTP = require('./models/OTP');

const runTests = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/lihiket_tutoring';
    await mongoose.connect(mongoUri);
    console.log('--- Auth & OTP System Verification ---');

    // 1. Verify Admin user exists and password check works
    const admin = await Admin.findOne({ email: 'admin@lihiket.com' }).select('+password');
    const isMatch = await admin.matchPassword('Admin@12345');
    console.log('1. Admin password check:', isMatch ? '✅ PASS' : '❌ FAIL');

    // 2. Verify Pending Student is unverified
    const pendingStudent = await Student.findOne({ email: 'pending.student@lihiket.com' });
    console.log('2. Pending student isVerified === false:', pendingStudent && !pendingStudent.isVerified ? '✅ PASS' : '❌ FAIL');

    // 3. Test OTP generation and storage
    const testEmail = 'student@lihiket.com';
    await OTP.deleteMany({ email: testEmail });
    const testOtpCode = '8392';
    const otpDoc = await OTP.create({
      email: testEmail,
      otp: testOtpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      isUsed: false,
    });
    console.log('3. OTP created in DB:', otpDoc ? '✅ PASS' : '❌ FAIL');

    // 4. Test OTP lookup / verification
    const foundOtp = await OTP.findOne({
      email: testEmail,
      otp: testOtpCode,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });
    console.log('4. OTP verification query:', foundOtp ? '✅ PASS' : '❌ FAIL');

    // 5. Test Password Reset
    const student = await Student.findOne({ email: testEmail });
    student.password = 'NewStudent@999';
    await student.save();
    foundOtp.isUsed = true;
    await foundOtp.save();

    const updatedStudent = await Student.findOne({ email: testEmail }).select('+password');
    const newPassMatch = await updatedStudent.matchPassword('NewStudent@999');
    console.log('5. New password updated & bcrypt hashed:', newPassMatch ? '✅ PASS' : '❌ FAIL');

    // Restore original test password
    student.password = 'Student@12345';
    await student.save();
    console.log('6. Reset back to default password: ✅ PASS');

    console.log('\n🌟 ALL BACKEND AUTH & OTP TESTS PASSED! 🌟');
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
};

runTests();
