// server/src/models/Product.js
const mongoose = require('mongoose');

const variantThemeSchema = new mongoose.Schema(
  {
    bg: { type: String, required: true },
    text: { type: String, required: true },
    mutedText: { type: String, required: true },
    accent: { type: String, required: true },
    buttonBg: { type: String, required: true },
    buttonText: { type: String, required: true },
    isDark: { type: Boolean, default: false },
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema({
  colorName: { type: String, required: true },   // e.g. "Obsidian Black & Brass"
  variantTitle: { type: String },                // Optional custom headline per color
  variantNote: { type: String },                 // Optional color-specific description
  colorHex: { type: String, required: true },
  imageUrl: { type: String, required: true },
  gallery: [{ type: String }],
  sku: { type: String, required: true },
  stock: { type: Number, required: true, min: 0, default: 15 },
  theme: { type: variantThemeSchema, required: true },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: {
      type: String,
      enum: ['backpacks', 'travel-bags', 'handbags', 'wallets', 'accessories'],
      required: true,
    },
    categoryLabel: { type: String, required: true },
    material: { type: String, required: true },
    materialOrigin: { type: String, required: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    careInstructions: { type: String, required: true },
    dimensions: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    rating: { type: Number, default: 4.9, min: 0, max: 5 },
    reviewCount: { type: Number, default: 120 },
    specs: [{ type: String }],
    variants: {
      type: [variantSchema],
      validate: [(v) => v.length > 0, 'At least one color variant is required'],
    },
    featuredInShowcase: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);