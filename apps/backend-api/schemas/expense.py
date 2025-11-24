"""
Pydantic schemas for Expense
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from uuid import UUID
from decimal import Decimal


class ExpenseBase(BaseModel):
    category: str  # 'maintenance', 'utilities', 'insurance', 'taxes', etc.
    amount: Decimal = Field(..., decimal_places=2)
    expense_date: date
    description: Optional[str] = None
    receipt_attachment_id: Optional[UUID] = None


class ExpenseCreate(ExpenseBase):
    organization_id: UUID
    property_id: Optional[UUID] = None
    work_order_id: Optional[UUID] = None
    vendor_id: Optional[UUID] = None


class ExpenseUpdate(BaseModel):
    category: Optional[str] = None
    amount: Optional[Decimal] = None
    expense_date: Optional[date] = None
    description: Optional[str] = None
    receipt_attachment_id: Optional[UUID] = None
    status: Optional[str] = None  # 'pending', 'approved', 'rejected', 'paid'


class Expense(ExpenseBase):
    id: UUID
    organization_id: UUID
    property_id: Optional[UUID] = None
    work_order_id: Optional[UUID] = None
    vendor_id: Optional[UUID] = None
    status: str = "pending"
    created_by_user_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

