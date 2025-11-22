import { GeneratedFormRepository } from './GeneratedFormRepository';
import { GeneratedFormService } from './GeneratedFormService';
import { prisma } from '@/lib/prisma';

const generatedFormRepository = new GeneratedFormRepository(prisma);
export const generatedFormService = new GeneratedFormService(generatedFormRepository);

