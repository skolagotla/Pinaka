import type { NextApiRequest, NextApiResponse } from "next";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { prisma } = require('@/lib/prisma');
import { strictRateLimit } from '@/lib/middleware/rate-limiter';
import { createErrorResponse, createSuccessResponse, ErrorCodes, handlePrismaError } from '@/lib/utils/error-response';
import { logger, getCorrelationId } from '@/lib/utils/logger';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    const { statusCode, response } = createErrorResponse(
      ErrorCodes.BAD_REQUEST,
      'Method not allowed',
      405
    );
    return res.status(statusCode).json(response);
  }

  // Set logger context
  const correlationId = getCorrelationId(req);
  logger.setContext({ correlationId });

  const { name, email, phone, company } = req.body || {};
  
  // Validate required fields
  const missingFields: string[] = [];
  if (!email) missingFields.push('email');
  if (!name) missingFields.push('name');
  if (!phone) missingFields.push('phone');
  
  if (missingFields.length > 0) {
    logger.warn('Missing required fields for registration', { missingFields, email });
    const { statusCode, response } = createErrorResponse(
      ErrorCodes.MISSING_REQUIRED_FIELD,
      `Missing required fields: ${missingFields.join(', ')}`,
      400,
      { missingFields }
    );
    return res.status(statusCode).json(response);
  }

  // Validate phone number
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length !== 10) {
    logger.warn('Invalid phone number format', { phone, email });
    const { statusCode, response } = createErrorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Invalid phone number. Must be 10 digits.',
      400
    );
    return res.status(statusCode).json(response);
  }

  const formatted = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6,10)}`;

  try {
    await prisma.userProfile.upsert({
      where: { email },
      create: { name, email, phone: formatted, company },
      update: { name, phone: formatted, company },
    });
    
    logger.info('User registration successful', { email });
    return res.status(200).json(createSuccessResponse({ ok: true }));
  } catch (error: any) {
    logger.error('Registration failed', error, { email, correlationId });

    // Handle Prisma errors
    if (error.code && error.code.startsWith('P')) {
      const { statusCode, response } = handlePrismaError(error);
      return res.status(statusCode).json(response);
    }

    // Generic error
    const { statusCode, response } = createErrorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'Failed to save registration',
      500,
      process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
    );
    return res.status(statusCode).json(response);
  }
}

// Apply strict rate limiting (5 requests per 15 minutes)
export default (req: NextApiRequest, res: NextApiResponse) => {
  strictRateLimit(req, res, () => handler(req, res));
};


