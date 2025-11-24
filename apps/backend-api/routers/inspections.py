"""
Inspection endpoints (v2)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
from datetime import date
from core.database import get_db
from core.auth_v2 import get_current_user_v2, get_user_roles, RoleEnum, require_role_v2
from core.crud_helpers import apply_pagination
from schemas.inspection import Inspection, InspectionCreate, InspectionUpdate
from db.models_v2 import Inspection as InspectionModel, User, Organization

router = APIRouter(prefix="/inspections", tags=["inspections"])


@router.get("", response_model=List[Inspection])
async def list_inspections(
    organization_id: Optional[UUID] = Query(None),
    property_id: Optional[UUID] = Query(None),
    status_filter: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """List inspections (scoped by organization) with pagination"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(InspectionModel)
    
    # Filter by organization
    if RoleEnum.SUPER_ADMIN in user_roles:
        if organization_id:
            query = query.where(InspectionModel.organization_id == organization_id)
    else:
        query = query.where(InspectionModel.organization_id == current_user.organization_id)
    
    # Additional filters
    if property_id:
        query = query.where(InspectionModel.property_id == property_id)
    if status_filter:
        query = query.where(InspectionModel.status == status_filter)
    
    query = apply_pagination(query, page, limit, InspectionModel.created_at.desc())
    
    result = await db.execute(query)
    inspections = result.scalars().all()
    
    return inspections


@router.post("", response_model=Inspection, status_code=status.HTTP_201_CREATED)
async def create_inspection(
    inspection_data: InspectionCreate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Create inspection"""
    user_roles = await get_user_roles(current_user, db)
    
    # Verify organization access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if inspection_data.organization_id != current_user.organization_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot create inspection for different organization")
    
    inspection = InspectionModel(
        organization_id=inspection_data.organization_id,
        property_id=inspection_data.property_id,
        unit_id=inspection_data.unit_id,
        lease_id=inspection_data.lease_id,
        inspection_type=inspection_data.inspection_type,
        scheduled_date=inspection_data.scheduled_date,
        notes=inspection_data.notes,
        checklist_data=inspection_data.checklist_data,
        created_by_user_id=current_user.id,
    )
    
    db.add(inspection)
    await db.commit()
    await db.refresh(inspection)
    
    return inspection


@router.patch("/{inspection_id}", response_model=Inspection)
async def update_inspection(
    inspection_id: UUID,
    inspection_data: InspectionUpdate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Update inspection"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(InspectionModel).where(InspectionModel.id == inspection_id)
    
    if RoleEnum.SUPER_ADMIN not in user_roles:
        query = query.where(InspectionModel.organization_id == current_user.organization_id)
    
    result = await db.execute(query)
    inspection = result.scalar_one_or_none()
    
    if not inspection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspection not found")
    
    # Update fields
    update_data = inspection_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(inspection, key, value)
    
    await db.commit()
    await db.refresh(inspection)
    
    return inspection

