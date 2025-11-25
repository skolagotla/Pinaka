# API Sequence Diagram - GET /api/v2/units

## List Units Flow

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
    
    User->>Frontend: Navigate to Units page
    Frontend->>ReactQuery: useUnits(propertyId)
    ReactQuery->>APIClient: GET /api/v2/units?page=1&limit=50
    APIClient->>FastAPI: HTTP Request + JWT
    
    FastAPI->>AuthMW: get_current_user_v2(token)
    AuthMW->>DB: SELECT user WHERE id
    DB-->>AuthMW: User record
    AuthMW-->>FastAPI: Authenticated user
    
    FastAPI->>RBACMW: require_permission(READ, UNIT)
    RBACMW->>RBACMW: check_permission(user, READ, UNIT)
    RBACMW->>DB: SELECT user_roles WHERE user_id
    DB-->>RBACMW: User roles
    RBACMW->>RBACMW: Check PERMISSION_MATRIX
    RBACMW-->>FastAPI: Permission granted
    
    FastAPI->>FastAPI: Build query with property filter
    alt property_id provided
        FastAPI->>FastAPI: Add property_id WHERE clause
    end
    
    alt SUPER_ADMIN
        FastAPI->>FastAPI: No org filter
    else Other roles
        FastAPI->>FastAPI: Join with properties table
        FastAPI->>FastAPI: Filter by Property.organization_id = user.organization_id
    end
    
    FastAPI->>CRUDHelpers: apply_pagination(query, page, limit)
    CRUDHelpers-->>FastAPI: Paginated query
    
    FastAPI->>DB: SELECT units WITH property<br/>ORDER BY created_at DESC<br/>LIMIT 50 OFFSET 0
    DB-->>FastAPI: Unit records
    
    FastAPI-->>APIClient: 200 OK<br/>List[Unit]
    APIClient-->>ReactQuery: Units data
    ReactQuery->>ReactQuery: Cache results
    ReactQuery-->>Frontend: Units array
    Frontend->>Frontend: Render units table
    Frontend-->>User: Display units
```

## Endpoint Details

- **Method**: GET
- **Path**: `/api/v2/units`
- **Query Params**: `property_id?`, `page=1`, `limit=50`
- **Auth Required**: Yes
- **RBAC**: `require_permission(READ, UNIT)`
- **Response**: `List[Unit]`
- **Special Logic**:
  - Units are filtered by organization through their parent property
  - Supports optional property filter

