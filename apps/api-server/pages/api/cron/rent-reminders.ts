/**
 * Cron Job: Rent Payment Reminders
 * Sends email reminders to tenants 3 days before rent is due
 * Sends overdue reminders 1 day after due date
 * 
 * Can be called via:
 * - Vercel Cron: vercel.json cron configuration
 * - Manual API call: GET /api/cron/rent-reminders
 * - Scheduled task runner
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
const { prisma } = require('@/lib/prisma');
const { sendRentReminder } = require('@/lib/email-templates/rent-reminder');

async function handler(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  // Allow GET for cron jobs (no auth required for cron)
  if (req.method === 'GET') {
    return handleCronJob(req, res);
  }
  
  // Allow POST for manual triggers (requires auth)
  if (req.method === 'POST') {
    return handleCronJob(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleCronJob(req: NextApiRequest, res: NextApiResponse) {
  try {
    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Find upcoming payments (due in 3 days) that haven't been paid and reminder not sent
    const upcomingPayments = await prisma.rentPayment.findMany({
      where: {
        status: { in: ['Unpaid', 'Partial'] },
        reminderSent: false,
        dueDate: {
          gte: new Date(threeDaysFromNow.setHours(0, 0, 0, 0)),
          lte: new Date(threeDaysFromNow.setHours(23, 59, 59, 999))
        }
      },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: {
                  include: {
                    landlord: {
                      select: {
                        firstName: true,
                        lastName: true,
                        email: true
                      }
                    }
                  }
                }
              }
            },
            leaseTenants: {
              where: {
                isPrimaryTenant: true
              },
              include: {
                tenant: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Find overdue payments (due 1 day ago) that haven't been paid and overdue reminder not sent
    const overduePayments = await prisma.rentPayment.findMany({
      where: {
        status: { in: ['Unpaid', 'Partial'] },
        overdueReminderSent: false,
        dueDate: {
          gte: new Date(oneDayAgo.setHours(0, 0, 0, 0)),
          lte: new Date(oneDayAgo.setHours(23, 59, 59, 999))
        }
      },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: {
                  include: {
                    landlord: {
                      select: {
                        firstName: true,
                        lastName: true,
                        email: true
                      }
                    }
                  }
                }
              }
            },
            leaseTenants: {
              where: {
                isPrimaryTenant: true
              },
              include: {
                tenant: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    let upcomingSent = 0;
    let overdueSent = 0;
    const errors: string[] = [];

    // Send upcoming payment reminders
    for (const payment of upcomingPayments) {
      const primaryTenant = payment.lease.leaseTenants[0]?.tenant;
      if (!primaryTenant) continue;

      const landlord = payment.lease.unit.property.landlord;
      const landlordName = `${landlord.firstName} ${landlord.lastName}`;
      const tenantName = `${primaryTenant.firstName} ${primaryTenant.lastName}`;

      try {
        const result = await sendRentReminder({
          tenantEmail: primaryTenant.email,
          tenantName: tenantName,
          landlordName: landlordName,
          propertyAddress: payment.lease.unit.property.addressLine1,
          unitName: payment.lease.unit.unitName,
          rentAmount: payment.amount,
          dueDate: payment.dueDate,
          isOverdue: false
        });

        if (result.success) {
          await prisma.rentPayment.update({
            where: { id: payment.id },
            data: {
              reminderSent: true,
              reminderSentAt: new Date()
            }
          });
          upcomingSent++;
        }
      } catch (error: any) {
        errors.push(`Failed to send reminder for payment ${payment.id}: ${error.message}`);
      }
    }

    // Send overdue payment reminders
    for (const payment of overduePayments) {
      const primaryTenant = payment.lease.leaseTenants[0]?.tenant;
      if (!primaryTenant) continue;

      const landlord = payment.lease.unit.property.landlord;
      const landlordName = `${landlord.firstName} ${landlord.lastName}`;
      const tenantName = `${primaryTenant.firstName} ${primaryTenant.lastName}`;

      try {
        const result = await sendRentReminder({
          tenantEmail: primaryTenant.email,
          tenantName: tenantName,
          landlordName: landlordName,
          propertyAddress: payment.lease.unit.property.addressLine1,
          unitName: payment.lease.unit.unitName,
          rentAmount: payment.amount,
          dueDate: payment.dueDate,
          isOverdue: true
        });

        if (result.success) {
          await prisma.rentPayment.update({
            where: { id: payment.id },
            data: {
              overdueReminderSent: true,
              overdueReminderSentAt: new Date()
            }
          });
          overdueSent++;
        }
      } catch (error: any) {
        errors.push(`Failed to send overdue reminder for payment ${payment.id}: ${error.message}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Rent reminders processed',
      stats: {
        upcomingRemindersSent: upcomingSent,
        overdueRemindersSent: overdueSent,
        totalProcessed: upcomingPayments.length + overduePayments.length,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error: any) {
    console.error('[Rent Reminders Cron] Error:', error);
    return res.status(500).json({
      error: 'Failed to process rent reminders',
      message: error.message
    });
  }
}

// Export with optional auth (cron jobs may not have auth)
export default async function(req: NextApiRequest, res: NextApiResponse) {
  // Check if this is a cron job (Vercel adds a header)
  const isCron = req.headers['x-vercel-cron'] || req.query.secret === process.env.CRON_SECRET;
  
  if (isCron || !req.headers.authorization) {
    // No auth required for cron jobs
    return handler(req, res, {
      email: 'cron@system',
      role: 'landlord',
      userId: 'system',
      userName: 'System'
    });
  }
  
  // Require auth for manual calls
  return withAuth(handler, { requireRole: 'landlord' })(req, res);
};

