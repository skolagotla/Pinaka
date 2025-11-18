/**
 * Comprehensive API Usage Analysis
 * 
 * Finds all API calls in the codebase and categorizes them
 */

const fs = require('fs');
const path = require('path');

const WEB_APP_DIR = path.join(__dirname, '../apps/web-app');
const API_SERVER_DIR = path.join(__dirname, '../apps/api-server/pages/api');

// Categories of endpoints
const V1_ENDPOINTS = /\/api\/v1\//;
const ADMIN_ENDPOINTS = /\/api\/(admin|rbac|verifications)\//;
const AUTH_ENDPOINTS = /\/api\/auth\//;
const INFRASTRUCTURE_ENDPOINTS = [
  '/api/cron/',
  '/api/stripe/',
  '/api/webhooks/',
  '/api/health/',
  '/api/register',
  '/api/settings',
];

// Legacy endpoints that might need migration
const LEGACY_BUSINESS_ENDPOINTS = [
  '/api/landlords',
  '/api/contractors',
  '/api/approvals',
  '/api/activity-logs',
  '/api/financials/',
  '/api/organizations/',
  '/api/db-switcher/',
  '/api/user/',
  '/api/search',
  '/api/reference-data',
];

function findApiCalls(dir, results = []) {
  if (!fs.existsSync(dir)) {
    return results;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip node_modules, .next, etc.
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name.startsWith('.')) {
      continue;
    }

    if (entry.isDirectory()) {
      findApiCalls(fullPath, results);
    } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          // Match fetch() calls
          const fetchMatch = line.match(/fetch\(['"`]([^'"`]+)['"`]/);
          if (fetchMatch) {
            const url = fetchMatch[1];
            if (url.startsWith('/api/')) {
              results.push({
                file: fullPath.replace(process.cwd() + '/', ''),
                line: index + 1,
                url: url,
                code: line.trim(),
                type: categorizeEndpoint(url),
              });
            }
          }

          // Match apiClient() calls
          const apiClientMatch = line.match(/apiClient\(['"`]([^'"`]+)['"`]/);
          if (apiClientMatch) {
            const url = apiClientMatch[1];
            if (url.startsWith('/api/')) {
              results.push({
                file: fullPath.replace(process.cwd() + '/', ''),
                line: index + 1,
                url: url,
                code: line.trim(),
                type: categorizeEndpoint(url),
                method: 'apiClient',
              });
            }
          }
        });
      } catch (error) {
        // Skip files that can't be read
      }
    }
  }

  return results;
}

function categorizeEndpoint(url) {
  if (V1_ENDPOINTS.test(url)) {
    return 'v1';
  }
  if (ADMIN_ENDPOINTS.test(url)) {
    return 'admin';
  }
  if (AUTH_ENDPOINTS.test(url)) {
    return 'auth';
  }
  if (INFRASTRUCTURE_ENDPOINTS.some(ep => url.includes(ep))) {
    return 'infrastructure';
  }
  if (LEGACY_BUSINESS_ENDPOINTS.some(ep => url.includes(ep))) {
    return 'legacy-business';
  }
  return 'other';
}

function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 COMPREHENSIVE API USAGE ANALYSIS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const allCalls = findApiCalls(WEB_APP_DIR);

  // Categorize results
  const categorized = {
    v1: [],
    admin: [],
    auth: [],
    infrastructure: [],
    'legacy-business': [],
    other: [],
  };

  allCalls.forEach(call => {
    categorized[call.type].push(call);
  });

  console.log('📊 SUMMARY\n');
  console.log(`Total API calls found: ${allCalls.length}`);
  console.log(`  ✅ v1 endpoints: ${categorized.v1.length}`);
  console.log(`  ✅ admin endpoints: ${categorized.admin.length}`);
  console.log(`  ✅ auth endpoints: ${categorized.auth.length}`);
  console.log(`  ✅ infrastructure: ${categorized.infrastructure.length}`);
  console.log(`  ⚠️  legacy-business: ${categorized['legacy-business'].length}`);
  console.log(`  ❌ other/unknown: ${categorized.other.length}\n`);

  if (categorized['legacy-business'].length > 0) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  LEGACY BUSINESS ENDPOINTS (Should migrate to v1Api or adminApi)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const grouped = {};
    categorized['legacy-business'].forEach(call => {
      const endpoint = call.url.split('?')[0];
      if (!grouped[endpoint]) {
        grouped[endpoint] = [];
      }
      grouped[endpoint].push(call);
    });

    Object.entries(grouped).sort((a, b) => b[1].length - a[1].length).forEach(([endpoint, calls]) => {
      console.log(`📁 ${endpoint} (${calls.length} usage${calls.length > 1 ? 's' : ''})`);
      calls.slice(0, 5).forEach(call => {
        console.log(`   - ${call.file}:${call.line}`);
      });
      if (calls.length > 5) {
        console.log(`   ... and ${calls.length - 5} more`);
      }
      console.log('');
    });
  }

  if (categorized.other.length > 0) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ UNKNOWN/OTHER ENDPOINTS (Need review)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const grouped = {};
    categorized.other.forEach(call => {
      const endpoint = call.url.split('?')[0];
      if (!grouped[endpoint]) {
        grouped[endpoint] = [];
      }
      grouped[endpoint].push(call);
    });

    Object.entries(grouped).sort((a, b) => b[1].length - a[1].length).forEach(([endpoint, calls]) => {
      console.log(`📁 ${endpoint} (${calls.length} usage${calls.length > 1 ? 's' : ''})`);
      calls.slice(0, 3).forEach(call => {
        console.log(`   - ${call.file}:${call.line}`);
      });
      if (calls.length > 3) {
        console.log(`   ... and ${calls.length - 3} more`);
      }
      console.log('');
    });
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Write detailed report
  const reportFile = path.join(__dirname, '../docs/API_USAGE_ANALYSIS.json');
  fs.writeFileSync(reportFile, JSON.stringify({
    summary: {
      total: allCalls.length,
      v1: categorized.v1.length,
      admin: categorized.admin.length,
      auth: categorized.auth.length,
      infrastructure: categorized.infrastructure.length,
      legacyBusiness: categorized['legacy-business'].length,
      other: categorized.other.length,
    },
    legacyBusiness: categorized['legacy-business'],
    other: categorized.other,
  }, null, 2));

  console.log(`📄 Detailed report saved to: ${reportFile}\n`);

  return {
    total: allCalls.length,
    legacyBusiness: categorized['legacy-business'].length,
    other: categorized.other.length,
  };
}

if (require.main === module) {
  main();
}

module.exports = { main, findApiCalls, categorizeEndpoint };

