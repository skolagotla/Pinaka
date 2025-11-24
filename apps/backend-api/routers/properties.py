"""
Property endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
from core.database import get_db
from core.auth_v2 import get_current_user_v2, get_user_roles, RoleEnum, require_role_v2
from schemas.property import Property, PropertyCreate, PropertyUpdate
from db.models_v2 import Property as PropertyModel, User, Organization

router = APIRouter(prefix="/properties", tags=["properties"])


@router.get("", response_model=List[Property])
async def list_properties(
    organization_id: Optional[UUID] = None,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """List properties (scoped by organization)"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(PropertyModel)
    
    # Filter by organization
    if RoleEnum.SUPER_ADMIN in user_roles:
        if organization_id:
            query = query.where(PropertyModel.organization_id == organization_id)
    else:
        # Non-super users can only see their organization's properties
        query = query.where(PropertyModel.organization_id == current_user.organization_id)
    
    result = await db.execute(query)
    properties = result.scalars().all()
    
    return properties


@router.post("", response_model=Property, status_code=status.HTTP_201_CREATED)
async def create_property(
    property_data: PropertyCreate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Create property"""
    user_roles = await get_user_roles(current_user, db)
    
    # Verify organization access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if property_data.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot create property in different organization",
            )
    
    # Verify organization exists
    org_result = await db.execute(
        select(Organization).where(Organization.id == property_data.organization_id)
    )
    org = org_result.scalar_one_or_none()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found",
        )
    
    property_obj = PropertyModel(**property_data.dict())
    db.add(property_obj)
    await db.commit()
    await db.refresh(property_obj)
    
    return property_obj


@router.get("/{property_id}", response_model=Property)
async def get_property(
    property_id: UUID,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Get property by ID"""
    result = await db.execute(
        select(PropertyModel).where(PropertyModel.id == property_id)
    )
    property_obj = result.scalar_one_or_none()
    
    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found",
        )
    
    user_roles = await get_user_roles(current_user, db)
    
    # Check access: super_admin or same organization
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if property_obj.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    return property_obj

