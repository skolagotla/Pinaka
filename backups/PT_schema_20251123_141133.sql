--
-- PostgreSQL database dump
--

\restrict 1fd1khG5gjROhSx9tlJBV4Hw5v5CkrqRUw5GqOf4BrSKkpPfb6GOL2rQ0rUmurY

-- Dumped from database version 16.10 (Homebrew)
-- Dumped by pg_dump version 16.11 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AdminRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AdminRole" AS ENUM (
    'SUPER_ADMIN',
    'PLATFORM_ADMIN',
    'SUPPORT_ADMIN',
    'BILLING_ADMIN',
    'AUDIT_ADMIN'
);


--
-- Name: ApprovalRequestStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ApprovalRequestStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'EXPIRED',
    'CANCELLED'
);


--
-- Name: ApprovalStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ApprovalStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


--
-- Name: ApprovalWorkflowType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ApprovalWorkflowType" AS ENUM (
    'PROPERTY_EDIT',
    'BIG_EXPENSE',
    'LEASE',
    'LEASE_RENEWAL',
    'REFUND',
    'OTHER'
);


--
-- Name: ContentType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ContentType" AS ENUM (
    'FAQ',
    'HELP_ARTICLE',
    'TERMS_OF_SERVICE',
    'PRIVACY_POLICY',
    'EMAIL_TEMPLATE',
    'DOCUMENT_TEMPLATE',
    'FORM_TEMPLATE',
    'ANNOUNCEMENT'
);


--
-- Name: ConversationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ConversationStatus" AS ENUM (
    'ACTIVE',
    'CLOSED',
    'ARCHIVED'
);


--
-- Name: ConversationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ConversationType" AS ENUM (
    'LANDLORD_TENANT',
    'LANDLORD_PMC',
    'PMC_TENANT',
    'GROUP'
);


--
-- Name: OrganizationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrganizationStatus" AS ENUM (
    'ACTIVE',
    'SUSPENDED',
    'CANCELLED',
    'TRIAL'
);


--
-- Name: OwnershipDocumentType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OwnershipDocumentType" AS ENUM (
    'GOVERNMENT_ID',
    'PROPERTY_TAX',
    'DEED_TITLE',
    'MORTGAGE_STATEMENT',
    'BANK_STATEMENT',
    'INSURANCE_POLICY',
    'ASSESSMENT_RECORD',
    'PURCHASE_AGREEMENT',
    'OTHER'
);


--
-- Name: PMCApprovalStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PMCApprovalStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'CANCELLED'
);


--
-- Name: PMCApprovalType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PMCApprovalType" AS ENUM (
    'EXPENSE',
    'WORK_ORDER',
    'MAINTENANCE_REQUEST',
    'TENANT_REQUEST',
    'LEASE_MODIFICATION',
    'VENDOR_ASSIGNMENT',
    'CONTRACTOR_ASSIGNMENT',
    'OTHER'
);


--
-- Name: PermissionAction; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PermissionAction" AS ENUM (
    'CREATE',
    'READ',
    'UPDATE',
    'DELETE',
    'APPROVE',
    'SUBMIT',
    'VIEW',
    'MANAGE',
    'ASSIGN',
    'EXPORT',
    'SEND',
    'UPLOAD',
    'DOWNLOAD'
);


--
-- Name: PlanType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PlanType" AS ENUM (
    'FREE',
    'STARTER',
    'PROFESSIONAL',
    'ENTERPRISE',
    'CUSTOM'
);


--
-- Name: RBACRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RBACRole" AS ENUM (
    'SUPER_ADMIN',
    'PLATFORM_ADMIN',
    'SUPPORT_ADMIN',
    'BILLING_ADMIN',
    'AUDIT_ADMIN',
    'PMC_ADMIN',
    'PROPERTY_MANAGER',
    'LEASING_AGENT',
    'MAINTENANCE_TECH',
    'ACCOUNTANT',
    'OWNER_LANDLORD',
    'TENANT',
    'VENDOR_SERVICE_PROVIDER'
);


--
-- Name: ResourceCategory; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ResourceCategory" AS ENUM (
    'PROPERTY_UNIT_MANAGEMENT',
    'TENANT_MANAGEMENT',
    'LEASING_APPLICATIONS',
    'RENT_PAYMENTS',
    'ACCOUNTING',
    'REPORTING_OWNER_STATEMENTS',
    'MAINTENANCE',
    'VENDOR_MANAGEMENT',
    'COMMUNICATION_MESSAGING',
    'DOCUMENT_MANAGEMENT',
    'MARKETING_LISTINGS',
    'TASK_WORKFLOW_MANAGEMENT',
    'USER_ROLE_MANAGEMENT',
    'PORTFOLIO_PROPERTY_ASSIGNMENT',
    'SYSTEM_SETTINGS'
);


--
-- Name: ScopeType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ScopeType" AS ENUM (
    'PORTFOLIO',
    'PROPERTY',
    'UNIT'
);


--
-- Name: TicketPriority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TicketPriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


--
-- Name: TicketStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TicketStatus" AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
);


--
-- Name: UnifiedVerificationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UnifiedVerificationStatus" AS ENUM (
    'PENDING',
    'VERIFIED',
    'REJECTED',
    'EXPIRED',
    'CANCELLED'
);


--
-- Name: UnifiedVerificationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UnifiedVerificationType" AS ENUM (
    'PROPERTY_OWNERSHIP',
    'TENANT_DOCUMENT',
    'APPLICATION',
    'ENTITY_APPROVAL',
    'FINANCIAL_APPROVAL',
    'INSPECTION',
    'OTHER'
);


--
-- Name: VerificationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VerificationStatus" AS ENUM (
    'PENDING',
    'VERIFIED',
    'REJECTED',
    'EXPIRED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ActivityLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ActivityLog" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "userEmail" text NOT NULL,
    "userName" text NOT NULL,
    "userRole" text NOT NULL,
    "userType" text,
    action text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text NOT NULL,
    "entityName" text,
    description text,
    metadata jsonb,
    "propertyId" text,
    "landlordId" text,
    "tenantId" text,
    "pmcId" text,
    "vendorId" text,
    "contractorId" text,
    "approvalRequestId" text,
    "conversationId" text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Admin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Admin" (
    id text NOT NULL,
    email text NOT NULL,
    "googleId" text,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    phone text,
    role public."AdminRole" DEFAULT 'PLATFORM_ADMIN'::public."AdminRole" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isLocked" boolean DEFAULT false NOT NULL,
    "lastLoginAt" timestamp(3) without time zone,
    "lastLoginIp" text,
    "allowedGoogleDomains" text[],
    "ipWhitelist" text[],
    "requireIpWhitelist" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text
);


--
-- Name: AdminAuditLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AdminAuditLog" (
    id text NOT NULL,
    "adminId" text,
    action text NOT NULL,
    resource text,
    "resourceId" text,
    "targetUserId" text,
    "targetUserRole" text,
    "targetEntityType" text,
    "targetEntityId" text,
    "approvalType" text,
    "approvalEntityId" text,
    "beforeState" jsonb,
    "afterState" jsonb,
    "changedFields" text[],
    details jsonb,
    "ipAddress" text,
    "userAgent" text,
    success boolean NOT NULL,
    "errorMessage" text,
    "googleEmail" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: AdminPermission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AdminPermission" (
    id text NOT NULL,
    "adminId" text NOT NULL,
    resource text NOT NULL,
    action text NOT NULL,
    conditions jsonb
);


--
-- Name: AdminSession; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AdminSession" (
    id text NOT NULL,
    "adminId" text NOT NULL,
    token text NOT NULL,
    "refreshToken" text,
    "googleAccessToken" text,
    "googleRefreshToken" text,
    "ipAddress" text NOT NULL,
    "userAgent" text NOT NULL,
    "deviceFingerprint" text,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "lastActivityAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isRevoked" boolean DEFAULT false NOT NULL
);


--
-- Name: ApiKey; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ApiKey" (
    id text NOT NULL,
    name text NOT NULL,
    key text NOT NULL,
    "keyHash" text NOT NULL,
    permissions text[],
    "rateLimit" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastUsedAt" timestamp(3) without time zone,
    "lastUsedIp" text,
    "expiresAt" timestamp(3) without time zone,
    "createdBy" text NOT NULL,
    "createdByEmail" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Application; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Application" (
    id text NOT NULL,
    "unitId" text NOT NULL,
    "propertyId" text NOT NULL,
    "applicantId" text,
    "applicantEmail" text NOT NULL,
    "applicantName" text NOT NULL,
    "applicantPhone" text,
    "coApplicantIds" text[],
    status text DEFAULT 'draft'::text NOT NULL,
    deadline timestamp(3) without time zone NOT NULL,
    "screeningRequested" boolean DEFAULT false NOT NULL,
    "screeningRequestedAt" timestamp(3) without time zone,
    "screeningProvider" text,
    "screeningStatus" text,
    "screeningData" jsonb,
    "approvedAt" timestamp(3) without time zone,
    "approvedBy" text,
    "approvedByType" text,
    "approvedByEmail" text,
    "approvedByName" text,
    "rejectedAt" timestamp(3) without time zone,
    "rejectedBy" text,
    "rejectedByType" text,
    "rejectedByEmail" text,
    "rejectedByName" text,
    "rejectionReason" text,
    "leaseId" text,
    "applicationData" jsonb,
    metadata jsonb,
    "isArchived" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ApprovalRequest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ApprovalRequest" (
    id text NOT NULL,
    "workflowType" public."ApprovalWorkflowType" NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text NOT NULL,
    "requestedBy" text NOT NULL,
    "requestedByType" text NOT NULL,
    "requestedByEmail" text,
    "requestedByName" text,
    "requestedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status public."ApprovalRequestStatus" DEFAULT 'PENDING'::public."ApprovalRequestStatus" NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    approvers jsonb NOT NULL,
    "approvedBy" text,
    "approvedByType" text,
    "approvedByEmail" text,
    "approvedByName" text,
    "approvedAt" timestamp(3) without time zone,
    "approvalNotes" text,
    "rejectedBy" text,
    "rejectedByType" text,
    "rejectedByEmail" text,
    "rejectedByName" text,
    "rejectedAt" timestamp(3) without time zone,
    "rejectionReason" text,
    "beforeState" jsonb,
    "afterState" jsonb,
    metadata jsonb,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: BankReconciliation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BankReconciliation" (
    id text NOT NULL,
    "reconciliationDate" timestamp(3) without time zone NOT NULL,
    "pmcId" text,
    "landlordId" text,
    "propertyId" text,
    "startingBalance" double precision NOT NULL,
    "endingBalance" double precision NOT NULL,
    "matchedPayments" jsonb NOT NULL,
    "matchedExpenses" jsonb NOT NULL,
    "unmatchedPayments" jsonb NOT NULL,
    "unmatchedExpenses" jsonb NOT NULL,
    "reconciledAmount" double precision NOT NULL,
    difference double precision NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    "reconciledBy" text,
    "reconciledByType" text,
    "reconciledByEmail" text,
    "reconciledByName" text,
    "reconciledAt" timestamp(3) without time zone,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ContentItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContentItem" (
    id text NOT NULL,
    type public."ContentType" NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    slug text,
    "isPublished" boolean DEFAULT false NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    "parentId" text,
    metadata jsonb,
    "createdBy" text NOT NULL,
    "createdByEmail" text NOT NULL,
    "updatedBy" text,
    "updatedByEmail" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Conversation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Conversation" (
    id text NOT NULL,
    "propertyId" text NOT NULL,
    "landlordId" text NOT NULL,
    "tenantId" text NOT NULL,
    "pmcId" text,
    subject text NOT NULL,
    "conversationType" public."ConversationType" DEFAULT 'LANDLORD_TENANT'::public."ConversationType" NOT NULL,
    status public."ConversationStatus" DEFAULT 'ACTIVE'::public."ConversationStatus" NOT NULL,
    "linkedEntityType" text,
    "linkedEntityId" text,
    "createdBy" text NOT NULL,
    "createdByLandlordId" text,
    "createdByTenantId" text,
    "createdByPMCId" text,
    "lastMessageAt" timestamp(3) without time zone,
    "lastMessageId" text,
    "landlordLastReadAt" timestamp(3) without time zone,
    "tenantLastReadAt" timestamp(3) without time zone,
    "pmcLastReadAt" timestamp(3) without time zone,
    "notifyLandlord" boolean DEFAULT true NOT NULL,
    "notifyTenant" boolean DEFAULT true NOT NULL,
    "notifyPMC" boolean DEFAULT false NOT NULL,
    metadata jsonb,
    priority text,
    tags text[],
    participants jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ConversationParticipant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ConversationParticipant" (
    id text NOT NULL,
    "conversationId" text NOT NULL,
    "participantId" text NOT NULL,
    "participantType" text NOT NULL,
    "participantRole" text DEFAULT 'PARTICIPANT'::text NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastReadAt" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL
);


--
-- Name: Country; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Country" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "currencyCode" text,
    "currencySymbol" text,
    "dateFormat" text DEFAULT 'YYYY-MM-DD'::text,
    "timeFormat" text DEFAULT '24h'::text,
    "legalSystem" text
);


--
-- Name: Document; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Document" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "propertyId" text,
    "fileName" text NOT NULL,
    "originalName" text NOT NULL,
    "fileType" text NOT NULL,
    "fileSize" integer NOT NULL,
    category text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    "storagePath" text NOT NULL,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "canLandlordDelete" boolean DEFAULT true NOT NULL,
    "canTenantDelete" boolean DEFAULT true NOT NULL,
    "expirationDate" timestamp(3) without time zone,
    "isRequired" boolean DEFAULT false NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "reminderSent" boolean DEFAULT false NOT NULL,
    "reminderSentAt" timestamp(3) without time zone,
    subcategory text,
    tags text[],
    "uploadedBy" text NOT NULL,
    "uploadedByEmail" text NOT NULL,
    "uploadedByName" text NOT NULL,
    "verifiedAt" timestamp(3) without time zone,
    "verifiedBy" text,
    visibility text DEFAULT 'shared'::text NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "deletedByEmail" text,
    "deletedByName" text,
    "deletionReason" text,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "verifiedByName" text,
    "verifiedByRole" text,
    "documentHash" text,
    metadata text,
    "isRejected" boolean DEFAULT false NOT NULL,
    "rejectedAt" timestamp(3) without time zone,
    "rejectedBy" text,
    "rejectedByName" text,
    "rejectedByRole" text,
    "rejectionReason" text,
    "verificationComment" text
);


--
-- Name: DocumentAuditLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DocumentAuditLog" (
    id text NOT NULL,
    "documentId" text NOT NULL,
    action text NOT NULL,
    "performedBy" text NOT NULL,
    "performedByEmail" text NOT NULL,
    "performedByName" text NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    details text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: DocumentMessage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DocumentMessage" (
    id text NOT NULL,
    "documentId" text NOT NULL,
    message text NOT NULL,
    "senderRole" text NOT NULL,
    "senderEmail" text NOT NULL,
    "senderName" text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: EmergencyContact; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EmergencyContact" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "contactName" text NOT NULL,
    email text,
    phone text NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Employer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Employer" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "employerName" text NOT NULL,
    "employerAddress" text,
    income double precision,
    "isCurrent" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: EmploymentDocument; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EmploymentDocument" (
    id text NOT NULL,
    "employerId" text NOT NULL,
    "fileName" text NOT NULL,
    "filePath" text NOT NULL,
    "fileSize" integer,
    "mimeType" text,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Eviction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Eviction" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "leaseId" text NOT NULL,
    "propertyId" text NOT NULL,
    "unitId" text NOT NULL,
    "initiatedBy" text NOT NULL,
    "initiatedByType" text NOT NULL,
    "initiatedByEmail" text NOT NULL,
    "initiatedByName" text NOT NULL,
    "initiatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reason text NOT NULL,
    "reasonDetails" text,
    "ltbFormType" text,
    "ltbFormId" text,
    "ltbCaseNumber" text,
    status text DEFAULT 'initiated'::text NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    "approvedBy" text,
    "approvedByEmail" text,
    "approvedByName" text,
    "ltbFiledAt" timestamp(3) without time zone,
    "hearingDate" timestamp(3) without time zone,
    "hearingOutcome" text,
    "evictedAt" timestamp(3) without time zone,
    "cancelledAt" timestamp(3) without time zone,
    "cancelledBy" text,
    "cancelledReason" text,
    documents jsonb,
    "trackingData" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Expense; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Expense" (
    id text NOT NULL,
    "propertyId" text,
    "maintenanceRequestId" text,
    category text NOT NULL,
    amount double precision NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    description text NOT NULL,
    "receiptUrl" text,
    "paidTo" text,
    "paymentMethod" text,
    "isRecurring" boolean DEFAULT false NOT NULL,
    "recurringFrequency" text,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdByPMC" boolean DEFAULT false NOT NULL,
    "pmcId" text,
    "pmcApprovalRequestId" text
);


--
-- Name: FailedLoginAttempt; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FailedLoginAttempt" (
    id text NOT NULL,
    email text NOT NULL,
    "ipAddress" text NOT NULL,
    "userAgent" text,
    "attemptType" text NOT NULL,
    reason text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: FinancialSnapshot; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FinancialSnapshot" (
    id text NOT NULL,
    month text NOT NULL,
    "propertyId" text,
    "totalIncome" double precision NOT NULL,
    "totalExpenses" double precision NOT NULL,
    "netIncome" double precision NOT NULL,
    "occupancyRate" double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: GeneratedForm; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."GeneratedForm" (
    id text NOT NULL,
    "formType" text NOT NULL,
    "tenantId" text,
    "leaseId" text,
    "propertyId" text,
    "unitId" text,
    "generatedBy" text NOT NULL,
    "generatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "formData" jsonb NOT NULL,
    "pdfUrl" text,
    status text DEFAULT 'draft'::text NOT NULL,
    notes text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: InspectionChecklist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."InspectionChecklist" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "leaseId" text,
    "propertyId" text,
    "unitId" text,
    "checklistType" text NOT NULL,
    "inspectionDate" timestamp(3) without time zone,
    status text DEFAULT 'pending'::text NOT NULL,
    "submittedAt" timestamp(3) without time zone,
    "approvedAt" timestamp(3) without time zone,
    "approvedBy" text,
    "approvedByName" text,
    "rejectionReason" text,
    "rejectedAt" timestamp(3) without time zone,
    "rejectedBy" text,
    "rejectedByName" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: InspectionChecklistItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."InspectionChecklistItem" (
    id text NOT NULL,
    "checklistId" text NOT NULL,
    "itemId" text NOT NULL,
    "itemLabel" text NOT NULL,
    category text NOT NULL,
    "isChecked" boolean DEFAULT false NOT NULL,
    notes text,
    photos jsonb,
    "landlordNotes" text,
    "landlordApproval" text,
    "landlordApprovedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Invitation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Invitation" (
    id text NOT NULL,
    email text NOT NULL,
    token text NOT NULL,
    type text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "invitedBy" text NOT NULL,
    "invitedByRole" text NOT NULL,
    "invitedByName" text,
    "invitedByEmail" text,
    "invitedByAdminId" text,
    "invitedByLandlordId" text,
    "invitedByPMCId" text,
    "invitationSource" text,
    "landlordId" text,
    "tenantId" text,
    "vendorId" text,
    "contractorId" text,
    "serviceProviderId" text,
    "pmcId" text,
    "propertyId" text,
    "unitId" text,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "openedAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "reminderSentAt" timestamp(3) without time zone,
    "reminderCount" integer DEFAULT 0 NOT NULL,
    "approvedBy" text,
    "approvedAt" timestamp(3) without time zone,
    "rejectedBy" text,
    "rejectedAt" timestamp(3) without time zone,
    "rejectionReason" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Landlord; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Landlord" (
    id text NOT NULL,
    "landlordId" text NOT NULL,
    "firstName" text NOT NULL,
    "middleName" text,
    "lastName" text NOT NULL,
    email text NOT NULL,
    phone text,
    "addressLine1" text,
    "addressLine2" text,
    city text,
    "provinceState" text,
    "postalZip" text,
    country text,
    "organizationId" text,
    "countryCode" text,
    "regionCode" text,
    timezone text DEFAULT 'America/Toronto'::text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    theme text DEFAULT 'default'::text,
    "signatureFileName" text,
    "approvalStatus" public."ApprovalStatus" DEFAULT 'PENDING'::public."ApprovalStatus" NOT NULL,
    "approvedBy" text,
    "approvedAt" timestamp(3) without time zone,
    "rejectedBy" text,
    "rejectedAt" timestamp(3) without time zone,
    "rejectionReason" text,
    "invitedBy" text,
    "invitedAt" timestamp(3) without time zone
);


--
-- Name: LandlordServiceProvider; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LandlordServiceProvider" (
    id text NOT NULL,
    "landlordId" text NOT NULL,
    "providerId" text NOT NULL,
    "addedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "addedBy" text NOT NULL,
    notes text
);


--
-- Name: LateFee; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LateFee" (
    id text NOT NULL,
    "rentPaymentId" text NOT NULL,
    "ruleId" text,
    "feeAmount" double precision NOT NULL,
    "feeType" text NOT NULL,
    "calculatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "appliedAt" timestamp(3) without time zone,
    "isPaid" boolean DEFAULT false NOT NULL,
    "paidAt" timestamp(3) without time zone,
    "paidAmount" double precision,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: LateFeeRule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LateFeeRule" (
    id text NOT NULL,
    "landlordId" text,
    "pmcId" text,
    name text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "feeType" text NOT NULL,
    "feeAmount" double precision,
    "feePercent" double precision,
    "dailyRate" double precision,
    "gracePeriodDays" integer DEFAULT 0 NOT NULL,
    "maxFeeAmount" double precision,
    "applyToPartialPayments" boolean DEFAULT true NOT NULL,
    "compoundDaily" boolean DEFAULT false NOT NULL,
    "autoApply" boolean DEFAULT true NOT NULL,
    "autoApplyAfter" integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Lease; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Lease" (
    id text NOT NULL,
    "unitId" text NOT NULL,
    "leaseStart" timestamp(3) without time zone NOT NULL,
    "leaseEnd" timestamp(3) without time zone,
    "rentAmount" double precision NOT NULL,
    "rentDueDay" integer DEFAULT 1 NOT NULL,
    "securityDeposit" double precision,
    "paymentMethod" text,
    status text DEFAULT 'Active'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "renewalReminderSent" boolean DEFAULT false NOT NULL,
    "renewalReminderSentAt" timestamp(3) without time zone,
    "renewalDecision" text,
    "renewalDecisionAt" timestamp(3) without time zone,
    "renewalDecisionBy" text
);


--
-- Name: LeaseDocument; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LeaseDocument" (
    id text NOT NULL,
    "leaseId" text NOT NULL,
    "fileName" text NOT NULL,
    "originalName" text NOT NULL,
    "fileType" text NOT NULL,
    "fileSize" integer NOT NULL,
    description text,
    "storagePath" text NOT NULL,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: LeaseTenant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LeaseTenant" (
    "leaseId" text NOT NULL,
    "tenantId" text NOT NULL,
    "isPrimaryTenant" boolean DEFAULT false NOT NULL,
    "addedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Listing; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Listing" (
    id text NOT NULL,
    "propertyId" text NOT NULL,
    "unitId" text,
    title text NOT NULL,
    description text,
    photos text[],
    pricing jsonb,
    availability timestamp(3) without time zone,
    status text DEFAULT 'draft'::text NOT NULL,
    "createdBy" text NOT NULL,
    "createdByType" text NOT NULL,
    "createdByEmail" text NOT NULL,
    "createdByName" text NOT NULL,
    "isSyndicated" boolean DEFAULT false NOT NULL,
    "syndicatedTo" text[],
    "syndicationStatus" jsonb,
    "lastEditedAt" timestamp(3) without time zone,
    "lastEditedBy" text,
    metadata jsonb,
    "publishedAt" timestamp(3) without time zone,
    "expiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: MaintenanceComment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MaintenanceComment" (
    id text NOT NULL,
    "maintenanceRequestId" text NOT NULL,
    "authorEmail" text NOT NULL,
    "authorName" text NOT NULL,
    "authorRole" text NOT NULL,
    comment text NOT NULL,
    "isStatusUpdate" boolean DEFAULT false NOT NULL,
    "oldStatus" text,
    "newStatus" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: MaintenanceRequest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MaintenanceRequest" (
    id text NOT NULL,
    "propertyId" text NOT NULL,
    "tenantId" text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    priority text DEFAULT 'Medium'::text NOT NULL,
    status text DEFAULT 'New'::text NOT NULL,
    "requestedDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedDate" timestamp(3) without time zone,
    "tenantApproved" boolean DEFAULT false NOT NULL,
    "landlordApproved" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "ticketNumber" text,
    "initiatedBy" text DEFAULT 'tenant'::text NOT NULL,
    "lastViewedByLandlord" timestamp(3) without time zone,
    "lastViewedByTenant" timestamp(3) without time zone,
    "actualCost" double precision,
    "afterPhotos" jsonb,
    "assignedToVendorId" text,
    "assignedToProviderId" text,
    "beforePhotos" jsonb,
    "completionNotes" text,
    "estimatedCost" double precision,
    photos jsonb,
    rating integer,
    "scheduledDate" timestamp(3) without time zone,
    "tenantFeedback" text,
    "createdByPMC" boolean DEFAULT false NOT NULL,
    "pmcId" text,
    "pmcApprovalRequestId" text
);


--
-- Name: Message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Message" (
    id text NOT NULL,
    "conversationId" text NOT NULL,
    "senderId" text NOT NULL,
    "senderLandlordId" text,
    "senderTenantId" text,
    "senderPMCId" text,
    "senderRole" text NOT NULL,
    "messageText" text NOT NULL,
    attachments jsonb,
    "readByLandlord" boolean DEFAULT false NOT NULL,
    "readByTenant" boolean DEFAULT false NOT NULL,
    "readByPMC" boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: MessageAttachment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MessageAttachment" (
    id text NOT NULL,
    "messageId" text NOT NULL,
    "fileName" text NOT NULL,
    "originalName" text NOT NULL,
    "fileType" text NOT NULL,
    "fileSize" integer NOT NULL,
    "storagePath" text NOT NULL,
    "mimeType" text,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: MessageNotification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MessageNotification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "messageId" text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone
);


--
-- Name: Organization; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Organization" (
    id text NOT NULL,
    name text NOT NULL,
    subdomain text,
    plan public."PlanType" DEFAULT 'FREE'::public."PlanType" NOT NULL,
    status public."OrganizationStatus" DEFAULT 'ACTIVE'::public."OrganizationStatus" NOT NULL,
    "subscriptionId" text,
    "subscriptionStatus" text,
    "currentPeriodStart" timestamp(3) without time zone,
    "currentPeriodEnd" timestamp(3) without time zone,
    "cancelAtPeriodEnd" boolean DEFAULT false NOT NULL,
    "maxProperties" integer,
    "maxTenants" integer,
    "maxUsers" integer,
    "maxStorageGB" integer,
    "maxApiCallsPerMonth" integer,
    "billingEmail" text,
    "billingAddress" text,
    "billingCity" text,
    "billingState" text,
    "billingPostalCode" text,
    "billingCountry" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "trialEndsAt" timestamp(3) without time zone
);


--
-- Name: OrganizationSettings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OrganizationSettings" (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    "logoUrl" text,
    "primaryColor" text DEFAULT '#1890ff'::text,
    "secondaryColor" text DEFAULT '#52c41a'::text,
    "companyName" text,
    features jsonb,
    integrations jsonb,
    "emailNotifications" boolean DEFAULT true NOT NULL,
    "smsNotifications" boolean DEFAULT false NOT NULL,
    "customDomain" text,
    "customCss" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: OwnerPayout; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OwnerPayout" (
    id text NOT NULL,
    "payoutDate" timestamp(3) without time zone NOT NULL,
    "payoutPeriodStart" timestamp(3) without time zone NOT NULL,
    "payoutPeriodEnd" timestamp(3) without time zone NOT NULL,
    "landlordId" text NOT NULL,
    "propertyId" text,
    "pmcId" text,
    "totalRent" double precision NOT NULL,
    "totalExpenses" double precision NOT NULL,
    commission double precision NOT NULL,
    "netAmount" double precision NOT NULL,
    "paymentTerms" text DEFAULT 'NET_30'::text NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    "approvedBy" text,
    "approvedByType" text,
    "approvedByEmail" text,
    "approvedByName" text,
    "paidAt" timestamp(3) without time zone,
    "paidBy" text,
    "paidByType" text,
    "paidByEmail" text,
    "paidByName" text,
    "paymentMethod" text,
    "paymentReference" text,
    "approvalRequestId" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: OwnerStatement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OwnerStatement" (
    id text NOT NULL,
    "statementDate" timestamp(3) without time zone NOT NULL,
    "statementPeriodStart" timestamp(3) without time zone NOT NULL,
    "statementPeriodEnd" timestamp(3) without time zone NOT NULL,
    "statementType" text NOT NULL,
    "landlordId" text NOT NULL,
    "propertyId" text,
    "totalIncome" double precision NOT NULL,
    "totalExpenses" double precision NOT NULL,
    "netProfit" double precision NOT NULL,
    commission double precision NOT NULL,
    "incomeBreakdown" jsonb,
    "expenseBreakdown" jsonb,
    "templateId" text,
    "customFields" jsonb,
    status text DEFAULT 'draft'::text NOT NULL,
    "generatedBy" text,
    "generatedByType" text,
    "generatedByEmail" text,
    "generatedByName" text,
    "generatedAt" timestamp(3) without time zone,
    "sentAt" timestamp(3) without time zone,
    "viewedAt" timestamp(3) without time zone,
    "pdfPath" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: PMCLandlord; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PMCLandlord" (
    id text NOT NULL,
    "pmcId" text NOT NULL,
    "landlordId" text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endedAt" timestamp(3) without time zone,
    "contractTerms" jsonb,
    notes text
);


--
-- Name: PMCLandlordApproval; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PMCLandlordApproval" (
    id text NOT NULL,
    "pmcLandlordId" text NOT NULL,
    "approvalType" public."PMCApprovalType" NOT NULL,
    status public."PMCApprovalStatus" DEFAULT 'PENDING'::public."PMCApprovalStatus" NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    amount double precision,
    "requestedBy" text NOT NULL,
    "requestedByEmail" text NOT NULL,
    "requestedByName" text NOT NULL,
    "requestedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "approvedBy" text,
    "approvedByEmail" text,
    "approvedByName" text,
    "approvedAt" timestamp(3) without time zone,
    "approvalNotes" text,
    "rejectedBy" text,
    "rejectedByEmail" text,
    "rejectedByName" text,
    "rejectedAt" timestamp(3) without time zone,
    "rejectionReason" text,
    "cancelledBy" text,
    "cancelledByEmail" text,
    "cancelledByName" text,
    "cancelledAt" timestamp(3) without time zone,
    "cancellationReason" text,
    metadata jsonb,
    attachments jsonb
);


--
-- Name: PartialPayment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PartialPayment" (
    id text NOT NULL,
    "rentPaymentId" text NOT NULL,
    amount double precision NOT NULL,
    "paidDate" timestamp(3) without time zone NOT NULL,
    "paymentMethod" text,
    "referenceNumber" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Property; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Property" (
    id text NOT NULL,
    "propertyId" text NOT NULL,
    "landlordId" text NOT NULL,
    "organizationId" text,
    "propertyName" text,
    "addressLine1" text NOT NULL,
    "addressLine2" text,
    city text NOT NULL,
    "provinceState" text NOT NULL,
    "postalZip" text NOT NULL,
    country text NOT NULL,
    "countryCode" text,
    "regionCode" text,
    "propertyType" text,
    "unitCount" integer DEFAULT 1 NOT NULL,
    "yearBuilt" integer,
    "purchasePrice" double precision,
    rent double precision,
    rented text DEFAULT 'No'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "depositAmount" double precision,
    "interestRate" double precision,
    "mortgageAmount" double precision,
    "mortgageTermYears" integer,
    "mortgageStartDate" timestamp(3) without time zone,
    "paymentFrequency" text DEFAULT 'biweekly'::text,
    "squareFootage" integer,
    "propertyDescription" text,
    "propertyTaxes" double precision,
    latitude double precision,
    longitude double precision
);


--
-- Name: PropertyManagementCompany; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PropertyManagementCompany" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "companyName" text NOT NULL,
    email text NOT NULL,
    phone text,
    "addressLine1" text,
    "addressLine2" text,
    city text,
    "provinceState" text,
    "postalZip" text,
    country text,
    "countryCode" text,
    "regionCode" text,
    "defaultCommissionRate" double precision,
    "commissionStructure" jsonb,
    "approvalStatus" public."ApprovalStatus" DEFAULT 'PENDING'::public."ApprovalStatus" NOT NULL,
    "approvedBy" text,
    "approvedAt" timestamp(3) without time zone,
    "rejectedBy" text,
    "rejectedAt" timestamp(3) without time zone,
    "rejectionReason" text,
    "invitedBy" text,
    "invitedAt" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: PropertyOwnershipVerification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PropertyOwnershipVerification" (
    id text NOT NULL,
    "pmcLandlordId" text NOT NULL,
    "landlordId" text NOT NULL,
    "propertyId" text,
    "documentType" public."OwnershipDocumentType" NOT NULL,
    "fileName" text NOT NULL,
    "originalName" text NOT NULL,
    "fileUrl" text NOT NULL,
    "fileSize" integer NOT NULL,
    "mimeType" text,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "uploadedBy" text NOT NULL,
    "uploadedByEmail" text NOT NULL,
    "uploadedByName" text NOT NULL,
    status public."VerificationStatus" DEFAULT 'PENDING'::public."VerificationStatus" NOT NULL,
    "verifiedAt" timestamp(3) without time zone,
    "verifiedBy" text,
    "verifiedByEmail" text,
    "verifiedByName" text,
    "verificationNotes" text,
    "rejectedAt" timestamp(3) without time zone,
    "rejectedBy" text,
    "rejectedByEmail" text,
    "rejectedByName" text,
    "rejectionReason" text,
    "expirationDate" timestamp(3) without time zone,
    "documentNumber" text,
    "issuedBy" text,
    "issuedDate" timestamp(3) without time zone,
    metadata jsonb,
    notes text
);


--
-- Name: PropertyOwnershipVerificationHistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PropertyOwnershipVerificationHistory" (
    id text NOT NULL,
    "verificationId" text NOT NULL,
    action text NOT NULL,
    "performedBy" text NOT NULL,
    "performedByEmail" text NOT NULL,
    "performedByName" text NOT NULL,
    "performedByRole" text NOT NULL,
    "previousStatus" public."VerificationStatus",
    "newStatus" public."VerificationStatus",
    notes text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: RBACAuditLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RBACAuditLog" (
    id text NOT NULL,
    "userId" text,
    "userType" text,
    "userEmail" text,
    "userName" text,
    action text NOT NULL,
    resource text,
    "resourceId" text,
    "roleId" text,
    "permissionId" text,
    "scopeId" text,
    "beforeState" jsonb,
    "afterState" jsonb,
    details jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: RecurringMaintenance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RecurringMaintenance" (
    id text NOT NULL,
    "propertyId" text NOT NULL,
    "unitId" text,
    title text NOT NULL,
    description text NOT NULL,
    frequency text NOT NULL,
    "lastCompletedDate" timestamp(3) without time zone,
    "nextDueDate" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ReferenceData; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ReferenceData" (
    id text NOT NULL,
    category text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    color text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Region; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Region" (
    id text NOT NULL,
    "countryCode" text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    timezone text,
    "utcOffset" integer,
    latitude double precision,
    longitude double precision,
    "currencyCode" text,
    "taxRate" double precision,
    "legalFramework" text,
    "rentControl" boolean DEFAULT false,
    "evictionRules" jsonb
);


--
-- Name: RentPayment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RentPayment" (
    id text NOT NULL,
    "leaseId" text NOT NULL,
    amount double precision NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "paidDate" timestamp(3) without time zone,
    "paymentMethod" text,
    "referenceNumber" text,
    status text DEFAULT 'Unpaid'::text NOT NULL,
    notes text,
    "receiptNumber" text,
    "receiptSent" boolean DEFAULT false NOT NULL,
    "receiptSentAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "overdueReminderSent" boolean DEFAULT false NOT NULL,
    "overdueReminderSentAt" timestamp(3) without time zone,
    "reminderSent" boolean DEFAULT false NOT NULL,
    "reminderSentAt" timestamp(3) without time zone
);


--
-- Name: Role; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Role" (
    id text NOT NULL,
    name public."RBACRole" NOT NULL,
    "displayName" text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "isSystem" boolean DEFAULT false NOT NULL,
    "createdBy" text,
    "createdByPMCId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: RolePermission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RolePermission" (
    id text NOT NULL,
    "roleId" text NOT NULL,
    category public."ResourceCategory" NOT NULL,
    resource text NOT NULL,
    action public."PermissionAction" NOT NULL,
    conditions jsonb
);


--
-- Name: Scope; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Scope" (
    id text NOT NULL,
    type public."ScopeType" NOT NULL,
    name text NOT NULL,
    "parentId" text,
    "portfolioId" text,
    "propertyId" text,
    "unitId" text,
    "pmcId" text,
    metadata jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SecurityDeposit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SecurityDeposit" (
    id text NOT NULL,
    "leaseId" text NOT NULL,
    "tenantId" text NOT NULL,
    "propertyId" text NOT NULL,
    "unitId" text,
    amount double precision NOT NULL,
    "depositType" text NOT NULL,
    status text DEFAULT 'held'::text NOT NULL,
    "heldInEscrow" boolean DEFAULT false NOT NULL,
    "escrowAccount" text,
    "refundedAmount" double precision,
    "refundedAt" timestamp(3) without time zone,
    "refundedBy" text,
    "refundedByType" text,
    "refundedByEmail" text,
    "refundedByName" text,
    "approvalRequestId" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ServiceProvider; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ServiceProvider" (
    id text NOT NULL,
    "providerId" text NOT NULL,
    type text NOT NULL,
    name text NOT NULL,
    "businessName" text,
    "contactName" text,
    "licenseNumber" text,
    email text NOT NULL,
    phone text NOT NULL,
    category text,
    specialties text[],
    "addressLine1" text,
    "addressLine2" text,
    city text,
    "provinceState" text,
    "postalZip" text,
    country text,
    "countryCode" text,
    "regionCode" text,
    latitude double precision,
    longitude double precision,
    rating double precision,
    "hourlyRate" double precision,
    notes text,
    "isGlobal" boolean DEFAULT false NOT NULL,
    "invitedBy" text,
    "invitedByRole" text,
    "approvedBy" text,
    "approvedAt" timestamp(3) without time zone,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "deletedByRole" text,
    "deletionReason" text,
    "retainedName" text,
    "retainedEmail" text,
    "retainedPhone" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: StripeCustomer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StripeCustomer" (
    id text NOT NULL,
    "stripeCustomerId" text NOT NULL,
    "userId" text NOT NULL,
    "userRole" text NOT NULL,
    "userEmail" text NOT NULL,
    name text,
    email text,
    phone text,
    "defaultPaymentMethodId" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: StripePayment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StripePayment" (
    id text NOT NULL,
    "rentPaymentId" text NOT NULL,
    "stripePaymentIntentId" text NOT NULL,
    "stripeCustomerId" text,
    "stripeChargeId" text,
    amount double precision NOT NULL,
    currency text DEFAULT 'usd'::text NOT NULL,
    status text NOT NULL,
    "paymentMethod" text,
    last4 text,
    brand text,
    metadata jsonb,
    "receiptUrl" text,
    "webhookReceived" boolean DEFAULT false NOT NULL,
    "webhookReceivedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SupportTicket; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SupportTicket" (
    id text NOT NULL,
    "ticketNumber" text NOT NULL,
    subject text NOT NULL,
    description text NOT NULL,
    priority public."TicketPriority" DEFAULT 'MEDIUM'::public."TicketPriority" NOT NULL,
    status public."TicketStatus" DEFAULT 'OPEN'::public."TicketStatus" NOT NULL,
    "propertyId" text,
    "createdBy" text NOT NULL,
    "createdByEmail" text NOT NULL,
    "createdByName" text NOT NULL,
    "createdByRole" text NOT NULL,
    "createdByLandlordId" text,
    "createdByTenantId" text,
    "assignedTo" text,
    "assignedToEmail" text,
    "assignedToName" text,
    "assignedToAdminId" text,
    "assignedToLandlordId" text,
    "assignedToPMCId" text,
    "contractorId" text,
    "vendorId" text,
    "serviceProviderId" text,
    "resolvedAt" timestamp(3) without time zone,
    "resolvedBy" text,
    resolution text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SystemAnnouncement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SystemAnnouncement" (
    id text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "targetAudience" text[],
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "createdBy" text NOT NULL,
    "createdByEmail" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Task; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Task" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "propertyId" text,
    title text NOT NULL,
    description text,
    type text NOT NULL,
    category text NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "isCompleted" boolean DEFAULT false NOT NULL,
    "completedAt" timestamp(3) without time zone,
    priority text DEFAULT 'medium'::text NOT NULL,
    "linkedEntityType" text,
    "linkedEntityId" text,
    "reminderDays" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: TaskReminder; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TaskReminder" (
    id text NOT NULL,
    "taskId" text NOT NULL,
    "reminderDate" timestamp(3) without time zone NOT NULL,
    "isSent" boolean DEFAULT false NOT NULL,
    "sentAt" timestamp(3) without time zone
);


--
-- Name: Tenant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Tenant" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text NOT NULL,
    phone text,
    country text,
    "provinceState" text,
    "countryCode" text,
    "regionCode" text,
    "dateOfBirth" timestamp(3) without time zone,
    "currentAddress" text,
    city text,
    "numberOfAdults" integer,
    "numberOfChildren" integer,
    "moveInDate" timestamp(3) without time zone,
    "leaseTerm" text,
    "emergencyContactName" text,
    "emergencyContactPhone" text,
    "employmentStatus" text,
    "monthlyIncome" double precision,
    "invitationToken" text,
    "invitationSentAt" timestamp(3) without time zone,
    "invitedBy" text,
    "hasAccess" boolean DEFAULT false NOT NULL,
    "lastLoginAt" timestamp(3) without time zone,
    timezone text DEFAULT 'America/New_York'::text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "middleName" text,
    "postalZip" text,
    theme text DEFAULT 'default'::text,
    "approvalStatus" public."ApprovalStatus" DEFAULT 'PENDING'::public."ApprovalStatus" NOT NULL,
    "approvedBy" text,
    "approvedAt" timestamp(3) without time zone,
    "rejectedBy" text,
    "rejectedAt" timestamp(3) without time zone,
    "rejectionReason" text
);


--
-- Name: TenantInvitation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TenantInvitation" (
    id text NOT NULL,
    "tenantId" text,
    email text NOT NULL,
    token text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "invitedBy" text NOT NULL,
    "propertyId" text,
    "unitId" text,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "openedAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "reminderSentAt" timestamp(3) without time zone,
    "reminderCount" integer DEFAULT 0 NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: TenantRating; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TenantRating" (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "ratedBy" text NOT NULL,
    "ratedByType" text NOT NULL,
    "ratedByEmail" text NOT NULL,
    "ratedByName" text NOT NULL,
    "workOrderId" text,
    "propertyId" text,
    "unitId" text,
    "paymentBehavior" integer NOT NULL,
    "propertyCare" integer NOT NULL,
    communication integer NOT NULL,
    overall double precision NOT NULL,
    review text,
    "tenantResponse" text,
    "tenantRespondedAt" timestamp(3) without time zone,
    status text DEFAULT 'active'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: TicketAttachment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TicketAttachment" (
    id text NOT NULL,
    "ticketId" text NOT NULL,
    "fileName" text NOT NULL,
    "originalName" text NOT NULL,
    "fileType" text NOT NULL,
    "fileSize" integer NOT NULL,
    "storagePath" text NOT NULL,
    "uploadedBy" text NOT NULL,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TicketNote; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TicketNote" (
    id text NOT NULL,
    "ticketId" text NOT NULL,
    content text NOT NULL,
    "isInternal" boolean DEFAULT false NOT NULL,
    "createdBy" text NOT NULL,
    "createdByEmail" text NOT NULL,
    "createdByName" text NOT NULL,
    "createdByRole" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: UnifiedVerification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UnifiedVerification" (
    id text NOT NULL,
    "verificationType" public."UnifiedVerificationType" NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text NOT NULL,
    "requestedBy" text NOT NULL,
    "requestedByRole" text NOT NULL,
    "requestedByEmail" text NOT NULL,
    "requestedByName" text NOT NULL,
    "assignedTo" text,
    "assignedToRole" text,
    "assignedToEmail" text,
    "assignedToName" text,
    "verifiedBy" text,
    "verifiedByRole" text,
    "verifiedByEmail" text,
    "verifiedByName" text,
    status public."UnifiedVerificationStatus" DEFAULT 'PENDING'::public."UnifiedVerificationStatus" NOT NULL,
    priority text DEFAULT 'normal'::text NOT NULL,
    "requestedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "verifiedAt" timestamp(3) without time zone,
    "rejectedAt" timestamp(3) without time zone,
    "expiredAt" timestamp(3) without time zone,
    "cancelledAt" timestamp(3) without time zone,
    "dueDate" timestamp(3) without time zone,
    title text NOT NULL,
    description text,
    notes text,
    "verificationNotes" text,
    "rejectionReason" text,
    "fileName" text,
    "originalName" text,
    "fileUrl" text,
    "fileSize" integer,
    "mimeType" text,
    metadata jsonb
);


--
-- Name: UnifiedVerificationHistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UnifiedVerificationHistory" (
    id text NOT NULL,
    "verificationId" text NOT NULL,
    action text NOT NULL,
    "performedBy" text NOT NULL,
    "performedByRole" text NOT NULL,
    "performedByEmail" text NOT NULL,
    "performedByName" text NOT NULL,
    "previousStatus" public."UnifiedVerificationStatus",
    "newStatus" public."UnifiedVerificationStatus",
    notes text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Unit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Unit" (
    id text NOT NULL,
    "propertyId" text NOT NULL,
    "unitName" text NOT NULL,
    "floorNumber" integer,
    bedrooms integer,
    bathrooms double precision,
    "rentPrice" double precision,
    "depositAmount" double precision,
    status text DEFAULT 'Vacant'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: UserActivity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserActivity" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "userEmail" text NOT NULL,
    "userName" text NOT NULL,
    "userRole" text NOT NULL,
    action text NOT NULL,
    resource text,
    "resourceId" text,
    "ipAddress" text,
    "userAgent" text,
    details jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: UserPermission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserPermission" (
    id text NOT NULL,
    "userRoleId" text NOT NULL,
    category public."ResourceCategory" NOT NULL,
    resource text NOT NULL,
    action public."PermissionAction" NOT NULL,
    conditions jsonb,
    "isGranted" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: UserRole; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserRole" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "userType" text NOT NULL,
    "roleId" text NOT NULL,
    "portfolioId" text,
    "propertyId" text,
    "unitId" text,
    "pmcId" text,
    "landlordId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "assignedBy" text,
    "expiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: VendorRating; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."VendorRating" (
    id text NOT NULL,
    "vendorId" text NOT NULL,
    "ratedBy" text NOT NULL,
    "ratedByType" text NOT NULL,
    "ratedByEmail" text NOT NULL,
    "ratedByName" text NOT NULL,
    "workOrderId" text,
    "maintenanceRequestId" text,
    "propertyId" text,
    "unitId" text,
    quality integer NOT NULL,
    timeliness integer NOT NULL,
    communication integer NOT NULL,
    professionalism integer NOT NULL,
    overall double precision NOT NULL,
    review text,
    "vendorResponse" text,
    "vendorRespondedAt" timestamp(3) without time zone,
    status text DEFAULT 'active'::text NOT NULL,
    "isBlocked" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_logs (
    id bigint NOT NULL,
    user_id character varying(100) NOT NULL,
    user_email character varying(254) NOT NULL,
    user_name character varying(255) NOT NULL,
    user_role character varying(20) NOT NULL,
    user_type character varying(50),
    action character varying(50) NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id character varying(100) NOT NULL,
    entity_name character varying(255),
    description text,
    metadata jsonb,
    property_id character varying(100),
    landlord_id character varying(100),
    tenant_id character varying(100),
    pmc_id character varying(100),
    vendor_id character varying(100),
    contractor_id character varying(100),
    approval_request_id character varying(100),
    conversation_id character varying(100),
    ip_address inet,
    user_agent character varying(500),
    created_at timestamp with time zone NOT NULL
);


--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.activity_logs ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.activity_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: admin_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_audit_logs (
    id bigint NOT NULL,
    action character varying(100) NOT NULL,
    resource character varying(100),
    resource_id character varying(100),
    target_user_id character varying(100),
    target_user_role character varying(50),
    target_entity_type character varying(50),
    target_entity_id character varying(100),
    approval_type character varying(50),
    approval_entity_id character varying(100),
    before_state jsonb,
    after_state jsonb,
    changed_fields jsonb NOT NULL,
    details jsonb,
    ip_address character varying(45),
    user_agent character varying(255),
    success boolean NOT NULL,
    error_message text,
    google_email character varying(254),
    created_at timestamp with time zone NOT NULL,
    admin_id bigint
);


--
-- Name: admin_audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.admin_audit_logs ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.admin_audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admins (
    id bigint NOT NULL,
    email character varying(254) NOT NULL,
    google_id character varying(255),
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    phone character varying(20),
    role character varying(30) NOT NULL,
    is_active boolean NOT NULL,
    is_locked boolean NOT NULL,
    allowed_google_domains jsonb NOT NULL,
    ip_whitelist jsonb NOT NULL,
    require_ip_whitelist boolean NOT NULL,
    last_login_at timestamp with time zone,
    last_login_ip character varying(45),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: admins_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.admins ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.admins_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.applications (
    id bigint NOT NULL,
    applicant_id character varying(100),
    applicant_email character varying(254) NOT NULL,
    applicant_name character varying(255) NOT NULL,
    applicant_phone character varying(20),
    co_applicant_ids jsonb NOT NULL,
    status character varying(20) NOT NULL,
    deadline timestamp with time zone NOT NULL,
    screening_requested boolean NOT NULL,
    screening_requested_at timestamp with time zone,
    screening_provider character varying(100),
    screening_status character varying(20),
    screening_data jsonb,
    approved_at timestamp with time zone,
    approved_by character varying(100),
    approved_by_type character varying(20),
    approved_by_email character varying(254),
    approved_by_name character varying(255),
    rejected_at timestamp with time zone,
    rejected_by character varying(100),
    rejected_by_type character varying(20),
    rejected_by_email character varying(254),
    rejected_by_name character varying(255),
    rejection_reason text,
    application_data jsonb,
    metadata jsonb,
    is_archived boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    lease_id bigint,
    property_id uuid NOT NULL,
    unit_id uuid NOT NULL
);


--
-- Name: applications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.applications ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.applications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_group (
    id integer NOT NULL,
    name character varying(150) NOT NULL
);


--
-- Name: auth_group_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.auth_group ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_group_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_group_permissions (
    id bigint NOT NULL,
    group_id integer NOT NULL,
    permission_id integer NOT NULL
);


--
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.auth_group_permissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_group_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_permission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_permission (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    content_type_id integer NOT NULL,
    codename character varying(100) NOT NULL
);


--
-- Name: auth_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.auth_permission ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_permission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_user (
    id integer NOT NULL,
    password character varying(128) NOT NULL,
    last_login timestamp with time zone,
    is_superuser boolean NOT NULL,
    username character varying(150) NOT NULL,
    first_name character varying(150) NOT NULL,
    last_name character varying(150) NOT NULL,
    email character varying(254) NOT NULL,
    is_staff boolean NOT NULL,
    is_active boolean NOT NULL,
    date_joined timestamp with time zone NOT NULL
);


--
-- Name: auth_user_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_user_groups (
    id bigint NOT NULL,
    user_id integer NOT NULL,
    group_id integer NOT NULL
);


--
-- Name: auth_user_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.auth_user_groups ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_user_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.auth_user ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_user_user_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_user_user_permissions (
    id bigint NOT NULL,
    user_id integer NOT NULL,
    permission_id integer NOT NULL
);


--
-- Name: auth_user_user_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.auth_user_user_permissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_user_user_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id bigint NOT NULL,
    subject character varying(255) NOT NULL,
    conversation_type character varying(30) NOT NULL,
    status character varying(20) NOT NULL,
    linked_entity_type character varying(50),
    linked_entity_id character varying(100),
    created_by character varying(100) NOT NULL,
    last_message_at timestamp with time zone,
    landlord_last_read_at timestamp with time zone,
    tenant_last_read_at timestamp with time zone,
    pmc_last_read_at timestamp with time zone,
    notify_landlord boolean NOT NULL,
    notify_tenant boolean NOT NULL,
    notify_pmc boolean NOT NULL,
    metadata jsonb,
    priority character varying(20),
    tags jsonb NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    created_by_landlord_id bigint,
    created_by_pmc_id bigint,
    created_by_tenant_id bigint,
    landlord_id bigint NOT NULL,
    last_message_id bigint,
    pmc_id bigint,
    property_id uuid NOT NULL,
    tenant_id bigint NOT NULL
);


--
-- Name: conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.conversations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.conversations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_admin_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.django_admin_log (
    id integer NOT NULL,
    action_time timestamp with time zone NOT NULL,
    object_id text,
    object_repr character varying(200) NOT NULL,
    action_flag smallint NOT NULL,
    change_message text NOT NULL,
    content_type_id integer,
    user_id integer NOT NULL,
    CONSTRAINT django_admin_log_action_flag_check CHECK ((action_flag >= 0))
);


--
-- Name: django_admin_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.django_admin_log ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_admin_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_content_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.django_content_type (
    id integer NOT NULL,
    app_label character varying(100) NOT NULL,
    model character varying(100) NOT NULL
);


--
-- Name: django_content_type_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.django_content_type ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_content_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.django_migrations (
    id bigint NOT NULL,
    app character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    applied timestamp with time zone NOT NULL
);


--
-- Name: django_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.django_migrations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_migrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.django_session (
    session_key character varying(40) NOT NULL,
    session_data text NOT NULL,
    expire_date timestamp with time zone NOT NULL
);


--
-- Name: document_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_audit_logs (
    id bigint NOT NULL,
    action character varying(100) NOT NULL,
    performed_by character varying(100) NOT NULL,
    performed_by_email character varying(254) NOT NULL,
    performed_by_name character varying(255) NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    details text,
    created_at timestamp with time zone NOT NULL,
    document_id bigint NOT NULL
);


--
-- Name: document_audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.document_audit_logs ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.document_audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: document_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_messages (
    id bigint NOT NULL,
    message text NOT NULL,
    sender_role character varying(50) NOT NULL,
    sender_email character varying(254) NOT NULL,
    sender_name character varying(255) NOT NULL,
    is_read boolean NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    document_id bigint NOT NULL
);


--
-- Name: document_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.document_messages ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.document_messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id bigint NOT NULL,
    file_name character varying(255) NOT NULL,
    original_name character varying(255) NOT NULL,
    file_type character varying(50) NOT NULL,
    file_size integer NOT NULL,
    storage_path character varying(500) NOT NULL,
    category character varying(100) NOT NULL,
    subcategory character varying(100),
    description text NOT NULL,
    tags jsonb NOT NULL,
    metadata text,
    uploaded_by character varying(100) NOT NULL,
    uploaded_by_email character varying(254) NOT NULL,
    uploaded_by_name character varying(255) NOT NULL,
    uploaded_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    can_landlord_delete boolean NOT NULL,
    can_tenant_delete boolean NOT NULL,
    visibility character varying(20) NOT NULL,
    is_verified boolean NOT NULL,
    verified_at timestamp with time zone,
    verified_by character varying(100),
    verified_by_name character varying(255),
    verified_by_role character varying(50),
    verification_comment text,
    is_rejected boolean NOT NULL,
    rejected_at timestamp with time zone,
    rejected_by character varying(100),
    rejected_by_name character varying(255),
    rejected_by_role character varying(50),
    rejection_reason text,
    expiration_date timestamp with time zone,
    is_required boolean NOT NULL,
    reminder_sent boolean NOT NULL,
    reminder_sent_at timestamp with time zone,
    is_deleted boolean NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by character varying(100),
    deleted_by_email character varying(254),
    deleted_by_name character varying(255),
    deletion_reason text,
    document_hash character varying(255),
    property_id uuid,
    tenant_id bigint NOT NULL
);


--
-- Name: documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.documents ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expenses (
    id bigint NOT NULL,
    expense_id character varying(50) NOT NULL,
    property_id character varying(50) NOT NULL,
    category character varying(50) NOT NULL,
    amount numeric(10,2) NOT NULL,
    expense_date date NOT NULL,
    description text NOT NULL,
    vendor character varying(200),
    payment_method character varying(50),
    reference_number character varying(100),
    receipt_url character varying(500),
    status character varying(20) NOT NULL,
    maintenance_request_id character varying(50),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    recorded_by character varying(50)
);


--
-- Name: expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.expenses ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.expenses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: inspection_checklist_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inspection_checklist_items (
    id bigint NOT NULL,
    item_id character varying(100) NOT NULL,
    item_label character varying(255) NOT NULL,
    category character varying(50) NOT NULL,
    is_checked boolean NOT NULL,
    notes text,
    photos jsonb,
    landlord_notes text,
    landlord_approval character varying(20),
    landlord_approved_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    checklist_id bigint NOT NULL
);


--
-- Name: inspection_checklist_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.inspection_checklist_items ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.inspection_checklist_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: inspection_checklists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inspection_checklists (
    id bigint NOT NULL,
    checklist_type character varying(20) NOT NULL,
    inspection_date timestamp with time zone,
    status character varying(20) NOT NULL,
    submitted_at timestamp with time zone,
    approved_at timestamp with time zone,
    approved_by character varying(100),
    approved_by_name character varying(255),
    rejection_reason text,
    rejected_at timestamp with time zone,
    rejected_by character varying(100),
    rejected_by_name character varying(255),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    lease_id bigint,
    property_id uuid,
    tenant_id bigint NOT NULL,
    unit_id uuid
);


--
-- Name: inspection_checklists_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.inspection_checklists ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.inspection_checklists_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: invitations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invitations (
    id bigint NOT NULL,
    email character varying(254) NOT NULL,
    token character varying(255) NOT NULL,
    invitation_type character varying(30) NOT NULL,
    status character varying(20) NOT NULL,
    invited_by character varying(100) NOT NULL,
    invited_by_role character varying(20) NOT NULL,
    invited_by_name character varying(255),
    invited_by_email character varying(254),
    message text,
    expires_at timestamp with time zone,
    sent_at timestamp with time zone,
    opened_at timestamp with time zone,
    completed_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    metadata jsonb,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    invited_by_admin_id bigint,
    invited_by_landlord_id bigint,
    invited_by_pmc_id bigint,
    approved_at timestamp with time zone,
    approved_by character varying(100),
    landlord_id character varying(100),
    pmc_id character varying(100),
    property_id character varying(100),
    rejected_at timestamp with time zone,
    rejected_by character varying(100),
    rejection_reason text,
    service_provider_id character varying(100),
    tenant_id character varying(100),
    unit_id character varying(100)
);


--
-- Name: invitations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.invitations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.invitations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: landlords; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.landlords (
    id bigint NOT NULL,
    landlord_id character varying(100) NOT NULL,
    first_name character varying(100) NOT NULL,
    middle_name character varying(100),
    last_name character varying(100) NOT NULL,
    email character varying(254) NOT NULL,
    phone character varying(20),
    address_line1 character varying(255),
    address_line2 character varying(255),
    city character varying(100),
    province_state character varying(100),
    postal_zip character varying(20),
    country character varying(100),
    country_code character varying(2),
    region_code character varying(10),
    organization_id character varying(100),
    timezone character varying(50) NOT NULL,
    theme character varying(50) NOT NULL,
    signature_file_name character varying(255),
    approval_status character varying(20) NOT NULL,
    approved_by character varying(100),
    approved_at timestamp with time zone,
    rejected_by character varying(100),
    rejected_at timestamp with time zone,
    rejection_reason text,
    invited_by character varying(100),
    invited_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: landlords_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.landlords ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.landlords_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: lease_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lease_documents (
    id bigint NOT NULL,
    document_id character varying(50) NOT NULL,
    file_name character varying(255) NOT NULL,
    original_name character varying(255) NOT NULL,
    file_type character varying(50) NOT NULL,
    file_size integer NOT NULL,
    storage_path character varying(500) NOT NULL,
    description text,
    uploaded_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    lease_id bigint NOT NULL
);


--
-- Name: lease_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.lease_documents ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.lease_documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: lease_tenants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lease_tenants (
    id bigint NOT NULL,
    is_primary_tenant boolean NOT NULL,
    added_at timestamp with time zone NOT NULL,
    lease_id bigint NOT NULL,
    tenant_id bigint NOT NULL
);


--
-- Name: lease_tenants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.lease_tenants ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.lease_tenants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: lease_terminations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lease_terminations (
    id bigint NOT NULL,
    termination_id character varying(50) NOT NULL,
    initiated_by character varying(50) NOT NULL,
    reason text NOT NULL,
    termination_date date NOT NULL,
    actual_loss numeric(10,2),
    form_type character varying(10) NOT NULL,
    status character varying(20) NOT NULL,
    approved_by character varying(50),
    approved_at timestamp with time zone,
    rejected_by character varying(50),
    rejected_at timestamp with time zone,
    rejection_reason text,
    completed_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    lease_id bigint NOT NULL
);


--
-- Name: lease_terminations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.lease_terminations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.lease_terminations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: leases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leases (
    id bigint NOT NULL,
    lease_id character varying(50) NOT NULL,
    lease_start date NOT NULL,
    lease_end date,
    rent_amount numeric(10,2) NOT NULL,
    rent_due_day integer NOT NULL,
    security_deposit numeric(10,2),
    payment_method character varying(50),
    status character varying(20) NOT NULL,
    renewal_reminder_sent boolean NOT NULL,
    renewal_reminder_sent_at timestamp with time zone,
    renewal_decision character varying(20),
    renewal_decision_at timestamp with time zone,
    renewal_decision_by character varying(50),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    unit_id uuid NOT NULL
);


--
-- Name: leases_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.leases ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.leases_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ltb_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ltb_documents (
    id bigint NOT NULL,
    form_number character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    category character varying(50) NOT NULL,
    audience character varying(20) NOT NULL,
    pdf_url character varying(500) NOT NULL,
    instruction_url character varying(500),
    country character varying(2) NOT NULL,
    province character varying(10) NOT NULL,
    is_active boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: ltb_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.ltb_documents ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.ltb_documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: maintenance_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maintenance_comments (
    id bigint NOT NULL,
    comment_id character varying(50) NOT NULL,
    author_email character varying(254) NOT NULL,
    author_name character varying(200) NOT NULL,
    author_role character varying(20) NOT NULL,
    comment text NOT NULL,
    is_status_update boolean NOT NULL,
    old_status character varying(20),
    new_status character varying(20),
    created_at timestamp with time zone NOT NULL,
    maintenance_request_id bigint NOT NULL
);


--
-- Name: maintenance_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.maintenance_comments ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.maintenance_comments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: maintenance_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maintenance_requests (
    id bigint NOT NULL,
    request_id character varying(50) NOT NULL,
    ticket_number character varying(50),
    title character varying(255) NOT NULL,
    description text NOT NULL,
    category character varying(50) NOT NULL,
    priority character varying(20) NOT NULL,
    status character varying(20) NOT NULL,
    initiated_by character varying(20) NOT NULL,
    requested_date timestamp with time zone NOT NULL,
    scheduled_date timestamp with time zone,
    completed_date timestamp with time zone,
    assigned_to_vendor_id character varying(50),
    assigned_to_provider_id character varying(50),
    estimated_cost numeric(10,2),
    actual_cost numeric(10,2),
    tenant_approved boolean NOT NULL,
    landlord_approved boolean NOT NULL,
    created_by_pmc boolean NOT NULL,
    pmc_id character varying(50),
    photos jsonb,
    before_photos jsonb,
    after_photos jsonb,
    completion_notes text,
    rating integer,
    tenant_feedback text,
    last_viewed_by_landlord timestamp with time zone,
    last_viewed_by_tenant timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    property_id uuid NOT NULL,
    tenant_id bigint NOT NULL
);


--
-- Name: maintenance_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.maintenance_requests ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.maintenance_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: message_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_attachments (
    id bigint NOT NULL,
    file_name character varying(255) NOT NULL,
    original_name character varying(255) NOT NULL,
    file_type character varying(50) NOT NULL,
    file_size integer NOT NULL,
    storage_path character varying(500) NOT NULL,
    mime_type character varying(100),
    uploaded_at timestamp with time zone NOT NULL,
    message_id bigint NOT NULL
);


--
-- Name: message_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.message_attachments ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.message_attachments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id bigint NOT NULL,
    sender_id character varying(100) NOT NULL,
    sender_role character varying(20) NOT NULL,
    message_text text NOT NULL,
    is_edited boolean NOT NULL,
    edited_at timestamp with time zone,
    is_read boolean NOT NULL,
    read_by_landlord boolean NOT NULL,
    read_by_tenant boolean NOT NULL,
    read_by_pmc boolean NOT NULL,
    read_at_landlord timestamp with time zone,
    read_at_tenant timestamp with time zone,
    read_at_pmc timestamp with time zone,
    is_deleted boolean NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by character varying(100),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    conversation_id bigint NOT NULL,
    sender_landlord_id bigint,
    sender_pmc_id bigint,
    sender_tenant_id bigint
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.messages ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification (
    id text NOT NULL,
    "userId" text NOT NULL,
    "userRole" text NOT NULL,
    "userEmail" text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    priority text DEFAULT 'normal'::text NOT NULL,
    "entityType" text,
    "entityId" text,
    "verificationId" text,
    "isRead" boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    "isArchived" boolean DEFAULT false NOT NULL,
    "archivedAt" timestamp(3) without time zone,
    "emailSent" boolean DEFAULT false NOT NULL,
    "emailSentAt" timestamp(3) without time zone,
    "smsSent" boolean DEFAULT false NOT NULL,
    "smsSentAt" timestamp(3) without time zone,
    "pushSent" boolean DEFAULT false NOT NULL,
    "pushSentAt" timestamp(3) without time zone,
    "actionUrl" text,
    "actionLabel" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: notification_preference; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_preference (
    id text NOT NULL,
    "userId" text NOT NULL,
    "userRole" text NOT NULL,
    "userEmail" text NOT NULL,
    "notificationType" text NOT NULL,
    "emailEnabled" boolean DEFAULT true NOT NULL,
    "smsEnabled" boolean DEFAULT false NOT NULL,
    "pushEnabled" boolean DEFAULT true NOT NULL,
    "sendBeforeDays" integer,
    "sendOnDay" boolean DEFAULT true NOT NULL,
    "sendAfterDays" integer,
    "quietHoursStart" text,
    "quietHoursEnd" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_preferences (
    id bigint NOT NULL,
    user_id character varying(100) NOT NULL,
    user_role character varying(20) NOT NULL,
    user_email character varying(254) NOT NULL,
    notification_type character varying(50) NOT NULL,
    email_enabled boolean NOT NULL,
    sms_enabled boolean NOT NULL,
    push_enabled boolean NOT NULL,
    send_before_days integer,
    send_on_day boolean NOT NULL,
    send_after_days integer,
    quiet_hours_start character varying(5),
    quiet_hours_end character varying(5),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: notification_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.notification_preferences ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.notification_preferences_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    user_id character varying(100) NOT NULL,
    user_role character varying(20) NOT NULL,
    user_email character varying(254) NOT NULL,
    notification_type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    priority character varying(20) NOT NULL,
    entity_type character varying(50),
    entity_id character varying(100),
    verification_id character varying(100),
    is_read boolean NOT NULL,
    read_at timestamp with time zone,
    is_sent boolean NOT NULL,
    sent_at timestamp with time zone,
    email_sent boolean NOT NULL,
    email_sent_at timestamp with time zone,
    sms_sent boolean NOT NULL,
    sms_sent_at timestamp with time zone,
    push_sent boolean NOT NULL,
    push_sent_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    expires_at timestamp with time zone
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.notifications ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: organization_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization_settings (
    id bigint NOT NULL,
    logo_url character varying(500),
    primary_color character varying(7) NOT NULL,
    secondary_color character varying(7) NOT NULL,
    company_name character varying(255),
    features jsonb,
    integrations jsonb,
    email_notifications boolean NOT NULL,
    sms_notifications boolean NOT NULL,
    custom_domain character varying(255),
    custom_css text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    organization_id bigint NOT NULL
);


--
-- Name: organization_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.organization_settings ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.organization_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizations (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    subdomain character varying(100),
    plan character varying(20) NOT NULL,
    status character varying(20) NOT NULL,
    subscription_id character varying(255),
    subscription_status character varying(50),
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    cancel_at_period_end boolean NOT NULL,
    max_properties integer,
    max_tenants integer,
    max_users integer,
    max_storage_gb integer,
    max_api_calls_per_month integer,
    billing_email character varying(254),
    billing_address character varying(255),
    billing_city character varying(100),
    billing_state character varying(100),
    billing_postal_code character varying(20),
    billing_country character varying(100),
    trial_ends_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: organizations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.organizations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.organizations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id bigint NOT NULL,
    category character varying(50) NOT NULL,
    resource character varying(100) NOT NULL,
    action character varying(20) NOT NULL,
    conditions jsonb,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.permissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: platform_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_settings (
    id text DEFAULT 'platform_settings'::text NOT NULL,
    "maintenanceMode" boolean DEFAULT false NOT NULL,
    "featureFlags" jsonb,
    email jsonb,
    notifications jsonb,
    stripe jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: properties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.properties (
    id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    property_name character varying(255) NOT NULL,
    address_line1 character varying(255) NOT NULL,
    address_line2 character varying(255) NOT NULL,
    city character varying(100) NOT NULL,
    province_state character varying(100) NOT NULL,
    postal_zip character varying(20) NOT NULL,
    country character varying(100) NOT NULL,
    property_type character varying(50) NOT NULL,
    unit_count integer NOT NULL,
    year_built integer,
    square_footage numeric(10,2),
    lot_size numeric(10,2),
    purchase_price numeric(15,2),
    purchase_date date,
    assessed_value numeric(15,2),
    description text NOT NULL,
    notes text NOT NULL,
    image_url character varying(500) NOT NULL,
    status character varying(20) NOT NULL,
    landlord_id character varying(100) NOT NULL,
    pmc_id character varying(100)
);


--
-- Name: property_expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.property_expenses (
    id bigint NOT NULL,
    category character varying(100) NOT NULL,
    amount numeric(10,2) NOT NULL,
    date date NOT NULL,
    description text NOT NULL,
    receipt_url character varying(200),
    paid_to character varying(255),
    payment_method character varying(50),
    is_recurring boolean NOT NULL,
    recurring_frequency character varying(20),
    created_by character varying(100) NOT NULL,
    created_by_pmc boolean NOT NULL,
    pmc_id character varying(100),
    pmc_approval_request_id character varying(100),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    maintenance_request_id bigint,
    property_id uuid
);


--
-- Name: property_expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.property_expenses ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.property_expenses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: property_management_companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.property_management_companies (
    id bigint NOT NULL,
    company_id character varying(100) NOT NULL,
    company_name character varying(255) NOT NULL,
    email character varying(254) NOT NULL,
    phone character varying(20),
    address_line1 character varying(255),
    address_line2 character varying(255),
    city character varying(100),
    province_state character varying(100),
    postal_zip character varying(20),
    country character varying(100),
    country_code character varying(2),
    region_code character varying(10),
    default_commission_rate numeric(5,2),
    commission_structure jsonb,
    is_active boolean NOT NULL,
    approval_status character varying(20) NOT NULL,
    approved_by character varying(100),
    approved_at timestamp with time zone,
    rejected_by character varying(100),
    rejected_at timestamp with time zone,
    rejection_reason text,
    invited_by character varying(100),
    invited_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: property_management_companies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.property_management_companies ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.property_management_companies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rent_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rent_payments (
    id bigint NOT NULL,
    payment_id character varying(50) NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_date date NOT NULL,
    payment_method character varying(50) NOT NULL,
    payment_for_month date NOT NULL,
    status character varying(20) NOT NULL,
    reference_number character varying(100),
    notes text,
    receipt_url character varying(500),
    is_late boolean NOT NULL,
    late_fee numeric(10,2),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    recorded_by character varying(50),
    lease_id bigint NOT NULL
);


--
-- Name: rent_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.rent_payments ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.rent_payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    id bigint NOT NULL,
    conditions jsonb,
    permission_id bigint NOT NULL,
    role_id bigint NOT NULL
);


--
-- Name: role_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.role_permissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.role_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    name character varying(50) NOT NULL,
    display_name character varying(100) NOT NULL,
    description text,
    is_active boolean NOT NULL,
    is_system boolean NOT NULL,
    created_by character varying(100),
    created_by_pmc_id character varying(100),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.roles ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: security_deposits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.security_deposits (
    id bigint NOT NULL,
    deposit_id character varying(50) NOT NULL,
    amount numeric(10,2) NOT NULL,
    received_date date NOT NULL,
    payment_method character varying(50) NOT NULL,
    status character varying(20) NOT NULL,
    return_date date,
    amount_returned numeric(10,2),
    amount_deducted numeric(10,2),
    deduction_reason text,
    receipt_url character varying(500),
    return_receipt_url character varying(500),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    lease_id bigint NOT NULL
);


--
-- Name: security_deposits_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.security_deposits ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.security_deposits_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: service_provider_ratings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_provider_ratings (
    id bigint NOT NULL,
    rated_by character varying(100) NOT NULL,
    rated_by_type character varying(20) NOT NULL,
    rated_by_email character varying(254) NOT NULL,
    rated_by_name character varying(255) NOT NULL,
    work_order_id character varying(100),
    maintenance_request_id character varying(100),
    property_id character varying(100),
    unit_id character varying(100),
    quality integer NOT NULL,
    timeliness integer NOT NULL,
    communication integer NOT NULL,
    professionalism integer NOT NULL,
    overall_rating numeric(3,2) NOT NULL,
    review_text text,
    is_public boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    service_provider_id bigint NOT NULL
);


--
-- Name: service_provider_ratings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.service_provider_ratings ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.service_provider_ratings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: service_providers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_providers (
    id bigint NOT NULL,
    provider_id character varying(100) NOT NULL,
    provider_type character varying(20) NOT NULL,
    company_name character varying(255),
    contact_name character varying(255) NOT NULL,
    email character varying(254) NOT NULL,
    phone character varying(20),
    address_line1 character varying(255),
    address_line2 character varying(255),
    city character varying(100),
    province_state character varying(100),
    postal_zip character varying(20),
    country character varying(100),
    country_code character varying(2),
    region_code character varying(10),
    tax_id character varying(50),
    license_number character varying(100),
    insurance_info text,
    services jsonb NOT NULL,
    specialties jsonb NOT NULL,
    is_active boolean NOT NULL,
    is_verified boolean NOT NULL,
    verified_at timestamp with time zone,
    verified_by character varying(100),
    approval_status character varying(20) NOT NULL,
    approved_by character varying(100),
    approved_at timestamp with time zone,
    rejected_by character varying(100),
    rejected_at timestamp with time zone,
    rejection_reason text,
    invited_by character varying(100),
    invited_by_role character varying(20),
    invited_at timestamp with time zone,
    average_rating numeric(3,2),
    total_ratings integer NOT NULL,
    notes text,
    metadata jsonb,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: service_providers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.service_providers ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.service_providers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_tickets (
    id bigint NOT NULL,
    ticket_number character varying(50) NOT NULL,
    subject character varying(255) NOT NULL,
    description text NOT NULL,
    priority character varying(20) NOT NULL,
    status character varying(20) NOT NULL,
    created_by character varying(100) NOT NULL,
    created_by_email character varying(254) NOT NULL,
    created_by_name character varying(255) NOT NULL,
    created_by_role character varying(20) NOT NULL,
    assigned_to character varying(100),
    assigned_to_email character varying(254),
    assigned_to_name character varying(255),
    contractor_id character varying(100),
    vendor_id character varying(100),
    service_provider_id character varying(100),
    resolved_at timestamp with time zone,
    resolved_by character varying(100),
    resolution text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    assigned_to_admin_id bigint,
    assigned_to_landlord_id bigint,
    assigned_to_pmc_id bigint,
    created_by_landlord_id bigint,
    created_by_tenant_id bigint,
    property_id uuid
);


--
-- Name: support_tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.support_tickets ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.support_tickets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tenant_invitations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenant_invitations (
    id bigint NOT NULL,
    email character varying(254) NOT NULL,
    invited_by_landlord_id character varying(50) NOT NULL,
    status character varying(20) NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    sent_at timestamp with time zone NOT NULL,
    accepted_at timestamp with time zone,
    rejected_at timestamp with time zone,
    unit_id uuid NOT NULL
);


--
-- Name: tenant_invitations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tenant_invitations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.tenant_invitations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenants (
    id bigint NOT NULL,
    tenant_id character varying(50) NOT NULL,
    first_name character varying(100) NOT NULL,
    middle_name character varying(100),
    last_name character varying(100) NOT NULL,
    email character varying(254) NOT NULL,
    phone character varying(20),
    address_line1 character varying(255),
    address_line2 character varying(255),
    city character varying(100),
    province_state character varying(100),
    postal_zip character varying(20),
    country character varying(100),
    emergency_contact_name character varying(200),
    emergency_contact_phone character varying(20),
    emergency_contact_relationship character varying(50),
    employer_name character varying(200),
    employer_phone character varying(20),
    employer_address character varying(255),
    occupation character varying(100),
    annual_income numeric(12,2),
    status character varying(20) NOT NULL,
    approval_status character varying(20) NOT NULL,
    approved_at timestamp with time zone,
    rejected_at timestamp with time zone,
    rejection_reason text,
    signature_file_name character varying(255),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: tenants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tenants ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.tenants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ticket_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_attachments (
    id bigint NOT NULL,
    file_name character varying(255) NOT NULL,
    original_name character varying(255) NOT NULL,
    file_type character varying(50) NOT NULL,
    file_size integer NOT NULL,
    storage_path character varying(500) NOT NULL,
    mime_type character varying(100),
    uploaded_at timestamp with time zone NOT NULL,
    ticket_id bigint NOT NULL
);


--
-- Name: ticket_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.ticket_attachments ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.ticket_attachments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ticket_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_notes (
    id bigint NOT NULL,
    content text NOT NULL,
    created_by character varying(100) NOT NULL,
    created_by_email character varying(254) NOT NULL,
    created_by_name character varying(255) NOT NULL,
    created_by_role character varying(20) NOT NULL,
    is_internal boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    ticket_id bigint NOT NULL
);


--
-- Name: ticket_notes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.ticket_notes ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.ticket_notes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: unified_verification_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.unified_verification_history (
    id bigint NOT NULL,
    action character varying(20) NOT NULL,
    performed_by character varying(100) NOT NULL,
    performed_by_role character varying(20) NOT NULL,
    performed_by_email character varying(254) NOT NULL,
    performed_by_name character varying(255) NOT NULL,
    previous_status character varying(20),
    new_status character varying(20),
    notes text,
    metadata jsonb,
    created_at timestamp with time zone NOT NULL,
    verification_id bigint NOT NULL
);


--
-- Name: unified_verification_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.unified_verification_history ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.unified_verification_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: unified_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.unified_verifications (
    id bigint NOT NULL,
    verification_type character varying(50) NOT NULL,
    entity_type character varying(100) NOT NULL,
    entity_id character varying(100) NOT NULL,
    requested_by character varying(100) NOT NULL,
    requested_by_role character varying(20) NOT NULL,
    requested_by_email character varying(254) NOT NULL,
    requested_by_name character varying(255) NOT NULL,
    assigned_to character varying(100),
    assigned_to_role character varying(20),
    assigned_to_email character varying(254),
    assigned_to_name character varying(255),
    verified_by character varying(100),
    verified_by_role character varying(20),
    verified_by_email character varying(254),
    verified_by_name character varying(255),
    status character varying(20) NOT NULL,
    priority character varying(20) NOT NULL,
    requested_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    rejected_at timestamp with time zone,
    expired_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    due_date timestamp with time zone,
    title character varying(255) NOT NULL,
    description text,
    notes text,
    verification_notes text,
    rejection_reason text,
    file_name character varying(255),
    original_name character varying(255),
    file_url character varying(500),
    file_size integer,
    mime_type character varying(100),
    metadata jsonb,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: unified_verifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.unified_verifications ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.unified_verifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: units; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.units (
    id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    unit_name character varying(100) NOT NULL,
    bedrooms integer NOT NULL,
    bathrooms numeric(3,1) NOT NULL,
    square_feet numeric(8,2),
    floor_number integer,
    rent_price numeric(10,2) NOT NULL,
    security_deposit numeric(10,2),
    status character varying(20) NOT NULL,
    has_parking boolean NOT NULL,
    has_storage boolean NOT NULL,
    has_balcony boolean NOT NULL,
    is_furnished boolean NOT NULL,
    pets_allowed boolean NOT NULL,
    description text NOT NULL,
    notes text NOT NULL,
    property_id uuid NOT NULL
);


--
-- Name: user_activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_activities (
    id bigint NOT NULL,
    user_id character varying(100) NOT NULL,
    user_email character varying(254) NOT NULL,
    user_name character varying(255) NOT NULL,
    user_role character varying(20) NOT NULL,
    action character varying(50) NOT NULL,
    resource character varying(100),
    resource_id character varying(100),
    ip_address inet,
    user_agent character varying(500),
    details jsonb,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: user_activities_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.user_activities ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.user_activities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id bigint NOT NULL,
    user_id character varying(100) NOT NULL,
    user_type character varying(20) NOT NULL,
    scope jsonb,
    assigned_at timestamp with time zone NOT NULL,
    assigned_by character varying(100),
    role_id bigint NOT NULL,
    is_active boolean NOT NULL,
    landlord_id character varying(100),
    pmc_id character varying(100)
);


--
-- Name: user_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.user_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ActivityLog ActivityLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ActivityLog"
    ADD CONSTRAINT "ActivityLog_pkey" PRIMARY KEY (id);


--
-- Name: AdminAuditLog AdminAuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminAuditLog"
    ADD CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY (id);


--
-- Name: AdminPermission AdminPermission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminPermission"
    ADD CONSTRAINT "AdminPermission_pkey" PRIMARY KEY (id);


--
-- Name: AdminSession AdminSession_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminSession"
    ADD CONSTRAINT "AdminSession_pkey" PRIMARY KEY (id);


--
-- Name: Admin Admin_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Admin"
    ADD CONSTRAINT "Admin_pkey" PRIMARY KEY (id);


--
-- Name: ApiKey ApiKey_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ApiKey"
    ADD CONSTRAINT "ApiKey_pkey" PRIMARY KEY (id);


--
-- Name: Application Application_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Application"
    ADD CONSTRAINT "Application_pkey" PRIMARY KEY (id);


--
-- Name: ApprovalRequest ApprovalRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ApprovalRequest"
    ADD CONSTRAINT "ApprovalRequest_pkey" PRIMARY KEY (id);


--
-- Name: BankReconciliation BankReconciliation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BankReconciliation"
    ADD CONSTRAINT "BankReconciliation_pkey" PRIMARY KEY (id);


--
-- Name: ContentItem ContentItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContentItem"
    ADD CONSTRAINT "ContentItem_pkey" PRIMARY KEY (id);


--
-- Name: ConversationParticipant ConversationParticipant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ConversationParticipant"
    ADD CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY (id);


--
-- Name: Conversation Conversation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_pkey" PRIMARY KEY (id);


--
-- Name: Country Country_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Country"
    ADD CONSTRAINT "Country_pkey" PRIMARY KEY (id);


--
-- Name: DocumentAuditLog DocumentAuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DocumentAuditLog"
    ADD CONSTRAINT "DocumentAuditLog_pkey" PRIMARY KEY (id);


--
-- Name: DocumentMessage DocumentMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DocumentMessage"
    ADD CONSTRAINT "DocumentMessage_pkey" PRIMARY KEY (id);


--
-- Name: Document Document_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_pkey" PRIMARY KEY (id);


--
-- Name: EmergencyContact EmergencyContact_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmergencyContact"
    ADD CONSTRAINT "EmergencyContact_pkey" PRIMARY KEY (id);


--
-- Name: Employer Employer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Employer"
    ADD CONSTRAINT "Employer_pkey" PRIMARY KEY (id);


--
-- Name: EmploymentDocument EmploymentDocument_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmploymentDocument"
    ADD CONSTRAINT "EmploymentDocument_pkey" PRIMARY KEY (id);


--
-- Name: Eviction Eviction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Eviction"
    ADD CONSTRAINT "Eviction_pkey" PRIMARY KEY (id);


--
-- Name: Expense Expense_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_pkey" PRIMARY KEY (id);


--
-- Name: FailedLoginAttempt FailedLoginAttempt_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FailedLoginAttempt"
    ADD CONSTRAINT "FailedLoginAttempt_pkey" PRIMARY KEY (id);


--
-- Name: FinancialSnapshot FinancialSnapshot_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FinancialSnapshot"
    ADD CONSTRAINT "FinancialSnapshot_pkey" PRIMARY KEY (id);


--
-- Name: GeneratedForm GeneratedForm_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GeneratedForm"
    ADD CONSTRAINT "GeneratedForm_pkey" PRIMARY KEY (id);


--
-- Name: InspectionChecklistItem InspectionChecklistItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InspectionChecklistItem"
    ADD CONSTRAINT "InspectionChecklistItem_pkey" PRIMARY KEY (id);


--
-- Name: InspectionChecklist InspectionChecklist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InspectionChecklist"
    ADD CONSTRAINT "InspectionChecklist_pkey" PRIMARY KEY (id);


--
-- Name: Invitation Invitation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invitation"
    ADD CONSTRAINT "Invitation_pkey" PRIMARY KEY (id);


--
-- Name: LandlordServiceProvider LandlordServiceProvider_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LandlordServiceProvider"
    ADD CONSTRAINT "LandlordServiceProvider_pkey" PRIMARY KEY (id);


--
-- Name: Landlord Landlord_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Landlord"
    ADD CONSTRAINT "Landlord_pkey" PRIMARY KEY (id);


--
-- Name: LateFeeRule LateFeeRule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LateFeeRule"
    ADD CONSTRAINT "LateFeeRule_pkey" PRIMARY KEY (id);


--
-- Name: LateFee LateFee_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LateFee"
    ADD CONSTRAINT "LateFee_pkey" PRIMARY KEY (id);


--
-- Name: LeaseDocument LeaseDocument_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LeaseDocument"
    ADD CONSTRAINT "LeaseDocument_pkey" PRIMARY KEY (id);


--
-- Name: LeaseTenant LeaseTenant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LeaseTenant"
    ADD CONSTRAINT "LeaseTenant_pkey" PRIMARY KEY ("leaseId", "tenantId");


--
-- Name: Lease Lease_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lease"
    ADD CONSTRAINT "Lease_pkey" PRIMARY KEY (id);


--
-- Name: Listing Listing_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_pkey" PRIMARY KEY (id);


--
-- Name: MaintenanceComment MaintenanceComment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaintenanceComment"
    ADD CONSTRAINT "MaintenanceComment_pkey" PRIMARY KEY (id);


--
-- Name: MaintenanceRequest MaintenanceRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaintenanceRequest"
    ADD CONSTRAINT "MaintenanceRequest_pkey" PRIMARY KEY (id);


--
-- Name: MessageAttachment MessageAttachment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MessageAttachment"
    ADD CONSTRAINT "MessageAttachment_pkey" PRIMARY KEY (id);


--
-- Name: MessageNotification MessageNotification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MessageNotification"
    ADD CONSTRAINT "MessageNotification_pkey" PRIMARY KEY (id);


--
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- Name: OrganizationSettings OrganizationSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrganizationSettings"
    ADD CONSTRAINT "OrganizationSettings_pkey" PRIMARY KEY (id);


--
-- Name: Organization Organization_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Organization"
    ADD CONSTRAINT "Organization_pkey" PRIMARY KEY (id);


--
-- Name: OwnerPayout OwnerPayout_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OwnerPayout"
    ADD CONSTRAINT "OwnerPayout_pkey" PRIMARY KEY (id);


--
-- Name: OwnerStatement OwnerStatement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OwnerStatement"
    ADD CONSTRAINT "OwnerStatement_pkey" PRIMARY KEY (id);


--
-- Name: PMCLandlordApproval PMCLandlordApproval_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PMCLandlordApproval"
    ADD CONSTRAINT "PMCLandlordApproval_pkey" PRIMARY KEY (id);


--
-- Name: PMCLandlord PMCLandlord_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PMCLandlord"
    ADD CONSTRAINT "PMCLandlord_pkey" PRIMARY KEY (id);


--
-- Name: PartialPayment PartialPayment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PartialPayment"
    ADD CONSTRAINT "PartialPayment_pkey" PRIMARY KEY (id);


--
-- Name: PropertyManagementCompany PropertyManagementCompany_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PropertyManagementCompany"
    ADD CONSTRAINT "PropertyManagementCompany_pkey" PRIMARY KEY (id);


--
-- Name: PropertyOwnershipVerificationHistory PropertyOwnershipVerificationHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PropertyOwnershipVerificationHistory"
    ADD CONSTRAINT "PropertyOwnershipVerificationHistory_pkey" PRIMARY KEY (id);


--
-- Name: PropertyOwnershipVerification PropertyOwnershipVerification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PropertyOwnershipVerification"
    ADD CONSTRAINT "PropertyOwnershipVerification_pkey" PRIMARY KEY (id);


--
-- Name: Property Property_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Property"
    ADD CONSTRAINT "Property_pkey" PRIMARY KEY (id);


--
-- Name: RBACAuditLog RBACAuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RBACAuditLog"
    ADD CONSTRAINT "RBACAuditLog_pkey" PRIMARY KEY (id);


--
-- Name: RecurringMaintenance RecurringMaintenance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RecurringMaintenance"
    ADD CONSTRAINT "RecurringMaintenance_pkey" PRIMARY KEY (id);


--
-- Name: ReferenceData ReferenceData_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReferenceData"
    ADD CONSTRAINT "ReferenceData_pkey" PRIMARY KEY (id);


--
-- Name: Region Region_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Region"
    ADD CONSTRAINT "Region_pkey" PRIMARY KEY (id);


--
-- Name: RentPayment RentPayment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RentPayment"
    ADD CONSTRAINT "RentPayment_pkey" PRIMARY KEY (id);


--
-- Name: RolePermission RolePermission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_pkey" PRIMARY KEY (id);


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);


--
-- Name: Scope Scope_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Scope"
    ADD CONSTRAINT "Scope_pkey" PRIMARY KEY (id);


--
-- Name: SecurityDeposit SecurityDeposit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SecurityDeposit"
    ADD CONSTRAINT "SecurityDeposit_pkey" PRIMARY KEY (id);


--
-- Name: ServiceProvider ServiceProvider_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServiceProvider"
    ADD CONSTRAINT "ServiceProvider_pkey" PRIMARY KEY (id);


--
-- Name: StripeCustomer StripeCustomer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StripeCustomer"
    ADD CONSTRAINT "StripeCustomer_pkey" PRIMARY KEY (id);


--
-- Name: StripePayment StripePayment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StripePayment"
    ADD CONSTRAINT "StripePayment_pkey" PRIMARY KEY (id);


--
-- Name: SupportTicket SupportTicket_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_pkey" PRIMARY KEY (id);


--
-- Name: SystemAnnouncement SystemAnnouncement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SystemAnnouncement"
    ADD CONSTRAINT "SystemAnnouncement_pkey" PRIMARY KEY (id);


--
-- Name: TaskReminder TaskReminder_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TaskReminder"
    ADD CONSTRAINT "TaskReminder_pkey" PRIMARY KEY (id);


--
-- Name: Task Task_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_pkey" PRIMARY KEY (id);


--
-- Name: TenantInvitation TenantInvitation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TenantInvitation"
    ADD CONSTRAINT "TenantInvitation_pkey" PRIMARY KEY (id);


--
-- Name: TenantRating TenantRating_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TenantRating"
    ADD CONSTRAINT "TenantRating_pkey" PRIMARY KEY (id);


--
-- Name: Tenant Tenant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Tenant"
    ADD CONSTRAINT "Tenant_pkey" PRIMARY KEY (id);


--
-- Name: TicketAttachment TicketAttachment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TicketAttachment"
    ADD CONSTRAINT "TicketAttachment_pkey" PRIMARY KEY (id);


--
-- Name: TicketNote TicketNote_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TicketNote"
    ADD CONSTRAINT "TicketNote_pkey" PRIMARY KEY (id);


--
-- Name: UnifiedVerificationHistory UnifiedVerificationHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UnifiedVerificationHistory"
    ADD CONSTRAINT "UnifiedVerificationHistory_pkey" PRIMARY KEY (id);


--
-- Name: UnifiedVerification UnifiedVerification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UnifiedVerification"
    ADD CONSTRAINT "UnifiedVerification_pkey" PRIMARY KEY (id);


--
-- Name: Unit Unit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Unit"
    ADD CONSTRAINT "Unit_pkey" PRIMARY KEY (id);


--
-- Name: UserActivity UserActivity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserActivity"
    ADD CONSTRAINT "UserActivity_pkey" PRIMARY KEY (id);


--
-- Name: UserPermission UserPermission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserPermission"
    ADD CONSTRAINT "UserPermission_pkey" PRIMARY KEY (id);


--
-- Name: UserRole UserRole_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_pkey" PRIMARY KEY (id);


--
-- Name: VendorRating VendorRating_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VendorRating"
    ADD CONSTRAINT "VendorRating_pkey" PRIMARY KEY (id);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: admin_audit_logs admin_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_audit_logs
    ADD CONSTRAINT admin_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: admins admins_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_email_key UNIQUE (email);


--
-- Name: admins admins_google_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_google_id_key UNIQUE (google_id);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: auth_group auth_group_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_name_key UNIQUE (name);


--
-- Name: auth_group_permissions auth_group_permissions_group_id_permission_id_0cd325b0_uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_permission_id_0cd325b0_uniq UNIQUE (group_id, permission_id);


--
-- Name: auth_group_permissions auth_group_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_pkey PRIMARY KEY (id);


--
-- Name: auth_group auth_group_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_pkey PRIMARY KEY (id);


--
-- Name: auth_permission auth_permission_content_type_id_codename_01ab375a_uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_codename_01ab375a_uniq UNIQUE (content_type_id, codename);


--
-- Name: auth_permission auth_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_pkey PRIMARY KEY (id);


--
-- Name: auth_user_groups auth_user_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_pkey PRIMARY KEY (id);


--
-- Name: auth_user_groups auth_user_groups_user_id_group_id_94350c0c_uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_user_id_group_id_94350c0c_uniq UNIQUE (user_id, group_id);


--
-- Name: auth_user auth_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_user
    ADD CONSTRAINT auth_user_pkey PRIMARY KEY (id);


--
-- Name: auth_user_user_permissions auth_user_user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_pkey PRIMARY KEY (id);


--
-- Name: auth_user_user_permissions auth_user_user_permissions_user_id_permission_id_14a6b632_uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_user_id_permission_id_14a6b632_uniq UNIQUE (user_id, permission_id);


--
-- Name: auth_user auth_user_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_user
    ADD CONSTRAINT auth_user_username_key UNIQUE (username);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: django_admin_log django_admin_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_pkey PRIMARY KEY (id);


--
-- Name: django_content_type django_content_type_app_label_model_76bd3d3b_uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_app_label_model_76bd3d3b_uniq UNIQUE (app_label, model);


--
-- Name: django_content_type django_content_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_pkey PRIMARY KEY (id);


--
-- Name: django_migrations django_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.django_migrations
    ADD CONSTRAINT django_migrations_pkey PRIMARY KEY (id);


--
-- Name: django_session django_session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.django_session
    ADD CONSTRAINT django_session_pkey PRIMARY KEY (session_key);


--
-- Name: document_audit_logs document_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_audit_logs
    ADD CONSTRAINT document_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: document_messages document_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_messages
    ADD CONSTRAINT document_messages_pkey PRIMARY KEY (id);


--
-- Name: documents documents_document_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_document_hash_key UNIQUE (document_hash);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_expense_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_expense_id_key UNIQUE (expense_id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: inspection_checklist_items inspection_checklist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspection_checklist_items
    ADD CONSTRAINT inspection_checklist_items_pkey PRIMARY KEY (id);


--
-- Name: inspection_checklists inspection_checklists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspection_checklists
    ADD CONSTRAINT inspection_checklists_pkey PRIMARY KEY (id);


--
-- Name: invitations invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_pkey PRIMARY KEY (id);


--
-- Name: invitations invitations_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_token_key UNIQUE (token);


--
-- Name: landlords landlords_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.landlords
    ADD CONSTRAINT landlords_email_key UNIQUE (email);


--
-- Name: landlords landlords_landlord_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.landlords
    ADD CONSTRAINT landlords_landlord_id_key UNIQUE (landlord_id);


--
-- Name: landlords landlords_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.landlords
    ADD CONSTRAINT landlords_pkey PRIMARY KEY (id);


--
-- Name: lease_documents lease_documents_document_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lease_documents
    ADD CONSTRAINT lease_documents_document_id_key UNIQUE (document_id);


--
-- Name: lease_documents lease_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lease_documents
    ADD CONSTRAINT lease_documents_pkey PRIMARY KEY (id);


--
-- Name: lease_tenants lease_tenants_lease_id_tenant_id_7a0f72f6_uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lease_tenants
    ADD CONSTRAINT lease_tenants_lease_id_tenant_id_7a0f72f6_uniq UNIQUE (lease_id, tenant_id);


--
-- Name: lease_tenants lease_tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lease_tenants
    ADD CONSTRAINT lease_tenants_pkey PRIMARY KEY (id);


--
-- Name: lease_terminations lease_terminations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lease_terminations
    ADD CONSTRAINT lease_terminations_pkey PRIMARY KEY (id);


--
-- Name: lease_terminations lease_terminations_termination_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lease_terminations
    ADD CONSTRAINT lease_terminations_termination_id_key UNIQUE (termination_id);


--
-- Name: leases leases_lease_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leases
    ADD CONSTRAINT leases_lease_id_key UNIQUE (lease_id);


--
-- Name: leases leases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leases
    ADD CONSTRAINT leases_pkey PRIMARY KEY (id);


--
-- Name: ltb_documents ltb_documents_form_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ltb_documents
    ADD CONSTRAINT ltb_documents_form_number_key UNIQUE (form_number);


--
-- Name: ltb_documents ltb_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ltb_documents
    ADD CONSTRAINT ltb_documents_pkey PRIMARY KEY (id);


--
-- Name: maintenance_comments maintenance_comments_comment_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_comments
    ADD CONSTRAINT maintenance_comments_comment_id_key UNIQUE (comment_id);


--
-- Name: maintenance_comments maintenance_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_comments
    ADD CONSTRAINT maintenance_comments_pkey PRIMARY KEY (id);


--
-- Name: maintenance_requests maintenance_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT maintenance_requests_pkey PRIMARY KEY (id);


--
-- Name: maintenance_requests maintenance_requests_request_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT maintenance_requests_request_id_key UNIQUE (request_id);


--
-- Name: maintenance_requests maintenance_requests_ticket_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT maintenance_requests_ticket_number_key UNIQUE (ticket_number);


--
-- Name: message_attachments message_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_attachments
    ADD CONSTRAINT message_attachments_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- Name: notification_preference notification_preference_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preference
    ADD CONSTRAINT notification_preference_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_user_id_user_role_notifi_7d234bc5_uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_user_role_notifi_7d234bc5_uniq UNIQUE (user_id, user_role, notification_type);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: organization_settings organization_settings_custom_domain_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_settings
    ADD CONSTRAINT organization_settings_custom_domain_key UNIQUE (custom_domain);


--
-- Name: organization_settings organization_settings_organization_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_settings
    ADD CONSTRAINT organization_settings_organization_id_key UNIQUE (organization_id);


--
-- Name: organization_settings organization_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_settings
    ADD CONSTRAINT organization_settings_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_subdomain_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_subdomain_key UNIQUE (subdomain);


--
-- Name: permissions permissions_category_resource_action_a6e17b7f_uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_category_resource_action_a6e17b7f_uniq UNIQUE (category, resource, action);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: platform_settings platform_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_settings
    ADD CONSTRAINT platform_settings_pkey PRIMARY KEY (id);


--
-- Name: properties properties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_pkey PRIMARY KEY (id);


--
-- Name: property_expenses property_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_expenses
    ADD CONSTRAINT property_expenses_pkey PRIMARY KEY (id);


--
-- Name: property_expenses property_expenses_pmc_approval_request_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_expenses
    ADD CONSTRAINT property_expenses_pmc_approval_request_id_key UNIQUE (pmc_approval_request_id);


--
-- Name: property_management_companies property_management_companies_company_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_management_companies
    ADD CONSTRAINT property_management_companies_company_id_key UNIQUE (company_id);


--
-- Name: property_management_companies property_management_companies_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_management_companies
    ADD CONSTRAINT property_management_companies_email_key UNIQUE (email);


--
-- Name: property_management_companies property_management_companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_management_companies
    ADD CONSTRAINT property_management_companies_pkey PRIMARY KEY (id);


--
-- Name: rent_payments rent_payments_payment_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_payments
    ADD CONSTRAINT rent_payments_payment_id_key UNIQUE (payment_id);


--
-- Name: rent_payments rent_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_payments
    ADD CONSTRAINT rent_payments_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_role_id_permission_id_04f77df0_uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_permission_id_04f77df0_uniq UNIQUE (role_id, permission_id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: security_deposits security_deposits_deposit_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_deposits
    ADD CONSTRAINT security_deposits_deposit_id_key UNIQUE (deposit_id);


--
-- Name: security_deposits security_deposits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_deposits
    ADD CONSTRAINT security_deposits_pkey PRIMARY KEY (id);


--
-- Name: service_provider_ratings service_provider_ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_provider_ratings
    ADD CONSTRAINT service_provider_ratings_pkey PRIMARY KEY (id);


--
-- Name: service_providers service_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_providers
    ADD CONSTRAINT service_providers_pkey PRIMARY KEY (id);


--
-- Name: service_providers service_providers_provider_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_providers
    ADD CONSTRAINT service_providers_provider_id_key UNIQUE (provider_id);


--
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);


--
-- Name: support_tickets support_tickets_ticket_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_ticket_number_key UNIQUE (ticket_number);


--
-- Name: tenant_invitations tenant_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_invitations
    ADD CONSTRAINT tenant_invitations_pkey PRIMARY KEY (id);


--
-- Name: tenant_invitations tenant_invitations_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_invitations
    ADD CONSTRAINT tenant_invitations_token_key UNIQUE (token);


--
-- Name: tenants tenants_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_email_key UNIQUE (email);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_tenant_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_tenant_id_key UNIQUE (tenant_id);


--
-- Name: ticket_attachments ticket_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_attachments
    ADD CONSTRAINT ticket_attachments_pkey PRIMARY KEY (id);


--
-- Name: ticket_notes ticket_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_notes
    ADD CONSTRAINT ticket_notes_pkey PRIMARY KEY (id);


--
-- Name: unified_verification_history unified_verification_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unified_verification_history
    ADD CONSTRAINT unified_verification_history_pkey PRIMARY KEY (id);


--
-- Name: unified_verifications unified_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unified_verifications
    ADD CONSTRAINT unified_verifications_pkey PRIMARY KEY (id);


--
-- Name: unified_verifications unified_verifications_verification_type_entity_4618d241_uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unified_verifications
    ADD CONSTRAINT unified_verifications_verification_type_entity_4618d241_uniq UNIQUE (verification_type, entity_type, entity_id);


--
-- Name: units units_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (id);


--
-- Name: units units_property_id_unit_name_110d5bb4_uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_property_id_unit_name_110d5bb4_uniq UNIQUE (property_id, unit_name);


--
-- Name: user_activities user_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_activities
    ADD CONSTRAINT user_activities_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_user_type_role_id_d1956e68_uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_user_type_role_id_d1956e68_uniq UNIQUE (user_id, user_type, role_id);


--
-- Name: ActivityLog_action_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ActivityLog_action_idx" ON public."ActivityLog" USING btree (action);


--
-- Name: ActivityLog_approvalRequestId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ActivityLog_approvalRequestId_idx" ON public."ActivityLog" USING btree ("approvalRequestId");


--
-- Name: ActivityLog_contractorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ActivityLog_contractorId_idx" ON public."ActivityLog" USING btree ("contractorId");


--
-- Name: ActivityLog_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ActivityLog_createdAt_idx" ON public."ActivityLog" USING btree ("createdAt");


--
-- Name: ActivityLog_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ActivityLog_entityType_entityId_idx" ON public."ActivityLog" USING btree ("entityType", "entityId");


--
-- Name: ActivityLog_landlordId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ActivityLog_landlordId_idx" ON public."ActivityLog" USING btree ("landlordId");


--
-- Name: ActivityLog_pmcId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ActivityLog_pmcId_idx" ON public."ActivityLog" USING btree ("pmcId");


--
-- Name: ActivityLog_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ActivityLog_propertyId_idx" ON public."ActivityLog" USING btree ("propertyId");


--
-- Name: ActivityLog_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ActivityLog_tenantId_idx" ON public."ActivityLog" USING btree ("tenantId");


--
-- Name: ActivityLog_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ActivityLog_userId_idx" ON public."ActivityLog" USING btree ("userId");


--
-- Name: ActivityLog_userRole_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ActivityLog_userRole_createdAt_idx" ON public."ActivityLog" USING btree ("userRole", "createdAt");


--
-- Name: ActivityLog_userRole_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ActivityLog_userRole_idx" ON public."ActivityLog" USING btree ("userRole");


--
-- Name: ActivityLog_userType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ActivityLog_userType_idx" ON public."ActivityLog" USING btree ("userType");


--
-- Name: ActivityLog_vendorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ActivityLog_vendorId_idx" ON public."ActivityLog" USING btree ("vendorId");


--
-- Name: AdminAuditLog_action_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AdminAuditLog_action_idx" ON public."AdminAuditLog" USING btree (action);


--
-- Name: AdminAuditLog_adminId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AdminAuditLog_adminId_idx" ON public."AdminAuditLog" USING btree ("adminId");


--
-- Name: AdminAuditLog_approvalType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AdminAuditLog_approvalType_idx" ON public."AdminAuditLog" USING btree ("approvalType");


--
-- Name: AdminAuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AdminAuditLog_createdAt_idx" ON public."AdminAuditLog" USING btree ("createdAt");


--
-- Name: AdminAuditLog_resource_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AdminAuditLog_resource_idx" ON public."AdminAuditLog" USING btree (resource);


--
-- Name: AdminAuditLog_success_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AdminAuditLog_success_idx" ON public."AdminAuditLog" USING btree (success);


--
-- Name: AdminAuditLog_targetEntityType_targetEntityId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AdminAuditLog_targetEntityType_targetEntityId_idx" ON public."AdminAuditLog" USING btree ("targetEntityType", "targetEntityId");


--
-- Name: AdminAuditLog_targetUserId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AdminAuditLog_targetUserId_idx" ON public."AdminAuditLog" USING btree ("targetUserId");


--
-- Name: AdminPermission_adminId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AdminPermission_adminId_idx" ON public."AdminPermission" USING btree ("adminId");


--
-- Name: AdminPermission_adminId_resource_action_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AdminPermission_adminId_resource_action_key" ON public."AdminPermission" USING btree ("adminId", resource, action);


--
-- Name: AdminSession_adminId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AdminSession_adminId_idx" ON public."AdminSession" USING btree ("adminId");


--
-- Name: AdminSession_expiresAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AdminSession_expiresAt_idx" ON public."AdminSession" USING btree ("expiresAt");


--
-- Name: AdminSession_isRevoked_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AdminSession_isRevoked_idx" ON public."AdminSession" USING btree ("isRevoked");


--
-- Name: AdminSession_refreshToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AdminSession_refreshToken_key" ON public."AdminSession" USING btree ("refreshToken");


--
-- Name: AdminSession_token_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AdminSession_token_idx" ON public."AdminSession" USING btree (token);


--
-- Name: AdminSession_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AdminSession_token_key" ON public."AdminSession" USING btree (token);


--
-- Name: Admin_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Admin_email_idx" ON public."Admin" USING btree (email);


--
-- Name: Admin_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Admin_email_key" ON public."Admin" USING btree (email);


--
-- Name: Admin_googleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Admin_googleId_idx" ON public."Admin" USING btree ("googleId");


--
-- Name: Admin_googleId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Admin_googleId_key" ON public."Admin" USING btree ("googleId");


--
-- Name: Admin_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Admin_isActive_idx" ON public."Admin" USING btree ("isActive");


--
-- Name: Admin_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Admin_role_idx" ON public."Admin" USING btree (role);


--
-- Name: ApiKey_createdBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ApiKey_createdBy_idx" ON public."ApiKey" USING btree ("createdBy");


--
-- Name: ApiKey_expiresAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ApiKey_expiresAt_idx" ON public."ApiKey" USING btree ("expiresAt");


--
-- Name: ApiKey_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ApiKey_isActive_idx" ON public."ApiKey" USING btree ("isActive");


--
-- Name: ApiKey_keyHash_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON public."ApiKey" USING btree ("keyHash");


--
-- Name: ApiKey_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ApiKey_key_key" ON public."ApiKey" USING btree (key);


--
-- Name: Application_applicantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Application_applicantId_idx" ON public."Application" USING btree ("applicantId");


--
-- Name: Application_deadline_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Application_deadline_idx" ON public."Application" USING btree (deadline);


--
-- Name: Application_isArchived_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Application_isArchived_idx" ON public."Application" USING btree ("isArchived");


--
-- Name: Application_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Application_propertyId_idx" ON public."Application" USING btree ("propertyId");


--
-- Name: Application_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Application_status_idx" ON public."Application" USING btree (status);


--
-- Name: Application_unitId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Application_unitId_idx" ON public."Application" USING btree ("unitId");


--
-- Name: ApprovalRequest_approvedBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ApprovalRequest_approvedBy_idx" ON public."ApprovalRequest" USING btree ("approvedBy");


--
-- Name: ApprovalRequest_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ApprovalRequest_entityType_entityId_idx" ON public."ApprovalRequest" USING btree ("entityType", "entityId");


--
-- Name: ApprovalRequest_expiresAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ApprovalRequest_expiresAt_idx" ON public."ApprovalRequest" USING btree ("expiresAt");


--
-- Name: ApprovalRequest_rejectedBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ApprovalRequest_rejectedBy_idx" ON public."ApprovalRequest" USING btree ("rejectedBy");


--
-- Name: ApprovalRequest_requestedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ApprovalRequest_requestedAt_idx" ON public."ApprovalRequest" USING btree ("requestedAt");


--
-- Name: ApprovalRequest_requestedBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ApprovalRequest_requestedBy_idx" ON public."ApprovalRequest" USING btree ("requestedBy");


--
-- Name: ApprovalRequest_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ApprovalRequest_status_idx" ON public."ApprovalRequest" USING btree (status);


--
-- Name: ApprovalRequest_workflowType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ApprovalRequest_workflowType_idx" ON public."ApprovalRequest" USING btree ("workflowType");


--
-- Name: BankReconciliation_landlordId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BankReconciliation_landlordId_idx" ON public."BankReconciliation" USING btree ("landlordId");


--
-- Name: BankReconciliation_pmcId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BankReconciliation_pmcId_idx" ON public."BankReconciliation" USING btree ("pmcId");


--
-- Name: BankReconciliation_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BankReconciliation_propertyId_idx" ON public."BankReconciliation" USING btree ("propertyId");


--
-- Name: BankReconciliation_reconciliationDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BankReconciliation_reconciliationDate_idx" ON public."BankReconciliation" USING btree ("reconciliationDate");


--
-- Name: BankReconciliation_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BankReconciliation_status_idx" ON public."BankReconciliation" USING btree (status);


--
-- Name: ContentItem_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContentItem_createdAt_idx" ON public."ContentItem" USING btree ("createdAt");


--
-- Name: ContentItem_isPublished_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContentItem_isPublished_idx" ON public."ContentItem" USING btree ("isPublished");


--
-- Name: ContentItem_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContentItem_slug_idx" ON public."ContentItem" USING btree (slug);


--
-- Name: ContentItem_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ContentItem_slug_key" ON public."ContentItem" USING btree (slug);


--
-- Name: ContentItem_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContentItem_type_idx" ON public."ContentItem" USING btree (type);


--
-- Name: ConversationParticipant_conversationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ConversationParticipant_conversationId_idx" ON public."ConversationParticipant" USING btree ("conversationId");


--
-- Name: ConversationParticipant_conversationId_participantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ConversationParticipant_conversationId_participantId_key" ON public."ConversationParticipant" USING btree ("conversationId", "participantId");


--
-- Name: ConversationParticipant_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ConversationParticipant_isActive_idx" ON public."ConversationParticipant" USING btree ("isActive");


--
-- Name: ConversationParticipant_participantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ConversationParticipant_participantId_idx" ON public."ConversationParticipant" USING btree ("participantId");


--
-- Name: ConversationParticipant_participantType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ConversationParticipant_participantType_idx" ON public."ConversationParticipant" USING btree ("participantType");


--
-- Name: Conversation_conversationType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Conversation_conversationType_idx" ON public."Conversation" USING btree ("conversationType");


--
-- Name: Conversation_createdBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Conversation_createdBy_idx" ON public."Conversation" USING btree ("createdBy");


--
-- Name: Conversation_landlordId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Conversation_landlordId_idx" ON public."Conversation" USING btree ("landlordId");


--
-- Name: Conversation_lastMessageAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Conversation_lastMessageAt_idx" ON public."Conversation" USING btree ("lastMessageAt");


--
-- Name: Conversation_pmcId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Conversation_pmcId_idx" ON public."Conversation" USING btree ("pmcId");


--
-- Name: Conversation_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Conversation_propertyId_idx" ON public."Conversation" USING btree ("propertyId");


--
-- Name: Conversation_propertyId_landlordId_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Conversation_propertyId_landlordId_tenantId_idx" ON public."Conversation" USING btree ("propertyId", "landlordId", "tenantId");


--
-- Name: Conversation_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Conversation_status_idx" ON public."Conversation" USING btree (status);


--
-- Name: Conversation_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Conversation_tenantId_idx" ON public."Conversation" USING btree ("tenantId");


--
-- Name: Conversation_updatedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Conversation_updatedAt_idx" ON public."Conversation" USING btree ("updatedAt");


--
-- Name: Country_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Country_code_key" ON public."Country" USING btree (code);


--
-- Name: Country_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Country_isActive_idx" ON public."Country" USING btree ("isActive");


--
-- Name: Country_sortOrder_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Country_sortOrder_idx" ON public."Country" USING btree ("sortOrder");


--
-- Name: DocumentAuditLog_action_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DocumentAuditLog_action_idx" ON public."DocumentAuditLog" USING btree (action);


--
-- Name: DocumentAuditLog_documentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DocumentAuditLog_documentId_idx" ON public."DocumentAuditLog" USING btree ("documentId");


--
-- Name: DocumentMessage_documentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DocumentMessage_documentId_idx" ON public."DocumentMessage" USING btree ("documentId");


--
-- Name: DocumentMessage_documentId_isRead_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DocumentMessage_documentId_isRead_idx" ON public."DocumentMessage" USING btree ("documentId", "isRead");


--
-- Name: DocumentMessage_isRead_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DocumentMessage_isRead_idx" ON public."DocumentMessage" USING btree ("isRead");


--
-- Name: DocumentMessage_senderRole_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DocumentMessage_senderRole_idx" ON public."DocumentMessage" USING btree ("senderRole");


--
-- Name: Document_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Document_category_idx" ON public."Document" USING btree (category);


--
-- Name: Document_documentHash_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Document_documentHash_key" ON public."Document" USING btree ("documentHash");


--
-- Name: Document_expirationDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Document_expirationDate_idx" ON public."Document" USING btree ("expirationDate");


--
-- Name: Document_isDeleted_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Document_isDeleted_idx" ON public."Document" USING btree ("isDeleted");


--
-- Name: Document_isRequired_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Document_isRequired_idx" ON public."Document" USING btree ("isRequired");


--
-- Name: Document_isVerified_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Document_isVerified_idx" ON public."Document" USING btree ("isVerified");


--
-- Name: Document_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Document_propertyId_idx" ON public."Document" USING btree ("propertyId");


--
-- Name: Document_propertyId_isDeleted_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Document_propertyId_isDeleted_idx" ON public."Document" USING btree ("propertyId", "isDeleted");


--
-- Name: Document_tenantId_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Document_tenantId_category_idx" ON public."Document" USING btree ("tenantId", category);


--
-- Name: Document_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Document_tenantId_idx" ON public."Document" USING btree ("tenantId");


--
-- Name: Document_tenantId_isDeleted_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Document_tenantId_isDeleted_idx" ON public."Document" USING btree ("tenantId", "isDeleted");


--
-- Name: Document_uploadedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Document_uploadedAt_idx" ON public."Document" USING btree ("uploadedAt");


--
-- Name: EmergencyContact_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "EmergencyContact_tenantId_idx" ON public."EmergencyContact" USING btree ("tenantId");


--
-- Name: Employer_isCurrent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Employer_isCurrent_idx" ON public."Employer" USING btree ("isCurrent");


--
-- Name: Employer_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Employer_tenantId_idx" ON public."Employer" USING btree ("tenantId");


--
-- Name: EmploymentDocument_employerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "EmploymentDocument_employerId_idx" ON public."EmploymentDocument" USING btree ("employerId");


--
-- Name: Eviction_initiatedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Eviction_initiatedAt_idx" ON public."Eviction" USING btree ("initiatedAt");


--
-- Name: Eviction_leaseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Eviction_leaseId_idx" ON public."Eviction" USING btree ("leaseId");


--
-- Name: Eviction_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Eviction_propertyId_idx" ON public."Eviction" USING btree ("propertyId");


--
-- Name: Eviction_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Eviction_status_idx" ON public."Eviction" USING btree (status);


--
-- Name: Eviction_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Eviction_tenantId_idx" ON public."Eviction" USING btree ("tenantId");


--
-- Name: Expense_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Expense_category_idx" ON public."Expense" USING btree (category);


--
-- Name: Expense_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Expense_createdAt_idx" ON public."Expense" USING btree ("createdAt");


--
-- Name: Expense_createdBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Expense_createdBy_idx" ON public."Expense" USING btree ("createdBy");


--
-- Name: Expense_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Expense_date_idx" ON public."Expense" USING btree (date);


--
-- Name: Expense_maintenanceRequestId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Expense_maintenanceRequestId_idx" ON public."Expense" USING btree ("maintenanceRequestId");


--
-- Name: Expense_pmcApprovalRequestId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Expense_pmcApprovalRequestId_idx" ON public."Expense" USING btree ("pmcApprovalRequestId");


--
-- Name: Expense_pmcApprovalRequestId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Expense_pmcApprovalRequestId_key" ON public."Expense" USING btree ("pmcApprovalRequestId");


--
-- Name: Expense_pmcId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Expense_pmcId_idx" ON public."Expense" USING btree ("pmcId");


--
-- Name: Expense_propertyId_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Expense_propertyId_date_idx" ON public."Expense" USING btree ("propertyId", date);


--
-- Name: Expense_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Expense_propertyId_idx" ON public."Expense" USING btree ("propertyId");


--
-- Name: FailedLoginAttempt_attemptType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "FailedLoginAttempt_attemptType_idx" ON public."FailedLoginAttempt" USING btree ("attemptType");


--
-- Name: FailedLoginAttempt_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "FailedLoginAttempt_createdAt_idx" ON public."FailedLoginAttempt" USING btree ("createdAt");


--
-- Name: FailedLoginAttempt_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "FailedLoginAttempt_email_idx" ON public."FailedLoginAttempt" USING btree (email);


--
-- Name: FailedLoginAttempt_ipAddress_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "FailedLoginAttempt_ipAddress_idx" ON public."FailedLoginAttempt" USING btree ("ipAddress");


--
-- Name: FinancialSnapshot_month_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "FinancialSnapshot_month_idx" ON public."FinancialSnapshot" USING btree (month);


--
-- Name: FinancialSnapshot_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "FinancialSnapshot_propertyId_idx" ON public."FinancialSnapshot" USING btree ("propertyId");


--
-- Name: GeneratedForm_generatedBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "GeneratedForm_generatedBy_idx" ON public."GeneratedForm" USING btree ("generatedBy");


--
-- Name: GeneratedForm_leaseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "GeneratedForm_leaseId_idx" ON public."GeneratedForm" USING btree ("leaseId");


--
-- Name: GeneratedForm_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "GeneratedForm_propertyId_idx" ON public."GeneratedForm" USING btree ("propertyId");


--
-- Name: GeneratedForm_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "GeneratedForm_status_idx" ON public."GeneratedForm" USING btree (status);


--
-- Name: GeneratedForm_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "GeneratedForm_tenantId_idx" ON public."GeneratedForm" USING btree ("tenantId");


--
-- Name: InspectionChecklistItem_checklistId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "InspectionChecklistItem_checklistId_idx" ON public."InspectionChecklistItem" USING btree ("checklistId");


--
-- Name: InspectionChecklistItem_itemId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "InspectionChecklistItem_itemId_idx" ON public."InspectionChecklistItem" USING btree ("itemId");


--
-- Name: InspectionChecklist_checklistType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "InspectionChecklist_checklistType_idx" ON public."InspectionChecklist" USING btree ("checklistType");


--
-- Name: InspectionChecklist_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "InspectionChecklist_status_idx" ON public."InspectionChecklist" USING btree (status);


--
-- Name: InspectionChecklist_submittedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "InspectionChecklist_submittedAt_idx" ON public."InspectionChecklist" USING btree ("submittedAt");


--
-- Name: InspectionChecklist_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "InspectionChecklist_tenantId_idx" ON public."InspectionChecklist" USING btree ("tenantId");


--
-- Name: Invitation_contractorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Invitation_contractorId_idx" ON public."Invitation" USING btree ("contractorId");


--
-- Name: Invitation_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Invitation_email_idx" ON public."Invitation" USING btree (email);


--
-- Name: Invitation_expiresAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Invitation_expiresAt_idx" ON public."Invitation" USING btree ("expiresAt");


--
-- Name: Invitation_invitedByAdminId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Invitation_invitedByAdminId_idx" ON public."Invitation" USING btree ("invitedByAdminId");


--
-- Name: Invitation_invitedByLandlordId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Invitation_invitedByLandlordId_idx" ON public."Invitation" USING btree ("invitedByLandlordId");


--
-- Name: Invitation_invitedByPMCId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Invitation_invitedByPMCId_idx" ON public."Invitation" USING btree ("invitedByPMCId");


--
-- Name: Invitation_invitedByRole_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Invitation_invitedByRole_idx" ON public."Invitation" USING btree ("invitedByRole");


--
-- Name: Invitation_invitedBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Invitation_invitedBy_idx" ON public."Invitation" USING btree ("invitedBy");


--
-- Name: Invitation_landlordId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Invitation_landlordId_idx" ON public."Invitation" USING btree ("landlordId");


--
-- Name: Invitation_pmcId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Invitation_pmcId_idx" ON public."Invitation" USING btree ("pmcId");


--
-- Name: Invitation_serviceProviderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Invitation_serviceProviderId_idx" ON public."Invitation" USING btree ("serviceProviderId");


--
-- Name: Invitation_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Invitation_status_idx" ON public."Invitation" USING btree (status);


--
-- Name: Invitation_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Invitation_tenantId_idx" ON public."Invitation" USING btree ("tenantId");


--
-- Name: Invitation_token_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Invitation_token_idx" ON public."Invitation" USING btree (token);


--
-- Name: Invitation_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Invitation_token_key" ON public."Invitation" USING btree (token);


--
-- Name: Invitation_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Invitation_type_idx" ON public."Invitation" USING btree (type);


--
-- Name: Invitation_vendorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Invitation_vendorId_idx" ON public."Invitation" USING btree ("vendorId");


--
-- Name: LandlordServiceProvider_landlordId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LandlordServiceProvider_landlordId_idx" ON public."LandlordServiceProvider" USING btree ("landlordId");


--
-- Name: LandlordServiceProvider_landlordId_providerId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "LandlordServiceProvider_landlordId_providerId_key" ON public."LandlordServiceProvider" USING btree ("landlordId", "providerId");


--
-- Name: LandlordServiceProvider_providerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LandlordServiceProvider_providerId_idx" ON public."LandlordServiceProvider" USING btree ("providerId");


--
-- Name: Landlord_approvalStatus_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Landlord_approvalStatus_idx" ON public."Landlord" USING btree ("approvalStatus");


--
-- Name: Landlord_approvedBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Landlord_approvedBy_idx" ON public."Landlord" USING btree ("approvedBy");


--
-- Name: Landlord_countryCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Landlord_countryCode_idx" ON public."Landlord" USING btree ("countryCode");


--
-- Name: Landlord_countryCode_regionCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Landlord_countryCode_regionCode_idx" ON public."Landlord" USING btree ("countryCode", "regionCode");


--
-- Name: Landlord_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Landlord_email_key" ON public."Landlord" USING btree (email);


--
-- Name: Landlord_invitedBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Landlord_invitedBy_idx" ON public."Landlord" USING btree ("invitedBy");


--
-- Name: Landlord_landlordId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Landlord_landlordId_key" ON public."Landlord" USING btree ("landlordId");


--
-- Name: Landlord_organizationId_approvalStatus_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Landlord_organizationId_approvalStatus_idx" ON public."Landlord" USING btree ("organizationId", "approvalStatus");


--
-- Name: Landlord_organizationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Landlord_organizationId_idx" ON public."Landlord" USING btree ("organizationId");


--
-- Name: LateFeeRule_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LateFeeRule_isActive_idx" ON public."LateFeeRule" USING btree ("isActive");


--
-- Name: LateFeeRule_landlordId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LateFeeRule_landlordId_idx" ON public."LateFeeRule" USING btree ("landlordId");


--
-- Name: LateFeeRule_pmcId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LateFeeRule_pmcId_idx" ON public."LateFeeRule" USING btree ("pmcId");


--
-- Name: LateFee_calculatedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LateFee_calculatedAt_idx" ON public."LateFee" USING btree ("calculatedAt");


--
-- Name: LateFee_isPaid_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LateFee_isPaid_idx" ON public."LateFee" USING btree ("isPaid");


--
-- Name: LateFee_rentPaymentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LateFee_rentPaymentId_idx" ON public."LateFee" USING btree ("rentPaymentId");


--
-- Name: LeaseDocument_leaseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LeaseDocument_leaseId_idx" ON public."LeaseDocument" USING btree ("leaseId");


--
-- Name: LeaseTenant_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LeaseTenant_tenantId_idx" ON public."LeaseTenant" USING btree ("tenantId");


--
-- Name: Lease_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lease_createdAt_idx" ON public."Lease" USING btree ("createdAt");


--
-- Name: Lease_leaseEnd_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lease_leaseEnd_idx" ON public."Lease" USING btree ("leaseEnd");


--
-- Name: Lease_renewalDecision_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lease_renewalDecision_idx" ON public."Lease" USING btree ("renewalDecision");


--
-- Name: Lease_renewalReminderSent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lease_renewalReminderSent_idx" ON public."Lease" USING btree ("renewalReminderSent");


--
-- Name: Lease_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lease_status_idx" ON public."Lease" USING btree (status);


--
-- Name: Lease_unitId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lease_unitId_idx" ON public."Lease" USING btree ("unitId");


--
-- Name: Lease_unitId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lease_unitId_status_idx" ON public."Lease" USING btree ("unitId", status);


--
-- Name: Listing_expiresAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Listing_expiresAt_idx" ON public."Listing" USING btree ("expiresAt");


--
-- Name: Listing_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Listing_propertyId_idx" ON public."Listing" USING btree ("propertyId");


--
-- Name: Listing_publishedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Listing_publishedAt_idx" ON public."Listing" USING btree ("publishedAt");


--
-- Name: Listing_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Listing_status_idx" ON public."Listing" USING btree (status);


--
-- Name: Listing_unitId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Listing_unitId_idx" ON public."Listing" USING btree ("unitId");


--
-- Name: MaintenanceComment_maintenanceRequestId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MaintenanceComment_maintenanceRequestId_idx" ON public."MaintenanceComment" USING btree ("maintenanceRequestId");


--
-- Name: MaintenanceRequest_assignedToProviderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MaintenanceRequest_assignedToProviderId_idx" ON public."MaintenanceRequest" USING btree ("assignedToProviderId");


--
-- Name: MaintenanceRequest_assignedToVendorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MaintenanceRequest_assignedToVendorId_idx" ON public."MaintenanceRequest" USING btree ("assignedToVendorId");


--
-- Name: MaintenanceRequest_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MaintenanceRequest_createdAt_idx" ON public."MaintenanceRequest" USING btree ("createdAt");


--
-- Name: MaintenanceRequest_pmcApprovalRequestId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MaintenanceRequest_pmcApprovalRequestId_idx" ON public."MaintenanceRequest" USING btree ("pmcApprovalRequestId");


--
-- Name: MaintenanceRequest_pmcApprovalRequestId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "MaintenanceRequest_pmcApprovalRequestId_key" ON public."MaintenanceRequest" USING btree ("pmcApprovalRequestId");


--
-- Name: MaintenanceRequest_pmcId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MaintenanceRequest_pmcId_idx" ON public."MaintenanceRequest" USING btree ("pmcId");


--
-- Name: MaintenanceRequest_priority_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MaintenanceRequest_priority_idx" ON public."MaintenanceRequest" USING btree (priority);


--
-- Name: MaintenanceRequest_propertyId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MaintenanceRequest_propertyId_createdAt_idx" ON public."MaintenanceRequest" USING btree ("propertyId", "createdAt");


--
-- Name: MaintenanceRequest_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MaintenanceRequest_propertyId_idx" ON public."MaintenanceRequest" USING btree ("propertyId");


--
-- Name: MaintenanceRequest_propertyId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MaintenanceRequest_propertyId_status_idx" ON public."MaintenanceRequest" USING btree ("propertyId", status);


--
-- Name: MaintenanceRequest_requestedDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MaintenanceRequest_requestedDate_idx" ON public."MaintenanceRequest" USING btree ("requestedDate");


--
-- Name: MaintenanceRequest_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MaintenanceRequest_status_idx" ON public."MaintenanceRequest" USING btree (status);


--
-- Name: MaintenanceRequest_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MaintenanceRequest_tenantId_idx" ON public."MaintenanceRequest" USING btree ("tenantId");


--
-- Name: MaintenanceRequest_ticketNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "MaintenanceRequest_ticketNumber_key" ON public."MaintenanceRequest" USING btree ("ticketNumber");


--
-- Name: MessageAttachment_messageId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MessageAttachment_messageId_idx" ON public."MessageAttachment" USING btree ("messageId");


--
-- Name: MessageAttachment_uploadedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MessageAttachment_uploadedAt_idx" ON public."MessageAttachment" USING btree ("uploadedAt");


--
-- Name: MessageNotification_isRead_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MessageNotification_isRead_idx" ON public."MessageNotification" USING btree ("isRead");


--
-- Name: MessageNotification_messageId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MessageNotification_messageId_idx" ON public."MessageNotification" USING btree ("messageId");


--
-- Name: MessageNotification_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MessageNotification_userId_idx" ON public."MessageNotification" USING btree ("userId");


--
-- Name: Message_conversationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Message_conversationId_idx" ON public."Message" USING btree ("conversationId");


--
-- Name: Message_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Message_createdAt_idx" ON public."Message" USING btree ("createdAt");


--
-- Name: Message_isRead_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Message_isRead_idx" ON public."Message" USING btree ("isRead");


--
-- Name: Message_readByLandlord_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Message_readByLandlord_idx" ON public."Message" USING btree ("readByLandlord");


--
-- Name: Message_readByTenant_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Message_readByTenant_idx" ON public."Message" USING btree ("readByTenant");


--
-- Name: Message_senderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Message_senderId_idx" ON public."Message" USING btree ("senderId");


--
-- Name: Message_senderLandlordId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Message_senderLandlordId_idx" ON public."Message" USING btree ("senderLandlordId");


--
-- Name: Message_senderPMCId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Message_senderPMCId_idx" ON public."Message" USING btree ("senderPMCId");


--
-- Name: Message_senderRole_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Message_senderRole_idx" ON public."Message" USING btree ("senderRole");


--
-- Name: Message_senderTenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Message_senderTenantId_idx" ON public."Message" USING btree ("senderTenantId");


--
-- Name: OrganizationSettings_customDomain_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OrganizationSettings_customDomain_idx" ON public."OrganizationSettings" USING btree ("customDomain");


--
-- Name: OrganizationSettings_customDomain_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "OrganizationSettings_customDomain_key" ON public."OrganizationSettings" USING btree ("customDomain");


--
-- Name: OrganizationSettings_organizationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OrganizationSettings_organizationId_idx" ON public."OrganizationSettings" USING btree ("organizationId");


--
-- Name: OrganizationSettings_organizationId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "OrganizationSettings_organizationId_key" ON public."OrganizationSettings" USING btree ("organizationId");


--
-- Name: Organization_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Organization_createdAt_idx" ON public."Organization" USING btree ("createdAt");


--
-- Name: Organization_plan_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Organization_plan_idx" ON public."Organization" USING btree (plan);


--
-- Name: Organization_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Organization_status_idx" ON public."Organization" USING btree (status);


--
-- Name: Organization_subdomain_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Organization_subdomain_idx" ON public."Organization" USING btree (subdomain);


--
-- Name: Organization_subdomain_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Organization_subdomain_key" ON public."Organization" USING btree (subdomain);


--
-- Name: Organization_subscriptionStatus_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Organization_subscriptionStatus_idx" ON public."Organization" USING btree ("subscriptionStatus");


--
-- Name: OwnerPayout_landlordId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OwnerPayout_landlordId_idx" ON public."OwnerPayout" USING btree ("landlordId");


--
-- Name: OwnerPayout_payoutDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OwnerPayout_payoutDate_idx" ON public."OwnerPayout" USING btree ("payoutDate");


--
-- Name: OwnerPayout_pmcId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OwnerPayout_pmcId_idx" ON public."OwnerPayout" USING btree ("pmcId");


--
-- Name: OwnerPayout_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OwnerPayout_propertyId_idx" ON public."OwnerPayout" USING btree ("propertyId");


--
-- Name: OwnerPayout_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OwnerPayout_status_idx" ON public."OwnerPayout" USING btree (status);


--
-- Name: OwnerStatement_landlordId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OwnerStatement_landlordId_idx" ON public."OwnerStatement" USING btree ("landlordId");


--
-- Name: OwnerStatement_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OwnerStatement_propertyId_idx" ON public."OwnerStatement" USING btree ("propertyId");


--
-- Name: OwnerStatement_statementDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OwnerStatement_statementDate_idx" ON public."OwnerStatement" USING btree ("statementDate");


--
-- Name: OwnerStatement_statementType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OwnerStatement_statementType_idx" ON public."OwnerStatement" USING btree ("statementType");


--
-- Name: OwnerStatement_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OwnerStatement_status_idx" ON public."OwnerStatement" USING btree (status);


--
-- Name: PMCLandlordApproval_approvalType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PMCLandlordApproval_approvalType_idx" ON public."PMCLandlordApproval" USING btree ("approvalType");


--
-- Name: PMCLandlordApproval_approvedBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PMCLandlordApproval_approvedBy_idx" ON public."PMCLandlordApproval" USING btree ("approvedBy");


--
-- Name: PMCLandlordApproval_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PMCLandlordApproval_entityType_entityId_idx" ON public."PMCLandlordApproval" USING btree ("entityType", "entityId");


--
-- Name: PMCLandlordApproval_pmcLandlordId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PMCLandlordApproval_pmcLandlordId_idx" ON public."PMCLandlordApproval" USING btree ("pmcLandlordId");


--
-- Name: PMCLandlordApproval_rejectedBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PMCLandlordApproval_rejectedBy_idx" ON public."PMCLandlordApproval" USING btree ("rejectedBy");


--
-- Name: PMCLandlordApproval_requestedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PMCLandlordApproval_requestedAt_idx" ON public."PMCLandlordApproval" USING btree ("requestedAt");


--
-- Name: PMCLandlordApproval_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PMCLandlordApproval_status_idx" ON public."PMCLandlordApproval" USING btree (status);


--
-- Name: PMCLandlord_landlordId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PMCLandlord_landlordId_idx" ON public."PMCLandlord" USING btree ("landlordId");


--
-- Name: PMCLandlord_pmcId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PMCLandlord_pmcId_idx" ON public."PMCLandlord" USING btree ("pmcId");


--
-- Name: PMCLandlord_pmcId_landlordId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PMCLandlord_pmcId_landlordId_key" ON public."PMCLandlord" USING btree ("pmcId", "landlordId");


--
-- Name: PMCLandlord_startedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PMCLandlord_startedAt_idx" ON public."PMCLandlord" USING btree ("startedAt");


--
-- Name: PMCLandlord_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PMCLandlord_status_idx" ON public."PMCLandlord" USING btree (status);


--
-- Name: PartialPayment_rentPaymentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PartialPayment_rentPaymentId_idx" ON public."PartialPayment" USING btree ("rentPaymentId");


--
-- Name: PropertyManagementCompany_approvalStatus_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PropertyManagementCompany_approvalStatus_idx" ON public."PropertyManagementCompany" USING btree ("approvalStatus");


--
-- Name: PropertyManagementCompany_approvedBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PropertyManagementCompany_approvedBy_idx" ON public."PropertyManagementCompany" USING btree ("approvedBy");


--
-- Name: PropertyManagementCompany_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PropertyManagementCompany_companyId_idx" ON public."PropertyManagementCompany" USING btree ("companyId");


--
-- Name: PropertyManagementCompany_companyId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PropertyManagementCompany_companyId_key" ON public."PropertyManagementCompany" USING btree ("companyId");


--
-- Name: PropertyManagementCompany_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PropertyManagementCompany_email_idx" ON public."PropertyManagementCompany" USING btree (email);


--
-- Name: PropertyManagementCompany_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PropertyManagementCompany_email_key" ON public."PropertyManagementCompany" USING btree (email);


--
-- Name: PropertyManagementCompany_invitedBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PropertyManagementCompany_invitedBy_idx" ON public."PropertyManagementCompany" USING btree ("invitedBy");


--
-- Name: PropertyManagementCompany_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PropertyManagementCompany_isActive_idx" ON public."PropertyManagementCompany" USING btree ("isActive");


--
-- Name: PropertyOwnershipVerificationHistory_action_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PropertyOwnershipVerificationHistory_action_idx" ON public."PropertyOwnershipVerificationHistory" USING btree (action);


--
-- Name: PropertyOwnershipVerificationHistory_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PropertyOwnershipVerificationHistory_createdAt_idx" ON public."PropertyOwnershipVerificationHistory" USING btree ("createdAt");


--
-- Name: PropertyOwnershipVerificationHistory_verificationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PropertyOwnershipVerificationHistory_verificationId_idx" ON public."PropertyOwnershipVerificationHistory" USING btree ("verificationId");


--
-- Name: PropertyOwnershipVerification_documentType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PropertyOwnershipVerification_documentType_idx" ON public."PropertyOwnershipVerification" USING btree ("documentType");


--
-- Name: PropertyOwnershipVerification_landlordId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PropertyOwnershipVerification_landlordId_idx" ON public."PropertyOwnershipVerification" USING btree ("landlordId");


--
-- Name: PropertyOwnershipVerification_landlordId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PropertyOwnershipVerification_landlordId_status_idx" ON public."PropertyOwnershipVerification" USING btree ("landlordId", status);


--
-- Name: PropertyOwnershipVerification_pmcLandlordId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PropertyOwnershipVerification_pmcLandlordId_idx" ON public."PropertyOwnershipVerification" USING btree ("pmcLandlordId");


--
-- Name: PropertyOwnershipVerification_pmcLandlordId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PropertyOwnershipVerification_pmcLandlordId_status_idx" ON public."PropertyOwnershipVerification" USING btree ("pmcLandlordId", status);


--
-- Name: PropertyOwnershipVerification_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PropertyOwnershipVerification_propertyId_idx" ON public."PropertyOwnershipVerification" USING btree ("propertyId");


--
-- Name: PropertyOwnershipVerification_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PropertyOwnershipVerification_status_idx" ON public."PropertyOwnershipVerification" USING btree (status);


--
-- Name: PropertyOwnershipVerification_uploadedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PropertyOwnershipVerification_uploadedAt_idx" ON public."PropertyOwnershipVerification" USING btree ("uploadedAt");


--
-- Name: PropertyOwnershipVerification_verifiedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PropertyOwnershipVerification_verifiedAt_idx" ON public."PropertyOwnershipVerification" USING btree ("verifiedAt");


--
-- Name: Property_countryCode_city_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Property_countryCode_city_idx" ON public."Property" USING btree ("countryCode", city);


--
-- Name: Property_countryCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Property_countryCode_idx" ON public."Property" USING btree ("countryCode");


--
-- Name: Property_countryCode_regionCode_city_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Property_countryCode_regionCode_city_idx" ON public."Property" USING btree ("countryCode", "regionCode", city);


--
-- Name: Property_countryCode_regionCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Property_countryCode_regionCode_idx" ON public."Property" USING btree ("countryCode", "regionCode");


--
-- Name: Property_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Property_createdAt_idx" ON public."Property" USING btree ("createdAt");


--
-- Name: Property_landlordId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Property_landlordId_createdAt_idx" ON public."Property" USING btree ("landlordId", "createdAt");


--
-- Name: Property_landlordId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Property_landlordId_idx" ON public."Property" USING btree ("landlordId");


--
-- Name: Property_latitude_longitude_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Property_latitude_longitude_idx" ON public."Property" USING btree (latitude, longitude);


--
-- Name: Property_organizationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Property_organizationId_idx" ON public."Property" USING btree ("organizationId");


--
-- Name: Property_organizationId_landlordId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Property_organizationId_landlordId_idx" ON public."Property" USING btree ("organizationId", "landlordId");


--
-- Name: Property_propertyId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Property_propertyId_key" ON public."Property" USING btree ("propertyId");


--
-- Name: Property_regionCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Property_regionCode_idx" ON public."Property" USING btree ("regionCode");


--
-- Name: RBACAuditLog_action_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RBACAuditLog_action_idx" ON public."RBACAuditLog" USING btree (action);


--
-- Name: RBACAuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RBACAuditLog_createdAt_idx" ON public."RBACAuditLog" USING btree ("createdAt");


--
-- Name: RBACAuditLog_resource_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RBACAuditLog_resource_idx" ON public."RBACAuditLog" USING btree (resource);


--
-- Name: RBACAuditLog_roleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RBACAuditLog_roleId_idx" ON public."RBACAuditLog" USING btree ("roleId");


--
-- Name: RBACAuditLog_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RBACAuditLog_userId_idx" ON public."RBACAuditLog" USING btree ("userId");


--
-- Name: RBACAuditLog_userType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RBACAuditLog_userType_idx" ON public."RBACAuditLog" USING btree ("userType");


--
-- Name: RecurringMaintenance_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RecurringMaintenance_isActive_idx" ON public."RecurringMaintenance" USING btree ("isActive");


--
-- Name: RecurringMaintenance_nextDueDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RecurringMaintenance_nextDueDate_idx" ON public."RecurringMaintenance" USING btree ("nextDueDate");


--
-- Name: RecurringMaintenance_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RecurringMaintenance_propertyId_idx" ON public."RecurringMaintenance" USING btree ("propertyId");


--
-- Name: ReferenceData_category_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ReferenceData_category_code_key" ON public."ReferenceData" USING btree (category, code);


--
-- Name: ReferenceData_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ReferenceData_category_idx" ON public."ReferenceData" USING btree (category);


--
-- Name: ReferenceData_category_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ReferenceData_category_isActive_idx" ON public."ReferenceData" USING btree (category, "isActive");


--
-- Name: ReferenceData_category_sortOrder_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ReferenceData_category_sortOrder_idx" ON public."ReferenceData" USING btree (category, "sortOrder");


--
-- Name: ReferenceData_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ReferenceData_code_idx" ON public."ReferenceData" USING btree (code);


--
-- Name: Region_countryCode_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Region_countryCode_code_key" ON public."Region" USING btree ("countryCode", code);


--
-- Name: Region_countryCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Region_countryCode_idx" ON public."Region" USING btree ("countryCode");


--
-- Name: Region_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Region_isActive_idx" ON public."Region" USING btree ("isActive");


--
-- Name: Region_sortOrder_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Region_sortOrder_idx" ON public."Region" USING btree ("sortOrder");


--
-- Name: Region_timezone_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Region_timezone_idx" ON public."Region" USING btree (timezone);


--
-- Name: RentPayment_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RentPayment_createdAt_idx" ON public."RentPayment" USING btree ("createdAt");


--
-- Name: RentPayment_dueDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RentPayment_dueDate_idx" ON public."RentPayment" USING btree ("dueDate");


--
-- Name: RentPayment_leaseId_dueDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RentPayment_leaseId_dueDate_idx" ON public."RentPayment" USING btree ("leaseId", "dueDate");


--
-- Name: RentPayment_leaseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RentPayment_leaseId_idx" ON public."RentPayment" USING btree ("leaseId");


--
-- Name: RentPayment_leaseId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RentPayment_leaseId_status_idx" ON public."RentPayment" USING btree ("leaseId", status);


--
-- Name: RentPayment_overdueReminderSent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RentPayment_overdueReminderSent_idx" ON public."RentPayment" USING btree ("overdueReminderSent");


--
-- Name: RentPayment_receiptSent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RentPayment_receiptSent_idx" ON public."RentPayment" USING btree ("receiptSent");


--
-- Name: RentPayment_reminderSent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RentPayment_reminderSent_idx" ON public."RentPayment" USING btree ("reminderSent");


--
-- Name: RentPayment_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RentPayment_status_idx" ON public."RentPayment" USING btree (status);


--
-- Name: RolePermission_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RolePermission_category_idx" ON public."RolePermission" USING btree (category);


--
-- Name: RolePermission_roleId_category_resource_action_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "RolePermission_roleId_category_resource_action_key" ON public."RolePermission" USING btree ("roleId", category, resource, action);


--
-- Name: RolePermission_roleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RolePermission_roleId_idx" ON public."RolePermission" USING btree ("roleId");


--
-- Name: Role_createdByPMCId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Role_createdByPMCId_idx" ON public."Role" USING btree ("createdByPMCId");


--
-- Name: Role_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Role_isActive_idx" ON public."Role" USING btree ("isActive");


--
-- Name: Role_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Role_name_idx" ON public."Role" USING btree (name);


--
-- Name: Role_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Role_name_key" ON public."Role" USING btree (name);


--
-- Name: Scope_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Scope_isActive_idx" ON public."Scope" USING btree ("isActive");


--
-- Name: Scope_parentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Scope_parentId_idx" ON public."Scope" USING btree ("parentId");


--
-- Name: Scope_pmcId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Scope_pmcId_idx" ON public."Scope" USING btree ("pmcId");


--
-- Name: Scope_portfolioId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Scope_portfolioId_idx" ON public."Scope" USING btree ("portfolioId");


--
-- Name: Scope_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Scope_propertyId_idx" ON public."Scope" USING btree ("propertyId");


--
-- Name: Scope_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Scope_type_idx" ON public."Scope" USING btree (type);


--
-- Name: Scope_unitId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Scope_unitId_idx" ON public."Scope" USING btree ("unitId");


--
-- Name: SecurityDeposit_depositType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SecurityDeposit_depositType_idx" ON public."SecurityDeposit" USING btree ("depositType");


--
-- Name: SecurityDeposit_leaseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SecurityDeposit_leaseId_idx" ON public."SecurityDeposit" USING btree ("leaseId");


--
-- Name: SecurityDeposit_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SecurityDeposit_propertyId_idx" ON public."SecurityDeposit" USING btree ("propertyId");


--
-- Name: SecurityDeposit_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SecurityDeposit_status_idx" ON public."SecurityDeposit" USING btree (status);


--
-- Name: SecurityDeposit_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SecurityDeposit_tenantId_idx" ON public."SecurityDeposit" USING btree ("tenantId");


--
-- Name: ServiceProvider_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ServiceProvider_category_idx" ON public."ServiceProvider" USING btree (category);


--
-- Name: ServiceProvider_countryCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ServiceProvider_countryCode_idx" ON public."ServiceProvider" USING btree ("countryCode");


--
-- Name: ServiceProvider_countryCode_regionCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ServiceProvider_countryCode_regionCode_idx" ON public."ServiceProvider" USING btree ("countryCode", "regionCode");


--
-- Name: ServiceProvider_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ServiceProvider_email_idx" ON public."ServiceProvider" USING btree (email);


--
-- Name: ServiceProvider_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ServiceProvider_email_key" ON public."ServiceProvider" USING btree (email);


--
-- Name: ServiceProvider_invitedBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ServiceProvider_invitedBy_idx" ON public."ServiceProvider" USING btree ("invitedBy");


--
-- Name: ServiceProvider_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ServiceProvider_isActive_idx" ON public."ServiceProvider" USING btree ("isActive");


--
-- Name: ServiceProvider_isDeleted_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ServiceProvider_isDeleted_idx" ON public."ServiceProvider" USING btree ("isDeleted");


--
-- Name: ServiceProvider_isGlobal_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ServiceProvider_isGlobal_idx" ON public."ServiceProvider" USING btree ("isGlobal");


--
-- Name: ServiceProvider_latitude_longitude_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ServiceProvider_latitude_longitude_idx" ON public."ServiceProvider" USING btree (latitude, longitude);


--
-- Name: ServiceProvider_providerId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ServiceProvider_providerId_key" ON public."ServiceProvider" USING btree ("providerId");


--
-- Name: ServiceProvider_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ServiceProvider_type_idx" ON public."ServiceProvider" USING btree (type);


--
-- Name: StripeCustomer_stripeCustomerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StripeCustomer_stripeCustomerId_idx" ON public."StripeCustomer" USING btree ("stripeCustomerId");


--
-- Name: StripeCustomer_stripeCustomerId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "StripeCustomer_stripeCustomerId_key" ON public."StripeCustomer" USING btree ("stripeCustomerId");


--
-- Name: StripeCustomer_userId_userRole_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StripeCustomer_userId_userRole_idx" ON public."StripeCustomer" USING btree ("userId", "userRole");


--
-- Name: StripePayment_rentPaymentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StripePayment_rentPaymentId_idx" ON public."StripePayment" USING btree ("rentPaymentId");


--
-- Name: StripePayment_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StripePayment_status_idx" ON public."StripePayment" USING btree (status);


--
-- Name: StripePayment_stripeCustomerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StripePayment_stripeCustomerId_idx" ON public."StripePayment" USING btree ("stripeCustomerId");


--
-- Name: StripePayment_stripePaymentIntentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StripePayment_stripePaymentIntentId_idx" ON public."StripePayment" USING btree ("stripePaymentIntentId");


--
-- Name: StripePayment_stripePaymentIntentId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "StripePayment_stripePaymentIntentId_key" ON public."StripePayment" USING btree ("stripePaymentIntentId");


--
-- Name: SupportTicket_assignedToAdminId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SupportTicket_assignedToAdminId_idx" ON public."SupportTicket" USING btree ("assignedToAdminId");


--
-- Name: SupportTicket_assignedToLandlordId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SupportTicket_assignedToLandlordId_idx" ON public."SupportTicket" USING btree ("assignedToLandlordId");


--
-- Name: SupportTicket_assignedToPMCId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SupportTicket_assignedToPMCId_idx" ON public."SupportTicket" USING btree ("assignedToPMCId");


--
-- Name: SupportTicket_assignedTo_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SupportTicket_assignedTo_idx" ON public."SupportTicket" USING btree ("assignedTo");


--
-- Name: SupportTicket_contractorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SupportTicket_contractorId_idx" ON public."SupportTicket" USING btree ("contractorId");


--
-- Name: SupportTicket_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SupportTicket_createdAt_idx" ON public."SupportTicket" USING btree ("createdAt");


--
-- Name: SupportTicket_createdByLandlordId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SupportTicket_createdByLandlordId_idx" ON public."SupportTicket" USING btree ("createdByLandlordId");


--
-- Name: SupportTicket_createdByTenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SupportTicket_createdByTenantId_idx" ON public."SupportTicket" USING btree ("createdByTenantId");


--
-- Name: SupportTicket_createdBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SupportTicket_createdBy_idx" ON public."SupportTicket" USING btree ("createdBy");


--
-- Name: SupportTicket_priority_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SupportTicket_priority_idx" ON public."SupportTicket" USING btree (priority);


--
-- Name: SupportTicket_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SupportTicket_propertyId_idx" ON public."SupportTicket" USING btree ("propertyId");


--
-- Name: SupportTicket_serviceProviderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SupportTicket_serviceProviderId_idx" ON public."SupportTicket" USING btree ("serviceProviderId");


--
-- Name: SupportTicket_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SupportTicket_status_idx" ON public."SupportTicket" USING btree (status);


--
-- Name: SupportTicket_ticketNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "SupportTicket_ticketNumber_key" ON public."SupportTicket" USING btree ("ticketNumber");


--
-- Name: SupportTicket_vendorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SupportTicket_vendorId_idx" ON public."SupportTicket" USING btree ("vendorId");


--
-- Name: SystemAnnouncement_endDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SystemAnnouncement_endDate_idx" ON public."SystemAnnouncement" USING btree ("endDate");


--
-- Name: SystemAnnouncement_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SystemAnnouncement_isActive_idx" ON public."SystemAnnouncement" USING btree ("isActive");


--
-- Name: SystemAnnouncement_startDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SystemAnnouncement_startDate_idx" ON public."SystemAnnouncement" USING btree ("startDate");


--
-- Name: TaskReminder_isSent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TaskReminder_isSent_idx" ON public."TaskReminder" USING btree ("isSent");


--
-- Name: TaskReminder_reminderDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TaskReminder_reminderDate_idx" ON public."TaskReminder" USING btree ("reminderDate");


--
-- Name: TaskReminder_taskId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TaskReminder_taskId_idx" ON public."TaskReminder" USING btree ("taskId");


--
-- Name: Task_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Task_category_idx" ON public."Task" USING btree (category);


--
-- Name: Task_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Task_createdAt_idx" ON public."Task" USING btree ("createdAt");


--
-- Name: Task_dueDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Task_dueDate_idx" ON public."Task" USING btree ("dueDate");


--
-- Name: Task_isCompleted_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Task_isCompleted_idx" ON public."Task" USING btree ("isCompleted");


--
-- Name: Task_priority_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Task_priority_idx" ON public."Task" USING btree (priority);


--
-- Name: Task_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Task_propertyId_idx" ON public."Task" USING btree ("propertyId");


--
-- Name: Task_propertyId_isCompleted_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Task_propertyId_isCompleted_idx" ON public."Task" USING btree ("propertyId", "isCompleted");


--
-- Name: Task_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Task_userId_idx" ON public."Task" USING btree ("userId");


--
-- Name: TenantInvitation_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TenantInvitation_email_idx" ON public."TenantInvitation" USING btree (email);


--
-- Name: TenantInvitation_expiresAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TenantInvitation_expiresAt_idx" ON public."TenantInvitation" USING btree ("expiresAt");


--
-- Name: TenantInvitation_invitedBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TenantInvitation_invitedBy_idx" ON public."TenantInvitation" USING btree ("invitedBy");


--
-- Name: TenantInvitation_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TenantInvitation_status_idx" ON public."TenantInvitation" USING btree (status);


--
-- Name: TenantInvitation_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TenantInvitation_tenantId_idx" ON public."TenantInvitation" USING btree ("tenantId");


--
-- Name: TenantInvitation_token_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TenantInvitation_token_idx" ON public."TenantInvitation" USING btree (token);


--
-- Name: TenantInvitation_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "TenantInvitation_token_key" ON public."TenantInvitation" USING btree (token);


--
-- Name: TenantRating_overall_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TenantRating_overall_idx" ON public."TenantRating" USING btree (overall);


--
-- Name: TenantRating_ratedBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TenantRating_ratedBy_idx" ON public."TenantRating" USING btree ("ratedBy");


--
-- Name: TenantRating_tenantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TenantRating_tenantId_idx" ON public."TenantRating" USING btree ("tenantId");


--
-- Name: TenantRating_workOrderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TenantRating_workOrderId_idx" ON public."TenantRating" USING btree ("workOrderId");


--
-- Name: Tenant_approvalStatus_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Tenant_approvalStatus_idx" ON public."Tenant" USING btree ("approvalStatus");


--
-- Name: Tenant_approvedBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Tenant_approvedBy_idx" ON public."Tenant" USING btree ("approvedBy");


--
-- Name: Tenant_countryCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Tenant_countryCode_idx" ON public."Tenant" USING btree ("countryCode");


--
-- Name: Tenant_countryCode_regionCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Tenant_countryCode_regionCode_idx" ON public."Tenant" USING btree ("countryCode", "regionCode");


--
-- Name: Tenant_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Tenant_createdAt_idx" ON public."Tenant" USING btree ("createdAt");


--
-- Name: Tenant_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Tenant_email_key" ON public."Tenant" USING btree (email);


--
-- Name: Tenant_invitationToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Tenant_invitationToken_key" ON public."Tenant" USING btree ("invitationToken");


--
-- Name: Tenant_invitedBy_approvalStatus_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Tenant_invitedBy_approvalStatus_idx" ON public."Tenant" USING btree ("invitedBy", "approvalStatus");


--
-- Name: Tenant_invitedBy_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Tenant_invitedBy_createdAt_idx" ON public."Tenant" USING btree ("invitedBy", "createdAt");


--
-- Name: Tenant_invitedBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Tenant_invitedBy_idx" ON public."Tenant" USING btree ("invitedBy");


--
-- Name: Tenant_tenantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Tenant_tenantId_key" ON public."Tenant" USING btree ("tenantId");


--
-- Name: TicketAttachment_ticketId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TicketAttachment_ticketId_idx" ON public."TicketAttachment" USING btree ("ticketId");


--
-- Name: TicketNote_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TicketNote_createdAt_idx" ON public."TicketNote" USING btree ("createdAt");


--
-- Name: TicketNote_ticketId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TicketNote_ticketId_idx" ON public."TicketNote" USING btree ("ticketId");


--
-- Name: UnifiedVerificationHistory_action_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UnifiedVerificationHistory_action_idx" ON public."UnifiedVerificationHistory" USING btree (action);


--
-- Name: UnifiedVerificationHistory_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UnifiedVerificationHistory_createdAt_idx" ON public."UnifiedVerificationHistory" USING btree ("createdAt");


--
-- Name: UnifiedVerificationHistory_performedBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UnifiedVerificationHistory_performedBy_idx" ON public."UnifiedVerificationHistory" USING btree ("performedBy");


--
-- Name: UnifiedVerificationHistory_verificationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UnifiedVerificationHistory_verificationId_idx" ON public."UnifiedVerificationHistory" USING btree ("verificationId");


--
-- Name: UnifiedVerification_assignedTo_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UnifiedVerification_assignedTo_status_idx" ON public."UnifiedVerification" USING btree ("assignedTo", status);


--
-- Name: UnifiedVerification_dueDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UnifiedVerification_dueDate_idx" ON public."UnifiedVerification" USING btree ("dueDate");


--
-- Name: UnifiedVerification_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UnifiedVerification_entityType_entityId_idx" ON public."UnifiedVerification" USING btree ("entityType", "entityId");


--
-- Name: UnifiedVerification_requestedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UnifiedVerification_requestedAt_idx" ON public."UnifiedVerification" USING btree ("requestedAt");


--
-- Name: UnifiedVerification_requestedBy_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UnifiedVerification_requestedBy_status_idx" ON public."UnifiedVerification" USING btree ("requestedBy", status);


--
-- Name: UnifiedVerification_status_priority_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UnifiedVerification_status_priority_idx" ON public."UnifiedVerification" USING btree (status, priority);


--
-- Name: UnifiedVerification_verificationType_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UnifiedVerification_verificationType_entityType_entityId_idx" ON public."UnifiedVerification" USING btree ("verificationType", "entityType", "entityId");


--
-- Name: UnifiedVerification_verificationType_entityType_entityId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UnifiedVerification_verificationType_entityType_entityId_key" ON public."UnifiedVerification" USING btree ("verificationType", "entityType", "entityId");


--
-- Name: UnifiedVerification_verificationType_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UnifiedVerification_verificationType_status_idx" ON public."UnifiedVerification" USING btree ("verificationType", status);


--
-- Name: UnifiedVerification_verifiedBy_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UnifiedVerification_verifiedBy_status_idx" ON public."UnifiedVerification" USING btree ("verifiedBy", status);


--
-- Name: Unit_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Unit_createdAt_idx" ON public."Unit" USING btree ("createdAt");


--
-- Name: Unit_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Unit_propertyId_idx" ON public."Unit" USING btree ("propertyId");


--
-- Name: UserActivity_action_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserActivity_action_idx" ON public."UserActivity" USING btree (action);


--
-- Name: UserActivity_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserActivity_createdAt_idx" ON public."UserActivity" USING btree ("createdAt");


--
-- Name: UserActivity_userEmail_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserActivity_userEmail_idx" ON public."UserActivity" USING btree ("userEmail");


--
-- Name: UserActivity_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserActivity_userId_idx" ON public."UserActivity" USING btree ("userId");


--
-- Name: UserActivity_userRole_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserActivity_userRole_idx" ON public."UserActivity" USING btree ("userRole");


--
-- Name: UserPermission_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserPermission_category_idx" ON public."UserPermission" USING btree (category);


--
-- Name: UserPermission_userRoleId_category_resource_action_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UserPermission_userRoleId_category_resource_action_key" ON public."UserPermission" USING btree ("userRoleId", category, resource, action);


--
-- Name: UserPermission_userRoleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserPermission_userRoleId_idx" ON public."UserPermission" USING btree ("userRoleId");


--
-- Name: UserRole_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserRole_isActive_idx" ON public."UserRole" USING btree ("isActive");


--
-- Name: UserRole_landlordId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserRole_landlordId_idx" ON public."UserRole" USING btree ("landlordId");


--
-- Name: UserRole_pmcId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserRole_pmcId_idx" ON public."UserRole" USING btree ("pmcId");


--
-- Name: UserRole_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserRole_propertyId_idx" ON public."UserRole" USING btree ("propertyId");


--
-- Name: UserRole_roleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserRole_roleId_idx" ON public."UserRole" USING btree ("roleId");


--
-- Name: UserRole_unitId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserRole_unitId_idx" ON public."UserRole" USING btree ("unitId");


--
-- Name: UserRole_userId_roleId_portfolioId_propertyId_unitId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UserRole_userId_roleId_portfolioId_propertyId_unitId_key" ON public."UserRole" USING btree ("userId", "roleId", "portfolioId", "propertyId", "unitId");


--
-- Name: UserRole_userId_userType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserRole_userId_userType_idx" ON public."UserRole" USING btree ("userId", "userType");


--
-- Name: VendorRating_isBlocked_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "VendorRating_isBlocked_idx" ON public."VendorRating" USING btree ("isBlocked");


--
-- Name: VendorRating_overall_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "VendorRating_overall_idx" ON public."VendorRating" USING btree (overall);


--
-- Name: VendorRating_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "VendorRating_propertyId_idx" ON public."VendorRating" USING btree ("propertyId");


--
-- Name: VendorRating_ratedBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "VendorRating_ratedBy_idx" ON public."VendorRating" USING btree ("ratedBy");


--
-- Name: VendorRating_vendorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "VendorRating_vendorId_idx" ON public."VendorRating" USING btree ("vendorId");


--
-- Name: VendorRating_workOrderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "VendorRating_workOrderId_idx" ON public."VendorRating" USING btree ("workOrderId");


--
-- Name: activity_lo_action_b49f28_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_lo_action_b49f28_idx ON public.activity_logs USING btree (action);


--
-- Name: activity_lo_created_166e11_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_lo_created_166e11_idx ON public.activity_logs USING btree (created_at);


--
-- Name: activity_lo_entity__97ab7c_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_lo_entity__97ab7c_idx ON public.activity_logs USING btree (entity_type);


--
-- Name: activity_lo_landlor_723682_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_lo_landlor_723682_idx ON public.activity_logs USING btree (landlord_id);


--
-- Name: activity_lo_propert_27e73a_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_lo_propert_27e73a_idx ON public.activity_logs USING btree (property_id);


--
-- Name: activity_lo_tenant__f3e8c4_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_lo_tenant__f3e8c4_idx ON public.activity_logs USING btree (tenant_id);


--
-- Name: activity_lo_user_id_072db3_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_lo_user_id_072db3_idx ON public.activity_logs USING btree (user_id);


--
-- Name: activity_lo_user_ro_5b9ca8_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_lo_user_ro_5b9ca8_idx ON public.activity_logs USING btree (user_role);


--
-- Name: activity_logs_action_8ace2550; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_action_8ace2550 ON public.activity_logs USING btree (action);


--
-- Name: activity_logs_action_8ace2550_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_action_8ace2550_like ON public.activity_logs USING btree (action varchar_pattern_ops);


--
-- Name: activity_logs_contractor_id_57e0c76f; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_contractor_id_57e0c76f ON public.activity_logs USING btree (contractor_id);


--
-- Name: activity_logs_contractor_id_57e0c76f_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_contractor_id_57e0c76f_like ON public.activity_logs USING btree (contractor_id varchar_pattern_ops);


--
-- Name: activity_logs_created_at_2048f5f6; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_created_at_2048f5f6 ON public.activity_logs USING btree (created_at);


--
-- Name: activity_logs_landlord_id_b867574d; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_landlord_id_b867574d ON public.activity_logs USING btree (landlord_id);


--
-- Name: activity_logs_landlord_id_b867574d_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_landlord_id_b867574d_like ON public.activity_logs USING btree (landlord_id varchar_pattern_ops);


--
-- Name: activity_logs_pmc_id_3b28bb5b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_pmc_id_3b28bb5b ON public.activity_logs USING btree (pmc_id);


--
-- Name: activity_logs_pmc_id_3b28bb5b_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_pmc_id_3b28bb5b_like ON public.activity_logs USING btree (pmc_id varchar_pattern_ops);


--
-- Name: activity_logs_property_id_531c21ec; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_property_id_531c21ec ON public.activity_logs USING btree (property_id);


--
-- Name: activity_logs_property_id_531c21ec_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_property_id_531c21ec_like ON public.activity_logs USING btree (property_id varchar_pattern_ops);


--
-- Name: activity_logs_tenant_id_6edd96c4; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_tenant_id_6edd96c4 ON public.activity_logs USING btree (tenant_id);


--
-- Name: activity_logs_tenant_id_6edd96c4_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_tenant_id_6edd96c4_like ON public.activity_logs USING btree (tenant_id varchar_pattern_ops);


--
-- Name: activity_logs_user_email_cdb34754; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_user_email_cdb34754 ON public.activity_logs USING btree (user_email);


--
-- Name: activity_logs_user_email_cdb34754_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_user_email_cdb34754_like ON public.activity_logs USING btree (user_email varchar_pattern_ops);


--
-- Name: activity_logs_user_id_60cbbbe3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_user_id_60cbbbe3 ON public.activity_logs USING btree (user_id);


--
-- Name: activity_logs_user_id_60cbbbe3_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_user_id_60cbbbe3_like ON public.activity_logs USING btree (user_id varchar_pattern_ops);


--
-- Name: activity_logs_user_role_748d0476; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_user_role_748d0476 ON public.activity_logs USING btree (user_role);


--
-- Name: activity_logs_user_role_748d0476_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_user_role_748d0476_like ON public.activity_logs USING btree (user_role varchar_pattern_ops);


--
-- Name: activity_logs_vendor_id_91c6783e; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_vendor_id_91c6783e ON public.activity_logs USING btree (vendor_id);


--
-- Name: activity_logs_vendor_id_91c6783e_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_logs_vendor_id_91c6783e_like ON public.activity_logs USING btree (vendor_id varchar_pattern_ops);


--
-- Name: admin_audit_action_d6f52c_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_audit_action_d6f52c_idx ON public.admin_audit_logs USING btree (action);


--
-- Name: admin_audit_admin_i_cbd562_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_audit_admin_i_cbd562_idx ON public.admin_audit_logs USING btree (admin_id);


--
-- Name: admin_audit_created_7f55c8_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_audit_created_7f55c8_idx ON public.admin_audit_logs USING btree (created_at);


--
-- Name: admin_audit_logs_admin_id_018a39c4; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_audit_logs_admin_id_018a39c4 ON public.admin_audit_logs USING btree (admin_id);


--
-- Name: admin_audit_resourc_62162b_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_audit_resourc_62162b_idx ON public.admin_audit_logs USING btree (resource);


--
-- Name: admins_email_bb3581a9_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admins_email_bb3581a9_like ON public.admins USING btree (email varchar_pattern_ops);


--
-- Name: admins_email_fe9722_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admins_email_fe9722_idx ON public.admins USING btree (email);


--
-- Name: admins_google_id_8c52743d_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admins_google_id_8c52743d_like ON public.admins USING btree (google_id varchar_pattern_ops);


--
-- Name: admins_is_acti_5d7c65_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admins_is_acti_5d7c65_idx ON public.admins USING btree (is_active);


--
-- Name: admins_role_baf3bc_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admins_role_baf3bc_idx ON public.admins USING btree (role);


--
-- Name: application_applica_69ff6a_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX application_applica_69ff6a_idx ON public.applications USING btree (applicant_id);


--
-- Name: application_deadlin_9f31e8_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX application_deadlin_9f31e8_idx ON public.applications USING btree (deadline);


--
-- Name: application_is_arch_71bf39_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX application_is_arch_71bf39_idx ON public.applications USING btree (is_archived);


--
-- Name: application_propert_ab2032_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX application_propert_ab2032_idx ON public.applications USING btree (property_id);


--
-- Name: application_status_e61111_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX application_status_e61111_idx ON public.applications USING btree (status);


--
-- Name: application_unit_id_d78c68_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX application_unit_id_d78c68_idx ON public.applications USING btree (unit_id);


--
-- Name: applications_applicant_id_0f5ee165; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX applications_applicant_id_0f5ee165 ON public.applications USING btree (applicant_id);


--
-- Name: applications_applicant_id_0f5ee165_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX applications_applicant_id_0f5ee165_like ON public.applications USING btree (applicant_id varchar_pattern_ops);


--
-- Name: applications_created_at_24b52478; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX applications_created_at_24b52478 ON public.applications USING btree (created_at);


--
-- Name: applications_is_archived_5217ca9c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX applications_is_archived_5217ca9c ON public.applications USING btree (is_archived);


--
-- Name: applications_lease_id_4c79cdc4; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX applications_lease_id_4c79cdc4 ON public.applications USING btree (lease_id);


--
-- Name: applications_property_id_0ad8be6c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX applications_property_id_0ad8be6c ON public.applications USING btree (property_id);


--
-- Name: applications_status_cbf6eacc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX applications_status_cbf6eacc ON public.applications USING btree (status);


--
-- Name: applications_status_cbf6eacc_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX applications_status_cbf6eacc_like ON public.applications USING btree (status varchar_pattern_ops);


--
-- Name: applications_unit_id_6e910712; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX applications_unit_id_6e910712 ON public.applications USING btree (unit_id);


--
-- Name: auth_group_name_a6ea08ec_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_group_name_a6ea08ec_like ON public.auth_group USING btree (name varchar_pattern_ops);


--
-- Name: auth_group_permissions_group_id_b120cbf9; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_group_permissions_group_id_b120cbf9 ON public.auth_group_permissions USING btree (group_id);


--
-- Name: auth_group_permissions_permission_id_84c5c92e; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_group_permissions_permission_id_84c5c92e ON public.auth_group_permissions USING btree (permission_id);


--
-- Name: auth_permission_content_type_id_2f476e4b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_permission_content_type_id_2f476e4b ON public.auth_permission USING btree (content_type_id);


--
-- Name: auth_user_groups_group_id_97559544; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_user_groups_group_id_97559544 ON public.auth_user_groups USING btree (group_id);


--
-- Name: auth_user_groups_user_id_6a12ed8b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_user_groups_user_id_6a12ed8b ON public.auth_user_groups USING btree (user_id);


--
-- Name: auth_user_user_permissions_permission_id_1fbb5f2c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_user_user_permissions_permission_id_1fbb5f2c ON public.auth_user_user_permissions USING btree (permission_id);


--
-- Name: auth_user_user_permissions_user_id_a95ead1b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_user_user_permissions_user_id_a95ead1b ON public.auth_user_user_permissions USING btree (user_id);


--
-- Name: auth_user_username_6821ab7c_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_user_username_6821ab7c_like ON public.auth_user USING btree (username varchar_pattern_ops);


--
-- Name: conversatio_convers_29a8ff_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conversatio_convers_29a8ff_idx ON public.conversations USING btree (conversation_type);


--
-- Name: conversatio_created_cff529_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conversatio_created_cff529_idx ON public.conversations USING btree (created_by);


--
-- Name: conversatio_landlor_9bf0f9_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conversatio_landlor_9bf0f9_idx ON public.conversations USING btree (landlord_id);


--
-- Name: conversatio_last_me_594294_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conversatio_last_me_594294_idx ON public.conversations USING btree (last_message_at);


--
-- Name: conversatio_pmc_id_d6e1d4_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conversatio_pmc_id_d6e1d4_idx ON public.conversations USING btree (pmc_id);


--
-- Name: conversatio_propert_7ce26f_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conversatio_propert_7ce26f_idx ON public.conversations USING btree (property_id);


--
-- Name: conversatio_propert_a7d574_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conversatio_propert_a7d574_idx ON public.conversations USING btree (property_id, landlord_id, tenant_id);


--
-- Name: conversatio_status_742c74_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conversatio_status_742c74_idx ON public.conversations USING btree (status);


--
-- Name: conversatio_tenant__ded3c8_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conversatio_tenant__ded3c8_idx ON public.conversations USING btree (tenant_id);


--
-- Name: conversatio_updated_8d1310_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conversatio_updated_8d1310_idx ON public.conversations USING btree (updated_at);


--
-- Name: conversations_created_by_landlord_id_f5b92127; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conversations_created_by_landlord_id_f5b92127 ON public.conversations USING btree (created_by_landlord_id);


--
-- Name: conversations_created_by_pmc_id_b5e92c97; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conversations_created_by_pmc_id_b5e92c97 ON public.conversations USING btree (created_by_pmc_id);


--
-- Name: conversations_created_by_tenant_id_0368f249; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conversations_created_by_tenant_id_0368f249 ON public.conversations USING btree (created_by_tenant_id);


--
-- Name: conversations_landlord_id_42adf51c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conversations_landlord_id_42adf51c ON public.conversations USING btree (landlord_id);


--
-- Name: conversations_last_message_at_0b136c71; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conversations_last_message_at_0b136c71 ON public.conversations USING btree (last_message_at);


--
-- Name: conversations_last_message_id_77a159de; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conversations_last_message_id_77a159de ON public.conversations USING btree (last_message_id);


--
-- Name: conversations_pmc_id_457b99ee; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conversations_pmc_id_457b99ee ON public.conversations USING btree (pmc_id);


--
-- Name: conversations_property_id_223306ad; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conversations_property_id_223306ad ON public.conversations USING btree (property_id);


--
-- Name: conversations_status_3602c06c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conversations_status_3602c06c ON public.conversations USING btree (status);


--
-- Name: conversations_status_3602c06c_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conversations_status_3602c06c_like ON public.conversations USING btree (status varchar_pattern_ops);


--
-- Name: conversations_tenant_id_63d250b6; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conversations_tenant_id_63d250b6 ON public.conversations USING btree (tenant_id);


--
-- Name: conversations_updated_at_ae2706b5; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conversations_updated_at_ae2706b5 ON public.conversations USING btree (updated_at);


--
-- Name: django_admin_log_content_type_id_c4bce8eb; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX django_admin_log_content_type_id_c4bce8eb ON public.django_admin_log USING btree (content_type_id);


--
-- Name: django_admin_log_user_id_c564eba6; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX django_admin_log_user_id_c564eba6 ON public.django_admin_log USING btree (user_id);


--
-- Name: django_session_expire_date_a5c62663; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX django_session_expire_date_a5c62663 ON public.django_session USING btree (expire_date);


--
-- Name: django_session_session_key_c0390e0f_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX django_session_session_key_c0390e0f_like ON public.django_session USING btree (session_key varchar_pattern_ops);


--
-- Name: document_au_action_43d50b_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX document_au_action_43d50b_idx ON public.document_audit_logs USING btree (action);


--
-- Name: document_au_documen_6f8d8b_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX document_au_documen_6f8d8b_idx ON public.document_audit_logs USING btree (document_id);


--
-- Name: document_audit_logs_action_8d8ac79b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX document_audit_logs_action_8d8ac79b ON public.document_audit_logs USING btree (action);


--
-- Name: document_audit_logs_action_8d8ac79b_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX document_audit_logs_action_8d8ac79b_like ON public.document_audit_logs USING btree (action varchar_pattern_ops);


--
-- Name: document_audit_logs_document_id_25cb0c86; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX document_audit_logs_document_id_25cb0c86 ON public.document_audit_logs USING btree (document_id);


--
-- Name: document_me_documen_377a87_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX document_me_documen_377a87_idx ON public.document_messages USING btree (document_id);


--
-- Name: document_me_documen_743989_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX document_me_documen_743989_idx ON public.document_messages USING btree (document_id, is_read);


--
-- Name: document_me_is_read_1ccb29_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX document_me_is_read_1ccb29_idx ON public.document_messages USING btree (is_read);


--
-- Name: document_me_sender__04c624_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX document_me_sender__04c624_idx ON public.document_messages USING btree (sender_role);


--
-- Name: document_messages_document_id_c061effd; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX document_messages_document_id_c061effd ON public.document_messages USING btree (document_id);


--
-- Name: document_messages_is_read_13894514; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX document_messages_is_read_13894514 ON public.document_messages USING btree (is_read);


--
-- Name: document_messages_sender_role_84fa163a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX document_messages_sender_role_84fa163a ON public.document_messages USING btree (sender_role);


--
-- Name: document_messages_sender_role_84fa163a_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX document_messages_sender_role_84fa163a_like ON public.document_messages USING btree (sender_role varchar_pattern_ops);


--
-- Name: documents_categor_f8ad6f_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX documents_categor_f8ad6f_idx ON public.documents USING btree (category);


--
-- Name: documents_category_fe10278c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX documents_category_fe10278c ON public.documents USING btree (category);


--
-- Name: documents_category_fe10278c_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX documents_category_fe10278c_like ON public.documents USING btree (category varchar_pattern_ops);


--
-- Name: documents_document_hash_fe3a625f_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX documents_document_hash_fe3a625f_like ON public.documents USING btree (document_hash varchar_pattern_ops);


--
-- Name: documents_expirat_e43349_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX documents_expirat_e43349_idx ON public.documents USING btree (expiration_date);


--
-- Name: documents_expiration_date_ae161561; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX documents_expiration_date_ae161561 ON public.documents USING btree (expiration_date);


--
-- Name: documents_is_dele_636b14_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX documents_is_dele_636b14_idx ON public.documents USING btree (is_deleted);


--
-- Name: documents_is_deleted_1901192a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX documents_is_deleted_1901192a ON public.documents USING btree (is_deleted);


--
-- Name: documents_is_requ_25245c_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX documents_is_requ_25245c_idx ON public.documents USING btree (is_required);


--
-- Name: documents_is_required_3d946174; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX documents_is_required_3d946174 ON public.documents USING btree (is_required);


--
-- Name: documents_is_veri_fb0cb5_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX documents_is_veri_fb0cb5_idx ON public.documents USING btree (is_verified);


--
-- Name: documents_is_verified_e15ef765; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX documents_is_verified_e15ef765 ON public.documents USING btree (is_verified);


--
-- Name: documents_propert_05f5d3_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX documents_propert_05f5d3_idx ON public.documents USING btree (property_id);


--
-- Name: documents_propert_24e8fd_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX documents_propert_24e8fd_idx ON public.documents USING btree (property_id, is_deleted);


--
-- Name: documents_property_id_fbab1a82; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX documents_property_id_fbab1a82 ON public.documents USING btree (property_id);


--
-- Name: documents_tenant__953d9b_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX documents_tenant__953d9b_idx ON public.documents USING btree (tenant_id, is_deleted);


--
-- Name: documents_tenant__ad8c7d_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX documents_tenant__ad8c7d_idx ON public.documents USING btree (tenant_id);


--
-- Name: documents_tenant__af78d5_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX documents_tenant__af78d5_idx ON public.documents USING btree (tenant_id, category);


--
-- Name: documents_tenant_id_e8ee60b1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX documents_tenant_id_e8ee60b1 ON public.documents USING btree (tenant_id);


--
-- Name: documents_uploade_d6a956_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX documents_uploade_d6a956_idx ON public.documents USING btree (uploaded_at);


--
-- Name: documents_uploaded_at_feb094d7; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX documents_uploaded_at_feb094d7 ON public.documents USING btree (uploaded_at);


--
-- Name: expenses_categor_a6f264_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX expenses_categor_a6f264_idx ON public.expenses USING btree (category);


--
-- Name: expenses_expense_43600a_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX expenses_expense_43600a_idx ON public.expenses USING btree (expense_date);


--
-- Name: expenses_expense_id_0e3511ea_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX expenses_expense_id_0e3511ea_like ON public.expenses USING btree (expense_id varchar_pattern_ops);


--
-- Name: expenses_propert_7de532_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX expenses_propert_7de532_idx ON public.expenses USING btree (property_id);


--
-- Name: expenses_property_id_95dbed3f; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX expenses_property_id_95dbed3f ON public.expenses USING btree (property_id);


--
-- Name: expenses_property_id_95dbed3f_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX expenses_property_id_95dbed3f_like ON public.expenses USING btree (property_id varchar_pattern_ops);


--
-- Name: expenses_status_86293f_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX expenses_status_86293f_idx ON public.expenses USING btree (status);


--
-- Name: inspection__checkli_f2d135_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inspection__checkli_f2d135_idx ON public.inspection_checklists USING btree (checklist_type);


--
-- Name: inspection__checkli_faac90_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inspection__checkli_faac90_idx ON public.inspection_checklist_items USING btree (checklist_id);


--
-- Name: inspection__item_id_f6e4de_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inspection__item_id_f6e4de_idx ON public.inspection_checklist_items USING btree (item_id);


--
-- Name: inspection__status_7f28b9_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inspection__status_7f28b9_idx ON public.inspection_checklists USING btree (status);


--
-- Name: inspection__submitt_dcd347_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inspection__submitt_dcd347_idx ON public.inspection_checklists USING btree (submitted_at);


--
-- Name: inspection__tenant__0c6122_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inspection__tenant__0c6122_idx ON public.inspection_checklists USING btree (tenant_id);


--
-- Name: inspection_checklist_items_checklist_id_814bd073; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inspection_checklist_items_checklist_id_814bd073 ON public.inspection_checklist_items USING btree (checklist_id);


--
-- Name: inspection_checklist_items_item_id_6a5f121b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inspection_checklist_items_item_id_6a5f121b ON public.inspection_checklist_items USING btree (item_id);


--
-- Name: inspection_checklist_items_item_id_6a5f121b_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inspection_checklist_items_item_id_6a5f121b_like ON public.inspection_checklist_items USING btree (item_id varchar_pattern_ops);


--
-- Name: inspection_checklists_checklist_type_486f5d18; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inspection_checklists_checklist_type_486f5d18 ON public.inspection_checklists USING btree (checklist_type);


--
-- Name: inspection_checklists_checklist_type_486f5d18_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inspection_checklists_checklist_type_486f5d18_like ON public.inspection_checklists USING btree (checklist_type varchar_pattern_ops);


--
-- Name: inspection_checklists_created_at_2c745864; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inspection_checklists_created_at_2c745864 ON public.inspection_checklists USING btree (created_at);


--
-- Name: inspection_checklists_lease_id_32218ae9; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inspection_checklists_lease_id_32218ae9 ON public.inspection_checklists USING btree (lease_id);


--
-- Name: inspection_checklists_property_id_61480fdb; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inspection_checklists_property_id_61480fdb ON public.inspection_checklists USING btree (property_id);


--
-- Name: inspection_checklists_status_d89b783b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inspection_checklists_status_d89b783b ON public.inspection_checklists USING btree (status);


--
-- Name: inspection_checklists_status_d89b783b_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inspection_checklists_status_d89b783b_like ON public.inspection_checklists USING btree (status varchar_pattern_ops);


--
-- Name: inspection_checklists_tenant_id_24003fa2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inspection_checklists_tenant_id_24003fa2 ON public.inspection_checklists USING btree (tenant_id);


--
-- Name: inspection_checklists_unit_id_6cfeb24a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inspection_checklists_unit_id_6cfeb24a ON public.inspection_checklists USING btree (unit_id);


--
-- Name: invitations_created_acaa38_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_created_acaa38_idx ON public.invitations USING btree (created_at);


--
-- Name: invitations_created_at_c8f4cd72; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_created_at_c8f4cd72 ON public.invitations USING btree (created_at);


--
-- Name: invitations_email_6e7169_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_email_6e7169_idx ON public.invitations USING btree (email);


--
-- Name: invitations_expires_7f52c2_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_expires_7f52c2_idx ON public.invitations USING btree (expires_at);


--
-- Name: invitations_expires_at_56f4996b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_expires_at_56f4996b ON public.invitations USING btree (expires_at);


--
-- Name: invitations_invitat_4a90a2_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_invitat_4a90a2_idx ON public.invitations USING btree (invitation_type);


--
-- Name: invitations_invitation_type_0df640df; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_invitation_type_0df640df ON public.invitations USING btree (invitation_type);


--
-- Name: invitations_invitation_type_0df640df_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_invitation_type_0df640df_like ON public.invitations USING btree (invitation_type varchar_pattern_ops);


--
-- Name: invitations_invited_a40353_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_invited_a40353_idx ON public.invitations USING btree (invited_by);


--
-- Name: invitations_invited_by_admin_id_425bd758; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_invited_by_admin_id_425bd758 ON public.invitations USING btree (invited_by_admin_id);


--
-- Name: invitations_invited_by_landlord_id_a26e8d42; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_invited_by_landlord_id_a26e8d42 ON public.invitations USING btree (invited_by_landlord_id);


--
-- Name: invitations_invited_by_pmc_id_a5c2cb6b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_invited_by_pmc_id_a5c2cb6b ON public.invitations USING btree (invited_by_pmc_id);


--
-- Name: invitations_landlord_id_e6185590; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_landlord_id_e6185590 ON public.invitations USING btree (landlord_id);


--
-- Name: invitations_landlord_id_e6185590_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_landlord_id_e6185590_like ON public.invitations USING btree (landlord_id varchar_pattern_ops);


--
-- Name: invitations_pmc_id_d397378c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_pmc_id_d397378c ON public.invitations USING btree (pmc_id);


--
-- Name: invitations_pmc_id_d397378c_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_pmc_id_d397378c_like ON public.invitations USING btree (pmc_id varchar_pattern_ops);


--
-- Name: invitations_service_provider_id_290dda02; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_service_provider_id_290dda02 ON public.invitations USING btree (service_provider_id);


--
-- Name: invitations_service_provider_id_290dda02_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_service_provider_id_290dda02_like ON public.invitations USING btree (service_provider_id varchar_pattern_ops);


--
-- Name: invitations_status_1739b8_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_status_1739b8_idx ON public.invitations USING btree (status);


--
-- Name: invitations_status_336d317f; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_status_336d317f ON public.invitations USING btree (status);


--
-- Name: invitations_status_336d317f_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_status_336d317f_like ON public.invitations USING btree (status varchar_pattern_ops);


--
-- Name: invitations_tenant_id_d48870c8; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_tenant_id_d48870c8 ON public.invitations USING btree (tenant_id);


--
-- Name: invitations_tenant_id_d48870c8_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_tenant_id_d48870c8_like ON public.invitations USING btree (tenant_id varchar_pattern_ops);


--
-- Name: invitations_token_0a7ec4b1_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_token_0a7ec4b1_like ON public.invitations USING btree (token varchar_pattern_ops);


--
-- Name: invitations_token_5b330c_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_token_5b330c_idx ON public.invitations USING btree (token);


--
-- Name: landlords_approva_244d24_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX landlords_approva_244d24_idx ON public.landlords USING btree (approval_status);


--
-- Name: landlords_country_1b4e9a_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX landlords_country_1b4e9a_idx ON public.landlords USING btree (country_code);


--
-- Name: landlords_created_30d5fc_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX landlords_created_30d5fc_idx ON public.landlords USING btree (created_at);


--
-- Name: landlords_email_eda358ef_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX landlords_email_eda358ef_like ON public.landlords USING btree (email varchar_pattern_ops);


--
-- Name: landlords_email_f0e0ae_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX landlords_email_f0e0ae_idx ON public.landlords USING btree (email);


--
-- Name: landlords_landlord_id_766e0109_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX landlords_landlord_id_766e0109_like ON public.landlords USING btree (landlord_id varchar_pattern_ops);


--
-- Name: lease_docum_lease_i_4b280e_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lease_docum_lease_i_4b280e_idx ON public.lease_documents USING btree (lease_id);


--
-- Name: lease_docum_uploade_48881a_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lease_docum_uploade_48881a_idx ON public.lease_documents USING btree (uploaded_at);


--
-- Name: lease_documents_document_id_3ce45673_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lease_documents_document_id_3ce45673_like ON public.lease_documents USING btree (document_id varchar_pattern_ops);


--
-- Name: lease_documents_lease_id_9fa252d5; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lease_documents_lease_id_9fa252d5 ON public.lease_documents USING btree (lease_id);


--
-- Name: lease_tenan_lease_i_5e2058_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lease_tenan_lease_i_5e2058_idx ON public.lease_tenants USING btree (lease_id);


--
-- Name: lease_tenan_tenant__abacd4_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lease_tenan_tenant__abacd4_idx ON public.lease_tenants USING btree (tenant_id);


--
-- Name: lease_tenants_lease_id_d7889287; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lease_tenants_lease_id_d7889287 ON public.lease_tenants USING btree (lease_id);


--
-- Name: lease_tenants_tenant_id_bc73557b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lease_tenants_tenant_id_bc73557b ON public.lease_tenants USING btree (tenant_id);


--
-- Name: lease_termi_lease_i_aa9629_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lease_termi_lease_i_aa9629_idx ON public.lease_terminations USING btree (lease_id);


--
-- Name: lease_termi_status_53dc05_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lease_termi_status_53dc05_idx ON public.lease_terminations USING btree (status);


--
-- Name: lease_termi_termina_fc1192_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lease_termi_termina_fc1192_idx ON public.lease_terminations USING btree (termination_date);


--
-- Name: lease_terminations_lease_id_3819d680; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lease_terminations_lease_id_3819d680 ON public.lease_terminations USING btree (lease_id);


--
-- Name: lease_terminations_termination_id_ba3326a7_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lease_terminations_termination_id_ba3326a7_like ON public.lease_terminations USING btree (termination_id varchar_pattern_ops);


--
-- Name: leases_created_8c055a_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leases_created_8c055a_idx ON public.leases USING btree (created_at);


--
-- Name: leases_lease_e_c4bfe7_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leases_lease_e_c4bfe7_idx ON public.leases USING btree (lease_end);


--
-- Name: leases_lease_id_657c6704_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leases_lease_id_657c6704_like ON public.leases USING btree (lease_id varchar_pattern_ops);


--
-- Name: leases_renewal_c54c87_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leases_renewal_c54c87_idx ON public.leases USING btree (renewal_reminder_sent);


--
-- Name: leases_status_3db7e6_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leases_status_3db7e6_idx ON public.leases USING btree (status);


--
-- Name: leases_unit_id_723755_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leases_unit_id_723755_idx ON public.leases USING btree (unit_id);


--
-- Name: leases_unit_id_b1551a5a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leases_unit_id_b1551a5a ON public.leases USING btree (unit_id);


--
-- Name: ltb_documen_audienc_cf6542_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ltb_documen_audienc_cf6542_idx ON public.ltb_documents USING btree (audience);


--
-- Name: ltb_documen_categor_522d48_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ltb_documen_categor_522d48_idx ON public.ltb_documents USING btree (category);


--
-- Name: ltb_documen_country_20a08a_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ltb_documen_country_20a08a_idx ON public.ltb_documents USING btree (country, province);


--
-- Name: ltb_documents_audience_cc912a23; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ltb_documents_audience_cc912a23 ON public.ltb_documents USING btree (audience);


--
-- Name: ltb_documents_audience_cc912a23_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ltb_documents_audience_cc912a23_like ON public.ltb_documents USING btree (audience varchar_pattern_ops);


--
-- Name: ltb_documents_category_d5740d27; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ltb_documents_category_d5740d27 ON public.ltb_documents USING btree (category);


--
-- Name: ltb_documents_category_d5740d27_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ltb_documents_category_d5740d27_like ON public.ltb_documents USING btree (category varchar_pattern_ops);


--
-- Name: ltb_documents_country_599a5435; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ltb_documents_country_599a5435 ON public.ltb_documents USING btree (country);


--
-- Name: ltb_documents_country_599a5435_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ltb_documents_country_599a5435_like ON public.ltb_documents USING btree (country varchar_pattern_ops);


--
-- Name: ltb_documents_form_number_341f5dfe_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ltb_documents_form_number_341f5dfe_like ON public.ltb_documents USING btree (form_number varchar_pattern_ops);


--
-- Name: ltb_documents_province_b7348f4d; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ltb_documents_province_b7348f4d ON public.ltb_documents USING btree (province);


--
-- Name: ltb_documents_province_b7348f4d_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ltb_documents_province_b7348f4d_like ON public.ltb_documents USING btree (province varchar_pattern_ops);


--
-- Name: maintenance_categor_1e2358_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX maintenance_categor_1e2358_idx ON public.maintenance_requests USING btree (category);


--
-- Name: maintenance_comments_comment_id_c7cddebd_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX maintenance_comments_comment_id_c7cddebd_like ON public.maintenance_comments USING btree (comment_id varchar_pattern_ops);


--
-- Name: maintenance_comments_maintenance_request_id_0d44cb74; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX maintenance_comments_maintenance_request_id_0d44cb74 ON public.maintenance_comments USING btree (maintenance_request_id);


--
-- Name: maintenance_created_fd59e4_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX maintenance_created_fd59e4_idx ON public.maintenance_comments USING btree (created_at);


--
-- Name: maintenance_mainten_147f63_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX maintenance_mainten_147f63_idx ON public.maintenance_comments USING btree (maintenance_request_id);


--
-- Name: maintenance_priorit_7af9c2_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX maintenance_priorit_7af9c2_idx ON public.maintenance_requests USING btree (priority);


--
-- Name: maintenance_propert_0f8de6_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX maintenance_propert_0f8de6_idx ON public.maintenance_requests USING btree (property_id);


--
-- Name: maintenance_request_1d7aad_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX maintenance_request_1d7aad_idx ON public.maintenance_requests USING btree (requested_date);


--
-- Name: maintenance_requests_property_id_021e62fc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX maintenance_requests_property_id_021e62fc ON public.maintenance_requests USING btree (property_id);


--
-- Name: maintenance_requests_request_id_46618c2c_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX maintenance_requests_request_id_46618c2c_like ON public.maintenance_requests USING btree (request_id varchar_pattern_ops);


--
-- Name: maintenance_requests_tenant_id_aa080cc5; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX maintenance_requests_tenant_id_aa080cc5 ON public.maintenance_requests USING btree (tenant_id);


--
-- Name: maintenance_requests_ticket_number_60b41cac_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX maintenance_requests_ticket_number_60b41cac_like ON public.maintenance_requests USING btree (ticket_number varchar_pattern_ops);


--
-- Name: maintenance_status_b8d89d_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX maintenance_status_b8d89d_idx ON public.maintenance_requests USING btree (status);


--
-- Name: maintenance_tenant__dde1e0_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX maintenance_tenant__dde1e0_idx ON public.maintenance_requests USING btree (tenant_id);


--
-- Name: maintenance_ticket__99e465_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX maintenance_ticket__99e465_idx ON public.maintenance_requests USING btree (ticket_number);


--
-- Name: message_att_message_2a1fa5_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX message_att_message_2a1fa5_idx ON public.message_attachments USING btree (message_id);


--
-- Name: message_att_uploade_690065_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX message_att_uploade_690065_idx ON public.message_attachments USING btree (uploaded_at);


--
-- Name: message_attachments_message_id_c7a3e22d; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX message_attachments_message_id_c7a3e22d ON public.message_attachments USING btree (message_id);


--
-- Name: message_attachments_uploaded_at_c9d24984; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX message_attachments_uploaded_at_c9d24984 ON public.message_attachments USING btree (uploaded_at);


--
-- Name: messages_convers_8904b4_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX messages_convers_8904b4_idx ON public.messages USING btree (conversation_id);


--
-- Name: messages_conversation_id_5ef638db; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX messages_conversation_id_5ef638db ON public.messages USING btree (conversation_id);


--
-- Name: messages_created_919c58_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX messages_created_919c58_idx ON public.messages USING btree (created_at);


--
-- Name: messages_created_at_d656d481; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX messages_created_at_d656d481 ON public.messages USING btree (created_at);


--
-- Name: messages_is_dele_54348c_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX messages_is_dele_54348c_idx ON public.messages USING btree (is_deleted);


--
-- Name: messages_is_read_5765e5e1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX messages_is_read_5765e5e1 ON public.messages USING btree (is_read);


--
-- Name: messages_is_read_6a69c0_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX messages_is_read_6a69c0_idx ON public.messages USING btree (is_read);


--
-- Name: messages_sender__d77337_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX messages_sender__d77337_idx ON public.messages USING btree (sender_role);


--
-- Name: messages_sender_landlord_id_7f3a2b96; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX messages_sender_landlord_id_7f3a2b96 ON public.messages USING btree (sender_landlord_id);


--
-- Name: messages_sender_pmc_id_1da16db2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX messages_sender_pmc_id_1da16db2 ON public.messages USING btree (sender_pmc_id);


--
-- Name: messages_sender_tenant_id_45433f53; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX messages_sender_tenant_id_45433f53 ON public.messages USING btree (sender_tenant_id);


--
-- Name: notificatio_created_e4c995_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notificatio_created_e4c995_idx ON public.notifications USING btree (created_at);


--
-- Name: notificatio_entity__519f8a_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notificatio_entity__519f8a_idx ON public.notifications USING btree (entity_type, entity_id);


--
-- Name: notificatio_is_read_3f8c44_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notificatio_is_read_3f8c44_idx ON public.notifications USING btree (is_read);


--
-- Name: notificatio_notific_19df93_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notificatio_notific_19df93_idx ON public.notifications USING btree (notification_type);


--
-- Name: notificatio_notific_b3f2fe_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notificatio_notific_b3f2fe_idx ON public.notification_preferences USING btree (notification_type);


--
-- Name: notificatio_user_id_1fce52_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notificatio_user_id_1fce52_idx ON public.notifications USING btree (user_id, user_role);


--
-- Name: notificatio_user_id_78bb78_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notificatio_user_id_78bb78_idx ON public.notification_preferences USING btree (user_id, user_role);


--
-- Name: notification_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notification_createdAt_idx" ON public.notification USING btree ("createdAt");


--
-- Name: notification_emailSent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notification_emailSent_idx" ON public.notification USING btree ("emailSent");


--
-- Name: notification_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notification_entityType_entityId_idx" ON public.notification USING btree ("entityType", "entityId");


--
-- Name: notification_preference_notificationType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notification_preference_notificationType_idx" ON public.notification_preference USING btree ("notificationType");


--
-- Name: notification_preference_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notification_preference_userId_idx" ON public.notification_preference USING btree ("userId");


--
-- Name: notification_preference_userId_notificationType_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "notification_preference_userId_notificationType_key" ON public.notification_preference USING btree ("userId", "notificationType");


--
-- Name: notification_preference_userRole_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notification_preference_userRole_idx" ON public.notification_preference USING btree ("userRole");


--
-- Name: notification_preferences_user_id_08802827; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notification_preferences_user_id_08802827 ON public.notification_preferences USING btree (user_id);


--
-- Name: notification_preferences_user_id_08802827_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notification_preferences_user_id_08802827_like ON public.notification_preferences USING btree (user_id varchar_pattern_ops);


--
-- Name: notification_preferences_user_role_52fd7c79; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notification_preferences_user_role_52fd7c79 ON public.notification_preferences USING btree (user_role);


--
-- Name: notification_preferences_user_role_52fd7c79_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notification_preferences_user_role_52fd7c79_like ON public.notification_preferences USING btree (user_role varchar_pattern_ops);


--
-- Name: notification_priority_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notification_priority_idx ON public.notification USING btree (priority);


--
-- Name: notification_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notification_type_idx ON public.notification USING btree (type);


--
-- Name: notification_userId_isArchived_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notification_userId_isArchived_idx" ON public.notification USING btree ("userId", "isArchived");


--
-- Name: notification_userId_isRead_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notification_userId_isRead_idx" ON public.notification USING btree ("userId", "isRead");


--
-- Name: notification_userRole_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notification_userRole_idx" ON public.notification USING btree ("userRole");


--
-- Name: notifications_created_at_878ec15c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_created_at_878ec15c ON public.notifications USING btree (created_at);


--
-- Name: notifications_is_read_27cb7368; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_is_read_27cb7368 ON public.notifications USING btree (is_read);


--
-- Name: notifications_notification_type_6222bc26; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_notification_type_6222bc26 ON public.notifications USING btree (notification_type);


--
-- Name: notifications_notification_type_6222bc26_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_notification_type_6222bc26_like ON public.notifications USING btree (notification_type varchar_pattern_ops);


--
-- Name: notifications_user_id_468e288d; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_user_id_468e288d ON public.notifications USING btree (user_id);


--
-- Name: notifications_user_id_468e288d_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_user_id_468e288d_like ON public.notifications USING btree (user_id varchar_pattern_ops);


--
-- Name: notifications_user_role_8559692a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_user_role_8559692a ON public.notifications USING btree (user_role);


--
-- Name: notifications_user_role_8559692a_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_user_role_8559692a_like ON public.notifications USING btree (user_role varchar_pattern_ops);


--
-- Name: organizatio_plan_b94df1_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX organizatio_plan_b94df1_idx ON public.organizations USING btree (plan);


--
-- Name: organizatio_status_195db0_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX organizatio_status_195db0_idx ON public.organizations USING btree (status);


--
-- Name: organizatio_subdoma_e70a89_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX organizatio_subdoma_e70a89_idx ON public.organizations USING btree (subdomain);


--
-- Name: organizatio_subscri_72b760_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX organizatio_subscri_72b760_idx ON public.organizations USING btree (subscription_status);


--
-- Name: organization_settings_custom_domain_8bfa67de_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX organization_settings_custom_domain_8bfa67de_like ON public.organization_settings USING btree (custom_domain varchar_pattern_ops);


--
-- Name: organizations_subdomain_4e20d455_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX organizations_subdomain_4e20d455_like ON public.organizations USING btree (subdomain varchar_pattern_ops);


--
-- Name: permissions_action_208379_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX permissions_action_208379_idx ON public.permissions USING btree (action);


--
-- Name: permissions_categor_b3ddb9_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX permissions_categor_b3ddb9_idx ON public.permissions USING btree (category);


--
-- Name: permissions_resourc_8c0693_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX permissions_resourc_8c0693_idx ON public.permissions USING btree (resource);


--
-- Name: properties_city_c34f4f_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX properties_city_c34f4f_idx ON public.properties USING btree (city);


--
-- Name: properties_landlor_736d10_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX properties_landlor_736d10_idx ON public.properties USING btree (landlord_id);


--
-- Name: properties_pmc_id_381bca_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX properties_pmc_id_381bca_idx ON public.properties USING btree (pmc_id);


--
-- Name: properties_propert_f38ecc_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX properties_propert_f38ecc_idx ON public.properties USING btree (property_type);


--
-- Name: properties_status_e6008a_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX properties_status_e6008a_idx ON public.properties USING btree (status);


--
-- Name: property_ex_categor_d46097_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX property_ex_categor_d46097_idx ON public.property_expenses USING btree (category);


--
-- Name: property_ex_created_382b19_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX property_ex_created_382b19_idx ON public.property_expenses USING btree (created_by);


--
-- Name: property_ex_date_05fc31_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX property_ex_date_05fc31_idx ON public.property_expenses USING btree (date);


--
-- Name: property_ex_mainten_f45ec0_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX property_ex_mainten_f45ec0_idx ON public.property_expenses USING btree (maintenance_request_id);


--
-- Name: property_ex_pmc_id_e91bee_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX property_ex_pmc_id_e91bee_idx ON public.property_expenses USING btree (pmc_id);


--
-- Name: property_ex_propert_4416f0_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX property_ex_propert_4416f0_idx ON public.property_expenses USING btree (property_id, date);


--
-- Name: property_ex_propert_d6b28f_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX property_ex_propert_d6b28f_idx ON public.property_expenses USING btree (property_id);


--
-- Name: property_expenses_category_94da9ba1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX property_expenses_category_94da9ba1 ON public.property_expenses USING btree (category);


--
-- Name: property_expenses_category_94da9ba1_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX property_expenses_category_94da9ba1_like ON public.property_expenses USING btree (category varchar_pattern_ops);


--
-- Name: property_expenses_created_at_0c79de80; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX property_expenses_created_at_0c79de80 ON public.property_expenses USING btree (created_at);


--
-- Name: property_expenses_date_c61f8d70; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX property_expenses_date_c61f8d70 ON public.property_expenses USING btree (date);


--
-- Name: property_expenses_maintenance_request_id_a58eb9ff; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX property_expenses_maintenance_request_id_a58eb9ff ON public.property_expenses USING btree (maintenance_request_id);


--
-- Name: property_expenses_pmc_approval_request_id_ccd22b20_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX property_expenses_pmc_approval_request_id_ccd22b20_like ON public.property_expenses USING btree (pmc_approval_request_id varchar_pattern_ops);


--
-- Name: property_expenses_pmc_id_d76045d1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX property_expenses_pmc_id_d76045d1 ON public.property_expenses USING btree (pmc_id);


--
-- Name: property_expenses_pmc_id_d76045d1_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX property_expenses_pmc_id_d76045d1_like ON public.property_expenses USING btree (pmc_id varchar_pattern_ops);


--
-- Name: property_expenses_property_id_a1fa5889; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX property_expenses_property_id_a1fa5889 ON public.property_expenses USING btree (property_id);


--
-- Name: property_ma_approva_54ff6b_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX property_ma_approva_54ff6b_idx ON public.property_management_companies USING btree (approval_status);


--
-- Name: property_ma_company_b27e29_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX property_ma_company_b27e29_idx ON public.property_management_companies USING btree (company_id);


--
-- Name: property_ma_created_98752f_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX property_ma_created_98752f_idx ON public.property_management_companies USING btree (created_at);


--
-- Name: property_ma_email_88f969_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX property_ma_email_88f969_idx ON public.property_management_companies USING btree (email);


--
-- Name: property_ma_is_acti_d318a6_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX property_ma_is_acti_d318a6_idx ON public.property_management_companies USING btree (is_active);


--
-- Name: property_management_companies_company_id_9ff488cf_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX property_management_companies_company_id_9ff488cf_like ON public.property_management_companies USING btree (company_id varchar_pattern_ops);


--
-- Name: property_management_companies_email_644bd31a_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX property_management_companies_email_644bd31a_like ON public.property_management_companies USING btree (email varchar_pattern_ops);


--
-- Name: rent_paymen_created_b131ad_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rent_paymen_created_b131ad_idx ON public.rent_payments USING btree (created_at);


--
-- Name: rent_paymen_lease_i_b71699_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rent_paymen_lease_i_b71699_idx ON public.rent_payments USING btree (lease_id);


--
-- Name: rent_paymen_payment_0ccac6_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rent_paymen_payment_0ccac6_idx ON public.rent_payments USING btree (payment_date);


--
-- Name: rent_paymen_payment_1cdb29_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rent_paymen_payment_1cdb29_idx ON public.rent_payments USING btree (payment_for_month);


--
-- Name: rent_paymen_status_51c70c_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rent_paymen_status_51c70c_idx ON public.rent_payments USING btree (status);


--
-- Name: rent_payments_lease_id_98e8b86f; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rent_payments_lease_id_98e8b86f ON public.rent_payments USING btree (lease_id);


--
-- Name: rent_payments_payment_id_e7847664_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rent_payments_payment_id_e7847664_like ON public.rent_payments USING btree (payment_id varchar_pattern_ops);


--
-- Name: role_permissions_permission_id_ad343843; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX role_permissions_permission_id_ad343843 ON public.role_permissions USING btree (permission_id);


--
-- Name: role_permissions_role_id_216516f2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX role_permissions_role_id_216516f2 ON public.role_permissions USING btree (role_id);


--
-- Name: roles_created_b45fd8_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX roles_created_b45fd8_idx ON public.roles USING btree (created_by_pmc_id);


--
-- Name: roles_is_acti_723ee4_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX roles_is_acti_723ee4_idx ON public.roles USING btree (is_active);


--
-- Name: roles_name_51259447_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX roles_name_51259447_like ON public.roles USING btree (name varchar_pattern_ops);


--
-- Name: roles_name_a96913_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX roles_name_a96913_idx ON public.roles USING btree (name);


--
-- Name: security_de_lease_i_ab61e0_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX security_de_lease_i_ab61e0_idx ON public.security_deposits USING btree (lease_id);


--
-- Name: security_de_receive_9e2b3f_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX security_de_receive_9e2b3f_idx ON public.security_deposits USING btree (received_date);


--
-- Name: security_de_status_a3e060_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX security_de_status_a3e060_idx ON public.security_deposits USING btree (status);


--
-- Name: security_deposits_deposit_id_1bf95db2_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX security_deposits_deposit_id_1bf95db2_like ON public.security_deposits USING btree (deposit_id varchar_pattern_ops);


--
-- Name: security_deposits_lease_id_c1d203da; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX security_deposits_lease_id_c1d203da ON public.security_deposits USING btree (lease_id);


--
-- Name: service_pro_approva_b74ed1_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX service_pro_approva_b74ed1_idx ON public.service_providers USING btree (approval_status);


--
-- Name: service_pro_created_c68120_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX service_pro_created_c68120_idx ON public.service_provider_ratings USING btree (created_at);


--
-- Name: service_pro_created_f0ae23_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX service_pro_created_f0ae23_idx ON public.service_providers USING btree (created_at);


--
-- Name: service_pro_email_bd39fa_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX service_pro_email_bd39fa_idx ON public.service_providers USING btree (email);


--
-- Name: service_pro_is_acti_e75e6a_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX service_pro_is_acti_e75e6a_idx ON public.service_providers USING btree (is_active);


--
-- Name: service_pro_is_veri_42612d_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX service_pro_is_veri_42612d_idx ON public.service_providers USING btree (is_verified);


--
-- Name: service_pro_provide_4c9b63_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX service_pro_provide_4c9b63_idx ON public.service_providers USING btree (provider_id);


--
-- Name: service_pro_provide_d0d143_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX service_pro_provide_d0d143_idx ON public.service_providers USING btree (provider_type);


--
-- Name: service_pro_rated_b_33cf2e_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX service_pro_rated_b_33cf2e_idx ON public.service_provider_ratings USING btree (rated_by_type);


--
-- Name: service_pro_rated_b_7089df_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX service_pro_rated_b_7089df_idx ON public.service_provider_ratings USING btree (rated_by);


--
-- Name: service_pro_service_22dc6a_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX service_pro_service_22dc6a_idx ON public.service_provider_ratings USING btree (service_provider_id);


--
-- Name: service_provider_ratings_service_provider_id_922c5bcf; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX service_provider_ratings_service_provider_id_922c5bcf ON public.service_provider_ratings USING btree (service_provider_id);


--
-- Name: service_providers_approval_status_8edb1360; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX service_providers_approval_status_8edb1360 ON public.service_providers USING btree (approval_status);


--
-- Name: service_providers_approval_status_8edb1360_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX service_providers_approval_status_8edb1360_like ON public.service_providers USING btree (approval_status varchar_pattern_ops);


--
-- Name: service_providers_created_at_3a3a5d1e; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX service_providers_created_at_3a3a5d1e ON public.service_providers USING btree (created_at);


--
-- Name: service_providers_is_active_dd19992d; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX service_providers_is_active_dd19992d ON public.service_providers USING btree (is_active);


--
-- Name: service_providers_provider_id_14a8e707_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX service_providers_provider_id_14a8e707_like ON public.service_providers USING btree (provider_id varchar_pattern_ops);


--
-- Name: service_providers_provider_type_17ccefd3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX service_providers_provider_type_17ccefd3 ON public.service_providers USING btree (provider_type);


--
-- Name: service_providers_provider_type_17ccefd3_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX service_providers_provider_type_17ccefd3_like ON public.service_providers USING btree (provider_type varchar_pattern_ops);


--
-- Name: support_tic_assigne_286543_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tic_assigne_286543_idx ON public.support_tickets USING btree (assigned_to);


--
-- Name: support_tic_assigne_68e83f_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tic_assigne_68e83f_idx ON public.support_tickets USING btree (assigned_to_landlord_id);


--
-- Name: support_tic_assigne_a6b820_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tic_assigne_a6b820_idx ON public.support_tickets USING btree (assigned_to_admin_id);


--
-- Name: support_tic_assigne_eaa737_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tic_assigne_eaa737_idx ON public.support_tickets USING btree (assigned_to_pmc_id);


--
-- Name: support_tic_created_026818_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tic_created_026818_idx ON public.support_tickets USING btree (created_at);


--
-- Name: support_tic_created_0e8337_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tic_created_0e8337_idx ON public.support_tickets USING btree (created_by_tenant_id);


--
-- Name: support_tic_created_469a42_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tic_created_469a42_idx ON public.support_tickets USING btree (created_by);


--
-- Name: support_tic_created_e27565_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tic_created_e27565_idx ON public.support_tickets USING btree (created_by_landlord_id);


--
-- Name: support_tic_priorit_3536fa_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tic_priorit_3536fa_idx ON public.support_tickets USING btree (priority);


--
-- Name: support_tic_propert_6419eb_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tic_propert_6419eb_idx ON public.support_tickets USING btree (property_id);


--
-- Name: support_tic_status_ac1ffd_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tic_status_ac1ffd_idx ON public.support_tickets USING btree (status);


--
-- Name: support_tickets_assigned_to_3e7dff35; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tickets_assigned_to_3e7dff35 ON public.support_tickets USING btree (assigned_to);


--
-- Name: support_tickets_assigned_to_3e7dff35_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tickets_assigned_to_3e7dff35_like ON public.support_tickets USING btree (assigned_to varchar_pattern_ops);


--
-- Name: support_tickets_assigned_to_admin_id_56bfb5b4; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tickets_assigned_to_admin_id_56bfb5b4 ON public.support_tickets USING btree (assigned_to_admin_id);


--
-- Name: support_tickets_assigned_to_landlord_id_a1c89122; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tickets_assigned_to_landlord_id_a1c89122 ON public.support_tickets USING btree (assigned_to_landlord_id);


--
-- Name: support_tickets_assigned_to_pmc_id_3f379051; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tickets_assigned_to_pmc_id_3f379051 ON public.support_tickets USING btree (assigned_to_pmc_id);


--
-- Name: support_tickets_contractor_id_9a28b128; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tickets_contractor_id_9a28b128 ON public.support_tickets USING btree (contractor_id);


--
-- Name: support_tickets_contractor_id_9a28b128_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tickets_contractor_id_9a28b128_like ON public.support_tickets USING btree (contractor_id varchar_pattern_ops);


--
-- Name: support_tickets_created_at_23ebe8a1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tickets_created_at_23ebe8a1 ON public.support_tickets USING btree (created_at);


--
-- Name: support_tickets_created_by_9105c1ea; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tickets_created_by_9105c1ea ON public.support_tickets USING btree (created_by);


--
-- Name: support_tickets_created_by_9105c1ea_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tickets_created_by_9105c1ea_like ON public.support_tickets USING btree (created_by varchar_pattern_ops);


--
-- Name: support_tickets_created_by_landlord_id_bb9793c4; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tickets_created_by_landlord_id_bb9793c4 ON public.support_tickets USING btree (created_by_landlord_id);


--
-- Name: support_tickets_created_by_tenant_id_be2b64de; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tickets_created_by_tenant_id_be2b64de ON public.support_tickets USING btree (created_by_tenant_id);


--
-- Name: support_tickets_priority_175f4fdc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tickets_priority_175f4fdc ON public.support_tickets USING btree (priority);


--
-- Name: support_tickets_priority_175f4fdc_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tickets_priority_175f4fdc_like ON public.support_tickets USING btree (priority varchar_pattern_ops);


--
-- Name: support_tickets_property_id_f52db6c4; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tickets_property_id_f52db6c4 ON public.support_tickets USING btree (property_id);


--
-- Name: support_tickets_service_provider_id_34036c80; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tickets_service_provider_id_34036c80 ON public.support_tickets USING btree (service_provider_id);


--
-- Name: support_tickets_service_provider_id_34036c80_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tickets_service_provider_id_34036c80_like ON public.support_tickets USING btree (service_provider_id varchar_pattern_ops);


--
-- Name: support_tickets_status_1b7ccc40; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tickets_status_1b7ccc40 ON public.support_tickets USING btree (status);


--
-- Name: support_tickets_status_1b7ccc40_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tickets_status_1b7ccc40_like ON public.support_tickets USING btree (status varchar_pattern_ops);


--
-- Name: support_tickets_ticket_number_70ca13c4_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tickets_ticket_number_70ca13c4_like ON public.support_tickets USING btree (ticket_number varchar_pattern_ops);


--
-- Name: support_tickets_vendor_id_2c9fbb16; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tickets_vendor_id_2c9fbb16 ON public.support_tickets USING btree (vendor_id);


--
-- Name: support_tickets_vendor_id_2c9fbb16_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX support_tickets_vendor_id_2c9fbb16_like ON public.support_tickets USING btree (vendor_id varchar_pattern_ops);


--
-- Name: tenant_invi_email_39a62c_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tenant_invi_email_39a62c_idx ON public.tenant_invitations USING btree (email);


--
-- Name: tenant_invi_expires_74dd72_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tenant_invi_expires_74dd72_idx ON public.tenant_invitations USING btree (expires_at);


--
-- Name: tenant_invi_status_6525df_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tenant_invi_status_6525df_idx ON public.tenant_invitations USING btree (status);


--
-- Name: tenant_invi_token_8b1449_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tenant_invi_token_8b1449_idx ON public.tenant_invitations USING btree (token);


--
-- Name: tenant_invitations_token_b8b08834_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tenant_invitations_token_b8b08834_like ON public.tenant_invitations USING btree (token varchar_pattern_ops);


--
-- Name: tenant_invitations_unit_id_d08788da; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tenant_invitations_unit_id_d08788da ON public.tenant_invitations USING btree (unit_id);


--
-- Name: tenants_approva_2b5d3e_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tenants_approva_2b5d3e_idx ON public.tenants USING btree (approval_status);


--
-- Name: tenants_created_fc84fe_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tenants_created_fc84fe_idx ON public.tenants USING btree (created_at);


--
-- Name: tenants_email_64287b_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tenants_email_64287b_idx ON public.tenants USING btree (email);


--
-- Name: tenants_email_aa4f1d72_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tenants_email_aa4f1d72_like ON public.tenants USING btree (email varchar_pattern_ops);


--
-- Name: tenants_status_80d9b6_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tenants_status_80d9b6_idx ON public.tenants USING btree (status);


--
-- Name: tenants_tenant_id_6aae1684_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tenants_tenant_id_6aae1684_like ON public.tenants USING btree (tenant_id varchar_pattern_ops);


--
-- Name: ticket_attachments_ticket_id_cb930a94; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ticket_attachments_ticket_id_cb930a94 ON public.ticket_attachments USING btree (ticket_id);


--
-- Name: ticket_notes_ticket_id_4ae1d013; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ticket_notes_ticket_id_4ae1d013 ON public.ticket_notes USING btree (ticket_id);


--
-- Name: unified_ver_action_cfaa8a_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_ver_action_cfaa8a_idx ON public.unified_verification_history USING btree (action);


--
-- Name: unified_ver_assigne_ec58fd_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_ver_assigne_ec58fd_idx ON public.unified_verifications USING btree (assigned_to, status);


--
-- Name: unified_ver_created_5c4a18_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_ver_created_5c4a18_idx ON public.unified_verification_history USING btree (created_at);


--
-- Name: unified_ver_due_dat_76b296_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_ver_due_dat_76b296_idx ON public.unified_verifications USING btree (due_date);


--
-- Name: unified_ver_entity__fc6ea3_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_ver_entity__fc6ea3_idx ON public.unified_verifications USING btree (entity_type, entity_id);


--
-- Name: unified_ver_perform_4f8bef_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_ver_perform_4f8bef_idx ON public.unified_verification_history USING btree (performed_by);


--
-- Name: unified_ver_request_0e3423_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_ver_request_0e3423_idx ON public.unified_verifications USING btree (requested_at);


--
-- Name: unified_ver_request_8500a9_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_ver_request_8500a9_idx ON public.unified_verifications USING btree (requested_by, status);


--
-- Name: unified_ver_status_107fd6_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_ver_status_107fd6_idx ON public.unified_verifications USING btree (status, priority);


--
-- Name: unified_ver_verific_7b7a5a_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_ver_verific_7b7a5a_idx ON public.unified_verification_history USING btree (verification_id);


--
-- Name: unified_ver_verific_8cb423_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_ver_verific_8cb423_idx ON public.unified_verifications USING btree (verification_type, status);


--
-- Name: unified_ver_verifie_2fc579_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_ver_verifie_2fc579_idx ON public.unified_verifications USING btree (verified_by, status);


--
-- Name: unified_verification_history_action_5bb738d1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_verification_history_action_5bb738d1 ON public.unified_verification_history USING btree (action);


--
-- Name: unified_verification_history_action_5bb738d1_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_verification_history_action_5bb738d1_like ON public.unified_verification_history USING btree (action varchar_pattern_ops);


--
-- Name: unified_verification_history_created_at_3937b6d9; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_verification_history_created_at_3937b6d9 ON public.unified_verification_history USING btree (created_at);


--
-- Name: unified_verification_history_performed_by_5939c51f; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_verification_history_performed_by_5939c51f ON public.unified_verification_history USING btree (performed_by);


--
-- Name: unified_verification_history_performed_by_5939c51f_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_verification_history_performed_by_5939c51f_like ON public.unified_verification_history USING btree (performed_by varchar_pattern_ops);


--
-- Name: unified_verification_history_verification_id_be1cf3c9; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_verification_history_verification_id_be1cf3c9 ON public.unified_verification_history USING btree (verification_id);


--
-- Name: unified_verifications_assigned_to_a5bf1457; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_verifications_assigned_to_a5bf1457 ON public.unified_verifications USING btree (assigned_to);


--
-- Name: unified_verifications_assigned_to_a5bf1457_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_verifications_assigned_to_a5bf1457_like ON public.unified_verifications USING btree (assigned_to varchar_pattern_ops);


--
-- Name: unified_verifications_due_date_7c4aa134; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_verifications_due_date_7c4aa134 ON public.unified_verifications USING btree (due_date);


--
-- Name: unified_verifications_requested_at_b55d0bcc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_verifications_requested_at_b55d0bcc ON public.unified_verifications USING btree (requested_at);


--
-- Name: unified_verifications_requested_by_3668034e; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_verifications_requested_by_3668034e ON public.unified_verifications USING btree (requested_by);


--
-- Name: unified_verifications_requested_by_3668034e_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_verifications_requested_by_3668034e_like ON public.unified_verifications USING btree (requested_by varchar_pattern_ops);


--
-- Name: unified_verifications_status_b8d3588d; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_verifications_status_b8d3588d ON public.unified_verifications USING btree (status);


--
-- Name: unified_verifications_status_b8d3588d_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_verifications_status_b8d3588d_like ON public.unified_verifications USING btree (status varchar_pattern_ops);


--
-- Name: unified_verifications_verification_type_18b6fcaf; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_verifications_verification_type_18b6fcaf ON public.unified_verifications USING btree (verification_type);


--
-- Name: unified_verifications_verification_type_18b6fcaf_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_verifications_verification_type_18b6fcaf_like ON public.unified_verifications USING btree (verification_type varchar_pattern_ops);


--
-- Name: unified_verifications_verified_by_17278503; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_verifications_verified_by_17278503 ON public.unified_verifications USING btree (verified_by);


--
-- Name: unified_verifications_verified_by_17278503_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unified_verifications_verified_by_17278503_like ON public.unified_verifications USING btree (verified_by varchar_pattern_ops);


--
-- Name: units_propert_73e07d_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX units_propert_73e07d_idx ON public.units USING btree (property_id, status);


--
-- Name: units_property_id_cf7a9cbc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX units_property_id_cf7a9cbc ON public.units USING btree (property_id);


--
-- Name: units_status_eafada_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX units_status_eafada_idx ON public.units USING btree (status);


--
-- Name: user_activi_action_b4118c_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_activi_action_b4118c_idx ON public.user_activities USING btree (action);


--
-- Name: user_activi_created_9fa3ca_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_activi_created_9fa3ca_idx ON public.user_activities USING btree (created_at);


--
-- Name: user_activi_user_em_3fcaca_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_activi_user_em_3fcaca_idx ON public.user_activities USING btree (user_email);


--
-- Name: user_activi_user_id_260c6d_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_activi_user_id_260c6d_idx ON public.user_activities USING btree (user_id);


--
-- Name: user_activi_user_ro_4015f7_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_activi_user_ro_4015f7_idx ON public.user_activities USING btree (user_role);


--
-- Name: user_activities_action_0a4e1631; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_activities_action_0a4e1631 ON public.user_activities USING btree (action);


--
-- Name: user_activities_action_0a4e1631_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_activities_action_0a4e1631_like ON public.user_activities USING btree (action varchar_pattern_ops);


--
-- Name: user_activities_created_at_6839969b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_activities_created_at_6839969b ON public.user_activities USING btree (created_at);


--
-- Name: user_activities_user_email_85b73574; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_activities_user_email_85b73574 ON public.user_activities USING btree (user_email);


--
-- Name: user_activities_user_email_85b73574_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_activities_user_email_85b73574_like ON public.user_activities USING btree (user_email varchar_pattern_ops);


--
-- Name: user_activities_user_id_ce552574; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_activities_user_id_ce552574 ON public.user_activities USING btree (user_id);


--
-- Name: user_activities_user_id_ce552574_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_activities_user_id_ce552574_like ON public.user_activities USING btree (user_id varchar_pattern_ops);


--
-- Name: user_activities_user_role_2eae2037; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_activities_user_role_2eae2037 ON public.user_activities USING btree (user_role);


--
-- Name: user_activities_user_role_2eae2037_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_activities_user_role_2eae2037_like ON public.user_activities USING btree (user_role varchar_pattern_ops);


--
-- Name: user_roles_role_id_0b583b_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_roles_role_id_0b583b_idx ON public.user_roles USING btree (role_id);


--
-- Name: user_roles_role_id_816a4486; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_roles_role_id_816a4486 ON public.user_roles USING btree (role_id);


--
-- Name: user_roles_user_id_742675_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_roles_user_id_742675_idx ON public.user_roles USING btree (user_id, user_type);


--
-- Name: user_roles_user_id_9d9f8dbb; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_roles_user_id_9d9f8dbb ON public.user_roles USING btree (user_id);


--
-- Name: user_roles_user_id_9d9f8dbb_like; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_roles_user_id_9d9f8dbb_like ON public.user_roles USING btree (user_id varchar_pattern_ops);


--
-- Name: ActivityLog ActivityLog_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ActivityLog"
    ADD CONSTRAINT "ActivityLog_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public."Conversation"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ActivityLog ActivityLog_landlordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ActivityLog"
    ADD CONSTRAINT "ActivityLog_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES public."Landlord"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ActivityLog ActivityLog_pmcId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ActivityLog"
    ADD CONSTRAINT "ActivityLog_pmcId_fkey" FOREIGN KEY ("pmcId") REFERENCES public."PropertyManagementCompany"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ActivityLog ActivityLog_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ActivityLog"
    ADD CONSTRAINT "ActivityLog_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ActivityLog ActivityLog_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ActivityLog"
    ADD CONSTRAINT "ActivityLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AdminAuditLog AdminAuditLog_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminAuditLog"
    ADD CONSTRAINT "AdminAuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public."Admin"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AdminPermission AdminPermission_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminPermission"
    ADD CONSTRAINT "AdminPermission_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public."Admin"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AdminSession AdminSession_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminSession"
    ADD CONSTRAINT "AdminSession_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public."Admin"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Application Application_leaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Application"
    ADD CONSTRAINT "Application_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES public."Lease"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Application Application_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Application"
    ADD CONSTRAINT "Application_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Application Application_unitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Application"
    ADD CONSTRAINT "Application_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public."Unit"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BankReconciliation BankReconciliation_landlordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BankReconciliation"
    ADD CONSTRAINT "BankReconciliation_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES public."Landlord"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: BankReconciliation BankReconciliation_pmcId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BankReconciliation"
    ADD CONSTRAINT "BankReconciliation_pmcId_fkey" FOREIGN KEY ("pmcId") REFERENCES public."PropertyManagementCompany"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: BankReconciliation BankReconciliation_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BankReconciliation"
    ADD CONSTRAINT "BankReconciliation_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ConversationParticipant ConversationParticipant_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ConversationParticipant"
    ADD CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public."Conversation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Conversation Conversation_createdByLandlordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_createdByLandlordId_fkey" FOREIGN KEY ("createdByLandlordId") REFERENCES public."Landlord"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Conversation Conversation_createdByPMCId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_createdByPMCId_fkey" FOREIGN KEY ("createdByPMCId") REFERENCES public."PropertyManagementCompany"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Conversation Conversation_createdByTenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_createdByTenantId_fkey" FOREIGN KEY ("createdByTenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Conversation Conversation_landlordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES public."Landlord"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Conversation Conversation_lastMessageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_lastMessageId_fkey" FOREIGN KEY ("lastMessageId") REFERENCES public."Message"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Conversation Conversation_pmcId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_pmcId_fkey" FOREIGN KEY ("pmcId") REFERENCES public."PropertyManagementCompany"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Conversation Conversation_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Conversation Conversation_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DocumentAuditLog DocumentAuditLog_documentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DocumentAuditLog"
    ADD CONSTRAINT "DocumentAuditLog_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES public."Document"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DocumentMessage DocumentMessage_documentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DocumentMessage"
    ADD CONSTRAINT "DocumentMessage_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES public."Document"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Document Document_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Document Document_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EmergencyContact EmergencyContact_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmergencyContact"
    ADD CONSTRAINT "EmergencyContact_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Employer Employer_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Employer"
    ADD CONSTRAINT "Employer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EmploymentDocument EmploymentDocument_employerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmploymentDocument"
    ADD CONSTRAINT "EmploymentDocument_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES public."Employer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Eviction Eviction_leaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Eviction"
    ADD CONSTRAINT "Eviction_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES public."Lease"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Eviction Eviction_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Eviction"
    ADD CONSTRAINT "Eviction_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Eviction Eviction_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Eviction"
    ADD CONSTRAINT "Eviction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Eviction Eviction_unitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Eviction"
    ADD CONSTRAINT "Eviction_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public."Unit"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Expense Expense_maintenanceRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_maintenanceRequestId_fkey" FOREIGN KEY ("maintenanceRequestId") REFERENCES public."MaintenanceRequest"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Expense Expense_pmcApprovalRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_pmcApprovalRequestId_fkey" FOREIGN KEY ("pmcApprovalRequestId") REFERENCES public."PMCLandlordApproval"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Expense Expense_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: InspectionChecklistItem InspectionChecklistItem_checklistId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InspectionChecklistItem"
    ADD CONSTRAINT "InspectionChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES public."InspectionChecklist"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InspectionChecklist InspectionChecklist_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InspectionChecklist"
    ADD CONSTRAINT "InspectionChecklist_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Invitation Invitation_approvedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invitation"
    ADD CONSTRAINT "Invitation_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES public."Admin"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Invitation Invitation_invitedByAdminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invitation"
    ADD CONSTRAINT "Invitation_invitedByAdminId_fkey" FOREIGN KEY ("invitedByAdminId") REFERENCES public."Admin"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Invitation Invitation_invitedByLandlordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invitation"
    ADD CONSTRAINT "Invitation_invitedByLandlordId_fkey" FOREIGN KEY ("invitedByLandlordId") REFERENCES public."Landlord"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Invitation Invitation_invitedByPMCId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invitation"
    ADD CONSTRAINT "Invitation_invitedByPMCId_fkey" FOREIGN KEY ("invitedByPMCId") REFERENCES public."PropertyManagementCompany"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Invitation Invitation_landlordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invitation"
    ADD CONSTRAINT "Invitation_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES public."Landlord"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Invitation Invitation_pmcId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invitation"
    ADD CONSTRAINT "Invitation_pmcId_fkey" FOREIGN KEY ("pmcId") REFERENCES public."PropertyManagementCompany"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Invitation Invitation_rejectedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invitation"
    ADD CONSTRAINT "Invitation_rejectedBy_fkey" FOREIGN KEY ("rejectedBy") REFERENCES public."Admin"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Invitation Invitation_serviceProviderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invitation"
    ADD CONSTRAINT "Invitation_serviceProviderId_fkey" FOREIGN KEY ("serviceProviderId") REFERENCES public."ServiceProvider"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Invitation Invitation_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invitation"
    ADD CONSTRAINT "Invitation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LandlordServiceProvider LandlordServiceProvider_landlordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LandlordServiceProvider"
    ADD CONSTRAINT "LandlordServiceProvider_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES public."Landlord"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LandlordServiceProvider LandlordServiceProvider_providerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LandlordServiceProvider"
    ADD CONSTRAINT "LandlordServiceProvider_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES public."ServiceProvider"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Landlord Landlord_approvedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Landlord"
    ADD CONSTRAINT "Landlord_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES public."Admin"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Landlord Landlord_countryCode_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Landlord"
    ADD CONSTRAINT "Landlord_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES public."Country"(code) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Landlord Landlord_countryCode_regionCode_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Landlord"
    ADD CONSTRAINT "Landlord_countryCode_regionCode_fkey" FOREIGN KEY ("countryCode", "regionCode") REFERENCES public."Region"("countryCode", code) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Landlord Landlord_invitedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Landlord"
    ADD CONSTRAINT "Landlord_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES public."Admin"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Landlord Landlord_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Landlord"
    ADD CONSTRAINT "Landlord_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Landlord Landlord_rejectedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Landlord"
    ADD CONSTRAINT "Landlord_rejectedBy_fkey" FOREIGN KEY ("rejectedBy") REFERENCES public."Admin"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LateFee LateFee_rentPaymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LateFee"
    ADD CONSTRAINT "LateFee_rentPaymentId_fkey" FOREIGN KEY ("rentPaymentId") REFERENCES public."RentPayment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LateFee LateFee_ruleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LateFee"
    ADD CONSTRAINT "LateFee_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES public."LateFeeRule"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LeaseDocument LeaseDocument_leaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LeaseDocument"
    ADD CONSTRAINT "LeaseDocument_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES public."Lease"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LeaseTenant LeaseTenant_leaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LeaseTenant"
    ADD CONSTRAINT "LeaseTenant_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES public."Lease"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LeaseTenant LeaseTenant_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LeaseTenant"
    ADD CONSTRAINT "LeaseTenant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Lease Lease_unitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lease"
    ADD CONSTRAINT "Lease_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public."Unit"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Listing Listing_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Listing Listing_unitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public."Unit"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MaintenanceComment MaintenanceComment_maintenanceRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaintenanceComment"
    ADD CONSTRAINT "MaintenanceComment_maintenanceRequestId_fkey" FOREIGN KEY ("maintenanceRequestId") REFERENCES public."MaintenanceRequest"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MaintenanceRequest MaintenanceRequest_assignedToProviderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaintenanceRequest"
    ADD CONSTRAINT "MaintenanceRequest_assignedToProviderId_fkey" FOREIGN KEY ("assignedToProviderId") REFERENCES public."ServiceProvider"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MaintenanceRequest MaintenanceRequest_pmcApprovalRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaintenanceRequest"
    ADD CONSTRAINT "MaintenanceRequest_pmcApprovalRequestId_fkey" FOREIGN KEY ("pmcApprovalRequestId") REFERENCES public."PMCLandlordApproval"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MaintenanceRequest MaintenanceRequest_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaintenanceRequest"
    ADD CONSTRAINT "MaintenanceRequest_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MaintenanceRequest MaintenanceRequest_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaintenanceRequest"
    ADD CONSTRAINT "MaintenanceRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MessageAttachment MessageAttachment_messageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MessageAttachment"
    ADD CONSTRAINT "MessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES public."Message"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Message Message_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public."Conversation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Message Message_senderLandlordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_senderLandlordId_fkey" FOREIGN KEY ("senderLandlordId") REFERENCES public."Landlord"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Message Message_senderPMCId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_senderPMCId_fkey" FOREIGN KEY ("senderPMCId") REFERENCES public."PropertyManagementCompany"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Message Message_senderTenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_senderTenantId_fkey" FOREIGN KEY ("senderTenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OrganizationSettings OrganizationSettings_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrganizationSettings"
    ADD CONSTRAINT "OrganizationSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OwnerPayout OwnerPayout_landlordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OwnerPayout"
    ADD CONSTRAINT "OwnerPayout_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES public."Landlord"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OwnerPayout OwnerPayout_pmcId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OwnerPayout"
    ADD CONSTRAINT "OwnerPayout_pmcId_fkey" FOREIGN KEY ("pmcId") REFERENCES public."PropertyManagementCompany"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OwnerPayout OwnerPayout_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OwnerPayout"
    ADD CONSTRAINT "OwnerPayout_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OwnerStatement OwnerStatement_landlordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OwnerStatement"
    ADD CONSTRAINT "OwnerStatement_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES public."Landlord"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OwnerStatement OwnerStatement_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OwnerStatement"
    ADD CONSTRAINT "OwnerStatement_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PMCLandlordApproval PMCLandlordApproval_pmcLandlordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PMCLandlordApproval"
    ADD CONSTRAINT "PMCLandlordApproval_pmcLandlordId_fkey" FOREIGN KEY ("pmcLandlordId") REFERENCES public."PMCLandlord"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PMCLandlord PMCLandlord_landlordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PMCLandlord"
    ADD CONSTRAINT "PMCLandlord_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES public."Landlord"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PMCLandlord PMCLandlord_pmcId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PMCLandlord"
    ADD CONSTRAINT "PMCLandlord_pmcId_fkey" FOREIGN KEY ("pmcId") REFERENCES public."PropertyManagementCompany"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PartialPayment PartialPayment_rentPaymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PartialPayment"
    ADD CONSTRAINT "PartialPayment_rentPaymentId_fkey" FOREIGN KEY ("rentPaymentId") REFERENCES public."RentPayment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PropertyManagementCompany PropertyManagementCompany_approvedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PropertyManagementCompany"
    ADD CONSTRAINT "PropertyManagementCompany_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES public."Admin"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PropertyManagementCompany PropertyManagementCompany_countryCode_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PropertyManagementCompany"
    ADD CONSTRAINT "PropertyManagementCompany_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES public."Country"(code) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PropertyManagementCompany PropertyManagementCompany_countryCode_regionCode_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PropertyManagementCompany"
    ADD CONSTRAINT "PropertyManagementCompany_countryCode_regionCode_fkey" FOREIGN KEY ("countryCode", "regionCode") REFERENCES public."Region"("countryCode", code) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PropertyManagementCompany PropertyManagementCompany_invitedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PropertyManagementCompany"
    ADD CONSTRAINT "PropertyManagementCompany_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES public."Admin"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PropertyManagementCompany PropertyManagementCompany_rejectedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PropertyManagementCompany"
    ADD CONSTRAINT "PropertyManagementCompany_rejectedBy_fkey" FOREIGN KEY ("rejectedBy") REFERENCES public."Admin"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PropertyOwnershipVerificationHistory PropertyOwnershipVerificationHistory_verificationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PropertyOwnershipVerificationHistory"
    ADD CONSTRAINT "PropertyOwnershipVerificationHistory_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES public."PropertyOwnershipVerification"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PropertyOwnershipVerification PropertyOwnershipVerification_landlordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PropertyOwnershipVerification"
    ADD CONSTRAINT "PropertyOwnershipVerification_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES public."Landlord"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PropertyOwnershipVerification PropertyOwnershipVerification_pmcLandlordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PropertyOwnershipVerification"
    ADD CONSTRAINT "PropertyOwnershipVerification_pmcLandlordId_fkey" FOREIGN KEY ("pmcLandlordId") REFERENCES public."PMCLandlord"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PropertyOwnershipVerification PropertyOwnershipVerification_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PropertyOwnershipVerification"
    ADD CONSTRAINT "PropertyOwnershipVerification_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Property Property_countryCode_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Property"
    ADD CONSTRAINT "Property_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES public."Country"(code) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Property Property_countryCode_regionCode_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Property"
    ADD CONSTRAINT "Property_countryCode_regionCode_fkey" FOREIGN KEY ("countryCode", "regionCode") REFERENCES public."Region"("countryCode", code) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Property Property_landlordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Property"
    ADD CONSTRAINT "Property_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES public."Landlord"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Property Property_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Property"
    ADD CONSTRAINT "Property_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Region Region_countryCode_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Region"
    ADD CONSTRAINT "Region_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES public."Country"(code) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RentPayment RentPayment_leaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RentPayment"
    ADD CONSTRAINT "RentPayment_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES public."Lease"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RolePermission RolePermission_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Scope Scope_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Scope"
    ADD CONSTRAINT "Scope_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Scope"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SecurityDeposit SecurityDeposit_leaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SecurityDeposit"
    ADD CONSTRAINT "SecurityDeposit_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES public."Lease"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SecurityDeposit SecurityDeposit_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SecurityDeposit"
    ADD CONSTRAINT "SecurityDeposit_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SecurityDeposit SecurityDeposit_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SecurityDeposit"
    ADD CONSTRAINT "SecurityDeposit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SecurityDeposit SecurityDeposit_unitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SecurityDeposit"
    ADD CONSTRAINT "SecurityDeposit_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public."Unit"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ServiceProvider ServiceProvider_approvedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServiceProvider"
    ADD CONSTRAINT "ServiceProvider_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES public."Admin"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ServiceProvider ServiceProvider_countryCode_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServiceProvider"
    ADD CONSTRAINT "ServiceProvider_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES public."Country"(code) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ServiceProvider ServiceProvider_countryCode_regionCode_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServiceProvider"
    ADD CONSTRAINT "ServiceProvider_countryCode_regionCode_fkey" FOREIGN KEY ("countryCode", "regionCode") REFERENCES public."Region"("countryCode", code) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ServiceProvider ServiceProvider_invitedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServiceProvider"
    ADD CONSTRAINT "ServiceProvider_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES public."Admin"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StripePayment StripePayment_rentPaymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StripePayment"
    ADD CONSTRAINT "StripePayment_rentPaymentId_fkey" FOREIGN KEY ("rentPaymentId") REFERENCES public."RentPayment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SupportTicket SupportTicket_assignedToAdminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_assignedToAdminId_fkey" FOREIGN KEY ("assignedToAdminId") REFERENCES public."Admin"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SupportTicket SupportTicket_assignedToLandlordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_assignedToLandlordId_fkey" FOREIGN KEY ("assignedToLandlordId") REFERENCES public."Landlord"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SupportTicket SupportTicket_assignedToPMCId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_assignedToPMCId_fkey" FOREIGN KEY ("assignedToPMCId") REFERENCES public."PropertyManagementCompany"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SupportTicket SupportTicket_createdByLandlordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_createdByLandlordId_fkey" FOREIGN KEY ("createdByLandlordId") REFERENCES public."Landlord"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SupportTicket SupportTicket_createdByTenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_createdByTenantId_fkey" FOREIGN KEY ("createdByTenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SupportTicket SupportTicket_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SupportTicket SupportTicket_serviceProviderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_serviceProviderId_fkey" FOREIGN KEY ("serviceProviderId") REFERENCES public."ServiceProvider"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Task Task_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TenantInvitation TenantInvitation_invitedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TenantInvitation"
    ADD CONSTRAINT "TenantInvitation_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES public."Landlord"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TenantInvitation TenantInvitation_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TenantInvitation"
    ADD CONSTRAINT "TenantInvitation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TenantRating TenantRating_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TenantRating"
    ADD CONSTRAINT "TenantRating_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TenantRating TenantRating_ratedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TenantRating"
    ADD CONSTRAINT "TenantRating_ratedBy_fkey" FOREIGN KEY ("ratedBy") REFERENCES public."ServiceProvider"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TenantRating TenantRating_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TenantRating"
    ADD CONSTRAINT "TenantRating_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TenantRating TenantRating_unitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TenantRating"
    ADD CONSTRAINT "TenantRating_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public."Unit"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TenantRating TenantRating_workOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TenantRating"
    ADD CONSTRAINT "TenantRating_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES public."MaintenanceRequest"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Tenant Tenant_countryCode_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Tenant"
    ADD CONSTRAINT "Tenant_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES public."Country"(code) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Tenant Tenant_countryCode_regionCode_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Tenant"
    ADD CONSTRAINT "Tenant_countryCode_regionCode_fkey" FOREIGN KEY ("countryCode", "regionCode") REFERENCES public."Region"("countryCode", code) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TicketAttachment TicketAttachment_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TicketAttachment"
    ADD CONSTRAINT "TicketAttachment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."SupportTicket"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TicketNote TicketNote_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TicketNote"
    ADD CONSTRAINT "TicketNote_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."SupportTicket"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UnifiedVerificationHistory UnifiedVerificationHistory_verificationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UnifiedVerificationHistory"
    ADD CONSTRAINT "UnifiedVerificationHistory_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES public."UnifiedVerification"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Unit Unit_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Unit"
    ADD CONSTRAINT "Unit_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserPermission UserPermission_userRoleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserPermission"
    ADD CONSTRAINT "UserPermission_userRoleId_fkey" FOREIGN KEY ("userRoleId") REFERENCES public."UserRole"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserRole UserRole_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: VendorRating VendorRating_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VendorRating"
    ADD CONSTRAINT "VendorRating_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: VendorRating VendorRating_unitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VendorRating"
    ADD CONSTRAINT "VendorRating_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public."Unit"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: VendorRating VendorRating_vendorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VendorRating"
    ADD CONSTRAINT "VendorRating_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES public."ServiceProvider"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: VendorRating VendorRating_workOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VendorRating"
    ADD CONSTRAINT "VendorRating_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES public."MaintenanceRequest"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: admin_audit_logs admin_audit_logs_admin_id_018a39c4_fk_admins_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_audit_logs
    ADD CONSTRAINT admin_audit_logs_admin_id_018a39c4_fk_admins_id FOREIGN KEY (admin_id) REFERENCES public.admins(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: applications applications_lease_id_4c79cdc4_fk_leases_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_lease_id_4c79cdc4_fk_leases_id FOREIGN KEY (lease_id) REFERENCES public.leases(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: applications applications_property_id_0ad8be6c_fk_properties_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_property_id_0ad8be6c_fk_properties_id FOREIGN KEY (property_id) REFERENCES public.properties(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: applications applications_unit_id_6e910712_fk_units_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_unit_id_6e910712_fk_units_id FOREIGN KEY (unit_id) REFERENCES public.units(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_group_permissions auth_group_permissio_permission_id_84c5c92e_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissio_permission_id_84c5c92e_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_group_permissions auth_group_permissions_group_id_b120cbf9_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_b120cbf9_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_permission auth_permission_content_type_id_2f476e4b_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_2f476e4b_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_user_groups auth_user_groups_group_id_97559544_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_group_id_97559544_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_user_groups auth_user_groups_user_id_6a12ed8b_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_user_id_6a12ed8b_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_user_user_permissions auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_user_user_permissions auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: conversations conversations_created_by_landlord_id_f5b92127_fk_landlords_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_created_by_landlord_id_f5b92127_fk_landlords_id FOREIGN KEY (created_by_landlord_id) REFERENCES public.landlords(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: conversations conversations_created_by_pmc_id_b5e92c97_fk_property_; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_created_by_pmc_id_b5e92c97_fk_property_ FOREIGN KEY (created_by_pmc_id) REFERENCES public.property_management_companies(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: conversations conversations_created_by_tenant_id_0368f249_fk_tenants_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_created_by_tenant_id_0368f249_fk_tenants_id FOREIGN KEY (created_by_tenant_id) REFERENCES public.tenants(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: conversations conversations_landlord_id_42adf51c_fk_landlords_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_landlord_id_42adf51c_fk_landlords_id FOREIGN KEY (landlord_id) REFERENCES public.landlords(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: conversations conversations_last_message_id_77a159de_fk_messages_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_last_message_id_77a159de_fk_messages_id FOREIGN KEY (last_message_id) REFERENCES public.messages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: conversations conversations_pmc_id_457b99ee_fk_property_; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pmc_id_457b99ee_fk_property_ FOREIGN KEY (pmc_id) REFERENCES public.property_management_companies(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: conversations conversations_property_id_223306ad_fk_properties_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_property_id_223306ad_fk_properties_id FOREIGN KEY (property_id) REFERENCES public.properties(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: conversations conversations_tenant_id_63d250b6_fk_tenants_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_tenant_id_63d250b6_fk_tenants_id FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: django_admin_log django_admin_log_content_type_id_c4bce8eb_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_content_type_id_c4bce8eb_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: django_admin_log django_admin_log_user_id_c564eba6_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_user_id_c564eba6_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: document_audit_logs document_audit_logs_document_id_25cb0c86_fk_documents_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_audit_logs
    ADD CONSTRAINT document_audit_logs_document_id_25cb0c86_fk_documents_id FOREIGN KEY (document_id) REFERENCES public.documents(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: document_messages document_messages_document_id_c061effd_fk_documents_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_messages
    ADD CONSTRAINT document_messages_document_id_c061effd_fk_documents_id FOREIGN KEY (document_id) REFERENCES public.documents(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents documents_property_id_fbab1a82_fk_properties_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_property_id_fbab1a82_fk_properties_id FOREIGN KEY (property_id) REFERENCES public.properties(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: documents documents_tenant_id_e8ee60b1_fk_tenants_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_tenant_id_e8ee60b1_fk_tenants_id FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: inspection_checklist_items inspection_checklist_checklist_id_814bd073_fk_inspectio; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspection_checklist_items
    ADD CONSTRAINT inspection_checklist_checklist_id_814bd073_fk_inspectio FOREIGN KEY (checklist_id) REFERENCES public.inspection_checklists(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: inspection_checklists inspection_checklists_lease_id_32218ae9_fk_leases_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspection_checklists
    ADD CONSTRAINT inspection_checklists_lease_id_32218ae9_fk_leases_id FOREIGN KEY (lease_id) REFERENCES public.leases(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: inspection_checklists inspection_checklists_property_id_61480fdb_fk_properties_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspection_checklists
    ADD CONSTRAINT inspection_checklists_property_id_61480fdb_fk_properties_id FOREIGN KEY (property_id) REFERENCES public.properties(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: inspection_checklists inspection_checklists_tenant_id_24003fa2_fk_tenants_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspection_checklists
    ADD CONSTRAINT inspection_checklists_tenant_id_24003fa2_fk_tenants_id FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: inspection_checklists inspection_checklists_unit_id_6cfeb24a_fk_units_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspection_checklists
    ADD CONSTRAINT inspection_checklists_unit_id_6cfeb24a_fk_units_id FOREIGN KEY (unit_id) REFERENCES public.units(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: invitations invitations_invited_by_admin_id_425bd758_fk_admins_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_invited_by_admin_id_425bd758_fk_admins_id FOREIGN KEY (invited_by_admin_id) REFERENCES public.admins(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: invitations invitations_invited_by_landlord_id_a26e8d42_fk_landlords_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_invited_by_landlord_id_a26e8d42_fk_landlords_id FOREIGN KEY (invited_by_landlord_id) REFERENCES public.landlords(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: invitations invitations_invited_by_pmc_id_a5c2cb6b_fk_property_; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_invited_by_pmc_id_a5c2cb6b_fk_property_ FOREIGN KEY (invited_by_pmc_id) REFERENCES public.property_management_companies(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: lease_documents lease_documents_lease_id_9fa252d5_fk_leases_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lease_documents
    ADD CONSTRAINT lease_documents_lease_id_9fa252d5_fk_leases_id FOREIGN KEY (lease_id) REFERENCES public.leases(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: lease_tenants lease_tenants_lease_id_d7889287_fk_leases_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lease_tenants
    ADD CONSTRAINT lease_tenants_lease_id_d7889287_fk_leases_id FOREIGN KEY (lease_id) REFERENCES public.leases(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: lease_tenants lease_tenants_tenant_id_bc73557b_fk_tenants_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lease_tenants
    ADD CONSTRAINT lease_tenants_tenant_id_bc73557b_fk_tenants_id FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: lease_terminations lease_terminations_lease_id_3819d680_fk_leases_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lease_terminations
    ADD CONSTRAINT lease_terminations_lease_id_3819d680_fk_leases_id FOREIGN KEY (lease_id) REFERENCES public.leases(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: leases leases_unit_id_b1551a5a_fk_units_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leases
    ADD CONSTRAINT leases_unit_id_b1551a5a_fk_units_id FOREIGN KEY (unit_id) REFERENCES public.units(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: maintenance_comments maintenance_comments_maintenance_request__0d44cb74_fk_maintenan; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_comments
    ADD CONSTRAINT maintenance_comments_maintenance_request__0d44cb74_fk_maintenan FOREIGN KEY (maintenance_request_id) REFERENCES public.maintenance_requests(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: maintenance_requests maintenance_requests_property_id_021e62fc_fk_properties_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT maintenance_requests_property_id_021e62fc_fk_properties_id FOREIGN KEY (property_id) REFERENCES public.properties(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: maintenance_requests maintenance_requests_tenant_id_aa080cc5_fk_tenants_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT maintenance_requests_tenant_id_aa080cc5_fk_tenants_id FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: message_attachments message_attachments_message_id_c7a3e22d_fk_messages_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_attachments
    ADD CONSTRAINT message_attachments_message_id_c7a3e22d_fk_messages_id FOREIGN KEY (message_id) REFERENCES public.messages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: messages messages_conversation_id_5ef638db_fk_conversations_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_5ef638db_fk_conversations_id FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: messages messages_sender_landlord_id_7f3a2b96_fk_landlords_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_landlord_id_7f3a2b96_fk_landlords_id FOREIGN KEY (sender_landlord_id) REFERENCES public.landlords(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: messages messages_sender_pmc_id_1da16db2_fk_property_; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_pmc_id_1da16db2_fk_property_ FOREIGN KEY (sender_pmc_id) REFERENCES public.property_management_companies(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: messages messages_sender_tenant_id_45433f53_fk_tenants_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_tenant_id_45433f53_fk_tenants_id FOREIGN KEY (sender_tenant_id) REFERENCES public.tenants(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: notification notification_verificationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "notification_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES public."UnifiedVerification"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: organization_settings organization_setting_organization_id_36340196_fk_organizat; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_settings
    ADD CONSTRAINT organization_setting_organization_id_36340196_fk_organizat FOREIGN KEY (organization_id) REFERENCES public.organizations(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: property_expenses property_expenses_maintenance_request__a58eb9ff_fk_maintenan; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_expenses
    ADD CONSTRAINT property_expenses_maintenance_request__a58eb9ff_fk_maintenan FOREIGN KEY (maintenance_request_id) REFERENCES public.maintenance_requests(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: property_expenses property_expenses_property_id_a1fa5889_fk_properties_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_expenses
    ADD CONSTRAINT property_expenses_property_id_a1fa5889_fk_properties_id FOREIGN KEY (property_id) REFERENCES public.properties(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: rent_payments rent_payments_lease_id_98e8b86f_fk_leases_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rent_payments
    ADD CONSTRAINT rent_payments_lease_id_98e8b86f_fk_leases_id FOREIGN KEY (lease_id) REFERENCES public.leases(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: role_permissions role_permissions_permission_id_ad343843_fk_permissions_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_ad343843_fk_permissions_id FOREIGN KEY (permission_id) REFERENCES public.permissions(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: role_permissions role_permissions_role_id_216516f2_fk_roles_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_216516f2_fk_roles_id FOREIGN KEY (role_id) REFERENCES public.roles(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: security_deposits security_deposits_lease_id_c1d203da_fk_leases_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_deposits
    ADD CONSTRAINT security_deposits_lease_id_c1d203da_fk_leases_id FOREIGN KEY (lease_id) REFERENCES public.leases(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: service_provider_ratings service_provider_rat_service_provider_id_922c5bcf_fk_service_p; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_provider_ratings
    ADD CONSTRAINT service_provider_rat_service_provider_id_922c5bcf_fk_service_p FOREIGN KEY (service_provider_id) REFERENCES public.service_providers(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: support_tickets support_tickets_assigned_to_admin_id_56bfb5b4_fk_admins_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_assigned_to_admin_id_56bfb5b4_fk_admins_id FOREIGN KEY (assigned_to_admin_id) REFERENCES public.admins(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: support_tickets support_tickets_assigned_to_landlord_a1c89122_fk_landlords; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_assigned_to_landlord_a1c89122_fk_landlords FOREIGN KEY (assigned_to_landlord_id) REFERENCES public.landlords(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: support_tickets support_tickets_assigned_to_pmc_id_3f379051_fk_property_; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_assigned_to_pmc_id_3f379051_fk_property_ FOREIGN KEY (assigned_to_pmc_id) REFERENCES public.property_management_companies(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: support_tickets support_tickets_created_by_landlord_id_bb9793c4_fk_landlords_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_created_by_landlord_id_bb9793c4_fk_landlords_id FOREIGN KEY (created_by_landlord_id) REFERENCES public.landlords(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: support_tickets support_tickets_created_by_tenant_id_be2b64de_fk_tenants_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_created_by_tenant_id_be2b64de_fk_tenants_id FOREIGN KEY (created_by_tenant_id) REFERENCES public.tenants(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: support_tickets support_tickets_property_id_f52db6c4_fk_properties_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_property_id_f52db6c4_fk_properties_id FOREIGN KEY (property_id) REFERENCES public.properties(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: tenant_invitations tenant_invitations_unit_id_d08788da_fk_units_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_invitations
    ADD CONSTRAINT tenant_invitations_unit_id_d08788da_fk_units_id FOREIGN KEY (unit_id) REFERENCES public.units(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: ticket_attachments ticket_attachments_ticket_id_cb930a94_fk_support_tickets_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_attachments
    ADD CONSTRAINT ticket_attachments_ticket_id_cb930a94_fk_support_tickets_id FOREIGN KEY (ticket_id) REFERENCES public.support_tickets(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: ticket_notes ticket_notes_ticket_id_4ae1d013_fk_support_tickets_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_notes
    ADD CONSTRAINT ticket_notes_ticket_id_4ae1d013_fk_support_tickets_id FOREIGN KEY (ticket_id) REFERENCES public.support_tickets(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: unified_verification_history unified_verification_verification_id_be1cf3c9_fk_unified_v; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unified_verification_history
    ADD CONSTRAINT unified_verification_verification_id_be1cf3c9_fk_unified_v FOREIGN KEY (verification_id) REFERENCES public.unified_verifications(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: units units_property_id_cf7a9cbc_fk_properties_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_property_id_cf7a9cbc_fk_properties_id FOREIGN KEY (property_id) REFERENCES public.properties(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: user_roles user_roles_role_id_816a4486_fk_roles_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_816a4486_fk_roles_id FOREIGN KEY (role_id) REFERENCES public.roles(id) DEFERRABLE INITIALLY DEFERRED;


--
-- PostgreSQL database dump complete
--

\unrestrict 1fd1khG5gjROhSx9tlJBV4Hw5v5CkrqRUw5GqOf4BrSKkpPfb6GOL2rQ0rUmurY

