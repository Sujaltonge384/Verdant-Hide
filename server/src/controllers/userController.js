// server/src/controllers/userController.js
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

exports.syncCart = asyncHandler(async (req, res) => {
  const { productId, variantId, quantity } = req.body;
  const user = await User.findById(req.user._id);

  const idx = user.cart.findIndex(
    (item) =>
      item.product.toString() === productId &&
      item.variantId.toString() === variantId
  );

  if (quantity <= 0) {
    user.cart = user.cart.filter(
      (item) =>
        !(
          item.product.toString() === productId &&
          item.variantId.toString() === variantId
        )
    );
  } else if (idx > -1) {
    user.cart[idx].quantity = quantity;
  } else {
    user.cart.push({ product: productId, variantId, quantity });
  }

  await user.save();
  await user.populate('cart.product');
  res.json({ success: true, cart: user.cart });
});

exports.toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);

  const exists = user.wishlist.some((id) => id.toString() === productId);
  user.wishlist = exists
    ? user.wishlist.filter((id) => id.toString() !== productId)
    : [...user.wishlist, productId];

  await user.save();
  await user.populate('wishlist');
  res.json({ success: true, wishlist: user.wishlist });
});

// Add inside server/src/controllers/userController.js

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone },
    { new: true, runValidators: true }
  );
  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      addresses: user.addresses,
    },
  });
});

exports.addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ success: true, addresses: user.addresses });
});

exports.deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter(
    (a) => a._id.toString() !== req.params.addressId
  );
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});