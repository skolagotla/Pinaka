#!/usr/bin/env node
/**
 * Check API Client Usage
 * 
 * Enforces that all public API calls use the generated client.
 * 
 * This script checks for direct fetch() calls to /api/v1/* endpoints
 * and reports violations.
 * 
 * Usage: node ci/check-api-client-usage.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const VIOLATION_PATTERN = /fetch\(['"`]\/api\/v1\//g;
const EXCLUDED_PATTERNS = [
  /node_modules/,
  /\.next/,
  /dist/,
  /packages\/generated/,
  /lib\/api\/v1-client\.generated\.ts/, // Generated client itself
  /lib\/utils\/api-client\.js/, // Infrastructure layer
  /lib\/hooks\/useUnifiedApi\.js/, // Infrastructure layer
];

// Legacy endpoints that are acceptable (not part of v1 API contract)
const LEGACY_ENDPOINTS = [
  '/api/auth/',
  '/api/landlords',
  '/api/verifications',
  '/api/contractors',
  '/api/admin/',
  '/api/maintenance/', // Legacy maintenance endpoint
  '/api/forms/', // Legacy forms endpoint
  '/api/invitations/', // Legacy invitations endpoint
  '/api/approvals',
];

// Specialized v1 endpoints that don't have generated client methods yet
// TODO: Add these to the generated client
const SPECIALIZED_V1_ENDPOINTS = [
  '/api/v1/public/invitations/', // Public invitation endpoints
  '/api/v1/user/status', // User status endpoint
  '/api/v1/rent-payments/', // Specialized rent payment actions (send-receipt, mark-unpaid)
  '/api/v1/tenants/invitations', // Tenant invitations (different from main invitations)
  '/api/v1/conversations/', // Conversation messages endpoint
  '/api/v1/notifications/read-all', // Bulk notification actions
  '/api/v1/maintenance/', // Specialized maintenance actions (comments, mark-viewed)
];

function shouldExclude(filePath) {
  return EXCLUDED_PATTERNS.some(pattern => pattern.test(filePath));
}

function isLegacyEndpoint(url) {
  return LEGACY_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

function isSpecializedV1Endpoint(url) {
  return SPECIALIZED_V1_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

function findViolations(dir, violations = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (shouldExclude(fullPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      findViolations(fullPath, violations);
    } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          const match = line.match(/fetch\(['"`]([^'"`]+)['"`]/);
          if (match) {
            const url = match[1];
            if (url.startsWith('/api/v1/') && !isLegacyEndpoint(url) && !isSpecializedV1Endpoint(url)) {
              violations.push({
                file: fullPath,
                line: index + 1,
                url: url,
                code: line.trim(),
              });
            }
          }
        });
      } catch (error) {
        // Skip files that can't be read
      }
    }
  }

  return violations;
}

function main() {
  console.log('🔍 Checking for direct fetch() calls to /api/v1/* endpoints...\n');

  const violations = findViolations(process.cwd());
  
  if (violations.length === 0) {
    console.log('✅ No violations found. All public API calls use the generated client.');
    console.log('\n⚠️  Note: Specialized endpoints are currently allowed but should be added to generated client.');
    console.log('   See SPECIALIZED_V1_ENDPOINTS in this script for the list.\n');
    process.exit(0);
  }

  console.log(`❌ Found ${violations.length} violation(s):\n`);
  
  violations.forEach((violation, index) => {
    console.log(`${index + 1}. ${violation.file}:${violation.line}`);
    console.log(`   URL: ${violation.url}`);
    console.log(`   Code: ${violation.code}`);
    console.log('');
  });

  console.log('\n💡 Fix: Use the generated client instead:');
  console.log('   import { v1Api } from \'@/lib/api/v1-client\';');
  console.log('   const response = await v1Api.{resource}.{method}(...);\n');

  process.exit(1);
}

main();

