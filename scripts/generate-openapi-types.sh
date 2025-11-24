#!/bin/bash
# Generate TypeScript types from FastAPI OpenAPI spec

set -e

FASTAPI_URL="${FASTAPI_URL:-http://localhost:8000}"
OUTPUT_FILE="packages/shared-types/v2-api.d.ts"

echo "🔍 Fetching OpenAPI spec from ${FASTAPI_URL}/openapi.json..."

# Check if FastAPI is running
if ! curl -s -f "${FASTAPI_URL}/openapi.json" > /dev/null 2>&1; then
  echo "⚠️  FastAPI server is not running at ${FASTAPI_URL}"
  echo "   Start it with: cd apps/backend-api && uvicorn main:app --reload"
  exit 1
fi

# Install openapi-typescript if not available
if ! command -v npx &> /dev/null; then
  echo "❌ npx is not available"
  exit 1
fi

echo "📦 Generating TypeScript types..."
# Use npx to run openapi-typescript (installs if needed)
if command -v npx &> /dev/null; then
  npx --yes openapi-typescript@latest "${FASTAPI_URL}/openapi.json" -o "${OUTPUT_FILE}"
else
  echo "❌ npx is not available"
  exit 1
fi

if [ $? -eq 0 ]; then
  echo "✅ Types generated successfully: ${OUTPUT_FILE}"
else
  echo "❌ Failed to generate types"
  exit 1
fi

