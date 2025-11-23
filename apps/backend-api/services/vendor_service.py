"""
Vendor/ServiceProvider business logic
"""

from typing import Optional, List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_
from sqlalchemy.orm import selectinload
from db.models import ServiceProvider
from schemas.vendor import VendorCreate, VendorUpdate, VendorQueryParams
from core.exceptions import NotFoundError, ValidationError
import uuid


class VendorService:
    """Service for vendor operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def list(self, query_params: VendorQueryParams, user_context: dict) -> Dict:
        """List vendors with pagination and filters"""
        query = select(ServiceProvider)
        
        # Apply filters
        filters = []
        
        # Only show non-deleted vendors
        filters.append(ServiceProvider.is_deleted == False)
        
        if query_params.type:
            filters.append(ServiceProvider.type == query_params.type.value)
        
        if query_params.category:
            filters.append(ServiceProvider.category == query_params.category)
        
        if query_params.is_active is not None:
            filters.append(ServiceProvider.is_active == query_params.is_active)
        
        if query_params.is_global is not None:
            filters.append(ServiceProvider.is_global == query_params.is_global)
        
        if query_params.search:
            search_term = f"%{query_params.search}%"
            filters.append(
                or_(
                    ServiceProvider.name.ilike(search_term),
                    ServiceProvider.business_name.ilike(search_term),
                    ServiceProvider.email.ilike(search_term),
                    ServiceProvider.phone.ilike(search_term),
                )
            )
        
        # Role-based filtering
        user_role = user_context.get("role")
        if user_role not in ["super_admin", "admin"]:
            # Non-admins only see active vendors
            filters.append(ServiceProvider.is_active == True)
        
        if filters:
            query = query.where(and_(*filters))
        
        # Get total count
        count_query = select(func.count()).select_from(ServiceProvider)
        if filters:
            count_query = count_query.where(and_(*filters))
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        
        # Apply pagination
        offset = (query_params.page - 1) * query_params.limit
        query = query.offset(offset).limit(query_params.limit)
        query = query.order_by(ServiceProvider.created_at.desc())
        
        # Execute query
        result = await self.db.execute(query)
        vendors = result.scalars().all()
        
        # Calculate pagination
        total_pages = (total + query_params.limit - 1) // query_params.limit if total > 0 else 0
        
        return {
            "providers": vendors,
            "pagination": {
                "page": query_params.page,
                "limit": query_params.limit,
                "total": total,
                "totalPages": total_pages,
            },
        }
    
    async def get_by_id(self, vendor_id: str) -> Optional[ServiceProvider]:
        """Get vendor by ID"""
        query = select(ServiceProvider).where(
            ServiceProvider.id == vendor_id,
            ServiceProvider.is_deleted == False,
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def create(self, vendor_data: VendorCreate, user_context: dict) -> ServiceProvider:
        """Create a new vendor"""
        # Generate provider ID
        provider_id = f"provider_{uuid.uuid4().hex[:16]}"
        
        # Create vendor
        vendor = ServiceProvider(
            id=f"cuid_{uuid.uuid4().hex[:25]}",
            provider_id=provider_id,
            type=vendor_data.type.value,
            name=vendor_data.name,
            business_name=vendor_data.business_name,
            contact_name=vendor_data.contact_name,
            email=vendor_data.email,
            phone=vendor_data.phone,
            category=vendor_data.category,
            specialties=vendor_data.specialties or [],
            license_number=vendor_data.license_number,
            address_line1=vendor_data.address_line1,
            address_line2=vendor_data.address_line2,
            city=vendor_data.city,
            province_state=vendor_data.province_state,
            postal_zip=vendor_data.postal_zip,
            country=vendor_data.country,
            country_code=vendor_data.country_code,
            region_code=vendor_data.region_code,
            latitude=vendor_data.latitude,
            longitude=vendor_data.longitude,
            is_global=vendor_data.is_global,
            is_active=vendor_data.is_active,
            invited_by=user_context.get("userId"),
            invited_by_role=user_context.get("role"),
        )
        
        self.db.add(vendor)
        await self.db.commit()
        await self.db.refresh(vendor)
        
        return vendor
    
    async def update(self, vendor_id: str, vendor_data: VendorUpdate) -> ServiceProvider:
        """Update a vendor"""
        vendor = await self.get_by_id(vendor_id)
        if not vendor:
            raise NotFoundError("Vendor not found")
        
        # Update fields
        update_data = vendor_data.model_dump(exclude_unset=True, exclude_none=True)
        for field, value in update_data.items():
            # Handle alias fields
            db_field = field
            if field == "businessName":
                db_field = "business_name"
            elif field == "contactName":
                db_field = "contact_name"
            elif field == "licenseNumber":
                db_field = "license_number"
            elif field == "addressLine1":
                db_field = "address_line1"
            elif field == "addressLine2":
                db_field = "address_line2"
            elif field == "provinceState":
                db_field = "province_state"
            elif field == "postalZip":
                db_field = "postal_zip"
            elif field == "countryCode":
                db_field = "country_code"
            elif field == "regionCode":
                db_field = "region_code"
            elif field == "isGlobal":
                db_field = "is_global"
            elif field == "isActive":
                db_field = "is_active"
            
            setattr(vendor, db_field, value)
        
        await self.db.commit()
        await self.db.refresh(vendor)
        
        return vendor
    
    async def delete(self, vendor_id: str, user_context: dict) -> bool:
        """Soft delete a vendor"""
        vendor = await self.get_by_id(vendor_id)
        if not vendor:
            raise NotFoundError("Vendor not found")
        
        # Soft delete
        vendor.is_deleted = True
        vendor.deleted_by = user_context.get("userId")
        vendor.deleted_by_role = user_context.get("role")
        # deleted_at will be set by updated_at trigger or manually
        
        await self.db.commit()
        return True

