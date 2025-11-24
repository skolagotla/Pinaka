#!/bin/bash
# Bulk replace v1 API calls with v2 API calls

set -e

echo "🔄 Replacing v1 API calls with v2..."

# Replace useUnifiedApi imports
find apps/web-app -type f \( -name "*.jsx" -o -name "*.tsx" -o -name "*.js" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*" -exec sed -i '' 's/import.*useUnifiedApi.*from.*@\/lib\/hooks\/useUnifiedApi/\/\/ useUnifiedApi removed - use v2Api from @\/lib\/api\/v2-client/g' {} \;

# Replace v1Api imports
find apps/web-app -type f \( -name "*.jsx" -o -name "*.tsx" -o -name "*.js" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*" -exec sed -i '' 's/import.*v1Api.*from.*@\/lib\/api\/v1-client/\/\/ v1Api removed - use v2Api from @\/lib\/api\/v2-client/g' {} \;

# Replace dynamic v1Api imports
find apps/web-app -type f \( -name "*.jsx" -o -name "*.tsx" -o -name "*.js" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*" -exec sed -i '' "s/const { v1Api } = await import('@\/lib\/api\/v1-client')/const { v2Api } = await import('@\/lib\/api\/v2-client')/g" {} \;

echo "✅ Bulk replacement completed"

