"""
Rent Payment endpoints (v2)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
from datetime import date
from core.database import get_db
from core.auth_v2 import get_current_user_v2, get_user_roles, RoleEnum, require_role_v2
from schemas.rent_payment import RentPayment, RentPaymentCreate, RentPaymentUpdate
from db.models_v2 import RentPayment as RentPaymentModel, User, Organization, Lease, Tenant

router = APIRouter(prefix="/rent-payments", tags=["rent-payments"])


@router.get("", response_model=List[RentPayment])
async def list_rent_payments(
    organization_id: Optional[UUID] = Query(None),
    lease_id: Optional[UUID] = Query(None),
    tenant_id: Optional[UUID] = Query(None),
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """List rent payments (scoped by organization and role)"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(RentPaymentModel)
    
    # Filter by organization
    if RoleEnum.SUPER_ADMIN in user_roles:
        if organization_id:
            query = query.where(RentPaymentModel.organization_id == organization_id)
    else:
        query = query.where(RentPaymentModel.organization_id == current_user.organization_id)
    
    # Additional filters
    if lease_id:
        query = query.where(RentPaymentModel.lease_id == lease_id)
    if tenant_id:
        query = query.where(RentPaymentModel.tenant_id == tenant_id)
    if status_filter:
        query = query.where(RentPaymentModel.status == status_filter)
    
    # Role-based filtering
    if RoleEnum.TENANT in user_roles:
        query = query.where(RentPaymentModel.tenant_id == current_user.id)
    
    result = await db.execute(query)
    payments = result.scalars().all()
    
    return payments


@router.post("", response_model=RentPayment, status_code=status.HTTP_201_CREATED)
async def create_rent_payment(
    payment_data: RentPaymentCreate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Create rent payment"""
    user_roles = await get_user_roles(current_user, db)
    
    # Verify organization access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if payment_data.organization_id != current_user.organization_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot create payment for different organization")
    
    payment = RentPaymentModel(
        organization_id=payment_data.organization_id,
        lease_id=payment_data.lease_id,
        tenant_id=payment_data.tenant_id,
        amount=payment_data.amount,
        payment_date=payment_data.payment_date,
        payment_method=payment_data.payment_method,
        reference_number=payment_data.reference_number,
        notes=payment_data.notes,
    )
    
    db.add(payment)
    await db.commit()
    await db.refresh(payment)
    
    return payment


@router.patch("/{payment_id}", response_model=RentPayment)
async def update_rent_payment(
    payment_id: UUID,
    payment_data: RentPaymentUpdate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Update rent payment"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(RentPaymentModel).where(RentPaymentModel.id == payment_id)
    
    if RoleEnum.SUPER_ADMIN not in user_roles:
        query = query.where(RentPaymentModel.organization_id == current_user.organization_id)
    
    result = await db.execute(query)
    payment = result.scalar_one_or_none()
    
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rent payment not found")
    
    # Update fields
    update_data = payment_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(payment, key, value)
    
    await db.commit()
    await db.refresh(payment)
    
    return payment

