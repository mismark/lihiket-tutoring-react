const mongoose = require('mongoose');
const crypto   = require('crypto');

const CertificateSchema = new mongoose.Schema(
  {
    // A short unique public ID used in the verification URL
    certificateId: {
      type:    String,
      unique:  true,
      default: () => 'CERT-' + crypto.randomBytes(6).toString('hex').toUpperCase(),
    },

    student: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Student',
      required: true,
    },

    subject: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Subject',
      required: true,
    },

    // Admin who issued the certificate
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Admin',
    },

    // Optional letter grade / percentage / score
    grade: {
      type:    String,
      default: null,
      trim:    true,
    },

    completionDate: {
      type:    Date,
      default: Date.now,
    },

    // Base-64 encoded QR-code PNG (generated on issue, stored for reuse)
    qrCode: {
      type:    String,
      default: null,
    },

    // Whether the certificate is still valid
    isValid: {
      type:    Boolean,
      default: true,
    },

    // Reason if revoked
    revokedReason: {
      type:    String,
      default: null,
    },
  },
  { timestamps: true, collection: 'certificates' }
);

// One certificate per student per subject
CertificateSchema.index({ student: 1, subject: 1 }, { unique: true });

// Fast lookup by public ID
CertificateSchema.index({ certificateId: 1 });

module.exports = mongoose.model('Certificate', CertificateSchema);
