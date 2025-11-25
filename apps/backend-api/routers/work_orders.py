"""
Work Order endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID
from core.database import get_db
from core.auth_v2 import get_current_user_v2, get_user_roles, RoleEnum, require_role_v2
from core.rbac import require_permission, PermissionAction, ResourceType
from core.crud_helpers import apply_organization_filter, apply_pagination
from schemas.work_order import WorkOrder, WorkOrderCreate, WorkOrderUpdate, WorkOrderApprovalRequest, WorkOrderMarkViewedRequest, WorkOrderAssignVendorRequest
from schemas.work_order_comment import WorkOrderComment, WorkOrderCommentCreate
from db.models_v2 import (
    WorkOrder as WorkOrderModel,
    WorkOrderComment as CommentModel,
    User,
    Property,
    Tenant,
    Landlord,
    Vendor,
    WorkOrderAssignment,
)

router = APIRouter(prefix="/work-orders", tags=["work-orders"])


@router.get("", response_model=List[WorkOrder])
async def list_work_orders(
    organization_id: Optional[UUID] = None,
    property_id: Optional[UUID] = None,
    status_filter: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_permission(PermissionAction.READ, ResourceType.WORK_ORDER)),
    db: AsyncSession = Depends(get_db)
):
    """List work orders (scoped by organization and role) with pagination"""
    user_roles = await get_user_roles(current_user, db)
    
    # Base query with eager loading for related entities
    query = select(WorkOrderModel).options(
        selectinload(WorkOrderModel.comments).selectinload(CommentModel.author),
        selectinload(WorkOrderModel.property),
        selectinload(WorkOrderModel.tenant),
        selectinload(WorkOrderModel.unit),
    )
    
    # Build count query with same filters
    count_query = select(func.count()).select_from(WorkOrderModel)
    
    # Filter by organization (note: count_query not used, but keeping for potential future use)
    query = await apply_organization_filter(query, WorkOrderModel, current_user, user_roles, organization_id)
    
    # Additional filters
    if property_id:
        query = query.where(WorkOrderModel.property_id == property_id)
        count_query = count_query.where(WorkOrderModel.property_id == property_id)
    
    if status_filter:
        query = query.where(WorkOrderModel.status == status_filter)
        count_query = count_query.where(WorkOrderModel.status == status_filter)
    
    # Role-based filtering
    if RoleEnum.TENANT in user_roles:
        # Tenants see only their own work orders
        query = query.where(WorkOrderModel.tenant_id == current_user.id)
        count_query = count_query.where(WorkOrderModel.tenant_id == current_user.id)
    elif RoleEnum.VENDOR in user_roles:
        # Vendors see only assigned work orders (via assignments table)
        vendor_subquery = select(Vendor.id).where(Vendor.user_id == current_user.id)
        assignment_subquery = select(WorkOrderAssignment.work_order_id).where(
            WorkOrderAssignment.vendor_id.in_(vendor_subquery)
        )
        query = query.where(WorkOrderModel.id.in_(assignment_subquery))
        count_query = count_query.where(WorkOrderModel.id.in_(assignment_subquery))
    
    # Apply pagination
    query = apply_pagination(query, page, limit, WorkOrderModel.created_at.desc())
    
    result = await db.execute(query)
    work_orders = result.scalars().all()
    
    return work_orders


@router.post("", response_model=WorkOrder, status_code=status.HTTP_201_CREATED)
async def create_work_order(
    work_order_data: WorkOrderCreate,
    current_user: User = Depends(require_permission(PermissionAction.CREATE, ResourceType.WORK_ORDER)),
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
    current_user: User = Depends(require_permission(PermissionAction.READ, ResourceType.WORK_ORDER)),
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
    current_user: User = Depends(require_permission(PermissionAction.READ, ResourceType.WORK_ORDER)),
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


@router.post("/{work_order_id}/approve", response_model=WorkOrder)
async def approve_work_order(
    work_order_id: UUID,
    approval_data: WorkOrderApprovalRequest,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Approve a work order"""
    user_roles = await get_user_roles(current_user, db)
    
    # Get work order
    result = await db.execute(
        select(WorkOrderModel).where(WorkOrderModel.id == work_order_id)
    )
    work_order = result.scalar_one_or_none()
    
    if not work_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work order not found",
        )
    
    # Check access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if work_order.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
        
        # Landlords can only approve work orders for their properties
        if RoleEnum.LANDLORD in user_roles:
            landlord_result = await db.execute(
                select(Landlord).where(Landlord.user_id == current_user.id)
            )
            landlord = landlord_result.scalar_one_or_none()
            if landlord:
                # Check if property belongs to landlord
                prop_result = await db.execute(
                    select(Property).where(
                        Property.id == work_order.property_id,
                        Property.landlord_id == landlord.id
                    )
                )
                if not prop_result.scalar_one_or_none():
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied",
                    )
            else:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied",
                )
    
    # Update work order status to in_progress (approved)
    work_order.status = 'in_progress'
    
    # Store approval metadata if needed (could add approved_amount, approved_by fields to model)
    # For now, we'll just update the status
    
    await db.commit()
    await db.refresh(work_order)
    
    return work_order


@router.post("/{work_order_id}/assign-vendor", response_model=WorkOrder)
async def assign_vendor_to_work_order(
    work_order_id: UUID,
    assignment_data: WorkOrderAssignVendorRequest,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Assign a vendor to a work order"""
    from db.models_v2 import WorkOrderAssignment, Vendor
    
    user_roles = await get_user_roles(current_user, db)
    
    # Get work order
    wo_result = await db.execute(
        select(WorkOrderModel).where(WorkOrderModel.id == work_order_id)
    )
    work_order = wo_result.scalar_one_or_none()
    
    if not work_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work order not found",
        )
    
    # Check access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if work_order.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    # Verify vendor exists
    vendor_result = await db.execute(
        select(Vendor).where(Vendor.id == assignment_data.vendor_id)
    )
    vendor = vendor_result.scalar_one_or_none()
    
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found",
        )
    
    # Create assignment
    assignment = WorkOrderAssignment(
        work_order_id=work_order_id,
        vendor_id=assignment_data.vendor_id,
        assigned_by_user_id=current_user.id,
        status='assigned',
    )
    db.add(assignment)
    
    # Update work order status if needed
    if work_order.status == 'new':
        work_order.status = 'waiting_on_vendor'
    
    await db.commit()
    await db.refresh(work_order)
    await db.refresh(assignment)
    
    return work_order


@router.post("/{work_order_id}/mark-viewed", status_code=status.HTTP_200_OK)
async def mark_work_order_viewed(
    work_order_id: UUID,
    view_data: WorkOrderMarkViewedRequest,
    current_user: User = Depends(require_permission(PermissionAction.CREATE, ResourceType.WORK_ORDER)),
    db: AsyncSession = Depends(get_db)
):
    """Mark work order as viewed"""
    user_roles = await get_user_roles(current_user, db)
    
    # Get work order
    result = await db.execute(
        select(WorkOrderModel).where(WorkOrderModel.id == work_order_id)
    )
    work_order = result.scalar_one_or_none()
    
    if not work_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work order not found",
        )
    
    # Check access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if work_order.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
        
        # Tenants can only mark their own work orders as viewed
        if RoleEnum.TENANT in user_roles:
            tenant_result = await db.execute(
                select(Tenant).where(Tenant.user_id == current_user.id)
            )
            tenant = tenant_result.scalar_one_or_none()
            if not tenant or work_order.tenant_id != tenant.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied",
                )
        
        # Landlords can mark work orders for their properties as viewed
        if RoleEnum.LANDLORD in user_roles:
            landlord_result = await db.execute(
                select(Landlord).where(Landlord.user_id == current_user.id)
            )
            landlord = landlord_result.scalar_one_or_none()
            if landlord:
                prop_result = await db.execute(
                    select(Property).where(
                        Property.id == work_order.property_id,
                        Property.landlord_id == landlord.id
                    )
                )
                if not prop_result.scalar_one_or_none():
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied",
                    )
            else:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied",
                )
    
    # Note: The v2 schema doesn't have last_viewed_by_landlord or last_viewed_by_tenant fields
    # This would need to be added to the model if tracking is required
    # For now, we'll just return success
    
    return {"success": True, "message": "Work order marked as viewed"}


@router.get("/{work_order_id}/download-pdf")
async def download_work_order_pdf(
    work_order_id: UUID,
    current_user: User = Depends(require_permission(PermissionAction.CREATE, ResourceType.WORK_ORDER)),
    db: AsyncSession = Depends(get_db)
):
    """Download work order as PDF"""
    from fastapi.responses import Response
    
    user_roles = await get_user_roles(current_user, db)
    
    # Get work order with relationships
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
    
    # Check access (same as get_work_order)
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if work_order.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
        
        if RoleEnum.TENANT in user_roles:
            tenant_result = await db.execute(
                select(Tenant).where(Tenant.user_id == current_user.id)
            )
            tenant = tenant_result.scalar_one_or_none()
            if not tenant or work_order.tenant_id != tenant.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied",
                )
    
    # TODO: Generate PDF using a PDF library (e.g., reportlab, weasyprint)
    # For now, return a placeholder response
    # In production, you would:
    # 1. Load property, unit, tenant relationships
    # 2. Generate PDF with work order details
    # 3. Return PDF as response
    
    return Response(
        content="PDF generation not yet implemented",
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="work-order-{work_order_id}.pdf"'
        }
    )

