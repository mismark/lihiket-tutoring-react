const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Admin = require('./models/Admin');
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');
const Parent = require('./models/Parent');

const seedUsers = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/lihiket_tutoring';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully for seeding.');

    // 1. Seed Super Admin
    await Admin.deleteMany({ email: 'admin@lihiket.com' });
    const admin = await Admin.create({
      firstName: 'Super',
      lastName: 'Admin',
      username: 'superadmin',
      email: 'admin@lihiket.com',
      password: 'Admin@12345',
      phone: '+251 911 000 001',
      role: 'admin',
      isVerified: true,
      isActive: true,
      permissions: ['manage_users', 'manage_courses', 'manage_subjects', 'view_analytics'],
    });
    console.log('✅ Super Admin created: admin@lihiket.com / Admin@12345');

    // 2. Seed Verified Teacher
    await Teacher.deleteMany({ email: 'teacher@lihiket.com' });
    const teacher = await Teacher.create({
      firstName: 'Dr. Michael',
      lastName: 'Kebede',
      username: 'teacher.michael',
      email: 'teacher@lihiket.com',
      password: 'Teacher@12345',
      phone: '+251 911 000 002',
      role: 'teacher',
      specializedSubject: 'Mathematics',
      qualifications: 'PhD in Pure & Applied Mathematics',
      experience: 10,
      isVerified: true,
      isActive: true,
    });
    console.log('✅ Verified Teacher created: teacher@lihiket.com / Teacher@12345');

    // 3. Seed Verified Student
    await Student.deleteMany({ email: 'student@lihiket.com' });
    const student = await Student.create({
      firstName: 'Selam',
      lastName: 'Alemu',
      username: 'student.selam',
      email: 'student@lihiket.com',
      password: 'Student@12345',
      phone: '+251 911 000 003',
      role: 'student',
      gradeLevel: 'G12',
      parentFullName: 'Alemu Tadesse',
      parentPhone: '+251 911 000 004',
      isVerified: true,
      isActive: true,
    });
    console.log('✅ Verified Student created: student@lihiket.com / Student@12345');

    // 4. Seed Verified Parent
    await Parent.deleteMany({ email: 'parent@lihiket.com' });
    const parent = await Parent.create({
      firstName: 'Alemu',
      lastName: 'Tadesse',
      username: 'parent.alemu',
      email: 'parent@lihiket.com',
      password: 'Parent@12345',
      phone: '+251 911 000 004',
      role: 'parent',
      country: 'Ethiopia',
      children: [student._id],
      isVerified: true,
      isActive: true,
    });
    console.log('✅ Verified Parent created: parent@lihiket.com / Parent@12345');

    // 5. Seed Pending (Unverified) Student for verification testing
    await Student.deleteMany({ email: 'pending.student@lihiket.com' });
    await Student.create({
      firstName: 'Dawit',
      lastName: 'Haile',
      username: 'dawit.pending',
      email: 'pending.student@lihiket.com',
      password: 'Student@12345',
      phone: '+251 911 000 005',
      role: 'student',
      gradeLevel: 'G11',
      isVerified: false,
      isActive: true,
    });
    console.log('✅ Pending Student created (Unverified): pending.student@lihiket.com / Student@12345');

    console.log('\n🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedUsers();
