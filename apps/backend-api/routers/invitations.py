"""
Invitation endpoints (v2)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta
import secrets
from core.database import get_db
from core.auth_v2 import get_current_user_v2, get_user_roles, RoleEnum, require_role_v2
from core.crud_helpers import apply_pagination
from schemas.invitation import Invitation, InvitationCreate, InvitationUpdate
from db.models_v2 import Invitation as InvitationModel, User, Organization

router = APIRouter(prefix="/invitations", tags=["invitations"])


@router.get("", response_model=List[Invitation])
async def list_invitations(
    organization_id: Optional[UUID] = Query(None),
    status_filter: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """List invitations (scoped by organization) with pagination"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(InvitationModel)
    
    # Filter by organization
    if RoleEnum.SUPER_ADMIN in user_roles:
        if organization_id:
            query = query.where(InvitationModel.organization_id == organization_id)
    else:
        query = query.where(InvitationModel.organization_id == current_user.organization_id)
    
    # Status filter
    if status_filter:
        query = query.where(InvitationModel.status == status_filter)
    
    query = apply_pagination(query, page, limit, InvitationModel.created_at.desc())
    
    result = await db.execute(query)
    invitations = result.scalars().all()
    
    return invitations


@router.post("", response_model=Invitation, status_code=status.HTTP_201_CREATED)
async def create_invitation(
    invitation_data: InvitationCreate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Create invitation"""
    user_roles = await get_user_roles(current_user, db)
    
    # Verify organization access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if invitation_data.organization_id != current_user.organization_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot create invitation for different organization")
    
    # Generate unique token
    token = secrets.token_urlsafe(32)
    
    # Calculate expiration
    expires_at = datetime.utcnow() + timedelta(days=invitation_data.expires_in_days)
    
    invitation = InvitationModel(
        organization_id=invitation_data.organization_id,
        invited_by_user_id=current_user.id,
        email=invitation_data.email,
        role_name=invitation_data.role_name,
        token=token,
        expires_at=expires_at,
    )
    
    db.add(invitation)
    await db.commit()
    await db.refresh(invitation)
    
    return invitation


@router.get("/{invitation_id}", response_model=Invitation)
async def get_invitation(
    invitation_id: UUID,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Get invitation by ID"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(InvitationModel).where(InvitationModel.id == invitation_id)
    
    if RoleEnum.SUPER_ADMIN not in user_roles:
        query = query.where(InvitationModel.organization_id == current_user.organization_id)
    
    result = await db.execute(query)
    invitation = result.scalar_one_or_none()
    
    if not invitation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")
    
    return invitation


@router.patch("/{invitation_id}", response_model=Invitation)
async def update_invitation(
    invitation_id: UUID,
    invitation_data: InvitationUpdate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Update invitation"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(InvitationModel).where(InvitationModel.id == invitation_id)
    
    if RoleEnum.SUPER_ADMIN not in user_roles:
        query = query.where(InvitationModel.organization_id == current_user.organization_id)
    
    result = await db.execute(query)
    invitation = result.scalar_one_or_none()
    
    if not invitation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")
    
    # Update fields
    update_data = invitation_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(invitation, key, value)
    
    await db.commit()
    await db.refresh(invitation)
    
    return invitation


@router.post("/accept/{token}", response_model=Invitation)
async def accept_invitation(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    """Accept invitation by token (public endpoint)"""
    query = select(InvitationModel).where(
        InvitationModel.token == token,
        InvitationModel.status == "pending"
    )
    
    result = await db.execute(query)
    invitation = result.scalar_one_or_none()
    
    if not invitation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found or already used")
    
    # Check expiration
    if invitation.expires_at < datetime.utcnow():
        invitation.status = "expired"
        await db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invitation has expired")
    
    # Mark as accepted
    invitation.status = "accepted"
    invitation.accepted_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(invitation)
    
    return invitation

