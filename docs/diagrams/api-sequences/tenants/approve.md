# API Sequence Diagram - POST /api/v2/tenants/{tenant_id}/approve

## Approve Tenant Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant ReactQuery
    participant APIClient
    participant FastAPI
    participant AuthMW
    participant RBACMW
    participant CRUDHelpers
    participant DB
    
    User->>Frontend: Click "Approve" on tenant
    Frontend->>ReactQuery: useMutation(approveTenant)
    ReactQuery->>APIClient: POST /api/v2/tenants/{id}/approve<br/>{approval_data}
    APIClient->>FastAPI: HTTP Request + JWT
    
    FastAPI->>AuthMW: get_current_user_v2(token)
    AuthMW->>DB: SELECT user WHERE id
    DB-->>AuthMW: User record
    AuthMW-->>FastAPI: Authenticated user
    
    FastAPI->>RBACMW: require_permission(READ, TENANT)
    RBACMW->>RBACMW: check_permission(user, READ, TENANT)
    RBACMW->>DB: SELECT user_roles WHERE user_id
    DB-->>RBACMW: User roles
    RBACMW->>RBACMW: Check PERMISSION_MATRIX
    RBACMW-->>FastAPI: Permission granted
    
    FastAPI->>CRUDHelpers: get_entity_or_404(Tenant, tenant_id)
    CRUDHelpers->>DB: SELECT tenant WHERE id
    DB-->>CRUDHelpers: Tenant record
    
    alt Tenant not found
        CRUDHelpers-->>FastAPI: 404 Not Found
        FastAPI-->>APIClient: 404 Error
        APIClient-->>ReactQuery: Error
        ReactQuery-->>Frontend: Tenant not found
        Frontend-->>User: Show error
    else Tenant found
        CRUDHelpers-->>FastAPI: Tenant object
        
        alt Not SUPER_ADMIN
            FastAPI->>CRUDHelpers: check_organization_access(tenant, user, roles)
            CRUDHelpers-->>FastAPI: Access verified
            
            alt LANDLORD role
                FastAPI->>DB: SELECT landlord WHERE user_id
                DB-->>FastAPI: Landlord record
                alt Landlord not found
                    FastAPI-->>APIClient: 403 Forbidden
                    APIClient-->>ReactQuery: Error
                    ReactQuery-->>Frontend: Access denied
                    Frontend-->>User: Show error
                else Landlord found
                    FastAPI->>FastAPI: Check tenant linked to landlord's properties
                    FastAPI->>FastAPI: Approval allowed
                end
            end
        end
        
        FastAPI->>FastAPI: Update tenant.status = 'approved'
        FastAPI->>DB: UPDATE tenants SET status WHERE id
        DB-->>FastAPI: Tenant updated
        
        FastAPI->>DB: SELECT tenant WITH relationships
        DB-->>FastAPI: Complete tenant
        
        FastAPI-->>APIClient: 200 OK<br/>Tenant
        APIClient-->>ReactQuery: Success response
        ReactQuery->>ReactQuery: Invalidate queries
        ReactQuery->>ReactQuery: Update cache
        ReactQuery-->>Frontend: Tenant approved
        Frontend->>Frontend: Update UI
        Frontend-->>User: Show success message
    end
```

## Endpoint Details

- **Method**: POST
- **Path**: `/api/v2/tenants/{tenant_id}/approve`
- **Auth Required**: Yes
- **RBAC**: `require_permission(READ, TENANT)`
- **Request Body**: `TenantApprovalRequest` (empty object)
- **Response**: `Tenant` (200 OK)
- **Business Logic**:
  - Landlords can only approve tenants for their properties
  - Updates tenant status to 'approved'

