/**
 * User Repository
 * 
 * Data access layer for User domain
 * Handles cross-domain user lookups (landlord, tenant, pmc)
 */

import { PrismaClient } from '@prisma/client';

export interface UserStatus {
  id: string;
  email: string;
  role: 'landlord' | 'tenant' | 'pmc';
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  approvalStatus: string;
  rejectedAt?: Date | null;
  rejectionReason?: string | null;
}

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find user status by email across all user types
   */
  async findUserStatusByEmail(email: string): Promise<UserStatus | null> {
    // Check all user types in parallel
    const [landlord, tenant, pmc] = await Promise.all([
      this.prisma.landlord.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          approvalStatus: true,
          rejectedAt: true,
          rejectionReason: true,
        },
      }),
      this.prisma.tenant.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          approvalStatus: true,
          rejectedAt: true,
          rejectionReason: true,
        },
      }),
      this.prisma.propertyManagementCompany.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          companyName: true,
          approvalStatus: true,
          rejectedAt: true,
          rejectionReason: true,
        },
      }),
    ]);

    if (landlord) {
      return {
        id: landlord.id,
        email: landlord.email,
        role: 'landlord',
        firstName: landlord.firstName,
        lastName: landlord.lastName,
        approvalStatus: landlord.approvalStatus || 'PENDING',
        rejectedAt: landlord.rejectedAt,
        rejectionReason: landlord.rejectionReason,
      };
    }

    if (tenant) {
      return {
        id: tenant.id,
        email: tenant.email,
        role: 'tenant',
        firstName: tenant.firstName,
        lastName: tenant.lastName,
        approvalStatus: tenant.approvalStatus || 'PENDING',
        rejectedAt: tenant.rejectedAt,
        rejectionReason: tenant.rejectionReason,
      };
    }

    if (pmc) {
      return {
        id: pmc.id,
        email: pmc.email,
        role: 'pmc',
        companyName: pmc.companyName,
        approvalStatus: pmc.approvalStatus || 'PENDING',
        rejectedAt: pmc.rejectedAt,
        rejectionReason: pmc.rejectionReason,
      };
    }

    return null;
  }
}

