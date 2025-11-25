# API Sequence Diagram - POST /api/v2/organizations

## Create Organization Flow

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
    
    User->>Frontend: Fill organization form & submit
    Frontend->>ReactQuery: useMutation(createOrganization)
    ReactQuery->>APIClient: POST /api/v2/organizations<br/>{org_data}
    APIClient->>FastAPI: HTTP Request + JWT
    
    FastAPI->>AuthMW: get_current_user_v2(token)
    AuthMW->>DB: SELECT user WHERE id
    DB-->>AuthMW: User record
    AuthMW-->>FastAPI: Authenticated user
    
    FastAPI->>RBACMW: require_permission(CREATE, ORGANIZATION)
    RBACMW->>RBACMW: check_permission(user, CREATE, ORGANIZATION)
    RBACMW->>DB: SELECT user_roles WHERE user_id
    DB-->>RBACMW: User roles
    RBACMW->>RBACMW: Check PERMISSION_MATRIX
    RBACMW-->>FastAPI: Permission granted
    
    FastAPI->>FastAPI: Double-check user roles
    alt Not SUPER_ADMIN
        FastAPI-->>APIClient: 403 Forbidden
        APIClient-->>ReactQuery: Error
        ReactQuery-->>Frontend: Only super_admin can create
        Frontend-->>User: Show error message
    else SUPER_ADMIN
        FastAPI->>FastAPI: Create OrganizationModel from data
        FastAPI->>DB: INSERT INTO organizations<br/>(name, type, timezone, country)
        DB-->>FastAPI: Organization created
        
        FastAPI->>DB: SELECT organization WHERE id
        DB-->>FastAPI: Complete organization
        
        FastAPI-->>APIClient: 201 Created<br/>Organization
        APIClient-->>ReactQuery: Success response
        ReactQuery->>ReactQuery: Invalidate queries
        ReactQuery->>ReactQuery: Update cache
        ReactQuery-->>Frontend: Organization created
        Frontend->>Frontend: Update UI
        Frontend-->>User: Show success message
    end
```

## Endpoint Details

- **Method**: POST
- **Path**: `/api/v2/organizations`
- **Auth Required**: Yes
- **RBAC**: `require_permission(CREATE, ORGANIZATION)`
- **Required Role**: `SUPER_ADMIN` only
- **Request Body**: `OrganizationCreate`
- **Response**: `Organization` (201 Created)

