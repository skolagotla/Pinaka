"""
Vendor endpoints (v2) - using v2 auth and models
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List, Optional
from uuid import UUID
from core.database import get_db
from core.auth_v2 import get_current_user_v2, get_user_roles, RoleEnum, require_role_v2
from schemas.vendor_v2 import VendorResponse, VendorCreate, VendorUpdate
from db.models_v2 import Vendor as VendorModel, User, Organization

router = APIRouter(prefix="/vendors", tags=["vendors"])


@router.get("", response_model=List[VendorResponse])
async def list_vendors(
    organization_id: Optional[UUID] = Query(None),
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """List vendors (scoped by organization and role)"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(VendorModel)
    
    # Filter by organization
    if RoleEnum.SUPER_ADMIN in user_roles:
        if organization_id:
            query = query.where(VendorModel.organization_id == organization_id)
    else:
        query = query.where(VendorModel.organization_id == current_user.organization_id)
    
    # Additional filters
    if status_filter:
        query = query.where(VendorModel.status == status_filter)
    
    if search:
        query = query.where(
            or_(
                VendorModel.company_name.ilike(f"%{search}%"),
                VendorModel.contact_name.ilike(f"%{search}%"),
                VendorModel.email.ilike(f"%{search}%"),
            )
        )
    
    result = await db.execute(query)
    vendors = result.scalars().all()
    
    return vendors


@router.get("/{vendor_id}", response_model=VendorResponse)
async def get_vendor(
    vendor_id: UUID,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.VENDOR], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Get vendor by ID"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(VendorModel).where(VendorModel.id == vendor_id)
    
    # Scope by organization unless super_admin
    if RoleEnum.SUPER_ADMIN not in user_roles:
        query = query.where(VendorModel.organization_id == current_user.organization_id)
    
    result = await db.execute(query)
    vendor = result.scalar_one_or_none()
    
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found"
        )
    
    return vendor


@router.post("", response_model=VendorResponse, status_code=status.HTTP_201_CREATED)
async def create_vendor(
    vendor_data: VendorCreate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Create vendor"""
    user_roles = await get_user_roles(current_user, db)
    
    # Set organization_id if not super_admin
    vendor_dict = vendor_data.dict()
    if RoleEnum.SUPER_ADMIN not in user_roles:
        vendor_dict['organization_id'] = current_user.organization_id
    
    vendor = VendorModel(**vendor_dict)
    db.add(vendor)
    await db.commit()
    await db.refresh(vendor)
    
    return vendor


@router.patch("/{vendor_id}", response_model=VendorResponse)
async def update_vendor(
    vendor_id: UUID,
    vendor_data: VendorUpdate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Update vendor"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(VendorModel).where(VendorModel.id == vendor_id)
    
    if RoleEnum.SUPER_ADMIN not in user_roles:
        query = query.where(VendorModel.organization_id == current_user.organization_id)
    
    result = await db.execute(query)
    vendor = result.scalar_one_or_none()
    
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found"
        )
    
    # Update fields
    update_data = vendor_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        if hasattr(vendor, key):
            setattr(vendor, key, value)
    
    await db.commit()
    await db.refresh(vendor)
    
    return vendor


@router.delete("/{vendor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vendor(
    vendor_id: UUID,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Delete vendor (soft delete by setting status)"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(VendorModel).where(VendorModel.id == vendor_id)
    
    if RoleEnum.SUPER_ADMIN not in user_roles:
        query = query.where(VendorModel.organization_id == current_user.organization_id)
    
    result = await db.execute(query)
    vendor = result.scalar_one_or_none()
    
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found"
        )
    
    vendor.status = 'inactive'
    await db.commit()
    
    return None

