const nodemailer = require('nodemailer');

let transporter = null;

// Initialize Gmail transporter if credentials are provided
if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  console.log('✅ Gmail SMTP configured');
} else {
  console.log('⚠️  Gmail SMTP not configured - add GMAIL_USER and GMAIL_APP_PASSWORD to .env');
}

async function sendTenantInvitation({ tenantEmail, tenantName, invitationToken, landlordName }) {
  // If no Gmail configured, log and return success (dev mode)
  if (!transporter) {
    console.log('⚠️  Gmail not configured. Email not sent.');
    console.log('📧 Would have sent invitation to:', tenantEmail);
    console.log('🔗 Invitation link:', `${process.env.NEXTAUTH_URL}/accept-invitation?token=${invitationToken}`);
    return { 
      success: true, 
      message: 'Email sending skipped (no Gmail configured)',
      invitationUrl: `${process.env.NEXTAUTH_URL}/accept-invitation?token=${invitationToken}`
    };
  }

  try {
    const invitationUrl = `${process.env.NEXTAUTH_URL}/accept-invitation?token=${invitationToken}`;
    
    console.log('📧 Sending invitation email via Gmail...');
    console.log('   To:', tenantEmail);
    console.log('   From:', process.env.GMAIL_USER);
    console.log('   Tenant:', tenantName);
    console.log('   Landlord:', landlordName);
    console.log('   Token:', invitationToken.substring(0, 10) + '...');
    
    const info = await transporter.sendMail({
      from: `"Pinaka Property Management" <${process.env.GMAIL_USER}>`,
      to: tenantEmail,
      subject: `Welcome to Pinaka - ${landlordName} has invited you`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a73e8; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 14px 32px; background: #1a73e8; color: white; text-decoration: none; border-radius: 24px; margin: 20px 0; font-weight: 500; }
            .button:hover { background: #1557b0; }
            .footer { text-align: center; padding: 20px; color: #5f6368; font-size: 14px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1a73e8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">Welcome to Pinaka</h1>
            </div>
            <div class="content">
              <h2 style="color: #1a73e8; margin-top: 0;">Hi ${tenantName},</h2>
              <p style="font-size: 16px;">
                <strong>${landlordName}</strong> has invited you to access your tenant portal on Pinaka.
              </p>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #1a73e8;">What you can do:</h3>
                <ul style="padding-left: 20px;">
                  <li>View your lease information</li>
                  <li>See property details</li>
                  <li>Access important documents</li>
                  <li>Contact your landlord</li>
                </ul>
              </div>
              
              <p style="font-size: 16px;">
                Click the button below to accept the invitation and sign in with your Google account:
              </p>
              
              <div style="text-align: center;">
                <a href="${invitationUrl}" class="button">Accept Invitation & Sign In</a>
              </div>
              
              <p style="font-size: 14px; color: #5f6368; margin-top: 30px;">
                Or copy and paste this link into your browser:<br/>
                <a href="${invitationUrl}" style="color: #1a73e8; word-break: break-all;">${invitationUrl}</a>
              </p>
              
              <p style="font-size: 14px; color: #5f6368; margin-top: 30px;">
                <strong>Note:</strong> This invitation link will expire in 7 days. If you have any questions, please contact your landlord.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Pinaka Property Management</p>
              <p>This email was sent to ${tenantEmail}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('✅ Email sent successfully via Gmail!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email via Gmail:', error);
    console.error('   Error message:', error.message);
    return { success: false, error: error.message };
  }
}

async function sendLeaseConfirmation({ tenantEmail, tenantName, landlordName, leaseDetails }) {
  // If no Gmail configured, log and return success (dev mode)
  if (!transporter) {
    console.log('⚠️  Gmail not configured. Email not sent.');
    console.log('📧 Would have sent lease confirmation to:', tenantEmail);
    console.log('🏠 Lease details:', leaseDetails);
    return { 
      success: true, 
      message: 'Email sending skipped (no Gmail configured)'
    };
  }

  try {
    const { propertyAddress, unitName, leaseStart, leaseEnd, rentAmount, rentDueDay } = leaseDetails;
    const leaseStartDate = new Date(leaseStart).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const leaseEndDate = leaseEnd 
      ? new Date(leaseEnd).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'Ongoing';
    
    console.log('📧 Sending lease confirmation email via Gmail...');
    console.log('   To:', tenantEmail);
    console.log('   From:', process.env.GMAIL_USER);
    console.log('   Tenant:', tenantName);
    console.log('   Property:', propertyAddress);
    console.log('   Lease Start:', leaseStartDate);
    
    const info = await transporter.sendMail({
      from: `"Pinaka Property Management" <${process.env.GMAIL_USER}>`,
      to: tenantEmail,
      subject: `🎉 Congratulations! Your Lease at ${propertyAddress} Starts ${leaseStartDate}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1a73e8 0%, #34a853 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e8eaed; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-weight: 600; color: #5f6368; }
            .detail-value { color: #1a73e8; font-weight: 500; }
            .footer { text-align: center; padding: 20px; color: #5f6368; font-size: 14px; }
            .celebration { font-size: 48px; text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="celebration">🎉 🏠 🎊</div>
              <h1 style="margin: 0; font-size: 32px;">Congratulations!</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Your lease has been created</p>
            </div>
            <div class="content">
              <h2 style="color: #1a73e8; margin-top: 0;">Dear ${tenantName},</h2>
              <p style="font-size: 16px;">
                We're excited to welcome you to your new home! Your landlord, <strong>${landlordName}</strong>, has created a lease agreement for you.
              </p>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #1a73e8; text-align: center;">📋 Lease Details</h3>
                
                <div class="detail-row">
                  <span class="detail-label">🏠 Property:</span>
                  <span class="detail-value">${propertyAddress}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">🚪 Unit:</span>
                  <span class="detail-value">${unitName}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">📅 Lease Start:</span>
                  <span class="detail-value">${leaseStartDate}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">📅 Lease End:</span>
                  <span class="detail-value">${leaseEndDate}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">💰 Monthly Rent:</span>
                  <span class="detail-value">$${rentAmount.toLocaleString()}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">📆 Rent Due Day:</span>
                  <span class="detail-value">Day ${rentDueDay} of each month</span>
                </div>
              </div>
              
              <div class="info-box" style="background: #e8f5e9; border-left: 4px solid #34a853;">
                <h3 style="margin-top: 0; color: #34a853;">✨ What's Next?</h3>
                <ul style="padding-left: 20px; margin: 10px 0;">
                  <li>Sign in to your tenant portal to view your lease details</li>
                  <li>Review your rental agreement carefully</li>
                  <li>Mark your calendar for rent payment on day ${rentDueDay}</li>
                  <li>Submit maintenance requests anytime through the portal</li>
                  <li>Contact ${landlordName} if you have any questions</li>
                </ul>
              </div>
              
              <p style="font-size: 16px; text-align: center; margin-top: 30px;">
                <strong>Welcome to your new home! 🏡</strong>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Pinaka Property Management</p>
              <p>This email was sent to ${tenantEmail}</p>
              <p style="color: #5f6368; font-size: 12px; margin-top: 10px;">
                If you have questions about this lease, please contact your landlord directly.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('✅ Lease confirmation email sent successfully via Gmail!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending lease confirmation email via Gmail:', error);
    console.error('   Error message:', error.message);
    return { success: false, error: error.message };
  }
}

async function sendMaintenanceTicketCreated({ tenantEmail, tenantName, landlordEmail, landlordName, ticketDetails }) {
  if (!transporter) {
    console.log('⚠️  Gmail not configured. Email not sent.');
    console.log('📧 Would have sent new ticket notification to landlord:', landlordEmail);
    return { success: true, message: 'Email sending skipped (no Gmail configured)' };
  }

  try {
    const { ticketNumber, title, description, property, category, priority } = ticketDetails;
    
    console.log('📧 Sending new maintenance ticket notification to landlord via Gmail...');
    console.log('   To:', landlordEmail);
    console.log('   Ticket:', ticketNumber);
    
    const info = await transporter.sendMail({
      from: `"Pinaka Property Management" <${process.env.GMAIL_USER}>`,
      to: landlordEmail,
      subject: `🔧 New Maintenance Request - Ticket #${ticketNumber}`,
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
            .detail-row { padding: 10px 0; border-bottom: 1px solid #e8eaed; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-weight: 600; color: #5f6368; display: block; margin-bottom: 4px; }
            .detail-value { color: #1a73e8; font-weight: 500; }
            .priority-urgent { color: #ea4335; }
            .priority-high { color: #ff9800; }
            .priority-medium { color: #1a73e8; }
            .priority-low { color: #34a853; }
            .footer { text-align: center; padding: 20px; color: #5f6368; font-size: 14px; }
            .button { display: inline-block; padding: 14px 32px; background: #1a73e8; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div style="font-size: 48px; margin-bottom: 10px;">🔧</div>
              <h1 style="margin: 0; font-size: 28px;">New Maintenance Request</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Ticket #${ticketNumber}</p>
            </div>
            <div class="content">
              <h2 style="color: #1a73e8; margin-top: 0;">Hi ${landlordName},</h2>
              <p style="font-size: 16px;">
                <strong>${tenantName}</strong> has submitted a new maintenance request for your property.
              </p>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #1a73e8;">📋 Request Details</h3>
                
                <div class="detail-row">
                  <span class="detail-label">🏠 Property:</span>
                  <span class="detail-value">${property}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">📝 Title:</span>
                  <span class="detail-value">${title}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">📄 Description:</span>
                  <div style="color: #3c4043; margin-top: 8px;">${description}</div>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">🔖 Category:</span>
                  <span class="detail-value">${category}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">⚠️ Priority:</span>
                  <span class="priority-${priority.toLowerCase()}" style="font-weight: 600;">${priority}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">👤 Submitted By:</span>
                  <span class="detail-value">${tenantName}</span>
                </div>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/operations?tab=maintenance" class="button">View & Respond to Ticket</a>
              </div>
              
              <p style="font-size: 14px; color: #5f6368; text-align: center; margin-top: 20px;">
                Please review and respond to this maintenance request as soon as possible.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Pinaka Property Management</p>
              <p>This email was sent to ${landlordEmail}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('✅ New ticket notification sent to landlord!');
    console.log('   Message ID:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending new ticket notification:', error);
    return { success: false, error: error.message };
  }
}

async function sendMaintenanceTicketUpdate({ recipientEmail, recipientName, recipientRole, senderName, senderRole, ticketDetails, updateType, updateContent }) {
  if (!transporter) {
    console.log('⚠️  Gmail not configured. Email not sent.');
    console.log('📧 Would have sent ticket update to:', recipientEmail);
    return { success: true, message: 'Email sending skipped (no Gmail configured)' };
  }

  try {
    const { ticketNumber, title, property, status } = ticketDetails;
    
    console.log('📧 Sending maintenance ticket update notification via Gmail...');
    console.log('   To:', recipientEmail);
    console.log('   Ticket:', ticketNumber);
    console.log('   Update Type:', updateType);
    
    let updateMessage = '';
    let updateIcon = '💬';
    let specialMessage = '';
    
    if (updateType === 'comment') {
      updateMessage = `<strong>${senderName}</strong> (${senderRole}) added a comment:`;
      updateIcon = '💬';
    } else if (updateType === 'status') {
      updateMessage = `<strong>${senderName}</strong> (${senderRole}) changed the status to <strong>${updateContent}</strong>`;
      updateIcon = '🔄';
      
      // Special message when landlord acknowledges a new ticket
      if (updateContent === 'Pending' && senderRole === 'landlord') {
        specialMessage = `
          <div style="background: #e8f0fe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1a73e8; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">👀</div>
            <p style="margin: 0; font-size: 16px; color: #1a73e8; font-weight: 600;">
              Your landlord has viewed your ticket and acknowledged your maintenance request!
            </p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #5f6368;">
              They will begin working on this issue soon.
            </p>
          </div>
        `;
      }
    }
    
    // Custom subject line for landlord viewing ticket
    let emailSubject = `${updateIcon} Update on Ticket #${ticketNumber} - ${title}`;
    if (updateContent === 'Pending' && senderRole === 'landlord') {
      emailSubject = `👀 Your Landlord Has Viewed Ticket #${ticketNumber}`;
    }
    
    const info = await transporter.sendMail({
      from: `"Pinaka Property Management" <${process.env.GMAIL_USER}>`,
      to: recipientEmail,
      subject: emailSubject,
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
            .update-box { background: #e8f0fe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1a73e8; }
            .detail-row { padding: 8px 0; }
            .detail-label { font-weight: 600; color: #5f6368; }
            .detail-value { color: #1a73e8; font-weight: 500; }
            .footer { text-align: center; padding: 20px; color: #5f6368; font-size: 14px; }
            .button { display: inline-block; padding: 14px 32px; background: #1a73e8; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div style="font-size: 48px; margin-bottom: 10px;">${updateIcon}</div>
              <h1 style="margin: 0; font-size: 28px;">Ticket Update</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Ticket #${ticketNumber}</p>
            </div>
            <div class="content">
              <h2 style="color: #1a73e8; margin-top: 0;">Hi ${recipientName},</h2>
              <p style="font-size: 16px;">
                There's an update on your maintenance ticket.
              </p>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #1a73e8;">📋 Ticket Information</h3>
                
                <div class="detail-row">
                  <span class="detail-label">🏠 Property:</span>
                  <span class="detail-value">${property}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">📝 Title:</span>
                  <span class="detail-value">${title}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">📊 Current Status:</span>
                  <span class="detail-value">${status}</span>
                </div>
              </div>
              
              ${specialMessage ? specialMessage : `
              <div class="update-box">
                <h3 style="margin-top: 0; color: #1a73e8;">✨ Latest Update</h3>
                <p style="margin: 10px 0; font-size: 15px;">
                  ${updateMessage}
                </p>
                ${updateType === 'comment' ? `
                  <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px; border-left: 3px solid #1a73e8;">
                    <div style="color: #3c4043; font-size: 14px;">${updateContent}</div>
                  </div>
                ` : ''}
              </div>
              `}
              
              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/${recipientRole === 'landlord' ? 'lld/maintenance' : 'tnt/maintenance'}" class="button">View Ticket Details</a>
              </div>
              
              <p style="font-size: 14px; color: #5f6368; text-align: center; margin-top: 20px;">
                Stay informed about your maintenance request progress.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Pinaka Property Management</p>
              <p>This email was sent to ${recipientEmail}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('✅ Ticket update notification sent!');
    console.log('   Message ID:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending ticket update notification:', error);
    return { success: false, error: error.message };
  }
}

async function sendN4FormToTenant({ 
  tenantEmails, 
  tenantNames, 
  landlordName, 
  propertyAddress, 
  unitName,
  totalArrears, 
  arrearsStartDate, 
  terminationDate,
  notes,
  pdfBuffer,
  pdfFileName 
}) {
  if (!transporter) {
    console.log('⚠️  Gmail not configured. Email not sent.');
    console.log('📧 Would have sent N4 form to:', tenantEmails.join(', '));
    return { success: true, message: 'Email sending skipped (no Gmail configured)' };
  }

  try {
    const tenantNameList = tenantNames.join(' and ');
    const formattedArrears = totalArrears.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    });
    
    // Format arrears period
    let arrearsPeriod = '';
    if (arrearsStartDate) {
      arrearsPeriod = `from ${arrearsStartDate}`;
      if (terminationDate) {
        arrearsPeriod += ` until ${terminationDate}`;
      } else {
        arrearsPeriod += ' to present';
      }
    }

    console.log('📧 Sending N4 form email via Gmail...');
    console.log('   To:', tenantEmails.join(', '));
    console.log('   Tenant(s):', tenantNameList);
    console.log('   Landlord:', landlordName);
    console.log('   Total Arrears:', formattedArrears);
    
    const propertyInfo = unitName 
      ? `${propertyAddress}, Unit ${unitName}`
      : propertyAddress;

    const info = await transporter.sendMail({
      from: `"Pinaka Property Management" <${process.env.GMAIL_USER}>`,
      to: tenantEmails.join(', '),
      subject: `N4 Notice to End Tenancy - ${propertyInfo}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ea4335 0%, #fbbc04 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .warning-box { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
            .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e8eaed; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-weight: 600; color: #5f6368; }
            .detail-value { color: #1a73e8; font-weight: 500; }
            .footer { text-align: center; padding: 20px; color: #5f6368; font-size: 14px; }
            .important { color: #ea4335; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div style="font-size: 48px; margin-bottom: 10px;">📄</div>
              <h1 style="margin: 0; font-size: 28px;">N4 Notice to End Tenancy</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Non-Payment of Rent</p>
            </div>
            <div class="content">
              <h2 style="color: #1a73e8; margin-top: 0;">Dear ${tenantNameList},</h2>
              <p style="font-size: 16px;">
                Your landlord, <strong>${landlordName}</strong>, has served you with an <strong>N4 Notice to End Tenancy</strong> for the property at <strong>${propertyInfo}</strong>.
              </p>
              
              <div class="warning-box">
                <h3 style="margin-top: 0; color: #856404;">⚠️ Important Notice</h3>
                <p style="margin: 10px 0; font-size: 15px;">
                  This notice is being served due to <strong class="important">non-payment of rent</strong>. 
                  Please review the attached N4 form for complete details and your options.
                </p>
              </div>

              <div class="info-box">
                <h3 style="margin-top: 0; color: #1a73e8;">💰 Outstanding Rent Balance</h3>
                
                <div class="detail-row">
                  <span class="detail-label">Total Amount Owed:</span>
                  <span class="detail-value important">${formattedArrears}</span>
                </div>
                
                ${arrearsPeriod ? `
                <div class="detail-row">
                  <span class="detail-label">Rent Owed Period:</span>
                  <span class="detail-value">${arrearsPeriod}</span>
                </div>
                ` : ''}
                
                ${terminationDate ? `
                <div class="detail-row">
                  <span class="detail-label">Termination Date:</span>
                  <span class="detail-value important">${terminationDate}</span>
                </div>
                ` : ''}
              </div>

              <div class="info-box">
                <h3 style="margin-top: 0; color: #1a73e8;">📋 What is an N4 Form?</h3>
                <p style="font-size: 15px; margin: 10px 0;">
                  An <strong>N4 Notice to End a Tenancy Early for Non-Payment of Rent</strong> is a legal document 
                  that your landlord must serve you when you have not paid your rent. This notice:
                </p>
                <ul style="padding-left: 20px; margin: 10px 0;">
                  <li>Informs you of the amount of rent you owe</li>
                  <li>Gives you a deadline to pay the outstanding rent</li>
                  <li>Explains that your tenancy may be terminated if rent is not paid</li>
                  <li>Provides information about your rights and options</li>
                </ul>
              </div>

              <div class="info-box">
                <h3 style="margin-top: 0; color: #1a73e8;">🎯 Why is this N4 being served?</h3>
                <p style="font-size: 15px; margin: 10px 0;">
                  This notice is being served because you have outstanding rent payments totaling 
                  <strong class="important">${formattedArrears}</strong>${arrearsPeriod ? ` for the period ${arrearsPeriod}` : ''}.
                </p>
                ${notes ? `
                <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin-top: 15px; border-left: 3px solid #1a73e8;">
                  <p style="margin: 0; font-size: 14px; color: #3c4043;"><strong>Additional Details:</strong></p>
                  <p style="margin: 10px 0 0 0; font-size: 14px; color: #3c4043;">${notes}</p>
                </div>
                ` : ''}
              </div>

              <div class="info-box" style="background: #e8f5e9; border-left: 4px solid #34a853;">
                <h3 style="margin-top: 0; color: #34a853;">✅ What You Can Do</h3>
                <ul style="padding-left: 20px; margin: 10px 0;">
                  <li><strong>Pay the outstanding rent</strong> before the termination date to avoid eviction proceedings</li>
                  <li><strong>Contact your landlord</strong> to discuss a payment plan or arrangement</li>
                  <li><strong>Seek legal advice</strong> if you have questions about your rights</li>
                  <li><strong>Review the attached N4 form</strong> for complete details and deadlines</li>
                </ul>
              </div>

              <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <p style="margin: 0; font-size: 14px; color: #856404;">
                  <strong>⚠️ Important:</strong> The attached N4 form contains important legal information. 
                  Please read it carefully and take appropriate action before the termination date. 
                  If you pay the outstanding rent before the termination date, the notice may be void.
                </p>
              </div>

              <p style="font-size: 16px; text-align: center; margin-top: 30px;">
                <strong>Please review the attached N4 form for complete details.</strong>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Pinaka Property Management</p>
              <p>This email was sent to ${tenantEmails.join(', ')}</p>
              <p style="color: #5f6368; font-size: 12px; margin-top: 10px;">
                If you have questions about this notice, please contact your landlord, ${landlordName}, directly.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: pdfFileName,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    console.log('✅ N4 form email sent successfully!');
    console.log('   Message ID:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending N4 form email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendTenantInvitation,
  sendLeaseConfirmation,
  sendMaintenanceTicketCreated,
  sendMaintenanceTicketUpdate,
  sendN4FormToTenant,
};


