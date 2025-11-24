# V2 Migration Plan - Complete Implementation

## Status: IN PROGRESS

This document tracks the complete migration to v2 architecture.

## Phase 1: Remove V1 Code ✅ IN PROGRESS

- [x] Delete Next.js API routes (`apps/web-app/app/api`)
- [x] Remove generated API handlers (`lib/api/generated-handlers`)
- [x] Remove v1 API client files
- [ ] Remove Prisma imports from services
- [ ] Remove v1 hooks (usePinakaCRUDV1, useV1Api, useUnifiedApi)
- [ ] Remove Ant Design components
- [ ] Clean up unused utilities

## Phase 2: Type System Migration

- [ ] Verify v2-api.d.ts exists and is up to date
- [ ] Update all type imports to use @pinaka/shared-types
- [ ] Remove Zod schema imports (except for UI validation)
- [ ] Update all components to use generated types

## Phase 3: UI Migration to Flowbite

- [ ] Audit all components using Ant Design
- [ ] Migrate each component to Flowbite
- [ ] Update forms, tables, modals
- [ ] Update dashboards

## Phase 4: Folder Structure

- [ ] Reorganize apps/web-app structure
- [ ] Reorganize apps/backend-api structure
- [ ] Consolidate documentation

## Phase 5: RBAC Implementation

- [ ] Wire up backend RBAC enforcement
- [ ] Update frontend permission checks
- [ ] Test role-based access

## Phase 6: CRUD Consolidation

- [ ] Identify duplicate CRUD logic
- [ ] Create shared utilities
- [ ] Refactor components

## Phase 7: End-to-End Testing

- [ ] Fix build errors
- [ ] Fix runtime errors
- [ ] Test all pages
- [ ] Verify API calls

## Phase 8: Polish

- [ ] Error states
- [ ] Loading states
- [ ] Remove warnings
- [ ] Performance optimization

