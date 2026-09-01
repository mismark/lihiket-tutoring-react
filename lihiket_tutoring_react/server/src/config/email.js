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
      secure: config.email.smtpSecure,
      auth: {
        user: config.email.smtpUser,
        pass: config.email.smtpPass,
      },
      connectionTimeout: 8000,   // fail fast — 8s
      greetingTimeout:   8000,
      socketTimeout:     8000,
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
    if (config.nodeEnv === 'development') {
      console.log('\n──────────────────────────────────────────────');
      console.log('📧 [DEV] SMTP failed — OTP delivered to console instead.');
      console.log(`To:      ${to}`);
      console.log(`Subject: ${subject}`);
      if (text) {
        // Extract OTP from the plain text (6-digit number)
        const otpMatch = text.match(/\b\d{6}\b/);
        if (otpMatch) console.log(`🔑 OTP CODE: ${otpMatch[0]}`);
      }
      console.log('──────────────────────────────────────────────\n');
      return { success: true, devFallback: true };
    }
    throw err;
  }
};

module.exports = sendEmail;
