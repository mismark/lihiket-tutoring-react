require('dotenv').config();

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
    secretKey: process.env.CHAPA_SECRET_KEY,
    baseUrl: 'https://api.chapa.co/v1',
    callbackUrl: process.env.CHAPA_CALLBACK_URL,
    returnUrl: process.env.CHAPA_RETURN_URL,
  },

  // Timezone
  timezone: 'Africa/Addis_Ababa',
};
