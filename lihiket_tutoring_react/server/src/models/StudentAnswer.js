const mongoose = require('mongoose');

// TODO: define schema for StudentAnswer
const StudentAnswerSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('StudentAnswer', StudentAnswerSchema);
