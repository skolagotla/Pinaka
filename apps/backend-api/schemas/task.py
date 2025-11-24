"""
Pydantic schemas for Task
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None  # 'rent', 'lease', 'maintenance', 'legal', 'inspection', 'general'
    due_date: datetime
    priority: str = "medium"  # 'low', 'medium', 'high', 'urgent'
    property_id: Optional[UUID] = None


class TaskCreate(TaskBase):
    organization_id: UUID


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    is_completed: Optional[bool] = None
    property_id: Optional[UUID] = None


class Task(TaskBase):
    id: UUID
    organization_id: UUID
    created_by_user_id: UUID
    is_completed: bool = False
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

