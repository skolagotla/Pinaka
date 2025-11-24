"""
Pydantic schemas for Work Order
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID
from schemas.work_order_comment import WorkOrderComment
from schemas.attachment import Attachment


class WorkOrderBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "new"  # 'new', 'in_progress', 'waiting_on_vendor', 'completed', 'canceled'
    priority: str = "medium"  # 'low', 'medium', 'high', 'emergency'


class WorkOrderCreate(WorkOrderBase):
    organization_id: UUID
    property_id: UUID
    unit_id: Optional[UUID] = None
    tenant_id: Optional[UUID] = None


class WorkOrderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    completed_at: Optional[datetime] = None


class WorkOrder(WorkOrderBase):
    id: UUID
    organization_id: UUID
    property_id: UUID
    unit_id: Optional[UUID] = None
    tenant_id: Optional[UUID] = None
    created_by_user_id: UUID
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    comments: Optional[List[WorkOrderComment]] = []
    attachments: Optional[List[Attachment]] = []
    
    class Config:
        from_attributes = True


class WorkOrderCommentCreate(BaseModel):
    body: str


class WorkOrderCommentUpdate(BaseModel):
    body: Optional[str] = None

