#!/bin/bash

################################################################################
# Pinaka Deployment Script
# Automates: Git push → Stop server → Clear cache → Restart server
################################################################################

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 PINAKA DEPLOYMENT SCRIPT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

################################################################################
# STEP 1: Git Status Check
################################################################################

echo "📋 Step 1: Checking Git status..."
if [[ -z $(git status --porcelain) ]]; then
  echo "✅ No changes to commit - working tree clean"
  SKIP_GIT=true
else
  echo "📝 Changes detected - will commit and push"
  SKIP_GIT=false
fi
echo ""

################################################################################
# STEP 2: Commit & Push to GitLab (if changes exist)
################################################################################

if [ "$SKIP_GIT" = false ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📦 Step 2: Committing and pushing to GitLab..."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  # Get commit message from argument or use default
  if [ -n "$1" ]; then
    COMMIT_MSG="$1"
  else
    COMMIT_MSG="chore: Automated deployment at $(date '+%Y-%m-%d %H:%M:%S')"
  fi
  
  git add -A
  git commit -m "$COMMIT_MSG" || true  # Don't fail if nothing to commit
  git push origin main
  
  echo "✅ Pushed to GitLab"
  echo ""
else
  echo "⏭️  Step 2: Skipping Git push (no changes)"
  echo ""
fi

################################################################################
# STEP 3: Stop Node Server
################################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛑 Step 3: Stopping Node server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Find and kill any running Next.js/Node processes on port 3000
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "🔍 Found Node server on port 3000"
  lsof -ti:3000 | xargs kill -9 2>/dev/null || true
  echo "✅ Node server stopped"
else
  echo "ℹ️  No Node server running on port 3000"
fi

# Also kill any npm/next processes
pkill -f "next dev" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

sleep 2
echo ""

################################################################################
# STEP 4: Clear Cache
################################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧹 Step 4: Clearing cache..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Clear Next.js cache
if [ -d ".next" ]; then
  rm -rf .next
  echo "✅ Cleared .next directory"
fi

# Clear Turbopack cache
if [ -d ".turbo" ]; then
  rm -rf .turbo
  echo "✅ Cleared .turbo directory"
fi

# Clear node_modules/.cache if it exists
if [ -d "node_modules/.cache" ]; then
  rm -rf node_modules/.cache
  echo "✅ Cleared node_modules/.cache"
fi

# Clear Prisma cache
if [ -d "node_modules/.prisma" ]; then
  rm -rf node_modules/.prisma
  echo "✅ Cleared Prisma cache"
fi

echo "✅ All caches cleared"
echo ""

################################################################################
# STEP 4.5: Regenerate Prisma Client
################################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Step 4.5: Regenerating Prisma Client..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

npx prisma generate > /dev/null 2>&1
echo "✅ Prisma Client regenerated"
echo ""

################################################################################
# STEP 5: Start Node Server
################################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Step 5: Starting Node server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Start the dev server
npm run dev &

# Get the PID
DEV_PID=$!
echo "✅ Node server starting (PID: $DEV_PID)"
echo ""

# Wait for server to be ready
echo "⏳ Waiting for server to be ready..."
MAX_WAIT=30
COUNTER=0
until curl -s http://localhost:3000 > /dev/null 2>&1 || [ $COUNTER -eq $MAX_WAIT ]; do
  sleep 1
  ((COUNTER++))
  echo -n "."
done

echo ""
if [ $COUNTER -eq $MAX_WAIT ]; then
  echo "⚠️  Server took longer than expected to start"
  echo "   Check terminal for any errors"
else
  echo "✅ Server is ready!"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ DEPLOYMENT COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Application running at: http://localhost:3000"
echo "📊 Logs: Check the terminal where this script was run"
echo "🛑 Stop server: Press Ctrl+C or run: ./scripts/stop.sh"
echo ""
echo "💡 TIP: Server is running in the background"
echo "   To see logs: tail -f dev-server.log (if logging is set up)"
echo ""

