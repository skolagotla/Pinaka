"""
Conversation and Message endpoints (v2)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID
from core.database import get_db
from core.auth_v2 import get_current_user_v2, get_user_roles, RoleEnum, require_role_v2
from core.crud_helpers import apply_pagination
from schemas.conversation import Conversation, ConversationCreate, ConversationUpdate, Message, MessageCreate
from db.models_v2 import (
    Conversation as ConversationModel,
    ConversationParticipant as ParticipantModel,
    Message as MessageModel,
    User,
    Organization
)

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("", response_model=List[Conversation])
async def list_conversations(
    organization_id: Optional[UUID] = Query(None),
    entity_type: Optional[str] = Query(None),
    entity_id: Optional[UUID] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT, RoleEnum.VENDOR], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """List conversations (user sees only conversations they're part of) with pagination"""
    user_roles = await get_user_roles(current_user, db)
    
    # Get conversations where user is a participant
    query = select(ConversationModel).join(
        ParticipantModel, ConversationModel.id == ParticipantModel.conversation_id
    ).where(
        ParticipantModel.user_id == current_user.id
    ).options(
        selectinload(ConversationModel.messages)
    )
    
    # Filter by organization
    if RoleEnum.SUPER_ADMIN in user_roles:
        if organization_id:
            query = query.where(ConversationModel.organization_id == organization_id)
    else:
        query = query.where(ConversationModel.organization_id == current_user.organization_id)
    
    # Additional filters
    if entity_type:
        query = query.where(ConversationModel.entity_type == entity_type)
    if entity_id:
        query = query.where(ConversationModel.entity_id == entity_id)
    
    query = apply_pagination(query, page, limit, ConversationModel.created_at.desc())
    
    result = await db.execute(query)
    conversations = result.scalars().unique().all()
    
    return conversations


@router.get("/{conversation_id}", response_model=Conversation)
async def get_conversation(
    conversation_id: UUID,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT, RoleEnum.VENDOR], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Get conversation by ID"""
    # Check if user is a participant
    participant_query = select(ParticipantModel).where(
        ParticipantModel.conversation_id == conversation_id,
        ParticipantModel.user_id == current_user.id
    )
    participant_result = await db.execute(participant_query)
    participant = participant_result.scalar_one_or_none()
    
    if not participant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    
    query = select(ConversationModel).where(
        ConversationModel.id == conversation_id
    ).options(
        selectinload(ConversationModel.messages)
    )
    
    result = await db.execute(query)
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    
    return conversation


@router.post("", response_model=Conversation, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    conversation_data: ConversationCreate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT, RoleEnum.VENDOR], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Create conversation"""
    user_roles = await get_user_roles(current_user, db)
    
    # Verify organization access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if conversation_data.organization_id != current_user.organization_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot create conversation for different organization")
    
    # Create conversation
    conversation = ConversationModel(
        organization_id=conversation_data.organization_id,
        created_by_user_id=current_user.id,
        subject=conversation_data.subject,
        entity_type=conversation_data.entity_type,
        entity_id=conversation_data.entity_id,
    )
    
    db.add(conversation)
    await db.flush()
    
    # Add creator as participant
    creator_participant = ParticipantModel(
        conversation_id=conversation.id,
        user_id=current_user.id,
    )
    db.add(creator_participant)
    
    # Add other participants
    for user_id in conversation_data.participant_user_ids:
        if user_id != current_user.id:  # Don't add creator twice
            participant = ParticipantModel(
                conversation_id=conversation.id,
                user_id=user_id,
            )
            db.add(participant)
    
    await db.commit()
    await db.refresh(conversation)
    
    return conversation


@router.patch("/{conversation_id}", response_model=Conversation)
async def update_conversation(
    conversation_id: UUID,
    conversation_data: ConversationUpdate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT, RoleEnum.VENDOR], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Update conversation"""
    # Check if user is a participant
    participant_query = select(ParticipantModel).where(
        ParticipantModel.conversation_id == conversation_id,
        ParticipantModel.user_id == current_user.id
    )
    participant_result = await db.execute(participant_query)
    participant = participant_result.scalar_one_or_none()
    
    if not participant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    
    query = select(ConversationModel).where(ConversationModel.id == conversation_id)
    result = await db.execute(query)
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    
    # Update fields
    update_data = conversation_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(conversation, key, value)
    
    await db.commit()
    await db.refresh(conversation)
    
    return conversation


@router.post("/{conversation_id}/messages", response_model=Message, status_code=status.HTTP_201_CREATED)
async def create_message(
    conversation_id: UUID,
    message_data: MessageCreate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT, RoleEnum.VENDOR], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Create message in conversation"""
    # Check if user is a participant
    participant_query = select(ParticipantModel).where(
        ParticipantModel.conversation_id == conversation_id,
        ParticipantModel.user_id == current_user.id
    )
    participant_result = await db.execute(participant_query)
    participant = participant_result.scalar_one_or_none()
    
    if not participant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    
    message = MessageModel(
        conversation_id=conversation_id,
        sender_user_id=current_user.id,
        body=message_data.body,
    )
    
    db.add(message)
    await db.commit()
    await db.refresh(message)
    
    return message


@router.get("/{conversation_id}/messages", response_model=List[Message])
async def list_messages(
    conversation_id: UUID,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT, RoleEnum.VENDOR], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """List messages in conversation"""
    # Check if user is a participant
    participant_query = select(ParticipantModel).where(
        ParticipantModel.conversation_id == conversation_id,
        ParticipantModel.user_id == current_user.id
    )
    participant_result = await db.execute(participant_query)
    participant = participant_result.scalar_one_or_none()
    
    if not participant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    
    query = select(MessageModel).where(
        MessageModel.conversation_id == conversation_id
    ).order_by(MessageModel.created_at)
    
    result = await db.execute(query)
    messages = result.scalars().all()
    
    return messages

