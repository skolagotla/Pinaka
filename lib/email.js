const nodemailer = require('nodemailer');

// Import centralized config (handle both ES6 and CommonJS)
let config;
try {
  config = require('./config/app-config').default || require('./config/app-config');
} catch (e) {
  // Fallback if import fails
  config = {
    email: {
      gmail: {
        user: process.env.GMAIL_USER,
        appPassword: process.env.GMAIL_APP_PASSWORD,
        isConfigured: !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
      },
    },
    auth: {
      baseUrl: process.env.NEXTAUTH_URL || process.env.APP_BASE_URL || 'http://localhost:3000',
    },
  };
}

let transporter = null;

/**
 * Helper function to format error messages for email sending failures
 */
function formatEmailError(error) {
  let userFriendlyMessage = error.message;
  if (error.code === 'ECONNRESET' || error.code === 'ESOCKET') {
    userFriendlyMessage = 'Connection to Gmail was reset. This may be due to network issues, firewall settings, or Gmail security restrictions. Please check your network connection and Gmail account settings.';
  } else if (error.code === 'EAUTH') {
    userFriendlyMessage = 'Gmail authentication failed. Please verify your Gmail username and app password are correct.';
  } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
    userFriendlyMessage = 'Could not connect to Gmail servers. Please check your network connection and firewall settings.';
  }
  
  return {
    success: false,
    error: userFriendlyMessage,
    errorDetails: {
      name: error.name,
      code: error.code,
      responseCode: error.responseCode,
      command: error.command,
      response: error.response,
      originalMessage: error.message,
    }
  };
}

// Initialize Gmail transporter if credentials are provided
if (config.email.gmail.isConfigured) {
  // Use simple configuration that matches the working test script
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email.gmail.user,
      pass: config.email.gmail.appPassword,
    },
    // Simplified configuration - no pooling to avoid connection issues
    // Connection pooling can cause ESOCKET errors with Gmail
  });
  
  // Verify connection on startup (async, don't block)
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Gmail SMTP connection verification failed:', error.message);
      console.error('   Error code:', error.code);
      console.error('   Error command:', error.command);
      console.error('   This may indicate:');
      console.error('   - Invalid Gmail credentials (check GMAIL_USER and GMAIL_APP_PASSWORD)');
      console.error('   - Network/firewall blocking SMTP connection to smtp.gmail.com:465');
      console.error('   - Gmail security settings blocking the connection');
      console.error('   - App password expired or incorrect');
      console.error('   - Gmail account requires OAuth2 instead of app password');
      console.error('');
      console.error('   Troubleshooting steps:');
      console.error('   1. Verify Gmail account has 2-Step Verification enabled');
      console.error('   2. Generate a new App Password in Google Account settings');
      console.error('   3. Ensure the app password is correctly set in .env file');
      console.error('   4. Check if your network/firewall allows outbound SMTP connections');
      console.error('   5. Try testing the connection from a different network');
    } else {
      console.log('✅ Gmail SMTP configured and verified');
    }
  });
} else {
  console.log('⚠️  Gmail SMTP not configured - add GMAIL_USER and GMAIL_APP_PASSWORD to .env');
}

async function sendTenantInvitation({ tenantEmail, tenantName, invitationToken, landlordName }) {
  // If no Gmail configured, log and return success (dev mode)
  if (!transporter) {
    const baseUrl = config.auth.baseUrl;
    const invitationUrl = `${baseUrl}/accept-invitation?token=${invitationToken}`;
    console.log('⚠️  Gmail not configured. Email not sent.');
    console.log('📧 Would have sent invitation to:', tenantEmail);
    console.log('🔗 Invitation link:', invitationUrl);
    return { 
      success: true, 
      message: 'Email sending skipped (no Gmail configured)',
      invitationUrl
    };
  }

  try {
    const baseUrl = config.auth.baseUrl;
    const invitationUrl = `${baseUrl}/accept-invitation?token=${invitationToken}`;
    
    console.log('📧 Sending invitation email via Gmail...');
    console.log('   To:', tenantEmail);
    console.log('   From:', config.email.gmail.user);
    console.log('   Tenant:', tenantName);
    console.log('   Landlord:', landlordName);
    console.log('   Token:', invitationToken.substring(0, 10) + '...');
    console.log('   Invitation URL:', invitationUrl);
    
    const info = await transporter.sendMail({
      from: `"Pinaka Property Management" <${config.email.gmail.user}>`,
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
                Click the button below to complete your tenant profile and submit your information:
              </p>
              
              <div style="text-align: center;">
                <a href="${invitationUrl}" class="button">Complete Your Profile</a>
              </div>
              
              <p style="font-size: 14px; color: #5f6368; margin-top: 30px;">
                Or copy and paste this link into your browser:<br/>
                <a href="${invitationUrl}" style="color: #1a73e8; word-break: break-all;">${invitationUrl}</a>
              </p>
              
              <p style="font-size: 14px; color: #5f6368; margin-top: 30px;">
                <strong>Note:</strong> This invitation link will expire in 14 days. Please complete your profile as soon as possible. If you have any questions, please contact your landlord.
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
    
    return { success: true, data: { id: info.messageId, messageId: info.messageId } };
  } catch (error) {
    console.error('❌ Error sending invitation email via Gmail:', error);
    console.error('   Error message:', error.message);
    console.error('   Error name:', error.name);
    console.error('   Error code:', error.code);
    if (error.responseCode) {
      console.error('   Response code:', error.responseCode);
    }
    if (error.response) {
      console.error('   Response:', error.response);
    }
    if (error.command) {
      console.error('   Command:', error.command);
    }
    if (error.stack) {
      console.error('   Stack trace:', error.stack);
    }
    
    // Return formatted error information
    return formatEmailError(error);
  }
}

async function sendPMCInvitation({ pmcEmail, pmcName, invitationToken, inviterName }) {
  // If no Gmail configured, log and return success (dev mode)
  if (!transporter) {
    console.log('⚠️  Gmail not configured. Email not sent.');
    const baseUrl = config.auth.baseUrl;
    const invitationUrl = `${baseUrl}/accept-invitation?token=${invitationToken}`;
    console.log('📧 Would have sent PMC invitation to:', pmcEmail);
    console.log('🔗 Invitation link:', invitationUrl);
    return { 
      success: true, 
      message: 'Email sending skipped (no Gmail configured)',
      invitationUrl
    };
  }

  try {
    const baseUrl = config.auth.baseUrl;
    const invitationUrl = `${baseUrl}/accept-invitation?token=${invitationToken}`;
    
    console.log('📧 Sending PMC invitation email via Gmail...');
    console.log('   To:', pmcEmail);
    console.log('   From:', config.email.gmail.user);
    console.log('   PMC:', pmcName);
    console.log('   Inviter:', inviterName);
    console.log('   Token:', invitationToken.substring(0, 10) + '...');
    
    const info = await transporter.sendMail({
      from: `"Pinaka Property Management" <${config.email.gmail.user}>`,
      to: pmcEmail,
      subject: `Welcome to Pinaka - You've been invited as a Property Management Company`,
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
              <h2 style="color: #1a73e8; margin-top: 0;">Hi ${pmcName},</h2>
              <p style="font-size: 16px;">
                You've been invited by <strong>${inviterName}</strong> to join Pinaka as a Property Management Company.
              </p>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #1a73e8;">What you can do:</h3>
                <ul style="padding-left: 20px;">
                  <li>Manage properties for multiple landlords</li>
                  <li>Handle maintenance requests and expenses</li>
                  <li>Track leases and tenant relationships</li>
                  <li>Request landlord approvals for actions</li>
                  <li>Generate reports and analytics</li>
                </ul>
              </div>
              
              <p style="font-size: 16px;">
                Click the button below to complete your PMC profile and get started:
              </p>
              
              <div style="text-align: center;">
                <a href="${invitationUrl}" class="button">Complete Your Profile</a>
              </div>
              
              <p style="font-size: 14px; color: #5f6368; margin-top: 30px;">
                Or copy and paste this link into your browser:<br/>
                <a href="${invitationUrl}" style="color: #1a73e8; word-break: break-all;">${invitationUrl}</a>
              </p>
              
              <p style="font-size: 14px; color: #5f6368; margin-top: 30px;">
                <strong>Note:</strong> This invitation link will expire in 14 days. Please complete your profile as soon as possible.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Pinaka Property Management</p>
              <p>This email was sent to ${pmcEmail}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('✅ Email sent successfully via Gmail!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    
    return { success: true, data: { id: info.messageId, messageId: info.messageId } };
  } catch (error) {
    console.error('❌ Error sending PMC invitation email via Gmail:', error);
    console.error('   Error message:', error.message);
    console.error('   Error code:', error.code);
    if (error.responseCode) {
      console.error('   Response code:', error.responseCode);
    }
    return formatEmailError(error);
  }
}

async function sendLandlordInvitation({ landlordEmail, landlordName, invitationToken, inviterName }) {
  // If no Gmail configured, log and return success (dev mode)
  if (!transporter) {
    console.log('⚠️  Gmail not configured. Email not sent.');
    const baseUrl = config.auth.baseUrl;
    const invitationUrl = `${baseUrl}/accept-invitation?token=${invitationToken}`;
    console.log('📧 Would have sent invitation to:', landlordEmail);
    console.log('🔗 Invitation link:', invitationUrl);
    return { 
      success: true, 
      message: 'Email sending skipped (no Gmail configured)',
      invitationUrl
    };
  }

  try {
    const baseUrl = config.auth.baseUrl;
    const invitationUrl = `${baseUrl}/accept-invitation?token=${invitationToken}`;
    
    console.log('📧 Sending landlord invitation email via Gmail...');
    console.log('   To:', landlordEmail);
    console.log('   From:', config.email.gmail.user);
    console.log('   Landlord:', landlordName);
    console.log('   Inviter:', inviterName);
    console.log('   Token:', invitationToken.substring(0, 10) + '...');
    
    const info = await transporter.sendMail({
      from: `"Pinaka Property Management" <${config.email.gmail.user}>`,
      to: landlordEmail,
      subject: `Welcome to Pinaka - You've been invited as a Landlord`,
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
              <h2 style="color: #1a73e8; margin-top: 0;">Hi ${landlordName},</h2>
              <p style="font-size: 16px;">
                You've been invited by <strong>${inviterName}</strong> to join Pinaka as a landlord.
              </p>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #1a73e8;">What you can do:</h3>
                <ul style="padding-left: 20px;">
                  <li>Manage your properties and units</li>
                  <li>Track leases and tenants</li>
                  <li>Handle maintenance requests</li>
                  <li>Generate forms and documents</li>
                  <li>Invite tenants to the platform</li>
                </ul>
              </div>
              
              <p style="font-size: 16px;">
                Click the button below to complete your landlord profile and get started:
              </p>
              
              <div style="text-align: center;">
                <a href="${invitationUrl}" class="button">Complete Your Profile</a>
              </div>
              
              <p style="font-size: 14px; color: #5f6368; margin-top: 30px;">
                Or copy and paste this link into your browser:<br/>
                <a href="${invitationUrl}" style="color: #1a73e8; word-break: break-all;">${invitationUrl}</a>
              </p>
              
              <p style="font-size: 14px; color: #5f6368; margin-top: 30px;">
                <strong>Note:</strong> This invitation link will expire in 14 days. Please complete your profile as soon as possible.
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

    console.log('✅ Email sent successfully via Gmail!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    
    return { success: true, data: { id: info.messageId, messageId: info.messageId } };
  } catch (error) {
    console.error('❌ Error sending landlord invitation email via Gmail:', error);
    console.error('   Error message:', error.message);
    console.error('   Error code:', error.code);
    if (error.responseCode) {
      console.error('   Response code:', error.responseCode);
    }
    return formatEmailError(error);
  }
}

async function sendLandlordApproval({ landlordEmail, landlordName, adminName }) {
  // If no Gmail configured, log and return success (dev mode)
  if (!transporter) {
    console.log('⚠️  Gmail not configured. Email not sent.');
    console.log('📧 Would have sent approval email to:', landlordEmail);
    return { 
      success: true, 
      message: 'Email sending skipped (no Gmail configured)'
    };
  }

  try {
    const baseUrl = config.auth.baseUrl;
    const loginUrl = `${baseUrl}/`;
    
    console.log('📧 Sending landlord approval email via Gmail...');
    console.log('   To:', landlordEmail);
    console.log('   From:', config.email.gmail.user);
    
    const info = await transporter.sendMail({
      from: `"Pinaka Property Management" <${config.email.gmail.user}>`,
      to: landlordEmail,
      subject: `🎉 Your Pinaka Account Has Been Approved!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 14px 32px; background: #52c41a; color: white; text-decoration: none; border-radius: 24px; margin: 20px 0; font-weight: 500; }
            .button:hover { background: #389e0d; }
            .footer { text-align: center; padding: 20px; color: #5f6368; font-size: 14px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #52c41a; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🎉 Account Approved!</h1>
            </div>
            <div class="content">
              <h2 style="color: #52c41a; margin-top: 0;">Hi ${landlordName},</h2>
              <p style="font-size: 16px;">
                Great news! Your landlord account has been <strong>approved</strong> by ${adminName || 'an administrator'}.
              </p>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #52c41a;">You can now:</h3>
                <ul style="padding-left: 20px;">
                  <li>Access your landlord dashboard</li>
                  <li>Add and manage properties</li>
                  <li>Invite tenants to the platform</li>
                  <li>Track leases and payments</li>
                  <li>Handle maintenance requests</li>
                </ul>
              </div>
              
              <p style="font-size: 16px;">
                Click the button below to log in and get started:
              </p>
              
              <div style="text-align: center;">
                <a href="${loginUrl}" class="button">Log In to Pinaka</a>
              </div>
              
              <p style="font-size: 14px; color: #5f6368; margin-top: 30px;">
                If you have any questions, please contact our support team.
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

    console.log('✅ Approval email sent successfully via Gmail!');
    return { success: true, data: { id: info.messageId, messageId: info.messageId } };
  } catch (error) {
    console.error('❌ Error sending approval email via Gmail:', error);
    console.error('   Error message:', error.message);
    console.error('   Error code:', error.code);
    return formatEmailError(error);
  }
}

async function sendLandlordRejection({ landlordEmail, landlordName, adminName, reason }) {
  // If no Gmail configured, log and return success (dev mode)
  if (!transporter) {
    console.log('⚠️  Gmail not configured. Email not sent.');
    console.log('📧 Would have sent rejection email to:', landlordEmail);
    return { 
      success: true, 
      message: 'Email sending skipped (no Gmail configured)'
    };
  }

  try {
    console.log('📧 Sending landlord rejection email via Gmail...');
    console.log('   To:', landlordEmail);
    console.log('   From:', config.email.gmail.user);
    
    const info = await transporter.sendMail({
      from: `"Pinaka Property Management" <${config.email.gmail.user}>`,
      to: landlordEmail,
      subject: `Update on Your Pinaka Account Application`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ea4335; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; padding: 20px; color: #5f6368; font-size: 14px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ea4335; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">Account Application Update</h1>
            </div>
            <div class="content">
              <h2 style="color: #ea4335; margin-top: 0;">Hi ${landlordName},</h2>
              <p style="font-size: 16px;">
                We regret to inform you that your landlord account application has been <strong>rejected</strong> by ${adminName || 'an administrator'}.
              </p>
              
              ${reason ? `
              <div class="info-box">
                <h3 style="margin-top: 0; color: #ea4335;">Reason:</h3>
                <p style="margin: 0;">${reason}</p>
              </div>
              ` : ''}
              
              <p style="font-size: 16px;">
                If you believe this is an error or have additional information to provide, please contact our support team for assistance.
              </p>
              
              <p style="font-size: 14px; color: #5f6368; margin-top: 30px;">
                Thank you for your interest in Pinaka Property Management.
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

    console.log('✅ Rejection email sent successfully via Gmail!');
    return { success: true, data: { id: info.messageId, messageId: info.messageId } };
  } catch (error) {
    console.error('❌ Error sending rejection email via Gmail:', error);
    console.error('   Error message:', error.message);
    console.error('   Error code:', error.code);
    return formatEmailError(error);
  }
}

async function sendTenantApproval({ tenantEmail, tenantName, landlordName }) {
  // If no Gmail configured, log and return success (dev mode)
  if (!transporter) {
    console.log('⚠️  Gmail not configured. Email not sent.');
    console.log('📧 Would have sent approval email to:', tenantEmail);
    return { 
      success: true, 
      message: 'Email sending skipped (no Gmail configured)'
    };
  }

  try {
    const baseUrl = config.auth.baseUrl;
    const loginUrl = `${baseUrl}/`;
    
    console.log('📧 Sending tenant approval email via Gmail...');
    console.log('   To:', tenantEmail);
    console.log('   From:', config.email.gmail.user);
    
    const info = await transporter.sendMail({
      from: `"Pinaka Property Management" <${config.email.gmail.user}>`,
      to: tenantEmail,
      subject: `🎉 Your Pinaka Account Has Been Approved!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 14px 32px; background: #52c41a; color: white; text-decoration: none; border-radius: 24px; margin: 20px 0; font-weight: 500; }
            .button:hover { background: #389e0d; }
            .footer { text-align: center; padding: 20px; color: #5f6368; font-size: 14px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #52c41a; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🎉 Account Approved!</h1>
            </div>
            <div class="content">
              <h2 style="color: #52c41a; margin-top: 0;">Hi ${tenantName},</h2>
              <p style="font-size: 16px;">
                Great news! Your tenant account has been <strong>approved</strong> by ${landlordName || 'your landlord'}.
              </p>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #52c41a;">You can now:</h3>
                <ul style="padding-left: 20px;">
                  <li>Access your tenant dashboard</li>
                  <li>View your lease information</li>
                  <li>Make rent payments</li>
                  <li>Submit maintenance requests</li>
                  <li>Access important documents</li>
                </ul>
              </div>
              
              <p style="font-size: 16px;">
                Click the button below to log in and get started:
              </p>
              
              <div style="text-align: center;">
                <a href="${loginUrl}" class="button">Log In to Pinaka</a>
              </div>
              
              <p style="font-size: 14px; color: #5f6368; margin-top: 30px;">
                If you have any questions, please contact your landlord.
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

    console.log('✅ Approval email sent successfully via Gmail!');
    return { success: true, data: { id: info.messageId, messageId: info.messageId } };
  } catch (error) {
    console.error('❌ Error sending approval email via Gmail:', error);
    console.error('   Error message:', error.message);
    console.error('   Error code:', error.code);
    return formatEmailError(error);
  }
}

async function sendTenantRejection({ tenantEmail, tenantName, landlordName, reason }) {
  // If no Gmail configured, log and return success (dev mode)
  if (!transporter) {
    console.log('⚠️  Gmail not configured. Email not sent.');
    console.log('📧 Would have sent rejection email to:', tenantEmail);
    return { 
      success: true, 
      message: 'Email sending skipped (no Gmail configured)'
    };
  }

  try {
    console.log('📧 Sending tenant rejection email via Gmail...');
    console.log('   To:', tenantEmail);
    console.log('   From:', config.email.gmail.user);
    
    const info = await transporter.sendMail({
      from: `"Pinaka Property Management" <${config.email.gmail.user}>`,
      to: tenantEmail,
      subject: `Update on Your Pinaka Account Application`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ea4335; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; padding: 20px; color: #5f6368; font-size: 14px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ea4335; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">Account Application Update</h1>
            </div>
            <div class="content">
              <h2 style="color: #ea4335; margin-top: 0;">Hi ${tenantName},</h2>
              <p style="font-size: 16px;">
                We regret to inform you that your tenant account application has been <strong>rejected</strong> by ${landlordName || 'your landlord'}.
              </p>
              
              ${reason ? `
              <div class="info-box">
                <h3 style="margin-top: 0; color: #ea4335;">Reason:</h3>
                <p style="margin: 0;">${reason}</p>
              </div>
              ` : ''}
              
              <p style="font-size: 16px;">
                If you believe this is an error or have additional information to provide, please contact your landlord for assistance.
              </p>
              
              <p style="font-size: 14px; color: #5f6368; margin-top: 30px;">
                Thank you for your interest in Pinaka Property Management.
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

    console.log('✅ Rejection email sent successfully via Gmail!');
    return { success: true, data: { id: info.messageId, messageId: info.messageId } };
  } catch (error) {
    console.error('❌ Error sending rejection email via Gmail:', error);
    console.error('   Error message:', error.message);
    console.error('   Error code:', error.code);
    return formatEmailError(error);
  }
}

module.exports = {
  sendTenantInvitation,
  sendLandlordInvitation,
  sendPMCInvitation,
  sendLandlordApproval,
  sendLandlordRejection,
  sendTenantApproval,
  sendTenantRejection,
};
