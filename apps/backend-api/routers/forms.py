"""
Form endpoints (v2)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from core.database import get_db
from core.auth_v2 import get_current_user_v2, get_user_roles, RoleEnum, require_role_v2
from core.crud_helpers import apply_pagination
from schemas.form import Form, FormCreate, FormUpdate, FormSignature, FormSignatureCreate
from db.models_v2 import (
    Form as FormModel,
    FormSignature as FormSignatureModel,
    User,
    Organization
)

router = APIRouter(prefix="/forms", tags=["forms"])


@router.get("", response_model=List[Form])
async def list_forms(
    organization_id: Optional[UUID] = Query(None),
    form_type: Optional[str] = Query(None),
    entity_type: Optional[str] = Query(None),
    entity_id: Optional[UUID] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """List forms (scoped by organization) with pagination"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(FormModel).options(selectinload(FormModel.signatures))
    
    # Filter by organization
    if RoleEnum.SUPER_ADMIN in user_roles:
        if organization_id:
            query = query.where(FormModel.organization_id == organization_id)
    else:
        query = query.where(FormModel.organization_id == current_user.organization_id)
    
    # Additional filters
    if form_type:
        query = query.where(FormModel.form_type == form_type)
    if entity_type:
        query = query.where(FormModel.entity_type == entity_type)
    if entity_id:
        query = query.where(FormModel.entity_id == entity_id)
    
    query = apply_pagination(query, page, limit, FormModel.created_at.desc())
    
    result = await db.execute(query)
    forms = result.scalars().all()
    
    return forms


@router.get("/{form_id}", response_model=Form)
async def get_form(
    form_id: UUID,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Get form by ID"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(FormModel).where(FormModel.id == form_id).options(selectinload(FormModel.signatures))
    
    if RoleEnum.SUPER_ADMIN not in user_roles:
        query = query.where(FormModel.organization_id == current_user.organization_id)
    
    result = await db.execute(query)
    form = result.scalar_one_or_none()
    
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    
    return form


@router.post("", response_model=Form, status_code=status.HTTP_201_CREATED)
async def create_form(
    form_data: FormCreate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Create form"""
    user_roles = await get_user_roles(current_user, db)
    
    # Verify organization access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if form_data.organization_id != current_user.organization_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot create form for different organization")
    
    form = FormModel(
        organization_id=form_data.organization_id,
        created_by_user_id=current_user.id,
        form_type=form_data.form_type,
        entity_type=form_data.entity_type,
        entity_id=form_data.entity_id,
        template_data=form_data.template_data,
    )
    
    db.add(form)
    await db.commit()
    await db.refresh(form)
    
    return form


@router.post("/{form_id}/signatures", response_model=FormSignature, status_code=status.HTTP_201_CREATED)
async def create_signature(
    form_id: UUID,
    signature_data: FormSignatureCreate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Add signature to form"""
    # Verify form exists and user has access
    query = select(FormModel).where(FormModel.id == form_id)
    result = await db.execute(query)
    form = result.scalar_one_or_none()
    
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    
    user_roles = await get_user_roles(current_user, db)
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if form.organization_id != current_user.organization_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    signature = FormSignatureModel(
        form_id=form_id,
        signer_user_id=current_user.id,
        signature_data=signature_data.signature_data,
    )
    
    db.add(signature)
    
    # Update form status if needed
    if form.status == "pending_signature":
        form.status = "signed"
        form.signed_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(signature)
    
    return signature

