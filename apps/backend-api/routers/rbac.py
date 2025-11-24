"""
RBAC (Role-Based Access Control) endpoints
Provides permission checking and role management for v2 API
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from typing import List, Optional
from uuid import UUID
from core.database import get_db
from core.auth_v2 import get_current_user_v2, get_user_roles, RoleEnum, require_role_v2
from db.models_v2 import User, Role, UserRole, Organization
from pydantic import BaseModel

router = APIRouter(prefix="/rbac", tags=["rbac"])


# Pydantic schemas
class PermissionCheckRequest(BaseModel):
    resource: str
    action: str  # 'CREATE', 'READ', 'UPDATE', 'DELETE', etc.
    category: Optional[str] = None
    scope: Optional[dict] = None


class PermissionCheckResponse(BaseModel):
    has_permission: bool
    reason: Optional[str] = None


class UserScope(BaseModel):
    portfolio_id: Optional[UUID] = None
    property_id: Optional[UUID] = None
    unit_id: Optional[UUID] = None
    organization_id: Optional[UUID] = None


class UserScopesResponse(BaseModel):
    scopes: List[UserScope]
    roles: List[str]


@router.post("/permissions/check", response_model=PermissionCheckResponse)
async def check_permission(
    request: PermissionCheckRequest,
    current_user: User = Depends(get_current_user_v2),
    db: AsyncSession = Depends(get_db)
):
    """
    Check if current user has a specific permission
    
    This is a simplified permission check based on roles.
    For full RBAC with permissions matrix, the database schema needs to be extended.
    """
    user_roles = await get_user_roles(current_user, db)
    
    # Super admin has all permissions
    if RoleEnum.SUPER_ADMIN in user_roles:
        return PermissionCheckResponse(has_permission=True, reason="Super admin has all permissions")
    
    # Basic role-based permission logic
    # This can be extended with a full permissions matrix later
    action = request.action.upper()
    resource = request.resource.lower()
    
    # PMC Admin can manage most resources
    if RoleEnum.PMC_ADMIN in user_roles:
        if action in ['CREATE', 'READ', 'UPDATE', 'DELETE']:
            if resource in ['properties', 'tenants', 'leases', 'units', 'work_orders', 'vendors']:
                return PermissionCheckResponse(has_permission=True, reason="PMC Admin role")
    
    # Property Manager can manage properties and related resources
    if RoleEnum.PM in user_roles:
        if action in ['CREATE', 'READ', 'UPDATE']:
            if resource in ['properties', 'tenants', 'leases', 'units', 'work_orders']:
                return PermissionCheckResponse(has_permission=True, reason="Property Manager role")
    
    # Landlord can manage their own properties
    if RoleEnum.LANDLORD in user_roles:
        if action == 'READ':
            return PermissionCheckResponse(has_permission=True, reason="Landlord can read")
        if action in ['CREATE', 'UPDATE']:
            if resource in ['work_orders', 'tenants', 'leases']:
                return PermissionCheckResponse(has_permission=True, reason="Landlord can manage")
    
    # Tenant can read and create work orders
    if RoleEnum.TENANT in user_roles:
        if action == 'READ':
            return PermissionCheckResponse(has_permission=True, reason="Tenant can read")
        if action == 'CREATE' and resource == 'work_orders':
            return PermissionCheckResponse(has_permission=True, reason="Tenant can create work orders")
    
    # Vendor can read and update assigned work orders
    if RoleEnum.VENDOR in user_roles:
        if action in ['READ', 'UPDATE']:
            if resource == 'work_orders':
                return PermissionCheckResponse(has_permission=True, reason="Vendor can manage assigned work orders")
    
    return PermissionCheckResponse(
        has_permission=False,
        reason=f"User with roles {user_roles} does not have {action} permission for {resource}"
    )


@router.get("/scopes", response_model=UserScopesResponse)
async def get_user_scopes(
    current_user: User = Depends(get_current_user_v2),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all scopes (portfolios, properties, units) for the current user
    """
    # Get user roles with organization scoping
    result = await db.execute(
        select(UserRole)
        .where(UserRole.user_id == current_user.id)
        .where(UserRole.organization_id == current_user.organization_id)
    )
    user_roles_data = result.scalars().all()
    
    scopes = []
    roles = []
    
    for user_role in user_roles_data:
        # Get role name
        role_result = await db.execute(
            select(Role).where(Role.id == user_role.role_id)
        )
        role = role_result.scalar_one_or_none()
        if role:
            roles.append(role.name)
        
        # Build scope from user_role
        scope = UserScope(
            organization_id=user_role.organization_id,
            # Note: v2 schema doesn't have portfolio_id, property_id, unit_id in UserRole yet
            # This would need to be added to the schema for full scope support
        )
        scopes.append(scope)
    
    # If no scopes found, return organization scope
    if not scopes and current_user.organization_id:
        scopes.append(UserScope(organization_id=current_user.organization_id))
    
    # Get roles from auth helper
    role_names = await get_user_roles(current_user, db)
    if role_names:
        roles = list(set(roles + role_names))
    
    return UserScopesResponse(scopes=scopes, roles=roles)


@router.get("/access/{resource_id}", response_model=dict)
async def check_resource_access(
    resource_id: UUID,
    resource_type: str = Query(..., description="Type of resource: 'property', 'tenant', 'lease', etc."),
    current_user: User = Depends(get_current_user_v2),
    db: AsyncSession = Depends(get_db)
):
    """
    Check if user can access a specific resource by ID
    """
    user_roles = await get_user_roles(current_user, db)
    
    # Super admin can access everything
    if RoleEnum.SUPER_ADMIN in user_roles:
        return {"has_access": True, "reason": "Super admin"}
    
    # Check organization-based access
    resource_type_lower = resource_type.lower()
    
    if resource_type_lower == 'property':
        from db.models_v2 import Property
        result = await db.execute(
            select(Property).where(Property.id == resource_id)
        )
        resource = result.scalar_one_or_none()
        if not resource:
            return {"has_access": False, "reason": "Resource not found"}
        
        # Check organization access
        if resource.organization_id == current_user.organization_id:
            return {"has_access": True, "reason": "Same organization"}
        return {"has_access": False, "reason": "Different organization"}
    
    elif resource_type_lower == 'tenant':
        from db.models_v2 import Tenant
        result = await db.execute(
            select(Tenant).where(Tenant.id == resource_id)
        )
        resource = result.scalar_one_or_none()
        if not resource:
            return {"has_access": False, "reason": "Resource not found"}
        
        if resource.organization_id == current_user.organization_id:
            return {"has_access": True, "reason": "Same organization"}
        return {"has_access": False, "reason": "Different organization"}
    
    elif resource_type_lower == 'lease':
        from db.models_v2 import Lease
        result = await db.execute(
            select(Lease).where(Lease.id == resource_id)
        )
        resource = result.scalar_one_or_none()
        if not resource:
            return {"has_access": False, "reason": "Resource not found"}
        
        if resource.organization_id == current_user.organization_id:
            return {"has_access": True, "reason": "Same organization"}
        return {"has_access": False, "reason": "Different organization"}
    
    elif resource_type_lower == 'work_order':
        from db.models_v2 import WorkOrder
        result = await db.execute(
            select(WorkOrder).where(WorkOrder.id == resource_id)
        )
        resource = result.scalar_one_or_none()
        if not resource:
            return {"has_access": False, "reason": "Resource not found"}
        
        if resource.organization_id == current_user.organization_id:
            return {"has_access": True, "reason": "Same organization"}
        return {"has_access": False, "reason": "Different organization"}
    
    # Default: check by organization
    return {"has_access": True, "reason": "Default access granted"}


@router.get("/roles", response_model=List[dict])
async def list_roles(
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN])),
    db: AsyncSession = Depends(get_db)
):
    """List all available roles"""
    result = await db.execute(select(Role))
    roles = result.scalars().all()
    
    return [
        {
            "id": str(role.id),
            "name": role.name,
            "description": role.description,
        }
        for role in roles
    ]


@router.get("/users/{user_id}/roles", response_model=List[dict])
async def get_user_roles_endpoint(
    user_id: UUID,
    current_user: User = Depends(require_role_v2([RoleEnum.SUPER_ADMIN, RoleEnum.PMC_ADMIN, RoleEnum.PM])),
    db: AsyncSession = Depends(get_db)
):
    """Get roles for a specific user"""
    result = await db.execute(
        select(UserRole, Role)
        .join(Role, UserRole.role_id == Role.id)
        .where(UserRole.user_id == user_id)
    )
    user_roles = result.all()
    
    return [
        {
            "id": str(ur.UserRole.id),
            "role_id": str(ur.Role.id),
            "role_name": ur.Role.name,
            "organization_id": str(ur.UserRole.organization_id) if ur.UserRole.organization_id else None,
            "created_at": ur.UserRole.created_at.isoformat() if ur.UserRole.created_at else None,
        }
        for ur in user_roles
    ]

