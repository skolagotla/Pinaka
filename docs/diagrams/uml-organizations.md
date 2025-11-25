# UML Class Diagram - Organization Domain

## Pinaka v2 Organization Domain

This UML class diagram shows the organization domain model and its relationships with all other entities.

```mermaid
classDiagram
    class Organization {
        +UUID id
        +String name
        +String type
        +String timezone
        +String country
        +DateTime created_at
        +List~User~ users
        +List~Landlord~ landlords
        +List~Tenant~ tenants
        +List~Vendor~ vendors
        +List~Property~ properties
        +List~Lease~ leases
        +List~WorkOrder~ work_orders
        +List~Attachment~ attachments
        +List~Notification~ notifications
        +List~AuditLog~ audit_logs
        +List~Task~ tasks
        +List~Conversation~ conversations
        +List~Invitation~ invitations
        +List~Form~ forms
        +List~RentPayment~ rent_payments
        +List~Expense~ expenses
        +List~Inspection~ inspections
    }
    
    class User {
        +UUID id
        +UUID organization_id
        +String email
        +String password_hash
        +String full_name
        +String phone
        +String status
        +DateTime created_at
        +DateTime updated_at
    }
    
    class Property {
        +UUID id
        +UUID organization_id
        +UUID landlord_id
        +String name
        +String address_line1
        +String address_line2
        +String city
        +String state
        +String postal_code
        +String country
        +String status
        +DateTime created_at
    }
    
    class Lease {
        +UUID id
        +UUID organization_id
        +UUID unit_id
        +UUID landlord_id
        +Date start_date
        +Date end_date
        +Numeric rent_amount
        +Integer rent_due_day
        +Numeric security_deposit
        +String status
        +DateTime created_at
        +DateTime updated_at
    }
    
    class WorkOrder {
        +UUID id
        +UUID organization_id
        +UUID property_id
        +UUID unit_id
        +UUID tenant_id
        +UUID created_by_user_id
        +String title
        +String description
        +String status
        +String priority
        +DateTime created_at
        +DateTime updated_at
        +DateTime completed_at
    }
    
    class Task {
        +UUID id
        +UUID organization_id
        +UUID created_by_user_id
        +UUID property_id
        +String title
        +String description
        +String category
        +DateTime due_date
        +String priority
        +Boolean is_completed
        +DateTime completed_at
        +DateTime created_at
        +DateTime updated_at
    }
    
    class Notification {
        +UUID id
        +UUID user_id
        +UUID organization_id
        +String entity_type
        +UUID entity_id
        +String type
        +Boolean is_read
        +DateTime created_at
        +DateTime read_at
    }
    
    class AuditLog {
        +UUID id
        +UUID organization_id
        +UUID actor_user_id
        +String action
        +String entity_type
        +UUID entity_id
        +JSONB extra_metadata
        +DateTime created_at
    }
    
    Organization "1" --> "*" User : contains
    Organization "1" --> "*" Property : owns
    Organization "1" --> "*" Lease : manages
    Organization "1" --> "*" WorkOrder : tracks
    Organization "1" --> "*" Task : contains
    Organization "1" --> "*" Notification : sends
    Organization "1" --> "*" AuditLog : logs
    
    note for Organization "Multi-tenant root entity. All data scoped to organization."
    note for Organization "Types: 'PMC', 'LANDLORD', 'INTERNAL'"
    note for User "Users belong to organization (nullable for super_admin)"
    note for Property "Properties belong to organization"
    note for Lease "Leases belong to organization"
    note for WorkOrder "Work orders belong to organization"
```

## Organization Scoping

All entities in the system are scoped to an organization:

- **User**: `organization_id` (nullable for SUPER_ADMIN)
- **Property**: `organization_id` (required)
- **Lease**: `organization_id` (required)
- **WorkOrder**: `organization_id` (required)
- **Task**: `organization_id` (required)
- **Notification**: `organization_id` (required)
- **AuditLog**: `organization_id` (nullable for global actions)

## Organization Types

- **PMC**: Property Management Company
- **LANDLORD**: Individual landlord organization
- **INTERNAL**: Internal Pinaka organization

## Key Relationships

- **Organization → User**: One-to-many (organization contains users)
- **Organization → Property**: One-to-many (organization owns properties)
- **Organization → Lease**: One-to-many (organization manages leases)
- **Organization → WorkOrder**: One-to-many (organization tracks work orders)
- **Organization → Task**: One-to-many (organization contains tasks)
- **Organization → Notification**: One-to-many (organization sends notifications)
- **Organization → AuditLog**: One-to-many (organization logs actions)

