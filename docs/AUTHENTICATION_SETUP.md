# Authentication Setup: User ID and Password

## Overview

The application is configured to use **User ID and Password** authentication mode. This provides a simple, secure authentication system without external OAuth providers.

---

## Configuration

### Environment Variable

Set the `AUTH_MODE` environment variable to `password` in your `.env.local` file:

```bash
AUTH_MODE=password
```

**Available Modes:**
- `password` - User ID/Email and Password authentication (recommended)
- `auth0` - Auth0 OAuth authentication (if Auth0 is configured)
- `auto` - Automatically uses Auth0 if configured, otherwise falls back to password

---

## How It Works

### Login Flow

1. **User enters User ID/Email and Password** on the sign-in page
2. **System normalizes the User ID** (e.g., `pmc1-admin` → `pmc1-admin@pmc.local`)
3. **System checks all user types** in this order:
   - PMC Admin (Admin users with PMC_ADMIN role)
   - Landlord
   - Tenant
   - PMC (Property Management Company)
4. **Password verification** is performed
5. **Session is created** and stored in cookies
6. **User is redirected** to their appropriate dashboard

### Supported User ID Formats

The system supports multiple User ID formats:

- **Email addresses**: `user@example.com`
- **PMC Admin IDs**: `pmcadmin1`, `pmcadmin2`, etc. (maps to `pmcadmin1@pmc.local`)
- **PMC Admin IDs (new format)**: `pmc1-admin`, `pmc2-admin` (maps to `pmc1-admin@pmc.local`)
- **Landlord IDs**: `pmc1-lld1`, `pmc1-lld2`, etc. (maps to `pmc1-lld1@pmc.local`)

---

## Default Passwords

### For Testing/Development

Default passwords are used when password hashing is not yet implemented:

- **PMC Admins**: `pmcadmin`
- **Superadmin**: `superadmin`
- **Other Admins**: `admin123` (or value from `ADMIN_DEFAULT_PASSWORD` env var)
- **Landlords/Tenants/PMCs**: `password123` (or value from `USER_DEFAULT_PASSWORD` env var)

### Production Setup

For production, you should:
1. Add `passwordHash` fields to all user models (Admin, Landlord, Tenant, PMC)
2. Use bcrypt to hash passwords before storing
3. Use bcrypt.compare() to verify passwords during login

---

## API Endpoint

### POST `/api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "landlord",
    "firstName": "John",
    "lastName": "Doe"
  },
  "redirect": "/dashboard"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

---

## Session Management

Sessions are stored in HTTP-only cookies and include:
- User ID
- User email
- User role
- Session expiration time

Sessions are automatically validated on each API request via the `withAuth` middleware.

---

## Security Features

✅ **Password-based authentication**  
✅ **Session-based authorization**  
✅ **Server-side validation**  
✅ **Failed login attempt tracking**  
✅ **IP address logging**  
✅ **User agent tracking**  
✅ **Account lockout** (for admins after failed attempts)

---

## UI Changes

The sign-in page (`components/SignInCard.jsx`) has been updated to:
- ✅ Focus on User ID/Email and Password fields
- ✅ Removed OAuth buttons (Google/Apple)
- ✅ Simplified authentication flow
- ✅ Clear labels: "User ID / Email"

---

## Migration Notes

If you're migrating from Auth0 to password authentication:

1. Set `AUTH_MODE=password` in `.env.local`
2. Ensure all users have passwords set (or use default passwords for testing)
3. The system will automatically use password authentication
4. OAuth buttons are hidden in the UI
5. All existing password-based login endpoints continue to work

---

## Troubleshooting

### Login Not Working

1. **Check AUTH_MODE**: Ensure `AUTH_MODE=password` is set
2. **Check User ID Format**: Verify the User ID matches supported formats
3. **Check Default Password**: Verify you're using the correct default password
4. **Check Database**: Ensure the user exists in the database
5. **Check Logs**: Review server logs for authentication errors

### Session Not Persisting

1. **Check Cookies**: Ensure cookies are enabled in browser
2. **Check Domain**: Verify cookie domain matches your app domain
3. **Check HTTPS**: In production, ensure HTTPS is enabled (required for secure cookies)

---

## Next Steps

1. ✅ **Current**: Password authentication is active
2. 📋 **Future**: Add password hashing (bcrypt) for production
3. 📋 **Future**: Add password reset functionality
4. 📋 **Future**: Add password strength requirements
5. 📋 **Future**: Add two-factor authentication (optional)

