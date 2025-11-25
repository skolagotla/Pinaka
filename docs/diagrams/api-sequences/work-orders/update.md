# API Sequence Diagram - PATCH /api/v2/work-orders/{work_order_id}

## Update Work Order Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant ReactQuery
    participant APIClient
    participant FastAPI
    participant AuthMW
    participant RoleMW
    participant DB
    
    User->>Frontend: Edit work order form & submit
    Frontend->>ReactQuery: useMutation(updateWorkOrder)
    ReactQuery->>APIClient: PATCH /api/v2/work-orders/{id}<br/>{work_order_data}
    APIClient->>FastAPI: HTTP Request + JWT
    
    FastAPI->>AuthMW: get_current_user_v2(token)
    AuthMW->>DB: SELECT user WHERE id
    DB-->>AuthMW: User record
    AuthMW-->>FastAPI: Authenticated user
    
    FastAPI->>RoleMW: require_role_v2([SUPER_ADMIN, PMC_ADMIN, PM, LANDLORD])
    RoleMW->>DB: SELECT user_roles WHERE user_id
    DB-->>RoleMW: User roles
    RoleMW->>RoleMW: Check if user has required role
    alt User lacks required role
        RoleMW-->>FastAPI: 403 Forbidden
        FastAPI-->>APIClient: 403 Error
        APIClient-->>ReactQuery: Error
        ReactQuery-->>Frontend: Show error
        Frontend-->>User: Access denied
    else Role granted
        RoleMW-->>FastAPI: Role verified
        
        FastAPI->>DB: SELECT work_order WHERE id
        DB-->>FastAPI: Work order record
        
        alt Work order not found
            FastAPI-->>APIClient: 404 Not Found
            APIClient-->>ReactQuery: Error
            ReactQuery-->>Frontend: Work order not found
            Frontend-->>User: Show error
        else Work order found
            FastAPI->>FastAPI: Check organization access
            alt Org mismatch
                FastAPI-->>APIClient: 403 Forbidden
                APIClient-->>ReactQuery: Error
                ReactQuery-->>Frontend: Access denied
                Frontend-->>User: Show error
            else Access OK
                FastAPI->>FastAPI: Extract update fields (exclude_unset=True)
                FastAPI->>FastAPI: Update work order fields
                FastAPI->>DB: UPDATE work_orders SET ... WHERE id
                DB-->>FastAPI: Work order updated
                
                FastAPI->>DB: SELECT work_order WITH relationships
                DB-->>FastAPI: Complete work order
                
                FastAPI-->>APIClient: 200 OK<br/>WorkOrder
                APIClient-->>ReactQuery: Success response
                ReactQuery->>ReactQuery: Invalidate queries
                ReactQuery->>ReactQuery: Update cache
                ReactQuery-->>Frontend: Work order updated
                Frontend->>Frontend: Update UI
                Frontend-->>User: Show success message
            end
        end
    end
```

## Endpoint Details

- **Method**: PATCH
- **Path**: `/api/v2/work-orders/{work_order_id}`
- **Auth Required**: Yes
- **Role Required**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, or `LANDLORD`
- **Request Body**: `WorkOrderUpdate` (all fields optional)
- **Response**: `WorkOrder` (200 OK)

