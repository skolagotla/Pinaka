"""
Pydantic schemas for Unit
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class UnitBase(BaseModel):
    unit_number: str
    floor: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    size_sqft: Optional[int] = None
    status: str = "vacant"  # 'vacant', 'occupied', 'maintenance'


class UnitCreate(UnitBase):
    property_id: UUID


class UnitUpdate(BaseModel):
    unit_number: Optional[str] = None
    floor: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    size_sqft: Optional[int] = None
    status: Optional[str] = None


class Unit(UnitBase):
    id: UUID
    property_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

