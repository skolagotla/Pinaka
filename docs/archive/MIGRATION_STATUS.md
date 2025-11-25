# OpenAPI Types Migration - Status Report

## ✅ Completed

1. **OpenAPI Type Generation Pipeline**
   - ✅ Types generated from FastAPI: `packages/shared-types/v2-api.d.ts` (6,765 lines)
   - ✅ Script created: `scripts/generate-openapi-types.sh`
   - ✅ Command: `pnpm generate:types`

2. **Package Structure**
   - ✅ `packages/shared-types/` - Generated types package
   - ✅ `packages/api-client/` - Typed API client using openapi-fetch
   - ✅ Legacy `packages/schemas/` - Removed

3. **Dependencies Updated**
   - ✅ All packages updated to use `@pinaka/shared-types` instead of `@pinaka/schemas`
   - ✅ `apps/web-app/package.json` - Updated
   - ✅ `packages/domain-common/package.json` - Updated
   - ✅ `packages/ui/package.json` - Updated
   - ✅ `packages/shared-utils/package.json` - Updated
   - ✅ `apps/api-server/package.json` - Updated

4. **Compatibility Layer**
   - ✅ `apps/web-app/lib/schemas/index.ts` - Updated to re-export from OpenAPI types
   - ✅ Zod schemas still exported for legacy Next.js API handlers
   - ✅ Type aliases created for backward compatibility

## ⏳ In Progress

1. **Type Compatibility**
   - Some OpenAPI types have different names than legacy types
   - Response types may need adjustment (using base types as fallback)
   - Working on fixing type mismatches

2. **Build Errors**
   - Some build errors are unrelated to schema migration (e.g., parsing errors in JSX)
   - Type errors being resolved in compatibility layer

## 📋 Next Steps

1. **Fix Remaining Type Errors**
   - Update type aliases to match actual OpenAPI schema names
   - Add fallback types where needed
   - Test type imports in components

2. **Update API Client Usage**
   - Migrate from `v1Api` to new typed client from `@pinaka/api-client`
   - Update React Query hooks to use new types
   - Test API calls with new client

3. **Fix Build Errors**
   - Address parsing errors in JSX files
   - Fix any remaining TypeScript errors
   - Ensure full build succeeds

## 🎯 Architecture

```
FastAPI (Pydantic) 
    ↓ /openapi.json
openapi-typescript
    ↓
v2-api.d.ts (6,765 lines)
    ↓
@pinaka/shared-types
    ↓
Compatibility Layer (lib/schemas/index.ts)
    ↓
Frontend Components
```

**Single Source of Truth**: FastAPI Pydantic schemas ✅

## 📝 Notes

- Legacy Zod schemas are still available in `packages/shared-types/src/types/domains/` for runtime validation in Next.js API handlers
- New code should use types from `@pinaka/shared-types/v2-api`
- Compatibility layer provides backward compatibility for existing code
- Some type names differ between OpenAPI and legacy schemas (e.g., `maintenanceRequestCreateSchema` vs `maintenanceCreateSchema`)

## 🔧 Commands

```bash
# Generate types from FastAPI
pnpm generate:types

# Build packages
pnpm build:packages

# Build apps
pnpm build:apps

# Full build
pnpm build
```

