/**
 * Generated Form Domain Re-export
 * Re-exports from domains/generated-form/domain
 */

export * from '@/domains/generated-form/domain';
export { GeneratedFormService } from '@/domains/generated-form/domain/GeneratedFormService';
export { GeneratedFormRepository } from '@/domains/generated-form/domain/GeneratedFormRepository';

// Re-export service instance
import { GeneratedFormService } from '@/domains/generated-form/domain/GeneratedFormService';
import { GeneratedFormRepository } from '@/domains/generated-form/domain/GeneratedFormRepository';
import { prisma } from '@/lib/prisma';

const generatedFormRepository = new GeneratedFormRepository(prisma);
export const generatedFormService = new GeneratedFormService(generatedFormRepository);

