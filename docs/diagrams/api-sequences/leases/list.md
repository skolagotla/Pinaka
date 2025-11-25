# API Sequence Diagram - GET /api/v2/leases

## List Leases Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant ReactQuery
    participant APIClient
    participant FastAPI
    participant AuthMW
    participant RBACMW
    participant DB
    
    User->>Frontend: Navigate to Leases page
    Frontend->>ReactQuery: useLeases(filters)
    ReactQuery->>APIClient: GET /api/v2/leases?page=1&limit=50
    APIClient->>FastAPI: HTTP Request + JWT
    
    FastAPI->>AuthMW: get_current_user_v2(token)
    AuthMW->>DB: SELECT user WHERE id
    DB-->>AuthMW: User record
    AuthMW-->>FastAPI: Authenticated user
    
    FastAPI->>RBACMW: require_permission(READ, LEASE)
    RBACMW->>RBACMW: check_permission(user, READ, LEASE)
    RBACMW->>DB: SELECT user_roles WHERE user_id
    DB-->>RBACMW: User roles
    RBACMW->>RBACMW: Check PERMISSION_MATRIX
    RBACMW-->>FastAPI: Permission granted
    
    FastAPI->>FastAPI: Build query with filters<br/>(org_id, unit_id, tenant_id, landlord_id)
    
    alt SUPER_ADMIN
        FastAPI->>FastAPI: Apply optional org_id filter
    else Other roles
        FastAPI->>FastAPI: Filter by user.organization_id
        alt TENANT role
            FastAPI->>DB: SELECT tenant WHERE user_id
            DB-->>FastAPI: Tenant record
            FastAPI->>FastAPI: Filter by tenant.id
        end
    end
    
    FastAPI->>FastAPI: Apply pagination
    FastAPI->>DB: SELECT leases WITH<br/>lease_tenants, tenants, unit, property, landlord<br/>ORDER BY created_at DESC<br/>LIMIT 50 OFFSET 0
    DB-->>FastAPI: Lease records
    
    FastAPI-->>APIClient: 200 OK<br/>List[Lease]
    APIClient-->>ReactQuery: Leases data
    ReactQuery->>ReactQuery: Cache results
    ReactQuery-->>Frontend: Leases array
    Frontend->>Frontend: Render leases table
    Frontend-->>User: Display leases
```

## Endpoint Details

- **Method**: GET
- **Path**: `/api/v2/leases`
- **Query Params**: `organization_id?`, `unit_id?`, `tenant_id?`, `landlord_id?`, `page=1`, `limit=50`
- **Auth Required**: Yes
- **RBAC**: `require_permission(READ, LEASE)`
- **Response**: `List[Lease]` (with eager-loaded relationships)
- **Special Logic**:
  - Tenants see only their own leases
  - Non-super users see only their organization's leases
  - Supports multiple filter parameters

