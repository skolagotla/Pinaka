"""
Organization endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from core.database import get_db
from core.auth_v2 import get_current_user_v2, get_user_roles, RoleEnum
from core.rbac import require_permission, PermissionAction, ResourceType
from schemas.organization import Organization, OrganizationCreate, OrganizationUpdate
from db.models_v2 import Organization as OrgModel, User

router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.get("", response_model=List[Organization])
async def list_organizations(
    current_user: User = Depends(require_permission(PermissionAction.READ, ResourceType.ORGANIZATION)),
    db: AsyncSession = Depends(get_db)
):
    """List organizations (super_admin sees all, others see their own)"""
    user_roles = await get_user_roles(current_user, db)
    
    if RoleEnum.SUPER_ADMIN in user_roles:
        # Super admin sees all organizations
        result = await db.execute(select(OrgModel))
        orgs = result.scalars().all()
    else:
        # Others see only their organization
        if not current_user.organization_id:
            return []
        result = await db.execute(
            select(OrgModel).where(OrgModel.id == current_user.organization_id)
        )
        orgs = result.scalars().all()
    
    return orgs


@router.post("", response_model=Organization, status_code=status.HTTP_201_CREATED)
async def create_organization(
    org_data: OrganizationCreate,
    current_user: User = Depends(require_permission(PermissionAction.CREATE, ResourceType.ORGANIZATION)),
    db: AsyncSession = Depends(get_db)
):
    """Create organization (super_admin only)"""
    user_roles = await get_user_roles(current_user, db)
    
    # Double-check (require_role_v2 should have already checked, but for safety)
    if RoleEnum.SUPER_ADMIN not in user_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super_admin can create organizations",
        )
    
    org = OrgModel(**org_data.dict())
    db.add(org)
    await db.commit()
    await db.refresh(org)
    
    return org


@router.get("/{org_id}", response_model=Organization)
async def get_organization(
    org_id: str,
    current_user: User = Depends(require_permission(PermissionAction.READ, ResourceType.ORGANIZATION)),
    db: AsyncSession = Depends(get_db)
):
    """Get organization by ID"""
    user_roles = await get_user_roles(current_user, db)
    
    result = await db.execute(
        select(OrgModel).where(OrgModel.id == org_id)
    )
    org = result.scalar_one_or_none()
    
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found",
        )
    
    # Check access: super_admin or same organization
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if current_user.organization_id != org.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    return org

