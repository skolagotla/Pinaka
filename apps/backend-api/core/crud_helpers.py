"""
Shared CRUD helpers for FastAPI routers

This module provides reusable functions to eliminate duplication across routers.
Replaces repeated patterns for:
- Organization-based filtering
- Access control checks
- Common CRUD operations
"""
from typing import Optional, Type, TypeVar, Generic, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import DeclarativeBase
from fastapi import HTTPException, status, Query
from core.auth_v2 import get_user_roles, RoleEnum
from db.models_v2 import User, Organization

# Generic type for SQLAlchemy models
ModelType = TypeVar("ModelType", bound=DeclarativeBase)


async def apply_organization_filter(
    query,
    model: Type[ModelType],
    current_user: User,
    user_roles: List[str],
    organization_id: Optional[UUID] = None
):
    """
    Apply organization-based filtering to a query.
    
    Replaces the repeated pattern:
        if RoleEnum.SUPER_ADMIN in user_roles:
            if organization_id:
                query = query.where(Model.organization_id == organization_id)
        else:
            query = query.where(Model.organization_id == current_user.organization_id)
    
    Args:
        query: SQLAlchemy select query
        model: SQLAlchemy model class
        current_user: Current authenticated user
        user_roles: List of user's roles
        organization_id: Optional organization ID filter (for super_admin)
    
    Returns:
        Modified query with organization filter applied
    """
    if RoleEnum.SUPER_ADMIN in user_roles:
        if organization_id:
            query = query.where(model.organization_id == organization_id)
    else:
        # Non-super users can only see their organization's resources
        query = query.where(model.organization_id == current_user.organization_id)
    
    return query


async def check_organization_access(
    entity,
    current_user: User,
    user_roles: List[str],
    error_message: str = "Access denied"
) -> None:
    """
    Check if user has access to an entity based on organization.
    
    Replaces the repeated pattern:
        if RoleEnum.SUPER_ADMIN not in user_roles:
            if entity.organization_id != current_user.organization_id:
                raise HTTPException(status_code=403, detail="Access denied")
    
    Args:
        entity: Entity with organization_id attribute
        current_user: Current authenticated user
        user_roles: List of user's roles
        error_message: Custom error message
    
    Raises:
        HTTPException: 403 if access denied
    """
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if entity.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=error_message
            )


async def verify_organization_exists(
    organization_id: UUID,
    db: AsyncSession
) -> None:
    """
    Verify that an organization exists.
    
    Replaces the repeated pattern:
        org_result = await db.execute(select(Organization).where(Organization.id == org_id))
        org = org_result.scalar_one_or_none()
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")
    
    Args:
        organization_id: Organization UUID to verify
        db: Database session
    
    Raises:
        HTTPException: 404 if organization not found
    """
    result = await db.execute(
        select(Organization).where(Organization.id == organization_id)
    )
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )


async def verify_organization_access_for_create(
    organization_id: UUID,
    current_user: User,
    user_roles: List[str],
    db: AsyncSession,
    error_message: str = "Cannot create resource in different organization"
) -> None:
    """
    Verify user can create a resource in the specified organization.
    
    Combines organization access check and existence verification.
    Replaces the repeated pattern in create endpoints.
    
    Args:
        organization_id: Organization UUID
        current_user: Current authenticated user
        user_roles: List of user's roles
        db: Database session
        error_message: Custom error message
    
    Raises:
        HTTPException: 403 if access denied, 404 if organization not found
    """
    # Check access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=error_message
            )
    
    # Verify organization exists
    await verify_organization_exists(organization_id, db)


async def get_entity_or_404(
    model: Type[ModelType],
    entity_id: UUID,
    db: AsyncSession,
    error_message: str = None
) -> ModelType:
    """
    Get an entity by ID or raise 404 if not found.
    
    Replaces the repeated pattern:
        result = await db.execute(select(Model).where(Model.id == entity_id))
        entity = result.scalar_one_or_none()
        if not entity:
            raise HTTPException(status_code=404, detail="Entity not found")
        return entity
    
    Args:
        model: SQLAlchemy model class
        entity_id: Entity UUID
        db: Database session
        error_message: Custom error message (defaults to "{Model} not found")
    
    Returns:
        Entity instance
    
    Raises:
        HTTPException: 404 if entity not found
    """
    result = await db.execute(
        select(model).where(model.id == entity_id)
    )
    entity = result.scalar_one_or_none()
    
    if not entity:
        if error_message is None:
            error_message = f"{model.__name__} not found"
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_message
        )
    
    return entity


async def update_entity_fields(
    entity: ModelType,
    update_data: dict
) -> None:
    """
    Update entity fields from a dictionary.
    
    Replaces the repeated pattern:
        update_data = update_schema.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(entity, field, value)
    
    Args:
        entity: Entity instance to update
        update_data: Dictionary of field: value pairs
    """
    for field, value in update_data.items():
        setattr(entity, field, value)


def apply_pagination(
    query,
    page: int = 1,
    limit: int = 50,
    order_by=None
):
    """
    Apply pagination to a query.
    
    Replaces the repeated pattern:
        offset = (page - 1) * limit
        query = query.order_by(Model.created_at.desc()).offset(offset).limit(limit)
    
    Args:
        query: SQLAlchemy select query
        page: Page number (1-indexed)
        limit: Items per page
        order_by: Order by clause (e.g., Model.created_at.desc())
    
    Returns:
        Modified query with pagination applied
    """
    offset = (page - 1) * limit
    if order_by is not None:
        query = query.order_by(order_by)
    query = query.offset(offset).limit(limit)
    return query

