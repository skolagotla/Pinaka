/**
 * Form Generation API v1
 * POST /api/v1/forms/generate
 * 
 * Domain-Driven, API-First implementation
 * Uses domain service instead of direct Prisma access
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { formGenerateSchema } from '@/lib/schemas';
import { z } from 'zod';
import { generatedFormService } from '@/lib/domains/generated-form';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request body
    const validated = formGenerateSchema.parse(req.body);

    // Generate form using domain service
    const generatedForm = await generatedFormService.generateForm(validated, user);

    return res.status(201).json({
      success: true,
      form: generatedForm,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }
    console.error('[Form Generation v1] Error:', error);
    
    // Handle domain service errors
    if (error instanceof Error) {
      if (error.message.includes('Forbidden') || error.message.includes('permission')) {
        return res.status(403).json({
          success: false,
          error: error.message,
        });
      }
      if (error.message.includes('Only landlords')) {
        return res.status(403).json({
          success: false,
          error: error.message,
        });
      }
    }

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate form',
    });
  }
}, { requireRole: ['landlord'], allowedMethods: ['POST'] });

