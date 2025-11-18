/**
 * Generate API Routes from Schema Registry
 * 
 * This script generates Next.js API route files in apps/api-server/pages/api/v1 from the canonical schema registry
 * Run with: npm run generate:api-routes
 * 
 * Domain-Driven, API-First implementation
 */

import * as fs from 'fs';
import * as path from 'path';
import { schemaRegistry } from '@/schema/types/registry';

const API_ROUTES_DIR = path.join(__dirname, '../apps/api-server/pages/api/v1');

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
 * Convert domain name to camelCase schema name
 */
function domainToCamelCase(str: string): string {
  const parts = str.split('-');
  return parts[0] + parts.slice(1).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

/**
 * Get service instance name from domain key
 */
function getServiceInstanceName(domainKey: string): string {
  const serviceMap: Record<string, string> = {
    'applications': 'applicationService',
    'conversations': 'conversationService',
    'documents': 'documentService',
    'expenses': 'expenseService',
    'generated-forms': 'generatedFormService',
    'inspections': 'inspectionService',
    'invitations': 'invitationService',
    'maintenance': 'maintenanceService',
    'notifications': 'notificationService',
    'properties': 'propertyService',
    'rent-payments': 'rentPaymentService',
    'tasks': 'taskService',
    'tenants': 'tenantService',
    'units': 'unitService',
    'vendors': 'vendorService',
  };
  return serviceMap[domainKey] || `${domainToCamelCase(domainKey)}Service`;
}

/**
 * Get service import path from domain key
 */
function getServiceImportPath(domainKey: string): string {
  const importMap: Record<string, string> = {
    'applications': '@/lib/domains/application',
    'conversations': '@/lib/domains/conversation',
    'documents': '@/lib/domains/document',
    'expenses': '@/lib/domains/expense',
    'generated-forms': '@/lib/domains/generated-form',
    'inspections': '@/lib/domains/inspection',
    'invitations': '@/lib/domains/invitation',
    'leases': '@/lib/domains/lease',
    'maintenance': '@/lib/domains/maintenance',
    'notifications': '@/lib/domains/notification',
    'properties': '@/lib/domains/property',
    'rent-payments': '@/lib/domains/rent-payment',
    'tasks': '@/lib/domains/task',
    'tenants': '@/lib/domains/tenant',
    'units': '@/lib/domains/unit',
    'vendors': '@/lib/domains/vendor',
  };
  return importMap[domainKey] || `@/lib/domains/${domainKey}`;
}

/**
 * Get method names for service
 */
function getServiceMethods(domainKey: string): {
  list: string;
  getById: string;
  create: string;
  update: string;
  delete: string;
} {
  const usesUserContext = ['generated-forms', 'invitations'].includes(domainKey);
  
  if (usesUserContext) {
    const domainName = schemaRegistry[domainKey].domain;
    const pascalDomain = toPascalCase(domainName);
    const camelDomain = domainToCamelCase(domainName);
    
    return {
      list: `get${pascalDomain}s`,
      getById: `get${pascalDomain}ById`,
      create: `create${pascalDomain}`,
      update: `update${pascalDomain}`,
      delete: `delete${pascalDomain}`,
    };
  }
  
  return {
    list: 'list',
    getById: 'getById',
    create: 'create',
    update: 'update',
    delete: 'delete',
  };
}

/**
 * Generate API route file
 */
function generateApiRoute(domainKey: string, domainDef: any): void {
  const domainName = domainDef.domain;
  const pascalDomain = toPascalCase(domainName);
  const camelDomain = toCamelCase(domainKey);
  const camelDomainName = domainToCamelCase(domainName);
  const serviceInstance = getServiceInstanceName(domainKey);
  const serviceImport = getServiceImportPath(domainKey);
  const methods = getServiceMethods(domainKey);
  const usesUserContext = ['generated-forms', 'invitations'].includes(domainKey);
  
  // Schema names
  const createSchemaName = domainDef.schemaNames?.create || `${camelDomainName}CreateSchema`;
  const updateSchemaName = domainDef.schemaNames?.update || `${camelDomainName}UpdateSchema`;
  const querySchemaName = domainDef.schemaNames?.query || `${camelDomainName}QuerySchema`;
  
  // Fix schema names for maintenance
  const actualCreateSchemaName = domainKey === 'maintenance' 
    ? 'maintenanceRequestCreateSchema' 
    : createSchemaName;
  const actualUpdateSchemaName = domainKey === 'maintenance'
    ? 'maintenanceRequestUpdateSchema'
    : updateSchemaName;
  const actualQuerySchemaName = domainKey === 'maintenance'
    ? 'maintenanceRequestQuerySchema'
    : querySchemaName;

  const routeContent = `/**
 * ${pascalDomain} API v1
 * 
 * Domain-Driven, API-First implementation
 * Generated from schema registry - DO NOT EDIT MANUALLY
 * Run \`npm run generate:api-routes\` to regenerate
 * 
 * Generated: ${new Date().toISOString()}
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { ${actualCreateSchemaName}, ${actualUpdateSchemaName}, ${actualQuerySchemaName} } from '@/lib/schemas';
import { ${serviceInstance} } from '${serviceImport}';
import { z } from 'zod';

/**
 * GET /api/v1/${domainKey}
 * List ${domainName}s with pagination and filters
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  try {
    const query = ${actualQuerySchemaName}.parse(req.query);
    ${usesUserContext ? `const result = await ${serviceInstance}.${methods.list}(query, user);` : `const result = await ${serviceInstance}.${methods.list}(query);`}
    
    return res.status(200).json({
      success: true,
      data: result.${camelDomain} || result,
      pagination: result.pagination,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }
    console.error(\`[${pascalDomain} API] GET Error:\`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch ${domainName}s',
    });
  }
}

/**
 * POST /api/v1/${domainKey}
 * Create a new ${domainName}
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  try {
    const data = ${actualCreateSchemaName}.parse(req.body);
    ${usesUserContext 
      ? `const created = await ${serviceInstance}.${methods.create}(data, user);`
      : `const created = await ${serviceInstance}.${methods.create}(data, { userId: user.userId, userRole: user.role });`}
    
    return res.status(201).json({
      success: true,
      data: created,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }
    console.error(\`[${pascalDomain} API] POST Error:\`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create ${domainName}',
    });
  }
}

/**
 * Main handler
 */
async function handler(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res, user);
    case 'POST':
      return handlePost(req, res, user);
    default:
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
      });
  }
}

export default withAuth(handler, {
  requireRole: ['landlord', 'pmc', 'admin'],
  allowedMethods: ['GET', 'POST'],
});
`;

  // Generate [id].ts route for PATCH and DELETE
  const idRouteContent = `/**
 * ${pascalDomain} API v1 - Individual Resource Operations
 * 
 * Domain-Driven, API-First implementation
 * Generated from schema registry - DO NOT EDIT MANUALLY
 * Run \`npm run generate:api-routes\` to regenerate
 * 
 * Generated: ${new Date().toISOString()}
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { ${actualUpdateSchemaName} } from '@/lib/schemas';
import { ${serviceInstance} } from '${serviceImport}';
import { z } from 'zod';

/**
 * GET /api/v1/${domainKey}/[id]
 * Get a single ${domainName} by ID
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  try {
    const id = req.query.id as string;
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID is required',
      });
    }

    ${usesUserContext 
      ? `const result = await ${serviceInstance}.${methods.getById}(id, user);`
      : `const result = await ${serviceInstance}.${methods.getById}(id);`}
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: '${pascalDomain} not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error(\`[${pascalDomain} API] GET Error:\`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch ${domainName}',
    });
  }
}

/**
 * PATCH /api/v1/${domainKey}/[id]
 * Update a ${domainName}
 */
async function handlePatch(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  try {
    const id = req.query.id as string;
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID is required',
      });
    }

    const data = ${actualUpdateSchemaName}.parse(req.body);
    ${usesUserContext 
      ? `const updated = await ${serviceInstance}.${methods.update}(id, data, user);`
      : `const updated = await ${serviceInstance}.${methods.update}(id, data);`}
    
    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }
    console.error(\`[${pascalDomain} API] PATCH Error:\`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update ${domainName}',
    });
  }
}

/**
 * DELETE /api/v1/${domainKey}/[id]
 * Delete a ${domainName}
 */
async function handleDelete(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  try {
    const id = req.query.id as string;
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID is required',
      });
    }

    ${usesUserContext 
      ? `await ${serviceInstance}.${methods.delete}(id, user);`
      : `await ${serviceInstance}.${methods.delete}(id);`}
    
    return res.status(204).end();
  } catch (error: any) {
    console.error(\`[${pascalDomain} API] DELETE Error:\`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete ${domainName}',
    });
  }
}

/**
 * Main handler
 */
async function handler(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res, user);
    case 'PATCH':
      return handlePatch(req, res, user);
    case 'DELETE':
      return handleDelete(req, res, user);
    default:
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
      });
  }
}

export default withAuth(handler, {
  requireRole: ['landlord', 'pmc', 'admin'],
  allowedMethods: ['GET', 'PATCH', 'DELETE'],
});
`;

  // Create directory if it doesn't exist
  const routeDir = path.join(API_ROUTES_DIR, domainKey);
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }

  // Write index.ts file
  const indexPath = path.join(routeDir, 'index.ts');
  fs.writeFileSync(indexPath, routeContent, 'utf-8');
  console.log(`✅ Generated API route: ${indexPath}`);

  // Write [id].ts file for PATCH/DELETE operations
  const idRoutePath = path.join(routeDir, '[id].ts');
  fs.writeFileSync(idRoutePath, idRouteContent, 'utf-8');
  console.log(`✅ Generated API route: ${idRoutePath}`);
}

/**
 * Generate API routes from schema registry
 */
function generateApiRoutes(): void {
  // Create base directory if it doesn't exist
  if (!fs.existsSync(API_ROUTES_DIR)) {
    fs.mkdirSync(API_ROUTES_DIR, { recursive: true });
  }

  console.log('🚀 Generating API routes from schema registry...\n');

  // Generate route for each domain
  for (const [domainKey, domainDef] of Object.entries(schemaRegistry)) {
    try {
      generateApiRoute(domainKey, domainDef);
    } catch (error) {
      console.error(`❌ Error generating route for ${domainKey}:`, error);
    }
  }

  console.log('\n✅ API route generation complete!');
  console.log(`📁 Routes generated in: ${API_ROUTES_DIR}`);
}

// Run generation
generateApiRoutes();

