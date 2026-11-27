// server/src/models/SupportCase.js
const mongoose = require('mongoose');

const supportCaseSchema = new mongoose.Schema(
  {
    caseNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    orderNumber: { type: String, trim: true, default: '' },
    topic: {
      type: String,
      enum: ['Order Status', 'Return / Exchange', 'Repair / Warranty', 'Material Query', 'Grievance', 'Other'],
      default: 'Other',
    },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['Open', 'Acknowledged', 'In Progress', 'Resolved'],
      default: 'Open',
    },
    adminNote: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupportCase', supportCaseSchema);