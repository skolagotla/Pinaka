#!/bin/bash
#
# Cleanup Temporary and Unwanted Files
# 
# This script removes temporary files, OS files, backup files, and build artifacts
# that should not be committed to the repository.
#
# Usage: ./scripts/cleanup-temp-files.sh [--dry-run]
#

# Don't exit on error - we want to continue cleaning even if some operations fail
set +e

DRY_RUN=false
if [ "$1" == "--dry-run" ]; then
  DRY_RUN=true
  echo "🔍 DRY RUN MODE - No files will be deleted"
fi

echo "🧹 Starting cleanup of temporary and unwanted files..."
echo ""

# Counters
DELETED_COUNT=0
SKIPPED_COUNT=0

# Function to delete file/directory
delete_item() {
  local item="$1"
  local description="$2"
  
  if [ -e "$item" ]; then
    if [ "$DRY_RUN" = true ]; then
      echo "  [DRY RUN] Would delete: $item ($description)"
      ((DELETED_COUNT++))
    else
      if [ -d "$item" ]; then
        rm -rf "$item"
        echo "  ✅ Deleted directory: $item ($description)"
      else
        rm -f "$item"
        echo "  ✅ Deleted file: $item ($description)"
      fi
      ((DELETED_COUNT++))
    fi
  else
    ((SKIPPED_COUNT++))
  fi
}

# 1. OS Files (.DS_Store, Thumbs.db)
echo "📁 Cleaning OS files..."
find . -name ".DS_Store" -type f -not -path "./node_modules/*" 2>/dev/null | while IFS= read -r file; do
  [ -n "$file" ] && delete_item "$file" "OS file"
done || true

find . -name "Thumbs.db" -type f -not -path "./node_modules/*" 2>/dev/null | while IFS= read -r file; do
  [ -n "$file" ] && delete_item "$file" "OS file"
done || true

# 2. Backup Files (.bak, .backup)
echo ""
echo "📁 Cleaning backup files..."
find . -type f \( -name "*.bak" -o -name "*.backup" \) -not -path "./node_modules/*" 2>/dev/null | while IFS= read -r file; do
  [ -n "$file" ] && delete_item "$file" "backup file"
done || true

# 3. Log Files
echo ""
echo "📁 Cleaning log files..."
find . -type f -name "*.log" -not -path "./node_modules/*" -not -path "./.next/*" 2>/dev/null | while IFS= read -r file; do
  [ -n "$file" ] && delete_item "$file" "log file"
done || true

# Clean .next logs specifically
if [ -d ".next/dev/logs" ]; then
  delete_item ".next/dev/logs" "Next.js development logs"
fi

# 4. Temporary Files (.tmp, .temp)
echo ""
echo "📁 Cleaning temporary files..."
find . -type f \( -name "*.tmp" -o -name "*.temp" \) -not -path "./node_modules/*" 2>/dev/null | while IFS= read -r file; do
  [ -n "$file" ] && delete_item "$file" "temporary file"
done || true

# 5. Editor Swap Files
echo ""
echo "📁 Cleaning editor swap files..."
find . -type f \( -name "*.swp" -o -name "*.swo" -o -name "*~" -o -name ".#*" \) -not -path "./node_modules/*" 2>/dev/null | while IFS= read -r file; do
  [ -n "$file" ] && delete_item "$file" "editor swap file"
done || true

# 6. Build Artifacts (if not in use)
echo ""
echo "📁 Cleaning build artifacts..."
if [ "$DRY_RUN" = false ]; then
  # Only delete .next if we're not in development
  if [ -z "$NODE_ENV" ] || [ "$NODE_ENV" != "development" ]; then
    if [ -d ".next" ]; then
      echo "  ⚠️  Skipping .next directory (may be needed for development)"
      echo "     Run 'rm -rf .next' manually if you want to clean it"
    fi
  fi
fi

# Clean dist directories in packages (these are build artifacts)
find packages -type d -name "dist" -not -path "*/node_modules/*" 2>/dev/null | while IFS= read -r dir; do
  [ -n "$dir" ] && delete_item "$dir" "package build artifact"
done || true

# Clean dist directories in apps
find apps -type d -name "dist" -not -path "*/node_modules/*" 2>/dev/null | while IFS= read -r dir; do
  [ -n "$dir" ] && delete_item "$dir" "app build artifact"
done || true

# Clean dist directories in domains
find domains -type d -name "dist" -not -path "*/node_modules/*" 2>/dev/null | while IFS= read -r dir; do
  [ -n "$dir" ] && delete_item "$dir" "domain build artifact"
done || true

# 7. Source Maps (if not needed)
echo ""
echo "📁 Cleaning source maps..."
find . -type f -name "*.map" -not -path "./node_modules/*" -not -path "./.next/*" 2>/dev/null | while IFS= read -r file; do
  # Keep source maps in .next as they're useful for debugging
  [ -n "$file" ] && delete_item "$file" "source map"
done || true

# 8. Cache Directories
echo ""
echo "📁 Cleaning cache directories..."
[ -d ".cache" ] && delete_item ".cache" "cache directory" || true
[ -d ".turbo" ] && delete_item ".turbo" "turbo cache" || true
[ -f ".eslintcache" ] && delete_item ".eslintcache" "ESLint cache" || true
[ -f "tsconfig.tsbuildinfo" ] && delete_item "tsconfig.tsbuildinfo" "TypeScript build info" || true

# 9. Coverage Reports
echo ""
echo "📁 Cleaning coverage reports..."
[ -d "coverage" ] && delete_item "coverage" "test coverage directory" || true
[ -d ".nyc_output" ] && delete_item ".nyc_output" "nyc output directory" || true

# 10. Empty tmp directory (if empty)
if [ -d "tmp" ] && [ -z "$(ls -A tmp 2>/dev/null)" ]; then
  delete_item "tmp" "empty temporary directory" || true
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$DRY_RUN" = true ]; then
  echo "🔍 DRY RUN COMPLETE"
  echo "   Would delete: $DELETED_COUNT items"
else
  echo "✅ CLEANUP COMPLETE"
  echo "   Deleted: $DELETED_COUNT items"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Tip: Run 'git status' to see what was cleaned up"
echo "💡 Tip: Run with --dry-run to preview changes"

