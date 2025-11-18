/**
 * Global Search API v1
 * GET /api/v1/search
 * 
 * Domain-Driven, API-First implementation
 * Uses domain services instead of direct Prisma access
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { searchQuerySchema } from '@/lib/schemas';
import { z } from 'zod';
import { propertyService } from '@/lib/domains/property';
import { tenantService } from '@/lib/domains/tenant';
import { maintenanceService } from '@/lib/domains/maintenance';
import { documentService } from '@/lib/domains/document';
import { LeaseService, LeaseRepository } from '@/lib/domains/lease';
const { prisma } = require('@/lib/prisma');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const query = searchQuerySchema.parse(req.query);
    const searchTerm = query.q;

    const results: any = {
      properties: [],
      tenants: [],
      leases: [],
      maintenance: [],
      documents: [],
    };

    // Search properties using domain service
    if (query.type === 'all' || query.type === 'properties') {
      const propertyQuery: any = {
        page: 1,
        limit: query.limit,
        search: searchTerm,
      };
      
      if (user.role === 'landlord') {
        propertyQuery.landlordId = user.userId;
      }

      const propertyResult = await propertyService.list(propertyQuery);
      results.properties = (propertyResult.properties || []).slice(0, query.limit).map((p: any) => ({
        id: p.id,
        propertyName: p.propertyName,
        addressLine1: p.addressLine1,
        city: p.city,
      }));
    }

    // Search tenants using domain service
    if (query.type === 'all' || query.type === 'tenants') {
      if (user.role === 'landlord' || user.role === 'pmc' || user.role === 'admin') {
        const tenantQuery: any = {
          page: 1,
          limit: query.limit,
          search: searchTerm,
        };

        if (user.role === 'landlord') {
          tenantQuery.landlordId = user.userId;
        }

        const tenantResult = await tenantService.list(tenantQuery);
        results.tenants = (tenantResult.tenants || []).slice(0, query.limit).map((t: any) => ({
          id: t.id,
          firstName: t.firstName,
          lastName: t.lastName,
          email: t.email,
        }));
      }
    }

    // Search leases using domain service
    if (query.type === 'all' || query.type === 'leases') {
      const leaseRepository = new LeaseRepository(prisma);
      const leaseService = new LeaseService(leaseRepository);
      
      const leaseQuery: any = {
        page: 1,
        limit: query.limit,
        search: searchTerm,
      };

      if (user.role === 'landlord') {
        // Filter by landlord's properties
        const propertyResult = await propertyService.list({ page: 1, limit: 1000, landlordId: user.userId });
        const propertyIds = (propertyResult.properties || []).map((p: any) => p.id);
        leaseQuery.propertyId = propertyIds.length > 0 ? propertyIds : ['none']; // Empty array means no results
      }

      const leaseResult = await leaseService.list(leaseQuery);
      results.leases = (leaseResult.leases || []).slice(0, query.limit).map((l: any) => ({
        id: l.id,
        leaseNumber: l.leaseNumber,
        unit: l.unit ? {
          unitName: l.unit.unitName,
          property: l.unit.property ? {
            propertyName: l.unit.property.propertyName,
          } : null,
        } : null,
      }));
    }

    // Search maintenance requests using domain service
    if (query.type === 'all' || query.type === 'maintenance') {
      const maintenanceQuery: any = {
        page: 1,
        limit: query.limit,
        search: searchTerm,
      };

      if (user.role === 'landlord') {
        // Get landlord's properties first
        const propertyResult = await propertyService.list({ page: 1, limit: 1000, landlordId: user.userId });
        const propertyIds = (propertyResult.properties || []).map((p: any) => p.id);
        maintenanceQuery.propertyId = propertyIds.length > 0 ? propertyIds : ['none'];
      } else if (user.role === 'tenant') {
        maintenanceQuery.tenantId = user.userId;
      }

      const maintenanceResult = await maintenanceService.list(maintenanceQuery);
      results.maintenance = (maintenanceResult.maintenanceRequests || []).slice(0, query.limit).map((m: any) => ({
        id: m.id,
        title: m.title,
        ticketNumber: m.ticketNumber,
        status: m.status,
      }));
    }

    // Search documents using domain service
    if (query.type === 'all' || query.type === 'documents') {
      const documentQuery: any = {
        page: 1,
        limit: query.limit,
        search: searchTerm,
      };

      if (user.role === 'tenant') {
        documentQuery.tenantId = user.userId;
      }

      const documentResult = await documentService.list(documentQuery);
      results.documents = (documentResult.documents || []).slice(0, query.limit).map((d: any) => ({
        id: d.id,
        fileName: d.fileName,
        originalName: d.originalName,
        category: d.category,
      }));
    }

    return res.status(200).json({
      success: true,
      data: results,
      query: query.q,
      type: query.type,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }
    console.error('[Search v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to perform search',
    });
  }
}, { requireRole: ['landlord', 'tenant', 'pmc', 'admin'], allowedMethods: ['GET'] });

