const mongoose = require('mongoose');

// TODO: define schema for ExamAnswer
const ExamAnswerSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('ExamAnswer', ExamAnswerSchema);
