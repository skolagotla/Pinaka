"""
Pydantic schemas for Inspection
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime, date
from uuid import UUID


class InspectionBase(BaseModel):
    inspection_type: str  # 'move_in', 'move_out', 'routine', 'damage', etc.
    scheduled_date: date
    notes: Optional[str] = None
    checklist_data: Optional[Dict[str, Any]] = None


class InspectionCreate(InspectionBase):
    organization_id: UUID
    property_id: UUID
    unit_id: Optional[UUID] = None
    lease_id: Optional[UUID] = None


class InspectionUpdate(BaseModel):
    inspection_type: Optional[str] = None
    scheduled_date: Optional[date] = None
    completed_date: Optional[date] = None
    status: Optional[str] = None  # 'scheduled', 'in_progress', 'completed', 'cancelled'
    notes: Optional[str] = None
    checklist_data: Optional[Dict[str, Any]] = None


class Inspection(InspectionBase):
    id: UUID
    organization_id: UUID
    property_id: UUID
    unit_id: Optional[UUID] = None
    lease_id: Optional[UUID] = None
    completed_date: Optional[date] = None
    status: str = "scheduled"
    created_by_user_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

