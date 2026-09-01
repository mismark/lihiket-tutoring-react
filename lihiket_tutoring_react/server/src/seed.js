/**
 * Lihiket Tutoring — Database Seeder
 *
 * Creates default admin, teacher, student, parent accounts.
 * Run: node src/seed.js
 *
 * Also supports creating ONLY admin:
 * node src/seed.js --admin-only
 */

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

const Admin   = require('./models/Admin');
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');
const Parent  = require('./models/Parent');

const adminOnly = process.argv.includes('--admin-only');

const seedUsers = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/lihiket_tutoring';

  console.log('\n🌱 Lihiket Seeder Starting...');
  console.log(`📡 Connecting to: ${mongoUri.replace(/:([^:@]{1,})?@/, ':****@')}\n`);

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,  // fail fast if Atlas blocks
    connectTimeoutMS:         10000,
  });

  console.log('✅ MongoDB connected.\n');

  // ── Super Admin ──────────────────────────────────────────────────────────────
  await Admin.findOneAndUpdate(
    { email: 'admin@lihiket.com' },
    {
      firstName:   'Super',
      lastName:    'Admin',
      username:    'superadmin',
      email:       'admin@lihiket.com',
      password:    'Admin@12345',
      phone:       '+251 911 000 001',
      role:        'admin',
      isVerified:  true,
      isActive:    true,
      permissions: ['manage_users', 'manage_courses', 'manage_subjects', 'view_analytics'],
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('✅ Admin:   admin@lihiket.com       / Admin@12345');

  if (adminOnly) {
    console.log('\n🎉 Admin created successfully!');
    console.log('   Login at: http://localhost:5173/login\n');
    await mongoose.disconnect();
    process.exit(0);
  }

  // ── Teacher ──────────────────────────────────────────────────────────────────
  await Teacher.findOneAndUpdate(
    { email: 'teacher@lihiket.com' },
    {
      firstName:         'Zelalem',
      lastName:          'Misganaw',
      username:          'teacher.zelalem',
      email:             'teacher@lihiket.com',
      password:          'Teacher@12345',
      phone:             '+251 911 000 002',
      role:              'teacher',
      specializedSubject:'Mathematics',
      qualifications:    'MSc in Mathematics',
      experience:        5,
      isVerified:        true,
      isActive:          true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('✅ Teacher: teacher@lihiket.com     / Teacher@12345');

  // ── Student ──────────────────────────────────────────────────────────────────
  const student = await Student.findOneAndUpdate(
    { email: 'student@lihiket.com' },
    {
      firstName:      'Selam',
      lastName:       'Alemu',
      username:       'student.selam',
      email:          'student@lihiket.com',
      password:       'Student@12345',
      phone:          '+251 911 000 003',
      role:           'student',
      gradeLevel:     'G12',
      parentFullName: 'Alemu Tadesse',
      parentPhone:    '+251 911 000 004',
      isVerified:     true,
      isActive:       true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('✅ Student: student@lihiket.com     / Student@12345');

  // ── Parent ───────────────────────────────────────────────────────────────────
  await Parent.findOneAndUpdate(
    { email: 'parent@lihiket.com' },
    {
      firstName:  'Alemu',
      lastName:   'Tadesse',
      username:   'parent.alemu',
      email:      'parent@lihiket.com',
      password:   'Parent@12345',
      phone:      '+251 911 000 004',
      role:       'parent',
      country:    'Ethiopia',
      children:   [student._id],
      isVerified: true,
      isActive:   true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('✅ Parent:  parent@lihiket.com      / Parent@12345');

  // ── Pending student (for testing admin approval) ──────────────────────────
  await Student.findOneAndUpdate(
    { email: 'pending.student@lihiket.com' },
    {
      firstName:  'Dawit',
      lastName:   'Haile',
      username:   'dawit.pending',
      email:      'pending.student@lihiket.com',
      password:   'Student@12345',
      phone:      '+251 911 000 005',
      role:       'student',
      gradeLevel: 'G11',
      isVerified: false,
      isActive:   true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('✅ Pending: pending.student@lihiket.com / Student@12345 (needs approval)');

  console.log('\n🎉 Seeding complete!');
  console.log('   Admin login: http://localhost:5173/login');
  console.log('   Email: admin@lihiket.com  |  Password: Admin@12345\n');
  await mongoose.disconnect();
  process.exit(0);
};

seedUsers().catch(err => {
  console.error('\n❌ Seed failed:', err.message);
  if (err.message.includes('whitelist') || err.message.includes('IP')) {
    console.error('\n📋 Fix: Add 0.0.0.0/0 to MongoDB Atlas → Network Access');
    console.error('   Or run: node src/seed.js (after whitelisting your IP)\n');
  }
  process.exit(1);
});
