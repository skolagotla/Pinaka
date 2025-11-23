/**
 * Generate TypeScript client from FastAPI OpenAPI spec
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';
const OUTPUT_DIR = path.join(__dirname, '../packages/api-client/src/generated/fastapi');

async function fetchOpenAPISpec() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${FASTAPI_URL}/openapi.json`);
    const client = url.protocol === 'https:' ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse OpenAPI spec: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

async function generateClient() {
  try {
    console.log(`Fetching OpenAPI spec from ${FASTAPI_URL}...`);
    const spec = await fetchOpenAPISpec();
    
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    // Save OpenAPI spec
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'openapi.json'),
      JSON.stringify(spec, null, 2)
    );
    
    console.log('✅ OpenAPI spec saved to packages/api-client/src/generated/fastapi/openapi.json');
    console.log('💡 Use openapi-generator or similar tool to generate TypeScript client');
    console.log('   Example: npx @openapitools/openapi-generator-cli generate -i openapi.json -g typescript-axios -o ./client');
    
  } catch (error) {
    console.error('❌ Error generating client:', error.message);
    process.exit(1);
  }
}

generateClient();

