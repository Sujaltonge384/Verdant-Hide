// server/src/routes/orderRoutes.js
const router = require('express').Router();
const { z } = require('zod');
const validate = require('../middleware/validate');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  createPaymentOrder,
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

const placeOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1),
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
  shippingAddress: z.object({
    fullName: z.string().min(2, 'Full name is required'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
    addressLine: z.string().min(5, 'Complete street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  }),
  paymentMethod: z.enum(['COD', 'UPI', 'CARD']),
  paymentDetails: z.any().optional(),
});

router.post('/create-payment', protect, createPaymentOrder);
router.post('/', protect, validate(placeOrderSchema), createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/', protect, adminOnly, getAllOrders);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;