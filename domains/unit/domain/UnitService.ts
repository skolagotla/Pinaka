/**
 * Unit Service
 * 
 * Domain logic for Unit domain
 * Business rules and orchestration
 */

import { UnitRepository } from './UnitRepository';
import { UnitCreate, UnitUpdate } from '@/lib/schemas';
import { PropertyRepository } from '@/domains/property/domain/PropertyRepository';

export class UnitService {
  constructor(
    private repository: UnitRepository,
    private propertyRepository: PropertyRepository
  ) {}

  /**
   * Create a new unit with business logic
   * Updates property unitCount automatically
   */
  async create(data: UnitCreate, include?: { property?: boolean }) {
    // Verify property exists
    const property = await this.propertyRepository.findById(data.propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    // Create unit
    const unit = await this.repository.create(data, include);

    // Update property unitCount
    await this.updatePropertyUnitCount(data.propertyId);

    return unit;
  }

  /**
   * Update a unit with business logic
   */
  async update(id: string, data: UnitUpdate, include?: { property?: boolean }) {
    // Verify unit exists
    const unit = await this.repository.findById(id);
    if (!unit) {
      throw new Error('Unit not found');
    }

    // Update unit
    return this.repository.update(id, data, include);
  }

  /**
   * Delete a unit with business logic
   * Updates property unitCount automatically
   */
  async delete(id: string) {
    // Get unit to get propertyId before deletion
    const unit = await this.repository.findById(id);
    if (!unit) {
      throw new Error('Unit not found');
    }

    const propertyId = unit.propertyId;

    // Delete unit
    await this.repository.delete(id);

    // Update property unitCount
    await this.updatePropertyUnitCount(propertyId);
  }

  /**
   * Get unit by ID
   */
  async getById(id: string, include?: { property?: boolean }) {
    return this.repository.findById(id, include);
  }

  /**
   * Get units by property ID
   */
  async getByPropertyId(propertyId: string, include?: { property?: boolean }) {
    return this.repository.findByPropertyId(propertyId, include);
  }

  /**
   * List units with filters
   */
  async list(where: any, include?: { property?: boolean }) {
    return this.repository.findMany(where, include);
  }

  /**
   * Update property unitCount based on actual unit count
   */
  private async updatePropertyUnitCount(propertyId: string) {
    const actualUnitCount = await this.repository.countByPropertyId(propertyId);
    await this.propertyRepository.update(propertyId, {
      unitCount: actualUnitCount,
    });
  }
}

