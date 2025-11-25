"""
Authentication and authorization utilities for v2 schema
"""
from datetime import datetime, timedelta
from typing import Optional, List
from jose import JWTError, jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from core.config import settings
from core.database import get_db
from db.models_v2 import User, UserRole, Role, Organization
from uuid import UUID

# JWT security
security = HTTPBearer()

# Role enum
class RoleEnum:
    SUPER_ADMIN = "super_admin"
    PMC_ADMIN = "pmc_admin"
    PM = "pm"
    LANDLORD = "landlord"
    TENANT = "tenant"
    VENDOR = "vendor"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash using bcrypt directly"""
    try:
        # Use bcrypt directly to avoid passlib compatibility issues
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception as e:
        print(f'[verify_password] Error: {e}')
        return False


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt directly"""
    # Generate salt and hash password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


async def get_current_user_v2(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token (v2 schema)"""
    token = credentials.credentials
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    
    # Fetch user from database with roles
    result = await db.execute(
        select(User)
        .options(selectinload(User.user_roles).selectinload(UserRole.role))
        .where(User.id == UUID(user_id))
    )
    user = result.scalar_one_or_none()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is not active",
        )
    
    return user


async def get_user_roles(user: User, db: AsyncSession) -> List[str]:
    """Get list of role names for a user (always queries database to avoid lazy loading issues)"""
    # Always query the database to avoid lazy loading issues in async context
    result = await db.execute(
        select(Role.name)
        .join(UserRole)
        .where(UserRole.user_id == user.id)
    )
    roles = result.scalars().all()
    return list(roles)


def require_role_v2(allowed_roles: List[str], require_organization: bool = False):
    """
    Dependency factory to require specific roles with optional organization scoping.
    
    This function returns an async dependency function that can be used with Depends().
    
    Usage:
        current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN], require_organization=True))
    """
    # Store parameters in closure
    _allowed_roles = allowed_roles
    _require_organization = require_organization
    
    async def role_checker(
        current_user: User = Depends(get_current_user_v2),
        db: AsyncSession = Depends(get_db)
    ) -> User:
        user_roles = await get_user_roles(current_user, db)
        
        # super_admin can access everything
        if RoleEnum.SUPER_ADMIN in user_roles:
            return current_user
        
        # Check if user has any of the allowed roles
        has_role = any(role in _allowed_roles for role in user_roles)
        
        if not has_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {_allowed_roles}",
            )
        
        # If organization scoping is required, ensure user has organization_id
        if _require_organization and not current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Organization access required",
            )
        
        return current_user
    
    # Return the async function directly (not called)
    return role_checker



