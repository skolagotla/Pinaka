# UML Class Diagram - Vendor & Work Order Domain

## Pinaka v2 Vendor and Work Order Domain

This UML class diagram shows the maintenance and vendor management domain models.

```mermaid
classDiagram
    class Organization {
        +UUID id
        +String name
        +DateTime created_at
    }
    
    class Vendor {
        +UUID id
        +UUID user_id
        +UUID organization_id
        +String company_name
        +String contact_name
        +String email
        +String phone
        +String[] service_categories
        +String status
        +DateTime created_at
        +User user
        +Organization organization
        +List~WorkOrderAssignment~ work_order_assignments
    }
    
    class Property {
        +UUID id
        +UUID organization_id
        +String name
        +String address_line1
        +String status
        +DateTime created_at
    }
    
    class Unit {
        +UUID id
        +UUID property_id
        +String unit_number
        +String status
        +DateTime created_at
    }
    
    class Tenant {
        +UUID id
        +UUID organization_id
        +String name
        +String email
        +String phone
        +String status
        +DateTime created_at
    }
    
    class User {
        +UUID id
        +UUID organization_id
        +String email
        +String full_name
        +String status
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
        +Organization organization
        +Property property
        +Unit unit
        +Tenant tenant
        +User created_by_user
        +List~WorkOrderAssignment~ assignments
        +List~WorkOrderComment~ comments
        +List~Attachment~ attachments
    }
    
    class WorkOrderAssignment {
        +UUID id
        +UUID work_order_id
        +UUID vendor_id
        +UUID assigned_by_user_id
        +String status
        +DateTime assigned_at
        +WorkOrder work_order
        +Vendor vendor
        +User assigned_by_user
    }
    
    class WorkOrderComment {
        +UUID id
        +UUID work_order_id
        +UUID author_user_id
        +String body
        +DateTime created_at
        +WorkOrder work_order
        +User author
    }
    
    class Attachment {
        +UUID id
        +UUID organization_id
        +String entity_type
        +UUID entity_id
        +String storage_key
        +String file_name
        +String mime_type
        +BigInteger file_size_bytes
        +DateTime created_at
        +Organization organization
    }
    
    class Expense {
        +UUID id
        +UUID organization_id
        +UUID property_id
        +UUID work_order_id
        +UUID vendor_id
        +String category
        +Numeric amount
        +Date expense_date
        +String description
        +UUID receipt_attachment_id
        +String status
        +UUID created_by_user_id
        +DateTime created_at
        +DateTime updated_at
        +Organization organization
        +Property property
        +WorkOrder work_order
        +Vendor vendor
        +Attachment receipt_attachment
        +User created_by_user
    }
    
    Organization "1" --> "*" Vendor : contains
    Organization "1" --> "*" WorkOrder : tracks
    Organization "1" --> "*" Attachment : stores
    Organization "1" --> "*" Expense : tracks
    Vendor "*" --> "*" WorkOrder : assigned to (via WorkOrderAssignment)
    WorkOrder "1" --> "*" WorkOrderAssignment : has
    WorkOrderAssignment "*" --> "1" Vendor : assigns
    WorkOrder "1" --> "*" WorkOrderComment : has
    WorkOrderComment "*" --> "1" User : authored by
    WorkOrder "1" --> "*" Attachment : has
    WorkOrder "1" --> "*" Expense : linked to
    Property "1" --> "*" WorkOrder : has
    Unit "1" --> "*" WorkOrder : has
    Tenant "1" --> "*" WorkOrder : creates
    User "1" --> "*" WorkOrder : creates
    Expense "*" --> "1" WorkOrder : linked to
    Expense "*" --> "1" Vendor : paid to
    Expense "*" --> "1" Attachment : receipt
    
    note for WorkOrder "Maintenance requests with status tracking"
    note for WorkOrderAssignment "Vendor assignments to work orders"
    note for WorkOrderComment "Comments/updates on work orders"
    note for Vendor "Service providers with categories"
    note for Expense "Expenses linked to work orders"
```

## Relationships

- **Organization → Vendor**: One-to-many (organization contains vendors)
- **Organization → WorkOrder**: One-to-many (organization tracks work orders)
- **Vendor → WorkOrder**: Many-to-many via WorkOrderAssignment (vendors assigned to work orders)
- **WorkOrder → WorkOrderAssignment**: One-to-many (work order has assignments)
- **WorkOrder → WorkOrderComment**: One-to-many (work order has comments)
- **WorkOrder → Attachment**: One-to-many (work order has attachments)
- **WorkOrder → Expense**: One-to-many (work order has expenses)
- **Property → WorkOrder**: One-to-many (property has work orders)
- **Unit → WorkOrder**: One-to-many (unit has work orders)
- **Tenant → WorkOrder**: One-to-many (tenant creates work orders)
- **User → WorkOrder**: One-to-many (user creates work orders)
- **Expense → WorkOrder**: Many-to-one (expense linked to work order)
- **Expense → Vendor**: Many-to-one (expense paid to vendor)

## Key Attributes

### Vendor
- **company_name**: Required vendor company name
- **contact_name**: Optional contact person name
- **service_categories**: Array of service categories (e.g., ['plumbing', 'electrical'])
- **status**: 'active', 'inactive', 'suspended'

### WorkOrder
- **title**: Required work order title
- **description**: Optional detailed description
- **status**: 'new', 'in_progress', 'waiting_on_vendor', 'completed', 'canceled'
- **priority**: 'low', 'medium', 'high', 'emergency'
- **completed_at**: Timestamp when work order was completed

### WorkOrderAssignment
- **status**: 'assigned', 'accepted', 'rejected', 'completed'
- **assigned_at**: Timestamp when assignment was made
- **assigned_by_user_id**: User who made the assignment

### WorkOrderComment
- **body**: Required comment text
- **author_user_id**: User who wrote the comment
- **created_at**: Timestamp of comment

### Expense
- **category**: Required expense category ('maintenance', 'utilities', 'insurance', 'taxes', etc.)
- **amount**: Required expense amount
- **expense_date**: Date expense was incurred
- **receipt_attachment_id**: Optional link to receipt attachment
- **status**: 'pending', 'approved', 'rejected', 'paid'

