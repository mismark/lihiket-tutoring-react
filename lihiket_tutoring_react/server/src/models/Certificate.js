const mongoose = require('mongoose');

// TODO: define schema for Certificate
const CertificateSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('Certificate', CertificateSchema);
