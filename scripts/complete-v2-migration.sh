#!/bin/bash
# Complete V2 Migration Script
# This script systematically removes all v1 dependencies and updates imports

set -e

echo "🚀 Starting Complete V2 Migration..."

# Step 1: Remove all v1Api and useUnifiedApi imports
echo "📦 Step 1: Removing v1 API imports..."
find apps/web-app/components -type f \( -name "*.jsx" -o -name "*.tsx" -o -name "*.js" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*" -exec sed -i '' '/import.*useUnifiedApi.*from.*@\/lib\/hooks\/useUnifiedApi/d' {} \;
find apps/web-app/components -type f \( -name "*.jsx" -o -name "*.tsx" -o -name "*.js" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*" -exec sed -i '' '/import.*v1Api.*from.*@\/lib\/api\/v1-client/d' {} \;

# Step 2: Replace dynamic v1Api imports with v2Api
echo "🔄 Step 2: Replacing dynamic v1Api imports..."
find apps/web-app/components -type f \( -name "*.jsx" -o -name "*.tsx" -o -name "*.js" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*" -exec sed -i '' "s/const { v1Api } = await import('@\/lib\/api\/v1-client')/const { v2Api } = await import('@\/lib\/api\/v2-client')/g" {} \;
find apps/web-app/components -type f \( -name "*.jsx" -o -name "*.tsx" -o -name "*.js" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*" -exec sed -i '' 's/v1Api\./v2Api./g' {} \;

# Step 3: Remove useUnifiedApi usage
echo "🔄 Step 3: Removing useUnifiedApi usage..."
find apps/web-app/components -type f \( -name "*.jsx" -o -name "*.tsx" -o -name "*.js" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*" -exec sed -i '' 's/const { fetch } = useUnifiedApi({ showUserMessage: true });/\/\/ useUnifiedApi removed - use v2Api from @\/lib\/api\/v2-client/g' {} \;
find apps/web-app/components -type f \( -name "*.jsx" -o -name "*.tsx" -o -name "*.js" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*" -exec sed -i '' 's/const { fetch } = useUnifiedApi/\/\/ useUnifiedApi removed/g' {} \;

# Step 4: Update error handling comments
echo "🔄 Step 4: Updating error handling comments..."
find apps/web-app/components -type f \( -name "*.jsx" -o -name "*.tsx" -o -name "*.js" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*" -exec sed -i '' 's/\/\/ Error already handled by useUnifiedApi/\/\/ Error handling updated for v2/g' {} \;

echo "✅ V2 Migration Script Completed"
echo ""
echo "Remaining manual work:"
echo "  - Update v1Api method calls to v2Api equivalents"
echo "  - Migrate Ant Design components to Flowbite"
echo "  - Fix type errors"
echo "  - Test end-to-end"

