"""
Pydantic schemas for Invitation
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class InvitationBase(BaseModel):
    email: str
    role_name: str  # 'landlord', 'tenant', 'pmc', 'vendor', etc.


class InvitationCreate(InvitationBase):
    organization_id: UUID
    expires_in_days: int = Field(default=7, ge=1, le=30)


class InvitationUpdate(BaseModel):
    status: Optional[str] = None  # 'pending', 'accepted', 'expired', 'cancelled'


class Invitation(InvitationBase):
    id: UUID
    organization_id: UUID
    invited_by_user_id: UUID
    token: str
    status: str = "pending"
    expires_at: datetime
    accepted_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

