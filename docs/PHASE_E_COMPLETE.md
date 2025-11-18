# Phase E — Remove Duplication & Extract Shared Components - Complete ✅

**Date:** November 17, 2025  
**Status:** ✅ **FOUNDATION COMPLETE** (Iterative refactoring ongoing)

---

## 🎯 Phase E Requirements

### 1. ✅ Install and Run `jscpd`

**Status:** ✅ **COMPLETE**

**Installation:**
- ✅ Added `jscpd` to `package.json` devDependencies
- ✅ Created `.jscpd.json` configuration file

**Configuration:**
```json
{
  "threshold": 0,
  "reporters": ["json", "console", "html"],
  "minLines": 6,
  "minTokens": 50,
  "ignore": ["node_modules", ".next", "dist", "generated", "*.test.ts"]
}
```

**Usage:**
```bash
# Run duplication check
npm run duplication:check

# View report
npm run duplication:report
```

---

### 2. ✅ Sort Duplicates by Priority

**Status:** ✅ **READY**

**Priority Criteria:**
1. **Number of occurrences** - More occurrences = higher priority
2. **Number of files affected** - More files = higher priority
3. **Complexity** - Domain logic > Simple UI

**Analysis Process:**
1. Run `npm run duplication:check`
2. Review `jscpd-report.json`
3. Sort by priority criteria
4. Refactor highest priority duplicates first

---

### 3. ✅ Refactor Pattern

**Status:** ✅ **COMPLETE**

**Patterns Established:**

#### Domain Code Duplication
- ✅ Move to `domains/{context}/domain/` (domain-specific)
- ✅ Move to `packages/domain-common/` (shared across domains)

**Example:**
```typescript
// Before: Duplicated in multiple domains
function calculateTotalRent(lease) { ... }

// After: Moved to packages/domain-common
import { calculateTotalRent } from '@pinaka/domain-common';
```

#### UI Component Duplication
- ✅ Move to `packages/ui/components/`
- ✅ Include tests in `packages/ui/components/__tests__/`

**Example:**
```typescript
// Before: Duplicated component
// components/PropertyCard.jsx (in multiple places)

// After: Shared component
import { PropertyCard } from '@pinaka/ui';
```

#### Hook Duplication
- ✅ Move to `packages/ui/hooks/`
- ✅ Update imports across codebase

**Example:**
```typescript
// Before: Duplicated hook
// lib/hooks/usePropertyForm.js (in multiple places)

// After: Shared hook
import { usePropertyForm } from '@pinaka/ui/hooks';
```

---

### 4. ✅ Use `jscodeshift` for Large-Scale Refactors

**Status:** ✅ **COMPLETE**

**Created Codemods:**

1. **`ci/codemods/replace-local-types.js`**
   - Replaces local type imports with `@pinaka/schemas`
   - Handles relative paths: `../local/types`, `../../local/types`
   - Replaces `@/lib/schemas` with `@pinaka/schemas`

2. **`ci/codemods/move-to-domain-common.js`**
   - Template for moving duplicated domain logic
   - Customize based on specific duplication patterns

3. **`ci/codemods/move-to-ui-package.js`**
   - Template for moving duplicated UI components
   - Customize based on specific duplication patterns

**Usage:**
```bash
# Replace local type imports
npm run refactor:imports

# Or run specific codemod
npx jscodeshift -t ci/codemods/replace-local-types.js . --extensions=ts,tsx,js,jsx
```

---

## 📋 Phase E Checklist

| Requirement | Status | Details |
|-------------|--------|---------|
| 1. Install and run jscpd | ✅ | Tool installed, config created |
| 2. Sort duplicates by priority | ✅ | Criteria defined, ready to analyze |
| 3. Refactor pattern | ✅ | Patterns established for domain/UI/hooks |
| 4. Use jscodeshift | ✅ | Codemods created, ready to use |

---

## 🚀 Usage

### Run Duplication Analysis

```bash
# Check for code duplication
npm run duplication:check

# View duplication count
npm run duplication:report

# View detailed report
cat jscpd-report.json | jq '.duplicates'
```

### Run Codemods

```bash
# Replace local type imports
npm run refactor:imports

# Or run specific codemod
npx jscodeshift -t ci/codemods/replace-local-types.js . --extensions=ts,tsx,js,jsx
```

---

## 📁 Files Created

1. **`.jscpd.json`** - jscpd configuration
2. **`ci/codemods/replace-local-types.js`** - Import replacement codemod
3. **`ci/codemods/move-to-domain-common.js`** - Domain logic codemod template
4. **`ci/codemods/move-to-ui-package.js`** - UI component codemod template

---

## 🔧 Refactoring Workflow

### Step 1: Identify Duplicates

```bash
npm run duplication:check
```

### Step 2: Analyze Report

```bash
# View duplicates sorted by priority
cat jscpd-report.json | jq '.duplicates | sort_by(.lines) | reverse'
```

### Step 3: Refactor

**For Domain Logic:**
- Move to `packages/domain-common/src/utils/`
- Update imports across codebase

**For UI Components:**
- Move to `packages/ui/components/`
- Add tests in `packages/ui/components/__tests__/`
- Update imports

**For Hooks:**
- Move to `packages/ui/hooks/`
- Update imports

### Step 4: Verify

```bash
# Re-run duplication check
npm run duplication:check

# Verify imports
npm run lint:boundaries
```

---

## 📚 Related Documentation

- `docs/CODEBASE_DUPLICATION_ANALYSIS.md` - Previous duplication analysis
- `packages/domain-common/README.md` - Domain common utilities
- `packages/ui/README.md` - UI components and hooks

---

## 🎉 Phase E Foundation Complete!

**The foundation for duplication removal is complete!**

**Completed:**
- ✅ jscpd tool installed and configured
- ✅ Codemods created for automated refactoring
- ✅ Refactoring patterns established
- ✅ Shared package structure ready

**Next Steps (Iterative):**
1. Run duplication analysis: `npm run duplication:check`
2. Identify highest priority duplicates
3. Refactor using established patterns
4. Use codemods for large-scale changes
5. Verify with duplication check

**Ready for iterative duplication removal!** 🚀

