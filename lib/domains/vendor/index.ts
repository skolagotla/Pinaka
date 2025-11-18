/**
 * Vendor Domain Re-export
 * Re-exports from domains/vendor/domain
 */

export * from '@/domains/vendor/domain';
export { VendorService } from '@/domains/vendor/domain/VendorService';
export { VendorRepository } from '@/domains/vendor/domain/VendorRepository';

// Re-export service instance
import { VendorService } from '@/domains/vendor/domain/VendorService';
import { VendorRepository } from '@/domains/vendor/domain/VendorRepository';
import { prisma } from '@/lib/prisma';

const vendorRepository = new VendorRepository(prisma);
export const vendorService = new VendorService(vendorRepository);

