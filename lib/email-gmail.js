/**
 * Gmail Email Service
 * DISABLED - nodemailer removed
 * All email functionality has been disabled
 */

// const nodemailer = require('nodemailer'); // DISABLED - nodemailer removed

let transporter = null;

// Initialize Gmail transporter - DISABLED
// if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
//   transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.GMAIL_USER,
//       pass: process.env.GMAIL_APP_PASSWORD,
//     },
//   });
//   console.log('✅ Gmail SMTP configured');
// } else {
//   console.log('⚠️  Gmail SMTP not configured - add GMAIL_USER and GMAIL_APP_PASSWORD to .env');
// }

// All email functions disabled - return success without sending
async function sendTenantInvitation({ tenantEmail, tenantName, invitationToken, landlordName }) {
  console.warn('[Email] Email sending disabled - nodemailer removed');
  return { success: true, message: 'Email functionality disabled' };
}

async function sendPMCInvitation({ pmcEmail, pmcName, invitationToken, inviterName }) {
  console.warn('[Email] Email sending disabled - nodemailer removed');
  return { success: true, message: 'Email functionality disabled' };
}

async function sendLandlordInvitation({ landlordEmail, landlordName, invitationToken, inviterName }) {
  console.warn('[Email] Email sending disabled - nodemailer removed');
  return { success: true, message: 'Email functionality disabled' };
}

async function sendLandlordApproval({ landlordEmail, landlordName, adminName }) {
  console.warn('[Email] Email sending disabled - nodemailer removed');
  return { success: true, message: 'Email functionality disabled' };
}

async function sendLandlordRejection({ landlordEmail, landlordName, adminName, reason }) {
  console.warn('[Email] Email sending disabled - nodemailer removed');
  return { success: true, message: 'Email functionality disabled' };
}

async function sendTenantApproval({ tenantEmail, tenantName, landlordName }) {
  console.warn('[Email] Email sending disabled - nodemailer removed');
  return { success: true, message: 'Email functionality disabled' };
}

async function sendTenantRejection({ tenantEmail, tenantName, landlordName, reason }) {
  console.warn('[Email] Email sending disabled - nodemailer removed');
  return { success: true, message: 'Email functionality disabled' };
}

module.exports = {
  sendTenantInvitation,
  sendPMCInvitation,
  sendLandlordInvitation,
  sendLandlordApproval,
  sendLandlordRejection,
  sendTenantApproval,
  sendTenantRejection,
};
