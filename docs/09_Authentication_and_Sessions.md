# Pinaka v2 - Authentication and Sessions

## Overview

Pinaka v2 uses JWT (JSON Web Tokens) for stateless authentication. All API requests include a JWT token in the Authorization header, and the backend validates the token and extracts user context.

## Authentication Flow

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │ 1. Enter credentials
       ▼
┌─────────────┐
│  Frontend   │
│  Login Form │
└──────┬──────┘
       │ 2. POST /api/v2/auth/login
       ▼
┌─────────────┐
│  Backend    │
│  FastAPI    │
└──────┬──────┘
       │ 3. Validate credentials
       │ 4. Generate JWT token
       ▼
┌─────────────┐
│  Frontend   │
│  Store Token│
└──────┬──────┘
       │ 5. Include in requests
       ▼
┌─────────────┐
│  Backend    │
│  Validate   │
│  Token      │
└─────────────┘
```

## Login Endpoint

### Request

```http
POST /api/v2/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Backend Implementation

**File**: `apps/backend-api/routers/auth_v2.py`

```python
@router.post("/login", response_model=Token)
async def login_v2(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    # Find user by email
    user = await db.execute(
        select(User).where(User.email == credentials.email)
    )
    
    # Verify password
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    # Check user status
    if user.status != "active":
        raise HTTPException(status_code=403, detail="User account is not active")
    
    # Get user roles
    roles = await get_user_roles(user, db)
    
    # Create JWT token
    access_token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "roles": roles,
        "organization_id": str(user.organization_id) if user.organization_id else None,
    })
    
    return Token(access_token=access_token, token_type="bearer")
```

## Token Structure

### JWT Payload

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "roles": ["pmc_admin", "pm"],
  "organization_id": "org-uuid",
  "exp": 1234567890
}
```

### Token Fields

- `sub`: User ID (subject)
- `email`: User email
- `roles`: Array of role names
- `organization_id`: User's organization ID (nullable)
- `exp`: Expiration timestamp

## Token Storage

### Development (Current)

**Storage**: localStorage
**Key**: `v2_access_token`

```typescript
// Store token
localStorage.setItem('v2_access_token', token);

// Retrieve token
const token = localStorage.getItem('v2_access_token');

// Remove token
localStorage.removeItem('v2_access_token');
```

### Production (Recommended)

**Storage**: httpOnly cookies
**Benefits**: 
- Not accessible to JavaScript (XSS protection)
- Automatically sent with requests
- Secure flag for HTTPS

**Implementation** (future):
```python
response.set_cookie(
    "access_token",
    token,
    httponly=True,
    secure=True,
    samesite="lax"
)
```

## Token Usage

### Frontend API Client

**File**: `lib/api/v2-client.ts`

```typescript
class ApiClient {
  private token: string | null = null;
  
  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('v2_access_token', token);
      } else {
        localStorage.removeItem('v2_access_token');
      }
    }
  }
  
  getToken(): string | null {
    return this.token;
  }
  
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    // Make request...
  }
}
```

### Backend Validation

**File**: `apps/backend-api/core/auth_v2.py`

```python
async def get_current_user_v2(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    token = credentials.credentials
    
    # Decode JWT
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    user_id = payload.get("sub")
    
    # Fetch user from database
    result = await db.execute(
        select(User)
        .options(selectinload(User.user_roles).selectinload(UserRole.role))
        .where(User.id == UUID(user_id))
    )
    user = result.scalar_one_or_none()
    
    if not user or user.status != "active":
        raise HTTPException(status_code=401, detail="Invalid authentication")
    
    return user
```

## Authentication Hook

### useV2Auth

**File**: `lib/hooks/useV2Auth.ts`

**Features**:
- Manages authentication state
- Provides login/logout functions
- Checks user roles
- Handles token storage

**Usage**:
```typescript
const { user, loading, login, logout, hasRole } = useV2Auth();

// Login
const success = await login(email, password);

// Logout
logout();

// Check role
if (hasRole('super_admin')) {
  // Show admin features
}
```

**Implementation**:
```typescript
export function useV2Auth() {
  const [user, setUser] = useState<V2CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  const checkAuth = useCallback(async () => {
    const token = v2Api.getToken();
    if (!token) {
      setUser(null);
      return;
    }
    
    const currentUser = await v2Api.getCurrentUser();
    setUser(currentUser);
  }, []);
  
  const login = useCallback(async (email: string, password: string) => {
    await v2Api.login(email, password);
    await checkAuth();
    return true;
  }, [checkAuth]);
  
  const logout = useCallback(() => {
    v2Api.logout();
    setUser(null);
    router.push('/auth/login');
  }, [router]);
  
  return { user, loading, login, logout, hasRole, ... };
}
```

## Get Current User

### Endpoint

```http
GET /api/v2/auth/me
Authorization: Bearer <token>
```

### Response

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "organization_id": "uuid",
    "onboarding_completed": true,
    "onboarding_step": 999,
    "onboarding_data": {}
  },
  "roles": [
    {
      "id": "uuid",
      "name": "pmc_admin",
      "description": "PMC Administrator"
    }
  ],
  "organization_id": "uuid"
}
```

## Token Expiration

### Configuration

**File**: `apps/backend-api/core/config.py`

```python
ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # Default: 30 minutes
```

### Token Creation

**File**: `apps/backend-api/core/auth_v2.py`

```python
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
```

### Expiration Handling

**Frontend**: Token expiration is detected when API calls return 401

```typescript
// In API client
if (response.status === 401) {
  // Token expired or invalid
  v2Api.setToken(null);
  // Redirect to login
  router.push('/auth/login');
}
```

## Refresh Logic

**Current**: No refresh tokens (tokens expire after 30 minutes)

**Future Enhancement**: Implement refresh tokens

```python
# Refresh token endpoint (future)
@router.post("/refresh")
async def refresh_token(
    refresh_token: str,
    db: AsyncSession = Depends(get_db)
):
    # Validate refresh token
    # Generate new access token
    # Return new token
```

## Logout

### Frontend

```typescript
const logout = useCallback(() => {
  v2Api.logout();  // Clears token from localStorage
  setUser(null);
  router.push('/auth/login');
}, [router]);
```

### Backend

No server-side logout needed (stateless JWT). Token is simply removed from client storage.

## Password Hashing

### Backend

**File**: `apps/backend-api/core/auth_v2.py`

```python
def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
```

## Social Login (Placeholder)

**Status**: Not yet implemented

**Planned Providers**:
- Google OAuth
- Apple Sign In

**Implementation** (future):
```python
@router.post("/auth/google")
async def google_login(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    # Verify Google token
    # Create or find user
    # Generate JWT token
    # Return token
```

## Security Best Practices

### 1. Token Storage

- ✅ **Development**: localStorage (acceptable for dev)
- ⚠️ **Production**: httpOnly cookies (recommended)

### 2. Token Expiration

- ✅ **Short expiration**: 30 minutes default
- ⚠️ **Refresh tokens**: Implement for better UX

### 3. Password Security

- ✅ **Bcrypt hashing**: Strong password hashing
- ✅ **No plaintext storage**: Passwords never stored in plaintext
- ✅ **Password validation**: Enforce strong passwords

### 4. HTTPS

- ✅ **Production**: Always use HTTPS
- ✅ **Secure cookies**: Set secure flag in production

### 5. CORS

- ✅ **Configured origins**: Only allowed origins can access API
- ✅ **Credentials**: Allow credentials for authenticated requests

## Error Handling

### Invalid Credentials

```json
{
  "detail": "Incorrect email or password"
}
```

**Status Code**: 401 Unauthorized

### Inactive User

```json
{
  "detail": "User account is not active"
}
```

**Status Code**: 403 Forbidden

### Expired Token

```json
{
  "detail": "Invalid authentication credentials"
}
```

**Status Code**: 401 Unauthorized

**Frontend Handling**:
```typescript
if (error.status === 401) {
  // Token expired
  v2Api.logout();
  router.push('/auth/login');
}
```

## Testing Authentication

### Test Credentials

- **Super Admin**: superadmin@pinaka.com / SuperAdmin123!
- **PMC Admin**: pmcadmin@pinaka.com / PmcAdmin123!
- **Landlord**: landlord@pinaka.com / Landlord123!
- **Tenant**: tenant@pinaka.com / Tenant123!

### Manual Testing

1. **Login**: POST to `/api/v2/auth/login`
2. **Get Token**: Extract `access_token` from response
3. **Use Token**: Include in `Authorization: Bearer <token>` header
4. **Get User**: GET `/api/v2/auth/me` with token
5. **Verify Roles**: Check `roles` array in response

---

**Related Documentation**:
- [Backend API](02_Backend_API.md) - API endpoints
- [Onboarding Flow](08_Onboarding_Flow.md) - Post-login onboarding
- [RBAC](05_RBAC_Roles_and_Permissions.md) - Role-based access

