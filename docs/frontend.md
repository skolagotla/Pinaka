# Frontend Documentation

## Next.js Frontend

The Pinaka frontend is built with **Next.js 16** using the **App Router** and **Flowbite UI** components.

## Structure

```
apps/web-app/
├── app/                  # Next.js App Router pages
│   ├── portfolio/        # Portfolio dashboard
│   ├── properties/       # Properties pages
│   ├── tenants/          # Tenants pages
│   ├── leases/           # Leases pages
│   └── ...
├── components/           # React components
│   ├── shared/           # Shared components
│   ├── pages/            # Page-specific components
│   └── ...
└── lib/                  # Frontend utilities
    ├── api/              # API clients
    ├── hooks/            # React hooks
    └── utils/            # Utilities
```

## Running the Frontend

```bash
# Development
cd apps/web-app
pnpm dev

# Or from root
pnpm dev
```

Frontend runs on http://localhost:3000

## UI Components

### Flowbite Components

All UI uses Flowbite React components:

```jsx
import { Button, Card, Table, Modal } from 'flowbite-react';

<Button color="blue">Click me</Button>
<Card>Content</Card>
```

### Shared Components

Reusable components in `components/shared/`:

- `PageHeader` - Consistent page headers
- `StatCard` - Metric cards
- `LoadingSkeleton` - Loading states
- `EmptyState` - Empty state displays
- `StandardModal` - Modal wrapper
- `FlowbiteTable` - Table component

## Data Fetching

### React Query Hooks

All data fetching uses React Query hooks from `lib/hooks/useV2Data.ts`:

```jsx
import { useProperties, useCreateProperty } from '@/lib/hooks/useV2Data';

function MyComponent() {
  const { data: properties, isLoading } = useProperties(organizationId);
  const createProperty = useCreateProperty();
  
  // ...
}
```

### API Client

Type-safe API client in `lib/api/v2-client.ts`:

```jsx
import { v2Api } from '@/lib/api/v2-client';

const properties = await v2Api.listProperties(organizationId);
```

## Authentication

Use the `useV2Auth` hook:

```jsx
import { useV2Auth } from '@/lib/hooks/useV2Auth';

function MyComponent() {
  const { user, loading, login, logout } = useV2Auth();
  
  if (loading) return <Spinner />;
  if (!user) return <LoginForm />;
  
  return <div>Welcome, {user.email}</div>;
}
```

## Routing

Next.js App Router is used for routing:

- Pages in `app/` directory
- Dynamic routes: `app/properties/[id]/page.jsx`
- API routes: `app/api/` (proxied to FastAPI)

## Styling

- **Tailwind CSS** for utility classes
- **Flowbite** for component styling
- Global styles in `app/globals.css`

## State Management

- **React Query** for server state
- **React hooks** (useState, useReducer) for local state
- **Context API** for shared state (auth, theme)

## Build & Deploy

```bash
# Build
pnpm build

# Start production server
pnpm start
```

## Environment Variables

```bash
# API Base URL
NEXT_PUBLIC_API_V2_BASE_URL=http://localhost:8000/api/v2
```

## Code Style

- TypeScript for type safety
- Functional components with hooks
- Flowbite UI components (not Ant Design)
- Consistent file naming (PascalCase for components)

