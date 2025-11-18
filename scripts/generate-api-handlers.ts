/**
 * Generate API Server Handlers from Schema Registry
 * 
 * This script generates boilerplate API handler code from the canonical schema registry
 * Run with: npm run generate:api-handlers
 */

import * as fs from 'fs';
import * as path from 'path';
import { schemaRegistry } from '@/schema/types/registry';

const OUTPUT_DIR = path.join(__dirname, '../lib/api/generated-handlers');

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
 * e.g., "generated-form" -> "generatedForm"
 */
function domainToCamelCase(str: string): string {
  const parts = str.split('-');
  return parts[0] + parts.slice(1).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

/**
 * Get the property name for list results
 * Repositories return { [domainName]: [...], pagination: {...} }
 */
function getListResultProperty(domainKey: string, domainName: string): string {
  // Map domain keys to their plural property names
  // Some repositories return different property names
  const pluralMap: Record<string, string> = {
    'properties': 'properties',
    'tenants': 'tenants',
    'leases': 'leases',
    'rent-payments': 'rentPayments',
    'maintenance': 'requests',
    'documents': 'documents',
    'expenses': 'expenses',
    'inspections': 'checklists',
    'vendors': 'providers',
    'conversations': 'conversations',
    'applications': 'applications',
    'notifications': 'notifications',
    'tasks': 'tasks',
    'invitations': 'invitations',
    'generated-forms': 'forms', // GeneratedFormRepository returns { forms, total }
    'units': 'units',
  };
  return pluralMap[domainKey] || `${domainToCamelCase(domainName)}s`;
}

/**
 * Check if repository returns pagination object or just total
 */
function hasPaginationObject(domainKey: string): boolean {
  // Some repositories return { items: [], total: number } instead of { items: [], pagination: {...} }
  const noPaginationObject = ['generated-forms', 'invitations'];
  return !noPaginationObject.includes(domainKey);
}

/**
 * Check if service uses UserContext pattern (special services)
 */
function usesUserContextPattern(domainKey: string): boolean {
  const userContextServices = ['generated-forms', 'invitations'];
  return userContextServices.includes(domainKey);
}

/**
 * Get method name prefix for special services
 */
function getMethodPrefix(domainKey: string, domainName: string): string {
  if (usesUserContextPattern(domainKey)) {
    const pascalDomain = toPascalCase(domainName);
    // GeneratedFormService uses getGeneratedForms, createGeneratedForm, etc.
    // InvitationService uses getInvitations, createInvitation, etc.
    return domainToCamelCase(domainName);
  }
  return '';
}

/**
 * Generate API handler boilerplate
 */
function generateApiHandlers(): void {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const handlerExports: string[] = [];
  const handlerImports: string[] = [];

  // Generate handler for each domain
  for (const [domainKey, domainDef] of Object.entries(schemaRegistry)) {
    const domainName = domainDef.domain;
    const pascalDomain = toPascalCase(domainName);
    const camelDomain = toCamelCase(domainKey);
    const camelDomainName = domainToCamelCase(domainName);
    const usesUserContext = usesUserContextPattern(domainKey);
    const methodPrefix = getMethodPrefix(domainKey, domainName);
    const listResultProperty = getListResultProperty(domainKey, domainName);
    const hasPagination = hasPaginationObject(domainKey);
    
    // Use schema names from registry if available, otherwise generate from domain name
    const createSchemaName = domainDef.schemaNames?.create || `${camelDomainName}CreateSchema`;
    const updateSchemaName = domainDef.schemaNames?.update || `${camelDomainName}UpdateSchema`;
    const querySchemaName = domainDef.schemaNames?.query || `${camelDomainName}QuerySchema`;
    
    // Fix schema names for maintenance (uses maintenanceRequest prefix)
    const actualCreateSchemaName = domainKey === 'maintenance' 
      ? 'maintenanceRequestCreateSchema' 
      : createSchemaName;
    const actualUpdateSchemaName = domainKey === 'maintenance'
      ? 'maintenanceRequestUpdateSchema'
      : updateSchemaName;
    const actualQuerySchemaName = domainKey === 'maintenance'
      ? 'maintenanceRequestQuerySchema'
      : querySchemaName;
    
    // Determine create context type
    const createContext = usesUserContext 
      ? 'user' 
      : domainKey === 'documents'
        ? '{ userId: user.userId, userEmail: user.email, userName: user.userName }'
        : domainKey === 'maintenance' || domainKey === 'conversations' || domainKey === 'applications'
          ? '{ userId: user.userId, userRole: user.role }'
          : domainKey === 'vendors' || domainKey === 'inspections'
          ? '{ userId: user.userId, userRole: user.role }'
          : domainKey === 'tenants' || domainKey === 'expenses' || domainKey === 'rent-payments' || domainKey === 'leases' || domainKey === 'tasks'
            ? '{ userId: user.userId }'
            : '{ userId: user.userId, organizationId: user.organizationId }';
    
    // Determine method names based on service pattern
    const listMethod = usesUserContext ? `get${pascalDomain}s` : 'list';
    const getByIdMethod = usesUserContext ? `get${pascalDomain}ById` : 'getById';
    const createMethod = usesUserContext ? `create${pascalDomain}` : 'create';
    const updateMethod = usesUserContext ? `update${pascalDomain}` : 'update';
    const deleteMethod = usesUserContext ? `delete${pascalDomain}` : 'delete';
    
    // Special handling for units - list takes where object, not query
    const listMethodCall = domainKey === 'units' 
      ? `service.${listMethod}({ propertyId: query.propertyId }, undefined)`
      : `service.${listMethod}(query${usesUserContext ? ', user' : ''})`;
    
    // Special handling for notifications - create doesn't take context
    const createMethodCall = domainKey === 'notifications'
      ? `service.${createMethod}(data)`
      : domainKey === 'units'
        ? `service.${createMethod}(data, undefined)` // Units.create takes include, not context
        : `service.${createMethod}(data, ${createContext})`;
    
    // Special handling for units - service constructor needs PropertyRepository
    const serviceInit = domainKey === 'units'
      ? `const propertyRepository = new PropertyRepository(prisma);
  const service = new ${pascalDomain}Service(repository, propertyRepository);`
      : `const service = new ${pascalDomain}Service(repository);`;
    
    // Special handling for units - returns array directly, not object with property
    const unitsListResult = domainKey === 'units' 
      ? 'result' 
      : `result.${listResultProperty}`;

    // Generate handler file
    const handlerContent = `/**
 * Generated API Handler for ${pascalDomain}
 * 
 * ⚠️ DO NOT EDIT THIS FILE MANUALLY
 * This file is auto-generated from the canonical schema registry.
 * Run \`npm run generate:api-handlers\` to regenerate.
 * 
 * Generated: ${new Date().toISOString()}
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { ${pascalDomain}Service, ${pascalDomain}Repository } from '@/lib/domains/${domainName}';
${domainKey === 'units' ? `import { PropertyRepository } from '@/lib/domains/property';` : ''}
import { ${actualCreateSchemaName}, ${actualUpdateSchemaName}, ${actualQuerySchemaName} } from '@/lib/schemas';
const { prisma } = require('@/lib/prisma');

/**
 * API Handler for ${pascalDomain} CRUD operations
 */
async function handler(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  const repository = new ${pascalDomain}Repository(prisma);
  ${serviceInit}

  try {
    switch (req.method) {
      case 'GET': {
        // List ${pascalDomain}s
        if (!req.query.id) {
          const query = ${actualQuerySchemaName}.parse(req.query);
          const result = await ${listMethodCall};
          ${domainKey === 'units' 
            ? `// Units returns array directly
          return res.status(200).json({
            success: true,
            data: result,
            pagination: {
              page: query.page || 1,
              limit: query.limit || 50,
              total: Array.isArray(result) ? result.length : 0,
              totalPages: Math.ceil((Array.isArray(result) ? result.length : 0) / (query.limit || 50)),
            },
          });`
            : hasPagination 
              ? `return res.status(200).json({
            success: true,
            data: result.${listResultProperty},
            pagination: result.pagination,
          });`
              : `const items = result.${listResultProperty};
          const total = result.total || (Array.isArray(items) ? items.length : 0);
          const page = query.page || 1;
          const limit = query.limit || 50;
          return res.status(200).json({
            success: true,
            data: items,
            pagination: {
              page,
              limit,
              total,
              totalPages: Math.ceil(total / limit),
            },
          });`}
        }

        // Get ${pascalDomain} by ID
        const id = req.query.id as string;
        const item = await service.${getByIdMethod}(id${usesUserContext ? ', user' : ''});
        if (!item) {
          return res.status(404).json({ error: '${pascalDomain} not found' });
        }
        return res.status(200).json({ success: true, data: item });
      }

      case 'POST': {
        const data = ${actualCreateSchemaName}.parse(req.body);
        const created = await ${createMethodCall};
        return res.status(201).json({ success: true, data: created });
      }

      case 'PATCH': {
        const id = req.query.id as string;
        if (!id) {
          return res.status(400).json({ error: 'ID is required' });
        }
        const data = ${actualUpdateSchemaName}.parse(req.body);
        const updated = await service.${updateMethod}(id, data${usesUserContext ? ', user' : ''});
        return res.status(200).json({ success: true, data: updated });
      }

      case 'DELETE': {
        const id = req.query.id as string;
        if (!id) {
          return res.status(400).json({ error: 'ID is required' });
        }
        await service.${deleteMethod}(id${usesUserContext ? ', user' : ''});
        res.status(204).end();
        return;
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.issues,
      });
    }
    console.error(\`[${pascalDomain} API Handler] Error:\`, error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
}

export default withAuth(handler, {
  requireRole: ['landlord', 'pmc', 'admin'],
  allowedMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
});
`;

    const handlerFileName = `${camelDomain}.handler.ts`;
    const handlerFilePath = path.join(OUTPUT_DIR, handlerFileName);
    fs.writeFileSync(handlerFilePath, handlerContent, 'utf-8');

    handlerImports.push(`import ${camelDomain}Handler from './${camelDomain}.handler';`);
    handlerExports.push(`  ${camelDomain}: ${camelDomain}Handler,`);
  }

  // Generate index file
  const indexContent = `/**
 * Generated API Handlers Index
 * 
 * ⚠️ DO NOT EDIT THIS FILE MANUALLY
 * This file is auto-generated from the canonical schema registry.
 * Run \`npm run generate:api-handlers\` to regenerate.
 * 
 * Generated: ${new Date().toISOString()}
 */

${handlerImports.join('\n')}

export const generatedHandlers = {
${handlerExports.join('\n')}
};

export default generatedHandlers;
`;

  const indexFilePath = path.join(OUTPUT_DIR, 'index.ts');
  fs.writeFileSync(indexFilePath, indexContent, 'utf-8');

  console.log(`✅ Generated API handlers: ${OUTPUT_DIR}`);
  console.log(`   Generated ${Object.keys(schemaRegistry).length} handler files`);
  console.log(`   ⚠️  Note: These are boilerplate templates. Review and customize as needed.`);
}

// Run generation
try {
  generateApiHandlers();
} catch (error) {
  console.error('❌ Error generating API handlers:', error);
  process.exit(1);
}

