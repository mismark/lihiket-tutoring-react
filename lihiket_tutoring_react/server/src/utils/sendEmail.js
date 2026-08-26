/**
 * Re-exports the Brevo email sender for backward-compatible imports.
 * Usage: const sendEmail = require('../utils/sendEmail');
 */
const sendEmail = require('../config/email');

module.exports = sendEmail;
