#!/usr/bin/env node
/**
 * Generate TypeScript types from FastAPI OpenAPI spec
 * 
 * This script fetches the OpenAPI spec from FastAPI and generates TypeScript types
 * using openapi-typescript. This is the V2 approach - types come from Pydantic schemas.
 * 
 * Usage:
 *   node scripts/generate-fastapi-types.js
 * 
 * Environment variables:
 *   FASTAPI_URL - FastAPI server URL (default: http://localhost:8000)
 *   OUTPUT_DIR - Output directory for generated types (default: packages/api-client/src/generated/fastapi)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { execSync } = require('child_process');

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';
const OUTPUT_DIR = path.join(__dirname, '../packages/api-client/src/generated/fastapi');

/**
 * Fetch OpenAPI spec from FastAPI server
 */
async function fetchOpenAPISpec() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${FASTAPI_URL}/openapi.json`);
    const client = url.protocol === 'https:' ? https : http;
    
    console.log(`📡 Fetching OpenAPI spec from ${FASTAPI_URL}/openapi.json...`);
    
    const req = client.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch OpenAPI spec: HTTP ${res.statusCode}`));
        return;
      }
      
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const spec = JSON.parse(data);
          console.log(`✅ Fetched OpenAPI spec (${Object.keys(spec.paths || {}).length} paths)`);
          resolve(spec);
        } catch (e) {
          reject(new Error(`Failed to parse OpenAPI spec: ${e.message}`));
        }
      });
    });
    
    req.on('error', (err) => {
      reject(new Error(`Failed to fetch OpenAPI spec: ${err.message}`));
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout - is FastAPI server running?'));
    });
  });
}

/**
 * Ensure directory exists
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
}

/**
 * Generate TypeScript types using openapi-typescript
 */
function generateTypes(openapiSpecPath) {
  const outputFile = path.join(OUTPUT_DIR, 'types.ts');
  
  try {
    console.log(`🔨 Generating TypeScript types from OpenAPI spec...`);
    
    // Check if openapi-typescript is available
    try {
      execSync('npx --yes openapi-typescript --version', { stdio: 'pipe' });
    } catch (e) {
      console.log(`⚠️  openapi-typescript not found, installing...`);
      execSync('npm install --save-dev openapi-typescript', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    }
    
    // Generate types
    execSync(
      `npx openapi-typescript "${openapiSpecPath}" -o "${outputFile}"`,
      { stdio: 'inherit' }
    );
    
    console.log(`✅ Generated TypeScript types: ${outputFile}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to generate types: ${error.message}`);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Ensure output directory exists
    ensureDir(OUTPUT_DIR);
    
    // Fetch OpenAPI spec
    const spec = await fetchOpenAPISpec();
    
    // Save OpenAPI spec
    const specPath = path.join(OUTPUT_DIR, 'openapi.json');
    fs.writeFileSync(
      specPath,
      JSON.stringify(spec, null, 2)
    );
    console.log(`💾 Saved OpenAPI spec: ${specPath}`);
    
    // Generate TypeScript types
    const success = generateTypes(specPath);
    
    if (success) {
      console.log('');
      console.log('✅ FastAPI type generation complete!');
      console.log(`📦 Types available at: packages/api-client/src/generated/fastapi/types.ts`);
      console.log('');
      console.log('💡 Usage in your code:');
      console.log('   import type { paths, components } from "@/lib/api/generated/fastapi/types";');
      console.log('');
    } else {
      console.error('❌ Type generation failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
    console.log('💡 Make sure FastAPI server is running:');
    console.log('   cd apps/backend-api');
    console.log('   source venv/bin/activate');
    console.log('   uvicorn main:app --reload --host 0.0.0.0 --port 8000');
    console.log('');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, fetchOpenAPISpec, generateTypes };

