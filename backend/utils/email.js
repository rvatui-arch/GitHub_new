/**
 * Email Utility Functions
 * Email sending and templates
 */

const transporter = require('../config/email');
const logger = require('./logger');

/**
 * Send email
 */
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}`, { messageId: info.messageId });
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Email verification template
 */
const verificationEmailTemplate = (link) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2>Verify Your Email</h2>
      <p>Please click the link below to verify your email address:</p>
      <a href="${link}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Verify Email
      </a>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create this account, please ignore this email.</p>
    </div>
  `;
};

/**
 * Password reset template
 */
const passwordResetTemplate = (link) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2>Reset Your Password</h2>
      <p>You requested a password reset. Click the link below:</p>
      <a href="${link}" style="background-color: #ff6b6b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;
};

/**
 * Order confirmation template
 */
const orderConfirmationTemplate = (orderNumber, totalAmount) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2>Order Confirmation</h2>
      <p>Thank you for your order!</p>
      <p><strong>Order Number:</strong> ${orderNumber}</p>
      <p><strong>Total Amount:</strong> $${totalAmount}</p>
      <p>You will receive shipping updates via email.</p>
    </div>
  `;
};

/**
 * Shipment notification template
 */
const shipmentTemplate = (trackingNumber) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2>Your Order Has Shipped</h2>
      <p>Your order is on its way!</p>
      <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
      <p>You can track your package using the tracking number above.</p>
    </div>
  `;
};

module.exports = {
  sendEmail,
  verificationEmailTemplate,
  passwordResetTemplate,
  orderConfirmationTemplate,
  shipmentTemplate,
};
