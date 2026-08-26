const Notification = require('../models/Notification');

/**
 * Create a system notification.
 *
 * @param {Object} options
 * @param {string} options.userId      - Recipient user ObjectId
 * @param {string} options.userModel   - 'Admin' | 'Teacher' | 'Student' | 'Parent'
 * @param {string} options.type        - EVENTS constant
 * @param {string} options.title       - Short title
 * @param {string} options.message     - Full message body
 * @param {string} [options.link]      - Optional frontend link
 */
const notify = async ({ userId, userModel, type, title, message, link }) => {
  try {
    await Notification.create({ userId, userModel, type, title, message, link });
  } catch (err) {
    // Notification failure must never break the main request
    console.error('Notification error:', err.message);
  }
};

module.exports = notify;
