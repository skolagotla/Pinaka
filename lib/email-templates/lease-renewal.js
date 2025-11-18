/**
 * Lease Renewal Notification Email Template
 */

const nodemailer = require('nodemailer');

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

async function sendLeaseRenewalReminder({ recipientEmail, recipientName, isLandlord, leaseDetails }) {
  if (!transporter) {
    console.log('⚠️  Gmail not configured. Email not sent.');
    console.log('📧 Would have sent lease renewal reminder to:', recipientEmail);
    return { success: true, message: 'Email sending skipped (no Gmail configured)' };
  }

  try {
    const { propertyAddress, unitName, leaseEndDate, rentAmount, landlordName, tenantNames } = leaseDetails;
    
    const formattedEndDate = new Date(leaseEndDate).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(rentAmount);

    const daysUntilExpiry = Math.ceil((new Date(leaseEndDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    const subject = isLandlord
      ? `📅 Lease Renewal Reminder - ${tenantNames} (${daysUntilExpiry} days)`
      : `📅 Your Lease is Expiring Soon - ${daysUntilExpiry} days remaining`;

    console.log(`📧 Sending lease renewal reminder via Gmail...`);
    console.log('   To:', recipientEmail);
    console.log('   Lease ends:', formattedEndDate);
    console.log('   Days remaining:', daysUntilExpiry);

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
            .header { background: linear-gradient(135deg, #1a73e8 0%, #34a853 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .detail-row { padding: 10px 0; border-bottom: 1px solid #e8eaed; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-weight: 600; color: #5f6368; display: block; margin-bottom: 4px; }
            .detail-value { color: #1a73e8; font-weight: 500; font-size: 16px; }
            .days-highlight { font-size: 28px; font-weight: 700; color: #1a73e8; }
            .button { display: inline-block; padding: 12px 24px; background: #1a73e8; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e8eaed; color: #5f6368; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">📅 Lease Renewal Reminder</h1>
            </div>
            <div class="content">
              <p>Hi ${recipientName},</p>
              
              <p>This is a reminder that a lease is expiring soon. Please review the details below and take appropriate action.</p>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #1a73e8;">
                  📋 Lease Details
                </h3>
                
                <div class="detail-row">
                  <span class="detail-label">Days Until Expiry:</span>
                  <span class="detail-value days-highlight">${daysUntilExpiry} days</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Lease End Date:</span>
                  <span class="detail-value">${formattedEndDate}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Property:</span>
                  <span class="detail-value">${propertyAddress}</span>
                </div>
                
                ${unitName ? `
                <div class="detail-row">
                  <span class="detail-label">Unit:</span>
                  <span class="detail-value">${unitName}</span>
                </div>
                ` : ''}
                
                <div class="detail-row">
                  <span class="detail-label">Monthly Rent:</span>
                  <span class="detail-value">${formattedAmount}</span>
                </div>
                
                ${isLandlord ? `
                <div class="detail-row">
                  <span class="detail-label">Tenant(s):</span>
                  <span class="detail-value">${tenantNames}</span>
                </div>
                ` : `
                <div class="detail-row">
                  <span class="detail-label">Landlord:</span>
                  <span class="detail-value">${landlordName}</span>
                </div>
                `}
              </div>
              
              <div class="info-box" style="background: #e8f5e9; border-left: 4px solid #34a853;">
                <h3 style="margin-top: 0; color: #34a853;">💡 Next Steps</h3>
                ${isLandlord ? `
                <ul style="padding-left: 20px; margin: 10px 0;">
                  <li>Contact the tenant(s) to discuss renewal options</li>
                  <li>Prepare a new lease agreement if renewing</li>
                  <li>Update the lease status in your portal</li>
                  <li>Plan for vacancy if tenant is not renewing</li>
                </ul>
                ` : `
                <ul style="padding-left: 20px; margin: 10px 0;">
                  <li>Contact your landlord to discuss renewal options</li>
                  <li>Review your current lease terms</li>
                  <li>Decide if you want to renew or move out</li>
                  <li>Give proper notice if you plan to move</li>
                </ul>
                `}
              </div>
              
              <p style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXTAUTH_URL || 'https://pinaka.app'}/${isLandlord ? 'lld' : 'tnt'}/leases" class="button">
                  View Lease Details
                </a>
              </p>
              
              <p style="font-size: 14px; color: #5f6368; margin-top: 30px;">
                If you have any questions, please contact ${isLandlord ? 'your tenant' : landlordName}.
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

    console.log('✅ Lease renewal reminder email sent successfully!');
    console.log('   Message ID:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending lease renewal reminder email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { sendLeaseRenewalReminder };

