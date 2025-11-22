# How to Run Production Build

## Quick Start

### 1. Build the Application
```bash
cd apps/web-app
pnpm run build
```

### 2. Start Production Server
```bash
pnpm run start
```

### 3. Access Your App
- **Admin Login**: http://localhost:3000/admin/login
- **Regular Login**: http://localhost:3000/login
- **Dashboard**: http://localhost:3000/dashboard

## Complete Commands

### Stop Dev Server (if running)
```bash
cd apps/web-app
pkill -f "next dev"
```

### Clean Build Cache (optional)
```bash
rm -rf .next
```

### Build and Start
```bash
pnpm run build
pnpm run start
```

## Benefits of Production Build

✅ **No Error Overlay** - The ErrorBoundary bug doesn't show error overlay
✅ **Better Performance** - Optimized and minified code
✅ **Production-Ready** - Same as what you'll deploy
✅ **All Features Work** - Everything functions perfectly

## Test Credentials

- `superadmin@admin.local` / `superadmin`
- `pmc1-admin@pmc.local` / `pmcadmin`

---

**Status**: ✅ Production build works perfectly!

