"""
Landlord endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List, Optional
from uuid import UUID
from core.database import get_db
from core.auth_v2 import get_current_user_v2, get_user_roles, RoleEnum, require_role_v2
from core.crud_helpers import (
    apply_organization_filter,
    check_organization_access,
    verify_organization_access_for_create,
    get_entity_or_404,
    update_entity_fields
)
from schemas.landlord import Landlord, LandlordCreate, LandlordUpdate
from db.models_v2 import Landlord as LandlordModel, User, Organization

router = APIRouter(prefix="/landlords", tags=["landlords"])


@router.get("", response_model=List[Landlord])
async def list_landlords(
    organization_id: Optional[UUID] = None,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """List landlords (scoped by organization)"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(LandlordModel)
    query = await apply_organization_filter(query, LandlordModel, current_user, user_roles, organization_id)
    
    result = await db.execute(query)
    landlords = result.scalars().all()
    
    return landlords


@router.post("", response_model=Landlord, status_code=status.HTTP_201_CREATED)
async def create_landlord(
    landlord_data: LandlordCreate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Create landlord"""
    user_roles = await get_user_roles(current_user, db)
    
    # Verify organization access and existence
    await verify_organization_access_for_create(
        landlord_data.organization_id,
        current_user,
        user_roles,
        db,
        "Cannot create landlord in different organization"
    )
    
    landlord = LandlordModel(**landlord_data.dict())
    db.add(landlord)
    await db.commit()
    await db.refresh(landlord)
    
    return landlord


@router.get("/{landlord_id}", response_model=Landlord)
async def get_landlord(
    landlord_id: UUID,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Get landlord by ID"""
    user_roles = await get_user_roles(current_user, db)
    landlord = await get_entity_or_404(LandlordModel, landlord_id, db, "Landlord not found")
    await check_organization_access(landlord, current_user, user_roles)
    
    return landlord


@router.patch("/{landlord_id}", response_model=Landlord)
async def update_landlord(
    landlord_id: UUID,
    landlord_data: LandlordUpdate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Update landlord"""
    user_roles = await get_user_roles(current_user, db)
    landlord = await get_entity_or_404(LandlordModel, landlord_id, db, "Landlord not found")
    await check_organization_access(landlord, current_user, user_roles)
    
    # Update fields
    update_data = landlord_data.dict(exclude_unset=True)
    await update_entity_fields(landlord, update_data)
    
    await db.commit()
    await db.refresh(landlord)
    
    return landlord


@router.delete("/{landlord_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_landlord(
    landlord_id: UUID,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Delete landlord"""
    user_roles = await get_user_roles(current_user, db)
    landlord = await get_entity_or_404(LandlordModel, landlord_id, db, "Landlord not found")
    await check_organization_access(landlord, current_user, user_roles)
    
    await db.execute(delete(LandlordModel).where(LandlordModel.id == landlord_id))
    await db.commit()
    
    return None

