// server/src/models/StoreConfig.js
const mongoose = require('mongoose');

const storeConfigSchema = new mongoose.Schema(
  {
    brandName: { type: String, default: 'Verdant Hide' },
    supportEmail: { type: String, default: 'support@verdanthide.com' },
    supportPhone: { type: String, default: '+91 98765 43210' },
    grievanceOfficer: { type: String, default: 'Compliance Desk — Verdant Hide' },
    freeShippingThreshold: { type: Number, default: 999 },
    flatShippingFee: { type: Number, default: 99 },
    codEnabled: { type: Boolean, default: true },
    razorpayEnabled: { type: Boolean, default: true },
    returnWindowDays: { type: Number, default: 14 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StoreConfig', storeConfigSchema);