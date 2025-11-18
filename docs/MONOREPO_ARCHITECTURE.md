# Monorepo Architecture with Schema Package

**Single Source of Truth with Code Generation and CI Enforcement**

---

## 🎯 Overview

The Pinaka codebase now uses a **monorepo architecture** with a **schema package** as the single source of truth. All types, validators, API clients, and server stubs are generated from this canonical source.

---

## 📦 Package Structure

```
packages/
├── schema/                    # ⭐ Single Source of Truth
│   ├── src/
│   │   ├── registry.ts        # Canonical schema registry
│   │   ├── generated-types.ts # Generated TypeScript types
│   │   ├── generated-validators.ts # Generated runtime validators
│   │   └── index.ts           # Package exports
│   ├── scripts/
│   │   ├── generate-openapi.ts
│   │   ├── generate-types.ts
│   │   ├── generate-validators.ts
│   │   └── validate-schema.ts
│   └── openapi.json           # Generated OpenAPI 3.0 spec
│
├── api-client/                # 🔄 Generated API Client
│   ├── src/
│   │   ├── generated-client.ts # Generated from schema
│   │   └── index.ts
│   └── scripts/
│       └── generate-client.ts
│
├── server-stubs/              # 🔄 Generated Server Stubs
│   ├── src/
│   │   └── generated-stubs/   # Generated handler stubs
│   └── scripts/
│       └── generate-stubs.ts
│
└── shared-utils/              # 📚 Shared Utilities
    └── src/
        ├── date-utils.ts
        ├── validation-utils.ts
        ├── api-utils.ts
        └── format-utils.ts
```

---

## 🔄 Code Generation Flow

```
┌─────────────────────────────┐
│  @pinaka/schema              │
│  (packages/schema/)          │
│  ⭐ SINGLE SOURCE OF TRUTH  │
└──────────────┬──────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌──────────────┐  ┌──────────────┐
│  Generate    │  │  Generate    │
│  API Client  │  │ Server Stubs │
└──────┬───────┘  └──────┬───────┘
       │                │
       ▼                ▼
┌──────────────┐  ┌──────────────┐
│ @pinaka/     │  │ @pinaka/     │
│ api-client   │  │ server-stubs │
└──────────────┘  └──────────────┘
```

---

## 🚀 Usage

### Install Packages

```bash
# Install all packages (workspace)
npm install

# Or install individually
npm install @pinaka/schema
npm install @pinaka/api-client
npm install @pinaka/server-stubs
npm install @pinaka/shared-utils
```

### Use Schema Package

```typescript
import { PropertyCreate, validatePropertyCreate } from '@pinaka/schema';

// Type-safe types
const property: PropertyCreate = { ... };

// Runtime validation
const result = validatePropertyCreate(data);
```

### Use API Client

```typescript
import { v1Api } from '@pinaka/api-client';

const property = await v1Api.properties.create({ ... });
```

### Use Server Stubs

```typescript
import { serverStubs } from '@pinaka/server-stubs';

// Use generated handler stubs
export default serverStubs.properties;
```

### Use Shared Utils

```typescript
import { formatDateDisplay, formatCurrency } from '@pinaka/shared-utils';

const date = formatDateDisplay(new Date());
const amount = formatCurrency(1234.56);
```

---

## 🔧 Development

### Generate All Artifacts

```bash
# Generate schema artifacts
npm run schema:generate

# Generate API client
cd packages/api-client && npm run generate:client

# Generate server stubs
cd packages/server-stubs && npm run generate:stubs
```

### Validate Schema

```bash
npm run schema:validate
```

### Build All Packages

```bash
npm run build:packages
```

---

## 🛡️ CI/CD Enforcement

### Pre-commit Hook

Validates schema registry before allowing commits:

```bash
🔍 Validating schema registry...
✅ Schema validation passed
```

### GitHub Actions

The `.github/workflows/schema-validation.yml` workflow:

1. ✅ Validates schema registry
2. ✅ Generates artifacts
3. ✅ Checks for sync issues
4. ✅ Type checks generated code
5. ✅ Validates OpenAPI spec
6. ⏳ Detects breaking changes

---

## 📝 Adding a New Domain

1. **Add to schema registry:**
   ```typescript
   // packages/schema/src/registry.ts
   'my-domains': { ... }
   ```

2. **Regenerate all artifacts:**
   ```bash
   npm run schema:generate
   cd packages/api-client && npm run generate:client
   cd packages/server-stubs && npm run generate:stubs
   ```

3. **Validate:**
   ```bash
   npm run schema:validate
   ```

4. **Commit:**
   ```bash
   git add .
   git commit -m "Add my-domain to schema registry"
   # Pre-commit hook validates automatically
   ```

---

## 🎉 Benefits

### ✅ Single Source of Truth
- One schema package defines all contracts
- Change once, regenerate everywhere
- No duplicate definitions

### ✅ Type Safety
- Types generated from schemas
- Runtime validation available
- Compile-time and runtime checks

### ✅ Code Generation
- API client auto-generated
- Server stubs auto-generated
- No manual maintenance

### ✅ CI/CD Enforcement
- Automated validation
- Pre-commit checks
- Contract compatibility checks
- Breaking change detection

### ✅ Shared Utilities
- Duplicated code consolidated
- Versioned packages
- Easy to maintain

---

## 📚 Related Documentation

- `docs/SCHEMA_PACKAGE_ARCHITECTURE.md` - Schema package details
- `docs/CANONICAL_SCHEMA_ARCHITECTURE.md` - Architecture overview
- `packages/schema/README.md` - Schema package docs

---

**The monorepo architecture provides a solid foundation for scalable, maintainable code.** 🚀

