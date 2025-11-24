"""
Pydantic schemas for Role
"""
from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None


class RoleCreate(RoleBase):
    pass


class Role(RoleBase):
    id: UUID
    
    class Config:
        from_attributes = True

