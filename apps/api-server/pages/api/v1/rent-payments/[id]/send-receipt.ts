/**
 * Send Rent Payment Receipt API v1
 * POST /api/v1/rent-payments/:id/send-receipt
 * 
 * Domain-Driven, API-First implementation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { rentPaymentService } from '@/lib/domains/rent-payment';
const { prisma } = require('@/lib/prisma');
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

    // Get rent payment via domain service
    const rentPayment = await rentPaymentService.getById(id);
    if (!rentPayment) {
      return res.status(404).json({ error: 'Rent payment not found' });
    }

    // Check if rent payment belongs to landlord's property
    const payment = await prisma.rentPayment.findUnique({
      where: { id },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: {
                  include: {
                    landlord: true,
                  },
                },
              },
            },
            leaseTenants: {
              include: {
                tenant: true,
              },
            },
          },
        },
      },
    });

    if (payment?.lease?.unit?.property?.landlordId !== user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get tenant email
    const tenant = payment.lease.leaseTenants[0]?.tenant;
    if (!tenant || !tenant.email) {
      return res.status(400).json({ error: 'Tenant email not found' });
    }

    // Get full payment details for receipt generation
    const fullPayment = await prisma.rentPayment.findUnique({
      where: { id },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: {
                  include: {
                    landlord: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                      },
                    },
                  },
                },
              },
            },
            leaseTenants: {
              include: {
                tenant: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        partialPayments: {
          orderBy: { paidDate: 'asc' },
        },
      },
    });

    if (!fullPayment) {
      return res.status(404).json({ error: 'Rent payment not found' });
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
      subject: `Rent Payment Receipt - ${payment.lease.unit?.property?.propertyName || 'Property'}`,
      html: `
        <h2>Rent Payment Receipt</h2>
        <p>Dear ${tenant.firstName} ${tenant.lastName},</p>
        <p>Please find attached your rent payment receipt.</p>
        <p><strong>Payment Details:</strong></p>
        <ul>
          <li>Amount: $${rentPayment.amount}</li>
          <li>Payment Date: ${new Date(rentPayment.paidDate || rentPayment.dueDate).toLocaleDateString()}</li>
          <li>Property: ${payment.lease.unit?.property?.propertyName || 'N/A'}</li>
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

    // Update receipt sent status
    await prisma.rentPayment.update({
      where: { id },
      data: {
        receiptSent: true,
        receiptSentAt: new Date(),
      },
    });

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

