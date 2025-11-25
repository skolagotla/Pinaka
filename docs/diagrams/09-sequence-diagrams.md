# Sequence Diagrams for Key Flows

## A) User Login Flow

```mermaid
sequenceDiagram
    participant User
    participant LoginPage
    participant AuthAPI
    participant FastAPI
    participant AuthService
    participant DB
    participant Browser
    
    User->>LoginPage: Enter Email & Password
    LoginPage->>AuthAPI: POST /api/v2/auth/login
    AuthAPI->>FastAPI: Login Request
    FastAPI->>AuthService: authenticate(email, password)
    AuthService->>DB: SELECT user WHERE email
    DB-->>AuthService: User Record
    AuthService->>AuthService: Verify Password Hash
    AuthService->>DB: SELECT roles WHERE user_id
    DB-->>AuthService: User Roles
    AuthService->>AuthService: Generate JWT Token
    AuthService-->>FastAPI: Token + User Data
    FastAPI-->>AuthAPI: Login Response
    AuthAPI->>Browser: Store Token in localStorage
    AuthAPI->>LoginPage: Redirect to /portfolio
    LoginPage->>Browser: Navigate to Dashboard
```

## B) Landlord Viewing Properties Flow

```mermaid
sequenceDiagram
    participant Landlord
    participant PortfolioPage
    participant ReactQuery
    participant APIClient
    participant FastAPI
    participant RBAC
    participant PropRouter
    participant PropService
    participant PropRepo
    participant DB
    
    Landlord->>PortfolioPage: Navigate to Properties
    PortfolioPage->>ReactQuery: useQuery(properties)
    ReactQuery->>APIClient: GET /api/v2/properties
    APIClient->>FastAPI: Request + JWT
    
    FastAPI->>RBAC: Check Permission(READ, PROPERTY)
    RBAC->>RBAC: Verify LANDLORD Role
    RBAC-->>FastAPI: Permission Granted
    
    FastAPI->>PropRouter: list_properties()
    PropRouter->>PropService: getProperties(org_id, landlord_id)
    PropService->>PropService: Apply Landlord Filter
    PropService->>PropRepo: findByLandlord(landlord_id)
    PropRepo->>DB: SELECT * FROM properties<br/>WHERE landlord_id = ?
    DB-->>PropRepo: Property Records
    PropRepo-->>PropService: Property Entities
    PropService-->>PropRouter: Filtered Properties
    PropRouter-->>FastAPI: JSON Response
    FastAPI-->>APIClient: 200 OK + Properties
    APIClient-->>ReactQuery: Data
    ReactQuery->>PortfolioPage: Update UI
    PortfolioPage-->>Landlord: Display Properties
```

## C) PM Creating a Lease Flow

```mermaid
sequenceDiagram
    participant PM
    participant LeaseForm
    participant ReactQuery
    participant APIClient
    participant FastAPI
    participant RBAC
    participant LeaseRouter
    participant LeaseService
    participant UnitService
    participant LeaseRepo
    participant DB
    
    PM->>LeaseForm: Fill Lease Details
    PM->>LeaseForm: Select Unit & Tenants
    PM->>LeaseForm: Click "Create Lease"
    
    LeaseForm->>ReactQuery: useMutation(createLease)
    ReactQuery->>APIClient: POST /api/v2/leases
    APIClient->>FastAPI: Request + JWT
    
    FastAPI->>RBAC: Check Permission(CREATE, LEASE)
    RBAC->>RBAC: Verify PM Role
    RBAC->>RBAC: Check Property Assignment
    RBAC-->>FastAPI: Permission Granted
    
    FastAPI->>LeaseRouter: create_lease(leaseData)
    LeaseRouter->>LeaseService: createLease(data)
    LeaseService->>UnitService: checkUnitAvailability(unit_id)
    UnitService->>DB: SELECT * FROM leases<br/>WHERE unit_id AND status = 'active'
    DB-->>UnitService: Existing Leases
    UnitService-->>LeaseService: Unit Available
    
    LeaseService->>LeaseService: Validate Dates
    LeaseService->>LeaseService: Calculate Security Deposit
    LeaseService->>LeaseRepo: save(lease)
    LeaseRepo->>DB: INSERT INTO leases
    DB-->>LeaseRepo: Lease Created
    
    LeaseService->>LeaseRepo: saveTenants(leaseTenants)
    LeaseRepo->>DB: INSERT INTO lease_tenants
    DB-->>LeaseRepo: Tenants Linked
    
    LeaseRepo-->>LeaseService: Complete Lease
    LeaseService-->>LeaseRouter: Lease Entity
    LeaseRouter-->>FastAPI: 201 Created
    FastAPI-->>APIClient: Success Response
    APIClient-->>ReactQuery: Success
    ReactQuery->>ReactQuery: Invalidate Queries
    ReactQuery-->>LeaseForm: Show Success
    LeaseForm-->>PM: Lease Created Successfully
```

## D) Tenant Submitting a Work Order Flow

```mermaid
sequenceDiagram
    participant Tenant
    participant WOForm
    participant ReactQuery
    participant APIClient
    participant FastAPI
    participant RBAC
    participant WORouter
    participant WOService
    participant WORepo
    participant DB
    participant NotificationService
    
    Tenant->>WOForm: Fill Work Order Details
    Tenant->>WOForm: Select Property/Unit
    Tenant->>WOForm: Enter Description
    Tenant->>WOForm: Click "Submit"
    
    WOForm->>ReactQuery: useMutation(createWorkOrder)
    ReactQuery->>APIClient: POST /api/v2/work-orders
    APIClient->>FastAPI: Request + JWT
    
    FastAPI->>RBAC: Check Permission(CREATE, WORK_ORDER)
    RBAC->>RBAC: Verify TENANT Role
    RBAC->>RBAC: Check Tenant Access to Property
    RBAC-->>FastAPI: Permission Granted
    
    FastAPI->>WORouter: create_work_order(woData)
    WORouter->>WOService: createWorkOrder(data)
    WOService->>WOService: Validate Property Access
    WOService->>WOService: Set Status = 'new'
    WOService->>WOService: Set Priority
    WOService->>WORepo: save(workOrder)
    WORepo->>DB: INSERT INTO work_orders
    DB-->>WORepo: Work Order Created
    
    WOService->>NotificationService: notifyPMs(workOrder)
    NotificationService->>DB: INSERT INTO notifications
    DB-->>NotificationService: Notifications Created
    
    WORepo-->>WOService: Work Order Entity
    WOService-->>WORouter: WO Response
    WORouter-->>FastAPI: 201 Created
    FastAPI-->>APIClient: Success Response
    APIClient-->>ReactQuery: Success
    ReactQuery-->>WOForm: Show Success
    WOForm-->>Tenant: Work Order Submitted
```

## E) Vendor Updating Work Order Status Flow

```mermaid
sequenceDiagram
    participant Vendor
    participant WODetail
    participant ReactQuery
    participant APIClient
    participant FastAPI
    participant RBAC
    participant WORouter
    participant WOService
    participant WORepo
    participant DB
    participant NotificationService
    
    Vendor->>WODetail: View Assigned Work Order
    Vendor->>WODetail: Update Status to "In Progress"
    Vendor->>WODetail: Click "Update Status"
    
    WODetail->>ReactQuery: useMutation(updateWorkOrder)
    ReactQuery->>APIClient: PATCH /api/v2/work-orders/:id
    APIClient->>FastAPI: Request + JWT
    
    FastAPI->>RBAC: Check Permission(UPDATE, WORK_ORDER)
    RBAC->>RBAC: Verify VENDOR Role
    RBAC->>RBAC: Check Work Order Assignment
    RBAC-->>FastAPI: Permission Granted
    
    FastAPI->>WORouter: update_work_order(id, updates)
    WORouter->>WOService: updateWorkOrder(id, updates)
    WOService->>WORepo: findById(id)
    WORepo->>DB: SELECT * FROM work_orders WHERE id
    DB-->>WORepo: Work Order
    WORepo-->>WOService: WO Entity
    
    WOService->>WOService: Validate Status Transition
    WOService->>WOService: Update Status
    WOService->>WORepo: save(workOrder)
    WORepo->>DB: UPDATE work_orders SET status
    DB-->>WORepo: Updated
    
    WOService->>NotificationService: notifyStakeholders(workOrder)
    NotificationService->>DB: INSERT INTO notifications
    DB-->>NotificationService: Notifications Created
    
    WORepo-->>WOService: Updated WO
    WOService-->>WORouter: WO Response
    WORouter-->>FastAPI: 200 OK
    FastAPI-->>APIClient: Success Response
    APIClient-->>ReactQuery: Success
    ReactQuery->>ReactQuery: Invalidate Queries
    ReactQuery-->>WODetail: Update UI
    WODetail-->>Vendor: Status Updated
```

## F) Super Admin Creating a PMC Flow

```mermaid
sequenceDiagram
    participant SA as Super Admin
    participant PlatformPage
    participant ReactQuery
    participant APIClient
    participant FastAPI
    participant RBAC
    participant OrgRouter
    participant OrgService
    participant UserService
    participant OrgRepo
    participant UserRepo
    participant DB
    
    SA->>PlatformPage: Navigate to Organizations
    SA->>PlatformPage: Click "Create PMC"
    SA->>PlatformPage: Fill Organization Form
    SA->>PlatformPage: Click "Create"
    
    PlatformPage->>ReactQuery: useMutation(createOrganization)
    ReactQuery->>APIClient: POST /api/v2/organizations
    APIClient->>FastAPI: Request + JWT
    
    FastAPI->>RBAC: Check Permission(CREATE, ORGANIZATION)
    RBAC->>RBAC: Verify SUPER_ADMIN Role
    RBAC-->>FastAPI: Permission Granted
    
    FastAPI->>OrgRouter: create_organization(orgData)
    OrgRouter->>OrgService: createOrganization(data)
    OrgService->>OrgService: Validate Data
    OrgService->>OrgService: Set Type = 'PMC'
    OrgService->>OrgRepo: save(organization)
    OrgRepo->>DB: INSERT INTO organizations
    DB-->>OrgRepo: Organization Created
    
    OrgService->>UserService: createAdminUser(org_id, userData)
    UserService->>UserService: Hash Password
    UserService->>UserRepo: save(user)
    UserRepo->>DB: INSERT INTO users
    DB-->>UserRepo: User Created
    
    UserService->>UserService: assignRole(user_id, 'pmc_admin', org_id)
    UserService->>DB: INSERT INTO user_roles
    DB-->>UserService: Role Assigned
    
    OrgRepo-->>OrgService: Organization Entity
    OrgService-->>OrgRouter: Org Response
    OrgRouter-->>FastAPI: 201 Created
    FastAPI-->>APIClient: Success Response
    APIClient-->>ReactQuery: Success
    ReactQuery->>ReactQuery: Invalidate Queries
    ReactQuery-->>PlatformPage: Update UI
    PlatformPage-->>SA: PMC Created Successfully
```

