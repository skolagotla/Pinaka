"""
Pydantic schemas for Organization
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class OrganizationBase(BaseModel):
    name: str
    type: str  # 'PMC', 'LANDLORD', 'INTERNAL'
    timezone: Optional[str] = None
    country: Optional[str] = None


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    timezone: Optional[str] = None
    country: Optional[str] = None


class Organization(OrganizationBase):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

