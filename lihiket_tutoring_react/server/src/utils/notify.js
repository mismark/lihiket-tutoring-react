const Notification = require('../models/Notification');

/**
 * Create a system notification and push it to the recipient in real-time
 * via Socket.IO (user personal room).  The socket push is best-effort —
 * the notification is always persisted to the DB first.
 */
const notify = async ({ userId, userModel, type, title, message, link }) => {
  try {
    const notification = await Notification.create({
      userId, userModel, type, title, message, link,
    });

    try {
      const { getIO } = require('../config/socket');
      const io        = getIO();
      io.to(`user:${userId.toString()}`).emit('notification:new', {
        _id:       notification._id,
        type:      notification.type,
        title:     notification.title,
        message:   notification.message,
        link:      notification.link,
        isRead:    false,
        createdAt: notification.createdAt,
      });
    } catch {
      // Socket not ready or user offline — DB record is enough
    }
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};

/**
 * Notify all students enrolled in a subject.
 * Fetches active enrollments for the given subjectId and calls notify() for each.
 *
 * @param {string|ObjectId} subjectId
 * @param {Object}  payload  - { type, title, message, link }
 */
const notifyEnrolledStudents = async (subjectId, { type, title, message, link }) => {
  try {
    const Enrollment = require('../models/Enrollment');
    const enrollments = await Enrollment.find({
      subject: subjectId,
      status:  'active',
    }).select('student').lean();

    await Promise.all(
      enrollments.map(e =>
        notify({ userId: e.student, userModel: 'Student', type, title, message, link })
      )
    );
  } catch (err) {
    console.error('notifyEnrolledStudents error:', err.message);
  }
};

module.exports        = notify;
module.exports.notifyEnrolledStudents = notifyEnrolledStudents;
