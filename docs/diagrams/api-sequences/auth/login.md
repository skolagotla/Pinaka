# API Sequence Diagram - POST /api/v2/auth/login

## User Login Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant APIClient
    participant FastAPI
    participant AuthMW
    participant DB
    participant JWT
    
    User->>Frontend: Enter email & password
    Frontend->>APIClient: v2Api.login(email, password)
    APIClient->>FastAPI: POST /api/v2/auth/login<br/>{email, password}
    
    FastAPI->>DB: SELECT user WHERE email
    DB-->>FastAPI: User record
    
    alt User not found
        FastAPI-->>APIClient: 401 Unauthorized
        APIClient-->>Frontend: Error
        Frontend-->>User: Show error message
    else User found
        FastAPI->>AuthMW: verify_password(password, hash)
        AuthMW-->>FastAPI: Password verified
        
        alt Password incorrect
            FastAPI-->>APIClient: 401 Unauthorized
            APIClient-->>Frontend: Error
            Frontend-->>User: Show error message
        else Password correct
            alt User status != 'active'
                FastAPI-->>APIClient: 403 Forbidden
                APIClient-->>Frontend: Error
                Frontend-->>User: Account not active
            else User active
                FastAPI->>DB: SELECT roles WHERE user_id
                DB-->>FastAPI: User roles
                
                FastAPI->>JWT: create_access_token({user_id, email, roles, org_id})
                JWT-->>FastAPI: JWT token
                
                FastAPI-->>APIClient: 200 OK<br/>{access_token, token_type}
                APIClient->>APIClient: Store token in localStorage
                APIClient-->>Frontend: Token
                Frontend->>Frontend: Update auth state
                Frontend-->>User: Redirect to dashboard
            end
        end
    end
```

## Endpoint Details

- **Method**: POST
- **Path**: `/api/v2/auth/login`
- **Auth Required**: No
- **Request Body**: `{email: string, password: string}`
- **Response**: `{access_token: string, token_type: "bearer"}`
- **Dependencies**: None (public endpoint)

