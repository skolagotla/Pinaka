"""
Work Order endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID
from core.database import get_db
from core.auth_v2 import get_current_user_v2, get_user_roles, RoleEnum, require_role_v2
from schemas.work_order import WorkOrder, WorkOrderCreate, WorkOrderUpdate
from schemas.work_order_comment import WorkOrderComment, WorkOrderCommentCreate
from db.models_v2 import (
    WorkOrder as WorkOrderModel,
    WorkOrderComment as CommentModel,
    User,
    Property,
)

router = APIRouter(prefix="/work-orders", tags=["work-orders"])


@router.get("", response_model=List[WorkOrder])
async def list_work_orders(
    organization_id: Optional[UUID] = None,
    property_id: Optional[UUID] = None,
    status_filter: Optional[str] = None,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT, RoleEnum.VENDOR], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """List work orders (scoped by organization and role)"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(WorkOrderModel).options(
        selectinload(WorkOrderModel.comments).selectinload(CommentModel.author),
    )
    
    # Filter by organization
    if RoleEnum.SUPER_ADMIN in user_roles:
        if organization_id:
            query = query.where(WorkOrderModel.organization_id == organization_id)
    else:
        query = query.where(WorkOrderModel.organization_id == current_user.organization_id)
    
    # Additional filters
    if property_id:
        query = query.where(WorkOrderModel.property_id == property_id)
    
    if status_filter:
        query = query.where(WorkOrderModel.status == status_filter)
    
    # Role-based filtering
    if RoleEnum.TENANT in user_roles:
        # Tenants see only their own work orders
        query = query.where(WorkOrderModel.tenant_id == current_user.id)
    elif RoleEnum.VENDOR in user_roles:
        # Vendors see only assigned work orders (via assignments table)
        # This would require a join - simplified for now
        pass
    
    result = await db.execute(query)
    work_orders = result.scalars().all()
    
    return work_orders


@router.post("", response_model=WorkOrder, status_code=status.HTTP_201_CREATED)
async def create_work_order(
    work_order_data: WorkOrderCreate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Create work order"""
    user_roles = await get_user_roles(current_user, db)
    
    # Verify organization access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if work_order_data.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot create work order in different organization",
            )
    
    # Verify property exists
    prop_result = await db.execute(
        select(Property).where(Property.id == work_order_data.property_id)
    )
    prop = prop_result.scalar_one_or_none()
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found",
        )
    
    work_order = WorkOrderModel(
        **work_order_data.dict(),
        created_by_user_id=current_user.id,
    )
    db.add(work_order)
    await db.commit()
    await db.refresh(work_order)
    
    return work_order


@router.get("/{work_order_id}", response_model=WorkOrder)
async def get_work_order(
    work_order_id: UUID,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT, RoleEnum.VENDOR], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Get work order by ID"""
    result = await db.execute(
        select(WorkOrderModel)
        .options(
            selectinload(WorkOrderModel.comments).selectinload(CommentModel.author),
        )
        .where(WorkOrderModel.id == work_order_id)
    )
    work_order = result.scalar_one_or_none()
    
    if not work_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work order not found",
        )
    
    user_roles = await get_user_roles(current_user, db)
    
    # Check access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if work_order.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
        
        # Tenants can only see their own work orders
        if RoleEnum.TENANT in user_roles:
            if work_order.tenant_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied",
                )
    
    return work_order


@router.patch("/{work_order_id}", response_model=WorkOrder)
async def update_work_order(
    work_order_id: UUID,
    work_order_data: WorkOrderUpdate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Update work order"""
    result = await db.execute(
        select(WorkOrderModel).where(WorkOrderModel.id == work_order_id)
    )
    work_order = result.scalar_one_or_none()
    
    if not work_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work order not found",
        )
    
    user_roles = await get_user_roles(current_user, db)
    
    # Check access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if work_order.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    # Update fields
    update_data = work_order_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(work_order, field, value)
    
    await db.commit()
    await db.refresh(work_order)
    
    return work_order


@router.post("/{work_order_id}/comments", response_model=WorkOrderComment, status_code=status.HTTP_201_CREATED)
async def create_work_order_comment(
    work_order_id: UUID,
    comment_data: WorkOrderCommentCreate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT, RoleEnum.VENDOR], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Add comment to work order"""
    # Verify work order exists and user has access
    wo_result = await db.execute(
        select(WorkOrderModel).where(WorkOrderModel.id == work_order_id)
    )
    work_order = wo_result.scalar_one_or_none()
    
    if not work_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work order not found",
        )
    
    user_roles = await get_user_roles(current_user, db)
    
    # Check access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if work_order.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    comment = CommentModel(
        work_order_id=work_order_id,
        author_user_id=current_user.id,
        **comment_data.dict(),
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    
    # Load author relationship
    await db.refresh(comment, ["author"])
    
    return comment

