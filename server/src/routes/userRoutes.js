// server/src/routes/userRoutes.js
const router = require('express').Router();
const { z } = require('zod');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const {
  syncCart,
  toggleWishlist,
  updateProfile,
  addAddress,
  deleteAddress,
} = require('../controllers/userController');

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^$|^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number').optional(),
});

const addressSchema = z.object({
  label: z.string().min(1).default('Home'),
  fullName: z.string().min(2),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
  addressLine: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid 6-digit pincode'),
  isDefault: z.boolean().optional(),
});

router.post('/cart', protect, syncCart);
router.post('/wishlist', protect, toggleWishlist);
router.put('/profile', protect, validate(profileSchema), updateProfile);
router.post('/addresses', protect, validate(addressSchema), addAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

module.exports = router;