# API Sequence Diagram - POST /api/v2/work-orders/{work_order_id}/comments

## Add Work Order Comment Flow

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
    
    User->>Frontend: Type comment & submit
    Frontend->>ReactQuery: useMutation(addComment)
    ReactQuery->>APIClient: POST /api/v2/work-orders/{id}/comments<br/>{comment_data}
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
    
    FastAPI->>DB: SELECT work_order WHERE id = work_order_id
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
            FastAPI->>FastAPI: Create WorkOrderComment<br/>(work_order_id, author_user_id, body)
            FastAPI->>DB: INSERT INTO work_order_comments
            DB-->>FastAPI: Comment created
            
            FastAPI->>DB: SELECT comment WITH author
            DB-->>FastAPI: Complete comment
            
            FastAPI-->>APIClient: 201 Created<br/>WorkOrderComment
            APIClient-->>ReactQuery: Success response
            ReactQuery->>ReactQuery: Invalidate work order queries
            ReactQuery->>ReactQuery: Update cache
            ReactQuery-->>Frontend: Comment added
            Frontend->>Frontend: Update UI
            Frontend-->>User: Show comment in list
        end
    end
```

## Endpoint Details

- **Method**: POST
- **Path**: `/api/v2/work-orders/{work_order_id}/comments`
- **Auth Required**: Yes
- **RBAC**: `require_permission(READ, WORK_ORDER)`
- **Request Body**: `WorkOrderCommentCreate` (body: string)
- **Response**: `WorkOrderComment` (201 Created)
- **Note**: Any user with READ permission on the work order can add comments

