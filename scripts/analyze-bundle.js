#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * 
 * Analyzes the application bundle and provides recommendations
 * Run with: node scripts/analyze-bundle.js
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Bundle Analysis Tool\n');
console.log('To analyze your bundle:');
console.log('1. Run: npm run build');
console.log('2. Run: ANALYZE=true npm run build');
console.log('3. Check .next/analyze/ for bundle reports\n');

console.log('🔍 Quick Analysis:\n');

// Check for large dependencies
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

const largePackages = [
  '@ant-design/pro-components',
  '@ant-design/pro-layout',
  '@ant-design/charts',
  'recharts',
  'react-pdf',
  'pdf-lib',
  'pdfkit',
  'sharp',
];

console.log('Large Dependencies:');
largePackages.forEach(pkg => {
  if (dependencies[pkg]) {
    console.log(`  ✓ ${pkg} - ${dependencies[pkg]}`);
  }
});

console.log('\n💡 Recommendations:');
console.log('  1. Use dynamic imports for heavy components');
console.log('  2. Enable tree-shaking with optimizePackageImports');
console.log('  3. Split large vendor chunks');
console.log('  4. Lazy load routes with next/dynamic');
console.log('  5. Use path aliases to reduce bundle size from long import paths\n');

console.log('📊 To view detailed bundle analysis:');
console.log('  npm run analyze\n');

