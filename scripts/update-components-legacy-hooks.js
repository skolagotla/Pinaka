#!/usr/bin/env node
/**
 * Update components to replace legacy hooks with useUnifiedApi or v1Api
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all components using legacy hooks
const components = execSync(
  "grep -r 'useApiErrorHandler\\|useApiClient\\|useApiCall' components/ --include='*.jsx' --include='*.js' -l",
  { encoding: 'utf8' }
).trim().split('\n').filter(Boolean);

console.log(`Found ${components.length} components using legacy hooks:`);
components.forEach(c => console.log(`  - ${c}`));

console.log('\n⚠️  These components need manual updates to use v1Api or useUnifiedApi');
