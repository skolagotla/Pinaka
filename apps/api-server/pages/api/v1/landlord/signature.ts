/**
 * Landlord Signature API v1
 * GET /api/v1/landlord/signature - Get signature
 * POST /api/v1/landlord/signature - Upload signature
 * DELETE /api/v1/landlord/signature - Remove signature
 * 
 * Domain-Driven, API-First, Shared-Schema implementation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { landlordService } from '@/lib/domains/landlord';
import { propertyService } from '@/lib/domains/property';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method === 'GET') {
    try {
      let landlordId = user.userId;

      // For PMC users, check if landlordId is provided in query
      if (user.role === 'pmc') {
        const { landlordId: queryLandlordId } = req.query;
        if (!queryLandlordId || typeof queryLandlordId !== 'string') {
          return res.status(400).json({ error: 'landlordId query parameter is required for PMC users' });
        }

        // Verify PMC manages this landlord using domain service (Domain-Driven Design)
        // Get a property for this landlord to verify access
        const propertyResult = await propertyService.list({
          landlordId: queryLandlordId,
          page: 1,
          limit: 1,
        });
        const properties = propertyResult.properties || propertyResult.data || [];
        if (properties.length === 0) {
          return res.status(404).json({ error: 'No properties found for this landlord' });
        }
        const hasAccess = await propertyService.verifyPMCAccess(user.userId, properties[0].id);
        if (!hasAccess) {
          return res.status(403).json({ error: 'You do not manage this landlord' });
        }

        landlordId = queryLandlordId;
      } else if (user.role !== 'landlord') {
        return res.status(403).json({ error: 'Only landlords and PMC users can access signatures' });
      }

      // Use domain service to get signature (Domain-Driven Design)
      const signatureFileName = await landlordService.getSignature(landlordId);

      if (!signatureFileName) {
        return res.status(404).json({ error: 'No signature found' });
      }

      return res.status(200).json({
        signatureFileName,
        signatureUrl: `/signatures/${signatureFileName}`,
      });
    } catch (error) {
      console.error('[Signature GET v1] Error:', error);
      return res.status(500).json({ error: 'Failed to get signature' });
    }
  }

  // POST and DELETE - Only landlords can manage their own signatures
  if (user.role !== 'landlord') {
    return res.status(403).json({ error: 'Only landlords can manage signatures' });
  }

  if (req.method === 'POST') {
    try {
      const signaturesDir = path.join(process.cwd(), 'public', 'signatures');
      if (!fs.existsSync(signaturesDir)) {
        fs.mkdirSync(signaturesDir, { recursive: true });
      }

      const form = formidable({
        uploadDir: signaturesDir,
        keepExtensions: true,
        maxFileSize: 5 * 1024 * 1024, // 5MB
        filename: (name, ext) => `signature-${user.userId}-${Date.now()}${ext}`,
      });

      const [fields, files] = await form.parse(req);
      const uploadedFile = files.signature?.[0];

      if (!uploadedFile) {
        return res.status(400).json({ error: 'No signature file uploaded' });
      }

      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(uploadedFile.mimetype || '')) {
        fs.unlinkSync(uploadedFile.filepath);
        return res.status(400).json({ error: 'Only image files (PNG, JPG, GIF) are allowed' });
      }

      // Delete old signature if exists using domain service
      const oldSignatureFileName = await landlordService.getSignature(user.userId);
      if (oldSignatureFileName) {
        const oldPath = path.join(signaturesDir, oldSignatureFileName);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // Process and optimize image
      const processedImagePath = path.join(signaturesDir, `processed-${path.basename(uploadedFile.filepath)}`);
      await sharp(uploadedFile.filepath)
        .resize(300, 100, { fit: 'inside', withoutEnlargement: true })
        .png()
        .toFile(processedImagePath);

      // Replace original with processed
      fs.unlinkSync(uploadedFile.filepath);
      fs.renameSync(processedImagePath, uploadedFile.filepath);

      const signatureFileName = path.basename(uploadedFile.filepath);
      // Use domain service to update signature (Domain-Driven Design)
      await landlordService.updateSignature(user.userId, signatureFileName);

      return res.status(200).json({
        success: true,
        signatureFileName,
        signatureUrl: `/signatures/${signatureFileName}`,
      });
    } catch (error) {
      console.error('[Signature POST v1] Error:', error);
      return res.status(500).json({ error: 'Failed to upload signature' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Use domain service to get and remove signature (Domain-Driven Design)
      const signatureFileName = await landlordService.getSignature(user.userId);

      if (signatureFileName) {
        const signaturesDir = path.join(process.cwd(), 'public', 'signatures');
        const filePath = path.join(signaturesDir, signatureFileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        // Use domain service to update signature to null
        await landlordService.updateSignature(user.userId, null);
      }

      return res.status(200).json({
        success: true,
        message: 'Signature removed successfully',
      });
    } catch (error) {
      console.error('[Signature DELETE v1] Error:', error);
      return res.status(500).json({ error: 'Failed to remove signature' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}, { requireRole: ['landlord', 'pmc'], allowedMethods: ['GET', 'POST', 'DELETE'] });

