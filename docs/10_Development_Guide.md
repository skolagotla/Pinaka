# Pinaka v2 - Development Guide

## How to Run the App Locally

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Python** >= 3.9
- **PostgreSQL** >= 14

### Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd Pinaka

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# 4. Set up Python virtual environment
cd apps/backend-api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# 5. Run database migrations
alembic upgrade head

# 6. (Optional) Seed test data
python scripts/seed_v2.py
```

### Running Development Servers

**Terminal 1 - Backend**:
```bash
cd apps/backend-api
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend**:
```bash
pnpm dev
```

**Access**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## How to Add New FastAPI Endpoints

### 1. Create Schema

**File**: `apps/backend-api/schemas/{entity}.py`

```python
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class EntityBase(BaseModel):
    name: str
    status: str = "active"

class EntityCreate(EntityBase):
    organization_id: UUID

class EntityUpdate(BaseModel):
    name: str | None = None
    status: str | None = None

class Entity(EntityBase):
    id: UUID
    organization_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True
```

### 2. Create Router

**File**: `apps/backend-api/routers/{entity}.py`

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from core.rbac import require_permission, PermissionAction, ResourceType
from core.auth_v2 import get_current_user_v2, get_user_roles
from db.models_v2 import User, Entity as EntityModel
from schemas.entity import Entity, EntityCreate, EntityUpdate

router = APIRouter(prefix="/entities", tags=["entities"])

@router.get("", response_model=List[Entity])
async def list_entities(
    current_user: User = Depends(require_permission(
        PermissionAction.READ,
        ResourceType.ENTITY
    )),
    db: AsyncSession = Depends(get_db)
):
    """List entities (scoped by organization)"""
    user_roles = await get_user_roles(current_user, db)
    
    query = select(EntityModel)
    # Apply organization filter (except SUPER_ADMIN)
    if RoleEnum.SUPER_ADMIN not in user_roles:
        query = query.where(EntityModel.organization_id == current_user.organization_id)
    
    result = await db.execute(query)
    entities = result.scalars().all()
    return entities

@router.post("", response_model=Entity, status_code=status.HTTP_201_CREATED)
async def create_entity(
    entity_data: EntityCreate,
    current_user: User = Depends(require_permission(
        PermissionAction.CREATE,
        ResourceType.ENTITY
    )),
    db: AsyncSession = Depends(get_db)
):
    """Create entity"""
    entity_obj = EntityModel(**entity_data.dict())
    db.add(entity_obj)
    await db.commit()
    await db.refresh(entity_obj)
    return entity_obj
```

### 3. Register Router

**File**: `apps/backend-api/main.py`

```python
from routers import entity

app.include_router(entity.router, prefix="/api/v2")
```

### 4. Add to RBAC

**File**: `apps/backend-api/core/rbac.py`

```python
class ResourceType(str, Enum):
    # ... existing resources
    ENTITY = "entity"

PERMISSION_MATRIX = {
    # ... existing roles
    RoleEnum.SUPER_ADMIN: {
        # ... existing resources
        ResourceType.ENTITY: [PermissionAction.CREATE, PermissionAction.READ, ...],
    },
}
```

### 5. Generate Types

```bash
# Make sure FastAPI server is running
pnpm generate:types
```

## How to Add New Pages

### 1. Create Page Component

**File**: `apps/web-app/app/(protected)/portfolio/{page}/page.jsx`

```typescript
"use client";

import { usePortfolioAuth } from '@/lib/hooks/usePortfolioAuth';
import { PageLayout } from '@/components/shared';
import FlowbiteTable from '@/components/shared/FlowbiteTable';

export default function NewPage() {
  const { user, userRole, loading } = usePortfolioAuth();
  
  if (loading || !user || !userRole) {
    return null;
  }
  
  return (
    <PageLayout headerTitle="New Page">
      {/* Page content */}
    </PageLayout>
  );
}
```

### 2. Add to Portfolio Tabs

**File**: `components/pages/shared/Portfolio/ui.jsx`

```typescript
const tabs = [
  // ... existing tabs
  {
    id: 'new-page',
    label: 'New Page',
    path: '/portfolio/new-page',
    icon: HiIcon,
  },
];
```

### 3. Add to RBAC Config

**File**: `lib/rbac/rbacConfig.ts`

```typescript
export const ROLE_SCREENS: Record<Role, RoleScreenConfig> = {
  super_admin: {
    screens: [
      // ... existing screens
      '/portfolio/new-page',
    ],
    screenPermissions: {
      '/portfolio/new-page': { canView: true, canCreate: true, canEdit: true },
    },
  },
  // ... other roles
};
```

### 4. Add to Sidebar (if needed)

**File**: `components/layout/UnifiedSidebar.tsx`

```typescript
const menuItems = [
  // ... existing items
  {
    label: 'New Page',
    href: '/portfolio/new-page',
    icon: HiIcon,
    roles: ['super_admin', 'pmc_admin'], // Allowed roles
  },
];
```

## How to Add New Modules

### 1. Backend Module

**Create Model**:
```python
# apps/backend-api/db/models_v2.py
class NewEntity(Base):
    __tablename__ = "new_entities"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id'))
    # ... fields
```

**Create Schema**:
```python
# apps/backend-api/schemas/new_entity.py
class NewEntity(BaseModel):
    # ... fields
```

**Create Router**:
```python
# apps/backend-api/routers/new_entity.py
router = APIRouter(prefix="/new-entities", tags=["new-entities"])
# ... endpoints
```

**Create Migration**:
```bash
cd apps/backend-api
alembic revision --autogenerate -m "add new_entities table"
alembic upgrade head
```

### 2. Frontend Module

**Create React Query Hook**:
```typescript
// lib/hooks/useV2Data.ts
export function useNewEntities(organizationId?: string) {
  return useQuery({
    queryKey: ['v2', 'new-entities', organizationId],
    queryFn: () => v2Api.listNewEntities(organizationId),
    enabled: useQueryEnabled(),
    staleTime: STALE_TIMES.newEntities,
  });
}
```

**Add to API Client**:
```typescript
// lib/api/v2-client.ts
async listNewEntities(organizationId?: string): Promise<NewEntity[]> {
  const params = organizationId ? `?organization_id=${organizationId}` : '';
  return this.request<NewEntity[]>(`/new-entities${params}`);
}
```

**Create Component**:
```typescript
// components/pages/shared/NewEntities/NewEntitiesList.tsx
export default function NewEntitiesList() {
  const { data, isLoading } = useNewEntities(organizationId);
  // ... render
}
```

### 3. Add to Domain (Optional)

**Create Domain Service**:
```typescript
// domains/new-entity/domain/NewEntityService.ts
export class NewEntityService {
  async createEntity(data: NewEntityCreate): Promise<NewEntity> {
    // Business logic
  }
}
```

## Code Style

### Frontend

- **TypeScript**: Use TypeScript for new files
- **Components**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions
- **Imports**: Use path aliases (`@/lib/...`, `@/components/...`)

### Backend

- **Python**: Use type hints
- **Async**: Use async/await for all database operations
- **Naming**: snake_case for functions and variables
- **Docstrings**: Include docstrings for all functions

## Testing

### Backend Tests

```bash
cd apps/backend-api
pytest
pytest --cov=.  # With coverage
```

### Frontend Tests

```bash
cd apps/web-app
pnpm test
```

## Debugging

### Backend

- **Logging**: Use `print()` or `logging` module
- **API Docs**: Check http://localhost:8000/docs
- **Database**: Use `psql` or database client

### Frontend

- **React DevTools**: Install browser extension
- **React Query DevTools**: Available in development
- **Console**: Check browser console for errors
- **Network**: Check Network tab for API calls

## Common Tasks

### Add a New Field to an Entity

1. **Database**: Create migration
2. **Model**: Update SQLAlchemy model
3. **Schema**: Update Pydantic schema
4. **Frontend**: Regenerate types
5. **Component**: Update UI to show/edit field

### Add a New Role

1. **Database**: Add role to `roles` table
2. **Backend**: Add to `RoleEnum` in `core/auth_v2.py`
3. **RBAC**: Add to `PERMISSION_MATRIX` in `core/rbac.py`
4. **Frontend**: Add to `ROLE_SCREENS` in `rbacConfig.ts`
5. **Onboarding**: Add role-specific flow

### Add a New Permission

1. **Backend**: Add to `PermissionAction` enum
2. **RBAC**: Add to `PERMISSION_MATRIX`
3. **Frontend**: Add to `ROLE_SCREENS`
4. **Components**: Use `canPerformAction()` to check

---

**Related Documentation**:
- [Architecture](01_Architecture.md) - System architecture
- [Backend API](02_Backend_API.md) - API patterns
- [Frontend Structure](03_Frontend_Structure.md) - Frontend patterns

