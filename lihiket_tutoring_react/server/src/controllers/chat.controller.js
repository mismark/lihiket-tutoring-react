const Conversation = require('../models/Conversation');
const Message      = require('../models/Message');
const AppError     = require('../utils/AppError');
const { getIO }    = require('../config/socket');

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_TO_MODEL = {
  admin:   'Admin',
  teacher: 'Teacher',
  student: 'Student',
  parent:  'Parent',
};

// Safely get the IO instance — won't throw if socket not yet initialised
function io() {
  try { return getIO(); } catch { return null; }
}

// Populate display info for a single user from the appropriate collection
async function populateUser(userId, userModel) {
  try {
    const Model = require(`../models/${userModel}`);
    const user  = await Model.findById(userId)
      .select('firstName lastName email role')
      .lean();
    if (!user) return null;
    return {
      _id:       userId,
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email,
      role:      user.role || userModel.toLowerCase(),
    };
  } catch {
    return null;
  }
}

// Build the "other participant" view of a conversation document
async function withOtherUser(conv, myIdStr) {
  const other = conv.participants.find(
    (p) => p.userId.toString() !== myIdStr
  );
  const otherUser = other
    ? await populateUser(other.userId, other.userModel)
    : null;
  const unread = conv.unreadCounts?.[myIdStr] || 0;
  return { ...conv, otherUser, unread };
}

// ─── GET /api/chats ──────────────────────────────────────────────────────────
exports.getConversations = async (req, res) => {
  const myId = req.user._id.toString();

  const conversations = await Conversation.find({
    'participants.userId': req.user._id,
  })
    .sort({ lastSentAt: -1, updatedAt: -1 })
    .lean();

  const result = await Promise.all(
    conversations.map((conv) => withOtherUser(conv, myId))
  );

  res.json({ success: true, data: result });
};

// ─── GET /api/chats/:conversationId/messages ─────────────────────────────────
// Page 1 = most-recent 50, page 2 = next-older 50, etc.
// Within each page messages are sorted oldest-first for display.
exports.getMessages = async (req, res) => {
  const { conversationId } = req.params;
  const page  = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 50;

  // Verify the requester is a participant
  const conv = await Conversation.findOne({
    _id: conversationId,
    'participants.userId': req.user._id,
  });
  if (!conv) throw new AppError('Conversation not found or access denied', 404);

  const total = await Message.countDocuments({
    conversationId,
    isDeleted: false,
  });
  const totalPages = Math.ceil(total / limit) || 1;

  // Skip from the END so page 1 = newest, page 2 = next older, etc.
  // Then sort ascending so messages display oldest→newest within the page.
  const skipFromEnd = (page - 1) * limit;
  const skipFromStart = Math.max(0, total - skipFromEnd - limit);

  const messages = await Message.find({
    conversationId,
    isDeleted: false,
  })
    .sort({ createdAt: 1 })   // oldest first within the page
    .skip(skipFromStart)
    .limit(limit)
    .lean();

  // Populate sender display info
  const populated = await Promise.all(
    messages.map(async (msg) => {
      const senderInfo = await populateUser(
        msg.sender.userId,
        msg.sender.userModel
      );
      return {
        ...msg,
        sender: { ...msg.sender, ...(senderInfo || {}) },
      };
    })
  );

  // Mark conversation as read for this user
  const myId = req.user._id.toString();
  await Conversation.findByIdAndUpdate(conversationId, {
    $set: { [`unreadCounts.${myId}`]: 0 },
  });

  res.json({
    success: true,
    data: populated,
    pagination: { page, limit, total, pages: totalPages },
  });
};

// ─── POST /api/chats ─────────────────────────────────────────────────────────
// Start a new conversation (or return existing) + optional first message
exports.startConversation = async (req, res) => {
  const { recipientId, recipientModel, text } = req.body;
  if (!recipientId || !recipientModel) {
    throw new AppError('recipientId and recipientModel are required', 400);
  }

  const myId    = req.user._id;
  const myIdStr = myId.toString();
  const myModel = ROLE_TO_MODEL[req.userRole];

  if (!myModel) throw new AppError('Unknown user role', 400);

  // Validate recipientModel
  if (!Object.values(ROLE_TO_MODEL).includes(recipientModel)) {
    throw new AppError('Invalid recipientModel', 400);
  }

  // Find existing conversation between these two users
  let conv = await Conversation.findOne({
    $and: [
      { 'participants.userId': myId },
      { 'participants.userId': recipientId },
    ],
  }).lean();

  if (!conv) {
    conv = await Conversation.create({
      participants: [
        { userId: myId,        userModel: myModel        },
        { userId: recipientId, userModel: recipientModel },
      ],
    });
    conv = conv.toObject();
  }

  // Send optional first message
  let message = null;
  if (text?.trim()) {
    message = await Message.create({
      conversationId: conv._id,
      sender: { userId: myId, userModel: myModel },
      text:   text.trim(),
    });

    const recipientIdStr = recipientId.toString();
    await Conversation.findByIdAndUpdate(conv._id, {
      $set: { lastMessage: text.trim().slice(0, 100), lastSentAt: new Date() },
      $inc: { [`unreadCounts.${recipientIdStr}`]: 1 },
    });

    // Re-fetch updated conv
    conv = await Conversation.findById(conv._id).lean();

    // Push to recipient's personal room immediately
    const socket = io();
    if (socket) {
      const senderInfo = await populateUser(myId, myModel);
      const msgObj     = message.toObject();
      const payload    = { ...msgObj, sender: { ...msgObj.sender, ...(senderInfo || {}) } };
      socket.to(`user:${recipientIdStr}`).emit('chat:message', payload);
      socket.to(`user:${recipientIdStr}`).emit('chat:unread', {
        conversationId: conv._id.toString(),
        senderId: myIdStr,
      });
    }
  }

  // Always return fully-populated conversation so client has otherUser
  const populated = await withOtherUser(conv, myIdStr);

  res.status(201).json({
    success: true,
    data: { conversation: populated, message },
  });
};

// ─── POST /api/chats/:conversationId/messages ─────────────────────────────────
exports.sendMessage = async (req, res) => {
  const { conversationId } = req.params;
  const { text } = req.body;
  if (!text?.trim()) throw new AppError('Message text is required', 400);

  const myId    = req.user._id;
  const myModel = ROLE_TO_MODEL[req.userRole];
  if (!myModel) throw new AppError('Unknown user role', 400);

  const conv = await Conversation.findOne({
    _id: conversationId,
    'participants.userId': myId,
  });
  if (!conv) throw new AppError('Conversation not found or access denied', 404);

  const message = await Message.create({
    conversationId,
    sender: { userId: myId, userModel: myModel },
    text:   text.trim(),
  });

  // Increment unread count for the other participant
  const otherId = conv.participants
    .find((p) => p.userId.toString() !== myId.toString())
    ?.userId.toString();

  await Conversation.findByIdAndUpdate(conversationId, {
    $set: { lastMessage: text.trim().slice(0, 100), lastSentAt: new Date() },
    ...(otherId ? { $inc: { [`unreadCounts.${otherId}`]: 1 } } : {}),
  });

  // Populate sender for the response
  const senderInfo = await populateUser(myId, myModel);
  const msgObj     = message.toObject();
  const payload    = {
    ...msgObj,
    sender: { ...msgObj.sender, ...(senderInfo || {}) },
  };

  // ── Real-time: push to everyone in this conversation room ─────────────────
  // The sender's own optimistic message is already shown; emit to the room so
  // the RECIPIENT (and any other open tabs of the sender) receives it instantly.
  const socket = io();
  if (socket) {
    socket.to(`conv:${conversationId}`).emit('chat:message', payload);

    // Also ping the recipient's personal room so their unread badge updates
    // even if they haven't opened the conversation window yet.
    if (otherId) {
      socket.to(`user:${otherId}`).emit('chat:unread', {
        conversationId,
        senderId: myId.toString(),
      });
    }
  }

  res.status(201).json({ success: true, data: payload });
};

// ─── DELETE /api/chats/messages/:messageId ────────────────────────────────────
// Soft-delete own message
exports.deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const msg = await Message.findById(messageId);
  if (!msg) throw new AppError('Message not found', 404);
  if (msg.sender.userId.toString() !== req.user._id.toString()) {
    throw new AppError('You can only delete your own messages', 403);
  }
  msg.isDeleted = true;
  msg.text      = '';
  await msg.save();

  // Notify everyone in the conversation room that this message was deleted
  const socket = io();
  if (socket) {
    socket.to(`conv:${msg.conversationId.toString()}`).emit('chat:deleted', { messageId });
  }

  res.json({ success: true, message: 'Message deleted' });
};

// ─── DELETE /api/chats/:conversationId ───────────────────────────────────────
exports.deleteConversation = async (req, res) => {
  const { conversationId } = req.params;
  const conv = await Conversation.findOne({
    _id: conversationId,
    'participants.userId': req.user._id,
  });
  if (!conv) throw new AppError('Conversation not found', 404);

  await Message.deleteMany({ conversationId });
  await Conversation.findByIdAndDelete(conversationId);

  res.json({ success: true, message: 'Conversation deleted' });
};

// ─── GET /api/chats/unread-count ──────────────────────────────────────────────
exports.unreadCount = async (req, res) => {
  const myId = req.user._id.toString();

  const conversations = await Conversation.find({
    'participants.userId': req.user._id,
  }).lean();

  const total = conversations.reduce(
    (sum, c) => sum + (c.unreadCounts?.[myId] || 0),
    0
  );

  res.json({ success: true, data: { count: total } });
};

// ─── GET /api/chats/users ─────────────────────────────────────────────────────
// All users the current user can start a conversation with (everyone except self)
exports.getChatableUsers = async (req, res) => {
  const myId   = req.user._id.toString();
  const models = ['Admin', 'Teacher', 'Student', 'Parent'];
  const users  = [];

  for (const modelName of models) {
    const Model = require(`../models/${modelName}`);
    const list  = await Model.find({ _id: { $ne: req.user._id } })
      .select('firstName lastName email role')
      .lean();
    list.forEach((u) =>
      users.push({
        ...u,
        userModel: modelName,
        role: u.role || modelName.toLowerCase(),
      })
    );
  }

  res.json({ success: true, data: users });
};
