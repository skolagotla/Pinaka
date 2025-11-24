#!/bin/bash
# Complete OpenAPI type generation pipeline setup

set -e

echo "🚀 Setting up OpenAPI type generation pipeline..."
echo ""

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
cd packages/shared-types && pnpm add -D openapi-typescript 2>/dev/null || echo "   (openapi-typescript will be installed on first use)"
cd ../api-client && pnpm add openapi-fetch 2>/dev/null || echo "   (openapi-fetch will be installed on first use)"
cd ../..

# Step 2: Generate types (if FastAPI is running)
echo ""
echo "🔍 Checking if FastAPI is running..."
if curl -s -f "http://localhost:8000/openapi.json" > /dev/null 2>&1; then
  echo "   ✅ FastAPI is running, generating types..."
  pnpm generate:types
else
  echo "   ⚠️  FastAPI is not running"
  echo "   To generate types later, run: pnpm generate:types"
  echo "   (Make sure FastAPI is running on http://localhost:8000)"
fi

# Step 3: Build packages
echo ""
echo "🔨 Building packages..."
pnpm build:packages

echo ""
echo "✅ OpenAPI pipeline setup complete!"
echo ""
echo "📚 Next steps:"
echo "   1. Start FastAPI: cd apps/backend-api && uvicorn main:app --reload"
echo "   2. Generate types: pnpm generate:types"
echo "   3. Start frontend: pnpm dev"
echo ""
echo "📖 See docs/OPENAPI_TYPES_MIGRATION.md for usage guide"

