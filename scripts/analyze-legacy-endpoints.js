/**
 * Analyze Legacy API Endpoints
 * 
 * Identifies legacy endpoints that have v1 equivalents and can be safely removed
 */

const fs = require('fs');
const path = require('path');

const API_SERVER_DIR = path.join(__dirname, '../apps/api-server/pages/api');
const WEB_APP_DIR = path.join(__dirname, '../apps/web-app');

// Endpoints that have v1 equivalents and should be removed
const LEGACY_ENDPOINTS_WITH_V1 = [
  'properties',
  'tenants',
  'leases',
  'rent-payments',
  'maintenance',
  'documents',
  'expenses',
  'inspections',
  'vendors',
  'conversations',
  'applications',
  'notifications',
  'tasks',
  'invitations',
  'forms',
  'analytics',
  'units',
];

// Endpoints to keep (system/infrastructure)
const KEEP_ENDPOINTS = [
  'admin',
  'auth',
  'rbac',
  'verifications',
  'cron',
  'stripe',
  'webhooks',
  'health',
  'register',
  'settings',
  'organizations',
  'dashboard',
  'db-switcher',
  'reference-data',
  'search',
  'contractors',
  'landlords', // Legacy but still used
  'user',
  'files',
  'fill-pdf',
  'bank-reconciliation',
  'cache',
  'bulk',
  'bulk-operations',
  'evictions',
  'financial-reports',
  'financials',
  'inspection-checklists',
  'landlord',
  'late-fees',
  'lease-documents',
  'listings',
  'n4-forms',
  'owner-payouts',
  'owner-statements',
  'ownership-verification',
  'partial-payments',
  'relationships',
  'security-deposits',
  'support-tickets',
  'tenant-lease-documents',
  'tenant-rent-receipts',
  'vendor-ratings',
  'activity-logs',
  'approvals',
];

function findLegacyEndpoints() {
  const legacyEndpoints = [];
  
  if (!fs.existsSync(API_SERVER_DIR)) {
    console.error('API server directory not found:', API_SERVER_DIR);
    return legacyEndpoints;
  }

  const entries = fs.readdirSync(API_SERVER_DIR, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const endpointName = entry.name;
      
      // Skip v1, admin, and keep endpoints
      if (endpointName === 'v1' || KEEP_ENDPOINTS.includes(endpointName)) {
        continue;
      }
      
      // Check if it's a legacy endpoint with v1 equivalent
      if (LEGACY_ENDPOINTS_WITH_V1.includes(endpointName)) {
        const endpointPath = path.join(API_SERVER_DIR, endpointName);
        const files = getAllFiles(endpointPath);
        
        legacyEndpoints.push({
          name: endpointName,
          path: endpointPath,
          files: files,
          v1Equivalent: `/api/v1/${endpointName}`,
        });
      }
    }
  }
  
  return legacyEndpoints;
}

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else if (entry.isFile() && /\.(ts|js)$/.test(entry.name)) {
      fileList.push(fullPath);
    }
  }
  
  return fileList;
}

function findUsageInFrontend(endpointName) {
  const usage = [];
  const searchPattern = new RegExp(`/api/${endpointName.replace(/-/g, '[-_]')}`, 'g');
  
  if (!fs.existsSync(WEB_APP_DIR)) {
    return usage;
  }
  
  function searchDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      // Skip node_modules and .next
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name.startsWith('.')) {
        continue;
      }
      
      if (entry.isDirectory()) {
        searchDirectory(fullPath);
      } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const matches = content.match(searchPattern);
          
          if (matches) {
            const lines = content.split('\n');
            const lineNumbers = lines
              .map((line, index) => ({ line, number: index + 1 }))
              .filter(({ line }) => searchPattern.test(line))
              .map(({ number }) => number);
            
            usage.push({
              file: fullPath.replace(WEB_APP_DIR + '/', ''),
              matches: matches.length,
              lines: lineNumbers,
            });
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }
  }
  
  searchDirectory(WEB_APP_DIR);
  return usage;
}

function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 ANALYZING LEGACY API ENDPOINTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const legacyEndpoints = findLegacyEndpoints();
  
  console.log(`Found ${legacyEndpoints.length} legacy endpoints with v1 equivalents:\n`);
  
  const results = [];
  
  for (const endpoint of legacyEndpoints) {
    const usage = findUsageInFrontend(endpoint.name);
    
    const result = {
      endpoint: endpoint.name,
      v1Equivalent: endpoint.v1Equivalent,
      fileCount: endpoint.files.length,
      usageCount: usage.length,
      usageFiles: usage,
      canRemove: usage.length === 0,
    };
    
    results.push(result);
    
    console.log(`📁 ${endpoint.name}`);
    console.log(`   V1 Equivalent: ${endpoint.v1Equivalent}`);
    console.log(`   Files: ${endpoint.files.length}`);
    console.log(`   Usage: ${usage.length} file(s)`);
    
    if (usage.length > 0) {
      console.log(`   ⚠️  Still in use:`);
      usage.forEach(u => {
        console.log(`      - ${u.file} (${u.matches} match${u.matches > 1 ? 'es' : ''})`);
      });
    } else {
      console.log(`   ✅ Safe to remove`);
    }
    console.log('');
  }
  
  const safeToRemove = results.filter(r => r.canRemove);
  const needsMigration = results.filter(r => !r.canRemove);
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log(`✅ Safe to remove: ${safeToRemove.length} endpoint(s)`);
  safeToRemove.forEach(r => {
    console.log(`   - /api/${r.endpoint} → ${r.v1Equivalent}`);
  });
  
  console.log(`\n⚠️  Needs migration: ${needsMigration.length} endpoint(s)`);
  needsMigration.forEach(r => {
    console.log(`   - /api/${r.endpoint} → ${r.v1Equivalent}`);
    console.log(`     Used in ${r.usageCount} file(s)`);
  });
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Write results to file
  const outputFile = path.join(__dirname, '../docs/LEGACY_ENDPOINTS_ANALYSIS.json');
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log(`📄 Results saved to: ${outputFile}\n`);
  
  return results;
}

if (require.main === module) {
  main();
}

module.exports = { main, findLegacyEndpoints, findUsageInFrontend };

