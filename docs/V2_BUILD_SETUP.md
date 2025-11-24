# V2 Build Setup

## Overview

This document describes the V2 build process, which uses **FastAPI + Pydantic** as the source of truth for API schemas, replacing the legacy Zod schema system.

## Architecture

### V2 Stack
- **Backend**: FastAPI + Pydantic (Python)
- **Database**: PostgreSQL v2 with SQLAlchemy models
- **Frontend**: Next.js + React + Flowbite
- **API Client**: Generated TypeScript types from FastAPI OpenAPI spec

### Legacy Components (Excluded from Build)

The following packages are **legacy** and excluded from the build:
- `@pinaka/schemas` - Legacy Zod schemas (replaced by Pydantic)
- `@pinaka/api-client` - Legacy API client generator (uses Zod schemas)
- `@pinaka/server-stubs` - Legacy server stubs (uses Zod schemas)
- `@pinaka/domains` - Legacy domain layer (uses Zod schemas)
- `@pinaka/api-server` - Legacy Next.js API routes (replaced by FastAPI)

## Build Process

### 1. Generate TypeScript Types from FastAPI

Before building, generate TypeScript types from FastAPI's OpenAPI spec:

```bash
# Make sure FastAPI server is running
cd apps/backend-api
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# In another terminal, generate types
pnpm run generate:fastapi-types
```

This will:
1. Fetch OpenAPI spec from `http://localhost:8000/openapi.json`
2. Generate TypeScript types using `openapi-typescript`
3. Save types to `packages/api-client/src/generated/fastapi/types.ts`

### 2. Build Packages

```bash
pnpm run build:packages
```

This builds all packages except legacy ones:
- ✅ `packages/shared-utils`
- ✅ `packages/ui`
- ✅ `packages/shared-types` (if needed)
- ❌ `packages/schemas` (legacy - excluded)
- ❌ `packages/api-client` (legacy - excluded)
- ❌ `packages/server-stubs` (legacy - excluded)
- ❌ `packages/domains` (legacy - excluded)

### 3. Build Apps

```bash
pnpm run build:apps
```

This builds:
- ✅ `apps/web-app` (Next.js frontend)
- ❌ `apps/api-server` (legacy - excluded, use FastAPI instead)

## Using Generated Types

After generating types from FastAPI, use them in your frontend code:

```typescript
// Import generated types
import type { paths, components } from '@/lib/api/generated/fastapi/types';

// Use in API calls
type Property = components['schemas']['Property'];
type PropertyCreate = components['schemas']['PropertyCreate'];
type PropertyListResponse = paths['/api/v2/properties']['get']['responses']['200']['content']['application/json'];
```

## Development Workflow

### 1. Start FastAPI Backend

```bash
cd apps/backend-api
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Generate Types (when schemas change)

```bash
pnpm run generate:fastapi-types
```

### 3. Start Frontend

```bash
pnpm dev
```

## Migration Notes

### From Zod to Pydantic

**Old (Legacy):**
```typescript
import { PropertyCreate } from '@pinaka/schemas';
```

**New (V2):**
```typescript
import type { components } from '@/lib/api/generated/fastapi/types';
type PropertyCreate = components['schemas']['PropertyCreate'];
```

### From Next.js API Routes to FastAPI

**Old (Legacy):**
```typescript
// Next.js API route: /api/v1/properties
const response = await fetch('/api/v1/properties');
```

**New (V2):**
```typescript
// FastAPI endpoint: /api/v2/properties
import { v2Api } from '@/lib/api/v2-client';
const properties = await v2Api.listProperties();
```

## Troubleshooting

### FastAPI Types Generation Fails

**Error**: `Failed to fetch OpenAPI spec`

**Solution**: Make sure FastAPI server is running:
```bash
cd apps/backend-api
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Build Fails with Legacy Package Errors

**Error**: `Cannot find module '@/lib/schemas'`

**Solution**: This is expected - legacy packages are excluded from the build. If you need them, they should be migrated to use FastAPI types instead.

### Types Not Updating

**Solution**: Regenerate types after changing Pydantic schemas:
```bash
pnpm run generate:fastapi-types
```

## Next Steps

1. ✅ Exclude legacy packages from build
2. ✅ Generate TypeScript types from FastAPI OpenAPI spec
3. ⏳ Migrate remaining frontend code to use generated types
4. ⏳ Remove legacy Zod schema packages
5. ⏳ Remove legacy Next.js API routes

