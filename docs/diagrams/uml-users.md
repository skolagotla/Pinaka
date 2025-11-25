# UML Class Diagram - Users & RBAC Domain

## Pinaka v2 Users and Role-Based Access Control

This UML class diagram shows the user authentication and RBAC domain models.

```mermaid
classDiagram
    class Organization {
        +UUID id
        +String name
        +String type
        +String timezone
        +String country
        +DateTime created_at
        +List~User~ users
        +List~UserRole~ user_roles
    }
    
    class User {
        +UUID id
        +UUID organization_id
        +String email
        +String password_hash
        +String full_name
        +String phone
        +String status
        +Boolean onboarding_completed
        +Integer onboarding_step
        +JSON onboarding_data
        +DateTime created_at
        +DateTime updated_at
        +Organization organization
        +List~UserRole~ user_roles
        +List~WorkOrder~ created_work_orders
        +List~WorkOrderComment~ work_order_comments
        +List~Notification~ notifications
        +List~AuditLog~ audit_logs
    }
    
    class Role {
        +UUID id
        +String name
        +String description
        +List~UserRole~ user_roles
    }
    
    class UserRole {
        +UUID id
        +UUID user_id
        +UUID role_id
        +UUID organization_id
        +DateTime created_at
        +User user
        +Role role
        +Organization organization
    }
    
    class AuditLog {
        +UUID id
        +UUID organization_id
        +UUID actor_user_id
        +String action
        +String entity_type
        +UUID entity_id
        +JSONB extra_metadata
        +DateTime created_at
        +Organization organization
        +User actor
    }
    
    class Invitation {
        +UUID id
        +UUID organization_id
        +UUID invited_by_user_id
        +String email
        +String role_name
        +String token
        +String status
        +DateTime expires_at
        +DateTime accepted_at
        +DateTime created_at
        +Organization organization
        +User invited_by_user
    }
    
    Organization "1" --> "*" User : contains
    Organization "1" --> "*" UserRole : scopes
    User "*" --> "*" Role : has (via UserRole)
    UserRole "*" --> "1" User : belongs to
    UserRole "*" --> "1" Role : has
    UserRole "*" --> "1" Organization : scoped to
    User "1" --> "*" AuditLog : performs
    Organization "1" --> "*" AuditLog : contains
    User "1" --> "*" Invitation : sends
    Organization "1" --> "*" Invitation : contains
    
    note for User "Unified user model for all user types"
    note for UserRole "Many-to-many relationship with organization scoping"
    note for Role "Roles: super_admin, pmc_admin, pm, landlord, tenant, vendor"
    note for AuditLog "Tracks all user actions for compliance"
```

## Relationships

- **Organization → User**: One-to-many (organization contains users)
- **User → Role**: Many-to-many via UserRole (users can have multiple roles)
- **UserRole**: Join table with organization scoping (users can have different roles in different organizations)
- **User → AuditLog**: One-to-many (user performs actions)
- **User → Invitation**: One-to-many (user sends invitations)

## Key Attributes

### User
- **id**: UUID primary key
- **email**: Unique identifier for authentication
- **password_hash**: Bcrypt hashed password
- **status**: 'active', 'invited', 'suspended'
- **onboarding_completed**: Boolean flag for onboarding flow
- **onboarding_step**: Current step in onboarding process
- **onboarding_data**: JSON storage for onboarding progress

### Role
- **name**: Unique role identifier ('super_admin', 'pmc_admin', 'pm', 'landlord', 'tenant', 'vendor')
- **description**: Human-readable role description

### UserRole
- **user_id**: Foreign key to User
- **role_id**: Foreign key to Role
- **organization_id**: Foreign key to Organization (for multi-tenant scoping)
- **Unique constraint**: (user_id, role_id, organization_id)

### AuditLog
- **actor_user_id**: User who performed the action
- **action**: Action type ('ROLE_CHANGED', 'USER_IMPERSONATED', etc.)
- **entity_type**: Type of entity affected
- **entity_id**: ID of entity affected
- **extra_metadata**: JSONB for additional context

