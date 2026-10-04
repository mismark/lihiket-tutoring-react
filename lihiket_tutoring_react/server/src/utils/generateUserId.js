/**
 * generateUserId(role) → e.g. "LIKTC10000"
 *
 * Prefix map:
 *   teacher → LIKTC
 *   student → LIKST
 *   parent  → LIKPA
 *   admin   → LIKAD
 *
 * Uses an atomic MongoDB counter (findOneAndUpdate + $inc) so two simultaneous
 * registrations never receive the same number.
 */

const Counter = require('../models/Counter');

const PREFIX = {
  teacher: 'LIKTC',
  student: 'LIKST',
  parent:  'LIKPA',
  admin:   'LIKAD',
};

/**
 * Returns the next sequential ID for the given role.
 * @param {'student'|'teacher'|'parent'|'admin'} role
 * @returns {Promise<string>}
 */
async function generateUserId(role) {
  const prefix = PREFIX[role];
  if (!prefix) throw new Error(`Unknown role for ID generation: "${role}"`);

  // Atomically increment and return the NEW value
  const counter = await Counter.findOneAndUpdate(
    { _id: role },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }   // create doc if first registration of this role
  );

  const num = counter.seq;

  // Pad to at least 5 digits (10000–99999 stay as-is; overflow just gets longer)
  const paddedNum = String(num).padStart(5, '0');
  return `${prefix}${paddedNum}`;
}

module.exports = generateUserId;
