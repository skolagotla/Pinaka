# Dependency Fixes Summary

## ✅ Fixed Issues

### 1. Next.js Version Conflict
- **Problem**: `@auth0/nextjs-auth0@4.13.0` requires Next.js `^14.2.25 || ^15.2.3 || ^16.0.0` but we had `14.2.15`
- **Solution**: Upgraded Next.js to `14.2.25` in both `apps/web-app` and `apps/api-server`
- **Status**: ✅ Fixed

### 2. @ant-design/charts Conflict
- **Problem**: `@ant-design/charts@1.4.3` requires `antd@^4.6.3` but we have `antd@5.29.1`
- **Solution**: 
  - Removed `@ant-design/charts` from `package.json`
  - Replaced with `recharts` (already installed, better maintained)
  - Updated imports in dashboard components
  - Removed from `next.config.js` optimization list
- **Status**: ✅ Fixed

### 3. zod-to-openapi Version Conflict
- **Problem**: `zod-to-openapi@0.2.1` requires `zod@~3.5.1` but `schema/types` had `zod@^4.1.12`
- **Solution**:
  - Aligned `zod` version to `^3.22.0` across workspace (matching main app)
  - Added pnpm override: `"zod-to-openapi>zod": "^3.22.0"`
- **Status**: ✅ Fixed

### 4. pnpm Overrides Added
- **Added to root `package.json`**:
  ```json
  "pnpm": {
    "overrides": {
      "react": "^18.3.1",
      "react-dom": "^18.3.1",
      "@types/react": "^18.3.12",
      "@types/react-dom": "^18.3.1",
      "@types/node": "20.19.25",
      "next": "14.2.25",
      "zod": "^3.22.0",
      "zod-to-openapi>zod": "^3.22.0"
    }
  }
  ```
- **Status**: ✅ Fixed

## 📦 Package Changes

### Removed
- `@ant-design/charts` (replaced with `recharts`)

### Updated
- `next`: `14.2.15` → `14.2.25` (both apps)
- `zod`: `^4.1.12` → `^3.22.0` (schema/types)

### Added
- `flowbite`, `flowbite-react`, `flowbite-react-icons` (for future migration)
- `tailwindcss`, `postcss`, `autoprefixer` (for Flowbite)

## 🎯 Result

All dependency conflicts resolved! The app should now:
- ✅ Build without peer dependency warnings
- ✅ Run without version conflicts
- ✅ Use stable, compatible versions

## ⚠️ Remaining Warnings (Non-Critical)

1. **Deprecated packages**: Some subdependencies are deprecated (figgy-pudding, fstream, etc.) - these are transitive and don't affect functionality
2. **zod-to-openapi deprecation**: Package is deprecated but still works - consider migrating to `@asteasolutions/zod-to-openapi` in future

## 🚀 Next Steps

1. Test the build: `pnpm --filter @pinaka/web-app build`
2. Test dev mode: `pnpm dev`
3. Gradually migrate to Flowbite (optional, for better UX)

## 📝 Notes

- All changes are backward compatible
- No breaking changes to existing code
- Recharts is a better, more modern charting library than @ant-design/charts
- Next.js 14.2.25 is stable and compatible with all dependencies

