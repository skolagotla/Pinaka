# Prisma Query Engine Setup

## Problem

In pnpm monorepo setups, Prisma's query engine binary can be located in different places depending on how pnpm hoists dependencies. This can cause "Query Engine not found" errors in Next.js applications.

## Solution

We've implemented a robust, version-agnostic solution that automatically finds the Prisma query engine regardless of:
- Prisma version
- Platform (macOS, Linux, Windows)
- pnpm hoisting structure
- Workspace location

## Implementation

### 1. Shared Utility (`lib/utils/prisma-engine-finder.js`)

A reusable utility that:
- Detects the current platform and architecture
- Searches for the query engine in all possible pnpm locations
- Works with any Prisma version (no hardcoded paths)
- Sets the `PRISMA_QUERY_ENGINE_LIBRARY` environment variable

### 2. Next.js Configuration

Both `apps/api-server/next.config.js` and `apps/web-app/next.config.js` use the utility to set the engine path before Next.js initializes.

### 3. Prisma Client Initialization

`lib/prisma.js` uses the same utility to ensure the engine path is set before creating the PrismaClient instance.

### 4. Postinstall Script

`package.json` includes a `postinstall` script that runs `prisma generate` after `pnpm install`, ensuring Prisma Client is always up to date.

## Usage

The solution is automatic - no manual configuration needed. The engine finder will:

1. **Detect platform**: Automatically detects macOS (darwin), Linux, or Windows
2. **Find engine**: Searches in all possible pnpm locations
3. **Set environment variable**: Sets `PRISMA_QUERY_ENGINE_LIBRARY` before Prisma Client is created
4. **Log results**: Logs the found path for debugging

## Troubleshooting

If you still see "Query Engine not found" errors:

1. **Regenerate Prisma Client**:
   ```bash
   npx prisma generate
   ```

2. **Check logs**: Look for `[Prisma] Found query engine at:` or `[Next.js Config] Set PRISMA_QUERY_ENGINE_LIBRARY to:` messages

3. **Verify installation**: Ensure `@prisma/client` is installed in the workspace root:
   ```bash
   pnpm install
   ```

4. **Check platform**: The utility automatically detects your platform, but you can verify by checking `lib/utils/prisma-engine-finder.js`

## Maintenance

- **Version updates**: No changes needed when updating Prisma - the utility is version-agnostic
- **Platform changes**: The utility automatically handles different platforms
- **Monorepo changes**: Works regardless of workspace structure

## Files Modified

- `lib/utils/prisma-engine-finder.js` - New utility (version-agnostic engine finder)
- `apps/api-server/next.config.js` - Uses utility to set engine path
- `lib/prisma.js` - Uses utility to set engine path
- `prisma/schema.prisma` - Added binaryTargets (using "native" for auto-detection)
- `package.json` - Added postinstall script

