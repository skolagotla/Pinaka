/**
 * Migrate Legacy Endpoints to v1Api
 * 
 * This script helps identify and migrate legacy endpoint calls to v1Api
 */

const fs = require('fs');
const path = require('path');

const MIGRATIONS = {
  '/api/tenants': {
    list: (query) => `const { v1Api } = await import('@/lib/api/v1-client');\n      const response = await v1Api.tenants.list(${query ? JSON.stringify(query) : '{ page: 1, limit: 1000 }'});\n      const data = response.data?.data || response.data || [];`,
    get: (id) => `const { v1Api } = await import('@/lib/api/v1-client');\n      const data = await v1Api.tenants.get(${id});`,
    create: (data) => `const { v1Api } = await import('@/lib/api/v1-client');\n      const result = await v1Api.tenants.create(${data});`,
    update: (id, data) => `const { v1Api } = await import('@/lib/api/v1-client');\n      const result = await v1Api.tenants.update(${id}, ${data});`,
    delete: (id) => `const { v1Api } = await import('@/lib/api/v1-client');\n      await v1Api.tenants.delete(${id});`,
  },
  '/api/leases': {
    list: (query) => `const { v1Api } = await import('@/lib/api/v1-client');\n      const response = await v1Api.leases.list(${query ? JSON.stringify(query) : '{ page: 1, limit: 1000 }'});\n      const data = response.data?.data || response.data || [];`,
    get: (id) => `const { v1Api } = await import('@/lib/api/v1-client');\n      const data = await v1Api.leases.get(${id});`,
    create: (data) => `const { v1Api } = await import('@/lib/api/v1-client');\n      const result = await v1Api.leases.create(${data});`,
    update: (id, data) => `const { v1Api } = await import('@/lib/api/v1-client');\n      const result = await v1Api.leases.update(${id}, ${data});`,
    delete: (id) => `const { v1Api } = await import('@/lib/api/v1-client');\n      await v1Api.leases.delete(${id});`,
  },
};

console.log('Migration patterns defined. Use this as a reference for manual migration.');

