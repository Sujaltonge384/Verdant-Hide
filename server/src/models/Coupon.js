// server/src/models/Coupon.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['PERCENT', 'FLAT'], default: 'PERCENT' },
    value: { type: Number, required: true, min: 1 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, default: 0, min: 0 }, // 0 = no cap
    applicableCategory: {
      type: String,
      enum: ['all', 'backpacks', 'travel-bags', 'handbags', 'wallets', 'accessories'],
      default: 'all',
    },
    usageLimit: { type: Number, default: 500, min: 1 },
    usedCount: { type: Number, default: 0 },
    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);