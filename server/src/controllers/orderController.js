// server/src/controllers/orderController.js
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
// server/src/controllers/orderController.js
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// Step 1: Calculate verified total & create Razorpay order (if keys exist)
exports.createPaymentOrder = asyncHandler(async (req, res) => {
  const { items } = req.body;
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

  const rzp = getRazorpayInstance();
  if (!rzp) {
    // Sandbox mode when Razorpay keys aren't configured yet
    return res.json({
      success: true,
      sandbox: true,
      amount: totalAmount * 100,
      currency: 'INR',
      razorpayOrderId: `sandbox_order_${Date.now()}`,
    });
  }

  const rzpOrder = await rzp.orders.create({
    amount: totalAmount * 100, // in paise
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

// Step 2: Verify payment & place order in MongoDB
exports.createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, paymentDetails } = req.body;
  if (!items || items.length === 0) {
    const err = new Error('No order items provided');
    err.statusCode = 400;
    throw err;
  }

  // Verify Razorpay signature if live keys are active & method isn't COD
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
      const err = new Error(`Sorry, "${product.name}" (${variant?.colorName || ''}) is out of stock.`);
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

  const order = await Order.create({
    user: req.user._id,
    orderNumber: `VH-${Date.now().toString().slice(-6)}`,
    items: verifiedItems,
    shippingAddress,
    totalAmount,
    paymentMethod,
    paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
  });

  await User.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });

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
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { orderStatus: req.body.orderStatus },
    { new: true, runValidators: true }
  );
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, order });
});

exports.createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;
  if (!items || items.length === 0) {
    const err = new Error('No order items provided');
    err.statusCode = 400;
    throw err;
  }

  // Server-side price & stock verification
  let totalAmount = 0;
  const verifiedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      const err = new Error(`Product not found: ${item.productId}`);
      err.statusCode = 404;
      throw err;
    }

    const variant = product.variants.id(item.variantId);
    if (!variant || variant.stock < item.quantity) {
      const err = new Error(`Insufficient stock for ${product.name}`);
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

  const order = await Order.create({
    user: req.user._id,
    orderNumber: `VH-${Date.now().toString().slice(-6)}`,
    items: verifiedItems,
    shippingAddress,
    totalAmount,
    paymentMethod,
    paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
  });

  // Clear user's cart after order
  await User.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });

  res.status(201).json({ success: true, order });
});

exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// Admin: View All Orders
exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// Admin: Update Order Status
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { orderStatus: req.body.orderStatus },
    { new: true, runValidators: true }
  );
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, order });
});