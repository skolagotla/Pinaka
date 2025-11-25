# API Sequence Diagram - POST /api/v2/leases/{lease_id}/renew

## Renew Lease Flow

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
    
    User->>Frontend: Click "Renew Lease" & fill form
    Frontend->>ReactQuery: useMutation(renewLease)
    ReactQuery->>APIClient: POST /api/v2/leases/{id}/renew<br/>{renewal_data}
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
            alt LANDLORD role
                FastAPI->>DB: SELECT landlord WHERE user_id
                DB-->>FastAPI: Landlord record
                FastAPI->>FastAPI: Check if lease.landlord_id == landlord.id
                alt Not landlord's lease
                    FastAPI-->>APIClient: 403 Forbidden
                    APIClient-->>ReactQuery: Error
                    ReactQuery-->>Frontend: Cannot renew
                    Frontend-->>User: Show error
                else Landlord's lease
                    FastAPI->>FastAPI: Process renewal
                end
            else TENANT role
                FastAPI->>DB: SELECT tenant WHERE user_id
                DB-->>FastAPI: Tenant record
                FastAPI->>DB: SELECT lease_tenant WHERE lease_id AND tenant_id
                DB-->>FastAPI: Lease tenant record
                alt Not tenant's lease
                    FastAPI-->>APIClient: 403 Forbidden
                    APIClient-->>ReactQuery: Error
                    ReactQuery-->>Frontend: Cannot renew
                    Frontend-->>User: Show error
                else Tenant's lease
                    FastAPI->>FastAPI: Process renewal
                end
            end
            
            alt renewal_data.decision == 'renew'
                FastAPI->>FastAPI: Update lease.end_date = new_lease_end<br/>Update lease.rent_amount = new_rent_amount<br/>Set lease.status = 'active'
            else renewal_data.decision == 'month-to-month'
                FastAPI->>FastAPI: Set lease.end_date = far future date<br/>Update lease.rent_amount<br/>Set lease.status = 'active'
            else renewal_data.decision == 'terminate'
                FastAPI->>FastAPI: Set lease.status = 'terminated'
            end
            
            FastAPI->>DB: UPDATE leases SET status, end_date, rent_amount
            DB-->>FastAPI: Lease updated
            
            FastAPI->>DB: SELECT lease WITH relationships
            DB-->>FastAPI: Complete lease
            
            FastAPI-->>APIClient: 200 OK<br/>Lease
            APIClient-->>ReactQuery: Success response
            ReactQuery->>ReactQuery: Invalidate queries
            ReactQuery->>ReactQuery: Update cache
            ReactQuery-->>Frontend: Lease renewed
            Frontend->>Frontend: Update UI
            Frontend-->>User: Show success message
        end
    end
```

## Endpoint Details

- **Method**: POST
- **Path**: `/api/v2/leases/{lease_id}/renew`
- **Auth Required**: Yes
- **RBAC**: `require_permission(READ, LEASE)`
- **Request Body**: `LeaseRenewalRequest`
- **Response**: `Lease` (200 OK)
- **Business Logic**:
  - Landlords can only renew leases for their properties
  - Tenants can only renew their own leases
  - Supports three decisions: "renew", "month-to-month", "terminate"

