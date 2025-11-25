# API Sequence Diagram - POST /api/v2/work-orders/{work_order_id}/assign-vendor

## Assign Vendor to Work Order Flow

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
    participant NotificationService
    
    User->>Frontend: Select vendor & click "Assign"
    Frontend->>ReactQuery: useMutation(assignVendor)
    ReactQuery->>APIClient: POST /api/v2/work-orders/{id}/assign-vendor<br/>{vendor_id}
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
                FastAPI->>DB: SELECT vendor WHERE id = vendor_id
                DB-->>FastAPI: Vendor record
                
                alt Vendor not found
                    FastAPI-->>APIClient: 404 Not Found
                    APIClient-->>ReactQuery: Error
                    ReactQuery-->>Frontend: Vendor not found
                    Frontend-->>User: Show error
                else Vendor found
                    FastAPI->>FastAPI: Create WorkOrderAssignment<br/>(work_order_id, vendor_id, assigned_by_user_id, status='assigned')
                    FastAPI->>DB: INSERT INTO work_order_assignments
                    DB-->>FastAPI: Assignment created
                    
                    alt Work order status == 'new'
                        FastAPI->>FastAPI: Update work_order.status = 'waiting_on_vendor'
                        FastAPI->>DB: UPDATE work_orders SET status
                        DB-->>FastAPI: Work order updated
                    end
                    
                    FastAPI->>DB: SELECT work_order WITH relationships
                    DB-->>FastAPI: Complete work order
                    
                    FastAPI->>NotificationService: notifyVendor(work_order, vendor)
                    NotificationService->>DB: INSERT INTO notifications<br/>FOR vendor user
                    DB-->>NotificationService: Notification created
                    
                    FastAPI-->>APIClient: 200 OK<br/>WorkOrder
                    APIClient-->>ReactQuery: Success response
                    ReactQuery->>ReactQuery: Invalidate queries
                    ReactQuery->>ReactQuery: Update cache
                    ReactQuery-->>Frontend: Vendor assigned
                    Frontend->>Frontend: Update UI
                    Frontend-->>User: Show success message
                end
            end
        end
    end
```

## Endpoint Details

- **Method**: POST
- **Path**: `/api/v2/work-orders/{work_order_id}/assign-vendor`
- **Auth Required**: Yes
- **Role Required**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, or `LANDLORD`
- **Request Body**: `WorkOrderAssignVendorRequest` (with vendor_id)
- **Response**: `WorkOrder` (200 OK)
- **Business Logic**:
  - Verify user has required role
  - Verify work order exists and user has access
  - Verify vendor exists
  - Create work_order_assignment record
  - If work order status is 'new', update to 'waiting_on_vendor'
  - Notify vendor of assignment
- **Dependencies**:
  - `get_current_user_v2` (auth)
  - `require_role_v2` (role check)
  - Organization scoping check

