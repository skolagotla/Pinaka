# API Sequence Diagram - POST /api/v2/work-orders/{work_order_id}/approve

## Approve Work Order Flow

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
    
    User->>Frontend: Click "Approve" on work order
    Frontend->>ReactQuery: useMutation(approveWorkOrder)
    ReactQuery->>APIClient: POST /api/v2/work-orders/{id}/approve<br/>{approval_data}
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
                alt LANDLORD role
                    FastAPI->>DB: SELECT landlord WHERE user_id
                    DB-->>FastAPI: Landlord record
                    FastAPI->>DB: SELECT property WHERE id = work_order.property_id<br/>AND landlord_id = landlord.id
                    DB-->>FastAPI: Property record
                    alt Property not found
                        FastAPI-->>APIClient: 403 Forbidden
                        APIClient-->>ReactQuery: Error
                        ReactQuery-->>Frontend: Cannot approve
                        Frontend-->>User: Show error
                    else Property found
                        FastAPI->>FastAPI: Approval allowed
                    end
                end
                
                FastAPI->>FastAPI: Update work_order.status = 'approved'<br/>Set approved_by_user_id<br/>Set approved_at
                FastAPI->>DB: UPDATE work_orders SET status, approved_by, approved_at
                DB-->>FastAPI: Work order updated
                
                FastAPI->>DB: SELECT work_order WITH relationships
                DB-->>FastAPI: Complete work order
                
                FastAPI->>NotificationService: notifyTenant(work_order)
                NotificationService->>DB: INSERT INTO notifications<br/>FOR tenant
                DB-->>NotificationService: Notification created
                
                FastAPI-->>APIClient: 200 OK<br/>WorkOrder
                APIClient-->>ReactQuery: Success response
                ReactQuery->>ReactQuery: Invalidate queries
                ReactQuery->>ReactQuery: Update cache
                ReactQuery-->>Frontend: Work order approved
                Frontend->>Frontend: Update UI
                Frontend-->>User: Show success message
            end
        end
    end
```

## Endpoint Details

- **Method**: POST
- **Path**: `/api/v2/work-orders/{work_order_id}/approve`
- **Auth Required**: Yes
- **Role Required**: `SUPER_ADMIN`, `PMC_ADMIN`, `PM`, or `LANDLORD`
- **Request Body**: `WorkOrderApprovalRequest`
- **Response**: `WorkOrder` (200 OK)
- **Business Logic**:
  - Verify user has required role
  - Verify work order exists and user has access
  - For LANDLORD: Verify work order belongs to their property
  - Update work order status to 'approved'
  - Set approved_by_user_id and approved_at
  - Notify tenant of approval
- **Dependencies**:
  - `get_current_user_v2` (auth)
  - `require_role_v2` (role check)
  - Organization scoping check

