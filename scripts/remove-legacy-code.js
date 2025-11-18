#!/usr/bin/env node

/**
 * Legacy Code Removal Script
 * 
 * Removes all legacy code that doesn't comply with Domain-Driven, API-First, Shared-Schema architecture
 * 
 * Usage: node scripts/remove-legacy-code.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DRY_RUN = process.argv.includes('--dry-run');

// Legacy API endpoints to remove (have v1 equivalents)
const LEGACY_ENDPOINTS = [
  'pages/api/properties',
  'pages/api/tenants',
  'pages/api/leases',
  'pages/api/rent-payments',
  'pages/api/maintenance',
  'pages/api/documents',
  'pages/api/expenses',
  'pages/api/inspections',
  'pages/api/vendors',
  'pages/api/conversations',
  'pages/api/applications',
  'pages/api/notifications',
  'pages/api/tasks',
  'pages/api/invitations',
  'pages/api/analytics',
  'pages/api/forms',
  'pages/api/units',
  'pages/api/landlord/signature.ts',
  'pages/api/tenant-rent-data.ts',
  'pages/api/activity-logs',
  'pages/api/approvals',
  'pages/api/bulk-operations',
  'pages/api/bulk',
  'pages/api/contractors',
  'pages/api/evictions',
  'pages/api/financial-reports',
  'pages/api/financials',
  'pages/api/inspection-checklists',
  'pages/api/inspections',
  'pages/api/lease-documents',
  'pages/api/listings',
  'pages/api/n4-forms',
  'pages/api/owner-payouts',
  'pages/api/owner-statements',
  'pages/api/ownership-verification',
  'pages/api/payments',
  'pages/api/partial-payments',
  'pages/api/relationships',
  'pages/api/search',
  'pages/api/security-deposits',
  'pages/api/support-tickets',
  'pages/api/tenant-lease-documents',
  'pages/api/tenant-rent-receipts',
  'pages/api/vendor-ratings',
  'pages/api/verifications',
];

// Legacy hooks to remove
const LEGACY_HOOKS = [
  'lib/hooks/useApiErrorHandler.js',
  'lib/hooks/useApiClient.js',
  'lib/hooks/useApiCall.js',
];

// Keep these (system/infrastructure endpoints)
const KEEP_ENDPOINTS = [
  'pages/api/admin',
  'pages/api/auth',
  'pages/api/cron',
  'pages/api/stripe',
  'pages/api/webhooks',
  'pages/api/health',
  'pages/api/register.ts',
  'pages/api/settings.ts',
  'pages/api/rbac',
  'pages/api/organizations',
  'pages/api/v1', // Keep all v1 endpoints
];

function shouldKeep(filePath) {
  return KEEP_ENDPOINTS.some(keep => filePath.includes(keep));
}

function isLegacyEndpoint(filePath) {
  if (shouldKeep(filePath)) return false;
  return LEGACY_ENDPOINTS.some(legacy => filePath.includes(legacy));
}

function removeFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    if (DRY_RUN) {
      console.log(`[DRY RUN] Would remove: ${filePath}`);
    } else {
      console.log(`Removing: ${filePath}`);
      fs.unlinkSync(fullPath);
    }
    return true;
  }
  return false;
}

function removeDirectory(dirPath) {
  const fullPath = path.join(process.cwd(), dirPath);
  if (fs.existsSync(fullPath)) {
    if (DRY_RUN) {
      console.log(`[DRY RUN] Would remove directory: ${dirPath}`);
    } else {
      console.log(`Removing directory: ${dirPath}`);
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
    return true;
  }
  return false;
}

function findLegacyEndpoints() {
  const endpoints = [];
  const apiDir = path.join(process.cwd(), 'pages/api');
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const relativePath = path.relative(path.join(process.cwd(), 'pages/api'), filePath);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith('.ts') && isLegacyEndpoint(filePath)) {
        endpoints.push(`pages/api/${relativePath}`);
      }
    }
  }
  
  walkDir(apiDir);
  return endpoints;
}

function main() {
  console.log('🔍 Legacy Code Removal Script');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log('');
  
  // Find legacy endpoints
  console.log('Finding legacy API endpoints...');
  const legacyEndpoints = findLegacyEndpoints();
  console.log(`Found ${legacyEndpoints.length} legacy endpoints`);
  console.log('');
  
  // Remove legacy endpoints
  console.log('Removing legacy API endpoints...');
  let removed = 0;
  for (const endpoint of legacyEndpoints) {
    if (removeFile(endpoint)) {
      removed++;
    }
  }
  console.log(`Removed ${removed} endpoints`);
  console.log('');
  
  // Remove legacy hooks
  console.log('Removing legacy hooks...');
  for (const hook of LEGACY_HOOKS) {
    removeFile(hook);
  }
  console.log('');
  
  // Update hooks index
  console.log('Updating hooks index...');
  const hooksIndex = path.join(process.cwd(), 'lib/hooks/index.js');
  if (fs.existsSync(hooksIndex)) {
    let content = fs.readFileSync(hooksIndex, 'utf8');
    content = content.replace(/export \{ useApiCall \} from '\.\/useApiCall';\n/g, '');
    content = content.replace(/export \{ useApiClient \} from '\.\/useApiClient';\n/g, '');
    content = content.replace(/export \{ useApiErrorHandler \} from '\.\/useApiErrorHandler';\n/g, '');
    
    if (!DRY_RUN) {
      fs.writeFileSync(hooksIndex, content);
      console.log('Updated hooks index');
    } else {
      console.log('[DRY RUN] Would update hooks index');
    }
  }
  console.log('');
  
  console.log('✅ Legacy code removal complete!');
  console.log('');
  console.log('⚠️  Next steps:');
  console.log('  1. Update components to use v1Api instead of legacy hooks');
  console.log('  2. Remove unused imports');
  console.log('  3. Run tests to verify');
}

if (require.main === module) {
  main();
}

module.exports = { main, findLegacyEndpoints, isLegacyEndpoint };

