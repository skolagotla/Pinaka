# API Sequence Diagram - GET /api/v2/vendors

## List Vendors Flow

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
    
    User->>Frontend: Navigate to Vendors page
    Frontend->>ReactQuery: useVendors(filters)
    ReactQuery->>APIClient: GET /api/v2/vendors?page=1&limit=50&search=plumbing
    APIClient->>FastAPI: HTTP Request + JWT
    
    FastAPI->>AuthMW: get_current_user_v2(token)
    AuthMW->>DB: SELECT user WHERE id
    DB-->>AuthMW: User record
    AuthMW-->>FastAPI: Authenticated user
    
    FastAPI->>RBACMW: require_permission(READ, VENDOR)
    RBACMW->>RBACMW: check_permission(user, READ, VENDOR)
    RBACMW->>DB: SELECT user_roles WHERE user_id
    DB-->>RBACMW: User roles
    RBACMW->>RBACMW: Check PERMISSION_MATRIX
    RBACMW-->>FastAPI: Permission granted
    
    FastAPI->>CRUDHelpers: apply_organization_filter(query, Vendor, user, roles)
    CRUDHelpers-->>FastAPI: Query with org filter
    
    alt status_filter provided
        FastAPI->>FastAPI: Add status WHERE clause
    end
    
    alt search provided
        FastAPI->>FastAPI: Add search WHERE clause<br/>(company_name, contact_name, email ILIKE)
    end
    
    FastAPI->>CRUDHelpers: apply_pagination(query, page, limit)
    CRUDHelpers-->>FastAPI: Paginated query
    
    FastAPI->>DB: SELECT vendors<br/>ORDER BY created_at DESC<br/>LIMIT 50 OFFSET 0
    DB-->>FastAPI: Vendor records
    
    FastAPI-->>APIClient: 200 OK<br/>List[VendorResponse]
    APIClient-->>ReactQuery: Vendors data
    ReactQuery->>ReactQuery: Cache results
    ReactQuery-->>Frontend: Vendors array
    Frontend->>Frontend: Render vendors table
    Frontend-->>User: Display vendors
```

## Endpoint Details

- **Method**: GET
- **Path**: `/api/v2/vendors`
- **Query Params**: `organization_id?`, `search?`, `status_filter?`, `page=1`, `limit=50`
- **Auth Required**: Yes
- **RBAC**: `require_permission(READ, VENDOR)`
- **Response**: `List[VendorResponse]`
- **Special Features**:
  - Supports text search across company_name, contact_name, and email
  - Supports status filtering

