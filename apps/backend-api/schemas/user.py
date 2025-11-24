"""
Pydantic schemas for User
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from schemas.role import Role


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    organization_id: Optional[UUID] = None


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(UserBase):
    id: UUID
    organization_id: Optional[UUID] = None
    status: str
    created_at: datetime
    updated_at: datetime
    roles: Optional[List[Role]] = []
    
    class Config:
        from_attributes = True


class UserWithRoles(User):
    roles: List[Role] = []

