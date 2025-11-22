# Turbopack Module Resolution Solutions

## Current Issue
Next.js 16.0.3 uses Turbopack by default in dev mode, which has module resolution issues with pnpm workspaces, specifically:
- Cannot resolve `@ant-design/icons`
- Cannot resolve `@ant-design/charts`
- Cannot resolve other packages in pnpm workspace structure

## Solutions Implemented

### 1. Enhanced Webpack Configuration ✅
**Location:** `apps/web-app/next.config.js`

**Changes:**
- Added enhanced module resolution paths for pnpm workspaces
- Enabled symlink resolution
- Added workspace root `node_modules` to resolve paths
- Improved extension resolution

**Status:** Configured (only works when webpack is used)

### 2. Environment Variable to Disable Turbopack ✅
**Location:** `apps/web-app/dev.sh` and `package.json`

**Method 1:** Environment variable
```bash
NEXT_PRIVATE_SKIP_TURBO=1 next dev -p 3000
```

**Method 2:** Direct flag (if supported)
```bash
next dev -p 3000 --webpack
```

**Status:** Implemented but not always effective

### 3. Production Build (Works) ✅
**Command:**
```bash
pnpm exec next build --webpack && pnpm start
```

**Status:** ✅ **WORKING** - This is the most reliable solution

## Alternative Solutions to Try

### Solution A: Update Next.js to Latest Version
```bash
cd apps/web-app
pnpm update next@latest
```

**Pros:**
- May have fixes for Turbopack + pnpm workspace issues
- Better compatibility

**Cons:**
- May introduce breaking changes
- Turbopack issues may persist

### Solution B: Downgrade to Next.js 15
```bash
cd apps/web-app
pnpm add next@15.2.3
```

**Pros:**
- Uses webpack by default (no Turbopack)
- Stable and proven
- Full webpack config support

**Cons:**
- Loses Next.js 16 features
- May need to update other dependencies

### Solution C: Use `.npmrc` Configuration
Create `apps/web-app/.npmrc`:
```
shamefully-hoist=true
public-hoist-pattern[]=*ant-design*
public-hoist-pattern[]=*@ant-design*
```

**Pros:**
- Forces package hoisting
- May help Turbopack resolve modules

**Cons:**
- Changes pnpm behavior
- May cause other issues

### Solution D: Create Custom Next.js Wrapper
Create a custom script that patches module resolution before starting Next.js.

### Solution E: Use Vite/Other Bundler (Major Refactor)
Replace Next.js with Vite or another bundler that has better pnpm support.

**Pros:**
- Better pnpm workspace support
- Faster dev server

**Cons:**
- **MASSIVE** refactoring required
- Lose Next.js features (SSR, API routes, etc.)

## Recommended Approach

### Short-term (Immediate) ✅ **SOLVED!**
1. ✅ **Use `--webpack` flag in dev mode** (WORKS!)
   ```bash
   pnpm run dev:webpack
   # or
   next dev -p 3000 --webpack
   ```

2. ✅ **Enhanced webpack config** (already implemented)

3. ✅ **Production build** (works reliably)
   ```bash
   pnpm exec next build --webpack
   pnpm start
   ```

### Medium-term (Next 1-2 weeks)
1. **Try Solution A:** Update Next.js to latest version
2. **Monitor Next.js releases** for Turbopack fixes
3. **Consider Solution B:** Downgrade to Next.js 15 if issues persist

### Long-term (If issues persist)
1. **Wait for Next.js/Turbopack fixes** (recommended)
2. **Consider Solution B:** Downgrade to Next.js 15
3. **Report issue to Next.js** with pnpm workspace details

## Testing Checklist

- [ ] Test with `NEXT_PRIVATE_SKIP_TURBO=1`
- [ ] Test with `--webpack` flag
- [ ] Test production build
- [ ] Test with updated Next.js version
- [ ] Test with `.npmrc` configuration

## Current Status

- ✅ Production build: **WORKING**
- ✅ Dev mode with `--webpack` flag: **WORKING** ✅ **SOLUTION FOUND!**
- ⚠️ Dev mode with Turbopack: **NOT WORKING**
- ⚠️ Dev mode with `NEXT_PRIVATE_SKIP_TURBO=1`: **INCONSISTENT**

## Next Steps

1. Test the enhanced webpack configuration
2. Try updating Next.js to latest version
3. If issues persist, consider downgrading to Next.js 15

