"""
Pydantic schemas for Property
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class PropertyBase(BaseModel):
    name: Optional[str] = None
    address_line1: str
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    status: str = "active"


class PropertyCreate(PropertyBase):
    organization_id: UUID
    landlord_id: Optional[UUID] = None


class PropertyUpdate(BaseModel):
    name: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    status: Optional[str] = None
    landlord_id: Optional[UUID] = None


class Property(PropertyBase):
    id: UUID
    organization_id: UUID
    landlord_id: Optional[UUID] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

