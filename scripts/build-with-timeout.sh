#!/bin/bash

# Build with timeout and logging
# Usage: ./scripts/build-with-timeout.sh [timeout_seconds]

set -e

TIMEOUT=${1:-180}  # Default 3 minutes (180 seconds)
BUILD_LOG="build-debug.log"
BUILD_PID_FILE=".build.pid"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 BUILD WITH TIMEOUT MONITORING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⏱️  Timeout: ${TIMEOUT} seconds"
echo "📝 Log file: ${BUILD_LOG}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Clear old lock file if exists
if [ -f ".next/lock" ]; then
    echo "🧹 Removing stale .next/lock file..."
    rm -f .next/lock
fi

# Start build in background and capture PID
echo "🚀 Starting build at $(date '+%Y-%m-%d %H:%M:%S')..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee "$BUILD_LOG"
echo "BUILD LOG - $(date)" | tee -a "$BUILD_LOG"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$BUILD_LOG"
echo "" | tee -a "$BUILD_LOG"

# Run build with output to both terminal and log file
npm run build > >(tee -a "$BUILD_LOG") 2> >(tee -a "$BUILD_LOG" >&2) &
BUILD_PID=$!
echo $BUILD_PID > "$BUILD_PID_FILE"

echo "📊 Build process started with PID: $BUILD_PID"
echo ""

# Monitor build with timeout
ELAPSED=0
INTERVAL=5

while [ $ELAPSED -lt $TIMEOUT ]; do
    # Check if process is still running
    if ! kill -0 $BUILD_PID 2>/dev/null; then
        # Process finished
        wait $BUILD_PID
        EXIT_CODE=$?
        rm -f "$BUILD_PID_FILE"
        
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        if [ $EXIT_CODE -eq 0 ]; then
            echo "✅ BUILD SUCCESSFUL!"
            echo "⏱️  Completed in ${ELAPSED} seconds"
            echo "📝 Full log saved to: ${BUILD_LOG}"
        else
            echo "❌ BUILD FAILED!"
            echo "⏱️  Failed after ${ELAPSED} seconds"
            echo "📝 Error log saved to: ${BUILD_LOG}"
            echo ""
            echo "Last 30 lines of build log:"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            tail -30 "$BUILD_LOG"
        fi
        
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        exit $EXIT_CODE
    fi
    
    # Show progress indicator
    printf "\r⏳ Building... ${ELAPSED}s elapsed (timeout at ${TIMEOUT}s)"
    
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
done

# Timeout reached
echo ""
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏰ BUILD TIMEOUT REACHED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "❌ Build exceeded ${TIMEOUT} seconds - killing process..."
echo ""

# Kill the build process
kill -9 $BUILD_PID 2>/dev/null || true
rm -f "$BUILD_PID_FILE"

echo "📝 Partial build log saved to: ${BUILD_LOG}"
echo ""
echo "🔍 DIAGNOSIS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Last 50 lines of build output:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
tail -50 "$BUILD_LOG"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 POSSIBLE CAUSES:"
echo "   1. TypeScript compilation hanging on type checking"
echo "   2. Large file causing memory issues"
echo "   3. Circular dependency or infinite loop"
echo "   4. Node process deadlock"
echo "   5. File watcher or cache issue"
echo ""
echo "💡 SUGGESTIONS:"
echo "   1. Check the log file for the last compiled file before hang"
echo "   2. Try: rm -rf .next && npm run build"
echo "   3. Try: npm run build -- --no-lint"
echo "   4. Check for any recently added large files"
echo "   5. Review the last 50 lines above for clues"
echo ""
echo "📝 Full log available at: ${BUILD_LOG}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
exit 1

