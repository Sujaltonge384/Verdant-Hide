// server/src/models/Order.js
const mongoose = require('mongoose');



const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    colorName: { type: String, required: true },
    sku: { type: String, required: true },
    imageUrl: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, required: true, unique: true },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['COD', 'UPI', 'CARD'], default: 'UPI' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
    orderStatus: {
      type: String,
      enum: ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Placed',
    },
    courierName: { type: String, default: '' },
    trackingNumber: { type: String, default: '' },
    subtotalAmount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    discountAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);


module.exports = mongoose.model('Order', orderSchema);