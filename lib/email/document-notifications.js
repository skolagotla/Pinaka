/**
 * Document Expiration Email Notifications
 * Handles sending reminder emails for expiring documents
 */

const nodemailer = require('nodemailer');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);

let transporter = null;

if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

/**
 * Send expiration reminder email to tenant
 */
async function sendExpirationReminder(tenant, document, landlord, daysRemaining) {
  const { getCategoryById } = require('../constants/document-categories');
  const category = getCategoryById(document.category);
  
  const urgency = daysRemaining <= 7 ? 'URGENT' : 'REMINDER';
  const urgencyColor = daysRemaining <= 7 ? '#f5222d' : '#faad14';
  
  const subject = daysRemaining <= 7
    ? `🚨 URGENT: Your ${category?.name || document.category} expires in ${daysRemaining} days`
    : `⚠️ Reminder: Your ${category?.name || document.category} expires in ${daysRemaining} days`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document Expiration Reminder</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">📄 Document Expiration ${urgency}</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e8e8e8; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong>${tenant.firstName} ${tenant.lastName}</strong>,</p>
          
          <div style="background: ${daysRemaining <= 7 ? '#fff1f0' : '#fffbe6'}; border-left: 4px solid ${urgencyColor}; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 18px; color: ${urgencyColor}; font-weight: bold;">
              ${daysRemaining <= 7 ? '🚨 URGENT ACTION REQUIRED' : '⚠️ ACTION REQUIRED'}
            </p>
          </div>
          
          <p style="font-size: 15px;">Your <strong>${category?.name || document.category}</strong> is expiring soon and requires your immediate attention.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #667eea;">Document Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 40%;">Document Name:</td>
                <td style="padding: 8px 0; font-weight: bold;">${document.originalName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Category:</td>
                <td style="padding: 8px 0; font-weight: bold;">${category?.name || document.category}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Expiration Date:</td>
                <td style="padding: 8px 0; font-weight: bold; color: ${urgencyColor};">
                  ${dayjs(document.expirationDate).format('MMMM D, YYYY')}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Days Remaining:</td>
                <td style="padding: 8px 0; font-weight: bold; color: ${urgencyColor}; font-size: 18px;">
                  ${daysRemaining} days
                </td>
              </tr>
            </table>
          </div>
          
          <div style="background: #e6f7ff; border: 1px solid #91d5ff; padding: 15px; border-radius: 8px; margin: 25px 0;">
            <h4 style="margin-top: 0; color: #0050b3;">📋 What You Need to Do</h4>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Renew or update your ${category?.name || document.category}</li>
              <li style="margin-bottom: 8px;">Upload the new document to your tenant portal</li>
              <li style="margin-bottom: 8px;">Ensure the expiration date is updated</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/documents" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
              📤 Upload New Document
            </a>
          </div>
          
          ${daysRemaining <= 7 ? `
          <div style="background: #fff1f0; border: 1px solid #ffa39e; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #cf1322; font-weight: bold;">
              ⚠️ This is an urgent reminder. Expired documents may affect your lease status.
            </p>
          </div>
          ` : ''}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e8e8e8;">
            <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
              <strong>Need Help?</strong><br>
              Contact your landlord:<br>
              ${landlord.firstName} ${landlord.lastName}<br>
              📧 ${landlord.email}
              ${landlord.phoneNumber ? `<br>📱 ${landlord.phoneNumber}` : ''}
            </p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p style="margin: 5px 0;">This is an automated reminder from Pinaka Property Management</p>
          <p style="margin: 5px 0;">Please do not reply to this email</p>
        </div>
      </body>
    </html>
  `;

  try {
    if (!transporter) {
      console.log('⚠️  Gmail not configured. Email not sent.');
      return { success: true, skipped: true };
    }

    const info = await transporter.sendMail({
      from: `"Pinaka Property Management" <${process.env.GMAIL_USER}>`,
      to: tenant.email,
      subject,
      html,
    });

    console.log(`[Email] Expiration reminder sent to ${tenant.email} for ${document.originalName}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email] Error sending expiration reminder:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Send post-lease document reminder (Updated ID)
 */
async function sendPostLeaseDocumentReminder(tenant, document, landlord, daysOverdue) {
  const { getCategoryById } = require('../constants/document-categories');
  const category = getCategoryById(document.category);
  
  const isOverdue = daysOverdue > 0;
  const subject = isOverdue
    ? `🚨 OVERDUE: ${category?.name || document.category} required`
    : `⚠️ Reminder: ${category?.name || document.category} due soon`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Required Document Reminder</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">📄 Required Document ${isOverdue ? 'OVERDUE' : 'Reminder'}</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e8e8e8; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong>${tenant.firstName} ${tenant.lastName}</strong>,</p>
          
          <div style="background: ${isOverdue ? '#fff1f0' : '#fffbe6'}; border-left: 4px solid ${isOverdue ? '#f5222d' : '#faad14'}; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 18px; color: ${isOverdue ? '#f5222d' : '#faad14'}; font-weight: bold;">
              ${isOverdue ? '🚨 DOCUMENT OVERDUE' : '⚠️ ACTION REQUIRED'}
            </p>
          </div>
          
          <p style="font-size: 15px;">
            As part of your lease agreement, you are required to submit your <strong>${category?.name || document.category}</strong> 
            within 30 days of lease signing.
          </p>
          
          ${isOverdue ? `
          <div style="background: #fff1f0; border: 1px solid #ffa39e; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #cf1322; font-weight: bold;">
              ⚠️ This document is now <strong>${daysOverdue} days overdue</strong>. Please upload it immediately to remain in compliance with your lease.
            </p>
          </div>
          ` : ''}
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #667eea;">Required Document</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 40%;">Document Type:</td>
                <td style="padding: 8px 0; font-weight: bold;">${category?.name || document.category}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Status:</td>
                <td style="padding: 8px 0; font-weight: bold; color: ${isOverdue ? '#f5222d' : '#faad14'};">
                  ${isOverdue ? 'Overdue' : 'Due Soon'}
                </td>
              </tr>
            </table>
          </div>
          
          <div style="background: #e6f7ff; border: 1px solid #91d5ff; padding: 15px; border-radius: 8px; margin: 25px 0;">
            <h4 style="margin-top: 0; color: #0050b3;">📋 What You Need to Do</h4>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Obtain your ${category?.name || document.category} showing your current rental address</li>
              <li style="margin-bottom: 8px;">Upload the document to your tenant portal</li>
              <li style="margin-bottom: 8px;">Ensure all information is clear and legible</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/documents" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
              📤 Upload Document Now
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e8e8e8;">
            <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
              <strong>Need Help?</strong><br>
              Contact your landlord:<br>
              ${landlord.firstName} ${landlord.lastName}<br>
              📧 ${landlord.email}
              ${landlord.phoneNumber ? `<br>📱 ${landlord.phoneNumber}` : ''}
            </p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p style="margin: 5px 0;">This is an automated reminder from Pinaka Property Management</p>
          <p style="margin: 5px 0;">Please do not reply to this email</p>
        </div>
      </body>
    </html>
  `;

  try {
    if (!transporter) {
      console.log('⚠️  Gmail not configured. Email not sent.');
      return { success: true, skipped: true };
    }

    const info = await transporter.sendMail({
      from: `"Pinaka Property Management" <${process.env.GMAIL_USER}>`,
      to: tenant.email,
      subject,
      html,
    });

    console.log(`[Email] Post-lease reminder sent to ${tenant.email} for ${category?.name}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email] Error sending post-lease reminder:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Send landlord notification about expiring tenant documents
 */
async function sendLandlordExpirationNotification(landlord, expiringDocuments) {
  if (expiringDocuments.length === 0) return { success: true, skipped: true };

  const subject = `⚠️ ${expiringDocuments.length} tenant document(s) expiring soon`;

  const documentsList = expiringDocuments.map(item => {
    const { getCategoryById } = require('../constants/document-categories');
    const category = getCategoryById(item.document.category);
    
    return `
      <tr style="border-bottom: 1px solid #e8e8e8;">
        <td style="padding: 12px; font-weight: bold;">${item.tenant.firstName} ${item.tenant.lastName}</td>
        <td style="padding: 12px;">${category?.name || item.document.category}</td>
        <td style="padding: 12px;">${item.document.originalName}</td>
        <td style="padding: 12px; color: ${item.daysRemaining <= 7 ? '#f5222d' : '#faad14'}; font-weight: bold;">
          ${item.daysRemaining} days
        </td>
      </tr>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Expiring Documents Alert</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">⚠️ Tenant Documents Expiring Soon</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e8e8e8; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong>${landlord.firstName} ${landlord.lastName}</strong>,</p>
          
          <p style="font-size: 15px;">
            The following tenant documents are expiring soon and may require your attention:
          </p>
          
          <div style="margin: 25px 0; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; background: #f5f5f5; border-radius: 8px; overflow: hidden;">
              <thead>
                <tr style="background: #667eea; color: white;">
                  <th style="padding: 12px; text-align: left;">Tenant</th>
                  <th style="padding: 12px; text-align: left;">Category</th>
                  <th style="padding: 12px; text-align: left;">Document</th>
                  <th style="padding: 12px; text-align: left;">Days Left</th>
                </tr>
              </thead>
              <tbody>
                ${documentsList}
              </tbody>
            </table>
          </div>
          
          <div style="background: #e6f7ff; border: 1px solid #91d5ff; padding: 15px; border-radius: 8px; margin: 25px 0;">
            <h4 style="margin-top: 0; color: #0050b3;">💡 Recommended Actions</h4>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Review the expiring documents in your landlord portal</li>
              <li style="margin-bottom: 8px;">Contact tenants if documents are critical (e.g., renters insurance)</li>
              <li style="margin-bottom: 8px;">Send reminders for documents that need renewal</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/documents" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
              📋 View Document Vault
            </a>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p style="margin: 5px 0;">This is an automated notification from Pinaka Property Management</p>
          <p style="margin: 5px 0;">You receive this email because you have tenant documents expiring soon</p>
        </div>
      </body>
    </html>
  `;

  try {
    if (!transporter) {
      console.log('⚠️  Gmail not configured. Email not sent.');
      return { success: true, skipped: true };
    }

    const info = await transporter.sendMail({
      from: `"Pinaka Property Management" <${process.env.GMAIL_USER}>`,
      to: landlord.email,
      subject,
      html,
    });

    console.log(`[Email] Landlord notification sent to ${landlord.email} for ${expiringDocuments.length} documents`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email] Error sending landlord notification:`, error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendExpirationReminder,
  sendPostLeaseDocumentReminder,
  sendLandlordExpirationNotification,
};

