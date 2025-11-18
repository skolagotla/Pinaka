/**
 * Lease Application Service
 * 
 * Orchestrates domain logic - coordinates between domain and infrastructure
 * No business logic here, only orchestration
 */

import { Lease, LeaseEntity } from '../domain/Lease';
import { LeaseRepository as ILeaseRepository } from '../domain/LeaseRepository';

export class LeaseApplicationService {
  constructor(private repository: ILeaseRepository) {}

  /**
   * Get lease by ID
   */
  async getById(id: string): Promise<Lease | null> {
    const entity = await this.repository.findById(id);
    return entity ? new Lease(entity) : null;
  }

  /**
   * Get active leases for a property
   */
  async getActiveLeasesForProperty(propertyId: string): Promise<Lease[]> {
    const entities = await this.repository.findByPropertyId(propertyId);
    return entities
      .map(entity => new Lease(entity))
      .filter(lease => lease.isActive());
  }

  /**
   * Create a new lease
   */
  async createLease(data: Omit<LeaseEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lease> {
    // Domain validation
    if (data.endDate <= data.startDate) {
      throw new Error('End date must be after start date');
    }
    if (data.monthlyRent <= 0) {
      throw new Error('Monthly rent must be greater than zero');
    }

    const entity = await this.repository.create({
      ...data,
      status: 'active',
    });

    return new Lease(entity);
  }

  /**
   * Terminate a lease
   */
  async terminateLease(id: string, terminationDate: Date): Promise<Lease> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new Error('Lease not found');
    }

    const lease = new Lease(entity);
    lease.terminate(terminationDate);

    const updated = await this.repository.update(id, lease.toJSON());
    return new Lease(updated);
  }

  /**
   * Renew a lease
   */
  async renewLease(id: string, newEndDate: Date): Promise<Lease> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new Error('Lease not found');
    }

    const lease = new Lease(entity);
    lease.renew(newEndDate);

    const updated = await this.repository.update(id, lease.toJSON());
    return new Lease(updated);
  }
}

