const mongoose = require('mongoose');

// TODO: define schema for Choice
const ChoiceSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('Choice', ChoiceSchema);
