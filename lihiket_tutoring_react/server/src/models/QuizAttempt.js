const mongoose = require('mongoose');

// TODO: define schema for QuizAttempt
const QuizAttemptSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);
