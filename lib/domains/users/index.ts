/**
 * User Domain - Central Export
 * 
 * Provides singleton instance of UserService for use across the application
 */

import { PrismaClient } from '@prisma/client';
import { UserRepository } from '@/domains/users/domain/UserRepository';
import { UserService } from '@/domains/users/domain/UserService';

const { prisma } = require('@/lib/prisma') as { prisma: PrismaClient };

// Create singleton instances
const userRepository = new UserRepository(prisma);
export const userService = new UserService(userRepository);

// Re-export types and classes
export { UserRepository, UserService } from '@/domains/users/domain';
export type { UserStatus } from '@/domains/users/domain';

