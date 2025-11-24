"""
Pydantic schemas for Conversation and Message
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class MessageBase(BaseModel):
    body: str


class MessageCreate(MessageBase):
    conversation_id: UUID


class Message(MessageBase):
    id: UUID
    conversation_id: UUID
    sender_user_id: UUID
    is_read: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True


class ConversationBase(BaseModel):
    subject: Optional[str] = None
    entity_type: Optional[str] = None
    entity_id: Optional[UUID] = None


class ConversationCreate(ConversationBase):
    organization_id: UUID
    participant_user_ids: List[UUID] = Field(default_factory=list)


class ConversationUpdate(BaseModel):
    subject: Optional[str] = None
    status: Optional[str] = None  # 'active', 'archived', 'closed'


class Conversation(ConversationBase):
    id: UUID
    organization_id: UUID
    created_by_user_id: UUID
    status: str = "active"
    created_at: datetime
    updated_at: datetime
    messages: Optional[List[Message]] = []
    
    class Config:
        from_attributes = True

