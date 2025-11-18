/**
 * Property Service
 * 
 * Domain logic for Property domain
 * Business rules and orchestration
 */

import { PropertyRepository } from './PropertyRepository';
import { PropertyCreate, PropertyUpdate, PropertyQuery } from '@/lib/schemas';
import { generatePropertyHash } from '@/lib/hooks/useHashGenerator';
import { createLocalDate } from '@/lib/utils/date-utils';
import { mapCountryRegionToFKs } from '@/lib/utils/country-region-mapper';

export class PropertyService {
  constructor(private repository: PropertyRepository) {}

  /**
   * Create a new property with business logic
   */
  async create(data: PropertyCreate, context: { userId: string; organizationId?: string | null }) {
    // Map country/region to FKs if not provided
    const { countryCode, regionCode } = await mapCountryRegionToFKs(
      data.country,
      data.provinceState,
      data.countryCode,
      data.regionCode
    );

    // Generate property ID
    const propertyId = generatePropertyHash({
      addressLine1: data.addressLine1,
      postalZip: data.postalZip,
      country: data.country || countryCode || '',
      provinceState: data.provinceState || regionCode || '',
    });

    // Parse mortgage start date if provided
    let parsedMortgageStartDate: Date | null = null;
    if (data.mortgageStartDate) {
      if (typeof data.mortgageStartDate === 'string' && data.mortgageStartDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const parts = data.mortgageStartDate.split('-').map(Number);
        if (parts.length === 3 && !parts.some(isNaN)) {
          const [year, month, day] = parts;
          parsedMortgageStartDate = createLocalDate(year, month, day);
        }
      } else {
        parsedMortgageStartDate = new Date(data.mortgageStartDate);
      }
    }

    // Create property
    const property = await this.repository.create({
      ...data,
      propertyId,
      countryCode: countryCode || undefined,
      regionCode: regionCode || undefined,
      mortgageStartDate: parsedMortgageStartDate ? parsedMortgageStartDate.toISOString().split('T')[0] : undefined,
      organizationId: context.organizationId,
    });

    return property;
  }

  /**
   * Update a property with business logic
   */
  async update(id: string, data: PropertyUpdate) {
    // Map country/region to FKs if provided
    if (data.country || data.provinceState || data.countryCode || data.regionCode) {
      const { countryCode, regionCode } = await mapCountryRegionToFKs(
        data.country,
        data.provinceState,
        data.countryCode,
        data.regionCode
      );

      if (countryCode) data.countryCode = countryCode;
      if (regionCode) data.regionCode = regionCode;
    }

    // Parse mortgage start date if provided
    if (data.mortgageStartDate) {
      if (typeof data.mortgageStartDate === 'string' && data.mortgageStartDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const parts = data.mortgageStartDate.split('-').map(Number);
        if (parts.length === 3 && !parts.some(isNaN)) {
          const [year, month, day] = parts;
          data.mortgageStartDate = createLocalDate(year, month, day).toISOString().split('T')[0] as any;
        }
      }
    }

    return this.repository.update(id, data);
  }

  /**
   * Get properties with pagination
   */
  async list(query: PropertyQuery & { where?: any }, include?: { landlord?: boolean; units?: boolean }) {
    return this.repository.findMany(query, include);
  }

  /**
   * Get property by ID
   */
  async getById(id: string, include?: { landlord?: boolean; units?: boolean }) {
    return this.repository.findById(id, include);
  }

  /**
   * Delete a property
   */
  async delete(id: string) {
    return this.repository.delete(id);
  }
}

