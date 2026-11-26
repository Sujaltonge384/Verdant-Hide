// server/src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// 1. Security HTTP Headers
app.disable('x-powered-by');
app.use(helmet());

// 2. Strict CORS
app.use(
  cors({
    origin: [process.env.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'].filter(Boolean),
    credentials: true,
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
    message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
  })
);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/products', require('./routes/productRoutes'));
app.use('/api/v1/user', require('./routes/userRoutes'));
app.use('/api/v1/orders', require('./routes/orderRoutes'));

app.use(errorHandler);

module.exports = app;