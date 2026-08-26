const mongoose = require('mongoose');

// A conversation between exactly two users (DM / private chat)
const ConversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        userId:    { type: mongoose.Schema.Types.ObjectId, required: true },
        userModel: { type: String, required: true, enum: ['Admin', 'Teacher', 'Student', 'Parent'] },
      },
    ],
    lastMessage: { type: String, default: '' },
    lastSentAt:  { type: Date,   default: null },

    // Plain object (Mixed) so MongoDB $inc / $set with dot-notation keys works correctly.
    // Keys are userId strings, values are integer unread counts.
    unreadCounts: {
      type:    mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

ConversationSchema.index({ 'participants.userId': 1 });

module.exports = mongoose.model('Conversation', ConversationSchema);
