# API Sequence Diagram - POST /api/v2/units

## Create Unit Flow

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
    
    User->>Frontend: Fill unit form & submit
    Frontend->>ReactQuery: useMutation(createUnit)
    ReactQuery->>APIClient: POST /api/v2/units<br/>{unit_data}
    APIClient->>FastAPI: HTTP Request + JWT
    
    FastAPI->>AuthMW: get_current_user_v2(token)
    AuthMW->>DB: SELECT user WHERE id
    DB-->>AuthMW: User record
    AuthMW-->>FastAPI: Authenticated user
    
    FastAPI->>RBACMW: require_permission(CREATE, UNIT)
    RBACMW->>RBACMW: check_permission(user, CREATE, UNIT)
    RBACMW->>DB: SELECT user_roles WHERE user_id
    DB-->>RBACMW: User roles
    RBACMW->>RBACMW: Check PERMISSION_MATRIX
    RBACMW-->>FastAPI: Permission granted
    
    FastAPI->>DB: SELECT property WHERE id = property_id
    DB-->>FastAPI: Property record
    
    alt Property not found
        FastAPI-->>APIClient: 404 Not Found
        APIClient-->>ReactQuery: Error
        ReactQuery-->>Frontend: Property not found
        Frontend-->>User: Show error
    else Property found
        FastAPI->>FastAPI: Check property belongs to organization
        alt Not SUPER_ADMIN and property.org_id != user.org_id
            FastAPI-->>APIClient: 403 Forbidden
            APIClient-->>ReactQuery: Error
            ReactQuery-->>Frontend: Cannot create in different org
            Frontend-->>User: Show error
        else Access OK
            FastAPI->>FastAPI: Create UnitModel from data
            FastAPI->>DB: INSERT INTO units<br/>(property_id, unit_number, floor,<br/>bedrooms, bathrooms, size_sqft, status)
            DB-->>FastAPI: Unit created
            
            FastAPI->>DB: SELECT unit WITH property
            DB-->>FastAPI: Unit with relationship
            
            FastAPI-->>APIClient: 201 Created<br/>Unit
            APIClient-->>ReactQuery: Success response
            ReactQuery->>ReactQuery: Invalidate queries
            ReactQuery->>ReactQuery: Update cache
            ReactQuery-->>Frontend: Unit created
            Frontend->>Frontend: Update UI
            Frontend-->>User: Show success message
        end
    end
```

## Endpoint Details

- **Method**: POST
- **Path**: `/api/v2/units`
- **Auth Required**: Yes
- **RBAC**: `require_permission(CREATE, UNIT)`
- **Request Body**: `UnitCreate`
- **Response**: `Unit` (201 Created)
- **Business Logic**:
  - Verifies property exists
  - Checks property belongs to user's organization

