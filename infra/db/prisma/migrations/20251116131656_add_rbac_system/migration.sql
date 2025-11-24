-- CreateEnum: RBACRole
CREATE TYPE "RBACRole" AS ENUM ('SUPER_ADMIN', 'PLATFORM_ADMIN', 'SUPPORT_ADMIN', 'BILLING_ADMIN', 'AUDIT_ADMIN', 'PMC_ADMIN', 'PROPERTY_MANAGER', 'LEASING_AGENT', 'MAINTENANCE_TECH', 'ACCOUNTANT', 'OWNER_LANDLORD', 'TENANT', 'VENDOR_SERVICE_PROVIDER');

-- CreateEnum: ScopeType
CREATE TYPE "ScopeType" AS ENUM ('PORTFOLIO', 'PROPERTY', 'UNIT');

-- CreateEnum: PermissionAction
CREATE TYPE "PermissionAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE', 'SUBMIT', 'VIEW', 'MANAGE', 'ASSIGN', 'EXPORT', 'SEND', 'UPLOAD', 'DOWNLOAD');

-- CreateEnum: ResourceCategory
CREATE TYPE "ResourceCategory" AS ENUM ('PROPERTY_UNIT_MANAGEMENT', 'TENANT_MANAGEMENT', 'LEASING_APPLICATIONS', 'RENT_PAYMENTS', 'ACCOUNTING', 'REPORTING_OWNER_STATEMENTS', 'MAINTENANCE', 'VENDOR_MANAGEMENT', 'COMMUNICATION_MESSAGING', 'DOCUMENT_MANAGEMENT', 'MARKETING_LISTINGS', 'TASK_WORKFLOW_MANAGEMENT', 'USER_ROLE_MANAGEMENT', 'PORTFOLIO_PROPERTY_ASSIGNMENT', 'SYSTEM_SETTINGS');

-- CreateTable: Role
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" "RBACRole" NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "createdByPMCId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable: RolePermission
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "category" "ResourceCategory" NOT NULL,
    "resource" TEXT NOT NULL,
    "action" "PermissionAction" NOT NULL,
    "conditions" JSONB,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable: UserRole
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "portfolioId" TEXT,
    "propertyId" TEXT,
    "unitId" TEXT,
    "pmcId" TEXT,
    "landlordId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable: UserPermission
CREATE TABLE "UserPermission" (
    "id" TEXT NOT NULL,
    "userRoleId" TEXT NOT NULL,
    "category" "ResourceCategory" NOT NULL,
    "resource" TEXT NOT NULL,
    "action" "PermissionAction" NOT NULL,
    "conditions" JSONB,
    "isGranted" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Scope
CREATE TABLE "Scope" (
    "id" TEXT NOT NULL,
    "type" "ScopeType" NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "portfolioId" TEXT,
    "propertyId" TEXT,
    "unitId" TEXT,
    "pmcId" TEXT,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scope_pkey" PRIMARY KEY ("id")
);

-- CreateTable: RBACAuditLog
CREATE TABLE "RBACAuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userType" TEXT,
    "userEmail" TEXT,
    "userName" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "resourceId" TEXT,
    "roleId" TEXT,
    "permissionId" TEXT,
    "scopeId" TEXT,
    "beforeState" JSONB,
    "afterState" JSONB,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RBACAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Role
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");
CREATE INDEX "Role_name_idx" ON "Role"("name");
CREATE INDEX "Role_isActive_idx" ON "Role"("isActive");
CREATE INDEX "Role_createdByPMCId_idx" ON "Role"("createdByPMCId");

-- CreateIndex: RolePermission
CREATE UNIQUE INDEX "RolePermission_roleId_category_resource_action_key" ON "RolePermission"("roleId", "category", "resource", "action");
CREATE INDEX "RolePermission_roleId_idx" ON "RolePermission"("roleId");
CREATE INDEX "RolePermission_category_idx" ON "RolePermission"("category");

-- CreateIndex: UserRole
CREATE UNIQUE INDEX "UserRole_userId_roleId_portfolioId_propertyId_unitId_key" ON "UserRole"("userId", "roleId", "portfolioId", "propertyId", "unitId");
CREATE INDEX "UserRole_userId_userType_idx" ON "UserRole"("userId", "userType");
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");
CREATE INDEX "UserRole_pmcId_idx" ON "UserRole"("pmcId");
CREATE INDEX "UserRole_landlordId_idx" ON "UserRole"("landlordId");
CREATE INDEX "UserRole_propertyId_idx" ON "UserRole"("propertyId");
CREATE INDEX "UserRole_unitId_idx" ON "UserRole"("unitId");
CREATE INDEX "UserRole_isActive_idx" ON "UserRole"("isActive");

-- CreateIndex: UserPermission
CREATE UNIQUE INDEX "UserPermission_userRoleId_category_resource_action_key" ON "UserPermission"("userRoleId", "category", "resource", "action");
CREATE INDEX "UserPermission_userRoleId_idx" ON "UserPermission"("userRoleId");
CREATE INDEX "UserPermission_category_idx" ON "UserPermission"("category");

-- CreateIndex: Scope
CREATE INDEX "Scope_type_idx" ON "Scope"("type");
CREATE INDEX "Scope_parentId_idx" ON "Scope"("parentId");
CREATE INDEX "Scope_portfolioId_idx" ON "Scope"("portfolioId");
CREATE INDEX "Scope_propertyId_idx" ON "Scope"("propertyId");
CREATE INDEX "Scope_unitId_idx" ON "Scope"("unitId");
CREATE INDEX "Scope_pmcId_idx" ON "Scope"("pmcId");
CREATE INDEX "Scope_isActive_idx" ON "Scope"("isActive");

-- CreateIndex: RBACAuditLog
CREATE INDEX "RBACAuditLog_userId_idx" ON "RBACAuditLog"("userId");
CREATE INDEX "RBACAuditLog_userType_idx" ON "RBACAuditLog"("userType");
CREATE INDEX "RBACAuditLog_action_idx" ON "RBACAuditLog"("action");
CREATE INDEX "RBACAuditLog_resource_idx" ON "RBACAuditLog"("resource");
CREATE INDEX "RBACAuditLog_roleId_idx" ON "RBACAuditLog"("roleId");
CREATE INDEX "RBACAuditLog_createdAt_idx" ON "RBACAuditLog"("createdAt");

-- AddForeignKey: RolePermission -> Role
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: UserRole -> Role
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: UserPermission -> UserRole
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_userRoleId_fkey" FOREIGN KEY ("userRoleId") REFERENCES "UserRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Scope -> Scope (self-referential)
ALTER TABLE "Scope" ADD CONSTRAINT "Scope_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Scope"("id") ON DELETE CASCADE ON UPDATE CASCADE;

