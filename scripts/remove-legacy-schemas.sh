#!/bin/bash
# Remove legacy @pinaka/schemas package

set -e

echo "🗑️  Removing legacy @pinaka/schemas package..."

# Remove the package directory
if [ -d "packages/schemas" ]; then
  echo "   Removing packages/schemas/..."
  rm -rf packages/schemas
  echo "   ✅ Removed packages/schemas/"
fi

# Remove from pnpm workspace (already handled in pnpm-workspace.yaml by exclusion)

echo "✅ Legacy schemas package removed"
echo ""
echo "💡 Next steps:"
echo "   1. Run: pnpm install (to update lockfile)"
echo "   2. Update any remaining imports from @pinaka/schemas to @pinaka/shared-types"
echo "   3. Run: pnpm generate:types (to generate types from FastAPI)"

