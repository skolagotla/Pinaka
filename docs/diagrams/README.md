# Pinaka v2 Architecture Diagrams

This directory contains comprehensive architectural diagrams for the Pinaka v2 system, generated from the codebase.

## Available Diagrams

### 1. System Overview
**File**: `01-system-overview.md`

High-level system architecture showing:
- Frontend (Next.js → React → Flowbite)
- Backend (FastAPI → Services → DB)
- API Client (OpenAPI generated types)
- PostgreSQL v2
- Organization/RBAC layers
- Role-based access patterns

### 2. DDD Bounded Contexts
**File**: `02-ddd-bounded-contexts.md`

Domain-Driven Design architecture:
- Shared Kernel (User, Organization, Auth)
- Portfolio Bounded Context
- Maintenance Bounded Context
- Financial Bounded Context
- Communication Bounded Context
- Document Bounded Context
- Operations Bounded Context
- Platform Bounded Context

### 3. Backend Service Layer
**File**: `03-backend-service-layer.md`

Backend architecture showing:
- API Routers
- Middleware (Auth, RBAC, Organization Scoping)
- Service Layer
- Repository Layer
- Database Layer
- Request flow with RBAC

### 4. Frontend Architecture
**File**: `04-frontend-architecture.md`

Frontend structure:
- Next.js App Router
- Layout System (Protected Layout, Sidebar, Navbar)
- Page Modules (Portfolio, Platform, Onboarding)
- State Management (React Query)
- API Layer (OpenAPI Typed Client)
- Domain Layer
- Component Hierarchy

### 5. RBAC Permission Matrix
**File**: `05-rbac-permission-matrix.md`

Role-Based Access Control:
- All 6 roles (SUPER_ADMIN, PMC_ADMIN, PM, LANDLORD, TENANT, VENDOR)
- All 20+ resources
- Permission actions (CREATE, READ, UPDATE, DELETE, MANAGE)
- Visual permission matrix

### 6. Organization Scoping
**File**: `06-organization-scoping.md`

Multi-tenant organization scoping:
- SUPER_ADMIN: Global scope
- PMC_ADMIN: Organization scope
- PM: Assigned properties scope
- LANDLORD: Owned properties scope
- TENANT: Own lease scope
- VENDOR: Assigned work orders scope
- Scoping rules and filters

### 7. Database ERD
**File**: `07-database-erd.md`

Complete Entity-Relationship Diagram:
- All 25+ tables
- Primary keys (UUID)
- Foreign keys
- Relationships (1:1, 1:N, N:M)
- Join tables
- Indexes

### 8. API Flow
**File**: `08-api-flow.md`

Request lifecycle:
- Complete request flow from user to database
- Authentication and authorization flow
- Example: Create Lease flow
- Error handling

### 9. Sequence Diagrams
**File**: `09-sequence-diagrams.md`

Detailed sequence diagrams for:
- A) User Login
- B) Landlord viewing properties
- C) PM creating a lease
- D) Tenant submitting a work order
- E) Vendor updating work order status
- F) Super Admin creating a PMC

### 10. Deployment Architecture
**File**: `10-deployment-architecture.md`

Deployment infrastructure:
- Client Layer
- CDN / Edge
- Frontend Deployment (Next.js)
- API Gateway / Load Balancer
- Backend Services (FastAPI)
- Database Layer (PostgreSQL)
- Storage Layer (S3)
- Authentication
- Monitoring & Logging
- CI/CD
- Organization Boundaries
- Security Layers

### 11. Backend Dependency Graph
**File**: `dependency-backend.md`

Complete backend dependency structure:
- FastAPI Application → Routers
- Routers → Core Middleware (Auth, RBAC, CRUD Helpers)
- Core → Schemas → Models → Database
- Organization scoping chain
- RBAC permission evaluation flow
- Router pattern dependencies

### 12. Frontend Dependency Graph
**File**: `dependency-frontend.md`

Complete frontend dependency structure:
- Next.js App Router → Pages
- Pages → Components → Hooks
- Hooks → React Query → API Clients
- API Clients → FastAPI Backend
- Layout system dependencies
- Component hierarchy
- Page → Hook → API flow

### 13. Cross-Cutting Concerns Dependency Graph
**File**: `dependency-cross-cutting.md`

Cross-cutting system dependencies:
- Authentication flow (frontend → backend)
- RBAC system (frontend hooks → backend middleware)
- Organization scoping (frontend → backend)
- Typed API client generation flow
- Complete cross-cutting flow sequence

## Diagram Format

All diagrams are provided in **Mermaid** format, which can be:
- Rendered directly in GitHub/GitLab
- Rendered in Markdown viewers that support Mermaid
- Exported to PNG using [Mermaid CLI](https://github.com/mermaid-js/mermaid-cli)

## Generating PNG Files

To generate PNG files from the Mermaid diagrams:

```bash
# Install Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Generate PNG from a diagram
mmdc -i docs/diagrams/01-system-overview.md -o docs/diagrams/01-system-overview.png

# Generate all PNGs
for file in docs/diagrams/*.md; do
    mmdc -i "$file" -o "${file%.md}.png"
done
```

## Viewing Diagrams

### In GitHub/GitLab
The diagrams will render automatically when viewing the `.md` files.

### In VS Code
Install the "Markdown Preview Mermaid Support" extension.

### Online
Use [Mermaid Live Editor](https://mermaid.live/) to paste the diagram code.

## Updating Diagrams

When the architecture changes:
1. Update the relevant `.md` file in this directory
2. Regenerate PNG files if needed
3. Update cross-references in documentation

## UML Class Diagrams

Detailed UML class diagrams for all domain models:

### 14. Users & RBAC Domain
**File**: `uml-users.md`

User authentication and RBAC models:
- Organization
- User
- Role
- UserRole (many-to-many with organization scoping)
- AuditLog
- Invitation

### 15. Organization Domain
**File**: `uml-organizations.md`

Organization domain and multi-tenancy:
- Organization (root entity)
- Relationships with all other entities
- Organization scoping patterns
- Organization types (PMC, LANDLORD, INTERNAL)

### 16. Portfolio Domain
**File**: `uml-portfolio.md`

Core portfolio management:
- Property
- Unit
- Landlord
- Tenant
- Lease
- LeaseTenant (many-to-many)
- RentPayment

### 17. Work Orders Domain
**File**: `uml-workorders.md`

Maintenance and vendor management:
- Vendor
- WorkOrder
- WorkOrderAssignment
- WorkOrderComment
- Attachment
- Expense

### 18. Documents Domain
**File**: `uml-documents.md`

Document management:
- Attachment (polymorphic)
- Form
- FormSignature
- Document types and relationships

### 19. Messaging Domain
**File**: `uml-messaging.md`

Communication and notifications:
- Conversation
- ConversationParticipant
- Message
- Notification
- Polymorphic entity linking

## Related Documentation

- [Architecture Overview](../01_Architecture.md)
- [Database Schema](../04_Database_v2_Schema.md)
- [Domain Models](../06_Domain_Models.md)
- [RBAC Documentation](../05_RBAC_Roles_and_Permissions.md)
- [Backend API](../02_Backend_API.md)
- [Frontend Structure](../03_Frontend_Structure.md)

