# API Sequence Diagram - GET /api/v2/work-orders

## List Work Orders Flow

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
    
    User->>Frontend: Navigate to Work Orders page
    Frontend->>ReactQuery: useWorkOrders(filters)
    ReactQuery->>APIClient: GET /api/v2/work-orders?page=1&limit=50
    APIClient->>FastAPI: HTTP Request + JWT
    
    FastAPI->>AuthMW: get_current_user_v2(token)
    AuthMW->>DB: SELECT user WHERE id
    DB-->>AuthMW: User record
    AuthMW-->>FastAPI: Authenticated user
    
    FastAPI->>RBACMW: require_permission(READ, WORK_ORDER)
    RBACMW->>RBACMW: check_permission(user, READ, WORK_ORDER)
    RBACMW->>DB: SELECT user_roles WHERE user_id
    DB-->>RBACMW: User roles
    RBACMW->>RBACMW: Check PERMISSION_MATRIX
    RBACMW-->>FastAPI: Permission granted
    
    FastAPI->>CRUDHelpers: apply_organization_filter(query, WorkOrder, user, roles)
    CRUDHelpers-->>FastAPI: Query with org filter
    
    alt property_id filter provided
        FastAPI->>FastAPI: Add property_id WHERE clause
    end
    
    alt status_filter provided
        FastAPI->>FastAPI: Add status WHERE clause
    end
    
    alt TENANT role
        FastAPI->>FastAPI: Filter by tenant_id = current_user.id
    else VENDOR role
        FastAPI->>DB: SELECT vendor WHERE user_id
        DB-->>FastAPI: Vendor record
        FastAPI->>DB: SELECT work_order_assignments<br/>WHERE vendor_id
        DB-->>FastAPI: Assigned work order IDs
        FastAPI->>FastAPI: Filter work orders by assignment IDs
    end
    
    FastAPI->>CRUDHelpers: apply_pagination(query, page, limit)
    CRUDHelpers-->>FastAPI: Paginated query
    
    FastAPI->>DB: SELECT work_orders WITH<br/>comments, author, property, unit, tenant<br/>ORDER BY created_at DESC<br/>LIMIT 50 OFFSET 0
    DB-->>FastAPI: Work order records
    
    FastAPI-->>APIClient: 200 OK<br/>List[WorkOrder]
    APIClient-->>ReactQuery: Work orders data
    ReactQuery->>ReactQuery: Cache results
    ReactQuery-->>Frontend: Work orders array
    Frontend->>Frontend: Render work orders table
    Frontend-->>User: Display work orders
```

## Endpoint Details

- **Method**: GET
- **Path**: `/api/v2/work-orders`
- **Query Params**: `organization_id?`, `property_id?`, `status_filter?`, `page=1`, `limit=50`
- **Auth Required**: Yes
- **RBAC**: `require_permission(READ, WORK_ORDER)`
- **Response**: `List[WorkOrder]`
- **Role-Based Filtering**:
  - **TENANT**: Only their own work orders
  - **VENDOR**: Only assigned work orders (via work_order_assignments)
  - **Others**: Organization-scoped work orders
- **Dependencies**:
  - `get_current_user_v2` (auth)
  - `require_permission` (RBAC)
  - `apply_organization_filter` (org scoping)
  - `apply_pagination` (pagination)

