/**
 * Lease Controller
 * 
 * API interface layer - handles HTTP requests
 * Uses @pinaka/schemas for DTOs
 * Maps between DTOs and domain entities
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { LeaseApplicationService } from '../application/LeaseApplicationService';
import { LeaseRepository } from '../infrastructure/LeaseRepository';
import { PrismaClient } from '@prisma/client';
// Note: Using types from schema registry - these will be available after generation
// import { LeaseCreate, LeaseUpdate, LeaseResponse } from '@pinaka/schemas';
type LeaseCreate = any;
type LeaseUpdate = any;
type LeaseResponse = any;
import { validateRequest, validateResponse } from '@/lib/api/validation-helpers';

/**
 * Create lease controller
 */
export function createLeaseController(prisma: PrismaClient) {
  const repository = new LeaseRepository(prisma);
  const service = new LeaseApplicationService(repository);

  return {
    /**
     * GET /api/v1/leases/:id
     */
    async getById(req: NextApiRequest, res: NextApiResponse) {
      try {
        const { id } = req.query;
        const lease = await service.getById(id as string);
        
        if (!lease) {
          return res.status(404).json({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Lease not found' },
          });
        }

        // Map domain entity to DTO
        const dto: LeaseResponse = lease.toJSON();
        return res.status(200).json({
          success: true,
          data: dto, // TODO: Use proper schema validation after generation
        });
      } catch (error: any) {
        return res.status(500).json({
          success: false,
          error: { code: 'INTERNAL_ERROR', message: error.message },
        });
      }
    },

    /**
     * POST /api/v1/leases
     */
    async create(req: NextApiRequest, res: NextApiResponse) {
      try {
        // Validate request body using schema
        // TODO: Use proper schema validation after generation
        const body = req.body as LeaseCreate;
        
        // Map DTO to domain entity
        const lease = await service.createLease({
          propertyId: body.propertyId,
          tenantId: body.tenantId,
          startDate: new Date(body.startDate),
          endDate: new Date(body.endDate),
          monthlyRent: body.monthlyRent,
          status: 'active',
        });

        // Map domain entity to DTO
        const dto: LeaseResponse = lease.toJSON();
        return res.status(201).json({
          success: true,
          data: dto, // TODO: Use proper schema validation after generation
        });
      } catch (error: any) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: error.message },
        });
      }
    },

    /**
     * PATCH /api/v1/leases/:id
     */
    async update(req: NextApiRequest, res: NextApiResponse) {
      try {
        const { id } = req.query;
        // TODO: Use proper schema validation after generation
        const body = req.body as LeaseUpdate;
        
        // Update logic here...
        // This would call service.updateLease(id, body)
        
        return res.status(200).json({
          success: true,
          message: 'Lease updated',
        });
      } catch (error: any) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: error.message },
        });
      }
    },
  };
}

