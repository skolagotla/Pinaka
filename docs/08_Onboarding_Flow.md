# Pinaka v2 - Onboarding Flow

## Overview

Pinaka v2 includes role-specific onboarding flows that guide new users through account setup. Onboarding state is persisted in the backend and controls routing after login.

## Onboarding Routes

```
/onboarding/
├── start/              # Welcome page
├── profile/            # Profile confirmation
├── organization/      # Organization setup (SUPER_ADMIN, PMC_ADMIN)
├── properties/        # Properties review (PM, LANDLORD)
├── preferences/       # Notification preferences
└── complete/          # Completion page
```

## Onboarding State

**Backend Storage**: `users.onboarding_completed`, `users.onboarding_step`, `users.onboarding_data`

**Fields**:
- `onboarding_completed` (boolean): Whether onboarding is complete
- `onboarding_step` (integer): Current step in the flow
- `onboarding_data` (JSONB): Progress data (preferences, selections, etc.)

## Role-Specific Flows

### SUPER_ADMIN Flow

**Steps** (5 total):
1. **Welcome** (`/onboarding/start`)
   - Introduction to platform
   - Overview of super admin capabilities

2. **Profile** (`/onboarding/profile`)
   - Confirm/update full name
   - Confirm/update phone
   - Save profile information

3. **PMCs** (`/onboarding/organization`)
   - Create first PMC organization
   - Or select existing organization
   - Configure organization details

4. **Invite Admins** (`/onboarding/preferences` - placeholder)
   - Invite PMC admins
   - Set up initial team

5. **Complete** (`/onboarding/complete`)
   - Success message
   - Redirect to `/portfolio`

### PMC_ADMIN Flow

**Steps** (6 total):
1. **Welcome** (`/onboarding/start`)
   - Introduction to PMC admin role
   - Overview of capabilities

2. **Profile** (`/onboarding/profile`)
   - Confirm/update full name
   - Confirm/update phone
   - Save profile information

3. **Organization** (`/onboarding/organization`)
   - Create organization (if not exists)
   - Or select existing organization
   - Configure organization details

4. **Properties** (`/onboarding/properties`)
   - Review assigned properties
   - Add first properties (if none)
   - Property setup

5. **Invite Team** (`/onboarding/preferences` - placeholder)
   - Invite property managers
   - Set up team structure

6. **Complete** (`/onboarding/complete`)
   - Success message
   - Redirect to `/portfolio`

### PM Flow

**Steps** (5 total):
1. **Welcome** (`/onboarding/start`)
   - Introduction to PM role
   - Overview of responsibilities

2. **Profile** (`/onboarding/profile`)
   - Confirm/update full name
   - Confirm/update phone
   - Save profile information

3. **Properties** (`/onboarding/properties`)
   - Review assigned properties
   - Confirm property assignments
   - Set preferences

4. **Preferences** (`/onboarding/preferences`)
   - Notification preferences
   - Work order preferences
   - Communication preferences

5. **Complete** (`/onboarding/complete`)
   - Success message
   - Redirect to `/portfolio`

### LANDLORD Flow

**Steps** (5 total):
1. **Welcome** (`/onboarding/start`)
   - Introduction to landlord role
   - Overview of capabilities

2. **Profile** (`/onboarding/profile`)
   - Confirm/update full name
   - Confirm/update phone
   - Save profile information

3. **Properties** (`/onboarding/properties`)
   - Review owned properties
   - Confirm property ownership
   - Set preferences

4. **Preferences** (`/onboarding/preferences`)
   - Notification preferences
   - Work order preferences
   - Financial preferences

5. **Complete** (`/onboarding/complete`)
   - Success message
   - Redirect to `/portfolio`

### TENANT Flow

**Steps** (5 total):
1. **Welcome** (`/onboarding/start`)
   - Introduction to tenant role
   - Overview of capabilities

2. **Profile** (`/onboarding/profile`)
   - Confirm/update full name
   - Confirm/update phone
   - Save profile information

3. **Lease** (`/onboarding/preferences` - lease info shown)
   - Review lease information
   - Confirm lease details
   - Set contact preferences

4. **Preferences** (`/onboarding/preferences`)
   - Notification preferences
   - Maintenance preferences
   - Communication preferences

5. **Complete** (`/onboarding/complete`)
   - Success message
   - Redirect to `/portfolio`

### VENDOR Flow

**Steps** (4 total):
1. **Welcome** (`/onboarding/start`)
   - Introduction to vendor role
   - Overview of capabilities

2. **Profile** (`/onboarding/profile`)
   - Confirm/update business name
   - Confirm/update contact information
   - Save profile information

3. **Services** (`/onboarding/preferences` - service profile)
   - Confirm service types
   - Set availability
   - Set preferences

4. **Complete** (`/onboarding/complete`)
   - Success message
   - Redirect to `/portfolio`

## Onboarding Components

### OnboardingLayout

**File**: `components/onboarding/OnboardingLayout.tsx`

**Features**:
- Consistent layout for all onboarding pages
- Progress stepper
- Step navigation
- Skip option (if applicable)

**Usage**:
```typescript
<OnboardingLayout currentStep={2} totalSteps={5}>
  {/* Page content */}
</OnboardingLayout>
```

### OnboardingStepper

**File**: `components/onboarding/OnboardingStepper.tsx`

**Features**:
- Visual progress indicator
- Step labels
- Current step highlighting
- Completed step checkmarks

## Onboarding API

### Backend Endpoints

**File**: `apps/backend-api/routers/onboarding.py`

**Endpoints**:
- `GET /api/v2/onboarding/status` - Get onboarding status
- `PATCH /api/v2/onboarding/status` - Update onboarding status
- `POST /api/v2/onboarding/complete` - Mark onboarding as complete

### Frontend Hook

**File**: `lib/hooks/useOnboarding.ts`

**Usage**:
```typescript
const { status, loading, updateStatus, complete } = useOnboarding();

// Update step
await updateStatus({
  step: 3,
  data: { properties_reviewed: true }
});

// Complete onboarding
await complete();
```

## Routing Logic

### Login Redirect

**File**: `app/auth/login/page.tsx`

```typescript
// After successful login
if (!user.onboarding_completed) {
  router.push('/onboarding/start');
} else {
  router.push('/portfolio');
}
```

### Protected Route Redirect

**File**: `components/layout/ProtectedLayoutWrapper.tsx`

```typescript
// Check onboarding status
const onboardingCompleted = user.user?.onboarding_completed ?? false;

if (!onboardingCompleted) {
  if (!pathname?.startsWith('/onboarding')) {
    router.push('/onboarding/start');
  }
}
```

### Root Page Redirect

**File**: `app/page.jsx`

```typescript
// Check onboarding status
if (!onboardingCompleted) {
  router.push('/onboarding/start');
  return;
}
```

## Onboarding Pages

### Start Page

**Route**: `/onboarding/start`

**File**: `app/onboarding/start/page.tsx`

**Features**:
- Welcome message
- Role-specific introduction
- Step overview
- "Get Started" button

**Role Detection**:
```typescript
const getRoleSteps = () => {
  if (hasRole('super_admin')) {
    return {
      totalSteps: 5,
      stepLabels: ['Welcome', 'Profile', 'PMCs', 'Invite Admins', 'Complete'],
      nextStep: '/onboarding/profile',
    };
  }
  // ...
};
```

### Profile Page

**Route**: `/onboarding/profile`

**File**: `app/onboarding/profile/page.tsx`

**Features**:
- Full name input
- Phone input
- Email display (read-only)
- Save and continue button

**Data Persistence**:
```typescript
await updateStatus({
  step: 2,
  data: {
    ...status?.onboarding_data,
    profile: {
      full_name,
      phone,
    },
  },
});
```

### Organization Page

**Route**: `/onboarding/organization`

**File**: `app/onboarding/organization/page.tsx`

**Access**: SUPER_ADMIN, PMC_ADMIN only

**Features**:
- Create new organization
- Or select existing organization
- Organization details form
- Save and continue button

**Organization Creation**:
```typescript
const newOrg = await v2Api.createOrganization({
  name: organizationName,
  type: 'PMC',
  // ...
});
```

### Properties Page

**Route**: `/onboarding/properties`

**File**: `app/onboarding/properties/page.tsx`

**Access**: PM, LANDLORD only

**Features**:
- List assigned/owned properties
- Property details view
- Confirm properties
- Continue button

**Data Loading**:
```typescript
const { data: properties } = useProperties(organizationId);
```

### Preferences Page

**Route**: `/onboarding/preferences`

**File**: `app/onboarding/preferences/page.tsx`

**Features**:
- Email notifications toggle
- SMS notifications toggle
- Work order updates toggle
- Lease reminders toggle
- Save and complete button

**Data Persistence**:
```typescript
await updateStatus({
  step: currentStep,
  data: {
    ...status?.onboarding_data,
    preferences: {
      emailNotifications,
      smsNotifications,
      workOrderUpdates,
      leaseReminders,
    },
  },
});
```

### Complete Page

**Route**: `/onboarding/complete`

**File**: `app/onboarding/complete/page.tsx`

**Features**:
- Success message
- Completion animation
- "Go to Dashboard" button
- Auto-redirect after 2 seconds

**Completion Logic**:
```typescript
useEffect(() => {
  const finishOnboarding = async () => {
    await complete();
    setTimeout(() => {
      router.push('/portfolio');
    }, 2000);
  };
  finishOnboarding();
}, []);
```

## Onboarding Data Structure

**onboarding_data JSONB**:
```json
{
  "profile": {
    "full_name": "John Doe",
    "phone": "+1234567890"
  },
  "organization": {
    "organization_id": "uuid",
    "organization_name": "ABC Property Management"
  },
  "properties": {
    "properties_reviewed": true,
    "property_ids": ["uuid1", "uuid2"]
  },
  "preferences": {
    "emailNotifications": true,
    "smsNotifications": false,
    "workOrderUpdates": true,
    "leaseReminders": true
  }
}
```

## Persistence

### Backend Storage

Onboarding state is stored in the `users` table:

```sql
UPDATE users
SET 
  onboarding_completed = true,
  onboarding_step = 999,
  onboarding_data = '{"preferences": {...}}'
WHERE id = :user_id;
```

### Frontend State

Onboarding state is managed by `useOnboarding` hook:

- Fetches status on mount
- Updates status on step completion
- Completes onboarding on final step

## Skipping Onboarding

**Current Behavior**: Onboarding cannot be skipped (required for all users)

**Future Enhancement**: Allow skipping with default preferences

## Resuming Onboarding

If a user starts onboarding but doesn't complete it:

1. On next login, redirect to `/onboarding/start`
2. Load saved `onboarding_step`
3. Resume from last completed step
4. Show progress in stepper

## Best Practices

1. **Save progress frequently** - Update `onboarding_data` on each step
2. **Validate inputs** - Ensure data is valid before proceeding
3. **Handle errors gracefully** - Show error messages and allow retry
4. **Provide clear navigation** - Show progress and allow going back
5. **Test with all roles** - Ensure each role's flow works correctly

---

**Related Documentation**:
- [Authentication](09_Authentication_and_Sessions.md) - Auth flow
- [Frontend Structure](03_Frontend_Structure.md) - Frontend organization
- [Development Guide](10_Development_Guide.md) - Adding new steps

