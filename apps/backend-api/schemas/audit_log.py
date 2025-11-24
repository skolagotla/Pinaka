"""
Pydantic schemas for AuditLog
"""
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID


class AuditLogBase(BaseModel):
    action: str  # 'ROLE_CHANGED', 'USER_IMPERSONATED', 'LEASE_CREATED', etc.
    entity_type: Optional[str] = None
    entity_id: Optional[UUID] = None
    extra_metadata: Optional[Dict[str, Any]] = None


class AuditLogCreate(AuditLogBase):
    organization_id: Optional[UUID] = None
    actor_user_id: UUID


class AuditLog(AuditLogBase):
    id: UUID
    organization_id: Optional[UUID] = None
    actor_user_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

