"""
Pydantic schemas for Tenant
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID


class TenantBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: str = "active"


class TenantCreate(TenantBase):
    organization_id: UUID
    user_id: Optional[UUID] = None


class TenantUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    user_id: Optional[UUID] = None


class Tenant(TenantBase):
    id: UUID
    organization_id: UUID
    user_id: Optional[UUID] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class TenantApprovalRequest(BaseModel):
    """Tenant approval request"""
    pass  # No additional fields needed


class TenantRejectionRequest(BaseModel):
    """Tenant rejection request"""
    reason: Optional[str] = None

