const mongoose = require('mongoose');

// TODO: define schema for Payment
const PaymentSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
