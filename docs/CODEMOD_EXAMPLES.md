# Codemod Examples

This document provides examples of codemods for automated refactoring.

## 1. Replace Local DTO Imports with `@pinaka/schemas`

**Codemod:** `ci/codemods/replace-local-types.js`

**Purpose:** Replace local type imports with the canonical `@pinaka/schemas` package.

**Usage:**
```bash
npx jscodeshift -t ci/codemods/replace-local-types.js . --extensions=ts,tsx,js,jsx
```

**Or via npm script:**
```bash
npm run refactor:imports
```

**What it does:**
- Replaces `import { Type } from '../local/types'` → `import { Type } from '@pinaka/schemas'`
- Replaces `import { Type } from '@/lib/schemas'` → `import { Type } from '@pinaka/schemas'`
- Handles relative paths: `../local/types`, `../../local/types`, etc.

**Example:**
```typescript
// Before
import { PropertyCreate } from '../local/types';
import { TenantCreate } from '@/lib/schemas';

// After
import { PropertyCreate, TenantCreate } from '@pinaka/schemas';
```

---

## 2. Extract Repeated Hook to Shared Package

**Codemod:** `ci/codemods/extract-hook-to-shared.js`

**Purpose:** Extract duplicated hooks to `packages/ui/hooks/` and replace with imports.

**Step-by-step process:**

### Step 1: Identify duplicates

```bash
# Using ripgrep (rg)
rg "function useAuth|const useAuth" -n

# Or using grep
grep -r "function useAuth\|const useAuth" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" -n
```

### Step 2: Copy canonical implementation

Copy the best implementation to:
```
packages/ui/hooks/useAuth.ts
```

**Example:**
```typescript
// packages/ui/hooks/useAuth.ts
import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Auth logic here
  }, []);
  
  return { user, loading };
}
```

### Step 3: Run codemod to replace implementations

```bash
npx jscodeshift -t ci/codemods/extract-hook-to-shared.js . \
  --extensions=ts,tsx,js,jsx \
  --hook-name=useAuth
```

**What it does:**
- Finds all function declarations: `function useAuth() { ... }`
- Finds all const declarations: `const useAuth = () => { ... }`
- Replaces with: `import { useAuth } from '@pinaka/ui/hooks/useAuth'`
- Removes the local implementation

**Example:**
```typescript
// Before
function useAuth() {
  const [user, setUser] = useState(null);
  // ... implementation
}

// After
import { useAuth } from '@pinaka/ui/hooks/useAuth';
```

---

## Available Codemods

| Codemod | Purpose | Usage |
|---------|---------|-------|
| `replace-local-types.js` | Replace local type imports | `npm run refactor:imports` |
| `extract-hook-to-shared.js` | Extract hooks to shared package | `npx jscodeshift -t ci/codemods/extract-hook-to-shared.js . --hook-name=useAuth` |
| `move-to-domain-common.js` | Move domain logic to shared | Template - customize as needed |
| `move-to-ui-package.js` | Move UI components to shared | Template - customize as needed |

---

## Running Codemods

### Dry Run (Preview Changes)

```bash
npx jscodeshift -t ci/codemods/replace-local-types.js . \
  --extensions=ts,tsx,js,jsx \
  --dry
```

### Apply Changes

```bash
npx jscodeshift -t ci/codemods/replace-local-types.js . \
  --extensions=ts,tsx,js,jsx
```

### Specific Files/Directories

```bash
npx jscodeshift -t ci/codemods/replace-local-types.js \
  src/components \
  --extensions=ts,tsx
```

---

## Creating Custom Codemods

1. Create a new file in `ci/codemods/`
2. Use the jscodeshift API to transform AST
3. Test with `--dry` flag first
4. Document usage in this file

**Template:**
```javascript
module.exports = function transformer(fileInfo, api, options) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  
  // Your transformations here
  
  return root.toSource();
};
```

---

## Best Practices

1. **Always test with `--dry` first** - Preview changes before applying
2. **Commit before running** - Codemods modify files in place
3. **Run on small subset first** - Test on a few files before running on entire codebase
4. **Review changes** - Use git diff to review what changed
5. **Run tests** - Ensure tests still pass after codemod

---

## Related Documentation

- `ci/codemods/` - All codemod files
- `docs/PHASE_E_COMPLETE.md` - Duplication removal phase
- `packages/ui/hooks/` - Shared hooks location

