# UML Class Diagram - Messaging Domain

## Pinaka v2 Messaging Domain

This UML class diagram shows the messaging and communication domain models.

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
    
    class Conversation {
        +UUID id
        +UUID organization_id
        +UUID created_by_user_id
        +String entity_type
        +UUID entity_id
        +String subject
        +String status
        +DateTime created_at
        +DateTime updated_at
        +Organization organization
        +User created_by_user
        +List~ConversationParticipant~ participants
        +List~Message~ messages
    }
    
    class ConversationParticipant {
        +UUID id
        +UUID conversation_id
        +UUID user_id
        +DateTime last_read_at
        +DateTime joined_at
        +Conversation conversation
        +User user
    }
    
    class Message {
        +UUID id
        +UUID conversation_id
        +UUID sender_user_id
        +String body
        +Boolean is_read
        +DateTime created_at
        +Conversation conversation
        +User sender
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
        +User user
        +Organization organization
    }
    
    class WorkOrder {
        +UUID id
        +UUID organization_id
        +UUID property_id
        +String title
        +String status
    }
    
    class Lease {
        +UUID id
        +UUID organization_id
        +UUID unit_id
        +Date start_date
        +Date end_date
    }
    
    class Property {
        +UUID id
        +UUID organization_id
        +String name
        +String address_line1
    }
    
    Organization "1" --> "*" Conversation : contains
    Organization "1" --> "*" Notification : sends
    User "1" --> "*" Conversation : creates
    User "*" --> "*" Conversation : participates in (via ConversationParticipant)
    Conversation "1" --> "*" ConversationParticipant : has
    ConversationParticipant "*" --> "1" User : links
    Conversation "1" --> "*" Message : contains
    Message "*" --> "1" User : sent by
    User "1" --> "*" Notification : receives
    Notification "*" --> "1" Organization : from
    
    Conversation ..> WorkOrder : can link to
    Conversation ..> Lease : can link to
    Conversation ..> Property : can link to
    Notification ..> WorkOrder : can notify about
    Notification ..> Lease : can notify about
    Notification ..> Property : can notify about
    
    note for Conversation "Threaded conversations about entities"
    note for ConversationParticipant "Many-to-many: users in conversations"
    note for Message "Individual messages in conversations"
    note for Notification "System notifications to users"
    note for Conversation "status: 'active', 'archived', 'closed'"
    note for Notification "type: 'MESSAGE_RECEIVED', 'WORK_ORDER_UPDATED', 'RENT_DUE', etc."
```

## Relationships

- **Organization → Conversation**: One-to-many (organization contains conversations)
- **Organization → Notification**: One-to-many (organization sends notifications)
- **User → Conversation**: One-to-many (user creates conversations)
- **User → Conversation**: Many-to-many via ConversationParticipant (users participate in conversations)
- **Conversation → ConversationParticipant**: One-to-many (conversation has participants)
- **ConversationParticipant → User**: Many-to-one (participant is a user)
- **Conversation → Message**: One-to-many (conversation contains messages)
- **Message → User**: Many-to-one (message sent by user)
- **User → Notification**: One-to-many (user receives notifications)
- **Notification → Organization**: Many-to-one (notification from organization)

## Key Attributes

### Conversation
- **entity_type**: Optional entity type ('work_order', 'lease', 'property', etc.)
- **entity_id**: Optional UUID of linked entity
- **subject**: Optional conversation subject
- **status**: 'active', 'archived', 'closed'
- **created_by_user_id**: User who started the conversation
- **Can be linked to entities**: Conversations can be about work orders, leases, properties, etc.

### ConversationParticipant
- **conversation_id**: Foreign key to Conversation
- **user_id**: Foreign key to User
- **last_read_at**: Timestamp when user last read messages
- **joined_at**: Timestamp when user joined conversation
- **Unique constraint**: (conversation_id, user_id)

### Message
- **conversation_id**: Foreign key to Conversation
- **sender_user_id**: Foreign key to User (who sent the message)
- **body**: Required message text
- **is_read**: Boolean flag for read status
- **created_at**: Timestamp when message was sent

### Notification
- **user_id**: Foreign key to User (who receives notification)
- **organization_id**: Foreign key to Organization
- **entity_type**: Required entity type
- **entity_id**: Required UUID of entity
- **type**: Required notification type ('MESSAGE_RECEIVED', 'WORK_ORDER_UPDATED', 'RENT_DUE', etc.)
- **is_read**: Boolean flag for read status
- **read_at**: Timestamp when notification was read

## Polymorphic Relationships

Both `Conversation` and `Notification` use polymorphic relationships:

### Conversation
- Can be linked to any entity via `entity_type` + `entity_id`
- Examples: Work order conversations, lease conversations, property conversations
- Can also be standalone (no entity link)

### Notification
- Always linked to an entity via `entity_type` + `entity_id`
- Examples: Work order notifications, lease notifications, message notifications
- Notification type indicates what happened to the entity

## Notification Types

- **MESSAGE_RECEIVED**: New message in conversation
- **WORK_ORDER_UPDATED**: Work order status changed
- **RENT_DUE**: Rent payment due
- **LEASE_EXPIRING**: Lease expiring soon
- **TASK_DUE**: Task due date approaching
- **FORM_SIGNED**: Form signature completed
- Other entity-specific notifications

