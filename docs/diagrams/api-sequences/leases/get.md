# API Sequence Diagram - GET /api/v2/leases/{lease_id}

## Get Lease by ID Flow

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
    
    User->>Frontend: Click lease row / view details
    Frontend->>ReactQuery: useLease(leaseId)
    ReactQuery->>APIClient: GET /api/v2/leases/{id}
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
    
    FastAPI->>DB: SELECT lease WITH<br/>lease_tenants, tenants, unit, property, landlord<br/>WHERE id = lease_id
    DB-->>FastAPI: Lease record
    
    alt Lease not found
        FastAPI-->>APIClient: 404 Not Found
        APIClient-->>ReactQuery: Error
        ReactQuery-->>Frontend: Lease not found
        Frontend-->>User: Show error message
    else Lease found
        FastAPI->>FastAPI: Check organization access
        alt Org mismatch
            FastAPI-->>APIClient: 403 Forbidden
            APIClient-->>ReactQuery: Error
            ReactQuery-->>Frontend: Access denied
            Frontend-->>User: Show error message
        else Access OK
            alt TENANT role
                FastAPI->>DB: SELECT tenant WHERE user_id
                DB-->>FastAPI: Tenant record
                FastAPI->>FastAPI: Check if lease.tenant_id == tenant.id
                alt Not tenant's lease
                    FastAPI-->>APIClient: 403 Forbidden
                    APIClient-->>ReactQuery: Error
                    ReactQuery-->>Frontend: Access denied
                    Frontend-->>User: Show error message
                else Tenant's lease
                    FastAPI-->>APIClient: 200 OK<br/>Lease
                    APIClient-->>ReactQuery: Lease data
                    ReactQuery->>ReactQuery: Cache result
                    ReactQuery-->>Frontend: Lease object
                    Frontend->>Frontend: Render lease details
                    Frontend-->>User: Display lease information
                end
            else Other roles
                FastAPI-->>APIClient: 200 OK<br/>Lease
                APIClient-->>ReactQuery: Lease data
                ReactQuery->>ReactQuery: Cache result
                ReactQuery-->>Frontend: Lease object
                Frontend->>Frontend: Render lease details
                Frontend-->>User: Display lease information
            end
        end
    end
```

## Endpoint Details

- **Method**: GET
- **Path**: `/api/v2/leases/{lease_id}`
- **Auth Required**: Yes
- **RBAC**: `require_permission(READ, LEASE)`
- **Response**: `Lease` (with all relationships)
- **Special Logic**:
  - Tenants can only see their own leases
  - Organization access is checked

