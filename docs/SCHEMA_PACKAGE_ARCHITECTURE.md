# Schema Package Architecture

**Single Source of Truth with Code Generation and CI Enforcement**

---

## 🎯 Overview

The `@pinaka/schema` package is the **single canonical source** for all API contracts, types, and validators. It provides:

1. **Schema Registry** - Canonical source (`src/registry.ts`)
2. **Generated Types** - TypeScript types (`src/generated-types.ts`)
3. **Generated Validators** - Runtime validators (`src/generated-validators.ts`)
4. **OpenAPI Spec** - Complete API documentation (`openapi.json`)
5. **CI/CD Enforcement** - Automated validation and contract checks

---

## 📁 Package Structure

```
packages/schema/
├── src/
│   ├── registry.ts              # ⭐ Canonical source (ONLY place to define contracts)
│   ├── generated-types.ts       # 🔄 Generated TypeScript types
│   ├── generated-validators.ts  # 🔄 Generated runtime validators
│   └── index.ts                 # Package exports
│
├── scripts/
│   ├── generate-openapi.ts      # OpenAPI generation
│   ├── generate-types.ts        # Type generation
│   ├── generate-validators.ts   # Validator generation
│   └── validate-schema.ts      # Registry validation
│
├── openapi.json                 # 🔄 Generated OpenAPI 3.0 spec
├── package.json                 # Package configuration
├── tsconfig.json                # TypeScript config
└── README.md                    # Package documentation
```

---

## 🔄 Code Generation Flow

```
┌─────────────────────────────┐
│  Schema Registry            │
│  (src/registry.ts)          │
│  ⭐ SINGLE SOURCE OF TRUTH  │
└──────────────┬──────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌──────────────┐  ┌──────────────┐
│  Generate    │  │  Generate    │
│   Types      │  │  Validators  │
└──────┬───────┘  └──────┬───────┘
       │                │
       ▼                ▼
┌──────────────┐  ┌──────────────┐
│ generated-   │  │ generated-   │
│ types.ts     │  │ validators.ts│
└──────┬───────┘  └──────┬───────┘
       │                │
       └────────┬───────┘
                │
                ▼
         ┌──────────────┐
         │   OpenAPI    │
         │   Spec       │
         └──────────────┘
```

---

## 🚀 Usage

### Install Package

```bash
npm install @pinaka/schema
```

### Use Types

```typescript
import { PropertyCreate, TenantCreate } from '@pinaka/schema';

const property: PropertyCreate = {
  landlordId: 'c123...',
  addressLine1: '123 Main St',
  city: 'Toronto',
  postalZip: 'M5H 2N2',
};
```

### Use Validators

```typescript
import { validatePropertyCreate } from '@pinaka/schema';

const result = validatePropertyCreate(data);
if (result.success) {
  const property = result.data; // Type-safe!
} else {
  console.error(result.error); // Validation errors
}
```

### Use OpenAPI Spec

```typescript
import openapiSpec from '@pinaka/schema/openapi.json';

// Use with Swagger UI, API documentation tools, code generators, etc.
```

---

## 🔧 Development

### Generate All Artifacts

```bash
cd packages/schema
npm run generate:all
```

This generates:
- TypeScript types
- Runtime validators
- OpenAPI specification

### Validate Registry

```bash
cd packages/schema
npm run validate
```

### Build Package

```bash
cd packages/schema
npm run build
```

---

## 🛡️ CI/CD Enforcement

### Pre-commit Hook

The `.husky/pre-commit` hook validates the schema registry before allowing commits:

```bash
# Automatically runs on git commit
🔍 Validating schema registry...
✅ Schema validation passed
```

### GitHub Actions

The `.github/workflows/schema-validation.yml` workflow:

1. **Validates schema registry** on PR and push
2. **Generates artifacts** and checks for changes
3. **Type checks** the generated code
4. **Validates OpenAPI spec** structure
5. **Detects breaking changes** (TODO)

### Contract Checks

- ✅ Schema integrity validation
- ✅ Generated files sync check
- ✅ TypeScript compilation
- ✅ OpenAPI spec validity
- ⏳ Breaking change detection (coming soon)

---

## 📦 Versioning

The schema package follows semantic versioning:

- **Major (1.0.0)**: Breaking API changes
- **Minor (1.1.0)**: New domains or non-breaking changes
- **Patch (1.0.1)**: Bug fixes

Version is defined in:
- `packages/schema/package.json`
- `packages/schema/src/registry.ts` (`SCHEMA_VERSION`)

---

## 🎓 Adding a New Domain

1. **Create schema file:**
   ```typescript
   // lib/schemas/domains/my-domain.schema.ts
   export const myDomainCreateSchema = z.object({ ... });
   ```

2. **Add to registry:**
   ```typescript
   // packages/schema/src/registry.ts
   'my-domains': {
     domain: 'my-domain',
     version: '1.0.0',
     schemas: {
       create: myDomainSchemas.myDomainCreateSchema,
       // ...
     },
     apiPath: '/api/v1/my-domains',
     methods: ['GET', 'POST', 'PATCH', 'DELETE'],
     tags: ['My Domains'],
     description: 'My domain operations',
   },
   ```

3. **Regenerate artifacts:**
   ```bash
   cd packages/schema
   npm run generate:all
   ```

4. **Validate:**
   ```bash
   npm run validate
   ```

5. **Commit changes:**
   ```bash
   git add .
   git commit -m "Add my-domain to schema registry"
   # Pre-commit hook will validate automatically
   ```

---

## 🔒 Enforcement Policies

### Pre-merge Policies

1. **Schema validation must pass**
2. **Generated files must be in sync**
3. **TypeScript must compile**
4. **OpenAPI spec must be valid**
5. **No breaking changes** (without major version bump)

### Contract Checks

- ✅ All domains must have complete schemas
- ✅ All API paths must be valid
- ✅ All methods must be supported
- ✅ Generated code must match registry
- ✅ OpenAPI spec must be valid JSON

---

## 📚 Related Documentation

- `docs/CANONICAL_SCHEMA_ARCHITECTURE.md` - Architecture overview
- `docs/CANONICAL_SCHEMA_COMPLETE.md` - Implementation status
- `packages/schema/README.md` - Package documentation

---

## 🎉 Benefits

### ✅ Single Source of Truth
- One registry defines all contracts
- Change once, regenerate everywhere
- No duplicate definitions

### ✅ Type Safety
- Types generated from schemas
- Runtime validation available
- Compile-time and runtime checks

### ✅ CI/CD Enforcement
- Automated validation
- Pre-commit checks
- Contract compatibility checks
- Breaking change detection

### ✅ Versioning
- Semantic versioning
- Version tracking
- Change history

### ✅ Developer Experience
- Autocomplete works perfectly
- Clear validation errors
- Easy to add new domains
- Automated code generation

---

**The schema package is the foundation for all API contracts in the Pinaka system.** 🚀

