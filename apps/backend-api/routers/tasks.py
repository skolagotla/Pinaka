"""
Task endpoints (v2)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from core.database import get_db
from core.auth_v2 import get_current_user_v2, get_user_roles, RoleEnum, require_role_v2
from core.crud_helpers import apply_pagination
from schemas.task import Task, TaskCreate, TaskUpdate
from db.models_v2 import Task as TaskModel, User, Organization

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=List[Task])
async def list_tasks(
    organization_id: Optional[UUID] = Query(None),
    property_id: Optional[UUID] = Query(None),
    status_filter: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """List tasks (scoped by organization and role) with pagination"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(TaskModel)
    
    # Filter by organization
    if RoleEnum.SUPER_ADMIN in user_roles:
        if organization_id:
            query = query.where(TaskModel.organization_id == organization_id)
    else:
        query = query.where(TaskModel.organization_id == current_user.organization_id)
    
    # Additional filters
    if property_id:
        query = query.where(TaskModel.property_id == property_id)
    
    if status_filter:
        if status_filter == "completed":
            query = query.where(TaskModel.is_completed == True)
        elif status_filter == "pending":
            query = query.where(TaskModel.is_completed == False)
    
    query = apply_pagination(query, page, limit, TaskModel.created_at.desc())
    
    result = await db.execute(query)
    tasks = result.scalars().all()
    
    return tasks


@router.get("/{task_id}", response_model=Task)
async def get_task(
    task_id: UUID,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Get task by ID"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(TaskModel).where(TaskModel.id == task_id)
    
    if RoleEnum.SUPER_ADMIN not in user_roles:
        query = query.where(TaskModel.organization_id == current_user.organization_id)
    
    result = await db.execute(query)
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    return task


@router.post("", response_model=Task, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Create task"""
    user_roles = await get_user_roles(current_user, db)
    
    # Verify organization access
    if RoleEnum.SUPER_ADMIN not in user_roles:
        if task_data.organization_id != current_user.organization_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot create task for different organization")
    
    task = TaskModel(
        organization_id=task_data.organization_id,
        created_by_user_id=current_user.id,
        title=task_data.title,
        description=task_data.description,
        category=task_data.category,
        due_date=task_data.due_date,
        priority=task_data.priority,
        property_id=task_data.property_id,
    )
    
    db.add(task)
    await db.commit()
    await db.refresh(task)
    
    return task


@router.patch("/{task_id}", response_model=Task)
async def update_task(
    task_id: UUID,
    task_data: TaskUpdate,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Update task"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(TaskModel).where(TaskModel.id == task_id)
    
    if RoleEnum.SUPER_ADMIN not in user_roles:
        query = query.where(TaskModel.organization_id == current_user.organization_id)
    
    result = await db.execute(query)
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    # Update fields
    update_data = task_data.model_dump(exclude_unset=True)
    if "is_completed" in update_data and update_data["is_completed"]:
        update_data["completed_at"] = datetime.utcnow()
    elif "is_completed" in update_data and not update_data["is_completed"]:
        update_data["completed_at"] = None
    
    for key, value in update_data.items():
        setattr(task, key, value)
    
    await db.commit()
    await db.refresh(task)
    
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: UUID,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM, RoleEnum.LANDLORD], require_organization=True)),
    db: AsyncSession = Depends(get_db)
):
    """Delete task"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(TaskModel).where(TaskModel.id == task_id)
    
    if RoleEnum.SUPER_ADMIN not in user_roles:
        query = query.where(TaskModel.organization_id == current_user.organization_id)
    
    result = await db.execute(query)
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    await db.delete(task)
    await db.commit()
    
    return None

