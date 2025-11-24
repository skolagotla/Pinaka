"""
User management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Body, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel
from core.database import get_db
from core.auth_v2 import get_current_user_v2, get_user_roles, RoleEnum, require_role_v2, get_password_hash
from core.crud_helpers import apply_pagination
from schemas.user import User, UserCreate, UserUpdate, UserWithRoles
from schemas.role import Role
from db.models_v2 import User as UserModel, UserRole, Role as RoleModel, Organization


class RoleAssignRequest(BaseModel):
    role_name: str
    organization_id: Optional[UUID] = None


router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=List[User])
async def list_users(
    organization_id: Optional[UUID] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """List users (scoped by organization) with pagination"""
    user_roles = await get_user_roles(current_user, db)
    
    # Eager load relationships to prevent N+1 queries
    query = select(UserModel).options(
        selectinload(UserModel.organization),
        selectinload(UserModel.user_roles).selectinload(UserRole.role),
    )
    
    # Filter by organization
    if RoleEnum.SUPER_ADMIN in user_roles:
        if organization_id:
            query = query.where(UserModel.organization_id == organization_id)
    else:
        # Non-super users can only see their organization's users
        query = query.where(UserModel.organization_id == current_user.organization_id)
    
    query = apply_pagination(query, page, limit, UserModel.created_at.desc())
    
    result = await db.execute(query)
    users = result.scalars().all()
    
    return users


@router.post("", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Create user"""
    user_roles = await get_user_roles(current_user, db)
    
    # Verify organization access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if user_data.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot create user in different organization",
            )
    
    # Verify organization exists (if provided)
    if user_data.organization_id:
        org_result = await db.execute(
            select(Organization).where(Organization.id == user_data.organization_id)
        )
        org = org_result.scalar_one_or_none()
        if not org:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found",
            )
    
    # Check if email already exists
    existing_user = await db.execute(
        select(UserModel).where(UserModel.email == user_data.email)
    )
    if existing_user.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )
    
    # Hash password
    from core.auth_v2 import get_password_hash
    password_hash = get_password_hash(user_data.password)
    
    # Create user
    user_dict = user_data.dict(exclude={'password'})
    user_dict['password_hash'] = password_hash
    user = UserModel(**user_dict)
    db.add(user)
    await db.flush()  # Get user.id
    
    await db.commit()
    await db.refresh(user)
    
    return user


@router.get("/{user_id}", response_model=UserWithRoles)
async def get_user(
    user_id: UUID,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Get user by ID with roles"""
    user_roles = await get_user_roles(current_user, db)
    
    result = await db.execute(
        select(UserModel)
        .options(selectinload(UserModel.user_roles).selectinload(UserRole.role))
        .where(UserModel.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Check organization access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if user.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    # Get roles
    roles_result = await db.execute(
        select(RoleModel)
        .join(UserRole)
        .where(UserRole.user_id == user_id)
    )
    roles = roles_result.scalars().all()
    
    user_dict = {
        **user.__dict__,
        'roles': roles,
    }
    
    return UserWithRoles(**user_dict)


@router.patch("/{user_id}", response_model=User)
async def update_user(
    user_id: UUID,
    user_data: UserUpdate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Update user"""
    user_roles = await get_user_roles(current_user, db)
    
    result = await db.execute(
        select(UserModel).where(UserModel.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Check organization access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if user.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    # Update fields
    update_data = user_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    await db.commit()
    await db.refresh(user)
    
    return user


@router.post("/{user_id}/roles", response_model=UserWithRoles)
async def assign_role(
    user_id: UUID,
    role_data: RoleAssignRequest = Body(...),
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN], require_organization=False)),
    db: AsyncSession = Depends(get_db)
):
    """Assign role to user (super_admin only)"""
    request_data = role_data
    
    # Get user
    user_result = await db.execute(
        select(UserModel).where(UserModel.id == user_id)
    )
    user = user_result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Get role
    role_result = await db.execute(
        select(RoleModel).where(RoleModel.name == request_data.role_name)
    )
    role = role_result.scalar_one_or_none()
    
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found",
        )
    
    # Check if user already has this role
    existing_role = await db.execute(
        select(UserRole).where(
            UserRole.user_id == user_id,
            UserRole.role_id == role.id,
            UserRole.organization_id == (request_data.organization_id or user.organization_id)
        )
    )
    if existing_role.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has this role",
        )
    
    # Create user_role
    user_role = UserRole(
        user_id=user_id,
        role_id=role.id,
        organization_id=request_data.organization_id or user.organization_id,
    )
    db.add(user_role)
    await db.commit()
    
    # Return user with roles
    return await get_user(user_id, current_user, db)


@router.delete("/{user_id}/roles/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_role(
    user_id: UUID,
    role_id: UUID,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN], require_organization=False)),
    db: AsyncSession = Depends(get_db)
):
    """Remove role from user (super_admin only)"""
    result = await db.execute(
        select(UserRole).where(
            UserRole.user_id == user_id,
            UserRole.role_id == role_id
        )
    )
    user_role = result.scalar_one_or_none()
    
    if not user_role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User role not found",
        )
    
    await db.execute(delete(UserRole).where(
        UserRole.user_id == user_id,
        UserRole.role_id == role_id
    ))
    await db.commit()
    
    return None

