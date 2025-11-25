# API Sequence Diagram - POST /api/v2/work-orders

## Create Work Order Flow

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
    participant NotificationService
    
    User->>Frontend: Fill work order form & submit
    Frontend->>ReactQuery: useMutation(createWorkOrder)
    ReactQuery->>APIClient: POST /api/v2/work-orders<br/>{work_order_data}
    APIClient->>FastAPI: HTTP Request + JWT
    
    FastAPI->>AuthMW: get_current_user_v2(token)
    AuthMW->>DB: SELECT user WHERE id
    DB-->>AuthMW: User record
    AuthMW-->>FastAPI: Authenticated user
    
    FastAPI->>RBACMW: require_permission(CREATE, WORK_ORDER)
    RBACMW->>RBACMW: check_permission(user, CREATE, WORK_ORDER)
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
        FastAPI->>DB: SELECT property WHERE id = property_id
        DB-->>FastAPI: Property record
        
        alt Property not found
            FastAPI-->>APIClient: 404 Not Found
            APIClient-->>ReactQuery: Error
            ReactQuery-->>Frontend: Property not found
            Frontend-->>User: Show error
        else Property found
            FastAPI->>FastAPI: Check property belongs to organization
            alt Property org mismatch
                FastAPI-->>APIClient: 403 Forbidden
                APIClient-->>ReactQuery: Error
                ReactQuery-->>Frontend: Access denied
                Frontend-->>User: Show error
            else Property access OK
                FastAPI->>FastAPI: Set status = 'new'<br/>Set priority<br/>Set created_by_user_id
                FastAPI->>DB: INSERT INTO work_orders<br/>(org_id, property_id, unit_id,<br/>tenant_id, created_by_user_id,<br/>title, description, status, priority)
                DB-->>FastAPI: Work order created
                
                FastAPI->>DB: SELECT work_order WITH<br/>property, unit, tenant, organization
                DB-->>FastAPI: Complete work order
                
                FastAPI->>NotificationService: notifyPMs(work_order)
                NotificationService->>DB: INSERT INTO notifications<br/>FOR each PM in organization
                DB-->>NotificationService: Notifications created
                
                FastAPI-->>APIClient: 201 Created<br/>WorkOrder
                APIClient-->>ReactQuery: Success response
                ReactQuery->>ReactQuery: Invalidate queries
                ReactQuery->>ReactQuery: Update cache
                ReactQuery-->>Frontend: Work order created
                Frontend->>Frontend: Update UI
                Frontend-->>User: Show success message
            end
        end
    end
```

## Endpoint Details

- **Method**: POST
- **Path**: `/api/v2/work-orders`
- **Auth Required**: Yes
- **RBAC**: `require_permission(CREATE, WORK_ORDER)`
- **Request Body**: `WorkOrderCreate`
- **Response**: `WorkOrder` (201 Created)
- **Business Logic**:
  - Verify property exists and belongs to organization
  - Set default status = 'new'
  - Set default priority if not provided
  - Create work order record
  - Notify property managers
- **Dependencies**:
  - `get_current_user_v2` (auth)
  - `require_permission` (RBAC)
  - Organization scoping check

