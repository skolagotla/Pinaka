import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { generatedFormService } from '@/lib/domains/generated-form';
import {
  generatedFormCreateSchema,
  generatedFormUpdateSchema,
  generatedFormQuerySchema,
} from '@/lib/schemas';
import { z } from 'zod';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method === 'GET') {
    const queryResult = generatedFormQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: queryResult.error.issues,
        },
      });
    }
    const query = queryResult.data;
    const { forms, total } = await generatedFormService.getGeneratedForms(query, user);
    const page = query.page || 1;
    const limit = query.limit || 50;
    return res.status(200).json({
      success: true,
      forms,
      pagination: {
        total,
        limit,
        offset: (page - 1) * limit,
        hasMore: page * limit < total,
      },
    });
  } else if (req.method === 'POST') {
    const bodyResult = generatedFormCreateSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request body',
          details: bodyResult.error.issues,
        },
      });
    }
    const result = await generatedFormService.createGeneratedForm(bodyResult.data, user);
    return res.status(201).json({ success: true, data: result });
  } else if (req.method === 'PATCH') {
    const id = req.query.id as string;
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    const bodyResult = generatedFormUpdateSchema.partial().safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request body',
          details: bodyResult.error.issues,
        },
      });
    }
    const result = await generatedFormService.updateGeneratedForm(id, bodyResult.data, user);
    return res.status(200).json({ success: true, data: result });
  } else if (req.method === 'DELETE') {
    const id = req.query.id as string;
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    await generatedFormService.deleteGeneratedForm(id, user);
    return res.status(204).end();
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}, { requireRole: ['landlord', 'pmc'], allowedMethods: ['GET', 'POST', 'PATCH', 'DELETE'] });
