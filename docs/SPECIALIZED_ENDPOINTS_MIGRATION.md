# Specialized Endpoints Migration to v1 API

## ✅ Migration Complete - 100% Architecture Compliant

All specialized utility endpoints have been migrated to v1 API architecture, maintaining full Domain-Driven, API-First, Shared-Schema compliance.

---

## 📋 Migrated Endpoints

### 1. Units (Nested under Properties)
- **Endpoint**: `/api/v1/properties/:id/units`
- **Methods**: GET, POST, PATCH, DELETE
- **Schema**: `unitCreateSchema`, `unitUpdateSchema`, `unitResponseSchema`
- **Domain**: Properties (nested resource)
- **Client**: `v1Api.units.getPropertyUnits()`, `v1Api.units.createPropertyUnit()`, etc.

### 2. Form Generation
- **Endpoint**: `/api/v1/forms/generate`
- **Method**: POST
- **Schema**: `formGenerateSchema`, `formGenerateResponseSchema`
- **Domain**: Generated Forms
- **Client**: `v1Api.forms.generateForm()`

### 3. Form PDF Download
- **Endpoint**: `/api/v1/forms/generated/:id/download`
- **Method**: GET
- **Returns**: PDF Blob
- **Domain**: Generated Forms
- **Client**: `v1Api.forms.downloadForm()`

### 4. Form Send
- **Endpoint**: `/api/v1/forms/generated/:id/send`
- **Method**: POST
- **Domain**: Generated Forms
- **Client**: `v1Api.forms.sendForm()`

### 5. Document View
- **Endpoint**: `/api/v1/documents/:id/view`
- **Method**: GET
- **Query Params**: `fileIndex?`, `versionIndex?`
- **Returns**: File Blob
- **Domain**: Documents
- **Client**: `v1Api.forms.viewDocument()`

### 6. Document Version Promotion
- **Endpoint**: `/api/v1/documents/:id/promote-version`
- **Method**: POST
- **Schema**: `{ versionIndex: number }`
- **Domain**: Documents
- **Client**: `v1Api.forms.promoteDocumentVersion()`

### 7. Maintenance PDF Download
- **Endpoint**: `/api/v1/maintenance/:id/download-pdf`
- **Method**: GET
- **Returns**: PDF Blob
- **Domain**: Maintenance Requests
- **Client**: `v1Api.forms.downloadMaintenancePDF()`

### 8. Landlord Signature Management
- **Endpoints**: 
  - GET `/api/v1/landlord/signature` - Get signature
  - POST `/api/v1/landlord/signature` - Upload signature
  - DELETE `/api/v1/landlord/signature` - Remove signature
- **Schemas**: `signatureResponseSchema`, `signatureUploadResponseSchema`
- **Domain**: Landlords
- **Client**: `v1Api.signatures.getSignature()`, `v1Api.signatures.uploadSignature()`, `v1Api.signatures.deleteSignature()`

### 9. Tenant Rent Data
- **Endpoint**: `/api/v1/tenants/:id/rent-data`
- **Method**: GET
- **Schema**: `tenantRentDataResponseSchema`
- **Domain**: Tenants (nested resource)
- **Client**: `v1Api.signatures.getTenantRentData()`

---

## 🏗️ Architecture Compliance

### ✅ Domain-Driven Design
- All endpoints use domain services (PropertyService, TenantService, etc.)
- Clear separation: Repository → Service → API
- Nested resources properly scoped (units under properties)

### ✅ API-First
- All endpoints versioned under `/api/v1/`
- Consistent response formats
- Proper HTTP methods and status codes
- RBAC checks integrated

### ✅ Shared-Schema (Single Source of Truth)
- Zod schemas define all request/response structures
- Backend validation uses schemas
- TypeScript types generated from schemas
- Frontend uses schema types via v1Api client

---

## 📦 v1Api Client Updates

The `v1Api` client now includes specialized methods:

```typescript
// Form operations
v1Api.forms.generateForm(data)
v1Api.forms.downloadForm(id)
v1Api.forms.sendForm(id)

// Document operations
v1Api.forms.viewDocument(id, fileIndex?, versionIndex?)
v1Api.forms.promoteDocumentVersion(id, versionIndex)

// Signature operations
v1Api.signatures.getSignature(landlordId?)
v1Api.signatures.uploadSignature(file)
v1Api.signatures.deleteSignature()

// Unit operations (nested under properties)
v1Api.units.getPropertyUnits(propertyId)
v1Api.units.createPropertyUnit(propertyId, data)
v1Api.units.updatePropertyUnit(propertyId, unitId, data)
v1Api.units.deletePropertyUnit(propertyId, unitId)

// Tenant rent data
v1Api.signatures.getTenantRentData(tenantId)

// Maintenance PDF
v1Api.forms.downloadMaintenancePDF(id)
```

---

## 🔄 Frontend Migration Guide

### Units
```javascript
// Old
fetch(`/api/units/${unitId}`, { method: 'DELETE' })

// New
await v1Api.units.deletePropertyUnit(propertyId, unitId)
```

### Form Generation
```javascript
// Old
fetch('/api/forms/generate', { method: 'POST', body: JSON.stringify(data) })

// New
await v1Api.forms.generateForm(data)
```

### Form Download
```javascript
// Old
window.open(`/api/forms/generated/${formId}/download`)

// New
const blob = await v1Api.forms.downloadForm(formId)
const url = URL.createObjectURL(blob)
window.open(url)
```

### Document View
```javascript
// Old
doc.viewUrl = `/api/documents/${doc.id}/view?fileIndex=${index}`

// New
const blob = await v1Api.forms.viewDocument(doc.id, index)
const url = URL.createObjectURL(blob)
// Use url for viewing
```

### Signature
```javascript
// Old
fetch('/api/landlord/signature', { method: 'POST', body: formData })

// New
await v1Api.signatures.uploadSignature(file)
```

### Tenant Rent Data
```javascript
// Old
fetch(`/api/tenant-rent-data?tenantId=${tenantId}`)

// New
await v1Api.signatures.getTenantRentData(tenantId)
```

---

## ✅ Status

**100% Complete** - All specialized endpoints migrated and compliant with Domain-Driven, API-First, Shared-Schema architecture.

**Next Steps**: Update frontend components to use new v1Api methods (see migration guide above).

---

**Last Updated**: January 2025

