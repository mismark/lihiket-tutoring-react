const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, required: true },
    userModel: { type: String, required: true, enum: ['Admin', 'Teacher', 'Student', 'Parent'] },
    type:      { type: String, required: true },
    title:     { type: String, required: true },
    message:   { type: String, required: true },
    link:      { type: String, default: null },
    isRead:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
