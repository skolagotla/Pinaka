"""
Audit Log endpoints (super_admin only)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from core.database import get_db
from core.auth_v2 import get_current_user_v2, get_user_roles, RoleEnum, require_role_v2
from core.crud_helpers import apply_pagination
from schemas.audit_log import AuditLog, AuditLogCreate
from db.models_v2 import AuditLog as AuditLogModel, User

router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])


@router.get("", response_model=List[AuditLog])
async def list_audit_logs(
    organization_id: Optional[UUID] = None,
    actor_user_id: Optional[UUID] = None,
    entity_type: Optional[str] = None,
    action: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN], require_organization=False)),
    db: AsyncSession = Depends(get_db)
):
    """List audit logs (super_admin only) with pagination"""
    query = select(AuditLogModel)
    
    # Apply filters
    if organization_id:
        query = query.where(AuditLogModel.organization_id == organization_id)
    if actor_user_id:
        query = query.where(AuditLogModel.actor_user_id == actor_user_id)
    if entity_type:
        query = query.where(AuditLogModel.entity_type == entity_type)
    if action:
        query = query.where(AuditLogModel.action == action)
    
    query = apply_pagination(query, page, limit, AuditLogModel.created_at.desc())
    
    result = await db.execute(query)
    audit_logs = result.scalars().all()
    
    return audit_logs


@router.post("", response_model=AuditLog, status_code=status.HTTP_201_CREATED)
async def create_audit_log(
    audit_log_data: AuditLogCreate,
    current_user: User = Depends(get_current_user_v2),
    db: AsyncSession = Depends(get_db)
):
    """Create audit log (typically done by system, but API available)"""
    # Use current user as actor if not specified
    if not audit_log_data.actor_user_id:
        audit_log_data.actor_user_id = current_user.id
    
    audit_log = AuditLogModel(**audit_log_data.dict())
    db.add(audit_log)
    await db.commit()
    await db.refresh(audit_log)
    
    return audit_log


@router.get("/{audit_log_id}", response_model=AuditLog)
async def get_audit_log(
    audit_log_id: UUID,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN], require_organization=False)),
    db: AsyncSession = Depends(get_db)
):
    """Get audit log by ID (super_admin only)"""
    result = await db.execute(
        select(AuditLogModel).where(AuditLogModel.id == audit_log_id)
    )
    audit_log = result.scalar_one_or_none()
    
    if not audit_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit log not found",
        )
    
    return audit_log

