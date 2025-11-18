# Lease Domain Tests

## Structure

- **Unit Tests**: Test domain logic in isolation (no DB, no network)
- **Integration Tests**: Test application services with mocked repositories
- **E2E Tests**: Test full flow through interfaces

## Running Tests

```bash
# Run all domain tests
npm run test:domain

# Run lease domain tests
npm run test -- domains/leases/tests
```

## Test Coverage

- ✅ Domain entity logic
- ✅ Business rules
- ✅ Domain exceptions
- ⚠️ Application service orchestration (integration tests)
- ⚠️ Repository implementation (integration tests)

