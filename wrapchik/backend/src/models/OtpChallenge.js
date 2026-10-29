const mongoose = require('mongoose');

const otpChallengeSchema = new mongoose.Schema({
  phone: { type: String, required: true, index: true },
  purpose: { type: String, enum: ['LOGIN', 'PHONE_VERIFY', 'PASSWORD_RESET'], required: true },
  otpHash: { type: String, default: null },
  provider: { type: String, enum: ['local', 'twilio'], required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  attempts: { type: Number, default: 0 },
  consumed: { type: Boolean, default: false, index: true },
}, { timestamps: true });

module.exports = mongoose.model('OtpChallenge', otpChallengeSchema);
