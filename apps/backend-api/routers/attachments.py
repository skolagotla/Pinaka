"""
Attachment endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
import os
import shutil
from pathlib import Path
from core.database import get_db
from core.auth_v2 import get_current_user_v2, get_user_roles, RoleEnum, require_role_v2
from schemas.attachment import Attachment, AttachmentCreate
from db.models_v2 import Attachment as AttachmentModel, User, Organization

router = APIRouter(prefix="/attachments", tags=["attachments"])

# Local storage directory (will be configurable later)
UPLOAD_DIR = Path("uploads")


@router.get("", response_model=List[Attachment])
async def list_attachments(
    entity_type: str,
    entity_id: UUID,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT, RoleEnum.VENDOR], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """List attachments for an entity"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(AttachmentModel).where(
        AttachmentModel.entity_type == entity_type,
        AttachmentModel.entity_id == entity_id,
    )
    
    # Filter by organization
    if RoleEnum.SUPER_ADMIN not in user_roles:
        query = query.where(AttachmentModel.organization_id == current_user.organization_id)
    
    result = await db.execute(query)
    attachments = result.scalars().all()
    
    return attachments


@router.post("", response_model=Attachment, status_code=status.HTTP_201_CREATED)
async def upload_attachment(
    entity_type: str,
    entity_id: UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT, RoleEnum.VENDOR], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Upload attachment for an entity"""
    user_roles = await get_user_roles(current_user, db)
    org_id = current_user.organization_id
    
    if RoleEnum.SUPER_ADMIN not in user_roles and not org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Organization required",
        )
    
    # Create storage path: uploads/{organization_id}/{entity_type}/{entity_id}/{filename}
    storage_path = UPLOAD_DIR / str(org_id) / entity_type / str(entity_id)
    storage_path.mkdir(parents=True, exist_ok=True)
    
    # Save file
    file_path = storage_path / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Get file size
    file_size = file_path.stat().st_size
    
    # Create attachment record
    attachment = AttachmentModel(
        organization_id=org_id,
        entity_type=entity_type,
        entity_id=entity_id,
        storage_key=str(file_path.relative_to(UPLOAD_DIR)),  # Relative path for S3 migration
        file_name=file.filename,
        mime_type=file.content_type,
        file_size_bytes=file_size,
    )
    db.add(attachment)
    await db.commit()
    await db.refresh(attachment)
    
    return attachment


@router.get("/{attachment_id}/download")
async def download_attachment(
    attachment_id: UUID,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT, RoleEnum.VENDOR], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Download attachment file"""
    result = await db.execute(
        select(AttachmentModel).where(AttachmentModel.id == attachment_id)
    )
    attachment = result.scalar_one_or_none()
    
    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found",
        )
    
    user_roles = await get_user_roles(current_user, db)
    
    # Check access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if attachment.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    # Build full file path
    file_path = UPLOAD_DIR / attachment.storage_key
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )
    
    return FileResponse(
        path=str(file_path),
        filename=attachment.file_name,
        media_type=attachment.mime_type or "application/octet-stream",
    )


@router.delete("/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attachment(
    attachment_id: UUID,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Delete attachment"""
    result = await db.execute(
        select(AttachmentModel).where(AttachmentModel.id == attachment_id)
    )
    attachment = result.scalar_one_or_none()
    
    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found",
        )
    
    user_roles = await get_user_roles(current_user, db)
    
    # Check access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if attachment.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    # Delete file
    file_path = UPLOAD_DIR / attachment.storage_key
    if file_path.exists():
        file_path.unlink()
    
    # Delete record
    from sqlalchemy import delete
    from db.models_v2 import Attachment as AttachmentModel
    await db.execute(delete(AttachmentModel).where(AttachmentModel.id == attachment_id))
    await db.commit()
    
    return None

