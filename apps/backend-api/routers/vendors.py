"""
Vendor/ServiceProvider API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from core.database import get_db
from core.auth import get_current_user, require_role
from schemas.vendor import (
    VendorCreate,
    VendorUpdate,
    VendorResponse,
    VendorListResponse,
    VendorQueryParams,
    ServiceProviderType,
)
from services.vendor_service import VendorService
from core.exceptions import NotFoundError

router = APIRouter()


@router.get("", response_model=VendorListResponse)
async def list_vendors(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=1000),
    type: Optional[ServiceProviderType] = None,
    category: Optional[str] = None,
    is_active: Optional[bool] = None,
    is_global: Optional[bool] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """List vendors with pagination and filters"""
    query_params = VendorQueryParams(
        page=page,
        limit=limit,
        type=type,
        category=category,
        is_active=is_active,
        is_global=is_global,
        search=search,
    )
    
    service = VendorService(db)
    result = await service.list(query_params, current_user)
    
    return {
        "success": True,
        "data": result["providers"],
        "pagination": result["pagination"],
    }


@router.get("/{vendor_id}", response_model=dict)
async def get_vendor(
    vendor_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get a single vendor by ID"""
    service = VendorService(db)
    vendor = await service.get_by_id(vendor_id)
    
    if not vendor:
        raise NotFoundError("Vendor not found")
    
    return {
        "success": True,
        "data": vendor,
    }


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_vendor(
    vendor_data: VendorCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role(["super_admin", "pmc_admin", "pm", "landlord"])),
):
    """Create a new vendor"""
    service = VendorService(db)
    vendor = await service.create(vendor_data, current_user)
    
    return {
        "success": True,
        "data": vendor,
    }


@router.patch("/{vendor_id}", response_model=dict)
async def update_vendor(
    vendor_id: str,
    vendor_data: VendorUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role(["super_admin", "pmc_admin", "pm", "landlord"])),
):
    """Update a vendor"""
    service = VendorService(db)
    
    try:
        vendor = await service.update(vendor_id, vendor_data)
        return {
            "success": True,
            "data": vendor,
        }
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{vendor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vendor(
    vendor_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role(["super_admin", "pmc_admin", "pm", "landlord"])),
):
    """Delete a vendor (soft delete)"""
    service = VendorService(db)
    
    try:
        await service.delete(vendor_id, current_user)
        return None
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

