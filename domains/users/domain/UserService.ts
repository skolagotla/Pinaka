/**
 * User Service
 * 
 * Domain logic for User domain
 * Handles cross-domain user operations
 */

import { UserRepository, UserStatus } from './UserRepository';

export class UserService {
  constructor(private repository: UserRepository) {}

  /**
   * Get user status by email
   * Returns user information across all user types (landlord, tenant, pmc)
   */
  async getUserStatusByEmail(email: string): Promise<UserStatus | null> {
    if (!email) {
      throw new Error('Email is required');
    }

    return this.repository.findUserStatusByEmail(email);
  }
}

