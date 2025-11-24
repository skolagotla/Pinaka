"""
Pydantic schemas for Landlord
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID


class LandlordBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: str = "active"


class LandlordCreate(LandlordBase):
    organization_id: UUID
    user_id: Optional[UUID] = None


class LandlordUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    user_id: Optional[UUID] = None


class Landlord(LandlordBase):
    id: UUID
    organization_id: UUID
    user_id: Optional[UUID] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

