require('dotenv').config();

// ── Derived WebAuthn config (needs CLIENT_URL) ────────────────────────────────
const _clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

// rpID must be the bare hostname (no scheme, no port, no path)
let _rpID = 'localhost';
try { _rpID = new URL(_clientUrl).hostname; } catch { /* keep localhost */ }

// Always include both the production URL AND localhost for dev/test
const _originSet = new Set();
// production origin
try { _originSet.add(new URL(_clientUrl).origin); } catch {}
// any extra origins from env (comma-separated)
if (process.env.WEBAUTHN_EXPECTED_ORIGINS) {
  process.env.WEBAUTHN_EXPECTED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean).forEach(o => _originSet.add(o));
}
// always allow localhost dev
_originSet.add('http://localhost:5173');
_originSet.add('http://127.0.0.1:5173');
_originSet.add('http://localhost:5174');
// common Vercel preview pattern
if (_rpID !== 'localhost') {
  _originSet.add(`https://${_rpID}`);
}
const _expectedOrigins = Array.from(_originSet);

module.exports = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  mongoUri: process.env.MONGO_URI,

  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '7d',

  // Client
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  // WebAuthn (passkey / fingerprint login)
  webauthn: {
    // Friendly name shown in the device's biometric prompt
    rpName: process.env.WEBAUTHN_RP_NAME || 'Lihiket',
    // Bare domain (no scheme/port) the credential is bound to. Defaults to the
    // CLIENT_URL hostname — "localhost" in dev, your domain in prod.
    rpID: process.env.WEBAUTHN_RP_ID || _rpID,
    // Origins allowed to run the ceremony. Defaults to CLIENT_URL + localhost dev.
    expectedOrigins: _expectedOrigins,
  },

  // Email (SMTP)
  email: {
    smtpHost: process.env.SMTP_HOST,
    smtpPort: parseInt(process.env.SMTP_PORT) || 587,
    smtpSecure: process.env.SMTP_SECURE === 'true' || false, // true for 465, false for 587
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    senderEmail: process.env.SENDER_EMAIL || 'noreply@lihiket.com',
    senderName: process.env.SENDER_NAME || 'Lihiket Tutoring',
  },

  // File uploads
  upload: {
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB) || 50,
    avatarMaxMB: 5,
  },

  // Payment (Chapa)
  chapa: {
    secretKey:     process.env.CHAPA_SECRET_KEY,
    baseUrl:       'https://api.chapa.co/v1',
    callbackUrl:   process.env.CHAPA_CALLBACK_URL,
    returnUrl:     process.env.CHAPA_RETURN_URL,
    webhookSecret: process.env.CHAPA_WEBHOOK_SECRET || '', // used for HMAC verification
  },

  // Timezone
  timezone: 'Africa/Addis_Ababa',
};
