"""
Vendor v2 Pydantic schemas - matches v2 Vendor model
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class VendorBase(BaseModel):
    """Base vendor schema"""
    organization_id: UUID
    user_id: Optional[UUID] = None
    company_name: str
    contact_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    service_categories: Optional[List[str]] = None
    status: str = "active"


class VendorCreate(VendorBase):
    """Schema for creating a vendor"""
    pass


class VendorUpdate(BaseModel):
    """Schema for updating a vendor"""
    company_name: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    service_categories: Optional[List[str]] = None
    status: Optional[str] = None


class VendorResponse(BaseModel):
    """Schema for vendor response"""
    id: UUID
    organization_id: UUID
    user_id: Optional[UUID] = None
    company_name: str
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    service_categories: Optional[List[str]] = None
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

