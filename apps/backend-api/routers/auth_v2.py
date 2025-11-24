"""
Authentication endpoints for v2 schema
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from core.database import get_db
from core.auth_v2 import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user_v2,
    get_user_roles,
    RoleEnum,
)
from schemas.auth import Token, CurrentUser
from schemas.user import UserLogin, UserWithRoles
from db.models_v2 import User, UserRole, Role
from datetime import timedelta
from core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
async def login_v2(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """Login endpoint for v2 schema"""
    # Find user by email
    result = await db.execute(
        select(User).where(User.email == credentials.email)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    # Verify password
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    # Check user status
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is not active",
        )
    
    # Get user roles
    roles = await get_user_roles(user, db)
    
    # Create JWT token
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
            "roles": roles,
            "organization_id": str(user.organization_id) if user.organization_id else None,
        },
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=CurrentUser)
async def get_me_v2(
    current_user: User = Depends(get_current_user_v2),
    db: AsyncSession = Depends(get_db)
):
    """Get current user information"""
    # Get user roles with role details
    result = await db.execute(
        select(UserRole)
        .options(selectinload(UserRole.role))
        .where(UserRole.user_id == current_user.id)
    )
    user_roles = result.scalars().all()
    
    roles = [ur.role for ur in user_roles]
    
    return CurrentUser(
        user=current_user,
        roles=roles,
        organization_id=current_user.organization_id,
    )

