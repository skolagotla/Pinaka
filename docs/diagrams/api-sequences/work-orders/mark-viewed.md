# API Sequence Diagram - POST /api/v2/work-orders/{work_order_id}/mark-viewed

## Mark Work Order as Viewed Flow

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
    
    User->>Frontend: View work order details
    Frontend->>ReactQuery: useMutation(markViewed)
    ReactQuery->>APIClient: POST /api/v2/work-orders/{id}/mark-viewed<br/>{role: "landlord"}
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
            alt TENANT role
                FastAPI->>DB: SELECT tenant WHERE user_id
                DB-->>FastAPI: Tenant record
                FastAPI->>FastAPI: Check if work_order.tenant_id == tenant.id
                alt Not tenant's work order
                    FastAPI-->>APIClient: 403 Forbidden
                    APIClient-->>ReactQuery: Error
                    ReactQuery-->>Frontend: Access denied
                    Frontend-->>User: Show error
                else Tenant's work order
                    FastAPI->>FastAPI: Mark as viewed (note: v2 schema doesn't have view tracking fields yet)
                    FastAPI-->>APIClient: 200 OK<br/>{success: true}
                    APIClient-->>ReactQuery: Success
                    ReactQuery-->>Frontend: Marked as viewed
                    Frontend-->>User: UI updated
                end
            else LANDLORD role
                FastAPI->>DB: SELECT landlord WHERE user_id
                DB-->>FastAPI: Landlord record
                FastAPI->>DB: SELECT property WHERE id = work_order.property_id<br/>AND landlord_id = landlord.id
                DB-->>FastAPI: Property record
                alt Property not found
                    FastAPI-->>APIClient: 403 Forbidden
                    APIClient-->>ReactQuery: Error
                    ReactQuery-->>Frontend: Access denied
                    Frontend-->>User: Show error
                else Property found
                    FastAPI->>FastAPI: Mark as viewed
                    FastAPI-->>APIClient: 200 OK<br/>{success: true}
                    APIClient-->>ReactQuery: Success
                    ReactQuery-->>Frontend: Marked as viewed
                    Frontend-->>User: UI updated
                end
            else Other roles
                FastAPI->>FastAPI: Mark as viewed
                FastAPI-->>APIClient: 200 OK<br/>{success: true}
                APIClient-->>ReactQuery: Success
                ReactQuery-->>Frontend: Marked as viewed
                Frontend-->>User: UI updated
            end
        end
    end
```

## Endpoint Details

- **Method**: POST
- **Path**: `/api/v2/work-orders/{work_order_id}/mark-viewed`
- **Auth Required**: Yes
- **RBAC**: `require_permission(CREATE, WORK_ORDER)`
- **Request Body**: `WorkOrderMarkViewedRequest` (role: "landlord" | "tenant")
- **Response**: `{success: true, message: "Work order marked as viewed"}` (200 OK)
- **Note**: View tracking fields may need to be added to the v2 schema

