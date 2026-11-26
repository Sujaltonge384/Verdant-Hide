// server/src/routes/authRoutes.js
const router = require('express').Router();
const { z } = require('zod');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const { register, login, getMe } = require('../controllers/authController');

const registerSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/(?=.*[A-Za-z])(?=.*\d)/, 'Password must include both letters and numbers'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});



router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);

module.exports = router;