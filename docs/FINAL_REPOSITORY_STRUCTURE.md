# Final Repository Structure

**Monorepo with Single Source of Truth Schema Architecture**

---

## 📁 Complete Structure

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
│       │   └── ... (16 domains)
│       ├── src/
│       │   ├── index.ts              # Package exports
│       │   ├── generated-types.ts     # 🔄 Generated TypeScript types
│       │   └── generated-validators.ts # 🔄 Generated runtime validators
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
│   ├── schemas/                      # @pinaka/schemas (published internally)
│   │   └── src/                      # Types + Validators package
│   │       └── index.ts              # Re-exports from schema/types
│   │
│   ├── ui/                           # @pinaka/ui
│   │   ├── components/               # Shared React components
│   │   ├── hooks/                    # Shared React hooks
│   │   └── src/
│   │       └── index.ts
│   │
│   ├── domain-common/                # @pinaka/domain-common
│   │   └── src/                      # Shared domain utilities
│   │       └── index.ts
│   │
│   ├── api-client/                   # API client generation scripts
│   │   └── scripts/
│   │       └── generate-client.ts
│   │
│   ├── server-stubs/                 # Server stub generation scripts
│   │   └── scripts/
│   │       └── generate-stubs.ts
│   │
│   └── shared-utils/                 # @pinaka/shared-utils
│       └── src/                      # Shared utilities
│           ├── date-utils.ts
│           ├── validation-utils.ts
│           ├── api-utils.ts
│           └── format-utils.ts
│
├── apps/                             # 🚀 APPLICATIONS
│   ├── api-server/                   # @pinaka/api-server
│   │   ├── pages/                    # Next.js API routes
│   │   │   └── api/
│   │   │       └── v1/               # v1 API endpoints
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
│   │   │   └── Lease.ts
│   │   ├── application/              # Application services
│   │   │   └── LeaseService.ts
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
│   └── ... (more domains: property, tenant, maintenance, etc.)
│
├── ci/                               # 🔧 CI/CD CONFIGURATION
│   ├── schema-validation.yml         # Schema validation workflow
│   └── husky/                        # Git hooks
│       └── pre-commit                # Pre-commit validation
│
├── .gitignore
├── pnpm-workspace.yaml               # pnpm workspace configuration
├── package.json                       # Root package.json with workspace scripts
└── README.md                          # Main README
```

---

## 🎯 Key Directories Explained

### `/schema` - Canonical Source ⭐
- **Purpose**: Single source of truth for all API contracts
- **Contains**: 
  - `openapi.yaml` / `openapi.json` - OpenAPI specification
  - `graphql/schema.graphql` - GraphQL schema (future)
  - `types/registry.ts` - **ONLY place to define API contracts**
  - `types/domains/` - Domain Zod schemas
  - Generated types and validators

### `/packages` - Shared Packages 📦
- **generated/**: Auto-generated code (clients, types, stubs)
- **schemas/**: Published `@pinaka/schemas` package (types + validators)
- **ui/**: Shared UI components & hooks (`@pinaka/ui`)
- **domain-common/**: Shared domain utilities (`@pinaka/domain-common`)
- **shared-utils/**: Shared utilities (`@pinaka/shared-utils`)

### `/apps` - Applications 🚀
- **api-server/**: Next.js API server (`@pinaka/api-server`)
- **web-app/**: Next.js web application (`@pinaka/web-app`)

### `/domains` - Domain-Driven Design 🏛️
- Each domain has 4 layers:
  - **domain/**: Business logic & domain models
  - **application/**: Application services
  - **interfaces/**: API controllers
  - **infrastructure/**: Repositories & data access

### `/ci` - CI/CD 🔧
- GitHub Actions workflows
- Git hooks (Husky)
- Automated validation

---

## 🔄 Code Generation Flow

```
schema/types/registry.ts (⭐ SINGLE SOURCE OF TRUTH)
         │
         ├─→ Generate Types → schema/types/src/generated-types.ts
         ├─→ Generate Validators → schema/types/src/generated-validators.ts
         ├─→ Generate OpenAPI → schema/openapi.json
         ├─→ Generate Client → packages/generated/clients/api-client.ts
         └─→ Generate Stubs → packages/generated/stubs/
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
pnpm run dev          # Web app (port 3000)
pnpm run dev:api      # API server (port 3001)
```

---

## 🛡️ CI/CD Enforcement

### Pre-commit Hook
- Location: `ci/husky/pre-commit`
- Validates schema registry before commits

### GitHub Actions
- Location: `ci/schema-validation.yml`
- Validates on PR/push
- Checks contract compatibility

---

## ✅ Structure Compliance

- ✅ `/schema` - Canonical API schemas (OpenAPI, GraphQL, Zod validators)
- ✅ `/packages/generated` - Codegen outputs
- ✅ `/packages/schemas` - Published package (@pinaka/schemas)
- ✅ `/packages/ui` - Shared UI components & hooks
- ✅ `/packages/domain-common` - Shared domain utilities
- ✅ `/apps/api-server` - API server application
- ✅ `/apps/web-app` - Web application
- ✅ `/domains` - Domain-driven design structure
- ✅ `/ci` - CI/CD configuration
- ✅ `pnpm-workspace.yaml` - Workspace configuration
- ✅ Root `package.json` - Root scripts

---

**Repository structure matches the requested monorepo architecture!** 🎉

