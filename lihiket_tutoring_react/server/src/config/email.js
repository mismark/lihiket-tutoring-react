const nodemailer = require('nodemailer');
const config = require('./index');

/**
 * Send transactional email via standard SMTP service.
 * Supports Gmail, SendGrid, and other SMTP providers.
 * In development or when no valid SMTP config is present, logs email to console gracefully.
 *
 * @param {Object} options
 * @param {string} options.to        - Recipient email address
 * @param {string} options.toName    - Recipient display name
 * @param {string} options.subject   - Email subject
 * @param {string} options.html      - HTML body
 * @param {string} [options.text]    - Plain text fallback
 */
const sendEmail = async ({ to, toName, subject, html, text }) => {
  const hasValidSMTP =
    config.email.smtpHost &&
    config.email.smtpUser &&
    config.email.smtpPass &&
    !config.email.smtpHost.startsWith('your_') &&
    !config.email.smtpUser.startsWith('your_');

  if (!hasValidSMTP) {
    console.log('\n───────────────────────────────────────────────────────────');
    console.log('📧 [MOCK EMAIL SERVICE] (Configure SMTP in .env for live emails)');
    console.log(`To: ${toName || to} <${to}>`);
    console.log(`Subject: ${subject}`);
    console.log(`Preview: ${text || (html ? html.replace(/<[^>]+>/g, ' ').slice(0, 150) + '...' : '')}`);
    console.log('────────────────────────────────────────────────────────────\n');
    return { success: true, mock: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.email.smtpHost,
      port: config.email.smtpPort,
      secure: config.email.smtpSecure, // true for 465, false for 587
      auth: {
        user: config.email.smtpUser,
        pass: config.email.smtpPass,
      },
    });

    const mailOptions = {
      from: `${config.email.senderName} <${config.email.senderEmail}>`,
      to,
      subject,
      html,
      text: text || '',
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('❌ Email sending error:', err.message);
    // Don't throw fatal error on email failure in development
    if (config.nodeEnv === 'development') {
      console.log(`[DEV FALLBACK] Email would have contained: ${subject} for ${to}`);
      return { success: false, error: err.message };
    }
    throw err;
  }
};

module.exports = sendEmail;
