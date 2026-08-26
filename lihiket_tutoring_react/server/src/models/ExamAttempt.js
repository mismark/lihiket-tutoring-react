const mongoose = require('mongoose');

// TODO: define schema for ExamAttempt
const ExamAttemptSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('ExamAttempt', ExamAttemptSchema);
