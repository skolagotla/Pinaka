# API Sequence Diagram - GET /api/v2/organizations

## List Organizations Flow

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
    
    User->>Frontend: Navigate to Organizations page
    Frontend->>ReactQuery: useOrganizations()
    ReactQuery->>APIClient: GET /api/v2/organizations
    APIClient->>FastAPI: HTTP Request + JWT
    
    FastAPI->>AuthMW: get_current_user_v2(token)
    AuthMW->>DB: SELECT user WHERE id
    DB-->>AuthMW: User record
    AuthMW-->>FastAPI: Authenticated user
    
    FastAPI->>RBACMW: require_permission(READ, ORGANIZATION)
    RBACMW->>RBACMW: check_permission(user, READ, ORGANIZATION)
    RBACMW->>DB: SELECT user_roles WHERE user_id
    DB-->>RBACMW: User roles
    RBACMW->>RBACMW: Check PERMISSION_MATRIX
    RBACMW-->>FastAPI: Permission granted
    
    FastAPI->>FastAPI: Check user roles
    alt SUPER_ADMIN
        FastAPI->>DB: SELECT * FROM organizations
        DB-->>FastAPI: All organizations
    else Other roles
        alt user.organization_id exists
            FastAPI->>DB: SELECT * FROM organizations<br/>WHERE id = user.organization_id
            DB-->>FastAPI: User's organization
        else No organization
            FastAPI->>FastAPI: Return empty array
        end
    end
    
    FastAPI-->>APIClient: 200 OK<br/>List[Organization]
    APIClient-->>ReactQuery: Organizations data
    ReactQuery->>ReactQuery: Cache results
    ReactQuery-->>Frontend: Organizations array
    Frontend->>Frontend: Render organizations
    Frontend-->>User: Display organizations
```

## Endpoint Details

- **Method**: GET
- **Path**: `/api/v2/organizations`
- **Auth Required**: Yes
- **RBAC**: `require_permission(READ, ORGANIZATION)`
- **Response**: `List[Organization]`
- **Special Logic**:
  - SUPER_ADMIN sees all organizations
  - Other users see only their own organization (or empty array)

