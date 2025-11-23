"""
Authentication endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from core.auth import create_access_token, get_current_user
from core.config import settings
from datetime import timedelta

router = APIRouter()
security = HTTPBearer()


class TokenResponse(BaseModel):
    """Token response schema"""
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=TokenResponse)
async def login():
    """Login endpoint (placeholder - integrate with existing auth)"""
    # TODO: Integrate with existing authentication system
    # For now, return a placeholder token
    access_token = create_access_token(
        data={"sub": "user_id", "role": "super_admin", "email": "admin@pinaka.com"},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return {
        "success": True,
        "data": current_user,
    }

