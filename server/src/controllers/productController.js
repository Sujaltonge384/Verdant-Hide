// server/src/controllers/productController.js
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

exports.getProducts = asyncHandler(async (req, res) => {
  const { category, showcase, search } = req.query;
  const filter = { isActive: true };

  if (category && category !== 'all') filter.category = category;
  if (showcase === 'true') filter.featuredInShowcase = true;
  if (search) filter.name = { $regex: search, $options: 'i' };

  const products = await Product.find(filter).sort({ displayOrder: 1, createdAt: -1 });
  res.json({ success: true, count: products.length, products });
});

exports.getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true });
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  const similar = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  }).limit(3);

  res.json({ success: true, product, similar });
});

// Admin: Create Product
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

// Admin: Update Product
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, product });
});

// Admin: Delete Product
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, message: 'Product removed' });
});