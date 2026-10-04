/**
 * Backfill migration: assign userId to every existing user who doesn't have one.
 *
 * Run once:
 *   node server/src/scripts/backfillUserIds.js
 *
 * Safe to re-run — skips users that already have a userId.
 * Initialises counters safely so new registrations won't collide.
 */

'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const mongoose       = require('mongoose');
const Student        = require('../models/Student');
const Teacher        = require('../models/Teacher');
const Parent         = require('../models/Parent');
const Admin          = require('../models/Admin');
const Counter        = require('../models/Counter');
const generateUserId = require('../utils/generateUserId');

const COLLECTIONS = [
  { Model: Student, role: 'student' },
  { Model: Teacher, role: 'teacher' },
  { Model: Parent,  role: 'parent'  },
  { Model: Admin,   role: 'admin'   },
];

async function backfill() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌  MONGO_URI not set in .env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('✅  Connected to MongoDB\n');

  let totalFixed = 0;
  let totalSkipped = 0;

  for (const { Model, role } of COLLECTIONS) {
    // Find users missing a userId
    const missing = await Model.find({
      $or: [{ userId: null }, { userId: { $exists: false } }],
    }).select('_id userId').sort({ createdAt: 1 });

    if (missing.length === 0) {
      console.log(`   ${role}: all users already have a userId — skipped`);
      continue;
    }

    console.log(`   ${role}: assigning userId to ${missing.length} user(s)…`);

    for (const user of missing) {
      const newId = await generateUserId(role);
      user.userId = newId;
      await user.save({ validateBeforeSave: false });
      console.log(`     ${user._id} → ${newId}`);
      totalFixed++;
    }
  }

  // ── Safety check: ensure counters are ahead of the highest existing userId ──
  // This prevents future registrations from colliding with backfilled IDs.
  console.log('\n   Verifying counters are ahead of existing IDs…');

  const PREFIX_MAP = { student:'LIKST', teacher:'LIKTC', parent:'LIKPA', admin:'LIKAD' };

  for (const { Model, role } of COLLECTIONS) {
    const prefix = PREFIX_MAP[role];
    // Find the highest existing sequential number for this role
    const users = await Model.find({ userId: { $regex: `^${prefix}` } })
      .select('userId');

    if (users.length === 0) continue;

    const maxNum = users.reduce((max, u) => {
      const num = parseInt(u.userId.replace(prefix, ''), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 9999);

    // Make sure counter seq >= maxNum (so next generate gives maxNum+1 or higher)
    const current = await Counter.findById(role);
    if (!current || current.seq < maxNum) {
      await Counter.findOneAndUpdate(
        { _id: role },
        { $max: { seq: maxNum } },
        { upsert: true }
      );
      console.log(`   ${role}: counter advanced to ${maxNum}`);
    } else {
      console.log(`   ${role}: counter already at ${current.seq} — OK`);
    }
  }

  console.log(`\n✅  Backfill complete — ${totalFixed} IDs assigned, ${totalSkipped} skipped`);
  await mongoose.disconnect();
  process.exit(0);
}

backfill().catch(err => {
  console.error('❌  Backfill failed:', err.message);
  mongoose.disconnect().finally(() => process.exit(1));
});
