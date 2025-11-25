# API Error Responses

## Overview

All API errors follow a consistent format. This document describes all possible error responses and their meanings.

## Error Response Format

All errors return a JSON object with a `detail` field:

```json
{
  "detail": "Error message describing what went wrong"
}
```

## HTTP Status Codes

### 400 Bad Request

The request was malformed or contains invalid data.

**Common Causes**:
- Invalid JSON syntax
- Missing required fields
- Invalid data types
- Business rule violations

**Example**:
```json
{
  "detail": "User with this email already exists"
}
```

### 401 Unauthorized

Authentication is required or the provided token is invalid/expired.

**Common Causes**:
- Missing `Authorization` header
- Invalid JWT token
- Expired token
- Malformed token

**Example**:
```json
{
  "detail": "Could not validate credentials"
}
```

**Login-specific**:
```json
{
  "detail": "Incorrect email or password"
}
```

### 403 Forbidden

The request is authenticated but the user lacks permission to perform the action.

**Common Causes**:
- Insufficient role permissions
- Organization access denied
- Resource ownership mismatch
- Account not active

**Examples**:
```json
{
  "detail": "Access denied"
}
```

```json
{
  "detail": "Cannot create property in different organization"
}
```

```json
{
  "detail": "User account is not active"
}
```

```json
{
  "detail": "Only super_admin can create organizations"
}
```

### 404 Not Found

The requested resource does not exist or the user does not have access to it.

**Common Causes**:
- Resource ID doesn't exist
- Resource belongs to different organization
- Resource was deleted

**Examples**:
```json
{
  "detail": "Property not found"
}
```

```json
{
  "detail": "User not found"
}
```

```json
{
  "detail": "Lease not found"
}
```

**Note**: For security reasons, some endpoints return 404 instead of 403 when a user lacks access to a resource.

### 422 Unprocessable Entity

The request data failed validation (Pydantic validation errors).

**Format**: FastAPI returns detailed validation errors:

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    },
    {
      "loc": ["body", "password"],
      "msg": "ensure this value has at least 8 characters",
      "type": "value_error.any_str.min_length"
    }
  ]
}
```

**Common Validation Errors**:
- Invalid email format
- Password too short (min 8 characters)
- Invalid UUID format
- Invalid date format
- Missing required fields
- Invalid enum values

## Domain-Specific Errors

### Authentication Errors

**401 Unauthorized**:
- `"Incorrect email or password"` - Invalid credentials
- `"Could not validate credentials"` - Invalid/expired token
- `"User account is not active"` - Account suspended/inactive

### Organization Errors

**403 Forbidden**:
- `"Only super_admin can create organizations"` - Insufficient role
- `"Access denied"` - Cannot access different organization

**404 Not Found**:
- `"Organization not found"` - Organization doesn't exist or no access

### Property Errors

**403 Forbidden**:
- `"Cannot create property in different organization"` - Org mismatch
- `"Access denied"` - Insufficient permissions

**404 Not Found**:
- `"Property not found"` - Property doesn't exist or no access

### Lease Errors

**400 Bad Request**:
- `"Unit is not available (has active lease)"` - Unit already leased
- `"Lease dates overlap with existing lease"` - Date conflict

**403 Forbidden**:
- `"Cannot create lease in different organization"` - Org mismatch
- `"Access denied"` - Insufficient permissions

**404 Not Found**:
- `"Lease not found"` - Lease doesn't exist or no access
- `"Unit not found"` - Unit doesn't exist

### Work Order Errors

**403 Forbidden**:
- `"Cannot create work order in different organization"` - Org mismatch
- `"Access denied"` - Insufficient permissions
- `"Only assigned vendors can update work orders"` - Vendor access

**404 Not Found**:
- `"Work order not found"` - Work order doesn't exist or no access
- `"Vendor not found"` - Vendor doesn't exist

### User Errors

**400 Bad Request**:
- `"User with this email already exists"` - Duplicate email

**403 Forbidden**:
- `"Access denied"` - Cannot access different organization's users

**404 Not Found**:
- `"User not found"` - User doesn't exist or no access

### Tenant Errors

**403 Forbidden**:
- `"Access denied"` - Cannot access tenant
- `"Tenants can only see themselves"` - Self-access only

**404 Not Found**:
- `"Tenant not found"` - Tenant doesn't exist or no access
- `"No active lease found for this tenant"` - No lease exists

### Unit Errors

**403 Forbidden**:
- `"Cannot create unit in different organization"` - Org mismatch
- `"Access denied"` - Insufficient permissions

**404 Not Found**:
- `"Unit not found"` - Unit doesn't exist or no access
- `"Property not found"` - Parent property doesn't exist

## Error Handling Best Practices

1. **Always check status codes** before processing response data
2. **Handle 401 errors** by re-authenticating
3. **Handle 403 errors** by checking user permissions
4. **Handle 404 errors** gracefully - resource may not exist or user lacks access
5. **Parse 422 validation errors** to show field-specific messages to users
6. **Log errors** for debugging and monitoring
7. **Display user-friendly messages** based on error details

## Example Error Handling

```typescript
try {
  const response = await fetch('/api/v2/properties', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    
    switch (response.status) {
      case 401:
        // Re-authenticate
        await reauthenticate();
        break;
      case 403:
        // Show permission error
        showError('You do not have permission to access this resource');
        break;
      case 404:
        // Show not found
        showError('Resource not found');
        break;
      case 422:
        // Show validation errors
        const validationErrors = error.detail;
        validationErrors.forEach(err => {
          showFieldError(err.loc.join('.'), err.msg);
        });
        break;
      default:
        showError(error.detail || 'An error occurred');
    }
    return;
  }
  
  const data = await response.json();
  // Process data
} catch (error) {
  // Network error
  showError('Network error. Please try again.');
}
```

## Related Documentation

- [API Overview](./overview.md) - General API information
- [Types](./types.md) - Schema definitions
- [Backend API Documentation](../02_Backend_API.md) - Complete API reference

