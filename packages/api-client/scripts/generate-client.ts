/**
 * Generate API Client from @pinaka/schema
 * 
 * This generates a type-safe API client from the schema package
 * Run with: npm run generate:client
 */

import * as fs from 'fs';
import * as path from 'path';
import { schemaRegistry } from '../../../schema/types/registry';

const OUTPUT_FILE = path.join(__dirname, '../src/generated-client.ts');

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
 * Generate API client
 */
function generateClient(): void {
  const imports: string[] = [];
  const resourceClasses: string[] = [];
  const clientProperties: string[] = [];

  // Import types from schema package
  imports.push(`import type {`);
  const typeImports: string[] = [];
  for (const [domainKey, domainDef] of Object.entries(schemaRegistry)) {
    const pascalDomain = toPascalCase(domainDef.domain);
    typeImports.push(`  ${pascalDomain}Create,`);
    typeImports.push(`  ${pascalDomain}Update,`);
    typeImports.push(`  ${pascalDomain}Query,`);
    typeImports.push(`  ${pascalDomain}Response,`);
    typeImports.push(`  ${pascalDomain}ListResponse,`);
  }
  imports.push(Array.from(new Set(typeImports)).join('\n'));
  imports.push(`} from '@pinaka/schemas';`);

  // Generate ApiResource class
  resourceClasses.push(`
/**
 * Generic API resource client
 */
class ApiResource<TCreate, TUpdate, TQuery, TResponse, TListResponse> {
  constructor(private basePath: string, private baseUrl: string = '') {}

  async list(query?: TQuery): Promise<TListResponse> {
    const queryString = query ? buildQueryString(query as any) : '';
    const response = await fetch(\`\${this.baseUrl}/api/v1/\${this.basePath}\${queryString}\`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || 'Request failed');
    }
    return response.json();
  }

  async get(id: string): Promise<TResponse> {
    const response = await fetch(\`\${this.baseUrl}/api/v1/\${this.basePath}/\${id}\`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || 'Request failed');
    }
    return response.json();
  }

  async create(data: TCreate): Promise<TResponse> {
    const response = await fetch(\`\${this.baseUrl}/api/v1/\${this.basePath}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || 'Request failed');
    }
    return response.json();
  }

  async update(id: string, data: TUpdate): Promise<TResponse> {
    const response = await fetch(\`\${this.baseUrl}/api/v1/\${this.basePath}/\${id}\`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || 'Request failed');
    }
    return response.json();
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(\`\${this.baseUrl}/api/v1/\${this.basePath}/\${id}\`, {
      method: 'DELETE',
      credentials: 'include',
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

  // Generate resource instances
  for (const [domainKey, domainDef] of Object.entries(schemaRegistry)) {
    const camelKey = toCamelCase(domainKey);
    const pascalDomain = toPascalCase(domainDef.domain);
    
    const createType = `${pascalDomain}Create`;
    const updateType = `${pascalDomain}Update`;
    const queryType = `${pascalDomain}Query`;
    const responseType = `${pascalDomain}Response`;
    const listResponseType = `${pascalDomain}ListResponse`;

    clientProperties.push(
      `  ${camelKey}: new ApiResource<${createType}, ${updateType}, ${queryType}, ${responseType}, ${listResponseType}>('${domainKey}'),`
    );
  }

  // Generate the file content
  const content = `/**
 * Generated API Client
 * 
 * ⚠️ DO NOT EDIT THIS FILE MANUALLY
 * This file is auto-generated from @pinaka/schema.
 * Run \`npm run generate:client\` to regenerate.
 * 
 * Generated: ${new Date().toISOString()}
 */

${imports.join('\n')}

${resourceClasses.join('\n')}

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
  generateClient();
} catch (error) {
  console.error('❌ Error generating API client:', error);
  process.exit(1);
}

