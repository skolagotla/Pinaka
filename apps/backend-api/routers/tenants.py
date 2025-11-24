"""
Tenant endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func
from datetime import datetime
from typing import List, Optional
from uuid import UUID
from core.database import get_db
from core.auth_v2 import get_current_user_v2, get_user_roles, RoleEnum, require_role_v2
from schemas.tenant import Tenant, TenantCreate, TenantUpdate, TenantApprovalRequest, TenantRejectionRequest
from db.models_v2 import Tenant as TenantModel, User, Organization, Landlord, Lease, LeaseTenant, Property, Unit

router = APIRouter(prefix="/tenants", tags=["tenants"])


@router.get("", response_model=List[Tenant])
async def list_tenants(
    organization_id: Optional[UUID] = None,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """List tenants (scoped by organization)"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(TenantModel)
    
    # Filter by organization
    if RoleEnum.SUPER_ADMIN in user_roles:
        if organization_id:
            query = query.where(TenantModel.organization_id == organization_id)
    else:
        # Non-super users can only see their organization's tenants
        query = query.where(TenantModel.organization_id == current_user.organization_id)
    
    result = await db.execute(query)
    tenants = result.scalars().all()
    
    return tenants


@router.post("", response_model=Tenant, status_code=status.HTTP_201_CREATED)
async def create_tenant(
    tenant_data: TenantCreate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Create tenant"""
    user_roles = await get_user_roles(current_user, db)
    
    # Verify organization access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if tenant_data.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot create tenant in different organization",
            )
    
    # Verify organization exists
    org_result = await db.execute(
        select(Organization).where(Organization.id == tenant_data.organization_id)
    )
    org = org_result.scalar_one_or_none()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found",
        )
    
    tenant = TenantModel(**tenant_data.dict())
    db.add(tenant)
    await db.commit()
    await db.refresh(tenant)
    
    return tenant


@router.get("/{tenant_id}", response_model=Tenant)
async def get_tenant(
    tenant_id: UUID,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Get tenant by ID"""
    user_roles = await get_user_roles(current_user, db)
    
    result = await db.execute(
        select(TenantModel).where(TenantModel.id == tenant_id)
    )
    tenant = result.scalar_one_or_none()
    
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found",
        )
    
    # Check organization access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if tenant.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
        # Tenants can only see themselves
        if RoleEnum.TENANT in user_roles:
            # Check if current user is linked to this tenant
            if tenant.user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied",
                )
    
    return tenant


@router.patch("/{tenant_id}", response_model=Tenant)
async def update_tenant(
    tenant_id: UUID,
    tenant_data: TenantUpdate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Update tenant"""
    user_roles = await get_user_roles(current_user, db)
    
    result = await db.execute(
        select(TenantModel).where(TenantModel.id == tenant_id)
    )
    tenant = result.scalar_one_or_none()
    
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found",
        )
    
    # Check organization access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if tenant.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    # Update fields
    update_data = tenant_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tenant, field, value)
    
    await db.commit()
    await db.refresh(tenant)
    
    return tenant


@router.delete("/{tenant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tenant(
    tenant_id: UUID,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Delete tenant"""
    user_roles = await get_user_roles(current_user, db)
    
    result = await db.execute(
        select(TenantModel).where(TenantModel.id == tenant_id)
    )
    tenant = result.scalar_one_or_none()
    
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found",
        )
    
    # Check organization access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if tenant.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    await db.execute(delete(TenantModel).where(TenantModel.id == tenant_id))
    await db.commit()
    
    return None


@router.post("/{tenant_id}/approve", response_model=Tenant)
async def approve_tenant(
    tenant_id: UUID,
    approval_data: TenantApprovalRequest,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Approve a tenant"""
    user_roles = await get_user_roles(current_user, db)
    
    # Get tenant
    result = await db.execute(
        select(TenantModel).where(TenantModel.id == tenant_id)
    )
    tenant = result.scalar_one_or_none()
    
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found",
        )
    
    # Check access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if tenant.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
        
        # Landlords can only approve tenants for their properties
        if RoleEnum.LANDLORD in user_roles:
            landlord_result = await db.execute(
                select(Landlord).where(Landlord.user_id == current_user.id)
            )
            landlord = landlord_result.scalar_one_or_none()
            if not landlord:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied",
                )
            # Check if tenant is linked to landlord's properties via leases
            # This is a simplified check - in production, you'd verify via lease_tenants
    
    # Update tenant status to approved
    tenant.status = 'approved'
    
    await db.commit()
    await db.refresh(tenant)
    
    return tenant


@router.post("/{tenant_id}/reject", response_model=Tenant)
async def reject_tenant(
    tenant_id: UUID,
    rejection_data: TenantRejectionRequest,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Reject a tenant"""
    user_roles = await get_user_roles(current_user, db)
    
    # Get tenant
    result = await db.execute(
        select(TenantModel).where(TenantModel.id == tenant_id)
    )
    tenant = result.scalar_one_or_none()
    
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found",
        )
    
    # Check access (same as approve)
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if tenant.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
        
        if RoleEnum.LANDLORD in user_roles:
            landlord_result = await db.execute(
                select(Landlord).where(Landlord.user_id == current_user.id)
            )
            landlord = landlord_result.scalar_one_or_none()
            if not landlord:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied",
                )
    
    # Update tenant status to rejected
    tenant.status = 'rejected'
    # Note: rejection_reason would need to be added to the Tenant model if needed
    
    await db.commit()
    await db.refresh(tenant)
    
    return tenant


@router.get("/{tenant_id}/rent-data")
async def get_tenant_rent_data(
    tenant_id: UUID,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Get tenant rent data (rent payments, lease info)"""
    user_roles = await get_user_roles(current_user, db)
    
    # Only landlords can access this
    if RoleEnum.LANDLORD not in user_roles and RoleEnum.SUPER_ADMIN not in user_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    # Get tenant
    result = await db.execute(
        select(TenantModel).where(TenantModel.id == tenant_id)
    )
    tenant = result.scalar_one_or_none()
    
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found",
        )
    
    # Check access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if tenant.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    # Get active lease for this tenant
    lease_tenant_result = await db.execute(
        select(LeaseTenant)
        .join(Lease, LeaseTenant.lease_id == Lease.id)
        .where(
            LeaseTenant.tenant_id == tenant_id,
            Lease.status == 'active'
        )
    )
    active_lease_tenant = lease_tenant_result.scalar_one_or_none()
    
    if not active_lease_tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active lease found for this tenant",
        )
    
    # Get lease
    lease_result = await db.execute(
        select(Lease).where(Lease.id == active_lease_tenant.lease_id)
    )
    lease = lease_result.scalar_one_or_none()
    
    if not lease:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lease not found",
        )
    
    # Get property and unit
    unit_result = await db.execute(
        select(Unit).where(Unit.id == lease.unit_id)
    )
    unit = unit_result.scalar_one_or_none()
    
    property_obj = None
    if unit:
        prop_result = await db.execute(
            select(Property).where(Property.id == unit.property_id)
        )
        property_obj = prop_result.scalar_one_or_none()
    
    # TODO: Get rent payments - this would require a RentPayment model/table
    # For now, return lease info without payments
    return {
        "lease": {
            "id": str(lease.id),
            "rent_amount": float(lease.rent_amount),
            "start_date": lease.start_date.isoformat(),
            "end_date": lease.end_date.isoformat() if lease.end_date else None,
        },
        "property": {
            "id": str(property_obj.id),
            "name": property_obj.name,
            "address_line1": property_obj.address_line1,
        } if property_obj else None,
        "unit": {
            "id": str(unit.id),
            "name": unit.name,
        } if unit else None,
        "rent_payments": [],  # TODO: Add rent payments when RentPayment model is available
    }


@router.get("/with-outstanding-balance")
async def get_tenants_with_outstanding_balance(
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Get tenants with outstanding balance"""
    user_roles = await get_user_roles(current_user, db)
    
    # Get landlord ID for filtering
    landlord_id = None
    if RoleEnum.LANDLORD in user_roles:
        landlord_result = await db.execute(
            select(Landlord).where(Landlord.user_id == current_user.id)
        )
        landlord = landlord_result.scalar_one_or_none()
        if landlord:
            landlord_id = landlord.id
    
    # Get tenants with active leases
    query = select(TenantModel)
    if RoleEnum.SUPER_ADMIN not in user_roles:
        query = query.where(TenantModel.organization_id == current_user.organization_id)
    
    result = await db.execute(query)
    tenants = result.scalars().all()
    
    # Filter tenants with outstanding balance
    # TODO: This requires RentPayment model to calculate actual balances
    # For now, return empty list
    tenants_with_balance = []
    
    return {
        "success": True,
        "tenants": tenants_with_balance,
    }

