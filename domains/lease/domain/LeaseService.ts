/**
 * Lease Service
 * 
 * Domain logic for Lease domain
 */

import { LeaseRepository } from './LeaseRepository';
import { LeaseCreate, LeaseUpdate, LeaseQuery } from '@/lib/schemas';
import { createDateAtLocalMidnight } from '@/lib/utils/unified-date-formatter';

export class LeaseService {
  constructor(private repository: LeaseRepository) {}

  /**
   * Create a new lease with business logic
   */
  async create(data: LeaseCreate, context: { userId: string }) {
    // Validate dates
    const leaseStart = createDateAtLocalMidnight(data.leaseStart);
    
    let leaseEnd: Date | null = null;
    if (data.leaseEnd) {
      leaseEnd = createDateAtLocalMidnight(data.leaseEnd);
      
      if (leaseEnd <= leaseStart) {
        throw new Error('Lease end date must be after start date');
      }
    }

    // Validate primary tenant
    const primaryTenantId = data.primaryTenantId || data.tenantIds[0];
    if (!data.tenantIds.includes(primaryTenantId)) {
      throw new Error('Primary tenant must be one of the tenant IDs');
    }

    // Create lease with tenant relationships
    const lease = await this.repository.create({
      ...data,
      leaseStart: leaseStart.toISOString().split('T')[0],
      leaseEnd: leaseEnd ? leaseEnd.toISOString().split('T')[0] : undefined,
      tenantIds: data.tenantIds,
      primaryTenantId,
    });

    return lease;
  }

  /**
   * Update a lease with business logic
   */
  async update(id: string, data: LeaseUpdate & { tenantIds?: string[]; primaryTenantId?: string }) {
    // Parse dates if provided
    if (data.leaseStart) {
      const parsed = createDateAtLocalMidnight(data.leaseStart);
      data.leaseStart = parsed.toISOString().split('T')[0] as any;
    }

    if (data.leaseEnd) {
      const parsed = createDateAtLocalMidnight(data.leaseEnd);
      data.leaseEnd = parsed.toISOString().split('T')[0] as any;
    }

    // Validate dates if both provided
    if (data.leaseStart && data.leaseEnd) {
      const start = new Date(data.leaseStart);
      const end = new Date(data.leaseEnd);
      if (end <= start) {
        throw new Error('Lease end date must be after start date');
      }
    }

    // Validate primary tenant if tenantIds provided
    if (data.tenantIds && data.tenantIds.length > 0) {
      const primaryTenantId = data.primaryTenantId || data.tenantIds[0];
      if (!data.tenantIds.includes(primaryTenantId)) {
        throw new Error('Primary tenant must be one of the tenant IDs');
      }
    }

    return this.repository.update(id, data);
  }

  /**
   * Get leases with pagination
   */
  async list(query: LeaseQuery & { where?: any }, include?: { tenants?: boolean; unit?: boolean }) {
    return this.repository.findMany(query, include);
  }

  /**
   * Get lease by ID
   */
  async getById(id: string, include?: { tenants?: boolean; unit?: boolean; property?: boolean }) {
    return this.repository.findById(id, include);
  }

  /**
   * Delete a lease
   */
  async delete(id: string) {
    return this.repository.delete(id);
  }
}

