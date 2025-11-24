"""
Unit endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID
from core.database import get_db
from core.auth_v2 import get_current_user_v2, get_user_roles, RoleEnum, require_role_v2
from core.crud_helpers import apply_pagination
from schemas.unit import Unit, UnitCreate, UnitUpdate
from db.models_v2 import Unit as UnitModel, Property, User

router = APIRouter(prefix="/units", tags=["units"])


@router.get("", response_model=List[Unit])
async def list_units(
    property_id: Optional[UUID] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """List units (optionally filtered by property) with pagination"""
    user_roles = await get_user_roles(current_user, db)
    
    # Eager load property relationship to prevent N+1 queries
    query = select(UnitModel).options(
        selectinload(UnitModel.property),
    )
    
    # Filter by property if provided
    if property_id:
        query = query.where(UnitModel.property_id == property_id)
    
    # For non-super users, filter by organization through property
    if RoleEnum.SUPER_ADMIN not in user_roles:
        # Join with properties to filter by organization
        query = query.join(Property).where(Property.organization_id == current_user.organization_id)
    
    query = apply_pagination(query, page, limit, UnitModel.created_at.desc())
    
    result = await db.execute(query)
    units = result.scalars().all()
    
    return units


@router.post("", response_model=Unit, status_code=status.HTTP_201_CREATED)
async def create_unit(
    unit_data: UnitCreate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Create unit"""
    user_roles = await get_user_roles(current_user, db)
    
    # Verify property exists and user has access
    prop_result = await db.execute(
        select(Property).where(Property.id == unit_data.property_id)
    )
    property_obj = prop_result.scalar_one_or_none()
    
    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found",
        )
    
    # Check organization access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if property_obj.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot create unit in different organization",
            )
    
    unit = UnitModel(**unit_data.dict())
    db.add(unit)
    await db.commit()
    await db.refresh(unit)
    
    return unit


@router.get("/{unit_id}", response_model=Unit)
async def get_unit(
    unit_id: UUID,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Get unit by ID"""
    user_roles = await get_user_roles(current_user, db)
    
    # Eager load property to avoid separate query for access check
    result = await db.execute(
        select(UnitModel)
        .options(selectinload(UnitModel.property))
        .where(UnitModel.id == unit_id)
    )
    unit = result.scalar_one_or_none()
    
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found",
        )
    
    # Check organization access through property (already loaded)
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if unit.property and unit.property.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    return unit


@router.patch("/{unit_id}", response_model=Unit)
async def update_unit(
    unit_id: UUID,
    unit_data: UnitUpdate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Update unit"""
    user_roles = await get_user_roles(current_user, db)
    
    result = await db.execute(
        select(UnitModel).where(UnitModel.id == unit_id)
    )
    unit = result.scalar_one_or_none()
    
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found",
        )
    
    # Check organization access through property
    if RoleEnum.SUPER_ADMIN not in user_roles:
        prop_result = await db.execute(
            select(Property).where(Property.id == unit.property_id)
        )
        property_obj = prop_result.scalar_one_or_none()
        
        if property_obj and property_obj.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    # Update fields
    update_data = unit_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(unit, field, value)
    
    await db.commit()
    await db.refresh(unit)
    
    return unit


@router.delete("/{unit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_unit(
    unit_id: UUID,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Delete unit"""
    user_roles = await get_user_roles(current_user, db)
    
    result = await db.execute(
        select(UnitModel).where(UnitModel.id == unit_id)
    )
    unit = result.scalar_one_or_none()
    
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found",
        )
    
    # Load property for access check
    if RoleEnum.SUPER_ADMIN not in user_roles:
        prop_result = await db.execute(
            select(Property).where(Property.id == unit.property_id)
        )
        property_obj = prop_result.scalar_one_or_none()
        
        if property_obj and property_obj.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    await db.execute(delete(UnitModel).where(UnitModel.id == unit_id))
    await db.commit()
    
    return None

