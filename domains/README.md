# Domain-Driven Design Structure

## Architecture

Each domain follows a 4-layer architecture:

```
domains/{domain}/
├── domain/              # Pure domain logic
│   ├── {Entity}.ts      # Domain entities
│   ├── {ValueObject}.ts # Value objects
│   └── {Repository}.ts  # Repository interfaces
│
├── application/         # Application services (orchestration)
│   └── {Service}.ts     # Use cases / orchestration
│
├── interfaces/          # API controllers / GraphQL resolvers
│   └── {Controller}.ts  # DTO mappers, uses @pinaka/schemas
│
├── infrastructure/      # Adapters (DB, external APIs)
│   └── {Repository}.ts  # Implements domain repository interfaces
│
└── tests/              # Tests
    ├── {Entity}.test.ts # Unit tests (domain logic)
    └── {Service}.test.ts # Integration tests
```

## Rules

### Domain Layer
- ✅ Pure business logic
- ✅ No infrastructure dependencies
- ✅ No external libraries (except Zod for validation)
- ✅ Defines repository interfaces

### Application Layer
- ✅ Orchestrates domain logic
- ✅ Coordinates between domain and infrastructure
- ✅ No business logic (delegates to domain)

### Interfaces Layer
- ✅ API controllers / GraphQL resolvers
- ✅ Uses `@pinaka/schemas` for DTOs
- ✅ Maps between DTOs and domain entities

### Infrastructure Layer
- ✅ Implements repository interfaces from domain
- ✅ Database access (Prisma)
- ✅ External API clients

## Boundary Enforcement

Use `dependency-cruiser` to enforce boundaries:

```bash
npm run lint:boundaries
```

Rules:
- ❌ No cross-domain imports
- ❌ Domain cannot import from infrastructure/interfaces
- ✅ Application can import from domain
- ✅ Interfaces can import from application and domain
- ✅ Infrastructure implements domain interfaces

## Migration Guide

1. **Create domain folder structure**
2. **Move entities to domain/**
3. **Move services to application/**
4. **Move repositories to infrastructure/**
5. **Create controllers in interfaces/**
6. **Add tests in tests/**

