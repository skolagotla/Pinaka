"""
Lease endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID
from core.database import get_db
from core.auth_v2 import get_current_user_v2, get_user_roles, RoleEnum, require_role_v2
from schemas.lease import Lease, LeaseCreate, LeaseUpdate, LeaseWithTenants, LeaseRenewalRequest, LeaseTerminationRequest
from db.models_v2 import Lease as LeaseModel, LeaseTenant, Unit, Property, Tenant, User, Landlord

router = APIRouter(prefix="/leases", tags=["leases"])


@router.get("", response_model=List[Lease])
async def list_leases(
    organization_id: Optional[UUID] = None,
    unit_id: Optional[UUID] = None,
    tenant_id: Optional[UUID] = None,
    landlord_id: Optional[UUID] = None,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """List leases (scoped by organization and filters)"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(LeaseModel)
    
    # Apply filters
    if organization_id:
        query = query.where(LeaseModel.organization_id == organization_id)
    if unit_id:
        query = query.where(LeaseModel.unit_id == unit_id)
    if tenant_id:
        query = query.where(LeaseModel.tenant_id == tenant_id)
    if landlord_id:
        query = query.where(LeaseModel.landlord_id == landlord_id)
    
    # Filter by organization
    if RoleEnum.SUPER_ADMIN not in user_roles:
        # Non-super users can only see their organization's leases
        query = query.where(LeaseModel.organization_id == current_user.organization_id)
        
        # Tenants can only see their own leases
        if RoleEnum.TENANT in user_roles:
            # Get tenant record for current user
            tenant_result = await db.execute(
                select(Tenant).where(Tenant.user_id == current_user.id)
            )
            tenant = tenant_result.scalar_one_or_none()
            if tenant:
                query = query.where(LeaseModel.tenant_id == tenant.id)
            else:
                # No tenant record, return empty
                return []
    
    result = await db.execute(query)
    leases = result.scalars().all()
    
    return leases


@router.post("", response_model=Lease, status_code=status.HTTP_201_CREATED)
async def create_lease(
    lease_data: LeaseCreate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Create lease"""
    user_roles = await get_user_roles(current_user, db)
    
    # Verify organization access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if lease_data.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot create lease in different organization",
            )
    
    # Verify unit exists and belongs to organization
    unit_result = await db.execute(
        select(Unit).where(Unit.id == lease_data.unit_id)
    )
    unit = unit_result.scalar_one_or_none()
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found",
        )
    
    # Verify tenant exists
    tenant_result = await db.execute(
        select(Tenant).where(Tenant.id == lease_data.tenant_id)
    )
    tenant = tenant_result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found",
        )
    
    # Create lease
    lease = LeaseModel(**lease_data.dict())
    db.add(lease)
    await db.flush()  # Get lease.id
    
    # Create lease_tenant relationship
    lease_tenant = LeaseTenant(
        lease_id=lease.id,
        tenant_id=lease_data.tenant_id,
        is_primary=True,
    )
    db.add(lease_tenant)
    
    await db.commit()
    await db.refresh(lease)
    
    return lease


@router.get("/{lease_id}", response_model=Lease)
async def get_lease(
    lease_id: UUID,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Get lease by ID"""
    user_roles = await get_user_roles(current_user, db)
    
    result = await db.execute(
        select(LeaseModel).where(LeaseModel.id == lease_id)
    )
    lease = result.scalar_one_or_none()
    
    if not lease:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lease not found",
        )
    
    # Check organization access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if lease.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
        
        # Tenants can only see their own leases
        if RoleEnum.TENANT in user_roles:
            tenant_result = await db.execute(
                select(Tenant).where(Tenant.user_id == current_user.id)
            )
            tenant = tenant_result.scalar_one_or_none()
            if not tenant or lease.tenant_id != tenant.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied",
                )
    
    return lease


@router.patch("/{lease_id}", response_model=Lease)
async def update_lease(
    lease_id: UUID,
    lease_data: LeaseUpdate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Update lease"""
    user_roles = await get_user_roles(current_user, db)
    
    result = await db.execute(
        select(LeaseModel).where(LeaseModel.id == lease_id)
    )
    lease = result.scalar_one_or_none()
    
    if not lease:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lease not found",
        )
    
    # Check organization access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if lease.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    # Update fields
    update_data = lease_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(lease, field, value)
    
    await db.commit()
    await db.refresh(lease)
    
    return lease


@router.delete("/{lease_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lease(
    lease_id: UUID,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Delete lease"""
    user_roles = await get_user_roles(current_user, db)
    
    result = await db.execute(
        select(LeaseModel).where(LeaseModel.id == lease_id)
    )
    lease = result.scalar_one_or_none()
    
    if not lease:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lease not found",
        )
    
    # Check organization access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if lease.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    await db.execute(delete(LeaseModel).where(LeaseModel.id == lease_id))
    await db.commit()
    
    return None


@router.post("/{lease_id}/renew", response_model=Lease)
async def renew_lease(
    lease_id: UUID,
    renewal_data: LeaseRenewalRequest,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Renew a lease"""
    user_roles = await get_user_roles(current_user, db)
    
    # Get lease
    result = await db.execute(
        select(LeaseModel).where(LeaseModel.id == lease_id)
    )
    lease = result.scalar_one_or_none()
    
    if not lease:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lease not found",
        )
    
    # Check permissions
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if lease.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
        
        # Landlords can only renew their own leases
        if RoleEnum.LANDLORD in user_roles:
            landlord_result = await db.execute(
                select(Landlord).where(Landlord.user_id == current_user.id)
            )
            landlord = landlord_result.scalar_one_or_none()
            if not landlord or lease.landlord_id != landlord.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied",
                )
        
        # Tenants can only renew their own leases
        if RoleEnum.TENANT in user_roles:
            tenant_result = await db.execute(
                select(Tenant).where(Tenant.user_id == current_user.id)
            )
            tenant = tenant_result.scalar_one_or_none()
            if tenant:
                lease_tenant_result = await db.execute(
                    select(LeaseTenant).where(
                        LeaseTenant.lease_id == lease_id,
                        LeaseTenant.tenant_id == tenant.id
                    )
                )
                if not lease_tenant_result.scalar_one_or_none():
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied",
                    )
            else:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied",
                )
    
    # Update lease based on renewal decision
    if renewal_data.decision == 'renew':
        if renewal_data.new_lease_end:
            lease.end_date = renewal_data.new_lease_end
        if renewal_data.new_rent_amount is not None:
            lease.rent_amount = renewal_data.new_rent_amount
        lease.status = 'active'
    elif renewal_data.decision == 'month-to-month':
        # Convert to month-to-month (no end date - set far future)
        from datetime import date as date_class
        lease.end_date = date_class(2099, 12, 31)  # Far future date
        if renewal_data.new_rent_amount is not None:
            lease.rent_amount = renewal_data.new_rent_amount
        lease.status = 'active'
    elif renewal_data.decision == 'terminate':
        lease.status = 'terminated'
    
    await db.commit()
    await db.refresh(lease)
    
    return lease


@router.post("/{lease_id}/terminate", response_model=Lease)
async def terminate_lease(
    lease_id: UUID,
    termination_data: LeaseTerminationRequest,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Terminate a lease"""
    user_roles = await get_user_roles(current_user, db)
    
    # Get lease
    result = await db.execute(
        select(LeaseModel).where(LeaseModel.id == lease_id)
    )
    lease = result.scalar_one_or_none()
    
    if not lease:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lease not found",
        )
    
    # Check permissions (same as renew)
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if lease.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
        
        # Landlords can only terminate their own leases
        if RoleEnum.LANDLORD in user_roles:
            landlord_result = await db.execute(
                select(Landlord).where(Landlord.user_id == current_user.id)
            )
            landlord = landlord_result.scalar_one_or_none()
            if not landlord or lease.landlord_id != landlord.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied",
                )
        
        # Tenants can only terminate their own leases
        if RoleEnum.TENANT in user_roles:
            tenant_result = await db.execute(
                select(Tenant).where(Tenant.user_id == current_user.id)
            )
            tenant = tenant_result.scalar_one_or_none()
            if tenant:
                lease_tenant_result = await db.execute(
                    select(LeaseTenant).where(
                        LeaseTenant.lease_id == lease_id,
                        LeaseTenant.tenant_id == tenant.id
                    )
                )
                if not lease_tenant_result.scalar_one_or_none():
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied",
                    )
            else:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied",
                )
    
    # Update lease status to terminated
    lease.status = 'terminated'
    lease.end_date = termination_data.termination_date
    
    # Store termination metadata in a JSON field if available
    # For now, we'll just update the status and end_date
    
    await db.commit()
    await db.refresh(lease)
    
    return lease

