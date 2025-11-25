# API Sequence Diagram - GET /api/v2/tenants

## List Tenants Flow

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
    
    User->>Frontend: Navigate to Tenants page
    Frontend->>ReactQuery: useTenants(orgId)
    ReactQuery->>APIClient: GET /api/v2/tenants?page=1&limit=50
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
    
    FastAPI->>CRUDHelpers: apply_organization_filter(query, Tenant, user, roles)
    CRUDHelpers-->>FastAPI: Query with org filter
    
    FastAPI->>CRUDHelpers: apply_pagination(query, page, limit)
    CRUDHelpers-->>FastAPI: Paginated query
    
    FastAPI->>DB: SELECT tenants WITH<br/>organization, user<br/>ORDER BY created_at DESC<br/>LIMIT 50 OFFSET 0
    DB-->>FastAPI: Tenant records
    
    FastAPI-->>APIClient: 200 OK<br/>List[Tenant]
    APIClient-->>ReactQuery: Tenants data
    ReactQuery->>ReactQuery: Cache results
    ReactQuery-->>Frontend: Tenants array
    Frontend->>Frontend: Render tenants table
    Frontend-->>User: Display tenants
```

## Endpoint Details

- **Method**: GET
- **Path**: `/api/v2/tenants`
- **Query Params**: `organization_id?`, `page=1`, `limit=50`
- **Auth Required**: Yes
- **RBAC**: `require_permission(READ, TENANT)`
- **Response**: `List[Tenant]`

