// server/src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Trust Render's reverse proxy (required for express-rate-limit in production)
app.set('trust proxy', 1);

// 1. Security HTTP Headers
app.disable('x-powered-by');
app.use(helmet());

// 2. Production CORS (supports Vercel production + preview URLs + localhost)
const allowedOrigins = [
  process.env.CLIENT_URL?.replace(/\/$/, ''),
  'https://verdant-hide.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Cap payload size to prevent DoS
app.use(express.json({ limit: '10kb' }));

// 4. Custom NoSQL Injection Sanitizer (strips $ and . keys recursively)
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      sanitizeObject(obj[key]);
    }
  }
  return obj;
};
app.use((req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.params) sanitizeObject(req.params);
  next();
});

// 5. General & Strict Auth Rate Limiters
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use(
  '/api/v1/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
      success: false,
      message: 'Too many login attempts. Try again in 15 minutes.',
    },
  })
);

// Health & Root Endpoints
app.get('/', (req, res) =>
  res.json({ success: true, message: 'Verdant Hide API is live' })
);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// API Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/products', require('./routes/productRoutes'));
app.use('/api/v1/user', require('./routes/userRoutes'));
app.use('/api/v1/orders', require('./routes/orderRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));
app.use('/api/v1/coupons', require('./routes/couponRoutes'));
app.use('/api/v1/support', require('./routes/supportRoutes'));
app.use(errorHandler);

module.exports = app;