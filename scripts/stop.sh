#!/bin/bash

################################################################################
# Stop Node Server Script
################################################################################

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛑 STOPPING NODE SERVER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Find and kill any running Next.js/Node processes on port 3000
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "🔍 Found Node server on port 3000"
  lsof -ti:3000 | xargs kill -9 2>/dev/null
  echo "✅ Node server stopped"
else
  echo "ℹ️  No Node server running on port 3000"
fi

# Also kill any npm/next processes
pkill -f "next dev" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

echo ""
echo "✅ Server stopped successfully"
echo ""

