"""
Expense endpoints (v2)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
from datetime import date
from core.database import get_db
from core.auth_v2 import get_current_user_v2, get_user_roles, RoleEnum, require_role_v2
from schemas.expense import Expense, ExpenseCreate, ExpenseUpdate
from db.models_v2 import Expense as ExpenseModel, User, Organization

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.get("", response_model=List[Expense])
async def list_expenses(
    organization_id: Optional[UUID] = Query(None),
    property_id: Optional[UUID] = Query(None),
    category: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """List expenses (scoped by organization)"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(ExpenseModel)
    
    # Filter by organization
    if RoleEnum.SUPER_ADMIN in user_roles:
        if organization_id:
            query = query.where(ExpenseModel.organization_id == organization_id)
    else:
        query = query.where(ExpenseModel.organization_id == current_user.organization_id)
    
    # Additional filters
    if property_id:
        query = query.where(ExpenseModel.property_id == property_id)
    if category:
        query = query.where(ExpenseModel.category == category)
    if status_filter:
        query = query.where(ExpenseModel.status == status_filter)
    
    result = await db.execute(query)
    expenses = result.scalars().all()
    
    return expenses


@router.post("", response_model=Expense, status_code=status.HTTP_201_CREATED)
async def create_expense(
    expense_data: ExpenseCreate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Create expense"""
    user_roles = await get_user_roles(current_user, db)
    
    # Verify organization access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if expense_data.organization_id != current_user.organization_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot create expense for different organization")
    
    expense = ExpenseModel(
        organization_id=expense_data.organization_id,
        property_id=expense_data.property_id,
        work_order_id=expense_data.work_order_id,
        vendor_id=expense_data.vendor_id,
        category=expense_data.category,
        amount=expense_data.amount,
        expense_date=expense_data.expense_date,
        description=expense_data.description,
        receipt_attachment_id=expense_data.receipt_attachment_id,
        created_by_user_id=current_user.id,
    )
    
    db.add(expense)
    await db.commit()
    await db.refresh(expense)
    
    return expense


@router.patch("/{expense_id}", response_model=Expense)
async def update_expense(
    expense_id: UUID,
    expense_data: ExpenseUpdate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Update expense"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(ExpenseModel).where(ExpenseModel.id == expense_id)
    
    if RoleEnum.SUPER_ADMIN not in user_roles:
        query = query.where(ExpenseModel.organization_id == current_user.organization_id)
    
    result = await db.execute(query)
    expense = result.scalar_one_or_none()
    
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    
    # Update fields
    update_data = expense_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(expense, key, value)
    
    await db.commit()
    await db.refresh(expense)
    
    return expense

