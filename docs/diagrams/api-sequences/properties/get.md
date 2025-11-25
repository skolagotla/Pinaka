# API Sequence Diagram - GET /api/v2/properties/{property_id}

## Get Property by ID Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant ReactQuery
    participant APIClient
    participant FastAPI
    participant AuthMW
    participant RBACMW
    participant CRUDHelpers
    participant DB
    
    User->>Frontend: Click property row / view details
    Frontend->>ReactQuery: useProperty(propertyId)
    ReactQuery->>APIClient: GET /api/v2/properties/{id}
    APIClient->>FastAPI: HTTP Request + JWT
    
    FastAPI->>AuthMW: get_current_user_v2(token)
    AuthMW->>DB: SELECT user WHERE id
    DB-->>AuthMW: User record
    AuthMW-->>FastAPI: Authenticated user
    
    FastAPI->>RBACMW: require_permission(READ, PROPERTY)
    RBACMW->>RBACMW: check_permission(user, READ, PROPERTY)
    RBACMW->>DB: SELECT user_roles WHERE user_id
    DB-->>RBACMW: User roles
    RBACMW->>RBACMW: Check PERMISSION_MATRIX
    RBACMW-->>FastAPI: Permission granted
    
    FastAPI->>DB: SELECT property WITH<br/>landlord, organization, units<br/>WHERE id = property_id
    DB-->>FastAPI: Property record
    
    alt Property not found
        FastAPI-->>APIClient: 404 Not Found
        APIClient-->>ReactQuery: Error
        ReactQuery-->>Frontend: Property not found
        Frontend-->>User: Show error message
    else Property found
        FastAPI->>CRUDHelpers: check_organization_access(property, user, roles)
        CRUDHelpers->>CRUDHelpers: Check if SUPER_ADMIN
        alt Not SUPER_ADMIN and org_id mismatch
            CRUDHelpers-->>FastAPI: 403 Forbidden
            FastAPI-->>APIClient: 403 Error
            APIClient-->>ReactQuery: Error
            ReactQuery-->>Frontend: Access denied
            Frontend-->>User: Show error message
        else Access granted
            FastAPI-->>APIClient: 200 OK<br/>Property
            APIClient-->>ReactQuery: Property data
            ReactQuery->>ReactQuery: Cache result
            ReactQuery-->>Frontend: Property object
            Frontend->>Frontend: Render property details
            Frontend-->>User: Display property information
        end
    end
```

## Endpoint Details

- **Method**: GET
- **Path**: `/api/v2/properties/{property_id}`
- **Auth Required**: Yes
- **RBAC**: `require_permission(READ, PROPERTY)`
- **Response**: `Property` (with landlord, organization, units)
- **Dependencies**:
  - `get_current_user_v2` (auth)
  - `require_permission` (RBAC)
  - `check_organization_access` (org scoping)

