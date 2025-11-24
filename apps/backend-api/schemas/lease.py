"""
Pydantic schemas for Lease
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID


class LeaseBase(BaseModel):
    start_date: date
    end_date: date
    rent_amount: float
    rent_due_day: Optional[int] = None  # 1-31
    security_deposit: Optional[float] = None
    status: str = "pending"  # 'pending', 'active', 'terminated', 'expired'


class LeaseCreate(LeaseBase):
    organization_id: UUID
    unit_id: UUID
    landlord_id: UUID
    tenant_id: UUID  # Primary tenant


class LeaseUpdate(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    rent_amount: Optional[float] = None
    rent_due_day: Optional[int] = None
    security_deposit: Optional[float] = None
    status: Optional[str] = None
    landlord_id: Optional[UUID] = None


class Lease(LeaseBase):
    id: UUID
    organization_id: UUID
    unit_id: UUID
    landlord_id: UUID
    tenant_id: Optional[UUID] = None  # Optional since it's not always set directly
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class LeaseWithTenants(Lease):
    """Lease with tenant relationships"""
    tenant_ids: List[UUID] = []


class LeaseRenewalRequest(BaseModel):
    """Lease renewal request"""
    decision: str  # 'renew', 'month-to-month', 'terminate'
    new_lease_end: Optional[date] = None
    new_rent_amount: Optional[float] = None


class LeaseTerminationRequest(BaseModel):
    """Lease termination request"""
    termination_date: date
    reason: Optional[str] = None
    actual_loss: Optional[float] = None

