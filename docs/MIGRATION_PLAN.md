# Complete Migration Plan

## Status: In Progress

### Phase 1: Replace API Calls ✅
- [x] Create v2-client
- [x] Create useV2Data hooks
- [ ] Replace all `/api/` fetch calls
- [ ] Replace all `/api/admin/` calls

### Phase 2: Remove Prisma ✅
- [ ] Remove serializePrismaData usage
- [ ] Convert server components to client components
- [ ] Use React Query for data fetching

### Phase 3: Complete Pages
- [ ] Dashboard/Portfolio for all roles
- [ ] Properties/Units
- [ ] Tenants/Landlords
- [ ] Leases
- [ ] Work Orders/Maintenance
- [ ] Attachments UI
- [ ] Notifications UI

### Phase 4: Cleanup
- [ ] Remove Next.js API routes
- [ ] Remove Prisma files
- [ ] Update documentation

