"""
Onboarding endpoints for v2 schema
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from core.database import get_db
from core.auth_v2 import get_current_user_v2
from schemas.user import OnboardingUpdate
from db.models_v2 import User
from uuid import UUID

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.get("/status")
async def get_onboarding_status(
    current_user: User = Depends(get_current_user_v2),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's onboarding status"""
    return {
        "onboarding_completed": current_user.onboarding_completed,
        "onboarding_step": current_user.onboarding_step,
        "onboarding_data": current_user.onboarding_data or {},
    }


@router.patch("/status")
async def update_onboarding_status(
    onboarding_update: OnboardingUpdate,
    current_user: User = Depends(get_current_user_v2),
    db: AsyncSession = Depends(get_db)
):
    """Update current user's onboarding status"""
    update_data = {}
    
    if onboarding_update.step is not None:
        update_data["onboarding_step"] = onboarding_update.step
    
    if onboarding_update.completed is not None:
        update_data["onboarding_completed"] = onboarding_update.completed
        # If completing onboarding, ensure step is set appropriately
        if onboarding_update.completed and onboarding_update.step is None:
            update_data["onboarding_step"] = 999  # Completed step
    
    if onboarding_update.data is not None:
        # Merge with existing data
        existing_data = current_user.onboarding_data or {}
        existing_data.update(onboarding_update.data)
        update_data["onboarding_data"] = existing_data
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No update data provided",
        )
    
    # Update user
    await db.execute(
        update(User)
        .where(User.id == current_user.id)
        .values(**update_data)
    )
    await db.commit()
    
    # Refresh user object
    result = await db.execute(
        select(User).where(User.id == current_user.id)
    )
    updated_user = result.scalar_one()
    
    return {
        "onboarding_completed": updated_user.onboarding_completed,
        "onboarding_step": updated_user.onboarding_step,
        "onboarding_data": updated_user.onboarding_data or {},
    }


@router.post("/complete")
async def complete_onboarding(
    current_user: User = Depends(get_current_user_v2),
    db: AsyncSession = Depends(get_db)
):
    """Mark onboarding as completed"""
    await db.execute(
        update(User)
        .where(User.id == current_user.id)
        .values(
            onboarding_completed=True,
            onboarding_step=999,
        )
    )
    await db.commit()
    
    return {
        "onboarding_completed": True,
        "onboarding_step": 999,
        "message": "Onboarding completed successfully",
    }

