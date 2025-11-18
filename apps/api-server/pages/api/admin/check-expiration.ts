import { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from '@/lib/middleware/apiMiddleware';
const { PrismaClient } = require('@prisma/client');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);

const prisma = new PrismaClient();

const {
  sendExpirationReminder,
  sendPostLeaseDocumentReminder,
  sendLandlordExpirationNotification,
} = require('@/lib/email/document-notifications');

const { getCategoryById } = require('@/lib/constants/document-categories');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user) => {
  if (req.method === "POST") {
    console.log(`[Expiration Check] Manual check triggered by ${user.userName}`);

    // Get all documents with expiration dates for this landlord's tenants
    const documents = await prisma.document.findMany({
      where: {
        expirationDate: {
          not: null,
        },
        tenant: {
          leaseTenants: {
            some: {
              lease: {
                unit: {
                  property: {
                    landlordId: user.userId,
                  },
                },
              },
            },
          },
        },
      },
      include: {
        tenant: {
          include: {
            leaseTenants: {
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
                  },
                },
              },
            },
          },
        },
      },
    });

    let remindersSent = 0;
    let remindersSkipped = 0;
    const expiringDocuments: Array<{
      documentId: string;
      documentName: string;
      category: string;
      tenantName: string;
      daysRemaining: number;
      reminderSent: boolean;
    }> = [];

    for (const document of documents) {
      const now = dayjs();
      const expiry = dayjs(document.expirationDate);
      const daysRemaining = expiry.diff(now, 'day');

      const category = getCategoryById(document.category);
      const tenant = document.tenant;
      const docLandlord = tenant.leaseTenants[0]?.lease?.unit?.property?.landlord;

      if (!docLandlord) continue;

      // Check if reminder should be sent
      let shouldSendReminder = false;

      if (category && category.expirationReminders) {
        if (category.expirationReminders.includes(daysRemaining)) {
          shouldSendReminder = true;
        }
      }

      // Also include expired documents
      if (daysRemaining < 0 && daysRemaining >= -1) {
        shouldSendReminder = true;
      }

      if (!shouldSendReminder) {
        remindersSkipped++;
        continue;
      }

      // Check if reminder was already sent today
      const reminderSentToday = document.reminderSentAt && 
        dayjs(document.reminderSentAt).isSame(now, 'day');

      if (reminderSentToday) {
        remindersSkipped++;
        continue;
      }

      // Send reminder email
      const emailResult = await sendExpirationReminder(
        tenant,
        document,
        docLandlord,
        daysRemaining
      );

      if (emailResult.success) {
        // Update reminder status
        await prisma.document.update({
          where: { id: document.id },
          data: {
            reminderSent: true,
            reminderSentAt: new Date(),
          },
        });

        remindersSent++;

        expiringDocuments.push({
          documentId: document.id,
          documentName: document.originalName,
          category: category?.name || document.category,
          tenantName: `${tenant.firstName} ${tenant.lastName}`,
          daysRemaining,
          reminderSent: true,
        });
      }
    }

    // Check post-lease documents
    const activeLeases = await prisma.lease.findMany({
      where: {
        status: 'Active',
        unit: {
          property: {
            landlordId: user.userId,
          },
        },
      },
      include: {
        leaseTenants: {
          include: {
            tenant: {
              include: {
                documents: true,
              },
            },
          },
        },
        unit: {
          include: {
            property: {
              include: {
                landlord: true,
              },
            },
          },
        },
      },
    });

    let postLeaseRemindersSent = 0;

    for (const lease of activeLeases) {
      const leaseStart = dayjs(lease.leaseStart);
      const now = dayjs();
      const updateIdDueDate = leaseStart.add(30, 'day');
      const daysUntilDue = updateIdDueDate.diff(now, 'day');
      const daysOverdue = now.diff(updateIdDueDate, 'day');

      for (const lt of lease.leaseTenants) {
        const tenant = lt.tenant;
        const documents = tenant.documents || [];

        const hasUpdatedId = documents.some((doc: any) => doc.category === 'UPDATED_ID');

        if (hasUpdatedId) continue;

        let shouldSendReminder = false;

        if (daysOverdue > 0 && daysOverdue % 7 === 0) {
          shouldSendReminder = true;
        } else if (daysUntilDue === 10 || daysUntilDue === 2) {
          shouldSendReminder = true;
        }

        if (!shouldSendReminder) continue;

        const emailResult = await sendPostLeaseDocumentReminder(
          tenant,
          { category: 'UPDATED_ID' } as any,
          lease.unit.property.landlord,
          daysOverdue > 0 ? daysOverdue : 0
        );

        if (emailResult.success) {
          postLeaseRemindersSent++;
        }
      }
    }

    console.log(`[Expiration Check] Complete: ${remindersSent} reminders sent, ${remindersSkipped} skipped, ${postLeaseRemindersSent} post-lease reminders sent`);

    return res.status(200).json({
      success: true,
      documentsChecked: documents.length,
      remindersSent,
      remindersSkipped,
      postLeaseRemindersSent,
      expiringDocuments,
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}, { requireRole: 'landlord', allowedMethods: ['POST'] });
