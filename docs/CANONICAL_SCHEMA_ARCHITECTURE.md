# Canonical Schema Architecture

**Status:** ✅ Implementation Complete  
**Date:** November 2025

---

## Overview

This document describes the **Canonical Schema Architecture** - a single source of truth for all API contracts, types, and domain schemas. This architecture eliminates code duplication and ensures consistency across frontend and backend.

## Problem Statement

Previously, the codebase had:
- ✅ Zod schemas defined (good foundation)
- ❌ Types manually imported in API clients (not generated)
- ❌ Duplicate API client implementations (`api-client.js`, `useUnifiedApi.js`, `v1-client.ts`)
- ❌ No OpenAPI/Swagger generation
- ❌ Manual type definitions scattered across files
- ❌ No code generation pipeline

## Solution: Canonical Schema Registry

### Architecture

```
lib/schemas/
├── registry.ts              # ⭐ Canonical Schema Registry (Single Source of Truth)
├── base.ts                  # Common schemas
├── index.ts                 # Central exports
├── generated-types.ts       # 🔄 Auto-generated TypeScript types
└── domains/
    ├── property.schema.ts   # Domain schemas
    ├── tenant.schema.ts
    └── ...
```

### Key Components

#### 1. Schema Registry (`lib/schemas/registry.ts`)

The **canonical registry** defines all domains, their API paths, schema names, and methods in one place:

```typescript
export const schemaRegistry: Record<string, DomainSchemaDefinition> = {
  properties: {
    domain: 'property',
    path: '/api/v1/properties',
    schemaNames: {
      create: 'propertyCreateSchema',
      update: 'propertyUpdateSchema',
      query: 'propertyQuerySchema',
      response: 'propertyResponseSchema',
      listResponse: 'propertyListResponseSchema',
    },
    apiPath: '/api/v1/properties',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
  // ... more domains
};
```

**Benefits:**
- Single source of truth for all API contracts
- Enables code generation
- Easy to add new domains
- Type-safe metadata

#### 2. Code Generation Pipeline

Three generation scripts create code from the registry:

##### a. Type Generation (`scripts/generate-types.ts`)

Generates consolidated TypeScript types from all domain schemas:

```bash
npm run generate:types
```

**Output:** `lib/schemas/generated-types.ts`

```typescript
// Auto-generated
export type PropertyCreate = z.infer<typeof propertySchemas.propertyCreateSchema>;
export type PropertyUpdate = z.infer<typeof propertySchemas.propertyUpdateSchema>;
// ... all domain types
```

##### b. API Client Generation (`scripts/generate-api-client.ts`)

Generates type-safe API client from registry:

```bash
npm run generate:api-client
```

**Output:** `lib/api/v1-client.generated.ts`

```typescript
// Auto-generated
export const v1Api = {
  properties: new ApiResource<PropertyCreate, PropertyUpdate, ...>('properties'),
  tenants: new ApiResource<TenantCreate, TenantUpdate, ...>('tenants'),
  // ... all domains
};
```

##### c. OpenAPI Generation (`scripts/generate-openapi.ts`)

Generates OpenAPI 3.0 specification:

```bash
npm run generate:openapi
```

**Output:** `docs/openapi.json`

**Features:**
- All CRUD endpoints documented
- Specialized endpoints included
- Schema references
- Type-safe documentation

#### 3. Generate All

Run all generators at once:

```bash
npm run generate:all
```

## Usage

### In API Routes (Backend)

```typescript
import { propertyCreateSchema, PropertyCreate } from '@/lib/schemas';

// Validate request body
const validatedData = propertyCreateSchema.parse(req.body);
// TypeScript knows the type is PropertyCreate

// Use validated data
const property = await propertyService.create(validatedData);
```

### In Components (Frontend)

```typescript
import { PropertyCreate, propertyCreateSchema } from '@/lib/schemas';
import { v1Api } from '@/lib/api/v1-client.generated';

// Type-safe form handling
const [formData, setFormData] = useState<PropertyCreate>({
  landlordId: '...',
  addressLine1: '',
  // TypeScript autocomplete works!
});

// Type-safe API call
const property = await v1Api.properties.create(formData);
```

## Benefits

### 1. **Single Source of Truth**
- One registry defines all domains
- Change once, regenerate everywhere
- No duplicate definitions

### 2. **Type Safety**
- Types generated from schemas
- Frontend and backend share same types
- Compile-time error checking

### 3. **Code Generation**
- API client auto-generated
- Types auto-generated
- OpenAPI spec auto-generated
- No manual maintenance

### 4. **Consistency**
- Same validation rules everywhere
- Same types everywhere
- Same API contracts everywhere

### 5. **Developer Experience**
- Autocomplete works perfectly
- Type checking catches errors early
- Clear API documentation

## Adding a New Domain

1. **Create schema file:**
   ```typescript
   // lib/schemas/domains/my-domain.schema.ts
   export const myDomainCreateSchema = z.object({ ... });
   export const myDomainUpdateSchema = z.object({ ... });
   // ... other schemas
   ```

2. **Add to registry:**
   ```typescript
   // lib/schemas/registry.ts
   'my-domains': {
     domain: 'my-domain',
     path: '/api/v1/my-domains',
     schemaNames: {
       create: 'myDomainCreateSchema',
       update: 'myDomainUpdateSchema',
       // ...
     },
     apiPath: '/api/v1/my-domains',
     methods: ['GET', 'POST', 'PATCH', 'DELETE'],
   },
   ```

3. **Regenerate code:**
   ```bash
   npm run generate:all
   ```

4. **Use generated code:**
   ```typescript
   import { MyDomainCreate } from '@/lib/schemas';
   import { v1Api } from '@/lib/api/v1-client.generated';
   
   const item = await v1Api.myDomains.create({ ... });
   ```

## Migration Plan

### Phase 1: ✅ Foundation (Complete)
- [x] Create canonical schema registry
- [x] Create type generation script
- [x] Create API client generation script
- [x] Create OpenAPI generation script
- [x] Add npm scripts

### Phase 2: 🔄 Consolidation (In Progress)
- [ ] Run generation scripts
- [ ] Replace manual `v1-client.ts` with generated version
- [ ] Update imports to use generated types
- [ ] Remove duplicate type definitions

### Phase 3: 🎯 Cleanup (Pending)
- [ ] Consolidate duplicate API client code
- [ ] Remove `useUnifiedApi.js` (if redundant)
- [ ] Update all components to use generated client
- [ ] Remove manual type definitions

### Phase 4: 📚 Documentation (Pending)
- [ ] Update API documentation
- [ ] Create developer guide
- [ ] Document code generation process

## File Structure

```
lib/
├── schemas/
│   ├── registry.ts              # ⭐ Canonical registry
│   ├── generated-types.ts       # 🔄 Generated types
│   ├── base.ts                  # Common schemas
│   ├── index.ts                 # Central exports
│   └── domains/                 # Domain schemas
│       ├── property.schema.ts
│       └── ...
│
├── api/
│   ├── v1-client.ts             # ⚠️ Manual (to be replaced)
│   └── v1-client.generated.ts  # 🔄 Generated (new)
│
scripts/
├── generate-types.ts            # Type generation
├── generate-api-client.ts       # Client generation
└── generate-openapi.ts          # OpenAPI generation

docs/
└── openapi.json                 # 🔄 Generated OpenAPI spec
```

## Next Steps

1. **Run generation:**
   ```bash
   npm run generate:all
   ```

2. **Review generated files:**
   - Check `lib/schemas/generated-types.ts`
   - Check `lib/api/v1-client.generated.ts`
   - Check `docs/openapi.json`

3. **Migrate to generated code:**
   - Replace imports from manual `v1-client.ts` to `v1-client.generated.ts`
   - Use generated types from `generated-types.ts`

4. **Remove duplicates:**
   - Remove manual type definitions
   - Consolidate API client code

## Conclusion

The Canonical Schema Architecture provides:
- ✅ Single source of truth
- ✅ Code generation
- ✅ Type safety
- ✅ Consistency
- ✅ Maintainability

This eliminates code duplication and ensures all API contracts, types, and clients are generated from one canonical source.

