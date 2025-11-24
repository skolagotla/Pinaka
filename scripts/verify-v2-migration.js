#!/usr/bin/env node

/**
 * Verification script to check v2 migration status
 * 
 * Checks:
 * 1. Frontend components using v1 API
 * 2. Next.js API routes that can be removed
 * 3. FastAPI v2 endpoints availability
 */

const fs = require('fs');
const path = require('path');

const WEB_APP_DIR = path.join(__dirname, '../apps/web-app');
const API_SERVER_DIR = path.join(__dirname, '../apps/api-server/pages/api/v1');
const BACKEND_API_DIR = path.join(__dirname, '../apps/backend-api/routers');

// Patterns to check
const V1_API_PATTERNS = [
  /\/api\/v1\//g,
  /v1Api\./g,
  /from ['"]@\/lib\/api\/v1-client['"]/g,
  /import.*v1-client/g,
];

const MIGRATED_ROUTES = [
  'properties',
  'units',
  'landlords',
  'tenants',
  'leases',
  'maintenance',
  'vendors',
  'notifications',
  'search',
];

function findFiles(dir, extensions = ['.js', '.jsx', '.ts', '.tsx'], excludeDirs = ['node_modules', '.next', 'dist']) {
  const files = [];
  
  function walkDir(currentDir) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (excludeDirs.includes(entry.name)) continue;
        
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          walkDir(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (err) {
      // Skip directories we can't read
    }
  }
  
  walkDir(dir);
  return files;
}

function checkFileForV1Usage(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    for (const pattern of V1_API_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          pattern: pattern.toString(),
          count: matches.length,
        });
      }
    }
    
    return issues.length > 0 ? { file: path.relative(WEB_APP_DIR, filePath), issues } : null;
  } catch (err) {
    return null;
  }
}

function checkNextJsRoutes() {
  const routes = [];
  
  for (const route of MIGRATED_ROUTES) {
    const routePath = path.join(API_SERVER_DIR, route);
    if (fs.existsSync(routePath)) {
      routes.push(route);
    }
  }
  
  return routes;
}

function checkFastAPIRouters() {
  const routers = [];
  const routerFiles = fs.readdirSync(BACKEND_API_DIR).filter(f => f.endsWith('.py') && f !== '__init__.py');
  
  for (const file of routerFiles) {
    const routerName = file.replace('.py', '');
    routers.push(routerName);
  }
  
  return routers;
}

function main() {
  console.log('🔍 Verifying v2 Migration Status...\n');
  
  // Check frontend for v1 API usage
  console.log('1️⃣  Checking frontend for v1 API usage...');
  const frontendFiles = findFiles(WEB_APP_DIR);
  const v1Usage = [];
  
  for (const file of frontendFiles) {
    const result = checkFileForV1Usage(file);
    if (result) {
      v1Usage.push(result);
    }
  }
  
  if (v1Usage.length > 0) {
    console.log(`   ⚠️  Found ${v1Usage.length} files still using v1 API:\n`);
    v1Usage.slice(0, 20).forEach((item, idx) => {
      console.log(`   ${idx + 1}. ${item.file}`);
      item.issues.forEach(issue => {
        console.log(`      - ${issue.pattern}: ${issue.count} occurrence(s)`);
      });
    });
    if (v1Usage.length > 20) {
      console.log(`   ... and ${v1Usage.length - 20} more files`);
    }
  } else {
    console.log('   ✅ No v1 API usage found in frontend!');
  }
  
  console.log('');
  
  // Check Next.js routes
  console.log('2️⃣  Checking Next.js API routes...');
  const remainingRoutes = checkNextJsRoutes();
  
  if (remainingRoutes.length > 0) {
    console.log(`   ⚠️  Found ${remainingRoutes.length} migrated routes still in Next.js:\n`);
    remainingRoutes.forEach(route => {
      console.log(`   - /api/v1/${route}/`);
    });
    console.log('\n   💡 These can be removed after confirming frontend migration.');
  } else {
    console.log('   ✅ All migrated routes have been removed!');
  }
  
  console.log('');
  
  // Check FastAPI routers
  console.log('3️⃣  Checking FastAPI v2 routers...');
  const routers = checkFastAPIRouters();
  console.log(`   ✅ Found ${routers.length} FastAPI routers:\n`);
  routers.forEach(router => {
    console.log(`   - ${router}.py`);
  });
  
  console.log('');
  
  // Summary
  console.log('📊 Migration Summary:');
  console.log(`   - Frontend files using v1: ${v1Usage.length}`);
  console.log(`   - Next.js routes to remove: ${remainingRoutes.length}`);
  console.log(`   - FastAPI routers: ${routers.length}`);
  console.log('');
  
  if (v1Usage.length === 0 && remainingRoutes.length === 0) {
    console.log('🎉 Migration is complete! All v1 API usage has been removed.');
  } else {
    console.log('⚠️  Migration is in progress. Some components still need updating.');
  }
}

main();

