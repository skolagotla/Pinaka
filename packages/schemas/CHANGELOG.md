# Changelog

All notable changes to the `@pinaka/schemas` package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial schema package release
- Domain schemas for all 20+ domains
- Zod validators for all domain types
- TypeScript types generated from schemas

### Changed
- Schema registry as single source of truth
- All types generated from canonical schema

## [1.0.0] - 2025-11-17

### Added
- Initial release
- Property domain schemas
- Tenant domain schemas
- Lease domain schemas
- Rent Payment domain schemas
- Maintenance domain schemas
- Document domain schemas
- Expense domain schemas
- Inspection domain schemas
- Vendor/Service Provider domain schemas
- Conversation domain schemas
- Application domain schemas
- Notification domain schemas
- Task domain schemas
- Invitation domain schemas
- Generated Form domain schemas
- Unit domain schemas
- Form Generation domain schemas
- Signature domain schemas
- Tenant Rent Data domain schemas
- Analytics domain schemas

---

## Versioning Strategy

### Semantic Versioning

- **MAJOR** version: Breaking changes to schema contracts (removing fields, changing types)
- **MINOR** version: Non-breaking additions (new fields, new endpoints, new domains)
- **PATCH** version: Bug fixes, documentation updates, internal improvements

### Breaking Changes

Breaking changes require:
1. Schema PR with explicit breaking change notice
2. Migration guide in CHANGELOG
3. Version bump to next major version
4. Deprecation period for removed fields (if applicable)

### Schema Change Process

1. **Propose Change**: Create PR with schema changes
2. **Review**: Schema changes require explicit approval
3. **Generate**: Run `pnpm run schema:generate` to update generated artifacts
4. **Version**: Bump version in `packages/schemas/package.json`
5. **Changelog**: Document changes in this CHANGELOG.md
6. **Merge**: After approval and CI passes

---

## Links

- [Schema Registry](../../schema/types/registry.ts) - Single source of truth
- [OpenAPI Spec](../../schema/openapi.yaml) - API contract specification
- [GraphQL Schema](../../schema/graphql/schema.graphql) - GraphQL schema

