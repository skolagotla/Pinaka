"""
Global search endpoint - searches across multiple entities
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import Optional
from uuid import UUID
from core.database import get_db
from core.auth_v2 import get_current_user_v2, get_user_roles, RoleEnum, require_role_v2
from db.models_v2 import (
    Property, Unit, Lease, WorkOrder, Tenant, Landlord, Vendor
)
from db.models_v2 import User

router = APIRouter(prefix="/search", tags=["search"])


@router.get("")
async def global_search(
    q: str = Query(..., description="Search query"),
    type: Optional[str] = Query(None, description="Filter by entity type: properties, tenants, landlords, leases, work_orders"),
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT, RoleEnum.VENDOR], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Global search across entities"""
    user_roles = await get_user_roles(current_user, db)
    search_lower = q.lower()
    results = {}
    
    # Search properties
    if not type or type == "properties":
        query = select(Property)
        if RoleEnum.SUPER_ADMIN not in user_roles:
            query = query.where(Property.organization_id == current_user.organization_id)
        query = query.where(
            or_(
                Property.name.ilike(f"%{search_lower}%"),
                Property.address_line1.ilike(f"%{search_lower}%"),
                Property.city.ilike(f"%{search_lower}%"),
            )
        ).limit(limit)
        prop_result = await db.execute(query)
        results["properties"] = [{"id": str(p.id), "name": p.name or p.address_line1, "address": p.address_line1} for p in prop_result.scalars().all()]
    
    # Search tenants
    if not type or type == "tenants":
        query = select(Tenant)
        if RoleEnum.SUPER_ADMIN not in user_roles:
            query = query.where(Tenant.organization_id == current_user.organization_id)
        query = query.where(
            or_(
                Tenant.name.ilike(f"%{search_lower}%"),
                Tenant.email.ilike(f"%{search_lower}%"),
            )
        ).limit(limit)
        tenant_result = await db.execute(query)
        results["tenants"] = [{"id": str(t.id), "name": t.name, "email": t.email} for t in tenant_result.scalars().all()]
    
    # Search landlords
    if not type or type == "landlords":
        query = select(Landlord)
        if RoleEnum.SUPER_ADMIN not in user_roles:
            query = query.where(Landlord.organization_id == current_user.organization_id)
        query = query.where(
            or_(
                Landlord.name.ilike(f"%{search_lower}%"),
                Landlord.email.ilike(f"%{search_lower}%"),
            )
        ).limit(limit)
        landlord_result = await db.execute(query)
        results["landlords"] = [{"id": str(l.id), "name": l.name, "email": l.email} for l in landlord_result.scalars().all()]
    
    # Search leases
    if not type or type == "leases":
        query = select(Lease)
        if RoleEnum.SUPER_ADMIN not in user_roles:
            query = query.where(Lease.organization_id == current_user.organization_id)
        # Search by lease ID (partial match)
        if search_lower.replace("-", "").isalnum():
            query = query.where(Lease.id.cast(str).ilike(f"%{search_lower}%"))
        lease_result = await db.execute(query.limit(limit))
        results["leases"] = [{"id": str(l.id), "rent_amount": float(l.rent_amount)} for l in lease_result.scalars().all()]
    
    # Search work orders
    if not type or type == "work_orders" or type == "maintenance":
        query = select(WorkOrder)
        if RoleEnum.SUPER_ADMIN not in user_roles:
            query = query.where(WorkOrder.organization_id == current_user.organization_id)
        if RoleEnum.TENANT in user_roles:
            query = query.where(WorkOrder.tenant_id == current_user.id)
        query = query.where(
            or_(
                WorkOrder.title.ilike(f"%{search_lower}%"),
                WorkOrder.description.ilike(f"%{search_lower}%"),
            )
        ).limit(limit)
        wo_result = await db.execute(query)
        results["work_orders"] = [{"id": str(wo.id), "title": wo.title, "status": wo.status} for wo in wo_result.scalars().all()]
    
    return {
        "success": True,
        "query": q,
        "results": results
    }

