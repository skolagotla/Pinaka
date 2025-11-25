# Onboarding API

## Overview

The Onboarding API provides endpoints for managing user onboarding status and progress.

**Base Path**: `/api/v2/onboarding`

## Endpoints

### GET /onboarding/status

Get current user's onboarding status.

#### Summary

Retrieve the current user's onboarding completion status, current step, and onboarding data.

#### Authentication

**Required** - JWT token

#### Path

`GET /api/v2/onboarding/status`

#### Responses

##### 200 OK

Onboarding status.

```json
{
  "onboarding_completed": false,
  "onboarding_step": 3,
  "onboarding_data": {
    "property_count": 5,
    "tenant_count": 12
  }
}
```

---

### PATCH /onboarding/status

Update current user's onboarding status.

#### Summary

Update the current user's onboarding step, completion status, or onboarding data.

#### Authentication

**Required** - JWT token

#### Path

`PATCH /api/v2/onboarding/status`

#### Request Body

```json
{
  "step": 4,
  "completed": false,
  "data": {
    "property_count": 6
  }
}
```

**Schema**: `OnboardingUpdate`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `step` | `int` | No | Current onboarding step |
| `completed` | `boolean` | No | Whether onboarding is completed |
| `data` | `object` | No | Additional onboarding data (merged with existing) |

#### Responses

##### 200 OK

Updated onboarding status.

```json
{
  "onboarding_completed": false,
  "onboarding_step": 4,
  "onboarding_data": {
    "property_count": 6,
    "tenant_count": 12
  }
}
```

##### 400 Bad Request

No update data provided.

---

### POST /onboarding/complete

Mark onboarding as completed.

#### Summary

Mark the current user's onboarding as completed. Sets `onboarding_completed` to true and `onboarding_step` to 999.

#### Authentication

**Required** - JWT token

#### Path

`POST /api/v2/onboarding/complete`

#### Responses

##### 200 OK

Onboarding completed.

```json
{
  "onboarding_completed": true,
  "onboarding_step": 999,
  "message": "Onboarding completed successfully"
}
```

---

## Related Documentation

- [Users API](./users.md) - User management
- [Types](./types.md) - Schema definitions

