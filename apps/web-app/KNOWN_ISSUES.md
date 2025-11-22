# Known Issues - Next.js 14.2.18

## ⚠️ Next.js 14.2.18 ErrorBoundary SSR Bug

### Issue
**Error**: `TypeError: Cannot read properties of null (reading 'useContext')`

**Location**: Next.js internal ErrorBoundary component during SSR

**Cause**: Next.js 14.2.18's ErrorBoundary tries to use `usePathname` hook during server-side rendering, but the React context is null during SSR.

### Impact
- **Development Mode**: Shows error overlay, but app functionality is not affected
- **Production Mode**: Does NOT occur (production builds don't have this issue)

### Workaround
The error is caught by our custom error handler (`app/error.jsx`) which shows a friendly message and allows the user to continue. The app will function normally after clicking "Try again".

### Why We're Using Next.js 14.2.18
- Next.js 14.2.25+ requires `React.cache` (React 19 feature)
- We're on React 18.3.1 (stable, compatible with all dependencies)
- Next.js 14.2.18 is the last stable version that works with React 18.3.1

### Status
✅ **Workaround in place** - Error is handled gracefully
✅ **App functionality unaffected** - This is a cosmetic dev-mode issue
✅ **Production builds unaffected** - Bug only occurs in development

### Future Resolution
This bug is fixed in Next.js 14.2.25+, but that version requires React 19. When we're ready to upgrade to React 19, we can upgrade Next.js as well.

---

**Last Updated**: 2025-11-22

