const mongoose = require('mongoose');

// TODO: define schema for QuestionBank
const QuestionBankSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('QuestionBank', QuestionBankSchema);
