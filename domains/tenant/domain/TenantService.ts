/**
 * Tenant Service
 * 
 * Domain logic for Tenant domain
 */

import { TenantRepository } from './TenantRepository';
import { TenantCreate, TenantUpdate, TenantQuery } from '@/lib/schemas';
import { generateTenantHash } from '@/lib/hooks/useHashGenerator';
import { mapCountryRegionToFKs } from '@/lib/utils/country-region-mapper';
import { createDateAtLocalMidnight } from '@/lib/utils/unified-date-formatter';

export class TenantService {
  constructor(private repository: TenantRepository) {}

  /**
   * Create a new tenant with business logic
   */
  async create(data: TenantCreate, context: { userId: string; invitedBy?: string }) {
    // Check if tenant already exists
    const existingTenant = await this.repository.findByEmail(data.email);
    if (existingTenant) {
      throw new Error('Tenant with this email already exists');
    }

    // Map country/region to FKs if not provided
    const { countryCode, regionCode } = await mapCountryRegionToFKs(
      data.country,
      data.provinceState,
      data.countryCode,
      data.regionCode
    );

    // Generate tenant ID
    const tenantId = generateTenantHash({
      email: data.email,
      phone: data.phone || '',
      country: data.country || '',
      provinceState: data.provinceState || '',
    });

    // Parse dates if provided
    let parsedDateOfBirth: Date | null = null;
    if (data.dateOfBirth) {
      parsedDateOfBirth = createDateAtLocalMidnight(data.dateOfBirth);
    }

    let parsedMoveInDate: Date | null = null;
    if (data.moveInDate) {
      parsedMoveInDate = createDateAtLocalMidnight(data.moveInDate);
    }

    // Prepare emergency contacts data
    // Map from schema format (name, phone, relationship) to repository format (name, phone, email?, isPrimary?)
    const emergencyContacts: Array<{
      name: string;
      phone: string;
      email?: string;
      isPrimary?: boolean;
    }> = [];
    if (data.emergencyContacts && Array.isArray(data.emergencyContacts)) {
      for (const contact of data.emergencyContacts) {
        const contactName = contact.name || '';
        const phone = contact.phone || '';
        if (contactName.trim() && phone.trim()) {
          emergencyContacts.push({
            name: contactName.trim(),
            phone: phone.trim(),
            email: (contact as any).email?.trim(),
            isPrimary: (contact as any).isPrimary === true || (contact as any).isPrimary === 'true' || false,
          });
        }
      }
    }

    // Prepare employers data
    // Map from schema format (companyName, position, monthlyIncome, address) to repository format (name, address?, income?, isCurrent?)
    const employers: Array<{
      name: string;
      address?: string;
      income?: number;
      isCurrent?: boolean;
    }> = [];
    if (data.employers && Array.isArray(data.employers)) {
      for (const employer of data.employers) {
        const employerName = employer.companyName || '';
        if (employerName.trim()) {
          employers.push({
            name: employerName.trim(),
            address: employer.address?.trim(),
            income: employer.monthlyIncome !== undefined ? employer.monthlyIncome : undefined,
            isCurrent: (employer as any).isCurrent !== undefined ? Boolean((employer as any).isCurrent) : true,
          });
        }
      }
    }

    // Create tenant with related entities using repository transaction method
    const tenant = await this.repository.createWithRelated(
      {
        ...data,
        tenantId,
        countryCode: countryCode || undefined,
        regionCode: regionCode || undefined,
        dateOfBirth: parsedDateOfBirth ? parsedDateOfBirth.toISOString().split('T')[0] : undefined,
        moveInDate: parsedMoveInDate ? parsedMoveInDate.toISOString().split('T')[0] : undefined,
        invitedBy: context.invitedBy || context.userId,
      },
      {
        emergencyContacts,
        employers,
      }
    );

    return tenant;
  }

  /**
   * Update a tenant with business logic
   */
  async update(id: string, data: TenantUpdate) {
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

    // Parse dates if provided
    if (data.dateOfBirth) {
      const parsed = createDateAtLocalMidnight(data.dateOfBirth);
      data.dateOfBirth = parsed.toISOString().split('T')[0] as any;
    }

    if (data.moveInDate) {
      const parsed = createDateAtLocalMidnight(data.moveInDate);
      data.moveInDate = parsed.toISOString().split('T')[0] as any;
    }

    return this.repository.update(id, data);
  }

  /**
   * Get tenants with pagination
   */
  async list(query: TenantQuery & { where?: any }, include?: { leases?: boolean }) {
    return this.repository.findMany(query, include);
  }

  /**
   * Get tenant by ID
   */
  async getById(id: string, include?: { leases?: boolean; emergencyContacts?: boolean; employers?: boolean }) {
    return this.repository.findById(id, include);
  }

  /**
   * Get tenant by email
   */
  async getByEmail(email: string) {
    return this.repository.findByEmail(email);
  }

  /**
   * Delete a tenant
   */
  async delete(id: string) {
    return this.repository.delete(id);
  }
}

