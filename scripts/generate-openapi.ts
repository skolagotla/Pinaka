/**
 * Generate OpenAPI/Swagger Specification from Zod Schemas
 * 
 * This script generates an OpenAPI 3.0 specification from the canonical schema registry
 * Run with: npm run generate:openapi
 */

import * as fs from 'fs';
import * as path from 'path';
import { schemaRegistry } from '@/schema/types/registry';

const OUTPUT_FILE = path.join(__dirname, '../docs/openapi.json');

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
 * Generate OpenAPI specification
 */
function generateOpenAPI(): void {
  const paths: Record<string, any> = {};
  const components: { schemas: Record<string, any> } = { schemas: {} };

  // Generate paths for CRUD domains
  for (const [domainKey, domainDef] of Object.entries(schemaRegistry)) {
    const apiPath = domainDef.apiPath;
    const pascalDomain = toPascalCase(domainDef.domain);

    // GET /api/v1/{domain} - List
    if (domainDef.methods.includes('GET')) {
      paths[apiPath] = {
        get: {
          summary: `List ${pascalDomain}s`,
          tags: [pascalDomain],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1, minimum: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 50, minimum: 1, maximum: 1000 },
            },
          ],
          responses: {
            '200': {
              description: `List of ${pascalDomain}s`,
              content: {
                'application/json': {
                  schema: {
                    $ref: `#/components/schemas/${pascalDomain}ListResponse`,
                  },
                },
              },
            },
          },
        },
      };
    }

    // POST /api/v1/{domain} - Create
    if (domainDef.methods.includes('POST')) {
      if (!paths[apiPath]) paths[apiPath] = {};
      paths[apiPath].post = {
        summary: `Create ${pascalDomain}`,
        tags: [pascalDomain],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: `#/components/schemas/${pascalDomain}Create`,
              },
            },
          },
        },
        responses: {
          '201': {
            description: `${pascalDomain} created`,
            content: {
              'application/json': {
                schema: {
                  $ref: `#/components/schemas/${pascalDomain}Response`,
                },
              },
            },
          },
        },
      };
    }

    // GET /api/v1/{domain}/{id} - Get by ID
    if (domainDef.methods.includes('GET')) {
      paths[`${apiPath}/{id}`] = {
        get: {
          summary: `Get ${pascalDomain} by ID`,
          tags: [pascalDomain],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: `${pascalDomain} details`,
              content: {
                'application/json': {
                  schema: {
                    $ref: `#/components/schemas/${pascalDomain}Response`,
                  },
                },
              },
            },
          },
        },
      };
    }

    // PATCH /api/v1/{domain}/{id} - Update
    if (domainDef.methods.includes('PATCH')) {
      if (!paths[`${apiPath}/{id}`]) paths[`${apiPath}/{id}`] = {};
      paths[`${apiPath}/{id}`].patch = {
        summary: `Update ${pascalDomain}`,
        tags: [pascalDomain],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: `#/components/schemas/${pascalDomain}Update`,
              },
            },
          },
        },
        responses: {
          '200': {
            description: `${pascalDomain} updated`,
            content: {
              'application/json': {
                schema: {
                  $ref: `#/components/schemas/${pascalDomain}Response`,
                },
              },
            },
          },
        },
      };
    }

    // DELETE /api/v1/{domain}/{id} - Delete
    if (domainDef.methods.includes('DELETE')) {
      if (!paths[`${apiPath}/{id}`]) paths[`${apiPath}/{id}`] = {};
      paths[`${apiPath}/{id}`].delete = {
        summary: `Delete ${pascalDomain}`,
        tags: [pascalDomain],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '204': {
            description: `${pascalDomain} deleted`,
          },
        },
      };
    }

    // Add schema references (will be resolved by actual schema files)
    // Always add these schemas - schemaNames is optional
    if (domainDef.schemaNames?.create) {
      components.schemas[`${pascalDomain}Create`] = {
        type: 'object',
        description: `Schema for creating a ${pascalDomain}`,
        // Note: Full schema would be generated from Zod schema
      };
    }
    // Always add these schemas - schemaNames is optional
    components.schemas[`${pascalDomain}Update`] = {
      type: 'object',
      description: `Schema for updating a ${pascalDomain}`,
    };
    components.schemas[`${pascalDomain}Response`] = {
      type: 'object',
      description: `Response schema for ${pascalDomain}`,
    };
    if (domainDef.schemaNames?.listResponse) {
      components.schemas[`${pascalDomain}ListResponse`] = {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'array',
            items: { $ref: `#/components/schemas/${pascalDomain}Response` },
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' },
              total: { type: 'integer' },
              totalPages: { type: 'integer' },
            },
          },
        },
      };
    }
  }

  // Generate specialized endpoints (placeholder for future implementation)
  // For now, skip specialized endpoints
  // const specialized: Record<string, Record<string, any>> = {};
  // if (Object.keys(specialized).length > 0) {
  //   for (const [category, endpoints] of Object.entries(specialized)) {
  //     for (const [endpointName, endpoint] of Object.entries(endpoints)) {
  //       const pathKey = endpoint.path;
  //       if (!paths[pathKey]) paths[pathKey] = {};
  //       // ... specialized endpoint generation code ...
  //     }
  //   }
  // }

  // Generate OpenAPI spec
  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'Pinaka API',
      version: '1.0.0',
      description: 'API documentation generated from canonical schema registry',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    paths,
    components,
    tags: Object.keys(schemaRegistry).map((key) => ({
      name: toPascalCase(schemaRegistry[key].domain),
      description: `${toPascalCase(schemaRegistry[key].domain)} operations`,
    })),
  };

  // Write to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(spec, null, 2), 'utf-8');
  console.log(`✅ Generated OpenAPI spec: ${OUTPUT_FILE}`);
  console.log(`   Generated ${Object.keys(paths).length} paths from ${Object.keys(schemaRegistry).length} domains`);
}

// Run generation
try {
  generateOpenAPI();
} catch (error) {
  console.error('❌ Error generating OpenAPI spec:', error);
  process.exit(1);
}

