# API Sequence Diagram - GET /api/v2/users

## List Users Flow

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
    
    User->>Frontend: Navigate to Users page
    Frontend->>ReactQuery: useUsers(orgId)
    ReactQuery->>APIClient: GET /api/v2/users?page=1&limit=50
    APIClient->>FastAPI: HTTP Request + JWT
    
    FastAPI->>AuthMW: get_current_user_v2(token)
    AuthMW->>DB: SELECT user WHERE id
    DB-->>AuthMW: User record
    AuthMW-->>FastAPI: Authenticated user
    
    FastAPI->>RBACMW: require_permission(READ, USER)
    RBACMW->>RBACMW: check_permission(user, READ, USER)
    RBACMW->>DB: SELECT user_roles WHERE user_id
    DB-->>RBACMW: User roles
    RBACMW->>RBACMW: Check PERMISSION_MATRIX
    RBACMW-->>FastAPI: Permission granted
    
    FastAPI->>FastAPI: Build query with org filter
    alt SUPER_ADMIN
        alt organization_id provided
            FastAPI->>FastAPI: Filter by organization_id
        end
    else Other roles
        FastAPI->>FastAPI: Filter by user.organization_id
    end
    
    FastAPI->>FastAPI: Apply pagination (offset, limit)
    FastAPI->>DB: SELECT users WITH user_roles, roles<br/>LIMIT 50 OFFSET 0
    DB-->>FastAPI: User records
    
    loop For each user
        FastAPI->>DB: SELECT roles WHERE user_id
        DB-->>FastAPI: User roles
        FastAPI->>FastAPI: Build UserWithRoles object
    end
    
    FastAPI-->>APIClient: 200 OK<br/>List[UserWithRoles]
    APIClient-->>ReactQuery: Users data
    ReactQuery->>ReactQuery: Cache results
    ReactQuery-->>Frontend: Users array
    Frontend->>Frontend: Render users table
    Frontend-->>User: Display users
```

## Endpoint Details

- **Method**: GET
- **Path**: `/api/v2/users`
- **Query Params**: `organization_id?`, `page=1`, `limit=50`
- **Auth Required**: Yes
- **RBAC**: `require_permission(READ, USER)`
- **Response**: `List[UserWithRoles]`
- **Note**: Roles are loaded separately for each user

