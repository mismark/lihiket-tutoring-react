const mongoose = require('mongoose');

// TODO: define schema for CourseProgress
const CourseProgressSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('CourseProgress', CourseProgressSchema);
