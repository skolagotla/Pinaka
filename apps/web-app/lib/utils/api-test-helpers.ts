/**
 * API Testing Helpers
 * 
 * Utilities for testing v1 API endpoints
 */

// v1Api removed - use v2Api from @/lib/api/v2-client';
import type { PropertyCreate, TenantCreate, LeaseCreate } from '@/lib/schemas';

/**
 * Test helper for creating test data
 */
export const testHelpers = {
  /**
   * Create a test property
   */
  async createTestProperty(landlordId: string, overrides: Partial<PropertyCreate> = {}) {
    const propertyData: PropertyCreate = {
      landlordId,
      addressLine1: '123 Test St',
      city: 'Toronto',
      postalZip: 'M5H 2N2',
      propertyType: 'Single Family',
      unitCount: 1,
      paymentFrequency: 'monthly',
      rented: 'No',
      ...overrides,
    };
    return await v1Api.properties.create(propertyData);
  },

  /**
   * Create a test tenant
   */
  async createTestTenant(landlordId: string, overrides: Partial<TenantCreate> = {}) {
    const tenantData: TenantCreate = {
      firstName: 'Test',
      lastName: 'Tenant',
      email: `test.tenant.${Date.now()}@example.com`,
      phone: '+14161234567',
      timezone: 'America/New_York',
      ...overrides,
    };
    return await v1Api.tenants.create(tenantData);
  },

  /**
   * Create a test lease
   */
  async createTestLease(unitId: string, tenantIds: string[], overrides: Partial<LeaseCreate> = {}) {
    const leaseData: LeaseCreate = {
      unitId,
      tenantIds,
      leaseStart: '2024-01-01',
      rentAmount: 2000,
      rentDueDay: 1,
      status: 'Active',
      ...(overrides.leaseEnd ? { leaseEnd: overrides.leaseEnd } : {}),
      ...overrides,
    };
    return await v1Api.leases.create(leaseData);
  },

  /**
   * Clean up test data
   */
  async cleanupTestData(ids: { propertyId?: string; tenantId?: string; leaseId?: string }) {
    const promises: Promise<any>[] = [];
    if (ids.leaseId) {
      promises.push(v1Api.leases.delete(ids.leaseId).catch(() => {}));
    }
    if (ids.tenantId) {
      promises.push(v1Api.tenants.delete(ids.tenantId).catch(() => {}));
    }
    if (ids.propertyId) {
      promises.push(v1Api.properties.delete(ids.propertyId).catch(() => {}));
    }
    await Promise.all(promises);
  },
};

/**
 * Assertion helpers for API responses
 */
export const apiAssertions = {
  /**
   * Assert response has success structure
   */
  assertSuccessResponse(response: any) {
    if (!response.success) {
      throw new Error(`Expected success response, got: ${JSON.stringify(response)}`);
    }
    if (!response.data) {
      throw new Error(`Expected data in response, got: ${JSON.stringify(response)}`);
    }
    return true;
  },

  /**
   * Assert response has pagination
   */
  assertPagination(response: any) {
    if (!response.data.pagination) {
      throw new Error(`Expected pagination in response, got: ${JSON.stringify(response)}`);
    }
    const { page, limit, total, totalPages } = response.data.pagination;
    if (typeof page !== 'number' || typeof limit !== 'number' || typeof total !== 'number') {
      throw new Error(`Invalid pagination structure: ${JSON.stringify(response.data.pagination)}`);
    }
    return true;
  },

  /**
   * Assert response has deprecation headers
   */
  assertDeprecationHeaders(headers: Headers) {
    const deprecated = headers.get('X-API-Deprecated');
    if (deprecated !== 'true') {
      throw new Error('Expected deprecation header');
    }
    return true;
  },
};

/**
 * Mock user context for testing
 */
export const mockUserContext = {
  landlord: {
    userId: 'test-landlord-id',
    role: 'landlord' as const,
    email: 'landlord@test.com',
    organizationId: null,
  },
  pmc: {
    userId: 'test-pmc-id',
    role: 'pmc' as const,
    email: 'pmc@test.com',
    organizationId: null,
  },
  tenant: {
    userId: 'test-tenant-id',
    role: 'tenant' as const,
    email: 'tenant@test.com',
    organizationId: null,
  },
};

