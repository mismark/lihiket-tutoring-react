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
    fileUrl:   { type: String, default: null },
    fileName:  { type: String, default: null },
    fileType:  { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
    // Array of userIds who have seen this message
    readBy:    [{ type: mongoose.Schema.Types.ObjectId }],
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', MessageSchema);
