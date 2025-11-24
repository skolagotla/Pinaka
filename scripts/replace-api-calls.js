#!/usr/bin/env node

/**
 * Script to help replace Next.js API calls with FastAPI v2 calls
 * 
 * This script identifies patterns and suggests replacements.
 * Manual review and testing required after replacements.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WEB_APP_DIR = path.join(__dirname, '../apps/web-app');

// Mapping of old API patterns to new v2 patterns
const REPLACEMENTS = [
  // Direct fetch calls
  {
    pattern: /fetch\(['"]\/api\/v1\/properties['"]\)/g,
    replacement: 'useProperties(organizationId)',
    note: 'Use useProperties hook from useV2Data'
  },
  {
    pattern: /fetch\(['"]\/api\/v1\/tenants['"]\)/g,
    replacement: 'useTenants(organizationId)',
    note: 'Use useTenants hook from useV2Data'
  },
  {
    pattern: /fetch\(['"]\/api\/v1\/landlords['"]\)/g,
    replacement: 'useLandlords(organizationId)',
    note: 'Use useLandlords hook from useV2Data'
  },
  {
    pattern: /fetch\(['"]\/api\/v1\/leases['"]\)/g,
    replacement: 'useLeases({ organization_id: organizationId })',
    note: 'Use useLeases hook from useV2Data'
  },
  {
    pattern: /fetch\(['"]\/api\/v1\/maintenance['"]\)/g,
    replacement: 'useWorkOrders({ organization_id: organizationId })',
    note: 'Use useWorkOrders hook from useV2Data'
  },
  {
    pattern: /fetch\(['"]\/api\/v1\/vendors['"]\)/g,
    replacement: 'useVendors(organizationId)',
    note: 'Use useVendors hook from useV2Data'
  },
  {
    pattern: /fetch\(['"]\/api\/v1\/notifications['"]\)/g,
    replacement: 'useNotifications()',
    note: 'Use useNotifications hook from useV2Data'
  },
  {
    pattern: /fetch\(['"]\/api\/v1\/search['"]\)/g,
    replacement: 'v2Api.search(query)',
    note: 'Use v2Api.search method'
  },
  
  // v1Api calls
  {
    pattern: /v1Api\.properties\./g,
    replacement: 'v2Api.',
    note: 'Replace v1Api.properties with v2Api'
  },
  {
    pattern: /v1Api\.tenants\./g,
    replacement: 'v2Api.',
    note: 'Replace v1Api.tenants with v2Api'
  },
  {
    pattern: /v1Api\.landlords\./g,
    replacement: 'v2Api.',
    note: 'Replace v1Api.landlords with v2Api'
  },
  {
    pattern: /v1Api\.leases\./g,
    replacement: 'v2Api.',
    note: 'Replace v1Api.leases with v2Api'
  },
  {
    pattern: /v1Api\.vendors\./g,
    replacement: 'v2Api.',
    note: 'Replace v1Api.vendors with v2Api'
  },
  {
    pattern: /v1Api\.notifications\./g,
    replacement: 'v2Api.',
    note: 'Replace v1Api.notifications with v2Api'
  },
];

function findFiles(dir, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  const files = [];
  
  function walkDir(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }
      
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  walkDir(dir);
  return files;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  for (const replacement of REPLACEMENTS) {
    const matches = content.match(replacement.pattern);
    if (matches) {
      issues.push({
        pattern: replacement.pattern.toString(),
        replacement: replacement.replacement,
        note: replacement.note,
        count: matches.length
      });
    }
  }
  
  return issues.length > 0 ? { file: path.relative(WEB_APP_DIR, filePath), issues } : null;
}

function main() {
  console.log('🔍 Analyzing files for API call replacements...\n');
  
  const files = findFiles(WEB_APP_DIR);
  const results = [];
  
  for (const file of files) {
    const analysis = analyzeFile(file);
    if (analysis) {
      results.push(analysis);
    }
  }
  
  console.log(`Found ${results.length} files needing updates:\n`);
  
  results.forEach((result, idx) => {
    console.log(`${idx + 1}. ${result.file}`);
    result.issues.forEach(issue => {
      console.log(`   - Pattern: ${issue.pattern}`);
      console.log(`     Replace with: ${issue.replacement}`);
      console.log(`     Note: ${issue.note}`);
      console.log(`     Found ${issue.count} occurrence(s)`);
    });
    console.log('');
  });
  
  console.log('\n💡 Next Steps:');
  console.log('1. Review each file manually');
  console.log('2. Replace API calls with v2 hooks or v2Api methods');
  console.log('3. Update imports to use useV2Data and v2Api');
  console.log('4. Test each component after replacement');
  console.log('5. Remove old API route files once all replacements are complete');
}

main();

