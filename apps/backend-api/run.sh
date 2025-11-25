#!/bin/bash
# Convenience script to run FastAPI backend

cd "$(dirname "$0")"

# Activate virtual environment
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run: python3 -m venv venv && pip install -r requirements.txt"
    exit 1
fi

source venv/bin/activate

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your database credentials."
fi

# Create logs directory if it doesn't exist
mkdir -p ../../logs

# Generate log filename with timestamp
LOG_FILE="../../logs/fastapi-$(date +%Y%m%d-%H%M%S).log"

# Run FastAPI with logging
echo "🚀 Starting FastAPI backend on http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo "📝 Logging to: $LOG_FILE"
echo ""
uvicorn main:app --reload --host 0.0.0.0 --port 8000 2>&1 | tee "$LOG_FILE"

