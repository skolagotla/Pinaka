/**
 * Notification Email Templates
 * Email templates for various notification types
 */

const nodemailer = require('nodemailer');
const config = require('../config/app-config').default || require('../config/app-config');

let transporter = null;

// Initialize transporter
if (config.email?.gmail?.isConfigured) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email.gmail.user,
      pass: config.email.gmail.appPassword,
    },
  });
}

/**
 * Send notification email
 */
async function sendNotificationEmail({
  to,
  type,
  title,
  message,
  actionUrl = null,
  actionLabel = null,
}) {
  if (!transporter) {
    console.log('⚠️  Gmail not configured. Email not sent.');
    console.log('📧 Would have sent notification to:', to);
    return { success: true, message: 'Email sending skipped (no Gmail configured)' };
  }

  try {
    const baseUrl = config.auth?.baseUrl || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const actionButton = actionUrl && actionLabel
      ? `
        <div style="margin: 30px 0; text-align: center;">
          <a href="${baseUrl}${actionUrl}" 
             style="background-color: #1890ff; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 600;">
            ${actionLabel}
          </a>
        </div>
      `
      : '';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #1890ff; margin: 0 0 10px 0; font-size: 24px;">Pinaka</h1>
            <p style="color: #666; margin: 0; font-size: 14px;">Property Management Platform</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0; font-size: 20px;">${title}</h2>
            <div style="color: #666; font-size: 16px; margin: 20px 0;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            ${actionButton}
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e8e8e8; text-align: center; color: #999; font-size: 12px;">
            <p>This is an automated notification from Pinaka.</p>
            <p>You can manage your notification preferences in your account settings.</p>
          </div>
        </body>
      </html>
    `;

    const text = `${title}\n\n${message}${actionUrl ? `\n\n${actionLabel}: ${baseUrl}${actionUrl}` : ''}`;

    const info = await transporter.sendMail({
      from: `"Pinaka" <${config.email.gmail.user}>`,
      to,
      subject: title,
      text,
      html,
    });

    console.log('✅ Notification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending notification email:', error);
    throw error;
  }
}

module.exports = {
  sendNotificationEmail,
};

