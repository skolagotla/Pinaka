"""
Pydantic schemas for Form and FormSignature
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class FormSignatureBase(BaseModel):
    signature_data: Optional[str] = None  # Base64 encoded signature image


class FormSignatureCreate(FormSignatureBase):
    form_id: UUID


class FormSignature(FormSignatureBase):
    id: UUID
    form_id: UUID
    signer_user_id: UUID
    signed_at: datetime
    
    class Config:
        from_attributes = True


class FormBase(BaseModel):
    form_type: str  # 'N4', 'N5', 'L1', 'T1', etc.
    entity_type: Optional[str] = None
    entity_id: Optional[UUID] = None
    template_data: Optional[Dict[str, Any]] = None


class FormCreate(FormBase):
    organization_id: UUID


class FormUpdate(BaseModel):
    template_data: Optional[Dict[str, Any]] = None
    status: Optional[str] = None  # 'draft', 'pending_signature', 'signed', 'expired'


class Form(FormBase):
    id: UUID
    organization_id: UUID
    created_by_user_id: UUID
    status: str = "draft"
    signed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    signatures: Optional[List[FormSignature]] = []
    
    class Config:
        from_attributes = True

