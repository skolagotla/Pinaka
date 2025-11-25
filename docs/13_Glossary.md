# Pinaka v2 - Glossary

## Terms and Definitions

### A

**API-First**: Design approach where the API is the primary interface, with frontend and other clients built on top of it.

**Aggregate**: A cluster of domain objects (entities and value objects) treated as a single unit in DDD.

**Alembic**: Database migration tool for SQLAlchemy.

**Asyncpg**: PostgreSQL database driver for Python async/await.

### B

**Bounded Context**: A logical boundary within which a domain model is valid in DDD.

**Bcrypt**: Password hashing algorithm used for secure password storage.

### C

**CORS (Cross-Origin Resource Sharing)**: Mechanism that allows web pages to make requests to a different domain.

**CRUD**: Create, Read, Update, Delete operations.

### D

**DDD (Domain-Driven Design)**: Software development approach that focuses on modeling software to match a domain.

**DTO (Data Transfer Object)**: Object that carries data between processes.

### E

**Entity**: An object with a unique identity that persists over time in DDD.

### F

**FastAPI**: Modern Python web framework for building APIs.

**Flowbite**: UI component library built on Tailwind CSS.

### J

**JWT (JSON Web Token)**: Compact, URL-safe token format for securely transmitting information.

### M

**Multi-Tenancy**: Architecture where a single instance serves multiple organizations (tenants).

### O

**OpenAPI**: Specification for describing REST APIs (formerly Swagger).

**Organization**: A tenant in the multi-tenant system (PMC, Landlord, etc.).

**Organization Scoping**: Filtering data by organization_id to ensure data isolation.

### P

**PMC (Property Management Company)**: A type of organization that manages properties.

**PM (Property Manager)**: User role responsible for managing assigned properties.

**Pydantic**: Data validation library for Python using type annotations.

**Portfolio**: Unified interface for all property management activities.

### R

**RBAC (Role-Based Access Control)**: Access control method based on user roles.

**React Query**: Data fetching and caching library for React (TanStack Query).

**Repository Pattern**: Design pattern that abstracts data access logic.

### S

**SSOT (Single Source of Truth)**: Principle where data is defined in one place (FastAPI schemas).

**SQLAlchemy**: Python SQL toolkit and ORM.

**SUPER_ADMIN**: User role with full system access across all organizations.

### T

**Tenant (User Role)**: User role representing a lease holder/resident.

**Tenant (Multi-Tenancy)**: An organization in the multi-tenant system.

**TypeScript**: Typed superset of JavaScript.

### U

**UUID**: Universally Unique Identifier used as primary keys.

**Unified Portfolio**: Single interface for all property management activities.

### V

**Vendor**: User role representing a service provider.

**Value Object**: An object without identity, defined by its attributes in DDD.

---

**Related Documentation**:
- [Overview](00_Overview.md) - Project overview
- [Architecture](01_Architecture.md) - System architecture

