// server/src/controllers/couponController.js
const Coupon = require('../models/Coupon');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

exports.calculateCouponDiscount = async (code, subtotal, items = []) => {
  if (!code) return { discount: 0, coupon: null };

  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });
  if (!coupon) {
    throw Object.assign(new Error('Invalid or paused promo code'), { statusCode: 400 });
  }

  const now = new Date();
  if (coupon.startsAt && new Date(coupon.startsAt) > now) {
    throw Object.assign(new Error('This promo code is not active yet'), { statusCode: 400 });
  }
  if (new Date(coupon.expiresAt) < now) {
    throw Object.assign(new Error('This promo code has expired'), { statusCode: 400 });
  }
  if (coupon.usedCount >= coupon.usageLimit) {
    throw Object.assign(new Error('Promo code usage limit reached'), { statusCode: 400 });
  }
  if (subtotal < coupon.minOrderAmount) {
    throw Object.assign(
      new Error(
        `Minimum purchase of ₹${coupon.minOrderAmount.toLocaleString('en-IN')} required for ${coupon.code}`
      ),
      { statusCode: 400 }
    );
  }

  // Category eligibility check (if coupon is restricted to a category and items are supplied)
  let eligibleSubtotal = subtotal;
  if (coupon.applicableCategory && coupon.applicableCategory !== 'all' && items.length > 0) {
    eligibleSubtotal = 0;
    for (const item of items) {
      const prod = await Product.findById(item.productId).select('category price');
      if (prod && prod.category === coupon.applicableCategory) {
        eligibleSubtotal += prod.price * item.quantity;
      }
    }
    if (eligibleSubtotal === 0) {
      throw Object.assign(
        new Error(`${coupon.code} is valid only on ${coupon.applicableCategory} items.`),
        { statusCode: 400 }
      );
    }
  }

  let discount =
    coupon.discountType === 'PERCENT'
      ? Math.round((eligibleSubtotal * coupon.value) / 100)
      : coupon.value;

  if (coupon.maxDiscount && coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
    discount = coupon.maxDiscount;
  }
  discount = Math.min(discount, eligibleSubtotal);

  return { discount, coupon };
};

exports.validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal, items } = req.body;
  const { discount, coupon } = await exports.calculateCouponDiscount(
    code,
    Number(subtotal || 0),
    items || []
  );
  res.json({
    success: true,
    code: coupon.code,
    discount,
    message: `${coupon.code} applied — you save ₹${discount.toLocaleString('en-IN')}!`,
  });
});

exports.getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, coupons });
});

exports.createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
});

exports.updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!coupon) {
    throw Object.assign(new Error('Coupon not found'), { statusCode: 404 });
  }
  res.json({ success: true, coupon });
});

exports.deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Coupon deleted' });
});