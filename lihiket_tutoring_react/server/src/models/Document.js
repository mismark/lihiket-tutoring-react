const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    fileName: {
      type: String,
      default: '',
    },
    fileSize: {
      type: Number,      // bytes
      default: 0,
    },
    mimeType: {
      type: String,
      default: '',
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      default: null,
    },
    gradeLevel: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['notes', 'worksheet', 'past_paper', 'syllabus', 'reference', 'other'],
      default: 'other',
    },
    allowDownload: {
      type: Boolean,
      default: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'uploadedByModel',
      required: true,
    },
    uploadedByModel: {
      type: String,
      enum: ['Admin', 'Teacher'],
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true, collection: 'documents' }
);

DocumentSchema.index({ subject: 1, gradeLevel: 1, category: 1 });
DocumentSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Document', DocumentSchema);
