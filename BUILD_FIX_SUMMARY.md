# Build Error Fix - lazy-pages.tsx

## Issue
Tailwind CSS was trying to access a deleted file: `apps/web-app/app/admin/lazy-pages.tsx`

## Root Cause
When we removed the `/admin` directory, Tailwind CSS had cached the file list and was still trying to scan the deleted file.

## Fixes Applied

1. **Cleared Next.js Cache**
   - Removed `apps/web-app/.next` directory
   - This clears Tailwind's cached file list

2. **Updated Tailwind Config**
   - Verified `tailwind.config.js` uses glob patterns that automatically exclude deleted files
   - No hardcoded references to `lazy-pages.tsx`

## Solution

**Restart the dev server** to rebuild the cache:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
cd apps/web-app
pnpm dev
```

The build should now work correctly as Tailwind will rebuild its file list without the deleted file.

## Verification

- ✅ `.next` cache cleared
- ✅ No references to `lazy-pages.tsx` in codebase
- ✅ Tailwind config uses glob patterns (no hardcoded paths)
- ✅ `/admin` directory only contains redirect pages (no lazy-pages.tsx)

## If Error Persists

If the error still occurs after restarting:

1. Clear all caches:
   ```bash
   rm -rf apps/web-app/.next
   rm -rf node_modules/.cache
   ```

2. Restart dev server

3. If still failing, check for any Tailwind cache files:
   ```bash
   find apps/web-app -name "*.cache" -type f
   ```

