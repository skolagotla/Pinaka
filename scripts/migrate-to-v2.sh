#!/bin/bash
# V2 Migration Script - Remove v1 dependencies and update imports

set -e

echo "🚀 Starting V2 Migration..."

# Remove Prisma imports from services
echo "📦 Removing Prisma from services..."
find apps/web-app/lib/services -type f \( -name "*.js" -o -name "*.ts" \) -exec sed -i '' '/import.*prisma\|from.*prisma\|require.*prisma/d' {} \;

# Remove useUnifiedApi imports and replace with v2Api
echo "🔄 Replacing useUnifiedApi with v2Api..."
find apps/web-app -type f \( -name "*.jsx" -o -name "*.tsx" -o -name "*.js" -o -name "*.ts" \) -exec sed -i '' 's/useUnifiedApi/v2Api/g' {} \;
find apps/web-app -type f \( -name "*.jsx" -o -name "*.tsx" -o -name "*.js" -o -name "*.ts" \) -exec sed -i '' '/import.*useUnifiedApi/d' {} \;

# Remove v1Api imports
echo "🔄 Removing v1Api imports..."
find apps/web-app -type f \( -name "*.jsx" -o -name "*.tsx" -o -name "*.js" -o -name "*.ts" \) -exec sed -i '' '/import.*v1Api\|from.*v1Api/d' {} \;

# Remove usePinakaCRUD imports
echo "🔄 Removing usePinakaCRUD imports..."
find apps/web-app -type f \( -name "*.jsx" -o -name "*.tsx" -o -name "*.js" -o -name "*.ts" \) -exec sed -i '' '/import.*usePinakaCRUD/d' {} \;

echo "✅ Migration script completed"

