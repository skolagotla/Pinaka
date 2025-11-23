"""
Vendor/ServiceProvider Pydantic schemas
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ServiceProviderType(str, Enum):
    """Service provider type"""
    VENDOR = "vendor"
    CONTRACTOR = "contractor"


class VendorBase(BaseModel):
    """Base vendor schema"""
    type: ServiceProviderType
    name: str = Field(..., min_length=1, description="Name is required")
    business_name: Optional[str] = Field(None, alias="businessName")
    contact_name: Optional[str] = Field(None, alias="contactName")
    email: EmailStr
    phone: str = Field(..., min_length=1, description="Phone is required")
    category: Optional[str] = None
    specialties: List[str] = Field(default_factory=list)
    license_number: Optional[str] = Field(None, alias="licenseNumber")
    address_line1: Optional[str] = Field(None, alias="addressLine1")
    address_line2: Optional[str] = Field(None, alias="addressLine2")
    city: Optional[str] = None
    province_state: Optional[str] = Field(None, alias="provinceState")
    postal_zip: Optional[str] = Field(None, alias="postalZip")
    country: Optional[str] = None
    country_code: Optional[str] = Field(None, alias="countryCode")
    region_code: Optional[str] = Field(None, alias="regionCode")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_global: bool = Field(default=False, alias="isGlobal")
    is_active: bool = Field(default=True, alias="isActive")
    
    class Config:
        populate_by_name = True


class VendorCreate(VendorBase):
    """Schema for creating a vendor"""
    pass


class VendorUpdate(BaseModel):
    """Schema for updating a vendor"""
    name: Optional[str] = None
    business_name: Optional[str] = Field(None, alias="businessName")
    contact_name: Optional[str] = Field(None, alias="contactName")
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    category: Optional[str] = None
    specialties: Optional[List[str]] = None
    license_number: Optional[str] = Field(None, alias="licenseNumber")
    address_line1: Optional[str] = Field(None, alias="addressLine1")
    address_line2: Optional[str] = Field(None, alias="addressLine2")
    city: Optional[str] = None
    province_state: Optional[str] = Field(None, alias="provinceState")
    postal_zip: Optional[str] = Field(None, alias="postalZip")
    country: Optional[str] = None
    country_code: Optional[str] = Field(None, alias="countryCode")
    region_code: Optional[str] = Field(None, alias="regionCode")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_global: Optional[bool] = Field(None, alias="isGlobal")
    is_active: Optional[bool] = Field(None, alias="isActive")
    
    class Config:
        populate_by_name = True


class VendorResponse(VendorBase):
    """Schema for vendor response"""
    id: str
    provider_id: str = Field(..., alias="providerId")
    rating: Optional[float] = None
    hourly_rate: Optional[float] = Field(None, alias="hourlyRate")
    notes: Optional[str] = None
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")
    
    class Config:
        populate_by_name = True
        from_attributes = True


class VendorListResponse(BaseModel):
    """Schema for vendor list response"""
    success: bool = True
    data: List[VendorResponse]
    pagination: dict


class VendorQueryParams(BaseModel):
    """Schema for vendor query parameters"""
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=50, ge=1, le=1000)
    type: Optional[ServiceProviderType] = None
    category: Optional[str] = None
    is_active: Optional[bool] = Field(None, alias="isActive")
    is_global: Optional[bool] = Field(None, alias="isGlobal")
    search: Optional[str] = None
    
    class Config:
        populate_by_name = True

