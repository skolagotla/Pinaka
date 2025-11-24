#!/bin/bash
# Migrate Ant Design components to Flowbite
# This script provides helper replacements for common Ant Design patterns

set -e

echo "🔄 Ant Design → Flowbite Migration Helper"
echo ""
echo "This script helps identify files that need migration."
echo "Manual migration is required for complex components."
echo ""

# Count files with Ant Design
ANTD_COUNT=$(find apps/web-app/components -name "*.jsx" -o -name "*.tsx" | xargs grep -l "from 'antd'" 2>/dev/null | grep -v node_modules | wc -l | xargs)

echo "Files with Ant Design: $ANTD_COUNT"
echo ""
echo "Top priority files to migrate:"
find apps/web-app/components -name "*.jsx" -o -name "*.tsx" | xargs grep -l "from 'antd'" 2>/dev/null | grep -v node_modules | head -10

echo ""
echo "✅ Migration helper script complete"
echo "📝 See V2_MIGRATION_FINAL_STATUS.md for component mapping guide"

