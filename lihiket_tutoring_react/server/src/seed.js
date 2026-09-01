/**
 * Lihiket Tutoring — Database Seeder
 *
 * Creates default admin, teacher, student, parent accounts.
 * Uses .save() so Mongoose pre-save password hashing hooks run correctly.
 *
 * Run:              node src/seed.js
 * Admin only:       node src/seed.js --admin-only
 * Force recreate:   node src/seed.js --force
 */

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

const Admin   = require('./models/Admin');
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');
const Parent  = require('./models/Parent');

const adminOnly = process.argv.includes('--admin-only');
const force     = process.argv.includes('--force');

/**
 * Upsert a user using .save() so the pre-save password hash hook fires.
 * If --force is passed, existing record is deleted first.
 */
async function upsertUser(Model, query, data) {
  if (force) {
    await Model.deleteOne(query);
  }
  let doc = await Model.findOne(query);
  if (!doc) {
    doc = new Model(data);
    await doc.save();
  }
  return doc;
}

const seedUsers = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/lihiket_tutoring';

  console.log('\n🌱 Lihiket Seeder Starting...');
  console.log(`📡 Connecting to: ${mongoUri.replace(/:([^:@]{1,})?@/, ':****@')}\n`);

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 20000,
    connectTimeoutMS:         20000,
  });

  console.log('✅ MongoDB connected.\n');

  // ── Super Admin ──────────────────────────────────────────────────────────────
  await upsertUser(Admin, { email: 'admin@lihiket.com' }, {
    firstName:   'Super',
    lastName:    'Admin',
    username:    'superadmin',
    email:       'admin@lihiket.com',
    password:    'Admin@12345',
    phone:       '+251911000001',
    role:        'admin',
    isVerified:  true,
    isActive:    true,
    permissions: ['manage_users', 'manage_courses', 'manage_subjects', 'view_analytics'],
  });
  console.log('✅ Admin:   admin@lihiket.com       / Admin@12345');

  if (adminOnly) {
    console.log('\n🎉 Admin created successfully!');
    console.log('   Login at: http://localhost:5174/login\n');
    await mongoose.disconnect();
    process.exit(0);
  }

  // ── Teacher ──────────────────────────────────────────────────────────────────
  await upsertUser(Teacher, { email: 'teacher@lihiket.com' }, {
    firstName:          'Zelalem',
    lastName:           'Misganaw',
    username:           'teacher.zelalem',
    email:              'teacher@lihiket.com',
    password:           'Teacher@12345',
    phone:              '+251911000002',
    role:               'teacher',
    specializedSubject: 'Mathematics',
    qualifications:     'MSc in Mathematics',
    experience:         5,
    isVerified:         true,
    isActive:           true,
  });
  console.log('✅ Teacher: teacher@lihiket.com     / Teacher@12345');

  // ── Student ──────────────────────────────────────────────────────────────────
  const student = await upsertUser(Student, { email: 'student@lihiket.com' }, {
    firstName:      'Selam',
    lastName:       'Alemu',
    username:       'student.selam',
    email:          'student@lihiket.com',
    password:       'Student@12345',
    phone:          '+251911000003',
    role:           'student',
    gradeLevel:     'G12',
    parentFullName: 'Alemu Tadesse',
    parentPhone:    '+251911000004',
    isVerified:     true,
    isActive:       true,
  });
  console.log('✅ Student: student@lihiket.com     / Student@12345');

  // ── Parent ───────────────────────────────────────────────────────────────────
  await upsertUser(Parent, { email: 'parent@lihiket.com' }, {
    firstName:  'Alemu',
    lastName:   'Tadesse',
    username:   'parent.alemu',
    email:      'parent@lihiket.com',
    password:   'Parent@12345',
    phone:      '+251911000004',
    role:       'parent',
    country:    'Ethiopia',
    children:   [student._id],
    isVerified: true,
    isActive:   true,
  });
  console.log('✅ Parent:  parent@lihiket.com      / Parent@12345');

  // ── Pending student (for testing admin approval) ──────────────────────────
  await upsertUser(Student, { email: 'pending.student@lihiket.com' }, {
    firstName:  'Dawit',
    lastName:   'Haile',
    username:   'dawit.pending',
    email:      'pending.student@lihiket.com',
    password:   'Student@12345',
    phone:      '+251911000005',
    role:       'student',
    gradeLevel: 'G11',
    isVerified: false,
    isActive:   true,
  });
  console.log('✅ Pending: pending.student@lihiket.com / Student@12345 (needs approval)');

  console.log('\n🎉 Seeding complete!');
  console.log('   Admin login: http://localhost:5174/login');
  console.log('   Email: admin@lihiket.com  |  Password: Admin@12345\n');
  await mongoose.disconnect();
  process.exit(0);
};

seedUsers().catch(err => {
  console.error('\n❌ Seed failed:', err.message);
  if (err.message.includes('whitelist') || err.message.includes('IP') || err.message.includes('timed out')) {
    console.error('\n📋 Fix: Add 0.0.0.0/0 to MongoDB Atlas → Network Access');
    console.error('   Or connect via mobile hotspot and retry.\n');
  }
  process.exit(1);
});
