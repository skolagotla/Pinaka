/**
 * Landlord Service
 * 
 * Domain logic for Landlord domain
 */

import { LandlordRepository } from './LandlordRepository';
import { LandlordCreate, LandlordUpdate, LandlordQuery } from '@/lib/schemas';
import { generateLandlordHash } from '@/lib/hooks/useHashGenerator';
import { mapCountryRegionToFKs } from '@/lib/utils/country-region-mapper';

export class LandlordService {
  constructor(private repository: LandlordRepository) {}

  /**
   * Get a landlord by ID
   */
  async getById(id: string) {
    const landlord = await this.repository.findById(id, { properties: false, organization: false });
    if (!landlord) {
      throw new Error('Landlord not found');
    }
    return landlord;
  }

  /**
   * List landlords with pagination and filters
   */
  async list(query: LandlordQuery) {
    return this.repository.findMany(query, { properties: false });
  }

  /**
   * Create a new landlord with business logic
   */
  async create(data: LandlordCreate, context: { userId: string; organizationId?: string | null }) {
    // Check if landlord already exists
    const existingLandlord = await this.repository.findByEmail(data.email);
    if (existingLandlord) {
      throw new Error('Landlord with this email already exists');
    }

    // Map country/region to FKs if not provided
    const { countryCode, regionCode } = await mapCountryRegionToFKs(
      data.country,
      data.provinceState,
      data.countryCode,
      data.regionCode
    );

    // Generate landlord ID
    const landlordId = generateLandlordHash({
      email: data.email,
      phone: data.phone || '',
      country: data.country || '',
      provinceState: data.provinceState || '',
    });

    // Create landlord
    const landlord = await this.repository.create({
      ...data,
      landlordId,
      countryCode: countryCode || undefined,
      regionCode: regionCode || undefined,
      organizationId: context.organizationId || data.organizationId,
    });

    return landlord;
  }

  /**
   * Update a landlord with business logic
   */
  async update(id: string, data: LandlordUpdate) {
    // Check if landlord exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Landlord not found');
    }

    // Map country/region to FKs if provided
    let countryCode = data.countryCode;
    let regionCode = data.regionCode;
    if (data.country || data.provinceState || data.countryCode || data.regionCode) {
      const mapped = await mapCountryRegionToFKs(
        data.country,
        data.provinceState,
        data.countryCode,
        data.regionCode
      );
      countryCode = mapped.countryCode;
      regionCode = mapped.regionCode;
    }

    // Update landlord
    const landlord = await this.repository.update(id, {
      ...data,
      countryCode: countryCode || undefined,
      regionCode: regionCode || undefined,
    });

    return landlord;
  }

  /**
   * Delete a landlord (soft delete)
   */
  async delete(id: string) {
    // Check if landlord exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Landlord not found');
    }

    // Soft delete by setting approvalStatus to REJECTED
    return this.repository.delete(id);
  }

  /**
   * Add vendor to landlord's vendor list
   */
  async addVendor(landlordId: string, vendorId: string) {
    // Verify landlord exists
    const landlord = await this.repository.findById(landlordId);
    if (!landlord) {
      throw new Error('Landlord not found');
    }

    // Verify vendor exists (import vendor service to check)
    const { VendorRepository } = require('@/domains/vendor/domain/VendorRepository');
    const { prisma } = require('@/lib/prisma');
    const vendorRepository = new VendorRepository(prisma);
    const vendor = await vendorRepository.findById(vendorId);
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    // Add vendor relationship
    return this.repository.addVendor(landlordId, vendorId);
  }

  /**
   * Remove vendor from landlord's vendor list
   */
  async removeVendor(landlordId: string, vendorId: string) {
    // Verify landlord exists
    const landlord = await this.repository.findById(landlordId);
    if (!landlord) {
      throw new Error('Landlord not found');
    }

    // Remove vendor relationship
    const result = await this.repository.removeVendor(landlordId, vendorId);
    if (!result) {
      throw new Error('Vendor not found in landlord\'s list');
    }

    return result;
  }
}

