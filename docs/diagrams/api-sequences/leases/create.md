# API Sequence Diagram - POST /api/v2/leases

## Create Lease Flow

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
    
    User->>Frontend: Fill lease form & submit
    Frontend->>ReactQuery: useMutation(createLease)
    ReactQuery->>APIClient: POST /api/v2/leases<br/>{lease_data}
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
    
    FastAPI->>FastAPI: Verify organization access
    alt Not SUPER_ADMIN and org_id != user.org_id
        FastAPI-->>APIClient: 403 Forbidden
        APIClient-->>ReactQuery: Error
        ReactQuery-->>Frontend: Show error
        Frontend-->>User: Cannot create in different org
    else Access granted
        FastAPI->>DB: SELECT unit WHERE id = unit_id
        DB-->>FastAPI: Unit record
        
        alt Unit not found
            FastAPI-->>APIClient: 404 Not Found
            APIClient-->>ReactQuery: Error
            ReactQuery-->>Frontend: Unit not found
            Frontend-->>User: Show error
        else Unit found
            FastAPI->>FastAPI: Check unit belongs to organization
            alt Unit org mismatch
                FastAPI-->>APIClient: 403 Forbidden
                APIClient-->>ReactQuery: Error
                ReactQuery-->>Frontend: Access denied
                Frontend-->>User: Show error
            else Unit access OK
                FastAPI->>DB: SELECT leases WHERE unit_id<br/>AND status = 'active'<br/>AND dates overlap
                DB-->>FastAPI: Existing leases
                
                alt Unit has active lease
                    FastAPI-->>APIClient: 400 Bad Request
                    APIClient-->>ReactQuery: Error
                    ReactQuery-->>Frontend: Unit not available
                    Frontend-->>User: Unit already leased
                else Unit available
                    FastAPI->>DB: INSERT INTO leases<br/>(org_id, unit_id, landlord_id,<br/>start_date, end_date, rent_amount, ...)
                    DB-->>FastAPI: Lease created
                    
                    loop For each tenant in lease_data.tenant_ids
                        FastAPI->>DB: INSERT INTO lease_tenants<br/>(lease_id, tenant_id, is_primary)
                        DB-->>FastAPI: Tenant linked
                    end
                    
                    FastAPI->>DB: SELECT lease WITH<br/>unit, landlord, lease_tenants, tenants
                    DB-->>FastAPI: Complete lease
                    
                    FastAPI-->>APIClient: 201 Created<br/>Lease
                    APIClient-->>ReactQuery: Success response
                    ReactQuery->>ReactQuery: Invalidate queries
                    ReactQuery->>ReactQuery: Update cache
                    ReactQuery-->>Frontend: Lease created
                    Frontend->>Frontend: Update UI
                    Frontend-->>User: Show success message
                end
            end
        end
    end
```

## Endpoint Details

- **Method**: POST
- **Path**: `/api/v2/leases`
- **Auth Required**: Yes
- **RBAC**: `require_permission(CREATE, LEASE)`
- **Request Body**: `LeaseCreate` (with tenant_ids array)
- **Response**: `Lease` (201 Created)
- **Business Logic**:
  - Verify unit exists and belongs to organization
  - Check unit availability (no overlapping active leases)
  - Create lease record
  - Create lease_tenant records for all tenants
- **Dependencies**:
  - `get_current_user_v2` (auth)
  - `require_permission` (RBAC)
  - Organization scoping check

