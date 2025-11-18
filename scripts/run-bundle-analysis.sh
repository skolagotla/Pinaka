#!/bin/bash
# Bundle Analysis Script
# Runs Next.js bundle analyzer to visualize bundle sizes

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 RUNNING BUNDLE ANALYSIS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd apps/web-app

echo "Building with bundle analyzer enabled..."
echo "This will open a browser window with the bundle visualization."
echo ""

ANALYZE=true pnpm build

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Bundle analysis complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Results:"
echo "  - Bundle report: apps/web-app/.next/analyze/client.html"
echo "  - Server bundle: apps/web-app/.next/analyze/server.html"
echo ""

