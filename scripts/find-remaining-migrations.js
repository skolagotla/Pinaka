#!/usr/bin/env node

/**
 * Script to find remaining files that need v2 migration
 * 
 * Usage: node scripts/find-remaining-migrations.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WEB_APP_DIR = path.join(__dirname, '../apps/web-app');

// Patterns to search for
const PATTERNS = {
  oldApiRoutes: [
    /fetch\(['"]\/api\//g,
    /axios\.(get|post|put|patch|delete)\(['"]\/api\//g,
    /\/api\/v1\//g,
    /\/api\/admin\//g,
  ],
  prisma: [
    /@prisma\/client/g,
    /PrismaClient/g,
    /from.*prisma/g,
    /require\(['"]@\/lib\/prisma/g,
  ],
  v1Api: [
    /v1Api/g,
    /v1-client/g,
    /from.*v1-client/g,
  ],
};

function findFiles(dir, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  const files = [];
  
  function walkDir(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      // Skip node_modules, .next, etc.
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

function checkFile(filePath, patterns) {
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = {};
  
  for (const [category, patternList] of Object.entries(patterns)) {
    matches[category] = [];
    for (const pattern of patternList) {
      const found = content.match(pattern);
      if (found) {
        matches[category].push(pattern.toString());
      }
    }
  }
  
  const hasMatches = Object.values(matches).some(arr => arr.length > 0);
  return hasMatches ? matches : null;
}

function main() {
  console.log('🔍 Scanning for files needing v2 migration...\n');
  
  const files = findFiles(WEB_APP_DIR);
  const results = {
    oldApiRoutes: [],
    prisma: [],
    v1Api: [],
  };
  
  for (const file of files) {
    const matches = checkFile(file, PATTERNS);
    if (matches) {
      const relativePath = path.relative(WEB_APP_DIR, file);
      
      if (matches.oldApiRoutes?.length) {
        results.oldApiRoutes.push(relativePath);
      }
      if (matches.prisma?.length) {
        results.prisma.push(relativePath);
      }
      if (matches.v1Api?.length) {
        results.v1Api.push(relativePath);
      }
    }
  }
  
  // Print results
  console.log('📊 Migration Status:\n');
  
  console.log(`❌ Files using old API routes (${results.oldApiRoutes.length}):`);
  results.oldApiRoutes.slice(0, 20).forEach(file => {
    console.log(`   - ${file}`);
  });
  if (results.oldApiRoutes.length > 20) {
    console.log(`   ... and ${results.oldApiRoutes.length - 20} more`);
  }
  
  console.log(`\n❌ Files using Prisma (${results.prisma.length}):`);
  results.prisma.slice(0, 20).forEach(file => {
    console.log(`   - ${file}`);
  });
  if (results.prisma.length > 20) {
    console.log(`   ... and ${results.prisma.length - 20} more`);
  }
  
  console.log(`\n❌ Files using v1Api (${results.v1Api.length}):`);
  results.v1Api.slice(0, 20).forEach(file => {
    console.log(`   - ${file}`);
  });
  if (results.v1Api.length > 20) {
    console.log(`   ... and ${results.v1Api.length - 20} more`);
  }
  
  console.log('\n✅ Migration Checklist:');
  console.log(`   [${results.oldApiRoutes.length === 0 ? '✓' : ' '}] Replace all /api/ route calls`);
  console.log(`   [${results.prisma.length === 0 ? '✓' : ' '}] Remove all Prisma imports`);
  console.log(`   [${results.v1Api.length === 0 ? '✓' : ' '}] Replace all v1Api with v2Api`);
  
  // Write detailed report
  const reportPath = path.join(__dirname, '../MIGRATION_REMAINING_FILES.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
}

main();

