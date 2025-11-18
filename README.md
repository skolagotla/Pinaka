# Pinaka - Property Management Platform

**Monorepo Architecture with Single Source of Truth Schema**

---

## 🏗️ Repository Structure

```
/schema                       # ⭐ Canonical API schemas (Single Source of Truth)
  ├── openapi.yaml           # OpenAPI specification
  ├── openapi.json           # Generated OpenAPI spec
  ├── graphql/
  │   └── schema.graphql     # GraphQL schema (future)
  └── types/                 # Canonical runtime validators (Zod)
      ├── registry.ts        # Schema registry (ONLY place to define contracts)
      ├── domains/           # Domain schemas
      ├── generated-types.ts # Generated TypeScript types
      └── generated-validators.ts # Generated runtime validators

/packages
  ├── /generated             # Codegen outputs (clients/types/stubs)
  │   ├── clients/          # Generated API clients
  │   ├── types/            # Generated types
  │   └── stubs/            # Generated server stubs
  │
  ├── /schemas              # @pinaka/schemas (published internally)
  │   └── src/              # Types + Validators package
  │
  ├── /ui                   # @pinaka/ui (shared UI components & hooks)
  │   ├── components/       # Shared React components
  │   └── hooks/           # Shared React hooks
  │
  └── /domain-common        # @pinaka/domain-common (shared domain utilities)
      └── src/              # Common domain logic

/apps
  ├── /api-server           # @pinaka/api-server (Next.js API server)
  └── /web-app              # @pinaka/web-app (Next.js web application)

/domains                     # Domain-Driven Design structure
  ├── /leases
  │   ├── /domain          # Domain models & business logic
  │   ├── /application     # Application services
  │   ├── /interfaces      # API interfaces
  │   └── /infrastructure  # Repositories & data access
  │
  ├── /users
  │   ├── /domain
  │   ├── /application
  │   ├── /interfaces
  │   └── /infrastructure
  │
  └── ... (more domains)

/ci                          # CI/CD configuration
  ├── schema-validation.yml  # Schema validation workflow
  └── husky/                # Git hooks
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Install dependencies
pnpm install

# Generate schema artifacts
pnpm run generate:schema

# Validate schema
pnpm run validate:schema

# Start development
pnpm run dev              # Web app (port 3000) - runs from apps/web-app
pnpm run dev:api         # API server (port 3001) - runs from apps/api-server

# Or run individually
pnpm --filter @pinaka/web-app dev
pnpm --filter @pinaka/api-server dev
```

---

## 📦 Packages

### @pinaka/schema-types
**Canonical schema types and validators** - Single Source of Truth
- Location: `schema/types/`
- Contains: Schema registry, generated types, validators, OpenAPI generation

### @pinaka/schemas
**Published package: Types + Validators**
- Location: `packages/schemas/`
- Published internally for use across monorepo

### @pinaka/generated
**Codegen outputs** - Auto-generated, do not edit
- Location: `packages/generated/`
- Contains: API clients, server stubs, generated types

### @pinaka/ui
**Shared UI components & hooks**
- Location: `packages/ui/`
- Contains: React components and hooks

### @pinaka/domain-common
**Shared domain utilities**
- Location: `packages/domain-common/`
- Contains: Common domain logic

### @pinaka/api-server
**API Server application**
- Location: `apps/api-server/`
- Next.js API server

### @pinaka/web-app
**Web Application**
- Location: `apps/web-app/`
- Next.js web application

---

## 🔄 Code Generation

### Generate Schema Artifacts

```bash
# Generate all schema artifacts (types, validators, OpenAPI)
pnpm run generate:schema

# Or individually
cd schema/types
npm run generate:types
npm run generate:validators
npm run generate:openapi
```

### Generate Client & Stubs

```bash
# Generate API client and server stubs
pnpm run generate:all
```

---

## 🛡️ CI/CD

### Pre-commit Hook
- Validates schema registry before commits
- Location: `ci/husky/pre-commit`

### GitHub Actions
- Schema validation on PR/push
- Contract compatibility checks
- Location: `ci/schema-validation.yml`

---

## 📚 Documentation

- `docs/COMPLETE_SCHEMA_ARCHITECTURE.md` - Complete architecture overview
- `docs/MONOREPO_ARCHITECTURE.md` - Monorepo structure details
- `docs/SCHEMA_PACKAGE_ARCHITECTURE.md` - Schema package details
- `schema/types/README.md` - Schema types documentation

---

## 🎯 Key Principles

1. **Single Source of Truth**: `schema/types/registry.ts` is the ONLY place to define API contracts
2. **Code Generation**: All types, clients, and stubs are generated from schema
3. **Domain-Driven Design**: Code organized by business domains
4. **Shared Packages**: Duplicated code consolidated into shared packages
5. **CI/CD Enforcement**: Automated validation and contract checks

---

## 📝 Adding a New Domain

1. **Add to schema registry:**
   ```typescript
   // schema/types/registry.ts
   'my-domain': { ... }
   ```

2. **Create domain structure:**
   ```bash
   mkdir -p domains/my-domain/{domain,application,interfaces,infrastructure}
   ```

3. **Regenerate artifacts:**
   ```bash
   pnpm run generate:all
   ```

4. **Validate:**
   ```bash
   pnpm run validate:schema
   ```

---

## 🔧 Development

### Build All Packages

```bash
pnpm run build:packages
```

### Build All Apps

```bash
pnpm run build:apps
```

### Clean

```bash
pnpm run clean
```

---

## 📄 License

ISC

---

**Built with ❤️ using Domain-Driven Design, API-First, and Single Source of Truth principles**
