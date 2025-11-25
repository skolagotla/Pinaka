# API Sequence Diagram - GET /api/v2/auth/me

## Get Current User Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant APIClient
    participant FastAPI
    participant AuthMW
    participant DB
    
    User->>Frontend: Page load / refresh
    Frontend->>APIClient: v2Api.getCurrentUser()
    APIClient->>FastAPI: GET /api/v2/auth/me<br/>Authorization: Bearer {token}
    
    FastAPI->>AuthMW: get_current_user_v2(token)
    AuthMW->>AuthMW: Decode JWT token
    AuthMW->>DB: SELECT user WHERE id
    DB-->>AuthMW: User record
    
    alt Token invalid or user not found
        AuthMW-->>FastAPI: 401 Unauthorized
        FastAPI-->>APIClient: 401 Error
        APIClient->>APIClient: Clear token
        APIClient-->>Frontend: Auth error
        Frontend-->>User: Redirect to login
    else User found
        AuthMW-->>FastAPI: Authenticated user
        FastAPI->>DB: SELECT user_roles + roles<br/>WHERE user_id
        DB-->>FastAPI: User roles with details
        
        FastAPI-->>APIClient: 200 OK<br/>{user, roles, organization_id}
        APIClient-->>Frontend: Current user data
        Frontend->>Frontend: Update auth context
        Frontend-->>User: Render authenticated UI
    end
```

## Endpoint Details

- **Method**: GET
- **Path**: `/api/v2/auth/me`
- **Auth Required**: Yes (JWT token)
- **Response**: `{user: User, roles: Role[], organization_id: UUID}`
- **Dependencies**: `get_current_user_v2` (auth middleware)

