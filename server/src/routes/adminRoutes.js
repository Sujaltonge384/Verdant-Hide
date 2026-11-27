// server/src/routes/adminRoutes.js
const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getOverview,
  getSettings,
  updateSettings,
} = require('../controllers/adminController');

const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});
const { uploadImage } = require('../controllers/uploadController');

router.post('/upload', upload.single('image'), uploadImage);

router.use(protect, adminOnly);

router.get('/overview', getOverview);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;