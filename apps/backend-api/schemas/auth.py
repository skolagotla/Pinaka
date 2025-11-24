"""
Pydantic schemas for Authentication
"""
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from schemas.user import User
from schemas.role import Role


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[UUID] = None
    email: Optional[str] = None
    roles: List[str] = []
    organization_id: Optional[UUID] = None


class CurrentUser(BaseModel):
    user: User
    roles: List[Role] = []
    organization_id: Optional[UUID] = None

