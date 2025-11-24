/**
 * Units API v1 (nested under Properties)
 * GET /api/v1/properties/:id/units - List units for a property
 * POST /api/v1/properties/:id/units - Create a unit
 * PATCH /api/v1/properties/:id/units/:unitId - Update a unit
 * DELETE /api/v1/properties/:id/units/:unitId - Delete a unit
 * 
 * Domain-Driven, API-First implementation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { PropertyService, PropertyRepository } from '@/lib/domains/property';
import { UnitService, UnitRepository } from '@/lib/domains/unit';
import { unitCreateSchema, unitUpdateSchema } from '@/lib/schemas';
const { prisma } = require('@/lib/prisma');

async function handler(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  const { id: propertyId, unitId } = req.query;

  if (typeof propertyId !== 'string') {
    return res.status(400).json({ error: 'Property ID is required' });
  }

  // Verify property access
  const propertyRepository = new PropertyRepository(prisma);
  const propertyService = new PropertyService(propertyRepository);
  const property = await propertyService.getById(propertyId);
  
  // Check RBAC access
  if (!property || (user.role !== 'admin' && property.landlordId !== user.userId)) {
    return res.status(404).json({ error: 'Property not found or forbidden' });
  }

  // Initialize domain services
  const unitRepository = new UnitRepository(prisma);
  const unitService = new UnitService(unitRepository, propertyRepository);

  if (req.method === 'GET') {
    // List units
    const units = await unitService.getByPropertyId(propertyId, { property: true });

    return res.status(200).json({
      success: true,
      data: units,
    });
  }

  if (req.method === 'POST') {
    // Create unit
    const validated = unitCreateSchema.parse(req.body);
    const unit = await unitService.create(
      {
        ...validated,
        propertyId,
      },
      { property: true }
    );

    return res.status(201).json({
      success: true,
      data: unit,
    });
  }

  if (req.method === 'PATCH' || req.method === 'DELETE') {
    if (typeof unitId !== 'string') {
      return res.status(400).json({ error: 'Unit ID is required' });
    }

    // Verify unit belongs to property
    const unit = await unitService.getById(unitId);
    if (!unit || unit.propertyId !== propertyId) {
      return res.status(404).json({ error: 'Unit not found or does not belong to property' });
    }

    if (req.method === 'PATCH') {
      // Update unit
      const validated = unitUpdateSchema.parse(req.body);
      const updated = await unitService.update(unitId, validated, { property: true });

      return res.status(200).json({
        success: true,
        data: updated,
      });
    }

    if (req.method === 'DELETE') {
      // Delete unit (unitCount update handled by UnitService)
      await unitService.delete(unitId);

      return res.status(200).json({
        success: true,
        message: 'Unit deleted successfully',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler, { requireRole: ['landlord', 'pmc'], allowedMethods: ['GET', 'POST', 'PATCH', 'DELETE'] });
