const Notification = require('../models/Notification');
const AppError     = require('../utils/AppError');

// Resolve userId + model from the authenticated user
function userInfo(req) {
  const modelMap = {
    admin: 'Admin', teacher: 'Teacher', student: 'Student', parent: 'Parent',
  };
  return { userId: req.user._id, userModel: modelMap[req.userRole] };
}

// ── GET /api/notifications ────────────────────────────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const { userId, userModel } = userInfo(req);
    const { unreadOnly, page = 1, limit = 30 } = req.query;

    const filter = { userId, userModel };
    if (unreadOnly === 'true') filter.isRead = false;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ userId, userModel, isRead: false });

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      unreadCount,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      count: notifications.length,
      data: notifications,
    });
  } catch (err) { next(err); }
};

// ── PATCH /api/notifications/:id/read ─────────────────────────────────────────
exports.markRead = async (req, res, next) => {
  try {
    const { userId } = userInfo(req);
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId },
      { isRead: true },
      { new: true }
    );
    if (!n) return next(new AppError('Notification not found', 404));
    res.json({ success: true, data: n });
  } catch (err) { next(err); }
};

// ── PATCH /api/notifications/read-all ─────────────────────────────────────────
exports.markAllRead = async (req, res, next) => {
  try {
    const { userId, userModel } = userInfo(req);
    await Notification.updateMany({ userId, userModel, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};

// ── DELETE /api/notifications/:id ─────────────────────────────────────────────
exports.remove = async (req, res, next) => {
  try {
    const { userId } = userInfo(req);
    const n = await Notification.findOneAndDelete({ _id: req.params.id, userId });
    if (!n) return next(new AppError('Notification not found', 404));
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

// ── DELETE /api/notifications/clear-all ───────────────────────────────────────
exports.clearAll = async (req, res, next) => {
  try {
    const { userId, userModel } = userInfo(req);
    await Notification.deleteMany({ userId, userModel });
    res.json({ success: true, message: 'All notifications cleared' });
  } catch (err) { next(err); }
};

// ── GET /api/notifications/unread-count ───────────────────────────────────────
exports.unreadCount = async (req, res, next) => {
  try {
    const { userId, userModel } = userInfo(req);
    const count = await Notification.countDocuments({ userId, userModel, isRead: false });
    res.json({ success: true, count });
  } catch (err) { next(err); }
};
