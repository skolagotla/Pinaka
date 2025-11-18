# Repository Structure

**Final Monorepo Structure - Single Source of Truth Architecture**

---

## 📁 Complete Directory Structure

```
pinaka/
├── schema/                          # ⭐ CANONICAL API SCHEMAS
│   ├── openapi.yaml                 # OpenAPI spec reference
│   ├── openapi.json                 # Generated OpenAPI 3.0 spec
│   ├── graphql/
│   │   └── schema.graphql           # GraphQL schema (future)
│   └── types/                       # Canonical runtime validators (Zod)
│       ├── registry.ts               # ⭐ SINGLE SOURCE OF TRUTH
│       ├── base.ts                   # Common schemas
│       ├── domains/                  # Domain schemas
│       │   ├── property.schema.ts
│       │   ├── tenant.schema.ts
│       │   └── ...
│       ├── generated-types.ts        # 🔄 Generated TypeScript types
│       ├── generated-validators.ts   # 🔄 Generated runtime validators
│       ├── scripts/                  # Generation scripts
│       │   ├── generate-openapi.ts
│       │   ├── generate-types.ts
│       │   ├── generate-validators.ts
│       │   └── validate-schema.ts
│       ├── package.json
│       └── tsconfig.json
│
├── packages/                         # 📦 SHARED PACKAGES
│   ├── generated/                    # 🔄 Codegen outputs (do not edit)
│   │   ├── clients/                  # Generated API clients
│   │   ├── types/                    # Generated types
│   │   └── stubs/                    # Generated server stubs
│   │
│   ├── schemas/                      # @pinaka/schemas (published)
│   │   └── src/                      # Types + Validators package
│   │
│   ├── ui/                           # @pinaka/ui
│   │   ├── components/               # Shared React components
│   │   ├── hooks/                    # Shared React hooks
│   │   └── src/
│   │
│   ├── domain-common/                # @pinaka/domain-common
│   │   └── src/                      # Shared domain utilities
│   │
│   ├── api-client/                   # API client generation scripts
│   │   └── scripts/
│   │
│   ├── server-stubs/                 # Server stub generation scripts
│   │   └── scripts/
│   │
│   └── shared-utils/                # @pinaka/shared-utils
│       └── src/                      # Shared utilities
│
├── apps/                             # 🚀 APPLICATIONS
│   ├── api-server/                   # @pinaka/api-server
│   │   ├── pages/                    # Next.js API routes
│   │   ├── lib/                      # Server-side libraries
│   │   └── package.json
│   │
│   └── web-app/                      # @pinaka/web-app
│       ├── app/                      # Next.js app directory
│       ├── components/               # Application components
│       ├── lib/                      # Client-side libraries
│       └── package.json
│
├── domains/                          # 🏛️ DOMAIN-DRIVEN DESIGN
│   ├── leases/
│   │   ├── domain/                   # Domain models & business logic
│   │   │   ├── Lease.ts
│   │   │   └── LeaseService.ts
│   │   ├── application/              # Application services
│   │   │   └── LeaseApplicationService.ts
│   │   ├── interfaces/               # API interfaces
│   │   │   └── LeaseController.ts
│   │   └── infrastructure/           # Repositories & data access
│   │       └── LeaseRepository.ts
│   │
│   ├── users/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── interfaces/
│   │   └── infrastructure/
│   │
│   └── ... (more domains)
│
├── ci/                               # 🔧 CI/CD CONFIGURATION
│   ├── schema-validation.yml         # Schema validation workflow
│   └── husky/                        # Git hooks
│       └── pre-commit                # Pre-commit validation
│
├── .gitignore
├── pnpm-workspace.yaml               # pnpm workspace configuration
├── package.json                       # Root package.json with workspace scripts
└── README.md                          # This file
```

---

## 🎯 Key Directories

### `/schema` - Canonical Source
- **Purpose**: Single source of truth for all API contracts
- **Contains**: OpenAPI spec, GraphQL schema, Zod validators
- **Key File**: `schema/types/registry.ts` - ONLY place to define contracts

### `/packages` - Shared Packages
- **generated/**: Auto-generated code (do not edit)
- **schemas/**: Published types + validators package
- **ui/**: Shared UI components & hooks
- **domain-common/**: Shared domain utilities

### `/apps` - Applications
- **api-server/**: Next.js API server
- **web-app/**: Next.js web application

### `/domains` - Domain-Driven Design
- Each domain has: `domain/`, `application/`, `interfaces/`, `infrastructure/`
- Clear separation of concerns
- Business logic isolated from infrastructure

### `/ci` - CI/CD
- GitHub Actions workflows
- Git hooks (Husky)
- Automated validation

---

## 🔄 Code Flow

```
schema/types/registry.ts (Single Source of Truth)
         │
         ├─→ Generate → schema/types/generated-types.ts
         ├─→ Generate → schema/types/generated-validators.ts
         ├─→ Generate → schema/openapi.json
         ├─→ Generate → packages/generated/clients/api-client.ts
         └─→ Generate → packages/generated/stubs/
```

---

## 📦 Package Dependencies

```
@pinaka/schemas
  └─→ @pinaka/schema-types (workspace)

@pinaka/generated
  └─→ Generated from @pinaka/schema-types

@pinaka/ui
  └─→ @pinaka/schemas

@pinaka/domain-common
  └─→ @pinaka/schemas
  └─→ @pinaka/shared-utils

@pinaka/api-server
  └─→ @pinaka/schemas
  └─→ @pinaka/generated
  └─→ @pinaka/domain-common

@pinaka/web-app
  └─→ @pinaka/schemas
  └─→ @pinaka/generated
  └─→ @pinaka/ui
  └─→ @pinaka/domain-common
```

---

## 🚀 Usage

### Install Dependencies

```bash
pnpm install
```

### Generate Schema Artifacts

```bash
pnpm run generate:schema
```

### Validate Schema

```bash
pnpm run validate:schema
```

### Start Development

```bash
pnpm run dev          # Web app
pnpm run dev:api      # API server
```

---

## 🎉 Benefits

### ✅ Single Source of Truth
- One schema registry defines all contracts
- Change once, regenerate everywhere

### ✅ Code Generation
- Types, validators, clients, stubs all generated
- No manual maintenance

### ✅ Domain-Driven Design
- Clear domain boundaries
- Business logic separated from infrastructure

### ✅ Shared Packages
- Duplicated code consolidated
- Versioned packages
- Easy to maintain

### ✅ CI/CD Enforcement
- Automated validation
- Contract compatibility checks
- Pre-commit hooks

---

**This structure provides a scalable, maintainable foundation for the Pinaka platform.** 🚀

