// server/src/controllers/supportController.js
const SupportCase = require('../models/SupportCase');
const asyncHandler = require('../utils/asyncHandler');
const { sendEmailSafe } = require('../utils/mailer');

exports.createTicket = asyncHandler(async (req, res) => {
  const { name, email, orderNumber, topic, message } = req.body;
  const ticket = await SupportCase.create({
    caseNumber: `SUP-${Date.now().toString().slice(-6)}`,
    name,
    email,
    orderNumber,
    topic,
    message,
  });

  sendEmailSafe({
    to: email,
    subject: `[${ticket.caseNumber}] Support Request Received — Verdant Hide`,
    html: `<p>Hi ${name},</p><p>We have received your request (${topic}) under reference <strong>${ticket.caseNumber}</strong>. Our Grievance & Client Care team acknowledges enquiries within 48 hours.</p>`,
  });

  res.status(201).json({ success: true, ticket });
});

exports.getAllTickets = asyncHandler(async (req, res) => {
  const tickets = await SupportCase.find().sort({ createdAt: -1 });
  res.json({ success: true, tickets });
});

exports.updateTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportCase.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, ticket });
});