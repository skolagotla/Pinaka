#!/bin/bash
# Script to apply performance indexes migration
# This script tries multiple methods to apply the migration

set -e

cd "$(dirname "$0")/.."

echo "🔍 Attempting to apply performance indexes migration..."
echo ""

# Method 1: Try Alembic directly
if command -v alembic &> /dev/null; then
    echo "✅ Using Alembic command..."
    alembic upgrade head
    exit 0
fi

# Method 2: Try Python module
if python3 -m alembic --help &> /dev/null; then
    echo "✅ Using Python Alembic module..."
    python3 -m alembic upgrade head
    exit 0
fi

# Method 3: Try direct script (requires dependencies)
if python3 -c "import sqlalchemy" &> /dev/null; then
    echo "✅ Using direct SQL script..."
    python3 scripts/apply_performance_indexes.py
    exit 0
fi

# If all methods fail
echo "❌ Could not apply migration. Please:"
echo "   1. Install dependencies: pip install -r requirements.txt"
echo "   2. Or run: alembic upgrade head"
echo "   3. Or run: python3 scripts/apply_performance_indexes.py"
exit 1

