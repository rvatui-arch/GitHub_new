/**
 * Email Configuration
 * Nodemailer setup for email notifications
 */

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.log('Email service connection error:', error);
  } else {
    console.log('Email service is ready to send messages');
  }
});

module.exports = transporter;
