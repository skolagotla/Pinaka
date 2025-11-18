#!/bin/bash

################################################################################
# Clear All Caches Script
################################################################################

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧹 CLEARING ALL CACHES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

CLEARED=0

# Clear Next.js cache
if [ -d ".next" ]; then
  rm -rf .next
  echo "✅ Cleared .next directory"
  ((CLEARED++))
fi

# Clear Turbopack cache
if [ -d ".turbo" ]; then
  rm -rf .turbo
  echo "✅ Cleared .turbo directory"
  ((CLEARED++))
fi

# Clear SWC cache
if [ -d ".swc" ]; then
  rm -rf .swc
  echo "✅ Cleared .swc directory"
  ((CLEARED++))
fi

# Clear node_modules/.cache
if [ -d "node_modules/.cache" ]; then
  rm -rf node_modules/.cache
  echo "✅ Cleared node_modules/.cache"
  ((CLEARED++))
fi

# Clear Prisma cache
if [ -d "node_modules/.prisma" ]; then
  rm -rf node_modules/.prisma
  echo "✅ Cleared Prisma cache"
  ((CLEARED++))
fi

echo ""
if [ $CLEARED -eq 0 ]; then
  echo "ℹ️  No cache directories found"
else
  echo "✅ Cleared $CLEARED cache location(s)"
fi

# Regenerate Prisma Client if schema exists
if [ -f "prisma/schema.prisma" ]; then
  echo ""
  echo "🔧 Regenerating Prisma Client..."
  npx prisma generate > /dev/null 2>&1
  echo "✅ Prisma Client regenerated"
fi

echo ""

