"""
Health check endpoints
"""

from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "pinaka-api",
    }


@router.get("/ready")
async def readiness_check():
    """Readiness check endpoint"""
    # In production, check database connectivity
    return {
        "status": "ready",
        "timestamp": datetime.utcnow().isoformat(),
    }

