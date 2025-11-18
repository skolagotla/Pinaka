/**
 * Landlord Repository
 * 
 * Data access layer for Landlord domain
 * Minimal implementation for cross-domain checks
 */

import { PrismaClient } from '@prisma/client';

export class LandlordRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find landlord by email
   */
  async findByEmail(email: string) {
    return this.prisma.landlord.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
  }

  /**
   * Find landlord by ID
   */
  async findById(id: string) {
    return this.prisma.landlord.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
  }
}

