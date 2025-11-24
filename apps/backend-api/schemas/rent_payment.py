"""
Pydantic schemas for RentPayment
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from uuid import UUID
from decimal import Decimal


class RentPaymentBase(BaseModel):
    amount: Decimal = Field(..., decimal_places=2)
    payment_date: date
    payment_method: Optional[str] = None  # 'check', 'bank_transfer', 'credit_card', 'cash', etc.
    reference_number: Optional[str] = None
    notes: Optional[str] = None


class RentPaymentCreate(RentPaymentBase):
    organization_id: UUID
    lease_id: UUID
    tenant_id: UUID


class RentPaymentUpdate(BaseModel):
    amount: Optional[Decimal] = None
    payment_date: Optional[date] = None
    payment_method: Optional[str] = None
    status: Optional[str] = None  # 'pending', 'completed', 'failed', 'refunded'
    reference_number: Optional[str] = None
    notes: Optional[str] = None


class RentPayment(RentPaymentBase):
    id: UUID
    organization_id: UUID
    lease_id: UUID
    tenant_id: UUID
    status: str = "pending"
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

