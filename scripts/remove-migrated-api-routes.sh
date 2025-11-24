#!/bin/bash

# Script to remove Next.js API routes that have been fully migrated to FastAPI v2
# Run this after confirming all frontend components are using v2 endpoints

set -e

API_SERVER_DIR="apps/api-server/pages/api/v1"

echo "🗑️  Removing migrated Next.js API routes..."
echo ""

# Routes that have been fully migrated to FastAPI v2
MIGRATED_ROUTES=(
  "properties"
  "units"
  "landlords"
  "tenants"
  "leases"
  "maintenance"
  "vendors"
  "notifications"
  "search"
)

# Create backup directory
BACKUP_DIR="apps/api-server/pages/api/v1_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup in $BACKUP_DIR..."
echo ""

for route in "${MIGRATED_ROUTES[@]}"; do
  ROUTE_PATH="$API_SERVER_DIR/$route"
  if [ -d "$ROUTE_PATH" ]; then
    echo "  ✓ Backing up and removing: $route"
    cp -r "$ROUTE_PATH" "$BACKUP_DIR/$route"
    rm -rf "$ROUTE_PATH"
  else
    echo "  ⚠️  Route not found: $route"
  fi
done

echo ""
echo "✅ Migration cleanup complete!"
echo ""
echo "📝 Note: Routes have been backed up to: $BACKUP_DIR"
echo "   You can restore them if needed."
echo ""
echo "🔍 Remaining routes in $API_SERVER_DIR:"
ls -la "$API_SERVER_DIR" | grep "^d" | awk '{print "   - " $9}' | grep -v "^\.$" | grep -v "^\.\.$" | grep -v "^v1_backup"

