# API Sequence Diagram - POST /api/v2/properties

## Create Property Flow

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
    
    User->>Frontend: Fill property form & submit
    Frontend->>ReactQuery: useMutation(createProperty)
    ReactQuery->>APIClient: POST /api/v2/properties<br/>{property_data}
    APIClient->>FastAPI: HTTP Request + JWT
    
    FastAPI->>AuthMW: get_current_user_v2(token)
    AuthMW->>DB: SELECT user WHERE id
    DB-->>AuthMW: User record
    AuthMW-->>FastAPI: Authenticated user
    
    FastAPI->>RBACMW: require_permission(CREATE, PROPERTY)
    RBACMW->>RBACMW: check_permission(user, CREATE, PROPERTY)
    RBACMW->>DB: SELECT user_roles WHERE user_id
    DB-->>RBACMW: User roles
    RBACMW->>RBACMW: Check PERMISSION_MATRIX
    RBACMW-->>FastAPI: Permission granted
    
    FastAPI->>CRUDHelpers: verify_organization_access_for_create(org_id, user, roles)
    CRUDHelpers->>CRUDHelpers: Check if SUPER_ADMIN
    alt Not SUPER_ADMIN and org_id != user.org_id
        CRUDHelpers-->>FastAPI: 403 Forbidden
        FastAPI-->>APIClient: 403 Error
        APIClient-->>ReactQuery: Error
        ReactQuery-->>Frontend: Show error
        Frontend-->>User: Cannot create in different org
    else Access granted
        CRUDHelpers->>DB: SELECT organization WHERE id
        DB-->>CRUDHelpers: Organization exists
        CRUDHelpers-->>FastAPI: Access verified
        
        FastAPI->>FastAPI: Create PropertyModel from data
        FastAPI->>DB: INSERT INTO properties<br/>(org_id, landlord_id, name, address, ...)
        DB-->>FastAPI: Property created
        
        FastAPI->>DB: SELECT property WITH relationships
        DB-->>FastAPI: Property with landlord, organization
        
        FastAPI-->>APIClient: 201 Created<br/>Property
        APIClient-->>ReactQuery: Success response
        ReactQuery->>ReactQuery: Invalidate queries
        ReactQuery->>ReactQuery: Update cache
        ReactQuery-->>Frontend: Property created
        Frontend->>Frontend: Update UI
        Frontend-->>User: Show success message
    end
```

## Endpoint Details

- **Method**: POST
- **Path**: `/api/v2/properties`
- **Auth Required**: Yes
- **RBAC**: `require_permission(CREATE, PROPERTY)`
- **Request Body**: `PropertyCreate` schema
- **Response**: `Property` (201 Created)
- **Dependencies**:
  - `get_current_user_v2` (auth)
  - `require_permission` (RBAC)
  - `verify_organization_access_for_create` (org scoping)

