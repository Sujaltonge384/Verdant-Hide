// server/src/controllers/uploadController.js
const cloudinary = require('cloudinary').v2;
const asyncHandler = require('../utils/asyncHandler');

exports.uploadImage = asyncHandler(async (req, res) => {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    const err = new Error('Cloudinary is not configured yet. Add keys in server/.env or paste an image URL.');
    err.statusCode = 400;
    throw err;
  }

  if (!req.file) {
    const err = new Error('Please choose an image file (PNG, JPG, or WebP)');
    err.statusCode = 400;
    throw err;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'verdant-hide/products', resource_type: 'image' },
      (error, resUpload) => {
        if (error) reject(error);
        else resolve(resUpload);
      }
    );
    stream.end(req.file.buffer);
  });

  res.status(201).json({ success: true, url: result.secure_url });
});