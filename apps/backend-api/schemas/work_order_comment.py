"""
Pydantic schemas for Work Order Comment
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from schemas.user import User


class WorkOrderCommentBase(BaseModel):
    body: str


class WorkOrderCommentCreate(WorkOrderCommentBase):
    pass


class WorkOrderComment(WorkOrderCommentBase):
    id: UUID
    work_order_id: UUID
    author_user_id: UUID
    created_at: datetime
    author: Optional[User] = None
    
    class Config:
        from_attributes = True

