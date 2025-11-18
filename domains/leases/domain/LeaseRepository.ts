/**
 * Lease Repository Interface
 * 
 * Domain layer interface - defines contract for data access
 * Implementation lives in infrastructure layer
 */

import { LeaseEntity } from './Lease';

export interface LeaseRepository {
  /**
   * Find lease by ID
   */
  findById(id: string): Promise<LeaseEntity | null>;

  /**
   * Find leases by property ID
   */
  findByPropertyId(propertyId: string): Promise<LeaseEntity[]>;

  /**
   * Find leases by tenant ID
   */
  findByTenantId(tenantId: string): Promise<LeaseEntity[]>;

  /**
   * Find active leases
   */
  findActive(): Promise<LeaseEntity[]>;

  /**
   * Create a new lease
   */
  create(data: Omit<LeaseEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeaseEntity>;

  /**
   * Update an existing lease
   */
  update(id: string, data: Partial<LeaseEntity>): Promise<LeaseEntity>;

  /**
   * Delete a lease
   */
  delete(id: string): Promise<void>;

  /**
   * Check if lease exists
   */
  exists(id: string): Promise<boolean>;
}

