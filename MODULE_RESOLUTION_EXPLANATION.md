# Why "Module Not Found" Errors Keep Happening

## Root Cause

**The `lib/` directory is at the workspace root, not inside `apps/web-app/`**

```
Pinaka/
├── lib/              ← Code here imports packages
├── apps/
│   └── web-app/     ← Next.js runs here
└── node_modules/    ← Packages installed here (workspace root)
```

## The Problem

1. **Code in `lib/`** (at root) imports packages like `antd`, `dayjs`, `lodash`, etc.
2. **Next.js/Turbopack** runs from `apps/web-app/` and by default only looks in:
   - `apps/web-app/node_modules/`
   - `apps/web-app/.next/`
3. **Packages are installed** at workspace root (`/node_modules/`) via pnpm
4. **Next.js can't find them** because it doesn't know to look at the workspace root

## Why This Happens

In a **pnpm monorepo**:
- Packages can be installed at workspace root OR app level
- Next.js/Turbopack doesn't automatically traverse up to workspace root
- `lib/` is outside the Next.js app directory, so module resolution breaks

## Current Solution (What We've Been Doing)

1. Add package to `transpilePackages` in `next.config.js`
2. Install package at workspace root: `pnpm add -w 'package-name'`
3. This tells Next.js to transpile and resolve from workspace root

**This works, but it's tedious** - we have to do it for every package!

## Better Solution: Improve Module Resolution ✅ IMPLEMENTED

We've configured Next.js/Turbopack to automatically look in workspace root `node_modules`:

### Changes Made to `apps/web-app/next.config.js`:

1. **Added workspace root to webpack resolve.modules**:
   ```javascript
   config.resolve.modules = [
     ...(config.resolve.modules || ['node_modules']),
     path.resolve(__dirname, '../../node_modules'), // Workspace root
   ];
   ```

2. **Enabled symlink resolution**:
   ```javascript
   config.resolve.symlinks = true;
   ```

This should help Next.js automatically find packages installed at workspace root without needing to add every single one to `transpilePackages`.

### Why We Still Need `transpilePackages`

Even with improved module resolution, we still need `transpilePackages` for:
- Packages that need to be transpiled (ESM → CommonJS)
- Packages that Next.js needs to process during build
- Ensuring proper bundling in the monorepo structure

But now Next.js should be able to **find** the packages automatically!

## Summary

**No, we didn't move any modules.** The issue is architectural:

1. **`lib/` is at workspace root** (not inside `apps/web-app/`)
2. **Next.js runs from `apps/web-app/`** and doesn't automatically look at workspace root
3. **Packages are installed at workspace root** via pnpm
4. **Module resolution breaks** because Next.js can't find them

**Solution**: We've improved the webpack configuration to automatically look in workspace root `node_modules`, which should reduce future "module not found" errors. We still need `transpilePackages` for packages that need transpilation, but Next.js should now be able to **find** them automatically.

