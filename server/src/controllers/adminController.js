// server/src/controllers/adminController.js
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const StoreConfig = require('../models/StoreConfig');
const asyncHandler = require('../utils/asyncHandler');

// Replace exports.getOverview in server/src/controllers/adminController.js
exports.getOverview = asyncHandler(async (req, res) => {
  const [orders, products, customers] = await Promise.all([
    Order.find().populate('user', 'name email').sort({ createdAt: -1 }),
    Product.find().sort({ displayOrder: 1, createdAt: -1 }),
    User.find({ role: 'customer' }).select('name email phone createdAt').sort({ createdAt: -1 }),
  ]);

  const validOrders = orders.filter((o) => o.orderStatus !== 'Cancelled');
  const totalRevenue = validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const aov = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;

  const activeListings = products.filter((p) => p.isActive).length;
  const draftListings = products.filter((p) => !p.isActive).length;

  let lowStockCount = 0;
  let soldOutCount = 0;
  const productCategoryMap = {};

  products.forEach((p) => {
    productCategoryMap[p._id.toString()] = p.categoryLabel || p.category;
    p.variants.forEach((v) => {
      if (v.stock === 0) soldOutCount += 1;
      else if (v.stock <= 5) lowStockCount += 1;
    });
  });

  // 1. Last 7 Days Revenue & Order Trend
  const dailyMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    dailyMap[key] = { date: key, label, revenue: 0, orders: 0 };
  }
  validOrders.forEach((o) => {
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    if (dailyMap[key]) {
      dailyMap[key].revenue += o.totalAmount || 0;
      dailyMap[key].orders += 1;
    }
  });
  const dailyTrend = Object.values(dailyMap);

  // 2. Category Revenue, Top Products & Payment Split
  const categoryRevenueMap = {};
  const topProductMap = {};
  const paymentSplit = { UPI: 0, CARD: 0, COD: 0 };
  const statusCounts = { Placed: 0, Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };

  orders.forEach((o) => {
    if (statusCounts[o.orderStatus] !== undefined) statusCounts[o.orderStatus] += 1;
    if (o.orderStatus === 'Cancelled') return;

    if (paymentSplit[o.paymentMethod] !== undefined) {
      paymentSplit[o.paymentMethod] += o.totalAmount || 0;
    }

    (o.items || []).forEach((item) => {
      const lineTotal = (item.price || 0) * (item.quantity || 1);
      const cat = productCategoryMap[item.product?.toString()] || 'Other';
      categoryRevenueMap[cat] = (categoryRevenueMap[cat] || 0) + lineTotal;

      if (!topProductMap[item.name]) {
        topProductMap[item.name] = { name: item.name, units: 0, revenue: 0, imageUrl: item.imageUrl };
      }
      topProductMap[item.name].units += item.quantity || 1;
      topProductMap[item.name].revenue += lineTotal;
    });
  });

  const categorySales = Object.entries(categoryRevenueMap)
    .map(([category, revenue]) => ({ category, revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  const topProducts = Object.values(topProductMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  res.json({
    success: true,
    stats: {
      totalRevenue,
      aov,
      totalOrders: orders.length,
      totalCustomers: customers.length,
      activeListings,
      draftListings,
      lowStockCount,
      soldOutCount,
    },
    analytics: {
      dailyTrend,
      categorySales,
      topProducts,
      paymentSplit,
      statusCounts,
    },
    orders,
    products,
    customers,
  });
});

exports.getSettings = asyncHandler(async (req, res) => {
  let config = await StoreConfig.findOne();
  if (!config) config = await StoreConfig.create({});
  res.json({ success: true, config });
});

exports.updateSettings = asyncHandler(async (req, res) => {
  let config = await StoreConfig.findOne();
  if (!config) {
    config = await StoreConfig.create(req.body);
  } else {
    Object.assign(config, req.body);
    await config.save();
  }
  res.json({ success: true, config });
});