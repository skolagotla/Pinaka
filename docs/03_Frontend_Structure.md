# Pinaka v2 - Frontend Structure

## Overview

The Pinaka frontend is built with Next.js 16 App Router, React 18, Flowbite UI, and React Query. It follows a unified architecture where all users access the same application shell, with role-based UI visibility and permissions.

## Application Flow

```
┌─────────────┐
│   Login     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Onboarding  │ (if not completed)
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Portfolio      │ (main application)
│  - Dashboard    │
│  - Properties   │
│  - Tenants      │
│  - Leases       │
│  - ...          │
└─────────────────┘
```

## Route Structure

### Public Routes

- `/auth/login` - Login page
- `/onboarding/*` - Onboarding flows

### Protected Routes

All protected routes are under `app/(protected)/`:

- `/portfolio` - Portfolio dashboard
- `/portfolio/properties` - Properties tab
- `/portfolio/tenants` - Tenants tab
- `/portfolio/leases` - Leases tab
- `/portfolio/landlords` - Landlords tab
- `/portfolio/units` - Units tab
- `/portfolio/vendors` - Vendors tab
- `/portfolio/administrators` - Administrators (super_admin only)
- `/portfolio/pmcs` - PMCs (super_admin only)
- `/platform/*` - Platform pages (super_admin only)
- `/work-orders-v2` - Work orders
- `/messages` - Messages
- `/reports` - Reports
- `/calendar` - Calendar
- `/checklist` - Checklist (tenant only)
- `/library` - Library/Documents
- `/settings` - User settings

## Layout System

### Root Layout

`app/layout.jsx`:
- Wraps entire application
- Provides global providers (React Query, Timezone, Property Context)
- Handles global styles and error boundaries

### Protected Layout

`app/(protected)/layout.tsx`:
- Wraps all protected routes
- Uses `ProtectedLayoutWrapper` component
- Handles authentication and onboarding redirects

### ProtectedLayoutWrapper

`components/layout/ProtectedLayoutWrapper.tsx`:
- Checks authentication status
- Redirects to login if not authenticated
- Redirects to onboarding if incomplete
- Provides unified sidebar and navbar
- Wraps content with tour provider

## Component Organization

```
components/
├── layout/                    # Layout components
│   ├── ProtectedLayoutWrapper.tsx
│   ├── UnifiedSidebar.tsx     # Role-aware sidebar
│   └── UnifiedNavbar.tsx      # Top navigation
├── pages/                     # Page-specific components
│   └── shared/
│       └── Portfolio/         # Portfolio module components
│           ├── ui.jsx         # Main Portfolio component
│           ├── Dashboard.jsx
│           ├── Properties.jsx
│           ├── Tenants.jsx
│           └── ...
├── shared/                    # Shared components
│   ├── FlowbiteTable.tsx
│   ├── PageHeader.tsx
│   ├── StatCard.tsx
│   └── ...
├── tour/                      # Guided tour components
│   ├── TourProvider.tsx
│   ├── GuidedTour.tsx
│   └── ...
└── onboarding/               # Onboarding components
    ├── OnboardingLayout.tsx
    └── OnboardingStepper.tsx
```

## Unified Portfolio Module

The Portfolio module is the central interface for all property management activities. It provides role-specific views and metrics.

### Portfolio Structure

`components/pages/shared/Portfolio/ui.jsx`:
- Main Portfolio component
- Role-specific metrics and dashboards
- Tab-based navigation
- Unified data fetching

**Tabs**:
- **Overview**: Role-specific dashboard with metrics
- **Properties**: Properties list and management
- **Units**: Units list and management
- **Landlords**: Landlords list (PMC_ADMIN, SUPER_ADMIN)
- **Tenants**: Tenants list and management
- **Leases**: Leases list and management
- **Vendors**: Vendors list (PMC_ADMIN, SUPER_ADMIN)
- **Administrators**: Admin users (SUPER_ADMIN only)
- **PMCs**: Organizations (SUPER_ADMIN only)

### Role-Specific Views

**SUPER_ADMIN**:
- Global metrics (all organizations)
- Access to all tabs
- Platform management

**PMC_ADMIN**:
- Organization-specific metrics
- Full access to Properties, Units, Tenants, Leases, Vendors
- User management within organization

**PM**:
- Assigned properties only
- Can create/edit leases and tenants
- Limited to assigned properties

**LANDLORD**:
- Owned properties only
- Read-only access to most data
- Can create work orders

**TENANT**:
- Own lease and unit only
- Can create work orders
- Limited dashboard view

**VENDOR**:
- Assigned work orders only
- Can update work order status
- Limited dashboard view

## Sidebar Navigation

`components/layout/UnifiedSidebar.tsx`:
- Role-aware menu items
- Uses `useRolePermissions()` hook
- Filters menu based on `ROLE_SCREENS` config
- Includes "Start Guided Tour" link

**Menu Items** (filtered by role):
- Dashboard
- Work Orders
- Messages
- Reports
- Settings
- Platform (super_admin only)

## Global Providers

`app/providers.jsx`:
- **QueryClientProvider**: React Query client
- **TimezoneProvider**: User timezone context
- **PropertyProvider**: Property selection context
- **ReactQueryDevtools**: Development tools

## Data Fetching

### React Query Hooks

All data fetching uses React Query hooks from `lib/hooks/useV2Data.ts`:

```typescript
// List entities
const { data, isLoading } = useProperties(organizationId);

// Get single entity
const { data } = useProperty(propertyId);

// Mutations
const createProperty = useCreateProperty();
const updateProperty = useUpdateProperty();
const deleteProperty = useDeleteProperty();
```

### Organization Scoping

Hooks automatically scope queries based on user role:

```typescript
// useOrganizationId() returns undefined for SUPER_ADMIN
const orgId = useOrganizationId();
const { data } = useProperties(orgId);
```

### Query Configuration

**Stale Times** (how long data is considered fresh):
- Organizations: 5 minutes
- Properties, Units, Landlords: 2 minutes
- Tenants, Leases: 1 minute
- Work Orders: 30 seconds
- Notifications: 10 seconds

**Cache Times** (how long data stays in cache):
- Default: 10 minutes

## Authentication

### useV2Auth Hook

`lib/hooks/useV2Auth.ts`:
- Manages authentication state
- Provides login/logout functions
- Checks user roles
- Handles token storage

**Usage**:
```typescript
const { user, loading, login, logout, hasRole } = useV2Auth();

if (loading) return <Spinner />;
if (!user) return <LoginForm />;

if (hasRole('super_admin')) {
  // Show admin features
}
```

### Token Management

- **Storage**: localStorage (development)
- **Format**: JWT token
- **Header**: `Authorization: Bearer <token>`
- **Expiration**: 30 minutes (configurable)

## RBAC Integration

### useRolePermissions Hook

`lib/hooks/useRolePermissions.ts`:
- Checks screen access
- Checks action permissions
- Uses `ROLE_SCREENS` config

**Usage**:
```typescript
const { canViewScreen, canPerformAction } = useRolePermissions();

if (!canViewScreen('/portfolio/properties')) {
  return <Alert>Access denied</Alert>;
}

if (canPerformAction('canCreate', '/portfolio/properties')) {
  return <Button>Create Property</Button>;
}
```

### ROLE_SCREENS Config

`lib/rbac/rbacConfig.ts`:
- Defines allowed screens per role
- Defines action permissions per screen
- Single source of truth for frontend RBAC

## UI Components

### Flowbite Components

All UI uses Flowbite React components:

```typescript
import { Button, Card, Table, Modal, Badge } from 'flowbite-react';

<Button color="blue">Click me</Button>
<Card>Content</Card>
```

### Shared Components

**FlowbiteTable**:
- Consistent table component
- Sorting, filtering, pagination
- Role-aware column rendering

**PageHeader**:
- Consistent page headers
- Breadcrumbs support
- Action buttons

**StatCard**:
- Metric cards for dashboards
- Icons and colors
- Responsive grid layout

## State Management

### React Query

**Query Keys**:
```typescript
['v2', 'properties', organizationId]
['v2', 'properties', propertyId]
['v2', 'work-orders', { organization_id, status }]
```

**Cache Invalidation**:
```typescript
queryClient.invalidateQueries({ queryKey: ['v2', 'properties'] });
```

### Local State

- **useState**: Component-level state
- **useReducer**: Complex state logic
- **Context**: Shared state (Timezone, Property)

## Styling

### Tailwind CSS

- Utility-first CSS framework
- Custom theme configuration
- Flowbite integration

### Flowbite Theme

- Professional color scheme
- Dark mode support
- Responsive breakpoints

## Performance Optimizations

### Code Splitting

```typescript
// Dynamic imports for large components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  ssr: false,
  loading: () => <Spinner />
});
```

### React Query Caching

- Automatic request deduplication
- Background refetching
- Optimistic updates

### Image Optimization

- Next.js Image component
- Automatic format optimization
- Lazy loading

## Error Handling

### Error Boundaries

`components/ErrorBoundary.jsx`:
- Catches React errors
- Shows friendly error messages
- Allows recovery

### API Error Handling

```typescript
const { data, error, isLoading } = useProperties(orgId);

if (error) {
  return <Alert color="failure">{error.detail}</Alert>;
}
```

## Testing

### Component Testing

- React Testing Library
- Jest for unit tests
- Mock API responses

### E2E Testing

- Playwright (planned)
- User flow testing
- Role-based access testing

## Build & Deployment

### Development

```bash
pnpm dev
```

### Production Build

```bash
pnpm build
pnpm start
```

### Environment Variables

`.env.local`:
```bash
NEXT_PUBLIC_API_V2_BASE_URL=http://localhost:8000/api/v2
```

---

**Related Documentation**:
- [Architecture](01_Architecture.md) - System architecture
- [Portfolio Module](07_Portfolio_Module.md) - Portfolio details
- [Development Guide](10_Development_Guide.md) - Adding new pages

