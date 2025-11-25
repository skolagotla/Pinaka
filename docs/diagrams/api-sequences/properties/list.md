# API Sequence Diagram - GET /api/v2/properties

## List Properties Flow

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
    
    User->>Frontend: Navigate to Properties page
    Frontend->>ReactQuery: useProperties(orgId)
    ReactQuery->>APIClient: GET /api/v2/properties?page=1&limit=50
    APIClient->>FastAPI: HTTP Request + JWT
    
    FastAPI->>AuthMW: get_current_user_v2(token)
    AuthMW->>DB: SELECT user WHERE id
    DB-->>AuthMW: User record
    AuthMW-->>FastAPI: Authenticated user
    
    FastAPI->>RBACMW: require_permission(READ, PROPERTY)
    RBACMW->>RBACMW: check_permission(user, READ, PROPERTY)
    RBACMW->>DB: SELECT user_roles WHERE user_id
    DB-->>RBACMW: User roles
    RBACMW->>RBACMW: Check PERMISSION_MATRIX
    RBACMW-->>FastAPI: Permission granted
    
    FastAPI->>CRUDHelpers: apply_organization_filter(query, Property, user, roles)
    CRUDHelpers->>CRUDHelpers: Check if SUPER_ADMIN
    alt SUPER_ADMIN
        CRUDHelpers-->>FastAPI: Query (no org filter)
    else Other roles
        CRUDHelpers-->>FastAPI: Query with org_id filter
    end
    
    FastAPI->>CRUDHelpers: apply_pagination(query, page, limit)
    CRUDHelpers-->>FastAPI: Paginated query
    
    FastAPI->>DB: SELECT properties<br/>WITH landlord, organization<br/>ORDER BY created_at DESC<br/>LIMIT 50 OFFSET 0
    DB-->>FastAPI: Property records
    
    FastAPI-->>APIClient: 200 OK<br/>List[Property]
    APIClient-->>ReactQuery: Properties data
    ReactQuery->>ReactQuery: Cache results
    ReactQuery-->>Frontend: Properties array
    Frontend->>Frontend: Render properties table
    Frontend-->>User: Display properties
```

## Endpoint Details

- **Method**: GET
- **Path**: `/api/v2/properties`
- **Query Params**: `organization_id?`, `page=1`, `limit=50`
- **Auth Required**: Yes
- **RBAC**: `require_permission(READ, PROPERTY)`
- **Response**: `List[Property]`
- **Dependencies**: 
  - `get_current_user_v2` (auth)
  - `require_permission` (RBAC)
  - `apply_organization_filter` (org scoping)
  - `apply_pagination` (pagination)

