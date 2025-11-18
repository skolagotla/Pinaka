import { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from '@/lib/middleware/apiMiddleware';
const { generateLandlordHash } = require('@/lib/hooks/useHashGenerator');
import { createErrorResponse, createSuccessResponse, ErrorCodes, handlePrismaError } from '@/lib/utils/error-response';
import { logger, getCorrelationId } from '@/lib/utils/logger';
import { mapCountryRegionToFKs } from '@/lib/utils/country-region-mapper';

// Helper function to get prisma instance (always works)
function getPrisma() {
  try {
    const prismaModule = require('@/lib/prisma');
    return prismaModule.prisma;
  } catch (error) {
    console.error('[Landlords API] Failed to load Prisma:', error);
    return null;
  }
}

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user) => {
  // Get prisma instance
  const prisma = getPrisma();
  if (!prisma) {
    return res.status(500).json({
      success: false,
      error: 'Database error',
      message: 'Database connection not available'
    });
  }

  if (req.method === "GET") {
    // For tenants: Get landlords they have active leases with
    if (user.role === 'tenant') {
      try {
        const tenant = await prisma.tenant.findUnique({
          where: { id: user.userId },
          include: {
            leaseTenants: {
              include: {
                lease: {
                  include: {
                    unit: {
                      include: {
                        property: {
                          include: {
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
        });

        if (!tenant) {
          const { statusCode, response } = createErrorResponse(
            ErrorCodes.TENANT_NOT_FOUND,
            'Tenant not found',
            404
          );
          return res.status(statusCode).json(response);
        }

        // Extract unique landlords from active leases
        const landlordMap = new Map();
        tenant.leaseTenants.forEach(lt => {
          if (lt.lease?.status === 'Active' && lt.lease?.unit?.property?.landlord) {
            const landlord = lt.lease.unit.property.landlord;
            if (!landlordMap.has(landlord.id)) {
              landlordMap.set(landlord.id, {
                id: landlord.id,
                firstName: landlord.firstName,
                lastName: landlord.lastName,
                email: landlord.email
              });
            }
          }
        });

        const landlords = Array.from(landlordMap.values());
        return res.status(200).json(createSuccessResponse({ landlords }));
      } catch (error: any) {
        logger.error('Failed to fetch landlords for tenant', error, {
          tenantId: user.userId,
          correlationId: getCorrelationId(req),
        });
        const { statusCode, response } = createErrorResponse(
          ErrorCodes.INTERNAL_SERVER_ERROR,
          'Failed to fetch landlords',
          500
        );
        return res.status(statusCode).json(response);
      }
    }

    // For landlords: Get all landlords (admin function, or return self)
    if (user.role === 'landlord') {
      try {
        // For now, just return the current landlord
        const landlord = await prisma.landlord.findUnique({
          where: { id: user.userId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        });

        if (!landlord) {
          const { statusCode, response } = createErrorResponse(
            ErrorCodes.RESOURCE_NOT_FOUND,
            'Landlord not found',
            404
          );
          return res.status(statusCode).json(response);
        }

        return res.status(200).json(createSuccessResponse({ landlords: [landlord] }));
      } catch (error: any) {
        logger.error('Failed to fetch landlord', error, {
          landlordId: user.userId,
          correlationId: getCorrelationId(req),
        });
        const { statusCode, response } = createErrorResponse(
          ErrorCodes.INTERNAL_SERVER_ERROR,
          'Failed to fetch landlords',
          500
        );
        return res.status(statusCode).json(response);
      }
    }

    // For PMC: Get all landlords managed by this PMC
    if (user.role === 'pmc') {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Landlords API] PMC user:', {
            userId: user.userId,
            email: user.email,
            role: user.role,
          });
        }
        
        const relationships = await prisma.pMCLandlord.findMany({
          where: {
            pmcId: user.userId,
            status: 'active',
            OR: [
              { endedAt: null },
              { endedAt: { gt: new Date() } },
            ],
          },
          include: {
            landlord: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        });
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[Landlords API] PMC relationships found:', {
            count: relationships.length,
            pmcId: user.userId,
          });
        }

        const landlords = relationships.map(rel => ({
          ...rel.landlord,
          relationshipId: rel.id,
          startedAt: rel.startedAt,
        }));

        return res.status(200).json(createSuccessResponse({ 
          landlords: landlords,
          data: landlords, // Keep for backward compatibility
        }));
      } catch (error: any) {
        logger.error('Failed to fetch landlords for PMC', error, {
          pmcId: user.userId,
          correlationId: getCorrelationId(req),
        });
        const { statusCode, response } = createErrorResponse(
          ErrorCodes.INTERNAL_SERVER_ERROR,
          'Failed to fetch landlords',
          500
        );
        return res.status(statusCode).json(response);
      }
    }

    const { statusCode, response } = createErrorResponse(
      ErrorCodes.FORBIDDEN,
      'Unauthorized',
      403
    );
    return res.status(statusCode).json(response);
  }

  if (req.method === "POST") {
    // Set logger context
    const correlationId = getCorrelationId(req);
    logger.setContext({ correlationId });

    try {
      const {
        firstName,
        middleName,
        lastName,
        email,
        phone,
        addressLine1,
        addressLine2,
        city,
        country, // Legacy - keep for backward compat
        provinceState, // Legacy - keep for backward compat
        countryCode, // New FK field
        regionCode, // New FK field
        postalZip,
      } = req.body;

      // Validation with standardized errors
      const missingFields: string[] = [];
      if (!firstName) missingFields.push('firstName');
      if (!lastName) missingFields.push('lastName');
      if (!email) missingFields.push('email');
      if (!phone) missingFields.push('phone');
      if (!addressLine1) missingFields.push('addressLine1');
      if (!city) missingFields.push('city');
      if (!postalZip) missingFields.push('postalZip');

      if (missingFields.length > 0) {
        logger.warn('Missing required fields for landlord creation', { missingFields, email });
        const { statusCode, response } = createErrorResponse(
          ErrorCodes.MISSING_REQUIRED_FIELD,
          `Missing required fields: ${missingFields.join(', ')}`,
          400,
          { missingFields }
        );
        return res.status(statusCode).json(response);
      }

      // Validate phone format (should be 10 digits)
      const phoneDigits = phone.replace(/\D/g, "");
      if (phoneDigits.length !== 10) {
        logger.warn('Invalid phone number format', { phone, email });
        const { statusCode, response } = createErrorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'Invalid phone number format. Must be 10 digits.',
          400
        );
        return res.status(statusCode).json(response);
      }

      // Map country/provinceState to FKs
      const { countryCode: finalCountryCode, regionCode: finalRegionCode } = await mapCountryRegionToFKs(
        country,
        provinceState,
        countryCode,
        regionCode
      );

      // Validate postal/zip code based on country
      const countryForValidation = finalCountryCode || country;
      if (countryForValidation === "CA") {
        const postalRegex = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/;
        if (!postalRegex.test(postalZip.replace(/\s/g, ""))) {
          const { statusCode, response } = createErrorResponse(
            ErrorCodes.VALIDATION_ERROR,
            "Invalid Canadian postal code",
            400
          );
          return res.status(statusCode).json(response);
        }
      } else if (countryForValidation === "US") {
        if (!/^\d{5}$/.test(postalZip)) {
          const { statusCode, response } = createErrorResponse(
            ErrorCodes.VALIDATION_ERROR,
            "Invalid US ZIP code",
            400
          );
          return res.status(statusCode).json(response);
        }
      }

      // Check if landlord already exists
      const existingLandlord = await prisma.landlord.findUnique({
        where: { email },
      });

      if (existingLandlord) {
        logger.warn('Landlord already exists', { email });
        const { statusCode, response } = createErrorResponse(
          ErrorCodes.DUPLICATE_ENTRY,
          "Landlord already registered",
          409
        );
        return res.status(statusCode).json(response);
      }

      // Generate landlord ID using unified hash generator
      const landlordId = generateLandlordHash({
        email,
        phone,
        country,
        provinceState,
      });

      // Create landlord
      const landlord = await prisma.landlord.create({
        data: {
          landlordId,
          firstName,
          middleName: middleName || null,
          lastName,
          email,
          phone,
          addressLine1,
          addressLine2: addressLine2 || null,
          city,
          provinceState: provinceState || null, // Legacy - keep for backward compat
          postalZip,
          country: country || null, // Legacy - keep for backward compat
          countryCode: finalCountryCode || null, // New FK
          regionCode: finalRegionCode || null, // New FK
        },
      });

      logger.info('Landlord created successfully', { landlordId: landlord.id, email: landlord.email });
      return res.status(201).json(createSuccessResponse(landlord));
    } catch (error: any) {
      logger.error('Failed to create landlord', error, { email: req.body?.email || 'unknown', correlationId });

      // Handle Prisma errors
      if (error.code && error.code.startsWith('P')) {
        const { statusCode, response } = handlePrismaError(error);
        return res.status(statusCode).json(response);
      }

      // Generic error
      const { statusCode, response } = createErrorResponse(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        'Failed to create landlord',
        500,
        process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
      );
      return res.status(statusCode).json(response);
    }
  }

  const { statusCode, response } = createErrorResponse(
    ErrorCodes.BAD_REQUEST,
    'Method not allowed',
    405
  );
  return res.status(statusCode).json(response);
}, { allowedMethods: ['GET', 'POST'] });

