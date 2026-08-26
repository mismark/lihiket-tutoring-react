const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Conversation',
      required: true,
    },
    sender: {
      userId:    { type: mongoose.Schema.Types.ObjectId, required: true },
      userModel: { type: String, required: true, enum: ['Admin', 'Teacher', 'Student', 'Parent'] },
    },
    text:      { type: String, default: '' },
    // optional file attachment
    fileUrl:   { type: String, default: null },
    fileName:  { type: String, default: null },
    fileType:  { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', MessageSchema);
