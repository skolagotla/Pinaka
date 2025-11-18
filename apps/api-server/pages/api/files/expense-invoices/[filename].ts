import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { lookup } from 'mime-types';
import { withAuth } from '@/lib/middleware/apiMiddleware';
import { prisma } from '@/lib/prisma';

/**
 * Serve expense invoice files
 * This endpoint serves uploaded invoice files
 * SECURITY FIX: Added authentication and authorization checks
 */
async function handler(req: NextApiRequest, res: NextApiResponse, user: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filename } = req.query;

    if (!filename || typeof filename !== 'string') {
      return res.status(400).json({ error: 'Filename required' });
    }

    // Security: Prevent directory traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), 'uploads', 'expense-invoices', safeFilename);

    // Security: Ensure file path is within uploads directory (prevent path traversal)
    const uploadsDir = path.join(process.cwd(), 'uploads', 'expense-invoices');
    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith(path.normalize(uploadsDir))) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Security: Verify user has access to this expense invoice
    // Find expense record that references this file
    const expense = await prisma.expense.findFirst({
      where: {
        receiptUrl: {
          contains: safeFilename,
        },
        OR: [
          // Landlord can access their own expenses
          { createdBy: user.userId },
          // Tenant can access expenses for their maintenance requests (if applicable)
          ...(user.role === 'tenant' ? [
            {
              maintenanceRequest: {
                tenantId: user.userId,
              },
            },
          ] : []),
        ],
      },
      select: {
        id: true,
        createdBy: true,
        propertyId: true,
        maintenanceRequestId: true,
      },
    });

    // If no expense record found, check if user is landlord and has access to property
    if (!expense && user.role === 'landlord') {
      // Allow access if user is landlord (they may have uploaded it)
      // Additional check: verify file belongs to their property expenses
      const propertyExpense = await prisma.expense.findFirst({
        where: {
          receiptUrl: {
            contains: safeFilename,
          },
          property: {
            landlordId: user.userId,
          },
        },
      });

      if (!propertyExpense) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (!expense) {
      // No expense record found and user is not landlord
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    let mimeType = lookup(filePath) || 'application/octet-stream';
    
    // Force PDF MIME type for PDF files to ensure proper display in iframe
    if (safeFilename.toLowerCase().endsWith('.pdf')) {
      mimeType = 'application/pdf';
    }

    // Set headers
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Stream file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error: any) {
    console.error('[Serve Invoice] Error:', error);
    return res.status(500).json({ error: 'Failed to serve file', message: error.message });
  }
}

// Export with authentication middleware
export default withAuth(handler, { 
  allowedMethods: ['GET'] 
});

