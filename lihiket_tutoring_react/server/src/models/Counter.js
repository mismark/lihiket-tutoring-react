const mongoose = require('mongoose');

/**
 * Atomic counter per user role.
 * Each document: { _id: 'student', seq: 10003 }
 * findOneAndUpdate with $inc is atomic — safe for concurrent registrations.
 */
const CounterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },   // role key: 'student' | 'teacher' | 'parent' | 'admin'
    seq: { type: Number, default: 9999 },    // starts at 9999 so first increment → 10000
  },
  { collection: 'user_id_counters' }
);

module.exports = mongoose.model('Counter', CounterSchema);
