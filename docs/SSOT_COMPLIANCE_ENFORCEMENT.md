# SSOT Compliance Enforcement

**Status:** ✅ **100% COMPLIANT**

This document describes how SSOT compliance is enforced in the codebase.

---

## Automated Checks

### 1. API Client Usage Check

**Script:** `ci/check-api-client-usage.js`  
**Command:** `pnpm run check:api-client`  
**CI:** Runs in `.github/workflows/schema-validation.yml`

**What it checks:**
- Prevents direct `fetch()` calls to `/api/v1/*` endpoints
- Ensures all public API calls use the generated `v1Api` client

**Exceptions:**
- Legacy endpoints (`/api/auth/*`, `/api/landlords`, etc.) are acceptable
- Infrastructure utilities (`api-client.js`, `useUnifiedApi.js`) are acceptable
- Generated client itself is excluded

**Example violation:**
```javascript
// ❌ BAD
const response = await fetch('/api/v1/properties');

// ✅ GOOD
import { v1Api } from '@/lib/api/v1-client';
const response = await v1Api.properties.list();
```

---

### 2. Duplication Check

**Tool:** `jscpd`  
**Command:** `pnpm run duplication:check`  
**CI:** Runs in `.github/workflows/schema-validation.yml`

**Configuration:**
- Minimum lines: 8
- Minimum tokens: 50
- Excludes: `node_modules`, `packages/generated`, `.next`, `dist`

**Enforcement:**
- CI fails if duplicates above threshold are found
- Report generated: `jscpd-report.json`

---

### 3. Schema Validation

**Scripts:** `schema:lint`, `schema:generate`  
**CI:** Runs in `.github/workflows/schema-validation.yml`

**What it checks:**
- Schema registry validity
- Generated artifacts are in sync
- OpenAPI spec structure

**Enforcement:**
- CI fails if generated files are out of sync
- PRs blocked until schema changes are committed

---

### 4. Contract Tests

**Tools:** Dredd (provider), Pact (consumer)  
**Commands:** `contract-tests:provider`, `contract-tests:consumer`  
**CI:** Runs in `.github/workflows/schema-validation.yml`

**Enforcement:**
- Contract tests must pass (no `continue-on-error`)
- Ensures API implementation matches schema contract

---

### 5. Boundary Enforcement

**Tool:** `dependency-cruiser`  
**Command:** `pnpm run lint:boundaries`  
**CI:** Can be added to workflow

**What it checks:**
- No cross-domain imports
- Domain layer isolation
- Interfaces must use `@pinaka/schemas`

---

## Manual Checks

### 1. Type Shadowing

**Check:** No type/interface definitions that shadow schema types

**How to check:**
```bash
# Search for type definitions outside schemas
grep -r "export.*type\|export.*interface" --include="*.ts" --exclude-dir=node_modules --exclude-dir=packages/generated --exclude-dir=schema lib pages
```

**Acceptable exceptions:**
- Internal middleware types (`UserContext`, `ApiHandler`)
- Infrastructure types (`RateLimitOptions`, `StandardErrorResponse`)

---

### 2. Runtime Validation

**Check:** All API routes validate incoming payloads

**How to check:**
```bash
# Search for API routes without validation
grep -r "\.parse\|\.safeParse" pages/api/v1
```

**Requirement:**
- All routes must use Zod schemas from `@/lib/schemas`
- Validation must happen before processing

---

## Compliance Checklist

Before merging a PR:

- [ ] Schema changes: Version bumped in `packages/schemas/package.json`
- [ ] Schema changes: CHANGELOG.md updated
- [ ] Schema changes: Generated artifacts committed
- [ ] API changes: No direct `fetch()` calls to `/api/v1/*`
- [ ] API changes: Uses generated `v1Api` client
- [ ] Code quality: No duplicates above threshold (8 lines)
- [ ] Tests: Contract tests pass
- [ ] Boundaries: No cross-domain imports

---

## Violations

If you find a violation:

1. **API Client Usage:** Run `pnpm run check:api-client` to identify violations
2. **Duplication:** Run `pnpm run duplication:check` to see duplicates
3. **Schema Sync:** Run `pnpm run schema:generate` to regenerate artifacts
4. **Boundaries:** Run `pnpm run lint:boundaries` to check imports

---

## Exceptions

### Legacy Endpoints

These endpoints are **not** part of the v1 API contract and can use direct `fetch()`:

- `/api/auth/*` - Authentication endpoints
- `/api/landlords` - Legacy landlord endpoints
- `/api/verifications` - Legacy verification endpoints
- `/api/contractors` - Legacy contractor endpoints
- `/api/admin/*` - Admin endpoints
- `/api/maintenance/*` - Legacy maintenance endpoints (non-v1)
- `/api/forms/*` - Legacy form endpoints (non-v1)
- `/api/invitations/*` - Legacy invitation endpoints (non-v1)
- `/api/approvals` - Legacy approval endpoints

### Infrastructure Layer

These files are **acceptable** as they're infrastructure, not direct API calls:

- `lib/utils/api-client.js` - HTTP transport layer
- `lib/hooks/useUnifiedApi.js` - React hook wrapper
- `lib/api/v1-client.generated.ts` - Generated client itself

---

## Versioning

### Schema Versioning

**Location:** `packages/schemas/package.json`

**Strategy:** Semantic Versioning
- **MAJOR:** Breaking changes (removing fields, changing types)
- **MINOR:** Non-breaking additions (new fields, new endpoints)
- **PATCH:** Bug fixes, documentation

**Process:**
1. Make schema changes
2. Update version in `packages/schemas/package.json`
3. Update `CHANGELOG.md`
4. Run `pnpm run schema:generate`
5. Commit all changes

---

## CI Integration

All checks run automatically in CI:

```yaml
# .github/workflows/schema-validation.yml
- name: Lint schema
  run: pnpm run schema:lint

- name: Generate schema artifacts
  run: pnpm run schema:generate

- name: Check for changes
  run: git diff --exit-code src/generated-types.ts src/generated-validators.ts || exit 1

- name: Detect clones
  run: pnpm run check:duplicates

- name: Check API client usage
  run: pnpm run check:api-client

- name: Run contract tests
  run: pnpm run contract-tests:provider

- name: Run consumer tests
  run: pnpm run contract-tests:consumer
```

---

## Reporting

Compliance status is tracked in:
- `docs/SSOT_COMPLIANCE_REPORT.md` - Current compliance status
- `docs/SSOT_COMPLIANCE_ENFORCEMENT.md` - This file (enforcement details)

---

## Questions?

If you have questions about compliance:
1. Check this document first
2. Review `docs/SSOT_COMPLIANCE_REPORT.md`
3. Check CI logs for specific violations
4. Ask in PR review

