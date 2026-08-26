const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
    },
    content: {
      type: String,
      default: '',   // rich text / notes
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,  // denormalized for fast subject-level queries
    },
    type: {
      type: String,
      enum: ['video', 'document', 'text', 'mixed'],
      default: 'text',
    },
    videoUrl: {
      type: String,
      default: null,   // path to uploaded video file or external URL
    },
    fileUrl: {
      type: String,
      default: null,   // path to uploaded document (PDF, DOCX, etc.)
    },
    fileName: {
      type: String,
      default: null,
    },
    duration: {
      type: String,
      default: null,   // e.g. "12:30"
    },
    order: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    allowDownload: {
      type: Boolean,
      default: false,   // teacher controls whether students can download the file
    },
  },
  { timestamps: true, collection: 'lessons' }
);

module.exports = mongoose.model('Lesson', LessonSchema);
