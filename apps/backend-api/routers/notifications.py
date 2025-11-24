"""
Notification endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from core.database import get_db
from core.auth_v2 import get_current_user_v2, get_user_roles, RoleEnum
from schemas.notification import Notification, NotificationCreate, NotificationUpdate
from db.models_v2 import Notification as NotificationModel, User

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=List[Notification])
async def list_notifications(
    is_read: Optional[bool] = None,
    current_user: User = Depends(get_current_user_v2),
    db: AsyncSession = Depends(get_db)
):
    """List notifications for current user"""
    query = select(NotificationModel).where(NotificationModel.user_id == current_user.id)
    
    if is_read is not None:
        query = query.where(NotificationModel.is_read == is_read)
    
    query = query.order_by(NotificationModel.created_at.desc())
    
    result = await db.execute(query)
    notifications = result.scalars().all()
    
    return notifications


@router.post("", response_model=Notification, status_code=status.HTTP_201_CREATED)
async def create_notification(
    notification_data: NotificationCreate,
    current_user: User = Depends(get_current_user_v2),
    db: AsyncSession = Depends(get_db)
):
    """Create notification (typically done by system, but API available)"""
    user_roles = await get_user_roles(current_user, db)
    
    # Only super_admin, pmc_admin, or pm can create notifications
    if not any(role in [RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM] for role in user_roles):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and PMs can create notifications",
        )
    
    notification = NotificationModel(**notification_data.dict())
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    
    return notification


@router.patch("/{notification_id}/read", response_model=Notification)
async def mark_notification_read(
    notification_id: UUID,
    current_user: User = Depends(get_current_user_v2),
    db: AsyncSession = Depends(get_db)
):
    """Mark notification as read"""
    result = await db.execute(
        select(NotificationModel).where(
            NotificationModel.id == notification_id,
            NotificationModel.user_id == current_user.id
        )
    )
    notification = result.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    
    notification.is_read = True
    notification.read_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(notification)
    
    return notification


@router.post("/mark-all-read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user_v2),
    db: AsyncSession = Depends(get_db)
):
    """Mark all notifications as read for current user"""
    await db.execute(
        update(NotificationModel)
        .where(
            NotificationModel.user_id == current_user.id,
            NotificationModel.is_read == False
        )
        .values(is_read=True, read_at=datetime.utcnow())
    )
    await db.commit()
    
    return None


@router.get("/{notification_id}", response_model=Notification)
async def get_notification(
    notification_id: UUID,
    current_user: User = Depends(get_current_user_v2),
    db: AsyncSession = Depends(get_db)
):
    """Get notification by ID"""
    result = await db.execute(
        select(NotificationModel).where(
            NotificationModel.id == notification_id,
            NotificationModel.user_id == current_user.id
        )
    )
    notification = result.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    
    return notification

