/**
 * Expense Invoice Upload API v1
 * 
 * Handles expense invoice file uploads via multipart/form-data
 * Uploads files to uploads/expense-invoices/ directory
 * Returns receiptUrl for use in expense records
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

// Disable body parser to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

function generateUniqueFilename(originalFilename: string): string {
  const ext = path.extname(originalFilename);
  const base = path.basename(originalFilename, ext);
  const timestamp = Date.now();
  const random = randomBytes(4).toString('hex');
  const sanitized = base.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 50);
  return `${sanitized}_${timestamp}_${random}${ext}`;
}

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create uploads directory structure
    const uploadsDir = path.join(process.cwd(), 'uploads', 'expense-invoices');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

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

    const file = Array.isArray(files.invoice) ? files.invoice[0] : files.invoice;
    if (!file) {
      return res.status(400).json({ error: 'No invoice file uploaded' });
    }

    // Validate file type (allow PDF, images, and common document formats)
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    const fileMimeType = file.mimetype || 'application/octet-stream';
    if (!allowedMimeTypes.includes(fileMimeType) && !file.originalFilename?.match(/\.(pdf|jpg|jpeg|png|gif|doc|docx)$/i)) {
      return res.status(400).json({ 
        error: 'Invalid file type. Allowed types: PDF, images (JPG, PNG, GIF), and documents (DOC, DOCX)' 
      });
    }

    // Generate unique filename
    const originalFilename = file.originalFilename || file.newFilename || 'invoice';
    const uniqueFilename = generateUniqueFilename(originalFilename);

    // Move file to final location with unique name
    const finalPath = path.join(uploadsDir, uniqueFilename);
    if (file.filepath !== finalPath) {
      // File was uploaded to temp location, move it
      if (fs.existsSync(file.filepath)) {
        fs.renameSync(file.filepath, finalPath);
      }
    }

    // Generate receiptUrl (relative path that can be used to access the file)
    // The file will be served via /api/files/expense-invoices/[filename]
    const receiptUrl = `/api/files/expense-invoices/${uniqueFilename}`;

    return res.status(200).json({
      success: true,
      receiptUrl,
      filename: uniqueFilename,
      originalFilename: originalFilename,
      fileSize: file.size,
      message: 'Invoice uploaded successfully',
    });
  } catch (error) {
    console.error('[Expense Invoice Upload v1] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload invoice',
    });
  }
}, { requireRole: ['landlord', 'tenant', 'pmc'], allowedMethods: ['POST'] });

