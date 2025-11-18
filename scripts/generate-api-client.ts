/**
 * Generate API Client from Schema Registry
 * 
 * This script generates a type-safe API client from the canonical schema registry
 * Run with: npm run generate:api-client
 */

import * as fs from 'fs';
import * as path from 'path';
import { schemaRegistry } from '@/schema/types/registry';

const OUTPUT_FILE = path.join(__dirname, '../lib/api/v1-client.generated.ts');

/**
 * Convert domain key to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Convert domain key to camelCase
 */
function toCamelCase(str: string): string {
  const parts = str.split('-');
  return parts[0] + parts.slice(1).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

/**
 * Generate API client code
 */
function generateApiClient(): void {
  const imports: string[] = [];
  const resourceClasses: string[] = [];
  const clientProperties: string[] = [];
  const specializedMethods: string[] = [];

  // Import types
  imports.push(`import { apiClient } from '@/lib/utils/api-client';`);
  imports.push(`import type {`);
  
  // Collect all type imports
  const typeImports: string[] = [];
  for (const [domainKey, domainDef] of Object.entries(schemaRegistry)) {
    const pascalDomain = toPascalCase(domainDef.domain);
    // Always add type imports - schemaNames is optional
    typeImports.push(`  ${pascalDomain}Create,`);
    typeImports.push(`  ${pascalDomain}Update,`);
    typeImports.push(`  ${pascalDomain}Query,`);
    typeImports.push(`  ${pascalDomain}Response,`);
    typeImports.push(`  ${pascalDomain}ListResponse,`);
  }
  
  imports.push(Array.from(new Set(typeImports)).join('\n'));
  imports.push(`} from '@/lib/schemas';`);

  // Generate ApiResource class
  resourceClasses.push(`
/**
 * Generic API resource client
 */
class ApiResource<TCreate, TUpdate, TQuery, TResponse, TListResponse> {
  constructor(private basePath: string) {}

  async list(query?: TQuery): Promise<TListResponse> {
    const queryString = query ? buildQueryString(query as any) : '';
    const response = await apiClient(\`/api/v1/\${this.basePath}\${queryString}\`, {
      method: 'GET',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || 'Request failed');
    }
    return response.json();
  }

  async get(id: string): Promise<TResponse> {
    const response = await apiClient(\`/api/v1/\${this.basePath}/\${id}\`, {
      method: 'GET',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || 'Request failed');
    }
    return response.json();
  }

  async create(data: TCreate): Promise<TResponse> {
    const response = await apiClient(\`/api/v1/\${this.basePath}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || 'Request failed');
    }
    return response.json();
  }

  async update(id: string, data: TUpdate): Promise<TResponse> {
    const response = await apiClient(\`/api/v1/\${this.basePath}/\${id}\`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || 'Request failed');
    }
    return response.json();
  }

  async delete(id: string): Promise<void> {
    const response = await apiClient(\`/api/v1/\${this.basePath}/\${id}\`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || 'Request failed');
    }
    if (response.status !== 204) {
      await response.json(); // Consume response body
    }
  }
}

/**
 * Build query string from object
 */
function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  }
  const queryString = searchParams.toString();
  return queryString ? \`?\${queryString}\` : '';
}
`);

  // Generate resource instances for each domain
  for (const [domainKey, domainDef] of Object.entries(schemaRegistry)) {
    const camelKey = toCamelCase(domainKey);
    const pascalDomain = toPascalCase(domainDef.domain);
    
    // Always use types - schemaNames is optional
    const createType = `${pascalDomain}Create`;
    const updateType = `${pascalDomain}Update`;
    const queryType = `${pascalDomain}Query`;
    const responseType = `${pascalDomain}Response`;
    const listResponseType = `${pascalDomain}ListResponse`;

    clientProperties.push(
      `  ${camelKey}: new ApiResource<${createType}, ${updateType}, ${queryType}, ${responseType}, ${listResponseType}>('${domainKey}'),`
    );
  }

  // Generate specialized endpoints (placeholder for future implementation)
  // For now, skip specialized endpoints
  const specialized: Record<string, Record<string, any>> = {};
  if (Object.keys(specialized).length > 0) {
    specializedMethods.push(`
/**
 * Specialized API endpoints (non-CRUD)
 */
class SpecializedApi {
`);
    
    // Analytics endpoints
    if (specialized.analytics) {
      specializedMethods.push(`  // Analytics`);
      for (const [endpointName, endpoint] of Object.entries(specialized.analytics)) {
        const methodName = endpointName.replace(/-/g, '');
        specializedMethods.push(`
  async ${methodName}(query?: any): Promise<any> {
    const queryString = query ? buildQueryString(query) : '';
    const response = await apiClient(\`\${endpoint.path}\${queryString}\`, {
      method: '${endpoint.method}',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || 'Request failed');
    }
    return response.json();
  }`);
      }
    }
    
    specializedMethods.push(`}`);
    clientProperties.push(`  specialized: new SpecializedApi(),`);
  }

  // Generate the file content
  const content = `/**
 * Generated API v1 Client
 * 
 * ⚠️ DO NOT EDIT THIS FILE MANUALLY
 * This file is auto-generated from the canonical schema registry.
 * Run \`npm run generate:api-client\` to regenerate.
 * 
 * Generated: ${new Date().toISOString()}
 */

${imports.join('\n')}

${resourceClasses.join('\n')}

${specializedMethods.join('\n')}

/**
 * Generated v1 API Client
 */
export const v1Api = {
${clientProperties.join('\n')}
};

export default v1Api;
`;

  // Write to file
  fs.writeFileSync(OUTPUT_FILE, content, 'utf-8');
  console.log(`✅ Generated API client: ${OUTPUT_FILE}`);
  console.log(`   Generated ${Object.keys(schemaRegistry).length} domain clients`);
}

// Run generation
try {
  generateApiClient();
} catch (error) {
  console.error('❌ Error generating API client:', error);
  process.exit(1);
}

