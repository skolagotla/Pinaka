"""
Property endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
from core.database import get_db
from core.auth_v2 import get_current_user_v2, get_user_roles, RoleEnum, require_role_v2
from core.crud_helpers import (
    apply_organization_filter,
    check_organization_access,
    verify_organization_access_for_create,
    get_entity_or_404,
    update_entity_fields,
    apply_pagination
)
from schemas.property import Property, PropertyCreate, PropertyUpdate
from db.models_v2 import Property as PropertyModel, User, Organization

router = APIRouter(prefix="/properties", tags=["properties"])


@router.get("", response_model=List[Property])
async def list_properties(
    organization_id: Optional[UUID] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """List properties (scoped by organization) with pagination"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(PropertyModel)
    query = await apply_organization_filter(query, PropertyModel, current_user, user_roles, organization_id)
    query = apply_pagination(query, page, limit, PropertyModel.created_at.desc())
    
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
    
    # Verify organization access and existence
    await verify_organization_access_for_create(
        property_data.organization_id,
        current_user,
        user_roles,
        db,
        "Cannot create property in different organization"
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
    user_roles = await get_user_roles(current_user, db)
    property_obj = await get_entity_or_404(PropertyModel, property_id, db, "Property not found")
    await check_organization_access(property_obj, current_user, user_roles)
    
    return property_obj

