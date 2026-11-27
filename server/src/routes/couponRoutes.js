const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  deleteCoupon,
} = require('../controllers/couponController');

router.post('/validate', validateCoupon);
router.get('/', protect, adminOnly, getAllCoupons);
router.post('/', protect, adminOnly, createCoupon);
router.delete('/:id', protect, adminOnly, deleteCoupon);

module.exports = router;