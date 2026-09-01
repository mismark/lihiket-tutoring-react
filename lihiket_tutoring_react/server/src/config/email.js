const nodemailer = require('nodemailer');
const config = require('./index');

/**
 * Send transactional email via SMTP.
 * Falls back to console log in development when SMTP is unavailable.
 */
const sendEmail = async ({ to, toName, subject, html, text }) => {
  const hasValidSMTP =
    config.email.smtpHost &&
    config.email.smtpUser &&
    config.email.smtpPass &&
    !config.email.smtpHost.startsWith('your_') &&
    !config.email.smtpUser.startsWith('your_');

  if (!hasValidSMTP) {
    console.log('\n📧 [MOCK EMAIL — configure SMTP in env vars]');
    console.log(`To: ${to} | Subject: ${subject}`);
    if (text) {
      const otpMatch = text.match(/\b\d{6}\b/);
      if (otpMatch) console.log(`🔑 OTP CODE: ${otpMatch[0]}`);
    }
    return { success: true, mock: true };
  }

  const transporter = nodemailer.createTransport({
    host:   config.email.smtpHost,
    port:   config.email.smtpPort,
    secure: config.email.smtpSecure,
    auth: {
      user: config.email.smtpUser,
      pass: config.email.smtpPass,
    },
    connectionTimeout: 15000,
    greetingTimeout:   15000,
    socketTimeout:     20000,
  });

  try {
    const info = await transporter.sendMail({
      from:    `${config.email.senderName} <${config.email.smtpUser}>`,
      to,
      subject,
      html,
      text: text || '',
    });
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('❌ Email error:', err.message);

    // Dev fallback — print OTP to console so dev can still test
    if (config.nodeEnv !== 'production') {
      console.log('\n📧 [DEV FALLBACK] SMTP failed, OTP printed below:');
      if (text) {
        const otpMatch = text.match(/\b\d{6}\b/);
        if (otpMatch) console.log(`🔑 OTP CODE: ${otpMatch[0]}`);
      }
      console.log(`To: ${to}\n`);
      return { success: true, devFallback: true };
    }

    // Production — throw so the API returns a proper error
    throw new Error('Failed to send email. Please try again later.');
  }
};

module.exports = sendEmail;
