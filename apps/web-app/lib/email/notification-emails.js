/**
 * Notification Email Templates
 * DISABLED - nodemailer removed
 * Email functionality has been disabled
 */

// const nodemailer = require('nodemailer');
// const config = require('../config/app-config').default || require('../config/app-config');

// let transporter = null;

// Initialize transporter - DISABLED
// if (config.email?.gmail?.isConfigured) {
//   transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: config.email.gmail.user,
//       pass: config.email.gmail.appPassword,
//     },
//   });
// }

/**
 * Send notification email
 * DISABLED - Returns success without sending
 */
async function sendNotificationEmail({
  to,
  type,
  title,
  message,
  actionUrl = null,
  metadata = {},
}) {
  // Email functionality disabled - nodemailer removed
  console.warn('[Email] Email sending disabled - nodemailer removed');
  console.log('[Email] Would send:', { to, type, title });
  
  // Return success to prevent errors in calling code
  return {
    success: true,
    messageId: 'disabled',
    message: 'Email functionality disabled',
  };
}

module.exports = {
  sendNotificationEmail,
};
