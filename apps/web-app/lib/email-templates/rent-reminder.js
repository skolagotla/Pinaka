/**
 * Rent Payment Reminder Email Template
 */

// const nodemailer = require('nodemailer'); // DISABLED - nodemailer removed

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

async function sendRentReminder({ tenantEmail, tenantName, landlordName, propertyAddress, unitName, rentAmount, dueDate, isOverdue = false }) {
  if (!transporter) {
    console.log('⚠️  Gmail not configured. Email not sent.');
    console.log('📧 Would have sent rent reminder to:', tenantEmail);
    return { success: true, message: 'Email sending skipped (no Gmail configured)' };
  }

  try {
    const formattedDueDate = new Date(dueDate).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(rentAmount);

    const subject = isOverdue 
      ? `⚠️ Overdue Rent Payment - ${formattedAmount}`
      : `💰 Reminder: Rent Payment Due Soon - ${formattedAmount}`;

    const urgencyColor = isOverdue ? '#ea4335' : '#fbbc04';
    const urgencyIcon = isOverdue ? '⚠️' : '💰';
    const urgencyText = isOverdue 
      ? 'Your rent payment is now overdue. Please make payment as soon as possible.'
      : 'This is a friendly reminder that your rent payment is due soon.';

    console.log(`📧 Sending ${isOverdue ? 'overdue' : 'upcoming'} rent reminder via Gmail...`);
    console.log('   To:', tenantEmail);
    console.log('   Amount:', formattedAmount);
    console.log('   Due Date:', formattedDueDate);

    const info = await transporter.sendMail({
      from: `"Pinaka Property Management" <${process.env.GMAIL_USER}>`,
      to: tenantEmail,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, ${urgencyColor} 0%, #ea4335 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .detail-row { padding: 10px 0; border-bottom: 1px solid #e8eaed; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-weight: 600; color: #5f6368; display: block; margin-bottom: 4px; }
            .detail-value { color: #1a73e8; font-weight: 500; font-size: 16px; }
            .amount-highlight { font-size: 24px; font-weight: 700; color: ${urgencyColor}; }
            .button { display: inline-block; padding: 12px 24px; background: #1a73e8; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e8eaed; color: #5f6368; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">${urgencyIcon} ${isOverdue ? 'Overdue' : 'Rent Payment'} Reminder</h1>
            </div>
            <div class="content">
              <p>Hi ${tenantName},</p>
              
              <p>${urgencyText}</p>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: ${urgencyColor};">
                  ${isOverdue ? '⚠️ Payment Details' : '💰 Payment Details'}
                </h3>
                
                <div class="detail-row">
                  <span class="detail-label">Amount Due:</span>
                  <span class="detail-value amount-highlight">${formattedAmount}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Due Date:</span>
                  <span class="detail-value">${formattedDueDate}</span>
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
                  <span class="detail-label">Landlord:</span>
                  <span class="detail-value">${landlordName}</span>
                </div>
              </div>
              
              ${isOverdue ? `
              <div class="info-box" style="background: #fce8e6; border-left: 4px solid #ea4335;">
                <h3 style="margin-top: 0; color: #ea4335;">⚠️ Action Required</h3>
                <p>Your rent payment is now overdue. Please make payment immediately to avoid any late fees or further action.</p>
                <p>If you have already made the payment, please contact ${landlordName} to update your payment record.</p>
              </div>
              ` : `
              <div class="info-box" style="background: #e8f5e9; border-left: 4px solid #34a853;">
                <h3 style="margin-top: 0; color: #34a853;">💡 Payment Options</h3>
                <p>You can make your payment using your preferred method. If you have any questions about payment methods or need to arrange a different payment schedule, please contact ${landlordName}.</p>
              </div>
              `}
              
              <p style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXTAUTH_URL || 'https://pinaka.app'}/payments" class="button">
                  View Payment History
                </a>
              </p>
              
              <p style="font-size: 14px; color: #5f6368; margin-top: 30px;">
                If you have any questions or concerns, please don't hesitate to contact your landlord.
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

    console.log('✅ Rent reminder email sent successfully!');
    console.log('   Message ID:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending rent reminder email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { sendRentReminder };

