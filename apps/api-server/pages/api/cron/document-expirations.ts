/**
 * Cron Job: Document Expiration Alerts
 * Sends email alerts at 54, 30, and 15 days before documents expire
 * Implements Business Rule 10: Document Expiration Reminders
 * 
 * Can be called via:
 * - Vercel Cron: vercel.json cron configuration
 * - Manual API call: GET /api/cron/document-expirations
 * - Scheduled task runner
 */

import { NextApiRequest, NextApiResponse } from 'next';
const { prisma } = require('@/lib/prisma');
const { sendDocumentExpirationAlert } = require('@/lib/email-templates/document-expiration');
const { checkExpiringDocuments } = require('@/lib/services/document-expiration-service');

// Reminder thresholds: 54, 30, and 15 days before expiration
const REMINDER_DAYS = [54, 30, 15];

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const results: Array<{
      daysBeforeExpiration: number;
      checked?: number;
      notified?: number;
      error?: string;
    }> = [];

    // Check for each reminder threshold
    // The service will only send reminders if the document hasn't been reminded for this specific threshold
    for (const days of REMINDER_DAYS) {
      try {
        const result = await checkExpiringDocuments(days);
        results.push({
          daysBeforeExpiration: days,
          ...result,
        });
      } catch (error: any) {
        console.error(`[Document Expiration] Error checking ${days} days:`, error);
        results.push({
          daysBeforeExpiration: days,
          checked: 0,
          notified: 0,
          error: error?.message || 'Unknown error',
        });
      }
    }

    // Also check for expired documents that need archiving
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // PERFORMANCE OPTIMIZATION: Use select instead of include to reduce data transfer
    const expiredDocuments = await prisma.document.findMany({
      where: {
        expirationDate: {
          not: null,
          lt: now,
        },
        isDeleted: false,
        isArchived: false,
      },
      select: {
        id: true,
        tenantId: true,
        fileName: true,
        originalName: true,
        expirationDate: true,
        category: true,
        visibility: true,
        tenant: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            leaseTenants: {
              select: {
                lease: {
                  select: {
                    unit: {
                      select: {
                        property: {
                          select: {
                            landlord: {
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
                }
              }
            }
          }
        }
      }
    });

    // Group documents by recipient (tenant or landlord)
    type RecipientInfo = {
      email: string;
      name: string;
      isLandlord: boolean;
      documents: Array<{
        fileName: string;
        originalName: string;
        expirationDate: Date | null;
        category: string | null;
        tenantName?: string;
      }>;
    };
    const documentsByRecipient = new Map<string, RecipientInfo>();

    for (const doc of expiredDocuments) {
      // BUG FIX: Add null checks for nested properties
      if (!doc.tenant) {
        console.warn(`[Document Expiration] Document ${doc.id} has no tenant, skipping`);
        continue;
      }

      // Send to tenant
      const tenantKey = `tenant-${doc.tenantId}`;
      if (!documentsByRecipient.has(tenantKey)) {
        documentsByRecipient.set(tenantKey, {
          email: doc.tenant.email,
          name: `${doc.tenant.firstName || ''} ${doc.tenant.lastName || ''}`.trim() || 'Tenant',
          isLandlord: false,
          documents: []
        });
      }
      documentsByRecipient.get(tenantKey)!.documents.push({
        fileName: doc.fileName,
        originalName: doc.originalName,
        expirationDate: doc.expirationDate,
        category: doc.category
      });

      // Send to landlord if document is shared
      if (doc.visibility === 'shared' || doc.visibility === 'landlord') {
        // BUG FIX: Use optional chaining and null check
        const landlord = doc.tenant?.leaseTenants?.[0]?.lease?.unit?.property?.landlord;
        if (landlord) {
          const landlordKey = `landlord-${landlord.id}`;
          if (!documentsByRecipient.has(landlordKey)) {
            documentsByRecipient.set(landlordKey, {
              email: landlord.email,
              name: `${landlord.firstName || ''} ${landlord.lastName || ''}`.trim() || 'Landlord',
              isLandlord: true,
              documents: []
            });
          }
          documentsByRecipient.get(landlordKey)!.documents.push({
            fileName: doc.fileName,
            originalName: doc.originalName,
            expirationDate: doc.expirationDate,
            category: doc.category,
            tenantName: `${doc.tenant?.firstName || ''} ${doc.tenant?.lastName || ''}`.trim() || 'Tenant'
          });
        }
      }
    }

    let alertsSent = 0;
    const errors: string[] = [];

    // Send alerts to each recipient
    for (const [key, recipient] of documentsByRecipient.entries()) {
      try {
        const result = await sendDocumentExpirationAlert({
          recipientEmail: recipient.email,
          recipientName: recipient.name,
          isLandlord: recipient.isLandlord,
          documents: recipient.documents
        });

        if (result.success) {
          alertsSent++;
          
          // Mark reminders as sent for all documents for this recipient
          for (const doc of expiredDocuments) {
            if (recipient.isLandlord) {
              // For landlord, only mark if document is shared
              if (doc.visibility === 'shared' || doc.visibility === 'landlord') {
                await prisma.document.update({
                  where: { id: doc.id },
                  data: {
                    reminderSent: true,
                    reminderSentAt: new Date()
                  }
                });
              }
            } else {
              // For tenant, always mark
              await prisma.document.update({
                where: { id: doc.id },
                data: {
                  reminderSent: true,
                  reminderSentAt: new Date()
                }
              });
            }
          }
        }
      } catch (error: any) {
        errors.push(`Failed to send alert to ${recipient.email}: ${error.message}`);
      }
    }

    // Archive expired documents (keep for 7 years)
    let archived = 0;
    for (const doc of expiredDocuments) {
      try {
        await prisma.document.update({
          where: { id: doc.id },
          data: {
            isArchived: true,
            archivedAt: new Date(),
            // Keep document but mark as archived
          },
        });
        archived++;
      } catch (error: any) {
        console.error(`[Document Expiration] Failed to archive document ${doc.id}:`, error);
      }
    }

    const totalNotified = results.reduce((sum, r) => sum + (r.notified || 0), 0);

    return res.status(200).json({
      success: true,
      message: 'Document expiration alerts processed',
      results: {
        reminders: results,
        expiredArchived: archived,
      },
      stats: {
        totalNotified,
        archived,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error: any) {
    console.error('[Document Expirations Cron] Error:', error);
    return res.status(500).json({
      error: 'Failed to process document expiration alerts',
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
    return handler(req, res);
  }
  
  // Require auth for manual calls
  const { withAuth } = require('@/lib/middleware/apiMiddleware');
  return withAuth(handler, { requireRole: 'landlord' })(req, res);
};

