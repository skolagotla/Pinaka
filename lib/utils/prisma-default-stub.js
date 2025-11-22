/**
 * Stub for Prisma's internal .prisma/client/default import
 * This file is used by webpack to replace the problematic import
 * that doesn't exist in the bundled environment.
 * 
 * Prisma's default.js tries to require('.prisma/client/default') which
 * creates a circular dependency. This stub breaks that cycle.
 */
// Export an empty object that matches what Prisma expects
module.exports = {
  PrismaClient: undefined,
  // Add any other exports that might be expected
};

