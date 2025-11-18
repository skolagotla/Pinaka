/**
 * Vendor/ServiceProvider Service
 * 
 * Domain logic for Vendor/ServiceProvider domain
 */

import { VendorRepository } from './VendorRepository';
import { ServiceProviderCreate, ServiceProviderUpdate, ServiceProviderQuery } from '@/lib/schemas';

export class VendorService {
  constructor(private repository: VendorRepository) {}

  async create(data: ServiceProviderCreate, context: { userId: string; userRole: string }) {
    // Generate providerId if not provided
    const { generateCUID } = require('@/lib/utils/id-generator');
    const providerId = generateCUID();

    // Create provider
    const provider = await this.repository.create({
      ...data,
      providerId,
    });

    return provider;
  }

  async update(id: string, data: ServiceProviderUpdate) {
    return this.repository.update(id, data);
  }

  async list(query: ServiceProviderQuery & { where?: any }) {
    return this.repository.findMany(query);
  }

  async getById(id: string) {
    return this.repository.findById(id);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }

  async softDelete(id: string) {
    return this.repository.softDelete(id);
  }

  /**
   * Get usage statistics for a vendor
   */
  async getUsageStats(vendorId: string) {
    // Verify vendor exists
    const vendor = await this.repository.findById(vendorId);
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    // Get statistics via repository
    const statistics = await this.repository.getUsageStats(vendorId);

    return {
      vendor: {
        id: vendor.id,
        name: vendor.name,
        type: vendor.type,
      },
      statistics,
    };
  }
}

