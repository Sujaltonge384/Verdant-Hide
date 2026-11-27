// server/src/controllers/orderController.js
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { calculateCouponDiscount } = require('./couponController');
const { sendEmailSafe } = require('../utils/mailer');

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// Step 1: Calculate verified total (with coupon) & create Razorpay order
exports.createPaymentOrder = asyncHandler(async (req, res) => {
  const { items, couponCode } = req.body;
  if (!items || items.length === 0) {
    const err = new Error('Your bag is empty');
    err.statusCode = 400;
    throw err;
  }

  let totalAmount = 0;
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      const err = new Error('One or more products are no longer available');
      err.statusCode = 404;
      throw err;
    }
    const variant = product.variants.id(item.variantId);
    if (!variant || variant.stock < item.quantity) {
      const err = new Error(`Insufficient stock for ${product.name}`);
      err.statusCode = 400;
      throw err;
    }
    totalAmount += product.price * item.quantity;
  }

  const { discount } = await calculateCouponDiscount(couponCode, totalAmount);
  const payableAmount = Math.max(0, totalAmount - discount);

  const rzp = getRazorpayInstance();
  if (!rzp) {
    return res.json({
      success: true,
      sandbox: true,
      amount: payableAmount * 100,
      currency: 'INR',
      razorpayOrderId: `sandbox_order_${Date.now()}`,
    });
  }

  const rzpOrder = await rzp.orders.create({
    amount: payableAmount * 100,
    currency: 'INR',
    receipt: `rcpt_${Date.now()}`,
  });

  res.json({
    success: true,
    sandbox: false,
    amount: rzpOrder.amount,
    currency: rzpOrder.currency,
    razorpayOrderId: rzpOrder.id,
  });
});

// Step 2: Verify payment, apply coupon, deduct stock & place order
exports.createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, paymentDetails, couponCode } = req.body;
  if (!items || items.length === 0) {
    const err = new Error('No order items provided');
    err.statusCode = 400;
    throw err;
  }

  // 1. Verify Razorpay signature if live keys are active & payment is not COD/sandbox
  if (paymentMethod !== 'COD' && process.env.RAZORPAY_KEY_SECRET && !paymentDetails?.sandbox) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      paymentDetails || {};
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSign !== razorpay_signature) {
      const err = new Error('Payment verification failed. Please try again.');
      err.statusCode = 400;
      throw err;
    }
  }

  // 2. Verify products, check stock, deduct stock & calculate subtotal
  let totalAmount = 0;
  const verifiedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }

    const variant = product.variants.id(item.variantId);
    if (!variant || variant.stock < item.quantity) {
      const err = new Error(
        `Sorry, "${product.name}" (${variant?.colorName || ''}) is out of stock.`
      );
      err.statusCode = 400;
      throw err;
    }

    variant.stock -= item.quantity;
    await product.save();

    totalAmount += product.price * item.quantity;
    verifiedItems.push({
      product: product._id,
      name: product.name,
      colorName: variant.colorName,
      sku: variant.sku,
      imageUrl: variant.imageUrl,
      price: product.price,
      quantity: item.quantity,
    });
  }

  // 3. Apply promo code discount server-side
  const { discount, coupon } = await calculateCouponDiscount(couponCode, totalAmount);
  const finalAmount = Math.max(0, totalAmount - discount);

  // 4. Create immutable Order record
  const order = await Order.create({
    user: req.user._id,
    orderNumber: `VH-${Date.now().toString().slice(-6)}`,
    items: verifiedItems,
    shippingAddress,
    subtotalAmount: totalAmount,
    couponCode: coupon ? coupon.code : '',
    discountAmount: discount,
    totalAmount: finalAmount,
    paymentMethod,
    paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
  });

  if (coupon) {
    coupon.usedCount += 1;
    await coupon.save();
  }

  // 5. Clear customer's saved cart
  await User.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });

  // 6. Send Order Confirmation Email (non-blocking)
  sendEmailSafe({
    to: req.user.email,
    subject: `Order Confirmed ${order.orderNumber} — Verdant Hide`,
    html: `<h2>Thank you, ${shippingAddress.fullName}!</h2><p>Your order <strong>${order.orderNumber}</strong> for <strong>₹${finalAmount.toLocaleString('en-IN')}</strong> has been confirmed.</p>`,
  });

  res.status(201).json({ success: true, order });
});

exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, courierName, trackingNumber } = req.body;
  const update = { orderStatus };
  if (courierName !== undefined) update.courierName = courierName;
  if (trackingNumber !== undefined) update.trackingNumber = trackingNumber;

  const order = await Order.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  }).populate('user', 'name email');

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  if (order.user?.email) {
    sendEmailSafe({
      to: order.user.email,
      subject: `Order ${order.orderNumber} Update: ${order.orderStatus}`,
      html: `<p>Your order <strong>${order.orderNumber}</strong> is now <strong>${order.orderStatus}</strong>.${order.trackingNumber ? ` Tracking #: <strong>${order.trackingNumber}</strong>` : ''}</p>`,
    });
  }

  res.json({ success: true, order });
});