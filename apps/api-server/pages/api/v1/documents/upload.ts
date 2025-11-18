/**
 * Document Upload API v1
 * 
 * Handles file uploads via multipart/form-data
 * This is a separate endpoint from the main documents API to handle FormData
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
const { prisma } = require('@/lib/prisma');
const appConfig = require('@/lib/config/app-config').default || require('@/lib/config/app-config');
const { generateDocumentHash } = require('@/lib/hooks/useHashGenerator');
const {
  validateDocumentUpload,
  generateUniqueFilename,
  getDocumentStoragePath,
} = require('@/lib/utils/document-utils');
const { getCategoryById } = require('@/lib/constants/document-categories');
const {
  logDocumentAction,
  getIpAddress,
  getUserAgent,
  AUDIT_ACTIONS
} = require('@/lib/utils/document-audit');
const { DocumentService, DocumentRepository } = require('@/lib/domains/document');

// Disable body parser to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

function generateId(): string {
  return randomBytes(12).toString('base64')
    .replace(/\+/g, '')
    .replace(/\//g, '')
    .replace(/=/g, '')
    .substring(0, 20);
}

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create uploads directory structure
    const uploadsDir = path.join(process.cwd(), 'uploads', 'documents');
    ['landlord', 'tenant/required', 'tenant/optional'].forEach(subdir => {
      const dir = path.join(uploadsDir, subdir);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Parse form data
    const form = formidable({
      uploadDir: uploadsDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const categoryId = Array.isArray(fields.category) ? fields.category[0] : fields.category;
    const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
    const tenantId = Array.isArray(fields.tenantId) ? fields.tenantId[0] : fields.tenantId;
    const propertyId = Array.isArray(fields.propertyId) ? fields.propertyId[0] : fields.propertyId;
    const replaceExisting = Array.isArray(fields.replaceExisting) ? fields.replaceExisting[0] : fields.replaceExisting;
    const replaceId = req.query.replaceId as string | undefined;

    // Use DocumentService to create document
    const repository = new DocumentRepository(prisma);
    const service = new DocumentService(repository);

    // Handle file upload logic (similar to legacy endpoint)
    const category = getCategoryById(categoryId);
    if (!category) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Validate file
    const validation = validateDocumentUpload(file, category);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Generate unique filename and storage path
    const uniqueFilename = generateUniqueFilename(file.originalFilename || file.newFilename);
    const storagePath = getDocumentStoragePath(user.role, categoryId, uniqueFilename);

    // Move file to final location
    const finalPath = path.join(process.cwd(), storagePath);
    const finalDir = path.dirname(finalPath);
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }
    fs.renameSync(file.filepath, finalPath);

    // Generate document hash
    const documentHash = generateDocumentHash(finalPath);

    // Create document record
    const documentData = {
      id: generateId(),
      tenantId: tenantId || user.userId,
      propertyId: propertyId || null,
      fileName: uniqueFilename,
      originalName: file.originalFilename || file.newFilename,
      fileType: file.mimetype || 'application/octet-stream',
      fileSize: file.size,
      category: categoryId,
      description: description || '',
      storagePath,
      uploadedBy: user.userId,
      uploadedByEmail: user.email,
      uploadedByName: user.userName || user.email,
    };

    const document = await service.create(documentData, user);

    // Log audit
    await logDocumentAction({
      documentId: document.id,
      action: AUDIT_ACTIONS.UPLOAD,
      userId: user.userId,
      userEmail: user.email,
      userName: documentData.uploadedByName,
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
      metadata: {
        category: categoryId,
        fileName: documentData.originalName,
        fileSize: file.size,
      },
    });

    return res.status(201).json({
      success: true,
      document,
    });
  } catch (error) {
    console.error('[Document Upload v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to upload document',
    });
  }
}, { requireRole: ['landlord', 'tenant', 'pmc'], allowedMethods: ['POST'] });

