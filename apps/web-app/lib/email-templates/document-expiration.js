/**
 * Document Expiration Alert Email Template
 */

// const nodemailer = require("nodemailer"); // DISABLED - nodemailer removed

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

async function sendDocumentExpirationAlert({ recipientEmail, recipientName, isLandlord, documents }) {
  if (!transporter) {
    console.log('⚠️  Gmail not configured. Email not sent.');
    console.log('📧 Would have sent document expiration alert to:', recipientEmail);
    return { success: true, message: 'Email sending skipped (no Gmail configured)' };
  }

  try {
    const daysUntilExpiry = Math.ceil((new Date(documents[0].expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    const subject = `📄 Document Expiration Alert - ${documents.length} document${documents.length > 1 ? 's' : ''} expiring soon`;

    console.log(`📧 Sending document expiration alert via Gmail...`);
    console.log('   To:', recipientEmail);
    console.log('   Documents:', documents.length);
    console.log('   Days until expiry:', daysUntilExpiry);

    const documentList = documents.map(doc => {
      const formattedDate = new Date(doc.expirationDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const days = Math.ceil((new Date(doc.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
      return `
        <div style="padding: 15px; background: ${days <= 7 ? '#fce8e6' : '#fff3cd'}; border-left: 4px solid ${days <= 7 ? '#ea4335' : '#fbbc04'}; margin: 10px 0; border-radius: 4px;">
          <div style="font-weight: 600; color: #333; margin-bottom: 5px;">${doc.originalName || doc.fileName}</div>
          <div style="font-size: 14px; color: #5f6368;">
            <span style="color: ${days <= 7 ? '#ea4335' : '#fbbc04'}; font-weight: 600;">Expires: ${formattedDate}</span>
            <span style="margin-left: 10px;">(${days} day${days !== 1 ? 's' : ''} remaining)</span>
          </div>
          ${doc.category ? `<div style="font-size: 12px; color: #5f6368; margin-top: 5px;">Category: ${doc.category}</div>` : ''}
        </div>
      `;
    }).join('');

    const info = await transporter.sendMail({
      from: `"Pinaka Property Management" <${process.env.GMAIL_USER}>`,
      to: recipientEmail,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #fbbc04 0%, #ea4335 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .button { display: inline-block; padding: 12px 24px; background: #1a73e8; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e8eaed; color: #5f6368; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">📄 Document Expiration Alert</h1>
            </div>
            <div class="content">
              <p>Hi ${recipientName},</p>
              
              <p>This is a reminder that ${documents.length} document${documents.length > 1 ? 's are' : ' is'} expiring soon. Please review and renew them before they expire.</p>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #1a73e8;">
                  📋 Expiring Documents
                </h3>
                ${documentList}
              </div>
              
              <div class="info-box" style="background: #e8f5e9; border-left: 4px solid #34a853;">
                <h3 style="margin-top: 0; color: #34a853;">💡 Action Required</h3>
                <ul style="padding-left: 20px; margin: 10px 0;">
                  <li>Review each document and its expiration date</li>
                  <li>Renew or update documents before they expire</li>
                  <li>Upload new documents to your portal if needed</li>
                  <li>Contact ${isLandlord ? 'your tenant' : 'your landlord'} if you have questions</li>
                </ul>
              </div>
              
              <p style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXTAUTH_URL || 'https://pinaka.app'}/${isLandlord ? 'lld' : 'tnt'}/library" class="button">
                  View Documents
                </a>
              </p>
              
              <p style="font-size: 14px; color: #5f6368; margin-top: 30px;">
                Please take action on these documents to ensure compliance and avoid any issues.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Pinaka Property Management</p>
              <p>This is an automated reminder. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('✅ Document expiration alert email sent successfully!');
    console.log('   Message ID:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending document expiration alert email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { sendDocumentExpirationAlert };

