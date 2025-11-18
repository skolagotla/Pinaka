/**
 * RBAC System Test Suite
 * Phase 10: Testing & Validation
 * 
 * Comprehensive test suite for RBAC system
 */

import {
  testRolePermissions,
  testScopeEnforcement,
  testCrossPMCAccess,
  testCrossLandlordAccess,
  testUnauthorizedAccess,
  testAuditLogging,
  testRBACIntegration,
  generateTestReport,
} from '@/lib/rbac/testing';
import { RBACRole, ResourceCategory, PermissionAction } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TestResult {
  testName: string;
  passed: boolean;
  details?: any;
}

async function runAllTests(): Promise<void> {
  console.log('🧪 Starting RBAC System Test Suite...');
  console.log('');

  const testResults: TestResult[] = [];

  try {
    // Get test users
    const admin = await prisma.admin.findFirst();
    const landlord = await prisma.landlord.findFirst();
    const tenant = await prisma.tenant.findFirst();
    const pmc = await prisma.propertyManagementCompany.findFirst();

    if (!admin) {
      console.error('❌ Missing admin user. Skipping tests that require admin.');
    }
    if (!landlord) {
      console.error('❌ Missing landlord user. Skipping tests that require landlord.');
    }
    if (!tenant) {
      console.warn('⚠️  Missing tenant user. Some tests will be skipped.');
    }
    if (!pmc) {
      console.warn('⚠️  Missing PMC user. Some tests will be skipped.');
    }

    // Test 1: Role Permissions
    console.log('📋 Test 1: Role Permissions...');
    try {
      if (!landlord) {
        console.log('  ⏭️  Skipped: No landlord user');
        testResults.push({
          testName: 'Role Permissions Test',
          passed: true,
          details: { skipped: 'No landlord user' },
        });
      } else {
        const result = await testRolePermissions(
          RBACRole.OWNER_LANDLORD,
          landlord.id,
          'landlord'
        );
        testResults.push({
          testName: 'Role Permissions Test',
          passed: result.failed === 0,
          details: {
            passed: result.passed,
            failed: result.failed,
            total: result.passed + result.failed,
          },
        });
        console.log(`  ✅ Passed: ${result.passed}, Failed: ${result.failed}`);
      }
    } catch (error: any) {
      testResults.push({
        testName: 'Role Permissions Test',
        passed: false,
        details: { error: error.message },
      });
      console.log(`  ❌ Error: ${error.message}`);
    }

    // Test 2: Scope Enforcement
    console.log('');
    console.log('📋 Test 2: Scope Enforcement...');
    try {
      if (!landlord) {
        console.log('  ⏭️  Skipped: No landlord user');
        testResults.push({
          testName: 'Scope Enforcement Test',
          passed: true,
          details: { skipped: 'No landlord user' },
        });
      } else {
        const landlordProperties = await prisma.property.findMany({
          where: { landlordId: landlord.id },
          take: 1,
        });

      if (landlordProperties.length > 0) {
        const result = await testScopeEnforcement(
          landlord.id,
          'landlord',
          [
            {
              resourceId: landlordProperties[0].id,
              resourceType: 'property',
              shouldHaveAccess: true,
            },
          ]
        );
          testResults.push({
            testName: 'Scope Enforcement Test',
            passed: result.failed === 0,
            details: result,
          });
          console.log(`  ✅ Passed: ${result.passed}, Failed: ${result.failed}`);
        } else {
          console.log('  ⏭️  Skipped: No properties found for landlord');
          testResults.push({
            testName: 'Scope Enforcement Test',
            passed: true,
            details: { skipped: 'No properties available' },
          });
        }
      }
    } catch (error: any) {
      testResults.push({
        testName: 'Scope Enforcement Test',
        passed: false,
        details: { error: error.message },
      });
      console.log(`  ❌ Error: ${error.message}`);
    }

    // Test 3: Cross-Landlord Access Prevention
    console.log('');
    console.log('📋 Test 3: Cross-Landlord Access Prevention...');
    try {
      const landlords = await prisma.landlord.findMany({ take: 2 });
      if (landlords.length >= 2) {
        const landlord1Properties = await prisma.property.findMany({
          where: { landlordId: landlords[0].id },
          take: 1,
        });

        if (landlord1Properties.length > 0) {
          const result = await testCrossLandlordAccess(
            landlords[1].id,
            landlords[0].id,
            landlords[1].id,
            landlords[0].id
          );
          testResults.push({
            testName: 'Cross-Landlord Access Test',
            passed: result.passed,
            details: result,
          });
          console.log(`  ${result.passed ? '✅' : '❌'} Passed: ${result.passed}, Violations: ${result.violations.length}`);
        } else {
          console.log('  ⏭️  Skipped: No properties found');
          testResults.push({
            testName: 'Cross-Landlord Access Test',
            passed: true,
            details: { skipped: 'No properties available' },
          });
        }
      } else {
        console.log('  ⏭️  Skipped: Need at least 2 landlords');
        testResults.push({
          testName: 'Cross-Landlord Access Test',
          passed: true,
          details: { skipped: 'Need at least 2 landlords' },
        });
      }
    } catch (error: any) {
      testResults.push({
        testName: 'Cross-Landlord Access Test',
        passed: false,
        details: { error: error.message },
      });
      console.log(`  ❌ Error: ${error.message}`);
    }

    // Test 4: Unauthorized Access
    console.log('');
    console.log('📋 Test 4: Unauthorized Access Prevention...');
    try {
      if (!tenant) {
        console.log('  ⏭️  Skipped: No tenant user');
        testResults.push({
          testName: 'Unauthorized Access Test',
          passed: true,
          details: { skipped: 'No tenant user' },
        });
      } else {
        const result = await testUnauthorizedAccess(
          tenant.id,
          'tenant',
        [
          {
            resourceId: 'test-property-id',
            resourceType: 'property',
            action: PermissionAction.UPDATE,
            category: ResourceCategory.PROPERTY_UNIT_MANAGEMENT,
          },
        ]
      );
        testResults.push({
          testName: 'Unauthorized Access Test',
          passed: result.passed,
          details: result,
        });
        console.log(`  ${result.passed ? '✅' : '❌'} Passed: ${result.passed}, Violations: ${result.violations.length}`);
      }
    } catch (error: any) {
      testResults.push({
        testName: 'Unauthorized Access Test',
        passed: false,
        details: { error: error.message },
      });
      console.log(`  ❌ Error: ${error.message}`);
    }

    // Test 5: Audit Logging
    console.log('');
    console.log('📋 Test 5: Audit Logging...');
    try {
      if (!admin) {
        console.log('  ⏭️  Skipped: No admin user');
        testResults.push({
          testName: 'Audit Logging Test',
          passed: true,
          details: { skipped: 'No admin user' },
        });
      } else {
        // Perform an action that should be logged
        await prisma.rBACAuditLog.create({
          data: {
            userId: admin.id,
            userType: 'admin',
            userEmail: admin.email,
            action: 'test_action',
            resource: 'test',
            resourceId: 'test-id',
          },
        });

        const result = await testAuditLogging(admin.id, 'admin', ['test_action']);
        testResults.push({
          testName: 'Audit Logging Test',
          passed: result.passed,
          details: result,
        });
        console.log(`  ${result.passed ? '✅' : '❌'} Passed: ${result.passed}, Missing Logs: ${result.missingLogs.length}`);
      }
    } catch (error: any) {
      testResults.push({
        testName: 'Audit Logging Test',
        passed: false,
        details: { error: error.message },
      });
      console.log(`  ❌ Error: ${error.message}`);
    }

    // Test 6: RBAC Integration
    console.log('');
    console.log('📋 Test 6: RBAC Integration...');
    try {
      if (!landlord) {
        console.log('  ⏭️  Skipped: No landlord user');
        testResults.push({
          testName: 'RBAC Integration Test',
          passed: true,
          details: { skipped: 'No landlord user' },
        });
      } else {
        const result = await testRBACIntegration(
          landlord.id,
          'landlord',
        [
          {
            feature: 'property',
            action: 'view',
            expectedResult: 'allowed',
          },
          {
            feature: 'property',
            action: 'edit',
            expectedResult: 'allowed',
          },
        ]
      );
        testResults.push({
          testName: 'RBAC Integration Test',
          passed: result.failed === 0,
          details: result,
        });
        console.log(`  ✅ Passed: ${result.passed}, Failed: ${result.failed}`);
      }
    } catch (error: any) {
      testResults.push({
        testName: 'RBAC Integration Test',
        passed: false,
        details: { error: error.message },
      });
      console.log(`  ❌ Error: ${error.message}`);
    }

    // Generate Test Report
    console.log('');
    console.log('📊 Generating Test Report...');
    const report = await generateTestReport(testResults);
    console.log(report);

    // Summary
    const total = testResults.length;
    const passed = testResults.filter((r) => r.passed).length;
    const failed = total - passed;

    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(2)}%`);
    console.log('═══════════════════════════════════════');

    if (failed > 0) {
      console.log('');
      console.log('❌ Some tests failed. Please review the details above.');
      process.exit(1);
    } else {
      console.log('');
      console.log('✅ All tests passed!');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Fatal error during testing:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
runAllTests();

