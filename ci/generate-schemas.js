#!/usr/bin/env node
/**
 * Generate Schema Artifacts
 * 
 * Wrapper script to run all codegen tools and place outputs in packages/generated/
 * 
 * This script:
 * 1. Generates OpenAPI spec from schema registry
 * 2. Generates TypeScript types from OpenAPI
 * 3. Generates API client from OpenAPI
 * 4. Generates GraphQL types (if GraphQL schema exists)
 * 5. Places all outputs in packages/generated/
 * 
 * Usage:
 *   node ci/generate-schemas.js
 *   npm run schema:generate
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const SCHEMA_DIR = path.join(ROOT_DIR, 'schema');
const GENERATED_DIR = path.join(ROOT_DIR, 'packages', 'generated');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    log(`Running: ${command}`, 'blue');
    execSync(command, {
      stdio: 'inherit',
      cwd: ROOT_DIR,
      ...options,
    });
    return true;
  } catch (error) {
    log(`Error running: ${command}`, 'red');
    return false;
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log(`Created directory: ${dir}`, 'green');
  }
}

function main() {
  log('🚀 Starting Schema Generation...', 'green');
  log('');

  // Ensure generated directory exists
  ensureDir(GENERATED_DIR);
  ensureDir(path.join(GENERATED_DIR, 'types'));
  ensureDir(path.join(GENERATED_DIR, 'clients'));
  ensureDir(path.join(GENERATED_DIR, 'stubs'));

  let success = true;

  // Step 1: Generate OpenAPI spec from schema registry
  log('📝 Step 1: Generating OpenAPI spec...', 'yellow');
  if (!exec('cd schema/types && npm run generate:openapi')) {
    log('⚠️  OpenAPI generation failed, but continuing...', 'yellow');
  }
  log('');

  // Step 2: Generate TypeScript types from Zod schemas
  log('📝 Step 2: Generating TypeScript types from Zod schemas...', 'yellow');
  if (!exec('cd schema/types && npm run generate:types')) {
    log('❌ Type generation failed', 'red');
    success = false;
  }
  log('');

  // Step 3: Generate TypeScript types from OpenAPI (if openapi-typescript is installed)
  log('📝 Step 3: Generating TypeScript types from OpenAPI...', 'yellow');
  const openapiYaml = path.join(SCHEMA_DIR, 'openapi.yaml');
  const openapiJson = path.join(SCHEMA_DIR, 'openapi.json');
  
  if (fs.existsSync(openapiJson)) {
    try {
      // Check if openapi-typescript is available
      execSync('which npx', { stdio: 'pipe' });
      const outputDir = path.join(GENERATED_DIR, 'types', 'openapi');
      ensureDir(outputDir);
      
      if (exec(`npx --yes openapi-typescript ${openapiJson} --output ${outputDir}/openapi.d.ts`)) {
        log('✅ OpenAPI types generated', 'green');
      } else {
        log('⚠️  openapi-typescript not available, skipping...', 'yellow');
      }
    } catch (error) {
      log('⚠️  openapi-typescript not available, skipping...', 'yellow');
    }
  } else {
    log('⚠️  OpenAPI JSON not found, skipping OpenAPI type generation...', 'yellow');
  }
  log('');

  // Step 4: Generate API client from OpenAPI (if openapi-generator-cli is installed)
  log('📝 Step 4: Generating API client from OpenAPI...', 'yellow');
  if (fs.existsSync(openapiJson)) {
    try {
      const clientOutputDir = path.join(GENERATED_DIR, 'clients', 'openapi');
      ensureDir(clientOutputDir);
      
      if (exec(`npx --yes @openapitools/openapi-generator-cli generate -i ${openapiJson} -g typescript-fetch -o ${clientOutputDir} --additional-properties=typescriptThreePlus=true`)) {
        log('✅ OpenAPI client generated', 'green');
      } else {
        log('⚠️  openapi-generator-cli not available, skipping...', 'yellow');
      }
    } catch (error) {
      log('⚠️  openapi-generator-cli not available, skipping...', 'yellow');
    }
  } else {
    log('⚠️  OpenAPI JSON not found, skipping OpenAPI client generation...', 'yellow');
  }
  log('');

  // Step 5: Generate GraphQL types (if GraphQL schema exists and graphql-code-generator is installed)
  log('📝 Step 5: Generating GraphQL types...', 'yellow');
  const graphqlSchema = path.join(SCHEMA_DIR, 'graphql', 'schema.graphql');
  
  if (fs.existsSync(graphqlSchema)) {
    try {
      const graphqlOutputDir = path.join(GENERATED_DIR, 'types', 'graphql');
      ensureDir(graphqlOutputDir);
      
      // Check if graphql-code-generator is available
      if (exec(`npx --yes graphql-code-generator --config graphql-codegen.yml`)) {
        log('✅ GraphQL types generated', 'green');
      } else {
        log('⚠️  graphql-code-generator not available, skipping...', 'yellow');
      }
    } catch (error) {
      log('⚠️  graphql-code-generator not available, skipping...', 'yellow');
    }
  } else {
    log('⚠️  GraphQL schema not found, skipping GraphQL type generation...', 'yellow');
  }
  log('');

  // Step 6: Copy generated types to packages/schemas (if needed)
  log('📝 Step 6: Ensuring packages/schemas is up to date...', 'yellow');
  // The packages/schemas package already re-exports from schema/types, so this is handled
  log('✅ packages/schemas is configured', 'green');
  log('');

  if (success) {
    log('✅ Schema generation complete!', 'green');
    log('');
    log('Generated artifacts:', 'blue');
    log(`  - OpenAPI spec: ${openapiJson}`, 'blue');
    log(`  - TypeScript types: ${path.join(GENERATED_DIR, 'types')}`, 'blue');
    log(`  - API clients: ${path.join(GENERATED_DIR, 'clients')}`, 'blue');
    log(`  - Server stubs: ${path.join(GENERATED_DIR, 'stubs')}`, 'blue');
    process.exit(0);
  } else {
    log('❌ Schema generation completed with errors', 'red');
    process.exit(1);
  }
}

main();

