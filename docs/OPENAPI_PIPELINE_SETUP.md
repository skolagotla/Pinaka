# OpenAPI Type Generation Pipeline - Complete Setup

## ✅ Implementation Complete

The complete OpenAPI type generation pipeline has been set up for the Pinaka monorepo.

## What Was Implemented

### 1. Folder Structure ✅

```
packages/
  shared-types/          # Generated TypeScript types
    v2-api.d.ts         # Generated from FastAPI OpenAPI spec
    package.json
    
  api-client/            # Typed API client
    src/
      api-client.ts     # openapi-fetch client
      index.ts
    package.json
```

### 2. Type Generation ✅

- **Script**: `scripts/generate-openapi-types.sh`
- **Command**: `pnpm generate:types`
- **Output**: `packages/shared-types/v2-api.d.ts`
- **Source**: FastAPI `/openapi.json` endpoint

### 3. Typed API Client ✅

- **Package**: `@pinaka/api-client`
- **Library**: `openapi-fetch`
- **Location**: `packages/api-client/src/api-client.ts`
- **Features**:
  - Fully typed API calls
  - Authentication support
  - Type-safe request/response handling

### 4. Legacy Package Removal ✅

- ❌ Removed `packages/schemas/` (legacy Zod schemas)
- ✅ Updated build scripts to exclude legacy packages
- ✅ Updated dependencies in `apps/web-app`

### 5. Frontend Integration ✅

- Created `apps/web-app/lib/schemas/v2-types.ts` (compatibility layer)
- Created `apps/web-app/lib/api/v2-client-new.ts` (new typed client)
- Updated `apps/web-app/package.json` dependencies

## Usage

### Generate Types

```bash
# 1. Start FastAPI
cd apps/backend-api
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 2. Generate types (in another terminal)
pnpm generate:types
```

### Use Types in Code

```typescript
// Import types
import type { components } from "@pinaka/shared-types/v2-api";
type Property = components["schemas"]["Property"];

// Use typed client
import { api, authenticatedApi } from "@pinaka/api-client";
const { data, error } = await authenticatedApi.GET("/api/v2/properties");
```

## Build Process

```bash
# Full build (generates types, builds packages, builds apps)
pnpm build

# Individual steps
pnpm generate:types    # Generate types from FastAPI
pnpm build:packages    # Build packages
pnpm build:apps        # Build apps
```

## Migration Status

### ✅ Completed
- [x] OpenAPI type generation setup
- [x] Typed API client using openapi-fetch
- [x] Legacy schemas package removed
- [x] Build scripts updated
- [x] Package dependencies updated

### ⏳ Remaining (Manual)
- [ ] Update all frontend imports from `@pinaka/schemas` to `@pinaka/shared-types`
- [ ] Update React Query hooks to use new typed client
- [ ] Remove remaining Zod schema references (keep only for UI validation)
- [ ] Test end-to-end with FastAPI running

## Files Created/Modified

### Created
- `packages/shared-types/package.json`
- `packages/shared-types/README.md`
- `packages/api-client/src/api-client.ts`
- `packages/api-client/README.md`
- `apps/web-app/lib/schemas/v2-types.ts`
- `apps/web-app/lib/api/v2-client-new.ts`
- `scripts/generate-openapi-types.sh`
- `scripts/remove-legacy-schemas.sh`
- `scripts/setup-openapi-pipeline.sh`
- `docs/OPENAPI_TYPES_MIGRATION.md`
- `docs/OPENAPI_PIPELINE_SETUP.md`

### Modified
- `package.json` (build scripts, generate:types)
- `apps/web-app/package.json` (dependencies)
- `packages/api-client/package.json` (dependencies, scripts)

### Removed
- `packages/schemas/` (entire directory)

## Next Steps

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Generate Types** (requires FastAPI running):
   ```bash
   pnpm generate:types
   ```

3. **Update Frontend Code**:
   - Replace `@pinaka/schemas` imports with `@pinaka/shared-types`
   - Update API calls to use new typed client
   - Remove duplicate type definitions

4. **Test Build**:
   ```bash
   pnpm build
   ```

## Troubleshooting

### Types Not Generating

**Error**: `FastAPI server is not running`

**Solution**: Start FastAPI first:
```bash
cd apps/backend-api
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Import Errors

**Error**: `Cannot find module '@pinaka/shared-types'`

**Solution**: 
1. Run `pnpm install`
2. Make sure `packages/shared-types/v2-api.d.ts` exists
3. If missing, run `pnpm generate:types`

### Build Fails

**Error**: Package build errors

**Solution**: 
1. Check that dependencies are installed: `pnpm install`
2. Generate types first: `pnpm generate:types`
3. Build packages individually: `pnpm --filter @pinaka/shared-types build`

## Architecture

```
FastAPI (Pydantic) 
    ↓
/openapi.json
    ↓
openapi-typescript
    ↓
v2-api.d.ts (@pinaka/shared-types)
    ↓
openapi-fetch client (@pinaka/api-client)
    ↓
Frontend (Next.js)
```

**Single Source of Truth**: FastAPI Pydantic schemas → OpenAPI spec → TypeScript types

