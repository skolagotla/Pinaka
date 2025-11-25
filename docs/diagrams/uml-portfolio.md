# UML Class Diagram - Portfolio Domain

## Pinaka v2 Portfolio Domain (Properties, Units, Landlords, Tenants, Leases)

This UML class diagram shows the core portfolio management domain models.

```mermaid
classDiagram
    class Organization {
        +UUID id
        +String name
        +String type
        +DateTime created_at
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
        +Organization organization
        +Landlord landlord
        +List~Unit~ units
        +List~WorkOrder~ work_orders
    }
    
    class Unit {
        +UUID id
        +UUID property_id
        +String unit_number
        +String floor
        +Integer bedrooms
        +Integer bathrooms
        +Integer size_sqft
        +String status
        +DateTime created_at
        +Property property
        +List~Lease~ leases
        +List~WorkOrder~ work_orders
    }
    
    class Landlord {
        +UUID id
        +UUID user_id
        +UUID organization_id
        +String name
        +String email
        +String phone
        +String status
        +DateTime created_at
        +User user
        +Organization organization
        +List~Property~ properties
        +List~Lease~ leases
    }
    
    class Tenant {
        +UUID id
        +UUID user_id
        +UUID organization_id
        +String name
        +String email
        +String phone
        +String status
        +DateTime created_at
        +User user
        +Organization organization
        +List~LeaseTenant~ lease_tenants
        +List~WorkOrder~ work_orders
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
        +Organization organization
        +Unit unit
        +Landlord landlord
        +List~LeaseTenant~ lease_tenants
    }
    
    class LeaseTenant {
        +UUID id
        +UUID lease_id
        +UUID tenant_id
        +Boolean is_primary
        +DateTime added_at
        +Lease lease
        +Tenant tenant
    }
    
    class RentPayment {
        +UUID id
        +UUID organization_id
        +UUID lease_id
        +UUID tenant_id
        +Numeric amount
        +Date payment_date
        +String payment_method
        +String status
        +String reference_number
        +String notes
        +DateTime created_at
        +DateTime updated_at
        +Organization organization
        +Lease lease
        +Tenant tenant
    }
    
    Organization "1" --> "*" Property : owns
    Organization "1" --> "*" Landlord : contains
    Organization "1" --> "*" Tenant : contains
    Organization "1" --> "*" Lease : manages
    Property "1" --> "*" Unit : contains
    Property "1" --> "1" Landlord : owned by
    Landlord "1" --> "*" Property : owns
    Landlord "1" --> "*" Lease : has
    Unit "1" --> "*" Lease : has
    Lease "1" --> "*" LeaseTenant : has
    LeaseTenant "*" --> "1" Tenant : links
    Tenant "*" --> "*" Lease : in (via LeaseTenant)
    Lease "1" --> "*" RentPayment : receives
    
    note for Property "Real estate properties with address"
    note for Unit "Individual units within properties"
    note for Lease "Lease agreements linking units to tenants"
    note for LeaseTenant "Many-to-many: leases can have multiple tenants"
    note for RentPayment "Rent payments linked to leases"
```

## Relationships

- **Organization → Property**: One-to-many (organization owns properties)
- **Organization → Landlord**: One-to-many (organization contains landlords)
- **Organization → Tenant**: One-to-many (organization contains tenants)
- **Organization → Lease**: One-to-many (organization manages leases)
- **Property → Unit**: One-to-many (property contains units)
- **Property → Landlord**: Many-to-one (property owned by landlord)
- **Landlord → Property**: One-to-many (landlord owns properties)
- **Landlord → Lease**: One-to-many (landlord has leases)
- **Unit → Lease**: One-to-many (unit has leases)
- **Lease → Tenant**: Many-to-many via LeaseTenant (lease can have multiple tenants)
- **Lease → RentPayment**: One-to-many (lease receives rent payments)

## Key Attributes

### Property
- **address_line1**: Required address line
- **status**: 'active', 'inactive', 'maintenance'
- **landlord_id**: Optional (property may not have assigned landlord)

### Unit
- **unit_number**: Required identifier within property
- **status**: 'vacant', 'occupied', 'maintenance'
- **bedrooms/bathrooms**: Optional unit details
- **size_sqft**: Optional square footage

### Lease
- **start_date/end_date**: Required lease period
- **rent_amount**: Required monthly rent
- **rent_due_day**: Day of month rent is due (1-31)
- **security_deposit**: Optional security deposit amount
- **status**: 'pending', 'active', 'terminated', 'expired'

### LeaseTenant
- **is_primary**: Boolean flag for primary tenant
- **Unique constraint**: (lease_id, tenant_id)

### RentPayment
- **amount**: Payment amount
- **payment_date**: Date payment was made
- **payment_method**: 'check', 'bank_transfer', 'credit_card', 'cash'
- **status**: 'pending', 'completed', 'failed', 'refunded'
- **reference_number**: Optional payment reference

