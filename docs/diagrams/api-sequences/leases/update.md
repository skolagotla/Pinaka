# API Sequence Diagram - PATCH /api/v2/leases/{lease_id}

## Update Lease Flow

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
    
    User->>Frontend: Edit lease form & submit
    Frontend->>ReactQuery: useMutation(updateLease)
    ReactQuery->>APIClient: PATCH /api/v2/leases/{id}<br/>{lease_data}
    APIClient->>FastAPI: HTTP Request + JWT
    
    FastAPI->>AuthMW: get_current_user_v2(token)
    AuthMW->>DB: SELECT user WHERE id
    DB-->>AuthMW: User record
    AuthMW-->>FastAPI: Authenticated user
    
    FastAPI->>RBACMW: require_permission(CREATE, LEASE)
    RBACMW->>RBACMW: check_permission(user, CREATE, LEASE)
    RBACMW->>DB: SELECT user_roles WHERE user_id
    DB-->>RBACMW: User roles
    RBACMW->>RBACMW: Check PERMISSION_MATRIX
    RBACMW-->>FastAPI: Permission granted
    
    FastAPI->>DB: SELECT lease WHERE id = lease_id
    DB-->>FastAPI: Lease record
    
    alt Lease not found
        FastAPI-->>APIClient: 404 Not Found
        APIClient-->>ReactQuery: Error
        ReactQuery-->>Frontend: Lease not found
        Frontend-->>User: Show error
    else Lease found
        FastAPI->>FastAPI: Check organization access
        alt Org mismatch
            FastAPI-->>APIClient: 403 Forbidden
            APIClient-->>ReactQuery: Error
            ReactQuery-->>Frontend: Access denied
            Frontend-->>User: Show error
        else Access OK
            FastAPI->>FastAPI: Extract update fields (exclude_unset=True)
            FastAPI->>FastAPI: Update lease fields
            FastAPI->>DB: UPDATE leases SET ... WHERE id
            DB-->>FastAPI: Lease updated
            
            FastAPI->>DB: SELECT lease WITH relationships
            DB-->>FastAPI: Complete lease
            
            FastAPI-->>APIClient: 200 OK<br/>Lease
            APIClient-->>ReactQuery: Success response
            ReactQuery->>ReactQuery: Invalidate queries
            ReactQuery->>ReactQuery: Update cache
            ReactQuery-->>Frontend: Lease updated
            Frontend->>Frontend: Update UI
            Frontend-->>User: Show success message
        end
    end
```

## Endpoint Details

- **Method**: PATCH
- **Path**: `/api/v2/leases/{lease_id}`
- **Auth Required**: Yes
- **RBAC**: `require_permission(CREATE, LEASE)`
- **Request Body**: `LeaseUpdate` (all fields optional)
- **Response**: `Lease` (200 OK)

