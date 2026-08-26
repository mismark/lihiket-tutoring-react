const mongoose = require('mongoose');

// TODO: define schema for ExamQuestion
const ExamQuestionSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('ExamQuestion', ExamQuestionSchema);
