/**
 * Application Service
 * 
 * Domain logic for Application domain
 */

import { ApplicationRepository } from './ApplicationRepository';
import { UnitRepository } from '@/domains/unit/domain/UnitRepository';
import { ApplicationCreate, ApplicationUpdate, ApplicationQuery } from '@/lib/schemas';
import { createDateAtLocalMidnight } from '@/lib/utils/unified-date-formatter';

export class ApplicationService {
  constructor(
    private repository: ApplicationRepository,
    private unitRepository: UnitRepository
  ) {}

  async create(data: ApplicationCreate, context: { userId: string; userRole: string }) {
    // Get unit to find propertyId via repository (Domain-Driven Design)
    const unit = await this.unitRepository.findById(data.unitId, { property: true });

    if (!unit) {
      throw new Error('Unit not found');
    }

    // Calculate deadline (1 week from creation)
    const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Create application
    const application = await this.repository.create({
      ...data,
      propertyId: unit.propertyId,
      deadline,
    });

    return application;
  }

  async update(id: string, data: ApplicationUpdate) {
    // Parse dates if provided
    if (data.approvedAt) {
      const parsed = createDateAtLocalMidnight(data.approvedAt);
      data.approvedAt = parsed.toISOString().split('T')[0] as any;
    }

    if (data.rejectedAt) {
      const parsed = createDateAtLocalMidnight(data.rejectedAt);
      data.rejectedAt = parsed.toISOString().split('T')[0] as any;
    }

    return this.repository.update(id, data);
  }

  async list(query: ApplicationQuery & { where?: any }, include?: { unit?: boolean; property?: boolean; lease?: boolean }) {
    return this.repository.findMany(query, include);
  }

  async getById(id: string, include?: { unit?: boolean; property?: boolean; lease?: boolean }) {
    return this.repository.findById(id, include);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }

  /**
   * Check if application belongs to landlord
   */
  async belongsToLandlord(applicationId: string, landlordId: string): Promise<boolean> {
    return this.repository.belongsToLandlord(applicationId, landlordId);
  }
}

