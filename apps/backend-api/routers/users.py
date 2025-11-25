"""
User management endpoints for v2 schema
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID

from core.database import get_db
from core.auth_v2 import get_current_user_v2, get_user_roles, RoleEnum, require_role_v2
from core.rbac import require_permission, PermissionAction, ResourceType
from schemas.user import UserCreate, UserUpdate, UserWithRoles
from db.models_v2 import User as UserModel, UserRole, Role as RoleModel

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=List[UserWithRoles])
async def list_users(
    organization_id: Optional[UUID] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: UserModel = Depends(require_permission(PermissionAction.READ, ResourceType.USER)),
    db: AsyncSession = Depends(get_db)
):
    """List users with optional organization filter"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(UserModel).options(
        selectinload(UserModel.user_roles).selectinload(UserRole.role)
    )
    
    # Apply organization filter if not super admin
    if RoleEnum.SUPER_ADMIN not in user_roles:
        query = query.where(UserModel.organization_id == current_user.organization_id)
    elif organization_id:
        query = query.where(UserModel.organization_id == organization_id)
    
    # Pagination
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)
    
    result = await db.execute(query)
    users = result.scalars().all()
    
    # Transform to include roles
    users_with_roles = []
    for user in users:
        roles_result = await db.execute(
            select(RoleModel)
            .join(UserRole)
            .where(UserRole.user_id == user.id)
        )
        roles = roles_result.scalars().all()
        user_dict = {
            **user.__dict__,
            'roles': roles,
        }
        users_with_roles.append(UserWithRoles(**user_dict))
    
    return users_with_roles


@router.post("", response_model=UserWithRoles)
async def create_user(
    user_data: UserCreate,
    current_user: UserModel = Depends(require_permission(PermissionAction.READ, ResourceType.USER)),
    db: AsyncSession = Depends(get_db)
):
    """Create a new user"""
    from core.auth_v2 import get_password_hash
    
    user_roles = await get_user_roles(current_user, db)
    
    # Check if user already exists
    result = await db.execute(
        select(UserModel).where(UserModel.email == user_data.email)
    )
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )
    
    # Determine organization_id
    org_id = user_data.organization_id
    if RoleEnum.SUPER_ADMIN not in user_roles:
        org_id = current_user.organization_id
    
    # Create user
    new_user = UserModel(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        phone=user_data.phone,
        organization_id=org_id,
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Get roles
    roles_result = await db.execute(
        select(RoleModel)
        .join(UserRole)
        .where(UserRole.user_id == new_user.id)
    )
    roles = roles_result.scalars().all()
    
    user_dict = {
        **new_user.__dict__,
        'roles': roles,
    }
    
    return UserWithRoles(**user_dict)


@router.get("/{user_id}", response_model=UserWithRoles)
async def get_user(
    user_id: UUID,
    current_user: UserModel = Depends(require_permission(PermissionAction.READ, ResourceType.USER)),
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


@router.patch("/{user_id}", response_model=UserWithRoles)
async def update_user(
    user_id: UUID,
    user_data: UserUpdate,
    current_user: UserModel = Depends(require_permission(PermissionAction.READ, ResourceType.USER)),
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
    if update_data:
        await db.execute(
            update(UserModel)
            .where(UserModel.id == user_id)
            .values(**update_data)
        )
        await db.commit()
        await db.refresh(user)
    
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


@router.patch("/me", response_model=UserWithRoles)
async def update_current_user(
    user_data: UserUpdate,
    current_user: UserModel = Depends(get_current_user_v2),
    db: AsyncSession = Depends(get_db)
):
    """Update current user's own profile"""
    # Update fields (exclude status and organization_id for self-update)
    update_data = {
        k: v for k, v in user_data.dict(exclude_unset=True).items()
        if k not in ['status', 'organization_id']
    }
    
    if update_data:
        await db.execute(
            update(UserModel)
            .where(UserModel.id == current_user.id)
            .values(**update_data)
        )
        await db.commit()
        await db.refresh(current_user)
    
    # Get roles
    roles_result = await db.execute(
        select(RoleModel)
        .join(UserRole)
        .where(UserRole.user_id == current_user.id)
    )
    roles = roles_result.scalars().all()
    
    user_dict = {
        **current_user.__dict__,
        'roles': roles,
    }
    
    return UserWithRoles(**user_dict)


@router.delete("/{user_id}")
async def delete_user(
    user_id: UUID,
    current_user: UserModel = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Delete user (soft delete by setting status to 'suspended')"""
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
    
    # Soft delete
    await db.execute(
        update(UserModel)
        .where(UserModel.id == user_id)
        .values(status='suspended')
    )
    await db.commit()
    
    return {"message": "User deleted successfully"}
