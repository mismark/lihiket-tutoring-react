const mongoose = require('mongoose');

const LiveClassSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true, trim: true },
    description:  { type: String, default: '', trim: true },
    subject:      { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
    gradeLevel:   { type: String, default: '' },
    meetingLink:  { type: String, required: true, trim: true },
    platform:     { type: String, enum: ['zoom','meet','jitsi','teams','other'], default: 'meet' },
    scheduledAt:  { type: Date, required: true },
    duration:     { type: Number, default: 60 },   // minutes
    status:       { type: String, enum: ['scheduled','live','ended','cancelled'], default: 'scheduled' },
    recordingUrl: { type: String, default: '' },
    notes:        { type: String, default: '' },
    createdBy:    { type: mongoose.Schema.Types.ObjectId, refPath: 'createdByModel', required: true },
    createdByModel: { type: String, enum: ['Admin','Teacher'], required: true },
  },
  { timestamps: true, collection: 'liveclasses' }
);

module.exports = mongoose.model('LiveClass', LiveClassSchema);
