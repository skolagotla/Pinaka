# UML Class Diagram - Document Domain

## Pinaka v2 Document Domain

This UML class diagram shows the document management domain models including attachments, forms, and signatures.

```mermaid
classDiagram
    class Organization {
        +UUID id
        +String name
        +DateTime created_at
    }
    
    class User {
        +UUID id
        +UUID organization_id
        +String email
        +String full_name
        +String status
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
    
    class Form {
        +UUID id
        +UUID organization_id
        +UUID created_by_user_id
        +String form_type
        +String entity_type
        +UUID entity_id
        +JSONB template_data
        +String status
        +DateTime signed_at
        +DateTime created_at
        +DateTime updated_at
        +Organization organization
        +User created_by_user
        +List~FormSignature~ signatures
    }
    
    class FormSignature {
        +UUID id
        +UUID form_id
        +UUID signer_user_id
        +String signature_data
        +DateTime signed_at
        +Form form
        +User signer
    }
    
    class Lease {
        +UUID id
        +UUID organization_id
        +UUID unit_id
        +Date start_date
        +Date end_date
        +Numeric rent_amount
        +String status
    }
    
    class WorkOrder {
        +UUID id
        +UUID organization_id
        +UUID property_id
        +String title
        +String status
    }
    
    class Property {
        +UUID id
        +UUID organization_id
        +String name
        +String address_line1
    }
    
    Organization "1" --> "*" Attachment : stores
    Organization "1" --> "*" Form : contains
    User "1" --> "*" Form : creates
    User "1" --> "*" FormSignature : signs
    Form "1" --> "*" FormSignature : has
    Attachment "*" --> "1" Organization : belongs to
    Form "*" --> "1" Organization : belongs to
    FormSignature "*" --> "1" Form : signs
    FormSignature "*" --> "1" User : signed by
    
    Attachment ..> Lease : can attach to
    Attachment ..> WorkOrder : can attach to
    Attachment ..> Property : can attach to
    Form ..> Lease : can link to
    Form ..> WorkOrder : can link to
    
    note for Attachment "Generic attachment model for any entity"
    note for Attachment "entity_type: 'work_order', 'lease', 'property', 'message', etc."
    note for Form "Legal forms (N4, N5, L1, T1, etc.)"
    note for FormSignature "Digital signatures for forms"
    note for Form "status: 'draft', 'pending_signature', 'signed', 'expired'"
```

## Relationships

- **Organization → Attachment**: One-to-many (organization stores attachments)
- **Organization → Form**: One-to-many (organization contains forms)
- **User → Form**: One-to-many (user creates forms)
- **User → FormSignature**: One-to-many (user signs forms)
- **Form → FormSignature**: One-to-many (form has signatures)
- **Attachment → Entity**: Polymorphic relationship (can attach to any entity via entity_type + entity_id)
- **Form → Entity**: Optional relationship (can link to lease, work_order, etc.)

## Key Attributes

### Attachment
- **entity_type**: Required entity type ('work_order', 'lease', 'property', 'message', etc.)
- **entity_id**: Required UUID of the entity
- **storage_key**: File path or S3 key
- **file_name**: Original file name
- **mime_type**: MIME type of the file
- **file_size_bytes**: File size in bytes
- **Generic model**: Can attach to any entity in the system

### Form
- **form_type**: Required form type ('N4', 'N5', 'L1', 'T1', etc.)
- **entity_type**: Optional entity type ('lease', 'work_order', etc.)
- **entity_id**: Optional UUID of linked entity
- **template_data**: JSONB for form field values
- **status**: 'draft', 'pending_signature', 'signed', 'expired'
- **signed_at**: Timestamp when form was fully signed

### FormSignature
- **form_id**: Foreign key to Form
- **signer_user_id**: Foreign key to User (who signed)
- **signature_data**: Base64 encoded signature image
- **signed_at**: Timestamp when signature was applied

## Document Types

### Attachments
- Work order attachments (photos, documents)
- Lease documents
- Property documents
- Message attachments
- Receipt attachments (for expenses)

### Forms
- **N4**: Notice to End Tenancy
- **N5**: Notice to End Tenancy for Cause
- **L1**: Application to End Tenancy
- **T1**: Tenant Application
- Other legal forms

## Polymorphic Relationships

The `Attachment` model uses a polymorphic relationship pattern:
- **entity_type**: String identifying the entity type
- **entity_id**: UUID of the specific entity
- This allows attachments to be linked to any entity in the system

Similarly, `Form` can optionally link to entities:
- **entity_type**: Optional entity type
- **entity_id**: Optional entity UUID
- Forms can be standalone or linked to leases, work orders, etc.

