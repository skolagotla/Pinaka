"""
Pydantic schemas for Attachment
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class AttachmentBase(BaseModel):
    file_name: str
    mime_type: Optional[str] = None
    file_size_bytes: Optional[int] = None


class AttachmentCreate(AttachmentBase):
    entity_type: str  # 'work_order', 'message', 'lease', 'property', etc.
    entity_id: UUID


class Attachment(AttachmentBase):
    id: UUID
    organization_id: UUID
    entity_type: str
    entity_id: UUID
    storage_key: str
    created_at: datetime
    
    class Config:
        from_attributes = True

