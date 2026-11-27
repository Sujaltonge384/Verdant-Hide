// server/src/utils/mailer.js
const nodemailer = require('nodemailer');

const getTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
};

exports.sendEmailSafe = async ({ to, subject, html }) => {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.log(`[Email Skipped - SMTP not configured] To: ${to} | ${subject}`);
      return;
    }
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('Email failed (non-blocking):', err.message);
  }
};