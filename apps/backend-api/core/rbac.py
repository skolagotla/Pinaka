"""
Central RBAC (Role-Based Access Control) module for Pinaka v2
Provides permission checking, role-based access, and organization scoping
"""
from enum import Enum
from typing import Optional, List, Dict, Any
from uuid import UUID
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from core.database import get_db
from core.auth_v2 import get_current_user_v2, get_user_roles, RoleEnum
from db.models_v2 import (
    User, Property, Unit, Landlord, Tenant, Lease, LeaseTenant, Vendor, 
    WorkOrder, Organization, UserRole, Role
)


# ============================================================================
# PERMISSION ENUMS
# ============================================================================

class PermissionAction(str, Enum):
    """Actions that can be performed on resources"""
    CREATE = "CREATE"
    READ = "READ"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    MANAGE = "MANAGE"  # Full CRUD + special operations


class ResourceType(str, Enum):
    """Types of resources in the system"""
    ORGANIZATION = "organization"
    USER = "user"
    PROPERTY = "property"
    UNIT = "unit"
    LANDLORD = "landlord"
    TENANT = "tenant"
    LEASE = "lease"
    VENDOR = "vendor"
    WORK_ORDER = "work_order"
    ATTACHMENT = "attachment"
    MESSAGE = "message"
    NOTIFICATION = "notification"
    AUDIT_LOG = "audit_log"
    TASK = "task"
    CONVERSATION = "conversation"
    INVITATION = "invitation"
    FORM = "form"
    RENT_PAYMENT = "rent_payment"
    EXPENSE = "expense"
    INSPECTION = "inspection"


# ============================================================================
# PERMISSION MATRIX
# ============================================================================

# Define permissions per role per resource
PERMISSION_MATRIX: Dict[str, Dict[str, List[str]]] = {
    RoleEnum.SUPER_ADMIN: {
        # Super admin has all permissions on all resources
        ResourceType.ORGANIZATION: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.MANAGE],
        ResourceType.USER: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.MANAGE],
        ResourceType.PROPERTY: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.MANAGE],
        ResourceType.UNIT: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.MANAGE],
        ResourceType.LANDLORD: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.MANAGE],
        ResourceType.TENANT: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.MANAGE],
        ResourceType.LEASE: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.MANAGE],
        ResourceType.VENDOR: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.MANAGE],
        ResourceType.WORK_ORDER: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.MANAGE],
        ResourceType.ATTACHMENT: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.MANAGE],
        ResourceType.MESSAGE: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.MANAGE],
        ResourceType.NOTIFICATION: [PermissionAction.READ, PermissionAction.UPDATE],
        ResourceType.AUDIT_LOG: [PermissionAction.READ],
        ResourceType.TASK: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.MANAGE],
        ResourceType.CONVERSATION: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.MANAGE],
        ResourceType.INVITATION: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.MANAGE],
        ResourceType.FORM: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.MANAGE],
        ResourceType.RENT_PAYMENT: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.MANAGE],
        ResourceType.EXPENSE: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.MANAGE],
        ResourceType.INSPECTION: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.MANAGE],
    },
    
    RoleEnum.PMC_ADMIN: {
        # PMC Admin: Full access within their organization
        ResourceType.ORGANIZATION: [PermissionAction.READ, PermissionAction.UPDATE],  # Can update their own org
        ResourceType.USER: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE],  # Can manage users in their org
        ResourceType.PROPERTY: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE],
        ResourceType.UNIT: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE],
        ResourceType.LANDLORD: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE],
        ResourceType.TENANT: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE],
        ResourceType.LEASE: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE],
        ResourceType.VENDOR: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE],
        ResourceType.WORK_ORDER: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE],
        ResourceType.ATTACHMENT: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE],
        ResourceType.MESSAGE: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE],
        ResourceType.NOTIFICATION: [PermissionAction.READ, PermissionAction.UPDATE],
        ResourceType.AUDIT_LOG: [PermissionAction.READ],
        ResourceType.TASK: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE],
        ResourceType.CONVERSATION: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE],
        ResourceType.INVITATION: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE],
        ResourceType.FORM: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE],
        ResourceType.RENT_PAYMENT: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE],
        ResourceType.EXPENSE: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE],
        ResourceType.INSPECTION: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE],
    },
    
    RoleEnum.PM: {
        # PM: Read/write on assigned properties, units, tenants, leases, work_orders
        ResourceType.ORGANIZATION: [PermissionAction.READ],
        ResourceType.USER: [PermissionAction.READ],
        ResourceType.PROPERTY: [PermissionAction.READ, PermissionAction.UPDATE],  # Only assigned properties
        ResourceType.UNIT: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE],
        ResourceType.LANDLORD: [PermissionAction.READ],
        ResourceType.TENANT: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE],
        ResourceType.LEASE: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE],
        ResourceType.VENDOR: [PermissionAction.READ],
        ResourceType.WORK_ORDER: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE],
        ResourceType.ATTACHMENT: [PermissionAction.CREATE, PermissionAction.READ],
        ResourceType.MESSAGE: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE],
        ResourceType.NOTIFICATION: [PermissionAction.READ, PermissionAction.UPDATE],
        ResourceType.AUDIT_LOG: [PermissionAction.READ],
        ResourceType.TASK: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE],
        ResourceType.CONVERSATION: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE],
        ResourceType.INVITATION: [PermissionAction.READ],
        ResourceType.FORM: [PermissionAction.READ, PermissionAction.UPDATE],
        ResourceType.RENT_PAYMENT: [PermissionAction.READ],
        ResourceType.EXPENSE: [PermissionAction.READ],
        ResourceType.INSPECTION: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE],
    },
    
    RoleEnum.LANDLORD: {
        # Landlord: Read/write on their own properties, leases, tenants (limited)
        ResourceType.ORGANIZATION: [PermissionAction.READ],
        ResourceType.USER: [PermissionAction.READ],  # Own profile
        ResourceType.PROPERTY: [PermissionAction.READ, PermissionAction.UPDATE],  # Only own properties
        ResourceType.UNIT: [PermissionAction.READ, PermissionAction.UPDATE],  # Only own units
        ResourceType.LANDLORD: [PermissionAction.READ, PermissionAction.UPDATE],  # Own record
        ResourceType.TENANT: [PermissionAction.READ],  # Tenants in their properties
        ResourceType.LEASE: [PermissionAction.READ, PermissionAction.UPDATE],  # Leases for their properties
        ResourceType.VENDOR: [PermissionAction.READ],
        ResourceType.WORK_ORDER: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE],  # For their properties
        ResourceType.ATTACHMENT: [PermissionAction.CREATE, PermissionAction.READ],
        ResourceType.MESSAGE: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE],
        ResourceType.NOTIFICATION: [PermissionAction.READ, PermissionAction.UPDATE],
        ResourceType.AUDIT_LOG: [],
        ResourceType.TASK: [PermissionAction.READ],
        ResourceType.CONVERSATION: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE],
        ResourceType.INVITATION: [PermissionAction.READ],
        ResourceType.FORM: [PermissionAction.READ],
        ResourceType.RENT_PAYMENT: [PermissionAction.READ],
        ResourceType.EXPENSE: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE],
        ResourceType.INSPECTION: [PermissionAction.READ],
    },
    
    RoleEnum.TENANT: {
        # Tenant: Read on own lease, unit, property, create work orders, messages
        ResourceType.ORGANIZATION: [PermissionAction.READ],
        ResourceType.USER: [PermissionAction.READ, PermissionAction.UPDATE],  # Own profile
        ResourceType.PROPERTY: [PermissionAction.READ],  # Only property they lease
        ResourceType.UNIT: [PermissionAction.READ],  # Only their unit
        ResourceType.LANDLORD: [PermissionAction.READ],  # Their landlord
        ResourceType.TENANT: [PermissionAction.READ, PermissionAction.UPDATE],  # Own record
        ResourceType.LEASE: [PermissionAction.READ],  # Only their lease
        ResourceType.VENDOR: [PermissionAction.READ],  # Vendors for their property
        ResourceType.WORK_ORDER: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE],  # Can create and view own
        ResourceType.ATTACHMENT: [PermissionAction.CREATE, PermissionAction.READ],  # For work orders
        ResourceType.MESSAGE: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE],
        ResourceType.NOTIFICATION: [PermissionAction.READ, PermissionAction.UPDATE],
        ResourceType.AUDIT_LOG: [],
        ResourceType.TASK: [PermissionAction.READ],
        ResourceType.CONVERSATION: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE],
        ResourceType.INVITATION: [],
        ResourceType.FORM: [PermissionAction.READ],
        ResourceType.RENT_PAYMENT: [PermissionAction.READ],  # Their own payments
        ResourceType.EXPENSE: [],
        ResourceType.INSPECTION: [PermissionAction.READ],
    },
    
    RoleEnum.VENDOR: {
        # Vendor: Read/update only assigned work orders
        ResourceType.ORGANIZATION: [PermissionAction.READ],
        ResourceType.USER: [PermissionAction.READ, PermissionAction.UPDATE],  # Own profile
        ResourceType.PROPERTY: [PermissionAction.READ],  # Properties with assigned work orders
        ResourceType.UNIT: [PermissionAction.READ],  # Units with assigned work orders
        ResourceType.LANDLORD: [PermissionAction.READ],
        ResourceType.TENANT: [PermissionAction.READ],
        ResourceType.LEASE: [],
        ResourceType.VENDOR: [PermissionAction.READ, PermissionAction.UPDATE],  # Own record
        ResourceType.WORK_ORDER: [PermissionAction.READ, PermissionAction.UPDATE],  # Only assigned work orders
        ResourceType.ATTACHMENT: [PermissionAction.CREATE, PermissionAction.READ],  # For work orders
        ResourceType.MESSAGE: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE],  # Related to work orders
        ResourceType.NOTIFICATION: [PermissionAction.READ, PermissionAction.UPDATE],
        ResourceType.AUDIT_LOG: [],
        ResourceType.TASK: [PermissionAction.READ, PermissionAction.UPDATE],  # Related to work orders
        ResourceType.CONVERSATION: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE],
        ResourceType.INVITATION: [],
        ResourceType.FORM: [PermissionAction.READ],
        ResourceType.RENT_PAYMENT: [],
        ResourceType.EXPENSE: [],
        ResourceType.INSPECTION: [PermissionAction.READ],
    },
}


# ============================================================================
# PERMISSION EVALUATOR
# ============================================================================

async def check_permission(
    user: User,
    action: PermissionAction,
    resource: ResourceType,
    db: AsyncSession,
    resource_org_id: Optional[UUID] = None,
    resource_owner_id: Optional[UUID] = None,
    resource_ids: Optional[List[UUID]] = None,
    resource_id: Optional[UUID] = None,
) -> bool:
    """
    Central permission evaluator function.
    
    Args:
        user: Current user
        action: Action to check (CREATE, READ, UPDATE, DELETE, MANAGE)
        resource: Type of resource
        db: Database session
        resource_org_id: Organization ID of the resource (for org scoping)
        resource_owner_id: Owner ID of the resource (for ownership checks)
        resource_ids: List of resource IDs to check (for PM assigned properties, etc.)
        resource_id: Single resource ID to check
    
    Returns:
        True if user has permission, False otherwise
    """
    # Get user roles
    user_roles = await get_user_roles(user, db)
    
    # SUPER_ADMIN has all permissions
    if RoleEnum.SUPER_ADMIN in user_roles:
        return True
    
    # Check each role the user has
    for role in user_roles:
        if role not in PERMISSION_MATRIX:
            continue
        
        role_permissions = PERMISSION_MATRIX[role]
        if resource not in role_permissions:
            continue
        
        allowed_actions = role_permissions[resource]
        
        # Check if action is allowed (MANAGE implies all actions)
        if PermissionAction.MANAGE in allowed_actions:
            # MANAGE permission means all actions are allowed, but still need to check scoping
            pass  # Continue to scoping checks
        elif action not in allowed_actions:
            continue  # This role doesn't allow this action, try next role
        
        # Action is allowed for this role, now check scoping rules
        
        # Organization scoping
        if resource_org_id is not None:
            # SUPER_ADMIN already handled above
            if role == RoleEnum.PMC_ADMIN:
                # PMC_ADMIN can only access resources in their organization
                if user.organization_id != resource_org_id:
                    continue  # Try next role
            elif role in [RoleEnum.PM, RoleEnum.LANDLORD, RoleEnum.TENANT, RoleEnum.VENDOR]:
                # These roles must have matching organization
                if user.organization_id != resource_org_id:
                    continue  # Try next role
        
        # Ownership/resource-specific scoping
        if resource == ResourceType.PROPERTY:
            if role == RoleEnum.PM:
                # PM can only access assigned properties
                # TODO: Check if property_id is in user's assigned properties
                # For now, we'll check organization match
                if resource_org_id and user.organization_id != resource_org_id:
                    continue
            elif role == RoleEnum.LANDLORD:
                # Landlord can only access their own properties
                if resource_owner_id and resource_owner_id != user.id:
                    # Check if user is the landlord for this property
                    if resource_id:
                        result = await db.execute(
                            select(Property).where(
                                and_(
                                    Property.id == resource_id,
                                    Property.landlord_id.in_(
                                        select(Landlord.id).where(Landlord.user_id == user.id)
                                    )
                                )
                            )
                        )
                        if not result.scalar_one_or_none():
                            continue
            elif role == RoleEnum.TENANT:
                # Tenant can only access property they lease
                if resource_id:
                    # Check if tenant has a lease for this property
                    # Check if tenant has a lease for this property
                    from db.models_v2 import LeaseTenant
                    result = await db.execute(
                        select(Lease).join(
                            LeaseTenant, Lease.id == LeaseTenant.lease_id
                        ).join(
                            Tenant, LeaseTenant.tenant_id == Tenant.id
                        ).where(
                            and_(
                                Lease.property_id == resource_id,
                                Tenant.user_id == user.id
                            )
                        )
                    )
                    if not result.scalar_one_or_none():
                        continue
        
        elif resource == ResourceType.WORK_ORDER:
            if role == RoleEnum.VENDOR:
                # Vendor can only access assigned work orders
                if resource_id:
                    result = await db.execute(
                        select(WorkOrder).where(
                            and_(
                                WorkOrder.id == resource_id,
                                or_(
                                    WorkOrder.assigned_to_vendor_id == user.id,
                                    WorkOrder.service_provider_id == user.id
                                )
                            )
                        )
                    )
                    if not result.scalar_one_or_none():
                        continue
            elif role == RoleEnum.TENANT:
                # Tenant can only access work orders they created
                if resource_id:
                    result = await db.execute(
                        select(WorkOrder).where(
                            and_(
                                WorkOrder.id == resource_id,
                                WorkOrder.created_by_user_id == user.id
                            )
                        )
                    )
                    if not result.scalar_one_or_none():
                        continue
        
        elif resource == ResourceType.LEASE:
            if role == RoleEnum.TENANT:
                # Tenant can only access their own lease
                if resource_id:
                    # Check if tenant has this lease
                    from db.models_v2 import LeaseTenant
                    result = await db.execute(
                        select(Lease).join(
                            LeaseTenant, Lease.id == LeaseTenant.lease_id
                        ).join(
                            Tenant, LeaseTenant.tenant_id == Tenant.id
                        ).where(
                            and_(
                                Lease.id == resource_id,
                                Tenant.user_id == user.id
                            )
                        )
                    )
                    if not result.scalar_one_or_none():
                        continue
        
        # If we get here, permission is granted for this role
        return True
    
    # No role granted permission
    return False


# ============================================================================
# FASTAPI DEPENDENCY FACTORY
# ============================================================================

def require_permission(
    action: PermissionAction,
    resource: ResourceType,
    get_resource_context: Optional[callable] = None,
):
    """
    FastAPI dependency factory for requiring specific permissions.
    
    Args:
        action: Required action (CREATE, READ, UPDATE, DELETE, MANAGE)
        resource: Resource type
        get_resource_context: Optional function to extract resource context from request
                             Should return dict with: resource_org_id, resource_owner_id, resource_id, etc.
    
    Usage:
        @router.get("/properties/{property_id}")
        async def get_property(
            property_id: UUID,
            current_user: User = Depends(require_permission(PermissionAction.READ, ResourceType.PROPERTY)),
            ...
        ):
    """
    async def permission_checker(
        current_user: User = Depends(get_current_user_v2),
        db: AsyncSession = Depends(get_db),
        **kwargs  # Capture route parameters
    ) -> User:
        # Extract resource context
        resource_org_id = None
        resource_owner_id = None
        resource_id = None
        resource_ids = None
        
        # If custom context extractor provided, use it
        if get_resource_context:
            context = get_resource_context(kwargs, db)
            resource_org_id = context.get("resource_org_id")
            resource_owner_id = context.get("resource_owner_id")
            resource_id = context.get("resource_id")
            resource_ids = context.get("resource_ids")
        else:
            # Try to extract from common route parameters
            resource_id = kwargs.get("property_id") or kwargs.get("unit_id") or \
                         kwargs.get("tenant_id") or kwargs.get("lease_id") or \
                         kwargs.get("vendor_id") or kwargs.get("work_order_id") or \
                         kwargs.get("organization_id") or kwargs.get("user_id")
            
            # For organization scoping, try to get from query params or resource lookup
            if resource_id and resource in [ResourceType.PROPERTY, ResourceType.UNIT, ResourceType.TENANT, ResourceType.LEASE]:
                # Look up resource to get organization_id
                if resource == ResourceType.PROPERTY:
                    result = await db.execute(
                        select(Property.organization_id).where(Property.id == resource_id)
                    )
                    org_id = result.scalar_one_or_none()
                    if org_id:
                        resource_org_id = org_id
                elif resource == ResourceType.UNIT:
                    from db.models_v2 import Unit
                    result = await db.execute(
                        select(Property.organization_id).join(
                            Unit, Unit.property_id == Property.id
                        ).where(Unit.id == resource_id)
                    )
                    org_id = result.scalar_one_or_none()
                    if org_id:
                        resource_org_id = org_id
        
        # Check permission
        has_permission = await check_permission(
            user=current_user,
            action=action,
            resource=resource,
            db=db,
            resource_org_id=resource_org_id,
            resource_owner_id=resource_owner_id,
            resource_id=resource_id,
            resource_ids=resource_ids,
        )
        
        if not has_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {action.value} on {resource.value}",
            )
        
        return current_user
    
    return permission_checker

