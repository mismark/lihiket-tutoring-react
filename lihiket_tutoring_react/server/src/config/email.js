const https    = require('https');
const nodemailer = require('nodemailer');
const config   = require('./index');

/**
 * Send email via Brevo HTTP API (port 443 — works on all servers including Render free tier).
 * Falls back to SMTP if API key not configured.
 * Falls back to console in development when everything fails.
 */

// ── Brevo HTTP API sender ─────────────────────────────────────────────────────
const sendViaBrevoAPI = ({ to, toName, subject, html, text }) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      sender:   { name: config.email.senderName, email: config.email.senderEmail || config.email.smtpUser },
      to:       [{ email: to, name: toName || to }],
      subject,
      htmlContent: html || `<p>${text}</p>`,
      textContent: text || '',
    });

    const req = https.request({
      hostname: 'api.brevo.com',
      path:     '/v3/smtp/email',
      method:   'POST',
      headers: {
        'Content-Type':  'application/json',
        'Accept':        'application/json',
        'api-key':       process.env.BREVO_API_KEY,
        'Content-Length': Buffer.byteLength(payload),
      },
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const parsed = JSON.parse(data);
          console.log('✅ Email sent via Brevo API:', parsed.messageId);
          resolve({ success: true, messageId: parsed.messageId });
        } else {
          reject(new Error(`Brevo API error ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('Brevo API timeout')); });
    req.write(payload);
    req.end();
  });
};

// ── SMTP sender ───────────────────────────────────────────────────────────────
const sendViaSMTP = async ({ to, toName, subject, html, text }) => {
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

  const info = await transporter.sendMail({
    from:    `${config.email.senderName} <${config.email.smtpUser}>`,
    to,
    subject,
    html,
    text: text || '',
  });
  console.log('✅ Email sent via SMTP:', info.messageId);
  return { success: true, messageId: info.messageId };
};

// ── Dev console fallback ──────────────────────────────────────────────────────
const devConsoleFallback = ({ to, subject, text }) => {
  console.log('\n📧 [DEV FALLBACK] Email not sent — printed to console:');
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  if (text) {
    const otpMatch = text.match(/\b\d{6}\b/);
    if (otpMatch) console.log(`🔑 OTP CODE: ${otpMatch[0]}`);
  }
  console.log('');
  return { success: true, devFallback: true };
};

// ── Main sendEmail ─────────────────────────────────────────────────────────────
const sendEmail = async (options) => {
  // 1. Try Brevo HTTP API first (works on all servers, port 443)
  if (process.env.BREVO_API_KEY) {
    try {
      return await sendViaBrevoAPI(options);
    } catch (err) {
      console.error('❌ Brevo API error:', err.message);
    }
  }

  // 2. Try SMTP
  const hasValidSMTP =
    config.email.smtpHost &&
    config.email.smtpUser &&
    config.email.smtpPass &&
    !config.email.smtpHost.startsWith('your_');

  if (hasValidSMTP) {
    try {
      return await sendViaSMTP(options);
    } catch (err) {
      console.error('❌ SMTP error:', err.message);
      // In production, if SMTP also fails, throw
      if (config.nodeEnv === 'production' && !process.env.BREVO_API_KEY) {
        throw new Error('Failed to send email. Please try again later.');
      }
    }
  }

  // 3. Dev fallback — log to console
  if (config.nodeEnv !== 'production') {
    return devConsoleFallback(options);
  }

  throw new Error('Failed to send email. Please try again later.');
};

module.exports = sendEmail;
