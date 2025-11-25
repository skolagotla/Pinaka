# API Sequence Diagram - GET /api/v2/work-orders/{work_order_id}

## Get Work Order by ID Flow

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
    
    User->>Frontend: Click work order row / view details
    Frontend->>ReactQuery: useWorkOrder(workOrderId)
    ReactQuery->>APIClient: GET /api/v2/work-orders/{id}
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
    
    FastAPI->>DB: SELECT work_order WITH<br/>comments, author<br/>WHERE id = work_order_id
    DB-->>FastAPI: Work order record
    
    alt Work order not found
        FastAPI-->>APIClient: 404 Not Found
        APIClient-->>ReactQuery: Error
        ReactQuery-->>Frontend: Work order not found
        Frontend-->>User: Show error message
    else Work order found
        FastAPI->>FastAPI: Check organization access
        alt Org mismatch
            FastAPI-->>APIClient: 403 Forbidden
            APIClient-->>ReactQuery: Error
            ReactQuery-->>Frontend: Access denied
            Frontend-->>User: Show error message
        else Access OK
            alt TENANT role
                FastAPI->>FastAPI: Check if work_order.tenant_id == current_user.id
                alt Not tenant's work order
                    FastAPI-->>APIClient: 403 Forbidden
                    APIClient-->>ReactQuery: Error
                    ReactQuery-->>Frontend: Access denied
                    Frontend-->>User: Show error message
                else Tenant's work order
                    FastAPI-->>APIClient: 200 OK<br/>WorkOrder
                    APIClient-->>ReactQuery: Work order data
                    ReactQuery->>ReactQuery: Cache result
                    ReactQuery-->>Frontend: Work order object
                    Frontend->>Frontend: Render work order details
                    Frontend-->>User: Display work order information
                end
            else Other roles
                FastAPI-->>APIClient: 200 OK<br/>WorkOrder
                APIClient-->>ReactQuery: Work order data
                ReactQuery->>ReactQuery: Cache result
                ReactQuery-->>Frontend: Work order object
                Frontend->>Frontend: Render work order details
                Frontend-->>User: Display work order information
            end
        end
    end
```

## Endpoint Details

- **Method**: GET
- **Path**: `/api/v2/work-orders/{work_order_id}`
- **Auth Required**: Yes
- **RBAC**: `require_permission(READ, WORK_ORDER)`
- **Response**: `WorkOrder` (with comments and author)
- **Special Logic**:
  - Tenants can only see their own work orders
  - Organization access is checked

