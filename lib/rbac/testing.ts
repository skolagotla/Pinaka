/**
 * RBAC Testing & Validation Utilities
 * Phase 10: Testing & Validation
 * 
 * Utilities for testing RBAC system:
 * - Permission testing
 * - Security testing
 * - Integration testing helpers
 */

import { PrismaClient } from '@prisma/client';
import {
  hasPermission,
  canAccess,
  getUserScopes,
  checkMultipleRoles,
} from './index';
import { ResourceCategory, PermissionAction, RBACRole } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Test all permission combinations for a role
 * Phase 10.1: Permission Testing
 */
export async function testRolePermissions(
  roleName: RBACRole,
  userId: string,
  userType: string
): Promise<{
  passed: number;
  failed: number;
  results: Array<{
    resource: string;
    action: PermissionAction;
    category: ResourceCategory;
    passed: boolean;
    error?: string;
  }>;
}> {
  const results: any[] = [];
  let passed = 0;
  let failed = 0;

  // Get all permissions for this role
  const role = await prisma.role.findUnique({
    where: { name: roleName },
    include: {
      defaultPermissions: true,
    },
  });

  if (!role) {
    throw new Error(`Role ${roleName} not found`);
  }

  // Test each permission
  for (const permission of role.defaultPermissions) {
    try {
      const hasAccess = await hasPermission(
        userId,
        userType,
        permission.resource,
        permission.action,
        permission.category
      );

      const result: {
        resource: string;
        action: PermissionAction;
        category: ResourceCategory;
        passed: boolean;
        error?: string;
      } = {
        resource: permission.resource,
        action: permission.action,
        category: permission.category,
        passed: hasAccess,
      };

      results.push(result);

      if (hasAccess) {
        passed++;
      } else {
        failed++;
        result.error = 'Permission check returned false';
      }
    } catch (error: any) {
      failed++;
      results.push({
        resource: permission.resource,
        action: permission.action,
        category: permission.category,
        passed: false,
        error: error.message,
      });
    }
  }

  return { passed, failed, results };
}

/**
 * Test scope enforcement
 * Phase 10.1: Scope Testing
 */
export async function testScopeEnforcement(
  userId: string,
  userType: string,
  testResources: Array<{
    resourceId: string;
    resourceType: string;
    shouldHaveAccess: boolean;
  }>
): Promise<{
  passed: number;
  failed: number;
  results: Array<{
    resourceId: string;
    resourceType: string;
    expected: boolean;
    actual: boolean;
    passed: boolean;
  }>;
}> {
  const results: any[] = [];
  let passed = 0;
  let failed = 0;

  for (const test of testResources) {
    try {
      const hasAccess = await canAccess(
        userId,
        userType,
        test.resourceId,
        test.resourceType
      );

      const testPassed = hasAccess === test.shouldHaveAccess;

      results.push({
        resourceId: test.resourceId,
        resourceType: test.resourceType,
        expected: test.shouldHaveAccess,
        actual: hasAccess,
        passed: testPassed,
      });

      if (testPassed) {
        passed++;
      } else {
        failed++;
      }
    } catch (error: any) {
      failed++;
      results.push({
        resourceId: test.resourceId,
        resourceType: test.resourceType,
        expected: test.shouldHaveAccess,
        actual: false,
        passed: false,
        error: error.message,
      });
    }
  }

  return { passed, failed, results };
}

/**
 * Test cross-PMC access prevention
 * Phase 10.2: Security Testing
 */
export async function testCrossPMCAccess(
  pmcUserId1: string,
  pmcUserId2: string,
  pmcId1: string,
  pmcId2: string
): Promise<{
  passed: boolean;
  violations: Array<{
    userId: string;
    accessedPMCId: string;
    resource: string;
  }>;
}> {
  const violations: any[] = [];

  // Get all properties for PMC 2
  const pmc2Properties = await prisma.property.findMany({
    where: {
      // Assuming there's a way to link properties to PMCs
      // This is a placeholder - adjust based on your schema
    },
    select: { id: true },
  });

  // Test if PMC 1 user can access PMC 2 properties
  for (const property of pmc2Properties) {
    const hasAccess = await canAccess(
      pmcUserId1,
      'pmc',
      property.id,
      'property'
    );

    if (hasAccess) {
      violations.push({
        userId: pmcUserId1,
        accessedPMCId: pmcId2,
        resource: property.id,
      });
    }
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

/**
 * Test cross-landlord access prevention
 * Phase 10.2: Security Testing
 */
export async function testCrossLandlordAccess(
  landlordUserId1: string,
  landlordUserId2: string,
  landlordId1: string,
  landlordId2: string
): Promise<{
  passed: boolean;
  violations: Array<{
    userId: string;
    accessedLandlordId: string;
    resource: string;
  }>;
}> {
  const violations: any[] = [];

  // Get all properties for Landlord 2
  const landlord2Properties = await prisma.property.findMany({
    where: {
      landlordId: landlordId2,
    },
    select: { id: true },
  });

  // Test if Landlord 1 can access Landlord 2 properties
  for (const property of landlord2Properties) {
    const hasAccess = await canAccess(
      landlordUserId1,
      'landlord',
      property.id,
      'property'
    );

    if (hasAccess) {
      violations.push({
        userId: landlordUserId1,
        accessedLandlordId: landlordId2,
        resource: property.id,
      });
    }
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

/**
 * Test unauthorized access attempts
 * Phase 10.2: Security Testing
 */
export async function testUnauthorizedAccess(
  userId: string,
  userType: string,
  unauthorizedResources: Array<{
    resourceId: string;
    resourceType: string;
    action: PermissionAction;
    category: ResourceCategory;
  }>
): Promise<{
  passed: boolean;
  violations: Array<{
    resourceId: string;
    resourceType: string;
    action: PermissionAction;
    category: ResourceCategory;
  }>;
}> {
  const violations: any[] = [];

  for (const resource of unauthorizedResources) {
    const hasAccess = await hasPermission(
      userId,
      userType,
      resource.resourceType,
      resource.action,
      resource.category,
      {
        // Add scope if needed
      }
    );

    if (hasAccess) {
      violations.push(resource);
    }
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

/**
 * Test audit logging
 * Phase 10.2: Security Testing
 */
export async function testAuditLogging(
  userId: string,
  userType: string,
  testActions: string[]
): Promise<{
  passed: boolean;
  missingLogs: string[];
}> {
  const missingLogs: string[] = [];

  for (const action of testActions) {
    // Check if audit log exists for this action
    const log = await prisma.rBACAuditLog.findFirst({
      where: {
        userId,
        userType,
        action: {
          contains: action,
        },
        createdAt: {
          gte: new Date(Date.now() - 60000), // Last minute
        },
      },
    });

    if (!log) {
      missingLogs.push(action);
    }
  }

  return {
    passed: missingLogs.length === 0,
    missingLogs,
  };
}

/**
 * Integration test: Test RBAC with existing features
 * Phase 10.3: Integration Testing
 */
export async function testRBACIntegration(
  userId: string,
  userType: string,
  testScenarios: Array<{
    feature: string;
    action: string;
    expectedResult: 'allowed' | 'denied';
    resourceId?: string;
  }>
): Promise<{
  passed: number;
  failed: number;
  results: Array<{
    feature: string;
    action: string;
    expected: string;
    actual: string;
    passed: boolean;
  }>;
}> {
  const results: any[] = [];
  let passed = 0;
  let failed = 0;

  for (const scenario of testScenarios) {
    try {
      // Map feature to RBAC resource/category
      const rbacMapping = getRBACMapping(scenario.feature, scenario.action);

      let actualResult: 'allowed' | 'denied' = 'denied';

      if (scenario.resourceId) {
        const canAccessResource = await canAccess(
          userId,
          userType,
          scenario.resourceId,
          rbacMapping.resourceType
        );
        actualResult = canAccessResource ? 'allowed' : 'denied';
      } else {
        const hasPerm = await hasPermission(
          userId,
          userType,
          rbacMapping.resource,
          rbacMapping.action,
          rbacMapping.category
        );
        actualResult = hasPerm ? 'allowed' : 'denied';
      }

      const testPassed = actualResult === scenario.expectedResult;

      results.push({
        feature: scenario.feature,
        action: scenario.action,
        expected: scenario.expectedResult,
        actual: actualResult,
        passed: testPassed,
      });

      if (testPassed) {
        passed++;
      } else {
        failed++;
      }
    } catch (error: any) {
      failed++;
      results.push({
        feature: scenario.feature,
        action: scenario.action,
        expected: scenario.expectedResult,
        actual: 'error',
        passed: false,
        error: error.message,
      });
    }
  }

  return { passed, failed, results };
}

/**
 * Map feature/action to RBAC resource/category/action
 */
function getRBACMapping(
  feature: string,
  action: string
): {
  resource: string;
  resourceType: string;
  action: PermissionAction;
  category: ResourceCategory;
} {
  // This is a simplified mapping - expand based on your features
  const mappings: Record<string, any> = {
    property: {
      create: {
        resource: 'properties',
        resourceType: 'property',
        action: PermissionAction.CREATE,
        category: ResourceCategory.PROPERTY_UNIT_MANAGEMENT,
      },
      edit: {
        resource: 'properties',
        resourceType: 'property',
        action: PermissionAction.UPDATE,
        category: ResourceCategory.PROPERTY_UNIT_MANAGEMENT,
      },
      view: {
        resource: 'properties',
        resourceType: 'property',
        action: PermissionAction.READ,
        category: ResourceCategory.PROPERTY_UNIT_MANAGEMENT,
      },
    },
    tenant: {
      create: {
        resource: 'tenants',
        resourceType: 'tenant',
        action: PermissionAction.CREATE,
        category: ResourceCategory.TENANT_MANAGEMENT,
      },
      edit: {
        resource: 'tenants',
        resourceType: 'tenant',
        action: PermissionAction.UPDATE,
        category: ResourceCategory.TENANT_MANAGEMENT,
      },
    },
    lease: {
      create: {
        resource: 'leases',
        resourceType: 'lease',
        action: PermissionAction.CREATE,
        category: ResourceCategory.LEASING_APPLICATIONS,
      },
      approve: {
        resource: 'leases',
        resourceType: 'lease',
        action: PermissionAction.APPROVE,
        category: ResourceCategory.LEASING_APPLICATIONS,
      },
    },
  };

  return (
    mappings[feature]?.[action] || {
      resource: feature,
      resourceType: feature,
      action: PermissionAction.READ,
      category: ResourceCategory.SYSTEM_SETTINGS,
    }
  );
}

/**
 * Generate test report
 */
export async function generateTestReport(
  testResults: Array<{
    testName: string;
    passed: boolean;
    details?: any;
  }>
): Promise<string> {
  const total = testResults.length;
  const passed = testResults.filter((r) => r.passed).length;
  const failed = total - passed;

  let report = `# RBAC Test Report\n\n`;
  report += `**Date**: ${new Date().toISOString()}\n\n`;
  report += `**Summary**:\n`;
  report += `- Total Tests: ${total}\n`;
  report += `- Passed: ${passed}\n`;
  report += `- Failed: ${failed}\n`;
  report += `- Success Rate: ${((passed / total) * 100).toFixed(2)}%\n\n`;

  report += `## Test Results\n\n`;

  for (const result of testResults) {
    report += `### ${result.testName}\n`;
    report += `- Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
    if (result.details) {
      report += `- Details: ${JSON.stringify(result.details, null, 2)}\n`;
    }
    report += `\n`;
  }

  return report;
}

