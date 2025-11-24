"""
Pydantic schemas for Notification
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class NotificationBase(BaseModel):
    entity_type: str
    entity_id: UUID
    type: str  # 'MESSAGE_RECEIVED', 'WORK_ORDER_UPDATED', 'RENT_DUE', etc.
    is_read: bool = False


class NotificationCreate(NotificationBase):
    user_id: UUID
    organization_id: UUID


class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None


class Notification(NotificationBase):
    id: UUID
    user_id: UUID
    organization_id: UUID
    created_at: datetime
    read_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

