/**
 * Document View API v1
 * GET /api/v1/documents/:id/view
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { documentService } from '@/lib/domains/document';
const fs = require('fs');
const path = require('path');

/**
 * Document View API v1
 * GET /api/v1/documents/:id/view
 * 
 * Domain-Driven, API-First implementation
 * Uses domain service instead of direct Prisma access
 */
export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const fileIndex = req.query.fileIndex ? parseInt(req.query.fileIndex as string) : undefined;
    const versionIndex = req.query.versionIndex ? parseInt(req.query.versionIndex as string) : undefined;

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    // Get document via domain service (Domain-Driven Design)
    const document = await documentService.getById(id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Determine file path
    // Note: Document model doesn't have versions or files relations
    // Use the document's storagePath directly
    const filePath = document.storagePath;

    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Determine content type
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
    };
    const contentType = contentTypes[ext] || 'application/octet-stream';

    // Stream file
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${document.originalName || document.fileName}"`);
    const fileStream = fs.createReadStream(fullPath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('[Document View v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to view document',
    });
  }
}, { requireRole: ['landlord', 'tenant', 'pmc'], allowedMethods: ['GET'] });

