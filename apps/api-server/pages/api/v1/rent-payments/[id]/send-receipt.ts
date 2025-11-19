/**
 * Send Rent Payment Receipt API v1
 * POST /api/v1/rent-payments/:id/send-receipt
 * 
 * Domain-Driven, API-First implementation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { rentPaymentService } from '@/lib/domains/rent-payment';
// Use nodemailer directly for sending receipt emails
const nodemailer = require('nodemailer');

// Initialize Gmail transporter if credentials are provided
let transporter: any = null;
if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

async function sendEmail({ to, subject, html, attachments }: { to: string; subject: string; html: string; attachments?: any[] }) {
  if (!transporter) {
    console.log('⚠️  Gmail not configured. Email not sent.');
    console.log('📧 Would have sent email to:', to);
    return { success: true, message: 'Email sending skipped (no Gmail configured)' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Pinaka Property Management" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
      attachments,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid rent payment ID' });
    }

    // Only landlords can send receipts
    if (user.role !== 'landlord') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check ownership using domain service (Domain-Driven Design)
    const hasAccess = await rentPaymentService.belongsToLandlord(id, user.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get full payment details for receipt generation using domain service
    const fullPayment = await rentPaymentService.getByIdWithReceiptDetails(id);
    if (!fullPayment) {
      return res.status(404).json({ error: 'Rent payment not found' });
    }

    // Get tenant email from payment details
    const tenant = (fullPayment as any).lease?.leaseTenants?.[0]?.tenant;
    if (!tenant || !tenant.email) {
      return res.status(400).json({ error: 'Tenant email not found' });
    }

    // Generate receipt PDF on-the-fly
    const { generateRentReceiptPDF } = require('@/lib/pdf-generator');
    const pdfDoc = generateRentReceiptPDF(fullPayment as any);

    // Convert PDFDocument to buffer
    const chunks: Buffer[] = [];
    pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
    });

    // Send email with receipt
    await sendEmail({
      to: tenant.email,
      subject: `Rent Payment Receipt - ${(fullPayment as any).lease?.unit?.property?.propertyName || 'Property'}`,
      html: `
        <h2>Rent Payment Receipt</h2>
        <p>Dear ${tenant.firstName} ${tenant.lastName},</p>
        <p>Please find attached your rent payment receipt.</p>
        <p><strong>Payment Details:</strong></p>
        <ul>
          <li>Amount: $${fullPayment.amount}</li>
          <li>Payment Date: ${new Date(fullPayment.paidDate || fullPayment.dueDate).toLocaleDateString()}</li>
          <li>Property: ${(fullPayment as any).lease?.unit?.property?.propertyName || 'N/A'}</li>
        </ul>
        <p>Thank you for your payment.</p>
      `,
      attachments: [
        {
          filename: `receipt-${id}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    // Update receipt sent status using domain service
    await rentPaymentService.update(id, {
      receiptSent: true,
      receiptSentAt: new Date(),
    } as any);

    return res.status(200).json({
      success: true,
      message: 'Receipt sent successfully',
    });
  } catch (error) {
    console.error('[Send Rent Payment Receipt v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to send receipt',
    });
  }
}, { requireRole: ['landlord'], allowedMethods: ['POST'] });

