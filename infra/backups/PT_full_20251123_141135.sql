--
-- PostgreSQL database dump
--

\restrict IeCMlqN1aKD6AWI8zQB0vkEZ94qHj4ofxNO05c2eSizIhYsJKaTCBoQmc38h4bm

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
-- Data for Name: ActivityLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ActivityLog" (id, "userId", "userEmail", "userName", "userRole", "userType", action, "entityType", "entityId", "entityName", description, metadata, "propertyId", "landlordId", "tenantId", "pmcId", "vendorId", "contractorId", "approvalRequestId", "conversationId", "ipAddress", "userAgent", "createdAt") FROM stdin;
mi2jlzanf1d592937a43d826	lld_1763344459960_6wlqekzar	pmc1-lld10@pmc.local	Susan Martin	landlord	landlord	update	unit	unit_1763346638717_085d24654491a016	Unit 2 (Valley Apartments)	Updated "2 Valley Apartments" property - Floor Number: "1" → "2"	{"timestamp": "2025-11-17T02:46:02.735Z", "propertyId": "prop_1763346638715_ff015a913f8a3c1e1c1a3420dbfdc3eb", "unitFieldChanges": [{"field": "Floor Number", "newValue": 2, "oldValue": 1}]}	prop_1763346638715_ff015a913f8a3c1e1c1a3420dbfdc3eb	lld_1763344459960_6wlqekzar	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-17 02:46:02.736
mi2jm75f979059af7691caee	lld_1763344459960_6wlqekzar	pmc1-lld10@pmc.local	Susan Martin	landlord	landlord	update	unit	unit_1763346638716_c7ee53e682aaaeb6	111 (Valley Apartments)	Updated "111 Valley Apartments" property - Unit Name: "Unit 1" → "111"	{"timestamp": "2025-11-17T02:46:12.915Z", "propertyId": "prop_1763346638715_ff015a913f8a3c1e1c1a3420dbfdc3eb", "unitFieldChanges": [{"field": "Unit Name", "newValue": "111", "oldValue": "Unit 1"}]}	prop_1763346638715_ff015a913f8a3c1e1c1a3420dbfdc3eb	lld_1763344459960_6wlqekzar	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-17 02:46:12.916
mi2jmd430d10873c9587a094	lld_1763344459960_6wlqekzar	pmc1-lld10@pmc.local	Susan Martin	landlord	landlord	update	unit	unit_1763346638717_0d633559d4b4bbb6	143 (Valley Apartments)	Updated "143 Valley Apartments" property - Unit Name: "Unit 3" → "143"	{"timestamp": "2025-11-17T02:46:20.643Z", "propertyId": "prop_1763346638715_ff015a913f8a3c1e1c1a3420dbfdc3eb", "unitFieldChanges": [{"field": "Unit Name", "newValue": "143", "oldValue": "Unit 3"}]}	prop_1763346638715_ff015a913f8a3c1e1c1a3420dbfdc3eb	lld_1763344459960_6wlqekzar	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-17 02:46:20.644
mi2jmhni7535f2fd37dd7550	lld_1763344459960_6wlqekzar	pmc1-lld10@pmc.local	Susan Martin	landlord	landlord	update	unit	unit_1763346638717_085d24654491a016	126 (Valley Apartments)	Updated "126 Valley Apartments" property - Unit Name: "Unit 2" → "126"	{"timestamp": "2025-11-17T02:46:26.526Z", "propertyId": "prop_1763346638715_ff015a913f8a3c1e1c1a3420dbfdc3eb", "unitFieldChanges": [{"field": "Unit Name", "newValue": "126", "oldValue": "Unit 2"}]}	prop_1763346638715_ff015a913f8a3c1e1c1a3420dbfdc3eb	lld_1763344459960_6wlqekzar	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-17 02:46:26.527
mi2jmzn6bf79506b3783542d	lld_1763344459960_6wlqekzar	pmc1-lld10@pmc.local	Susan Martin	landlord	landlord	update	unit	unit_1763346638717_085d24654491a016	126 (Valley Apartments)	Updated "126 Valley Apartments" property - Floor Number: "2" → "1"	{"timestamp": "2025-11-17T02:46:49.842Z", "propertyId": "prop_1763346638715_ff015a913f8a3c1e1c1a3420dbfdc3eb", "unitFieldChanges": [{"field": "Floor Number", "newValue": 1, "oldValue": 2}]}	prop_1763346638715_ff015a913f8a3c1e1c1a3420dbfdc3eb	lld_1763344459960_6wlqekzar	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-17 02:46:49.843
mi2kbepza9f16db8f4f87946	lld_1763344459960_6wlqekzar	pmc1-lld10@pmc.local	Susan Martin	landlord	landlord	update	unit	unit_1763346638717_085d24654491a016	126 (Valley Apartments)	Updated "126 Valley Apartments" property - Floor Number: "1" → "2"	{"timestamp": "2025-11-17T03:05:49.128Z", "propertyId": "prop_1763346638715_ff015a913f8a3c1e1c1a3420dbfdc3eb", "unitFieldChanges": [{"field": "Floor Number", "newValue": "2", "oldValue": "1"}]}	prop_1763346638715_ff015a913f8a3c1e1c1a3420dbfdc3eb	lld_1763344459960_6wlqekzar	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-17 03:05:49.128
mi2kbkmif1ba8edb6d067570	lld_1763344459960_6wlqekzar	pmc1-lld10@pmc.local	Susan Martin	landlord	landlord	update	unit	unit_1763346638717_0d633559d4b4bbb6	143 (Valley Apartments)	Updated "143 Valley Apartments" property - Floor Number: "1" → "4"	{"timestamp": "2025-11-17T03:05:56.778Z", "propertyId": "prop_1763346638715_ff015a913f8a3c1e1c1a3420dbfdc3eb", "unitFieldChanges": [{"field": "Floor Number", "newValue": "4", "oldValue": "1"}]}	prop_1763346638715_ff015a913f8a3c1e1c1a3420dbfdc3eb	lld_1763344459960_6wlqekzar	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-17 03:05:56.779
mi3d1qth521416e3faa8fd5a	lld_1763344459953_9k0mhiks4	pmc1-lld6@pmc.local	Sandra Torres	landlord	landlord	update	unit	unit_1763346638685_425bfdb0789b39f0	101 (Ridge Suites)	Updated "101 Ridge Suites" property - Unit Name: "Unit 2" → "101"; Floor Number: "2" → "1"	{"timestamp": "2025-11-17T16:30:07.109Z", "propertyId": "prop_1763346638683_d3dcd1425bcb4adaec65b22760908fe3", "unitFieldChanges": [{"field": "Unit Name", "newValue": "101", "oldValue": "Unit 2"}, {"field": "Floor Number", "newValue": "1", "oldValue": "2"}]}	prop_1763346638683_d3dcd1425bcb4adaec65b22760908fe3	lld_1763344459953_9k0mhiks4	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-17 16:30:07.11
\.


--
-- Data for Name: Admin; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Admin" (id, email, "googleId", "firstName", "lastName", phone, role, "isActive", "isLocked", "lastLoginAt", "lastLoginIp", "allowedGoogleDomains", "ipWhitelist", "requireIpWhitelist", "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
cmi2agu7j0000nb6bcw3lysx2	superadmin@admin.local	\N	Super	Admin	\N	SUPER_ADMIN	t	f	2025-11-23 16:59:28.057	::1	{}	{}	f	2025-11-16 22:30:06.319	2025-11-23 16:59:28.058	\N	\N
cmi2dt32t0001nbspol4blphp	pmc1-admin@pmc.local	\N	PMC	Admin 1	\N	PLATFORM_ADMIN	t	f	\N	\N	{}	{}	f	2025-11-17 00:03:36.534	2025-11-18 13:22:39.548	\N	\N
cmi2dt32z0005nbsp0mpj13b4	pmc2-admin@pmc.local	\N	PMC	Admin 2	\N	PLATFORM_ADMIN	t	f	\N	\N	{}	{}	f	2025-11-17 00:03:36.539	2025-11-18 13:22:39.556	\N	\N
\.


--
-- Data for Name: AdminAuditLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AdminAuditLog" (id, "adminId", action, resource, "resourceId", "targetUserId", "targetUserRole", "targetEntityType", "targetEntityId", "approvalType", "approvalEntityId", "beforeState", "afterState", "changedFields", details, "ipAddress", "userAgent", success, "errorMessage", "googleEmail", "createdAt") FROM stdin;
audit_1763333005220_kqhbjwtr7	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-16 22:43:25.221
audit_1763336756312_iawfvohsb	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-16 23:45:56.313
audit_1762836924431_gt2qhzmrb	\N	login_failed	admin	\N	\N	\N	\N	\N	\N	\N	null	null	{}	{"email": "spamsambi@gmail.com", "reason": "Admin not found"}	::ffff:127.0.0.1	\N	f	Admin not found	spamsambi@gmail.com	2025-11-11 04:55:24.432
audit_1763339098437_johexerml	cmi2agu7j0000nb6bcw3lysx2	update_user	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"changes": {"phone": null, "lastName": "Admin", "firstName": "Super"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-17 00:24:58.437
audit_1763339958301_vklz22hmr	cmi2agu7j0000nb6bcw3lysx2	update_user	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"changes": {"phone": null, "lastName": "Admin", "firstName": "Super"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-17 00:39:18.302
audit_1763343754696_7e0j4l1lp	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-17 01:42:34.697
audit_1763442144794_zj0fsyur9	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-18 05:02:24.795
audit_1763471749551_6a0zy2p0o	\N	login_success	pmc	cmi2dt32t0001nbspol4blphp	cmi2dt32t0001nbspol4blphp	pmc	pmc	cmi2dt32t0001nbspol4blphp	\N	\N	\N	\N	\N	{"userName": "PMC Admin 1", "userEmail": "pmc1-admin@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-18 13:15:49.552
audit_1763471965981_4yifysirm	\N	login_success	pmc	cmi2dt32t0001nbspol4blphp	cmi2dt32t0001nbspol4blphp	pmc	pmc	cmi2dt32t0001nbspol4blphp	\N	\N	\N	\N	\N	{"userName": "PMC Admin 1", "userEmail": "pmc1-admin@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-18 13:19:25.982
audit_1763511956989_2bzqf6qlg	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	curl/8.7.1	t	\N	\N	2025-11-19 00:25:56.99
audit_1763511972192_h7ifkzrrh	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	curl/8.7.1	t	\N	\N	2025-11-19 00:26:12.192
audit_1763524739295_d61mf0kwx	\N	login_success	pmc	cmi2dt32z0005nbsp0mpj13b4	cmi2dt32z0005nbsp0mpj13b4	pmc	pmc	cmi2dt32z0005nbsp0mpj13b4	\N	\N	\N	\N	\N	{"userName": "PMC Admin 2", "userEmail": "pmc2-admin@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	\N	2025-11-19 03:58:59.295
audit_1763556913019_qoo5mzt7c	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-19 12:55:13.02
audit_1763581504564_7ftjwoi79	\N	login_failed	admin	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"email": "superamdin@admin.local", "reason": "Admin not found"}	::1	\N	f	Invalid email or password	\N	2025-11-19 19:45:04.565
audit_1763581515076_xnnjhv5fy	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-19 19:45:15.077
audit_1763590311512_063ufwtia	\N	login_success	landlord	lld_1763344459959_lz6ykg35f	lld_1763344459959_lz6ykg35f	landlord	landlord	lld_1763344459959_lz6ykg35f	\N	\N	\N	\N	\N	{"userName": "Robert King", "userEmail": "pmc1-lld9@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	\N	2025-11-19 22:11:51.513
audit_1763596759281_mb5rl933o	\N	login_success	pmc	cmi2dt32t0001nbspol4blphp	cmi2dt32t0001nbspol4blphp	pmc	pmc	cmi2dt32t0001nbspol4blphp	\N	\N	\N	\N	\N	{"userName": "PMC Admin 1", "userEmail": "pmc1-admin@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	t	\N	\N	2025-11-19 23:59:19.282
audit_1763644508020_ynpegx6cr	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-20 13:15:08.021
audit_1763836414676_oy2fp3j2s	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	curl/8.7.1	t	\N	\N	2025-11-22 18:33:34.677
audit_1763846632725_2cl1ukjob	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-22 21:23:52.726
audit_1763868314640_lf80bfsug	\N	login_failed	admin	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"email": "superamdin@admin.local", "reason": "Admin not found"}	::1	\N	f	Invalid email or password	\N	2025-11-23 03:25:14.641
audit_1763868325549_d7cstv7wy	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-23 03:25:25.55
audit_1763879565974_cir6lo4jl	\N	login_failed	admin	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"email": "superadmin@super.local", "reason": "Admin not found"}	::1	\N	f	Invalid email or password	\N	2025-11-23 06:32:45.975
audit_1762836944108_2rxml7coj	\N	admin_created	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"role": "SUPER_ADMIN", "email": "spamsambi@gmail.com", "createdBy": "manual_setup"}	127.0.0.1	setup-script	t	\N	\N	2025-11-11 04:55:44.109
audit_1763879583026_lex84ymtf	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-23 06:33:03.027
audit_1763339199410_xogluk8uu	cmi2agu7j0000nb6bcw3lysx2	update_user	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"changes": {"phone": null, "lastName": "Admin", "firstName": "Super"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-17 00:26:39.41
audit_1763340409450_7xavfx82e	cmi2agu7j0000nb6bcw3lysx2	update_user	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"changes": {"phone": null, "lastName": "Admin", "firstName": "Super"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-17 00:46:49.451
audit_1763340592230_k053dr9nz	cmi2agu7j0000nb6bcw3lysx2	update_user	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"changes": {"phone": null, "lastName": "Admin", "firstName": "Super"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-17 00:49:52.231
audit_1763396505049_0ni98ga6n	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-17 16:21:45.049
audit_1763468618124_jao8ld66f	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-18 12:23:38.124
audit_1763472050329_xbefdio7n	\N	login_success	pmc	cmi2dt32t0001nbspol4blphp	cmi2dt32t0001nbspol4blphp	pmc	pmc	cmi2dt32t0001nbspol4blphp	\N	\N	\N	\N	\N	{"userName": "PMC Admin 1", "userEmail": "pmc1-admin@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-18 13:20:50.33
audit_1763472161669_ykkfv627v	\N	login_success	pmc	cmi2dt32t0001nbspol4blphp	cmi2dt32t0001nbspol4blphp	pmc	pmc	cmi2dt32t0001nbspol4blphp	\N	\N	\N	\N	\N	{"userName": "PMC Admin 1", "userEmail": "pmc1-admin@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-18 13:22:41.67
audit_1763472215635_p4exxyh3a	\N	login_success	pmc	cmi2dt32t0001nbspol4blphp	cmi2dt32t0001nbspol4blphp	pmc	pmc	cmi2dt32t0001nbspol4blphp	\N	\N	\N	\N	\N	{"userName": "PMC Admin 1", "userEmail": "pmc1-admin@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-18 13:23:35.636
audit_1763511997598_jw6aki1ew	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-19 00:26:37.598
audit_1763524813482_bws9h86wg	\N	login_failed	unknown	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password", "attemptedEmail": "pmc1-lld4@pmc.local"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	f	Invalid email or password	\N	2025-11-19 04:00:13.483
audit_1763524817444_ls6gz1k82	\N	login_success	landlord	lld_1763344459950_2ud9maowk	lld_1763344459950_2ud9maowk	landlord	landlord	lld_1763344459950_2ud9maowk	\N	\N	\N	\N	\N	{"userName": "Richard Robinson", "userEmail": "pmc1-lld4@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	t	\N	\N	2025-11-19 04:00:17.445
audit_1763559436813_8acnuiwqh	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-19 13:37:16.814
audit_1763582605234_2nbens460	\N	login_success	pmc	cmi2dt32t0001nbspol4blphp	cmi2dt32t0001nbspol4blphp	pmc	pmc	cmi2dt32t0001nbspol4blphp	\N	\N	\N	\N	\N	{"userName": "PMC Admin 1", "userEmail": "pmc1-admin@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	t	\N	\N	2025-11-19 20:03:25.235
audit_1763590804434_djw8y6vii	\N	login_success	pmc	cmi2dt32t0001nbspol4blphp	cmi2dt32t0001nbspol4blphp	pmc	pmc	cmi2dt32t0001nbspol4blphp	\N	\N	\N	\N	\N	{"userName": "PMC Admin 1", "userEmail": "pmc1-admin@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	t	\N	\N	2025-11-19 22:20:04.435
audit_1763597459297_cih966on6	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-20 00:10:59.298
audit_1763645004164_tgs71nske	\N	login_success	pmc	cmi2dt32z0005nbsp0mpj13b4	cmi2dt32z0005nbsp0mpj13b4	pmc	pmc	cmi2dt32z0005nbsp0mpj13b4	\N	\N	\N	\N	\N	{"userName": "PMC Admin 2", "userEmail": "pmc2-admin@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	t	\N	\N	2025-11-20 13:23:24.165
audit_1763645014675_iwuk8hlvy	\N	login_success	pmc	cmi2dt32z0005nbsp0mpj13b4	cmi2dt32z0005nbsp0mpj13b4	pmc	pmc	cmi2dt32z0005nbsp0mpj13b4	\N	\N	\N	\N	\N	{"userName": "PMC Admin 2", "userEmail": "pmc2-admin@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	t	\N	\N	2025-11-20 13:23:34.676
audit_1763836743388_8pa39cey2	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	curl/8.7.1	t	\N	\N	2025-11-22 18:39:03.388
audit_1763848757551_t2p7rifmx	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-22 21:59:17.551
audit_1763872421067_kk60jifyh	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-23 04:33:41.068
audit_1763911475502_6yb4icvxc	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-23 15:24:35.502
audit_1763339421919_hy2yrjl06	cmi2agu7j0000nb6bcw3lysx2	update_user	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"changes": {"phone": null, "lastName": "Admin", "firstName": "Super"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-17 00:30:21.92
audit_1763340551692_trpqn3lx7	cmi2agu7j0000nb6bcw3lysx2	update_user	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"changes": {"phone": null, "lastName": "Admin", "firstName": "Super"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-17 00:49:11.693
audit_1763396823490_j9nkl6jcv	\N	login_success	pmc	cmi2dt32z0005nbsp0mpj13b4	cmi2dt32z0005nbsp0mpj13b4	pmc	pmc	cmi2dt32z0005nbsp0mpj13b4	\N	\N	\N	\N	\N	{"userName": "PMC Admin 2", "userEmail": "pmc2-admin@pmc.local", "loginMethod": "password"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	\N	2025-11-17 16:27:03.49
audit_1763470392575_suxnvvtlj	cmi2agu7j0000nb6bcw3lysx2	logout	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-18 12:53:12.576
audit_1763470404119_mynh017qm	\N	login_success	pmc	cmi2dt32t0001nbspol4blphp	cmi2dt32t0001nbspol4blphp	pmc	pmc	cmi2dt32t0001nbspol4blphp	\N	\N	\N	\N	\N	{"userName": "PMC Admin 1", "userEmail": "pmc1-admin@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-18 12:53:24.119
audit_1763070866674_bwteyevhz	\N	login_failed	admin	\N	\N	\N	\N	\N	\N	\N	null	null	{}	{"email": "skolagotla@gmail.com", "reason": "Admin not found"}	::ffff:127.0.0.1	\N	f	Admin not found	skolagotla@gmail.com	2025-11-13 21:54:26.675
audit_1763470419335_r7u53uzie	\N	login_success	pmc	cmi2dt32t0001nbspol4blphp	cmi2dt32t0001nbspol4blphp	pmc	pmc	cmi2dt32t0001nbspol4blphp	\N	\N	\N	\N	\N	{"userName": "PMC Admin 1", "userEmail": "pmc1-admin@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-18 12:53:39.335
audit_1763472437774_6vdtazbhn	\N	login_success	pmc	cmi2dt32t0001nbspol4blphp	cmi2dt32t0001nbspol4blphp	pmc	pmc	cmi2dt32t0001nbspol4blphp	\N	\N	\N	\N	\N	{"userName": "PMC Admin 1", "userEmail": "pmc1-admin@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-18 13:27:17.775
audit_1763512111426_dugck86nf	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	curl/8.7.1	t	\N	\N	2025-11-19 00:28:31.427
audit_1763525317569_cx6mlrxtn	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-19 04:08:37.57
audit_1763568975458_rgy1n6arf	\N	login_failed	admin	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"email": "superadmin@admin.lcoal", "reason": "Admin not found"}	::1	\N	f	Invalid email or password	\N	2025-11-19 16:16:15.459
audit_1763568980448_39dvoc8yx	\N	login_failed	admin	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"email": "superadmin@admin.lcoal", "reason": "Admin not found"}	::1	\N	f	Invalid email or password	\N	2025-11-19 16:16:20.448
audit_1763569001750_g204zxavd	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-19 16:16:41.751
audit_1763583512829_jm5k8vhgm	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-19 20:18:32.829
audit_1763591142973_5si9o6pcm	\N	login_success	pmc	cmi2dt32z0005nbsp0mpj13b4	cmi2dt32z0005nbsp0mpj13b4	pmc	pmc	cmi2dt32z0005nbsp0mpj13b4	\N	\N	\N	\N	\N	{"userName": "PMC Admin 2", "userEmail": "pmc2-admin@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	\N	2025-11-19 22:25:42.974
audit_1763597509176_65xmmu55o	\N	login_success	landlord	lld_1763344459958_gztj01xmk	lld_1763344459958_gztj01xmk	landlord	landlord	lld_1763344459958_gztj01xmk	\N	\N	\N	\N	\N	{"userName": "Michael Martinez", "userEmail": "pmc1-lld8@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	\N	2025-11-20 00:11:49.177
audit_1763688923808_kjgnp09ig	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-21 01:35:23.809
audit_1763843350183_yxfdruad0	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	curl/8.7.1	t	\N	\N	2025-11-22 20:29:10.184
audit_1763843461632_hqzmr9f2k	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	curl/8.7.1	t	\N	\N	2025-11-22 20:31:01.633
audit_1763851447884_luhlpce6f	\N	login_success	pmc	cmi2dt32t0001nbspol4blphp	cmi2dt32t0001nbspol4blphp	pmc	pmc	cmi2dt32t0001nbspol4blphp	\N	\N	\N	\N	\N	{"userName": "PMC Admin 1", "userEmail": "pmc1-admin@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-22 22:44:07.885
audit_1763872602549_iu8203u0c	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-23 04:36:42.55
audit_1763913167715_kw48d3w7v	cmi2agu7j0000nb6bcw3lysx2	login_failed	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"reason": "Invalid password"}	::1	\N	f	Invalid email or password	\N	2025-11-23 15:52:47.715
audit_1762876015173_674p72nx3	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0	t	\N	spamsambi@gmail.com	2025-11-11 15:46:55.174
audit_1763913181898_l9e3835jr	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-23 15:53:01.898
audit_1763339495094_8htnqc3vg	cmi2agu7j0000nb6bcw3lysx2	update_user	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"changes": {"phone": null, "lastName": "Admin", "firstName": "Super"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-17 00:31:35.095
audit_1763340901809_k97rgmvds	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-17 00:55:01.81
audit_1763396966333_xvkpf4qj7	\N	login_success	landlord	lld_1763344459953_9k0mhiks4	lld_1763344459953_9k0mhiks4	landlord	landlord	lld_1763344459953_9k0mhiks4	\N	\N	\N	\N	\N	{"userName": "Sandra Torres", "userEmail": "pmc1-lld6@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	t	\N	\N	2025-11-17 16:29:26.333
audit_1763470648859_pv60iruid	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-18 12:57:28.86
audit_1763482399805_lqej9tgee	\N	login_success	landlord	lld_1763344459958_gztj01xmk	lld_1763344459958_gztj01xmk	landlord	landlord	lld_1763344459958_gztj01xmk	\N	\N	\N	\N	\N	{"userName": "Michael Martinez", "userEmail": "pmc1-lld8@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-18 16:13:19.806
audit_1763519182779_wrhnn9k1b	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-19 02:26:22.779
audit_1763569186839_h4t0d1hxp	\N	login_success	pmc	cmi2dt32t0001nbspol4blphp	cmi2dt32t0001nbspol4blphp	pmc	pmc	cmi2dt32t0001nbspol4blphp	\N	\N	\N	\N	\N	{"userName": "PMC Admin 1", "userEmail": "pmc1-admin@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	t	\N	\N	2025-11-19 16:19:46.84
audit_1763587684588_uua3oggme	\N	login_failed	admin	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"email": "superadmin@admin.lcoal", "reason": "Admin not found"}	::1	\N	f	Invalid email or password	\N	2025-11-19 21:28:04.589
audit_1763587697231_c8cox52b6	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-19 21:28:17.232
audit_1763591199618_py4de56jk	\N	login_success	landlord	lld_1763344459959_lz6ykg35f	lld_1763344459959_lz6ykg35f	landlord	landlord	lld_1763344459959_lz6ykg35f	\N	\N	\N	\N	\N	{"userName": "Robert King", "userEmail": "pmc1-lld9@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	t	\N	\N	2025-11-19 22:26:39.619
audit_1763637611504_h57wdo9wx	\N	login_success	pmc	cmi2dt32t0001nbspol4blphp	cmi2dt32t0001nbspol4blphp	pmc	pmc	cmi2dt32t0001nbspol4blphp	\N	\N	\N	\N	\N	{"userName": "PMC Admin 1", "userEmail": "pmc1-admin@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-20 11:20:11.505
audit_1763637633733_a06fotbfx	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-20 11:20:33.734
audit_1763730332395_nidfocjqr	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	curl/8.7.1	t	\N	\N	2025-11-21 13:05:32.396
audit_1763843525494_b9as00xus	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	curl/8.7.1	t	\N	\N	2025-11-22 20:32:05.495
audit_1763857426062_44j1bj78g	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-23 00:23:46.063
audit_1763857589960_crcxa66fl	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-23 00:26:29.96
audit_1763874586286_3ad0ikdiq	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-23 05:09:46.287
audit_1763913241780_m1swcrzfr	\N	login_failed	unknown	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password", "attemptedEmail": "pmcadmin@pmc.local"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	f	Invalid email or password	\N	2025-11-23 15:54:01.781
audit_1763913250517_rzt21vw5z	\N	login_failed	unknown	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password", "attemptedEmail": "pmcadmin@pmc.local"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	f	Invalid email or password	\N	2025-11-23 15:54:10.518
audit_1763913257000_n9unb5hi5	\N	login_success	pmc	cmi2dt32t0001nbspol4blphp	cmi2dt32t0001nbspol4blphp	pmc	pmc	cmi2dt32t0001nbspol4blphp	\N	\N	\N	\N	\N	{"userName": "PMC Admin 1", "userEmail": "pmc1-admin@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	\N	2025-11-23 15:54:17
audit_1763339584881_doq0njeny	cmi2agu7j0000nb6bcw3lysx2	update_user	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"changes": {"phone": null, "lastName": "Admin", "firstName": "Super"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-17 00:33:04.882
audit_1763341121972_awhmzsujk	cmi2agu7j0000nb6bcw3lysx2	update_user	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"changes": {"phone": null, "lastName": "Admin", "firstName": "Super"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-17 00:58:41.972
audit_1763341153313_d2apev13g	cmi2agu7j0000nb6bcw3lysx2	update_user	admin	cmi2dt32t0001nbspol4blphp	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"changes": {"phone": null, "lastName": "Admin 1", "firstName": "PMC"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-17 00:59:13.314
audit_1763421924090_z4o053082	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-17 23:25:24.091
audit_1763470748571_zubcj593z	cmi2agu7j0000nb6bcw3lysx2	logout	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-18 12:59:08.571
audit_1763495012223_ia3l8x38r	\N	login_failed	unknown	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password", "attemptedEmail": "pmc1-admin@admin.local"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	f	Invalid email or password	\N	2025-11-18 19:43:32.223
audit_1763495041892_lhkptp8br	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-18 19:44:01.893
audit_1763521116620_zqnqrltdn	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-19 02:58:36.621
audit_1763574738419_0s5ut0jdj	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-19 17:52:18.419
audit_1763588706375_c3ge8h8v3	\N	login_success	landlord	lld_1763344459960_6wlqekzar	lld_1763344459960_6wlqekzar	landlord	landlord	lld_1763344459960_6wlqekzar	\N	\N	\N	\N	\N	{"userName": "Susan Martin", "userEmail": "pmc1-lld10@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	\N	2025-11-19 21:45:06.376
audit_1763591404259_4n57zfsi5	\N	login_success	pmc	cmi2dt32t0001nbspol4blphp	cmi2dt32t0001nbspol4blphp	pmc	pmc	cmi2dt32t0001nbspol4blphp	\N	\N	\N	\N	\N	{"userName": "PMC Admin 1", "userEmail": "pmc1-admin@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	\N	2025-11-19 22:30:04.26
audit_1763639571922_fhg6djvmf	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-20 11:52:51.923
audit_1763730442871_utm694yot	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-21 13:07:22.872
audit_1763843589810_reenjni31	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	curl/8.7.1	t	\N	\N	2025-11-22 20:33:09.81
audit_1763843625492_ir07ysc2s	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-22 20:33:45.493
audit_1763859578669_sqgbs1wpu	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-23 00:59:38.67
audit_1763877026489_vv8mhcdds	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-23 05:50:26.49
audit_1763917168063_n3f9nwuhy	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-23 16:59:28.063
audit_1763339651670_52n2nza5d	cmi2agu7j0000nb6bcw3lysx2	update_user	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"changes": {"phone": null, "lastName": "Admin", "firstName": "Super"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-17 00:34:11.671
audit_1763341132487_rr1o3fows	cmi2agu7j0000nb6bcw3lysx2	update_user	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"changes": {"phone": null, "lastName": "Admin", "firstName": "Super"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-17 00:58:52.488
audit_1763439251648_pzgho7w48	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	curl/8.7.1	t	\N	\N	2025-11-18 04:14:11.649
audit_1763439291011_pun2xniad	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	curl/8.7.1	t	\N	\N	2025-11-18 04:14:51.012
audit_1763439309863_hwnhelkzd	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-18 04:15:09.864
audit_1763471139520_sg5f48ldf	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-18 13:05:39.521
audit_1763498000561_qjmvuht5v	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-18 20:33:20.561
audit_1763523205731_i68w5pw1i	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-19 03:33:25.732
audit_1763576631015_yg2a7mgoz	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-19 18:23:51.016
audit_1763338794126_36v6f5hk1	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-17 00:19:54.128
audit_1762837025953_g7on4bufp	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0	t	\N	spamsambi@gmail.com	2025-11-11 04:57:05.954
audit_1762839211535_27r3a099f	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0	t	\N	spamsambi@gmail.com	2025-11-11 05:33:31.537
audit_1762840296783_z03jw66mq	\N	approve_landlord	landlord	cmh6oubzv0000nb70w3ck937k	\N	\N	\N	\N	\N	\N	null	null	{}	{"email": "skolagotla@gmail.com"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0	t	\N	\N	2025-11-11 05:51:36.784
audit_1762840994217_bxt3d8vew	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0	t	\N	spamsambi@gmail.com	2025-11-11 06:03:14.218
audit_1762842818511_p00g73b9m	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0	t	\N	spamsambi@gmail.com	2025-11-11 06:33:38.511
audit_1762865748190_v6oyf4bec	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0	t	\N	spamsambi@gmail.com	2025-11-11 12:55:48.191
audit_1762866247551_w77xnov3k	\N	logout	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	null	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0	t	\N	\N	2025-11-11 13:04:07.552
audit_1762866259032_gtyxop8rw	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0	t	\N	spamsambi@gmail.com	2025-11-11 13:04:19.034
audit_1762868070520_oxs1uabu8	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0	t	\N	spamsambi@gmail.com	2025-11-11 13:34:30.521
audit_1762868408451_nz82xrp57	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0	t	\N	spamsambi@gmail.com	2025-11-11 13:40:08.452
audit_1762870259988_zzncdn1r1	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0	t	\N	spamsambi@gmail.com	2025-11-11 14:10:59.988
audit_1762874153456_qlsfhm2s9	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0	t	\N	spamsambi@gmail.com	2025-11-11 15:15:53.457
audit_1762875081734_1x2x49hia	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	t	\N	spamsambi@gmail.com	2025-11-11 15:31:21.735
audit_1763589339274_1s5ryp6ty	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-19 21:55:39.275
audit_1763591551189_6c9mharsx	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-19 22:32:31.189
audit_1763640815209_tunmnenn1	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	curl/8.7.1	t	\N	\N	2025-11-20 12:13:35.209
audit_1763835811903_zbn6m7lh8	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	curl/8.7.1	t	\N	\N	2025-11-22 18:23:31.904
audit_1762877015991_x9pew5guw	\N	logout	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	null	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0	t	\N	\N	2025-11-11 16:03:35.992
audit_1762877141937_97ej9j0yf	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-11 16:05:41.938
audit_1762878959450_g4kpo37t1	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-11 16:35:59.451
audit_1762879141678_cj7q00tos	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-11 16:39:01.679
audit_1762881091983_vx4mh4sik	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-11 17:11:31.984
audit_1762883241969_kt0l40kvx	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-11 17:47:21.97
audit_1762885270124_a8mhibyzl	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-11 18:21:10.125
audit_1762891265406_0t8svuxug	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-11 20:01:05.407
audit_1762893503484_u4oqdx1nq	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-11 20:38:23.485
audit_1762895603268_wul6t58j7	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-11 21:13:23.269
audit_1762897917308_yvkiz5il1	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-11 21:51:57.31
audit_1762900111923_k3x7wmrau	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-11 22:28:31.924
audit_1762928884712_rzwmo9y1s	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-12 06:28:04.713
audit_1762929034729_xunprk5zk	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-12 06:30:34.73
audit_1762931312349_jnbeykyzi	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-12 07:08:32.35
audit_1762934137597_jo05cxeux	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-12 07:55:37.598
audit_1762935966034_gnu55mtyd	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-12 08:26:06.035
audit_1762955407303_9ujuf8kwg	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-12 13:50:07.304
audit_1762957928787_iynxwbhs8	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-12 14:32:08.788
audit_1762968855818_sp5yxq1wh	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	spamsambi@gmail.com	2025-11-12 17:34:15.819
audit_1762971091343_tauq10zkj	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	spamsambi@gmail.com	2025-11-12 18:11:31.343
audit_1762973100389_xyat3okv5	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	spamsambi@gmail.com	2025-11-12 18:45:00.39
audit_1762997422850_0wq3l96sk	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	spamsambi@gmail.com	2025-11-13 01:30:22.852
audit_1762997540673_37qts8zub	\N	activate_user	tenant	mhwq6qu5b658054fa0552de9	\N	\N	\N	\N	\N	\N	null	null	{}	{"email": "nagasmeruga@gmail.com", "action": "activate"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	\N	2025-11-13 01:32:20.674
audit_1762997543794_ylvvicdxk	\N	suspend_user	tenant	mhwq6qu5b658054fa0552de9	\N	\N	\N	\N	\N	\N	null	null	{}	{"email": "nagasmeruga@gmail.com", "action": "suspend"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	\N	2025-11-13 01:32:23.795
audit_1763030554499_3g534hyka	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	spamsambi@gmail.com	2025-11-13 10:42:34.5
audit_1763060292640_yzaaukgq8	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	spamsambi@gmail.com	2025-11-13 18:58:12.641
audit_1763061592411_3pinusg9p	\N	create_invitation	invitation	inv_1763061590777_9c6hox7zl	\N	\N	\N	\N	\N	\N	null	null	{}	{"type": "pmc", "email": "skolagotla@gmail.com"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	\N	2025-11-13 19:19:52.412
audit_1763065075622_2lmwtcfww	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	spamsambi@gmail.com	2025-11-13 20:17:55.623
audit_1763065216948_5eq57hgp8	\N	create_invitation	invitation	inv_1763065213710_gatbowhv7	\N	\N	\N	\N	\N	\N	null	null	{}	{"type": "pmc", "email": "skolagotla@gmail.com"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	\N	2025-11-13 20:20:16.949
audit_1763067213313_obakeq3kj	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	spamsambi@gmail.com	2025-11-13 20:53:33.314
audit_1763067367399_agv1wr0tx	\N	create_invitation	invitation	inv_1763067364018_qwtu2t84h	\N	\N	\N	\N	\N	\N	null	null	{}	{"type": "pmc", "email": "skolagotla@gmail.com"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	\N	2025-11-13 20:56:07.4
audit_1763070881607_diifz74u7	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	spamsambi@gmail.com	2025-11-13 21:54:41.609
audit_1763072399695_9ryqgmt6g	\N	create_invitation	invitation	inv_1763072395492_noul6i785	\N	\N	\N	\N	\N	\N	null	null	{}	{"type": "pmc", "email": "skolagotla@gmail.com"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	\N	2025-11-13 22:19:59.696
audit_1763072768144_urr0kvig2	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	spamsambi@gmail.com	2025-11-13 22:26:08.145
audit_1763075814558_08gfzipwz	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	spamsambi@gmail.com	2025-11-13 23:16:54.559
audit_1763076979103_hpq3ozkeh	\N	create_invitation	invitation	inv_1763076967708_luy4mc01e	\N	\N	\N	\N	\N	\N	null	null	{}	{"type": "pmc", "email": "skolagotla@gmail.com"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	\N	2025-11-13 23:36:19.105
audit_1763077656557_ul2ahkfc0	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	spamsambi@gmail.com	2025-11-13 23:47:36.558
audit_1763099289761_tfegabawi	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	spamsambi@gmail.com	2025-11-14 05:48:09.762
audit_1763147490787_6ywq7euwl	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-14 19:11:30.787
audit_1763151835522_5jdobnl0q	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-14 20:23:55.523
audit_1763154621609_5j3j0gx8i	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-14 21:10:21.611
audit_1763155313400_ilzk5m6b4	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-14 21:21:53.401
audit_1763155362468_kwzla5en7	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-14 21:22:42.469
audit_1763155567022_q22p4tk04	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-14 21:26:07.023
audit_1763155930356_bp7wiy842	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-14 21:32:10.357
audit_1763158461639_31y3odifm	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-14 22:14:21.641
audit_1763158589239_4xwkwc92l	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-14 22:16:29.24
audit_1763343567703_3d97zlv8k	cmi2agu7j0000nb6bcw3lysx2	login_failed	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"reason": "Invalid password"}	::1	\N	f	Invalid email or password	\N	2025-11-17 01:39:27.704
audit_1763158630175_lbnsg6pyt	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-14 22:17:10.176
audit_1763158636370_5no6xecms	\N	logout	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	null	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-14 22:17:16.37
audit_1763158670902_jhvmlup35	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-14 22:17:50.904
audit_1763158736914_u8yj69wad	\N	create_invitation	invitation	inv_1763158735029_l1xkctuvb	\N	\N	\N	\N	\N	\N	null	null	{}	{"type": "pmc", "email": "skolagotla@gmail.com"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-14 22:18:56.915
audit_1763160505138_1yk6s2tlm	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-14 22:48:25.138
audit_1763164090409_gxhv3xpch	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-14 23:48:10.41
audit_1763166683275_crxh6c6uf	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-15 00:31:23.277
audit_1763168719556_9sd6kr6g9	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-15 01:05:19.557
audit_1763171131824_325k4shu1	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-15 01:45:31.826
audit_1763172320208_mhlr986nl	\N	logout	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	null	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-15 02:05:20.209
audit_1763172326838_1hfdzuba3	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-15 02:05:26.839
audit_1763173891666_3lzuiq44k	\N	logout	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	null	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-15 02:31:31.666
audit_1763173902767_mi9hgiuqv	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-15 02:31:42.768
audit_1763175733945_ddarju5fl	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-15 03:02:13.946
audit_1763177065628_qq4p5bq1o	\N	update_settings	platform	\N	\N	\N	\N	\N	\N	\N	null	null	{}	{"changes": {"email": {"enabled": true, "provider": "gmail"}, "stripe": {"enabled": false}, "featureFlags": {"rentPayments": true, "documentVault": true, "tenantInvitations": true, "maintenanceRequests": true}, "notifications": {"enabled": true, "channels": ["email"]}, "maintenanceMode": false}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-15 03:24:25.628
audit_1763177085015_5pzu2g4y2	\N	update_settings	platform	\N	\N	\N	\N	\N	\N	\N	null	null	{}	{"changes": {"email": {"enabled": true, "provider": "gmail"}, "stripe": {"enabled": false}, "featureFlags": {"rentPayments": true, "documentVault": true, "tenantInvitations": true, "maintenanceRequests": true}, "notifications": {"enabled": true, "channels": ["email"]}, "maintenanceMode": true}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-15 03:24:45.016
audit_1763177627466_52w1t8d7e	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-15 03:33:47.467
audit_1763178472759_rs73qifk2	\N	update_user	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"changes": {"role": "SUPER_ADMIN", "phone": "9179791228", "lastName": "Kolagotla", "firstName": "Spam"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-15 03:47:52.76
audit_1763212381773_wygdb8b2n	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-15 13:13:01.774
audit_1763238377994_k8ehdhv4r	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-15 20:26:17.995
audit_1763238888003_u0pz50hb3	\N	logout	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	null	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-15 20:34:48.004
audit_1763244728118_ppg1qprtg	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-15 22:12:08.12
audit_1763253279343_tgmmapfc4	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-16 00:34:39.343
audit_1763265793847_vvrjo2pu8	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-16 04:03:13.848
audit_1763268286301_5j4zf7vms	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-16 04:44:46.301
audit_1763320191137_buw03ffih	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-16 19:09:51.138
audit_1763322076429_lkkvo9o20	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-16 19:41:16.429
audit_1763324029140_131mm5zg0	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-16 20:13:49.14
audit_1763324510463_n6vj3prnx	\N	update_user	pmc	mhzjydymf9f6273898498c3d	\N	\N	\N	\N	\N	\N	null	null	{}	{"changes": {"phone": "2128142020", "companyName": "AB Homes"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-16 20:21:50.463
audit_1763324523253_rito1n2po	\N	update_user	pmc	mhzjydymf9f6273898498c3d	\N	\N	\N	\N	\N	\N	null	null	{}	{"changes": {"phone": "2128142020", "companyName": "AB Homes"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-16 20:22:03.254
audit_1763324528207_l8v8ezoub	\N	update_user	pmc	mhzjydymf9f6273898498c3d	\N	\N	\N	\N	\N	\N	null	null	{}	{"changes": {"phone": "2128142020", "companyName": "AB Homes"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-16 20:22:08.208
audit_1763324536284_5hzb31jsd	\N	update_user	pmc	mhzjydymf9f6273898498c3d	\N	\N	\N	\N	\N	\N	null	null	{}	{"changes": {"phone": "2128142020", "companyName": "AB Homes"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-16 20:22:16.285
audit_1763324683715_444njwsg9	\N	update_user	pmc	mhzjydymf9f6273898498c3d	\N	\N	\N	\N	\N	\N	null	null	{}	{"changes": {"phone": "2128142020", "companyName": "AB Homes"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-16 20:24:43.716
audit_1763324693029_ukheb8u25	\N	update_user	pmc	mhzjydymf9f6273898498c3d	\N	\N	\N	\N	\N	\N	null	null	{}	{"changes": {"phone": "2128142020", "companyName": "AB Homes"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-16 20:24:53.03
audit_1763324698366_19dkosx9p	\N	update_user	pmc	mhzjydymf9f6273898498c3d	\N	\N	\N	\N	\N	\N	null	null	{}	{"changes": {"phone": "2128142020", "companyName": "AB Homes"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-16 20:24:58.367
audit_1763324722756_8nlpv3j0y	\N	update_user	pmc	mhzjydymf9f6273898498c3d	\N	\N	\N	\N	\N	\N	null	null	{}	{"changes": {"phone": "2128142020", "companyName": "AB Homes"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-16 20:25:22.757
audit_1763324734878_eo8hlynnb	\N	update_user	pmc	mhzjydymf9f6273898498c3d	\N	\N	\N	\N	\N	\N	null	null	{}	{"changes": {"phone": "2128142020", "companyName": "AB Homes"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-16 20:25:34.879
audit_1763324743358_p2ftwhxm6	\N	update_user	pmc	mhzjydymf9f6273898498c3d	\N	\N	\N	\N	\N	\N	null	null	{}	{"changes": {"phone": "2128142020", "companyName": "AB Homes"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-16 20:25:43.359
audit_1763324758193_56pg43ngz	\N	update_user	pmc	mhzjydymf9f6273898498c3d	\N	\N	\N	\N	\N	\N	null	null	{}	{"changes": {"phone": "2128142020", "companyName": "AB Homes"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-16 20:25:58.194
audit_1763324793289_fauslh815	\N	update_user	pmc	mhzjydymf9f6273898498c3d	\N	\N	\N	\N	\N	\N	null	null	{}	{"changes": {"phone": "2128142020", "companyName": "AB Homes"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-16 20:26:33.29
audit_1763324914823_0ttntahs5	\N	update_user	pmc	mhzjydymf9f6273898498c3d	\N	\N	\N	\N	\N	\N	null	null	{}	{"changes": {"phone": "2128142020", "companyName": "AB Homes"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-16 20:28:34.824
audit_1763325130468_8kyy2gub8	\N	update_user	pmc	mhzjydymf9f6273898498c3d	\N	\N	\N	\N	\N	\N	null	null	{}	{"changes": {"phone": "2128142020", "companyName": "AB Homes"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-16 20:32:10.469
audit_1763325203160_d2qyb2f9s	\N	update_user	pmc	mhzjydymf9f6273898498c3d	\N	\N	\N	\N	\N	\N	null	null	{}	{"changes": {"phone": "2128142020", "companyName": "AB Homes"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-16 20:33:23.161
audit_1763325249261_i8xi11wmr	\N	update_user	pmc	mhzjydymf9f6273898498c3d	\N	\N	\N	\N	\N	\N	null	null	{}	{"changes": {"phone": "2128142020", "companyName": "AB Homes"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-16 20:34:09.262
audit_1763325404720_pa4h394dv	\N	update_user	pmc	mhzjydymf9f6273898498c3d	\N	\N	\N	\N	\N	\N	null	null	{}	{"changes": {"phone": "2128142020", "companyName": "AB Homes"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-16 20:36:44.721
audit_1763325658483_6j25y863i	\N	update_user	pmc	mhzjydymf9f6273898498c3d	\N	\N	\N	\N	\N	\N	null	null	{}	{"changes": {"phone": "2128142020", "companyName": "AB Homes"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-16 20:40:58.484
audit_1763589492408_sm7hubl1q	\N	login_failed	admin	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"email": "test", "reason": "Admin not found"}	::1	\N	f	Invalid email or password	\N	2025-11-19 21:58:12.409
audit_1763325688028_9lapvzpah	\N	update_user	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"changes": {"role": "SUPER_ADMIN", "phone": "9179791228", "lastName": "Kolagotla", "firstName": "Spam"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-16 20:41:28.028
audit_1763325699152_sjwxh2kmj	\N	update_user	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"changes": {"role": "SUPER_ADMIN", "phone": "9179791228", "lastName": "Kolagotla", "firstName": "Spam"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-16 20:41:39.153
audit_1763326004904_0q3dpnuvc	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-16 20:46:44.904
audit_1763329354808_7zhmtcvwr	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-16 21:42:34.809
audit_1763331285015_jooqa1p17	\N	login_success	admin	admin_1762836944093_guaqbbv2f	\N	\N	\N	\N	\N	\N	null	null	{}	{"googleId": "108703621633768106204"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	spamsambi@gmail.com	2025-11-16 22:14:45.016
audit_1763339899149_2ujpfi1nj	cmi2agu7j0000nb6bcw3lysx2	update_user	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"changes": {"phone": null, "lastName": "Admin", "firstName": "Super"}}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-17 00:38:19.15
audit_1763343574122_ne1mg4ebu	cmi2agu7j0000nb6bcw3lysx2	login_failed	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"reason": "Invalid password"}	::1	\N	f	Invalid email or password	\N	2025-11-17 01:39:34.123
audit_1763440217735_4qm2xr1xr	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-18 04:30:17.735
audit_1763471213414_rjce7kfdf	cmi2agu7j0000nb6bcw3lysx2	logout	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-18 13:06:53.415
audit_1763471226550_5uxo5l94z	\N	login_success	pmc	cmi2dt32t0001nbspol4blphp	cmi2dt32t0001nbspol4blphp	pmc	pmc	cmi2dt32t0001nbspol4blphp	\N	\N	\N	\N	\N	{"userName": "PMC Admin 1", "userEmail": "pmc1-admin@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-18 13:07:06.551
audit_1763499852946_db4c338k9	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-18 21:04:12.946
audit_1763524704642_j0s6v64vn	\N	login_success	pmc	cmi2dt32t0001nbspol4blphp	cmi2dt32t0001nbspol4blphp	pmc	pmc	cmi2dt32t0001nbspol4blphp	\N	\N	\N	\N	\N	{"userName": "PMC Admin 1", "userEmail": "pmc1-admin@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0	t	\N	\N	2025-11-19 03:58:24.643
audit_1763578775242_pe6m7y5yj	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-19 18:59:35.243
audit_1763589518105_pypnmkyyi	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-19 21:58:38.106
audit_1763591820534_f4n4hwfcs	\N	login_success	pmc	cmi2dt32z0005nbsp0mpj13b4	cmi2dt32z0005nbsp0mpj13b4	pmc	pmc	cmi2dt32z0005nbsp0mpj13b4	\N	\N	\N	\N	\N	{"userName": "PMC Admin 2", "userEmail": "pmc2-admin@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	t	\N	\N	2025-11-19 22:37:00.534
audit_1763640897381_8lr0nsp92	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-20 12:14:57.381
audit_1763835840866_wdeocw53s	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	curl/8.7.1	t	\N	\N	2025-11-22 18:24:00.866
audit_1763843699192_emvd49pvk	cmi2agu7j0000nb6bcw3lysx2	logout	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-22 20:34:59.193
audit_1763843720791_incptjekb	\N	login_success	pmc	cmi2dt32t0001nbspol4blphp	cmi2dt32t0001nbspol4blphp	pmc	pmc	cmi2dt32t0001nbspol4blphp	\N	\N	\N	\N	\N	{"userName": "PMC Admin 1", "userEmail": "pmc1-admin@pmc.local", "loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-22 20:35:20.791
audit_1763861440181_oilknbxdp	\N	login_failed	admin	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"email": "superdmin@admin.local", "reason": "Admin not found"}	::1	\N	f	Invalid email or password	\N	2025-11-23 01:30:40.181
audit_1763877397863_rlmrvfh0k	cmi2agu7j0000nb6bcw3lysx2	login_success	admin	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"loginMethod": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	t	\N	\N	2025-11-23 05:56:37.864
\.


--
-- Data for Name: AdminPermission; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AdminPermission" (id, "adminId", resource, action, conditions) FROM stdin;
\.


--
-- Data for Name: AdminSession; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AdminSession" (id, "adminId", token, "refreshToken", "googleAccessToken", "googleRefreshToken", "ipAddress", "userAgent", "deviceFingerprint", "expiresAt", "lastActivityAt", "isRevoked") FROM stdin;
session_1763338794124_fk3z114zk	cmi2agu7j0000nb6bcw3lysx2	d70f8b55614c4c759562f359f2d19bc0ecfe948fadd3750d7fc9c567edf2aba3	0834a4a8677191c291a266cea3b5454214302be5f97428195335349cdfc652f4	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-17 00:49:54.124	2025-11-17 00:49:53.232	f
session_1763333005215_5lnljt5cm	cmi2agu7j0000nb6bcw3lysx2	53a47bea12833e1e1e5c113f754b3390fa1ee36e514827591ad7f04ab1fb718a	fa65f204064e42b4d0585c4c1e3dfc63e4199b1db06a691fdabc3002b07aca2f	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-16 23:13:25.215	2025-11-16 23:12:13.683	f
session_1763591551181_y3cenvpqa	cmi2agu7j0000nb6bcw3lysx2	5688a8f9dea236b423356f4e4e1874171a6e2ad7502af5b092a35c8b9c4dd9ba	6e8d90b8451efb16d2653e0500ff1942a4f71049bd573dae2cd42301b43d5a80	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-19 23:02:31.181	2025-11-19 22:34:29.714	f
session_1763640815206_fdsvu3q53	cmi2agu7j0000nb6bcw3lysx2	9e5d460ed4e6153bd1e43dac128f377bd2fc9cdbdd062b3809d88f83b5269598	829d2392057dbc71ec9badbad45b2e68863b06a49b9d5e5de44597a102e674f4	\N	\N	::1	curl/8.7.1	\N	2025-11-20 12:43:35.206	2025-11-20 12:13:35.206	f
session_1763499852943_cdfotw95b	cmi2agu7j0000nb6bcw3lysx2	4e63ce40c9c2029445b05a45429e1b6a9bbb20accb67db9b0e4781771f08f7e5	549b9a7a4dc6ffe36b51c194cd3cf14843143bd9f5736213549fd969b78ce49d	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-18 21:34:12.943	2025-11-18 21:34:01.767	f
session_1763730442869_zjhtmhaz1	cmi2agu7j0000nb6bcw3lysx2	2985c29bca3d890df0f774cf0d25e72a797bbf60b812f445c5924b94e35b21f2	a49c9f1cc8e92651491ba0547ace07e818755857a20db58fdbc1bc123d2480b6	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-21 13:37:22.869	2025-11-21 13:10:02.972	f
session_1763336756309_alpbk8pq8	cmi2agu7j0000nb6bcw3lysx2	56e0dcd2c2ee04ba3a7d6d9be72bb2fe6166d729061871394a3f61b2ddc8633f	39d1165af27375b341953d67b75210fe8f4d1fa29d15fbbd8d15a194cec0cb43	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-17 00:15:56.309	2025-11-17 00:15:25.904	f
session_1763843350181_r3s47khem	cmi2agu7j0000nb6bcw3lysx2	b6a3f3295d56872b7e70e8d1120cb924df72fe0c4027e512befc0d5a7a43a08a	c6d4bcd69b86dda3b74858a1ee3e935fb04e73f1c2fe86ddad8fa0559935fb3e	\N	\N	::1	curl/8.7.1	\N	2025-11-22 20:59:10.181	2025-11-22 20:29:10.181	f
session_1763440217733_9qkfi4n2b	cmi2agu7j0000nb6bcw3lysx2	b21107add804051045fdbf28db4e7a9bbb103a669b80431c6ddfe28fd7080f8b	61a3cca39b6d904f310978cf7f076f19ac5ca0996274522ead9f68ef058fe493	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-18 05:00:17.733	2025-11-18 05:00:05.346	f
session_1763421924081_y31xc6wpp	cmi2agu7j0000nb6bcw3lysx2	213333c6c28be93779d90bcb6843fbd358670b6c9b7afcf9e0731115f9143cbe	a2ca018a13fa96afd3dbd0592e070ebbfe157637c8d14581065eae754af83ba6	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-17 23:55:24.081	2025-11-17 23:46:53.139	f
session_1763574738416_yvirze6j4	cmi2agu7j0000nb6bcw3lysx2	c8e35bda4f34079569aaa155a567c946f9e8feb70bab4415f01324e6c8dec96e	10144a453aba6461ebd3ff0e24ca0e22c123db9e4a427a7c7e52100b2aad7b37	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-19 18:22:18.416	2025-11-19 18:22:02.659	f
session_1763519182776_9gjdaocs4	cmi2agu7j0000nb6bcw3lysx2	08671a6457e75954b7fca6de61b2e60b8f2369d8ee534d78893b845592d7bf79	ce97f5dbe1c3acd937ec47ed1d8aaba3ac769ffed57cab8cb887670137afc3ab	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-19 02:56:22.776	2025-11-19 02:56:19.144	f
session_1763470648853_hfxaa1y95	cmi2agu7j0000nb6bcw3lysx2	45c5cbfa39f96582099387c215d91e0a0f86c3d834b9d4fe246a7c3c3026e16e	d7d564c9db23f0504b1576201e52db211b7c06cf810853388fa11f4619115634	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-18 13:27:28.853	2025-11-18 12:59:08.57	t
session_1763843461631_5bgbobn7v	cmi2agu7j0000nb6bcw3lysx2	28e8815ec934a217878468c80b9af3879fa657430f589f56521405cdc4f09467	27702efb8c04b3812866cfc223e590de8c87c1ebb62e9b006fe7e38ee7ad2232	\N	\N	::1	curl/8.7.1	\N	2025-11-22 21:01:01.631	2025-11-22 20:31:01.631	f
session_1763640897380_hlnt38cvh	cmi2agu7j0000nb6bcw3lysx2	1b69acef49202028c19873c0bba6a2606c822f90a08fa3e0e3c02cde5314e274	df87bfcd379fd6089859be6d7c58437420f30f34a04cc98532391ea2fe5fa2b7	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-20 12:44:57.38	2025-11-20 12:35:29.425	f
session_1763583512825_kdurzmc6s	cmi2agu7j0000nb6bcw3lysx2	88304b44c020224e4d93ecfe43ab39b905a46da3e17f7ca95a8af1e4bf3379b3	669713ab84ced8286de475f3e9ba27c89674e04ea46acf5f63d6fb35b943a6b6	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-19 20:48:32.825	2025-11-19 20:23:52.881	f
session_1763848757547_3uml30vw9	cmi2agu7j0000nb6bcw3lysx2	6f4a6616b02bdd81edb8269d98eee7e47942681e6b79cd0a238c016c757e867b	8dcee0022f02b3ebefcdd7a2803cbde3b0f5b2968de0efa0e2e361710d9a5379	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-22 22:29:17.546	2025-11-22 22:17:46.605	f
session_1763872421065_vrje1rcp7	cmi2agu7j0000nb6bcw3lysx2	edc27d14a196d95365b31490f4d87da9913ba0ff80d59aada89ec57e1231748f	80802f23eb66c425788ac1e92ad2381bcde46f0dc45644911d40866962c59be7	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-23 05:03:41.065	2025-11-23 04:36:32.616	f
session_1763911475499_j6973566e	cmi2agu7j0000nb6bcw3lysx2	d58cc772577ab75b5d3275c5540ec7db358a74577c83a745b5c2a9f7bc4800e9	9466b4ced0bb407c8dab469cf995452fe7b7525539e8222ed6ba234630215686	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-23 15:54:35.499	2025-11-23 15:52:08.372	f
session_1763917168061_a13ca0gxa	cmi2agu7j0000nb6bcw3lysx2	c98eda23330fff7d025d6127a9667c8846e3c773280f7a9a03e3963584c121c6	9ae7c54f6b5278330551130c6485076733809727e944fc71e736681c5f5f0e60	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-23 17:29:28.06	2025-11-23 17:09:45.959	f
session_1763439251646_8nid3wbet	cmi2agu7j0000nb6bcw3lysx2	ad7d82ddbe43595d8fa29e2a151bba77ca43d241dee64308c27b8bce6b22729c	38d33c3d7691d9c1c0068c53ae88067aaac5956b2897b1154cfa10eb681e3916	\N	\N	::1	curl/8.7.1	\N	2025-11-18 04:44:11.646	2025-11-18 04:14:11.646	f
session_1763439291010_zhujynbq1	cmi2agu7j0000nb6bcw3lysx2	c3a512d2aaab5d8c01323b33ff4691b70b967f526672e7de6633b3188616c0a8	5bc3a9b8154b04d9794f5cc2f0f3624fa5c798a30555b8c459aca252a8db10df	\N	\N	::1	curl/8.7.1	\N	2025-11-18 04:44:51.01	2025-11-18 04:14:51.01	f
session_1763511956986_6w7w5hctk	cmi2agu7j0000nb6bcw3lysx2	1bea25d667d1053890485b68a77cc4757203cf1d23626f7e0e707eac6e53c721	04f10317fde46239bd7c263eaf896d8601b294d180bc6bebfdf3c62fd9667b1a	\N	\N	::1	curl/8.7.1	\N	2025-11-19 00:55:56.986	2025-11-19 00:25:56.986	f
session_1763511972190_ggduyzsjt	cmi2agu7j0000nb6bcw3lysx2	5236b744c7e4626e1769b817b12acb9d2ae3983e1f762e1a0e562059978316dc	d90dd6e3b49b6a3c91f6db6d09152d47a2363a7c20622518455d0cac166444ce	\N	\N	::1	curl/8.7.1	\N	2025-11-19 00:56:12.19	2025-11-19 00:26:12.19	f
session_1763576631013_bru5d9e20	cmi2agu7j0000nb6bcw3lysx2	47aacc79e698a7c9078657ac761e2b010717fc2a305b9797dd10722268ff1224	f393681bd175ed04388a09b066536d4ec7d427021caf67a0239ad6603e0b0a30	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-19 18:53:51.013	2025-11-19 18:52:08.647	f
session_1763556913013_mk66u4o9a	cmi2agu7j0000nb6bcw3lysx2	244c4d25fda8323e4a5fc78cc359e317c72d67e781bc93a72cd433db26bebca2	66bfff759d437a572ff67978a6de2db56782b594757058f94343d98d77e59479	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-19 13:25:13.013	2025-11-19 13:20:40.664	f
session_1763340901807_mtn9tnm1o	cmi2agu7j0000nb6bcw3lysx2	345e6241326cddfe777ffa6a186a371cd683fe1c4f700582d0a79ed08c2d3990	cd2d0b70b5fa93618c16b737e63511235a267c96f7b7f8dca81fc671eeb5e2ab	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-17 01:25:01.807	2025-11-17 01:14:22.954	f
session_1763857589958_3ida5d1l3	cmi2agu7j0000nb6bcw3lysx2	5a7c7b64ec921527acf4771d7d0b80352210be7ebe72a172529d29cd9aaefd2a	b5458c3daea666dede3d90b995822de620cd3ee62bd18e5255aa759cb5ff821a	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-23 00:56:29.958	2025-11-23 00:55:05.437	f
session_1763439309862_pm5qcedyr	cmi2agu7j0000nb6bcw3lysx2	c62195f2470385a6103adebef3a674d2bc967e3d6423dfe3e73342c9addb92c3	31d0511fc62f714e0056b831c26ae48ab3d01c74a08d06ae676e187d536721a5	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-18 04:45:09.862	2025-11-18 04:28:46.571	f
session_1763521116618_k1181o3gt	cmi2agu7j0000nb6bcw3lysx2	6bb26ad2a403a4bd83ff1548edc4b1962fe03bc43d50a808c31540197e1df53a	595ba9f3119a4e7726fce2ec8dc45c5249e2f7c9c8303370ab85ef55dbd74c03	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-19 03:28:36.618	2025-11-19 03:24:45.748	f
session_1763857426060_p0b6q7xc8	cmi2agu7j0000nb6bcw3lysx2	f9053dcba1ea6d230fbb11e5f9d2a8ec30867a54dfe6485eb5bf1d903bc05b06	df5e31809fb190ec7d6c993c16cb97f6b492a7b509998e512422f7611d84d246	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-23 00:53:46.06	2025-11-23 00:26:20.588	f
session_1763471139509_mtawkxwlm	cmi2agu7j0000nb6bcw3lysx2	271099faf54fa52cfb6edc3bc665f681e9a29e409dc047a447f37e5e98550994	d3a15a68efbb76f1c00ebf023570b3e1481d1ae9b5bb5774d241b19bcfc0605a	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-18 13:35:39.509	2025-11-18 13:06:53.413	t
session_1763587697225_pfvqy6bdk	cmi2agu7j0000nb6bcw3lysx2	f655294d31315ced9aaffcc36bfb5156b998b233de9153596ac986b0271fb8cc	52eb82d1ce6f382e17c437694c54034009d252f9c685abfca14ff6fc96e19004	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-19 21:58:17.225	2025-11-19 21:55:23.671	f
session_1763644508018_4kf8t5iam	cmi2agu7j0000nb6bcw3lysx2	c85f164ed4b34bd304bf8ed0dc05f920f151928c8a46b737ade28a175eda5308	8d48ed92368d6f5176dbdd5a4adc598e17f92e66441ba57dc897036db5429c18	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-20 13:45:08.018	2025-11-20 13:26:32.351	f
session_1763597459293_35j39kyni	cmi2agu7j0000nb6bcw3lysx2	6b387f8d13c69a1dbf0c8b4c78834d245a9f9763e7fa1f264e9ad1996f9558c1	01917cdf0eb7591b1f0dcab99ec9c362636eb4caeef354fe51bf3e6dddc9e260	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-20 00:40:59.293	2025-11-20 00:38:20.87	f
session_1763835811900_v75vkjst6	cmi2agu7j0000nb6bcw3lysx2	ccd28e714e376a3239f245e81ede8892aa6f1e4bb505f4cb5ae1eb994901ffac	526144191abc0f75f75681b975e25352085e87ddd9936f71bd8c9bfee7021a68	\N	\N	::1	curl/8.7.1	\N	2025-11-22 18:53:31.9	2025-11-22 18:23:31.9	f
session_1763835840864_4yd24epda	cmi2agu7j0000nb6bcw3lysx2	f67fc82a9ee83dc73e51a940cdca2a8ccfb3e4c7d8ab14dcb2200f9e61be04e8	4284f474d8c374d3d0b94e307dd832a9cc4b4ef4b432c59c600df50efeed18a4	\N	\N	::1	curl/8.7.1	\N	2025-11-22 18:54:00.864	2025-11-22 18:24:00.864	f
session_1763843525492_r9c1er2c3	cmi2agu7j0000nb6bcw3lysx2	fe9d2a4087a1c99356266e594d7fc4670aecde6c18002ef53428ffaa1c2ae917	b4968bef271fa77f1c75bd374593c7123ee2b5e0ca5535542a2849360c4c6601	\N	\N	::1	curl/8.7.1	\N	2025-11-22 21:02:05.492	2025-11-22 20:32:05.492	f
session_1763872602548_3iq0dtcad	cmi2agu7j0000nb6bcw3lysx2	fd97c2e36a2ee66aaf3b57e911a3b46a3976f54a04b65319516248e642a6d3f1	52384aeefac698257a931fba6f4a7e01ce882cf709ca392499ed26b39143638b	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-23 05:06:42.548	2025-11-23 05:06:41.426	f
session_1763913181896_59ppa8i0c	cmi2agu7j0000nb6bcw3lysx2	b01b44329c6a083efde7fac2988a825d6aa07ef3aa3ede52a85daea7a84dd04b	a8a9f2e8a81cc44e03c3ffd6af256cee641be15c6a117aef8eed3cfcef635f34	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-23 16:23:01.896	2025-11-23 16:14:50.414	f
session_1763877397862_8cnzd3q5r	cmi2agu7j0000nb6bcw3lysx2	1d94515079f880039c1baa1dfcf35f4bd4efd3f36b78c1846698fff295d779c1	fec16c20ba6326a6607df2b8994bc50a64fae7a99faecc22621d15abe2a6aa25	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-23 06:26:37.862	2025-11-23 06:24:34.389	f
session_1763589339271_imlo3g4yb	cmi2agu7j0000nb6bcw3lysx2	225180312fd19d0330bc7bf1a473e078007cb4ed3e773b412711eb8b62ea4fd3	e0b832053d039d14940e9463c63bdb430daaa0acc4af6504fe01a09b9bd39443	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-19 22:25:39.271	2025-11-19 21:58:22.149	f
session_1763442144791_ytbqudetq	cmi2agu7j0000nb6bcw3lysx2	669531ae66197afb0bd028d56b63d3bec172f8c1a320ff33098a1fb89e7e98e4	e0c7bd8568d2628ef1d2241067f3c9b22ff3f822abfc512b5ad74dd1b347c1d4	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-18 05:32:24.791	2025-11-18 05:12:36.999	f
session_1763859578643_axs58wdc5	cmi2agu7j0000nb6bcw3lysx2	6e7d540fceebec1ab6d3f5f0052742e614fc156fd38d323d1b3afbac5d807fcc	6ab52b1161d06832b6bd75d0747d3119546b67c6bffcda8162158670d13e1c5b	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-23 01:29:38.643	2025-11-23 01:26:43.368	f
session_1763843625492_78uv9ky5l	cmi2agu7j0000nb6bcw3lysx2	a7fc80d957b5af198ab42d54ad3900f15a5698131a65055f6e6a7497dbb80d5d	7ecf40adb8c3219b01ce6ca077fe2d46bc024b296fa70ea39968b448a87af7a8	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-22 21:03:45.492	2025-11-22 20:34:59.191	t
session_1763637633730_xeg2hti8v	cmi2agu7j0000nb6bcw3lysx2	a40dbab8d971abddf7641ac9490874b308c8041ab4d5a853c9cebec807926fc8	641f96f2718e479c60fd7ced10259b98a3485762006bc19cacc29a2d7cf6dec6	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-20 11:50:33.73	2025-11-20 11:20:40.216	f
session_1763559436809_eoem0r4ya	cmi2agu7j0000nb6bcw3lysx2	4260b7d3872e194f41372683e7ad40399b452a5a2c2c68931d6a72f9340b4964	e836a32332af0efd1cf2fc5d1539618036dfc8c8074fadf073c73377f8d7011d	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-19 14:07:16.809	2025-11-19 13:47:41.692	f
session_1763495041890_ydo1e9wuh	cmi2agu7j0000nb6bcw3lysx2	035ac262c8ec8abe15ebf2597ad722eca4f067d4596d1eba770b93d7d53acca7	40281bb0e0ffc29914036913d7a29b619f37158b141b9ace9fe5a8c60514154b	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-18 20:14:01.89	2025-11-18 20:00:51.067	f
session_1763343754694_hov84inlk	cmi2agu7j0000nb6bcw3lysx2	68947bcb29af0cf6233b482b6efed1b0a4455712f381fdcac7cf964d6f7c1154	afda9a3635757f52ab6f2e57514445c6f39deb665174f235357d5d792e0f3b66	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-17 02:12:34.694	2025-11-17 02:04:51.865	f
session_1763578775239_9y0zu8rgd	cmi2agu7j0000nb6bcw3lysx2	6d9a66deb8f7cc7dfc568da1450ef1838942714704965d456e0527df82136c72	79628f3d162dd7077503f71332fad182417495558d65bd155764fba26d32d358	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-19 19:29:35.239	2025-11-19 19:28:01.215	f
session_1763511997596_xg2p8z1cc	cmi2agu7j0000nb6bcw3lysx2	69a4985d22398135e34f40df5f7d8073ebfa7c68eca6c778c5f46746cfc534c7	a7e026cae3f201818e7a9c6e9e6da00ad3550b3dfac1cea1d196c671cd04918a	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-19 00:56:37.596	2025-11-19 00:51:59.754	f
session_1763523205729_jjb7py23c	cmi2agu7j0000nb6bcw3lysx2	f42b1b40b8f5fe367d657caa627704defbe0848d3aa49ecc4173ee95db863f29	5f770f44a28ab4933046eb9b2fcc51c2219aa5d1dd389eb73b80699ab915e2cb	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-19 04:03:25.729	2025-11-19 03:57:33.21	f
session_1763688923804_76z4x60dl	cmi2agu7j0000nb6bcw3lysx2	fabe42455474e3a1ac2aa123b38cd1e5bdb039f784dad4fe2e9840ece8b3ebb5	f5682eb8da474e6e19e3bd4e6328a3da65edb1c6ed925160d5411741fe569351	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-21 02:05:23.804	2025-11-21 01:50:11.836	f
session_1763874586284_w5rq9y0v2	cmi2agu7j0000nb6bcw3lysx2	ec957da95545cac7a3ee0e77184018df11acfe26a16868a90abedf8f54a60696	af0e652020d89e5929dd5a093dfcc228187688ee813866503fc5dd8247678329	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-23 05:39:46.284	2025-11-23 05:39:40.094	f
session_1763836414673_663ld0bdh	cmi2agu7j0000nb6bcw3lysx2	5818b447c8f2e6519e7eb800f5bef90badde8bd92096c1c4e77cec2228ef40d6	9a2d743084fabe3dadfc84159bfc7675128fc52b4d9a0016032bf57c3ad2532c	\N	\N	::1	curl/8.7.1	\N	2025-11-22 19:03:34.673	2025-11-22 18:33:34.673	f
session_1763843589808_4kbv3cz4c	cmi2agu7j0000nb6bcw3lysx2	e4b33c0e9490b8b0d7b5613c475583d8720262e381207add2fbcb01cbc414334	42de30ce52e03b0c4a9002ac67ab044bdcd852957247dc25fb59fe93347659b4	\N	\N	::1	curl/8.7.1	\N	2025-11-22 21:03:09.808	2025-11-22 20:33:09.808	f
session_1763581515074_7bjwyvz6k	cmi2agu7j0000nb6bcw3lysx2	829bfccbe3381d45935e3d4a22c74da0b936d5c41bb5bc47cf0249801dae9fed	5d94354826303a0a1836b0a42a3f23305749ff89ffa2bde539d1d90f09e77eee	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-19 20:15:15.074	2025-11-19 20:14:28.149	f
session_1763525317567_msvokg0s4	cmi2agu7j0000nb6bcw3lysx2	5fbed5f35654a04c277e510415de46a54ad207a4dd73e5fb89a117c82776dafc	46736b2023f40a5d1e674f0be7ba8e35175b06549640d7865737fe2daeb3554c	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-19 04:38:37.567	2025-11-19 04:11:03.751	f
session_1763589518103_tu18eufxz	cmi2agu7j0000nb6bcw3lysx2	03e40393a2c476067112cda0ff3a55ebb078cf890b8f9732634d5e8ff37d64df	6fc16ad11090f1527a5cdb56f33af8c3ab23528353b33f11eed7ed0f6bd2cded	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-19 22:28:38.103	2025-11-19 22:28:30.701	f
session_1763569001747_yl7vsqeym	cmi2agu7j0000nb6bcw3lysx2	4a7cb8a179a8902fd792b22abd85551f9a7f347d19a0efa43dde1853f82a446f	4c5ad4771ffbe7f0b6b076e750732378398a406d317415ffb2e4fbfa95cc3e9c	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-19 16:46:41.747	2025-11-19 16:34:33.154	f
session_1763498000558_gc83jrti9	cmi2agu7j0000nb6bcw3lysx2	2cdb20a70ddf9aec67128f0ebab42623d1e5efe79a36676c52909c25e7e4fd95	1f4a926dfbb4aba8d0c5f4fe30ea762a346a3323632b98fdb9ce28d563a1ab32	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-18 21:03:20.558	2025-11-18 21:02:16.98	f
session_1763396505043_vh3bvgtko	cmi2agu7j0000nb6bcw3lysx2	cc5dabd4aebc1c5f2d3112c9f9d0923d9bd61f782bd0ba36a8162c5a0b2825d6	35e6702d42bbf888fe2c50691341bf77f35a72db9a831757e160779e5faf5647	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-17 16:51:45.043	2025-11-17 16:38:38.251	f
session_1763512111423_6stjk7cnb	cmi2agu7j0000nb6bcw3lysx2	7d99751abdb9d9339904d6c38c44439a8d17223bde7d848547f53661b18c93d3	a95b035377f8d1af321d6191f4e6742e6457a3883650b26bdabde5a7fe027dc5	\N	\N	::1	curl/8.7.1	\N	2025-11-19 00:58:31.423	2025-11-19 00:28:31.423	f
session_1763879583013_jlh3twrlt	cmi2agu7j0000nb6bcw3lysx2	da235391ac5955e2c450d919d2646ce14ec9b3198c513f65eb7fb86a315312d8	9bb729374a69bea7c7b0602e74b3e9d65b98a98319c223cf912d2dedb79277ca	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-23 07:03:03.013	2025-11-23 06:35:58.005	f
session_1763868325547_7dn13f7qp	cmi2agu7j0000nb6bcw3lysx2	759e3f35959243326ee57716f07349e5e23ee9afd7f63340a43edf0e2ef71758	46f4618c18f6cb53887d78e7ced1f322ee28c2b10d83d2ef2e3912ac96f5bf8b	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-23 03:55:25.547	2025-11-23 03:44:30.306	f
session_1763468618120_3n1oi2cjz	cmi2agu7j0000nb6bcw3lysx2	e23b33d6ade0a49bcb5cedece2f982424e281aa1ead9928193dda51d8c333772	2049bea88395a982fd165532c0eda7ae330edeb142d812b233392dcf5165bf5f	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-18 12:53:38.12	2025-11-18 12:53:12.574	t
session_1763846632723_5icd476qf	cmi2agu7j0000nb6bcw3lysx2	893c6b5bab9202304a17d5e98bd8fb5e7ad6085d9600f78456c0e3f379f75abc	ef0337c2f87c8d6a7012b41c5ab2d83a90bf86225f79b942044d9480cb3a0bdf	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-22 21:53:52.723	2025-11-22 21:48:32.687	f
session_1763639571920_o32qw07mw	cmi2agu7j0000nb6bcw3lysx2	5f71a4a447f07b55462dbf296e437e48fad88ad02e601e2092b54adb28e5b933	7bac0e1af25dcc7f672f0ef79075b68db5d3191428b0fc3b28bc8e3e4d527bb5	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-20 12:22:51.92	2025-11-20 12:13:28.421	f
session_1763730332393_ov8aiqdv4	cmi2agu7j0000nb6bcw3lysx2	7e45d417c6820a70a5fe9384c3a8bbff150f2684cc525172910bf72b2ff2380a	219f8cb3378a9ed85ae502251d55bd851b9c79b829465138dc89884df0215ecc	\N	\N	::1	curl/8.7.1	\N	2025-11-21 13:35:32.392	2025-11-21 13:05:32.393	f
session_1763836743385_nz3pxpha3	cmi2agu7j0000nb6bcw3lysx2	e71cdae9ad9f452486dd7d409148113eed30b96f610e3ae16d367e245e9aca8a	99e419184676f1c7a6e2bf029d9573787737e0100a9b3374a6cc4b40c2d8624a	\N	\N	::1	curl/8.7.1	\N	2025-11-22 19:09:03.384	2025-11-22 18:39:03.385	f
session_1763877026486_ud3bvqwxf	cmi2agu7j0000nb6bcw3lysx2	eb43a90f0261be770c8fba37d16fb36085b493d678e4dbc1e19d8ec190473622	cc43318e72c5d8284b0a7202ce329c80b0169de80445bb73217b28484e9d1c8b	\N	\N	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	2025-11-23 06:20:26.486	2025-11-23 05:56:22.296	f
\.


--
-- Data for Name: ApiKey; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ApiKey" (id, name, key, "keyHash", permissions, "rateLimit", "isActive", "lastUsedAt", "lastUsedIp", "expiresAt", "createdBy", "createdByEmail", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Application; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Application" (id, "unitId", "propertyId", "applicantId", "applicantEmail", "applicantName", "applicantPhone", "coApplicantIds", status, deadline, "screeningRequested", "screeningRequestedAt", "screeningProvider", "screeningStatus", "screeningData", "approvedAt", "approvedBy", "approvedByType", "approvedByEmail", "approvedByName", "rejectedAt", "rejectedBy", "rejectedByType", "rejectedByEmail", "rejectedByName", "rejectionReason", "leaseId", "applicationData", metadata, "isArchived", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ApprovalRequest; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ApprovalRequest" (id, "workflowType", "entityType", "entityId", "requestedBy", "requestedByType", "requestedByEmail", "requestedByName", "requestedAt", status, "expiresAt", approvers, "approvedBy", "approvedByType", "approvedByEmail", "approvedByName", "approvedAt", "approvalNotes", "rejectedBy", "rejectedByType", "rejectedByEmail", "rejectedByName", "rejectedAt", "rejectionReason", "beforeState", "afterState", metadata, description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: BankReconciliation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BankReconciliation" (id, "reconciliationDate", "pmcId", "landlordId", "propertyId", "startingBalance", "endingBalance", "matchedPayments", "matchedExpenses", "unmatchedPayments", "unmatchedExpenses", "reconciledAmount", difference, status, "reconciledBy", "reconciledByType", "reconciledByEmail", "reconciledByName", "reconciledAt", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ContentItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContentItem" (id, type, title, content, slug, "isPublished", version, "parentId", metadata, "createdBy", "createdByEmail", "updatedBy", "updatedByEmail", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Conversation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Conversation" (id, "propertyId", "landlordId", "tenantId", "pmcId", subject, "conversationType", status, "linkedEntityType", "linkedEntityId", "createdBy", "createdByLandlordId", "createdByTenantId", "createdByPMCId", "lastMessageAt", "lastMessageId", "landlordLastReadAt", "tenantLastReadAt", "pmcLastReadAt", "notifyLandlord", "notifyTenant", "notifyPMC", metadata, priority, tags, participants, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ConversationParticipant; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ConversationParticipant" (id, "conversationId", "participantId", "participantType", "participantRole", "joinedAt", "lastReadAt", "isActive") FROM stdin;
\.


--
-- Data for Name: Country; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Country" (id, code, name, "isActive", "sortOrder", "createdAt", "updatedAt", "currencyCode", "currencySymbol", "dateFormat", "timeFormat", "legalSystem") FROM stdin;
cmhgkgkjk0000nbz0u4wvck3q	CA	CA	t	1	2025-11-01 17:38:54.08	2025-11-01 17:48:54.092	\N	\N	YYYY-MM-DD	24h	\N
cmhgkgkjo0001nbz0p06xldd2	US	USA	t	2	2025-11-01 17:38:54.085	2025-11-01 17:48:54.094	\N	\N	YYYY-MM-DD	24h	\N
\.


--
-- Data for Name: Document; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Document" (id, "tenantId", "propertyId", "fileName", "originalName", "fileType", "fileSize", category, description, "storagePath", "uploadedAt", "updatedAt", "canLandlordDelete", "canTenantDelete", "expirationDate", "isRequired", "isVerified", "reminderSent", "reminderSentAt", subcategory, tags, "uploadedBy", "uploadedByEmail", "uploadedByName", "verifiedAt", "verifiedBy", visibility, "deletedAt", "deletedBy", "deletedByEmail", "deletedByName", "deletionReason", "isDeleted", "verifiedByName", "verifiedByRole", "documentHash", metadata, "isRejected", "rejectedAt", "rejectedBy", "rejectedByName", "rejectedByRole", "rejectionReason", "verificationComment") FROM stdin;
\.


--
-- Data for Name: DocumentAuditLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DocumentAuditLog" (id, "documentId", action, "performedBy", "performedByEmail", "performedByName", "ipAddress", "userAgent", details, "createdAt") FROM stdin;
\.


--
-- Data for Name: DocumentMessage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DocumentMessage" (id, "documentId", message, "senderRole", "senderEmail", "senderName", "isRead", "readAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: EmergencyContact; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."EmergencyContact" (id, "tenantId", "contactName", email, phone, "isPrimary", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Employer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Employer" (id, "tenantId", "employerName", "employerAddress", income, "isCurrent", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: EmploymentDocument; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."EmploymentDocument" (id, "employerId", "fileName", "filePath", "fileSize", "mimeType", "uploadedAt") FROM stdin;
\.


--
-- Data for Name: Eviction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Eviction" (id, "tenantId", "leaseId", "propertyId", "unitId", "initiatedBy", "initiatedByType", "initiatedByEmail", "initiatedByName", "initiatedAt", reason, "reasonDetails", "ltbFormType", "ltbFormId", "ltbCaseNumber", status, "approvedAt", "approvedBy", "approvedByEmail", "approvedByName", "ltbFiledAt", "hearingDate", "hearingOutcome", "evictedAt", "cancelledAt", "cancelledBy", "cancelledReason", documents, "trackingData", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Expense; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Expense" (id, "propertyId", "maintenanceRequestId", category, amount, date, description, "receiptUrl", "paidTo", "paymentMethod", "isRecurring", "recurringFrequency", "createdBy", "createdAt", "updatedAt", "createdByPMC", "pmcId", "pmcApprovalRequestId") FROM stdin;
\.


--
-- Data for Name: FailedLoginAttempt; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."FailedLoginAttempt" (id, email, "ipAddress", "userAgent", "attemptType", reason, "createdAt") FROM stdin;
\.


--
-- Data for Name: FinancialSnapshot; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."FinancialSnapshot" (id, month, "propertyId", "totalIncome", "totalExpenses", "netIncome", "occupancyRate", "createdAt") FROM stdin;
\.


--
-- Data for Name: GeneratedForm; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."GeneratedForm" (id, "formType", "tenantId", "leaseId", "propertyId", "unitId", "generatedBy", "generatedAt", "formData", "pdfUrl", status, notes, "updatedAt") FROM stdin;
\.


--
-- Data for Name: InspectionChecklist; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."InspectionChecklist" (id, "tenantId", "leaseId", "propertyId", "unitId", "checklistType", "inspectionDate", status, "submittedAt", "approvedAt", "approvedBy", "approvedByName", "rejectionReason", "rejectedAt", "rejectedBy", "rejectedByName", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: InspectionChecklistItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."InspectionChecklistItem" (id, "checklistId", "itemId", "itemLabel", category, "isChecked", notes, photos, "landlordNotes", "landlordApproval", "landlordApprovedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Invitation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Invitation" (id, email, token, type, status, "invitedBy", "invitedByRole", "invitedByName", "invitedByEmail", "invitedByAdminId", "invitedByLandlordId", "invitedByPMCId", "invitationSource", "landlordId", "tenantId", "vendorId", "contractorId", "serviceProviderId", "pmcId", "propertyId", "unitId", "expiresAt", "openedAt", "completedAt", "reminderSentAt", "reminderCount", "approvedBy", "approvedAt", "rejectedBy", "rejectedAt", "rejectionReason", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Landlord; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Landlord" (id, "landlordId", "firstName", "middleName", "lastName", email, phone, "addressLine1", "addressLine2", city, "provinceState", "postalZip", country, "organizationId", "countryCode", "regionCode", timezone, "createdAt", "updatedAt", theme, "signatureFileName", "approvalStatus", "approvedBy", "approvedAt", "rejectedBy", "rejectedAt", "rejectionReason", "invitedBy", "invitedAt") FROM stdin;
lld_1763344459933_42r6792tu	LLD-PMC1-01	Christopher	\N	Flores	pmc1-lld1@pmc.local	555-1001	\N	\N	\N	\N	\N	\N	\N	CA	ON	America/Toronto	2025-11-17 01:54:19.934	2025-11-17 01:54:19.933	default	\N	APPROVED	\N	2025-11-17 01:54:19.933	\N	\N	\N	\N	\N
lld_1763344459945_nr6ussfrj	LLD-PMC1-02	Kimberly	\N	King	pmc1-lld2@pmc.local	555-1002	\N	\N	\N	\N	\N	\N	\N	CA	ON	America/Toronto	2025-11-17 01:54:19.946	2025-11-17 01:54:19.945	default	\N	APPROVED	\N	2025-11-17 01:54:19.945	\N	\N	\N	\N	\N
lld_1763344459948_8k66k9kb4	LLD-PMC1-03	Linda	\N	Jackson	pmc1-lld3@pmc.local	555-1003	\N	\N	\N	\N	\N	\N	\N	CA	ON	America/Toronto	2025-11-17 01:54:19.948	2025-11-17 01:54:19.948	default	\N	APPROVED	\N	2025-11-17 01:54:19.948	\N	\N	\N	\N	\N
lld_1763344459950_2ud9maowk	LLD-PMC1-04	Richard	\N	Robinson	pmc1-lld4@pmc.local	555-1004	\N	\N	\N	\N	\N	\N	\N	CA	ON	America/Toronto	2025-11-17 01:54:19.95	2025-11-17 01:54:19.95	default	\N	APPROVED	\N	2025-11-17 01:54:19.95	\N	\N	\N	\N	\N
lld_1763344459951_xaidopicm	LLD-PMC1-05	Lisa	\N	White	pmc1-lld5@pmc.local	555-1005	\N	\N	\N	\N	\N	\N	\N	CA	ON	America/Toronto	2025-11-17 01:54:19.952	2025-11-17 01:54:19.951	default	\N	APPROVED	\N	2025-11-17 01:54:19.951	\N	\N	\N	\N	\N
lld_1763344459953_9k0mhiks4	LLD-PMC1-06	Sandra	\N	Torres	pmc1-lld6@pmc.local	555-1006	\N	\N	\N	\N	\N	\N	\N	CA	ON	America/Toronto	2025-11-17 01:54:19.954	2025-11-17 01:54:19.953	default	\N	APPROVED	\N	2025-11-17 01:54:19.953	\N	\N	\N	\N	\N
lld_1763344459956_x6v0haalr	LLD-PMC1-07	Mary	\N	Jackson	pmc1-lld7@pmc.local	555-1007	\N	\N	\N	\N	\N	\N	\N	CA	ON	America/Toronto	2025-11-17 01:54:19.956	2025-11-17 01:54:19.956	default	\N	APPROVED	\N	2025-11-17 01:54:19.956	\N	\N	\N	\N	\N
lld_1763344459958_gztj01xmk	LLD-PMC1-08	Michael	\N	Martinez	pmc1-lld8@pmc.local	555-1008	\N	\N	\N	\N	\N	\N	\N	CA	ON	America/Toronto	2025-11-17 01:54:19.958	2025-11-17 01:54:19.958	default	\N	APPROVED	\N	2025-11-17 01:54:19.958	\N	\N	\N	\N	\N
lld_1763344459959_lz6ykg35f	LLD-PMC1-09	Robert	\N	King	pmc1-lld9@pmc.local	555-1009	\N	\N	\N	\N	\N	\N	\N	CA	ON	America/Toronto	2025-11-17 01:54:19.96	2025-11-17 01:54:19.959	default	\N	APPROVED	\N	2025-11-17 01:54:19.959	\N	\N	\N	\N	\N
lld_1763344459960_6wlqekzar	LLD-PMC1-10	Susan	\N	Martin	pmc1-lld10@pmc.local	555-1010	\N	\N	\N	\N	\N	\N	\N	CA	ON	America/Toronto	2025-11-17 01:54:19.961	2025-11-17 01:54:19.96	default	\N	APPROVED	\N	2025-11-17 01:54:19.96	\N	\N	\N	\N	\N
\.


--
-- Data for Name: LandlordServiceProvider; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LandlordServiceProvider" (id, "landlordId", "providerId", "addedAt", "addedBy", notes) FROM stdin;
\.


--
-- Data for Name: LateFee; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LateFee" (id, "rentPaymentId", "ruleId", "feeAmount", "feeType", "calculatedAt", "appliedAt", "isPaid", "paidAt", "paidAmount", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: LateFeeRule; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LateFeeRule" (id, "landlordId", "pmcId", name, "isActive", "feeType", "feeAmount", "feePercent", "dailyRate", "gracePeriodDays", "maxFeeAmount", "applyToPartialPayments", "compoundDaily", "autoApply", "autoApplyAfter", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Lease; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Lease" (id, "unitId", "leaseStart", "leaseEnd", "rentAmount", "rentDueDay", "securityDeposit", "paymentMethod", status, "createdAt", "updatedAt", "renewalReminderSent", "renewalReminderSentAt", "renewalDecision", "renewalDecisionAt", "renewalDecisionBy") FROM stdin;
mi6qhv249aebd5cb4c3bf067	unit_1763346638591_2cf4971d4f63d9f0	2025-07-31 19:31:33.901	2026-07-31 19:31:33.901	1096	1	1096	\N	Active	2025-11-20 01:09:52.636	2025-11-20 01:09:52.636	f	\N	\N	\N	\N
mi6qi1xa7024934c0ee685f3	unit_1763346638591_2cf4971d4f63d9f0	2025-02-03 14:48:43.887	2026-02-03 14:48:43.887	1711	1	1711	\N	Active	2025-11-20 01:10:01.534	2025-11-20 01:10:01.534	f	\N	\N	\N	\N
mi6qi1xjf71860d383b2bca6	unit_1763346638596_ba5b342fc132073e	2025-09-08 15:33:58.467	2026-09-08 15:33:58.467	2784	1	2784	\N	Active	2025-11-20 01:10:01.543	2025-11-20 01:10:01.543	f	\N	\N	\N	\N
mi6qi1xn453c345741d58469	unit_1763346638599_eeac82a5b208fad6	2025-06-16 13:44:47.569	2026-06-16 13:44:47.569	2402	1	2402	\N	Active	2025-11-20 01:10:01.547	2025-11-20 01:10:01.547	f	\N	\N	\N	\N
mi6qi1xq47e669d695d635e9	unit_1763346638601_f231c81e01bed6b0	2024-09-03 20:55:20.314	2025-09-03 20:55:20.314	1538	1	1538	\N	Active	2025-11-20 01:10:01.55	2025-11-20 01:10:01.55	f	\N	\N	\N	\N
mi6qi1xsd1f9dd32c6b46abe	unit_1763346638603_673847096864fd6b	2025-08-26 13:11:26.614	2026-08-26 13:11:26.614	1553	1	1553	\N	Active	2025-11-20 01:10:01.552	2025-11-20 01:10:01.552	f	\N	\N	\N	\N
mi6qi1xv70be0a4ed706e025	unit_1763346638605_abd181ef8e4c2589	2025-05-23 19:11:28.863	2026-05-23 19:11:28.863	1967	1	1967	\N	Active	2025-11-20 01:10:01.555	2025-11-20 01:10:01.555	f	\N	\N	\N	\N
mi6qi1xz63b16613bfc31964	unit_1763346638609_76b2a34eca029fea	2025-03-11 08:31:18.872	2026-03-11 08:31:18.872	1305	1	1305	\N	Active	2025-11-20 01:10:01.559	2025-11-20 01:10:01.559	f	\N	\N	\N	\N
mi6qi1y1cd8dedaa340285a9	unit_1763346638609_79856da3b408cae3	2024-05-10 05:11:51.013	2025-05-10 05:11:51.013	2324	1	2324	\N	Active	2025-11-20 01:10:01.561	2025-11-20 01:10:01.561	f	\N	\N	\N	\N
mi6qi1y47035597ca0b24b06	unit_1763346638609_67ca536cd6a57010	2025-01-25 21:51:42.431	2026-01-25 21:51:42.431	1729	1	1729	\N	Active	2025-11-20 01:10:01.564	2025-11-20 01:10:01.564	f	\N	\N	\N	\N
mi6qi1y78f1b87f3e779158a	unit_1763346638611_d00b2b7a4e6062ab	2024-04-01 23:53:33.351	2025-04-01 23:53:33.351	2265	1	2265	\N	Active	2025-11-20 01:10:01.567	2025-11-20 01:10:01.567	f	\N	\N	\N	\N
mi6qi1y988e1e83886876b7d	unit_1763346638613_2d55f95e0cfd8081	2025-10-18 10:24:50.105	2026-10-18 10:24:50.105	1185	1	1185	\N	Active	2025-11-20 01:10:01.569	2025-11-20 01:10:01.569	f	\N	\N	\N	\N
mi6qi1yd16eb65ea11f25edf	unit_1763346638615_442a5412a9cfb5a0	2025-09-24 15:20:57.753	2026-09-24 15:20:57.753	1903	1	1903	\N	Active	2025-11-20 01:10:01.573	2025-11-20 01:10:01.573	f	\N	\N	\N	\N
mi6qi1yi7b700eb4b020764d	unit_1763346638616_af26422cef543c83	2024-04-17 18:12:36.144	2025-04-17 18:12:36.144	1116	1	1116	\N	Active	2025-11-20 01:10:01.578	2025-11-20 01:10:01.578	f	\N	\N	\N	\N
mi6qi1ymbbd35db50e9eb167	unit_1763346638618_85770d582c4ea7d2	2024-03-19 04:22:57.153	2025-03-19 04:22:57.153	1269	1	1269	\N	Active	2025-11-20 01:10:01.582	2025-11-20 01:10:01.582	f	\N	\N	\N	\N
mi6qi1yt4812603db7e5b6c1	unit_1763346638619_7ffce11abb2f4d63	2024-09-05 18:05:25.81	2025-09-05 18:05:25.81	1562	1	1562	\N	Active	2025-11-20 01:10:01.589	2025-11-20 01:10:01.589	f	\N	\N	\N	\N
mi6qi1yv530d8840052d8307	unit_1763346638621_5c3b90d84a6985d8	2025-08-05 08:59:07.002	2026-08-05 08:59:07.002	2969	1	2969	\N	Active	2025-11-20 01:10:01.591	2025-11-20 01:10:01.591	f	\N	\N	\N	\N
mi6qi1yyb86e0e8e99c348d3	unit_1763346638622_802ac55f844d7d01	2024-10-04 10:48:54.843	2025-10-04 10:48:54.843	1570	1	1570	\N	Active	2025-11-20 01:10:01.594	2025-11-20 01:10:01.594	f	\N	\N	\N	\N
mi6qi1z1dd5c686fcc51c857	unit_1763346638622_3a3abc20026396b5	2024-10-03 05:48:30.704	2025-10-03 05:48:30.704	2037	1	2037	\N	Active	2025-11-20 01:10:01.597	2025-11-20 01:10:01.597	f	\N	\N	\N	\N
mi6qi1z3c0c21f01881c589e	unit_1763346638624_e6b8f8dc22c74501	2025-05-02 12:43:50.611	2026-05-02 12:43:50.611	1350	1	1350	\N	Active	2025-11-20 01:10:01.599	2025-11-20 01:10:01.599	f	\N	\N	\N	\N
mi6qi1z5521b132eab227c94	unit_1763346638647_bb6dd56c0f3baf1c	2024-10-20 01:51:46.831	2025-10-20 01:51:46.831	2653	1	2653	\N	Active	2025-11-20 01:10:01.601	2025-11-20 01:10:01.601	f	\N	\N	\N	\N
mi6qi1z89dafbec3dd50f386	unit_1763346638650_dc1131c9a24641d2	2024-12-17 14:30:36.708	2025-12-17 14:30:36.708	1117	1	1117	\N	Active	2025-11-20 01:10:01.604	2025-11-20 01:10:01.604	f	\N	\N	\N	\N
mi6qi1zbddc17e6bdf46445e	unit_1763346638652_660fedde2e4cf47c	2024-01-30 14:02:53.904	2025-01-30 14:02:53.904	2150	1	2150	\N	Active	2025-11-20 01:10:01.607	2025-11-20 01:10:01.607	f	\N	\N	\N	\N
mi6qi1zc53e17f96f58ba83e	unit_1763346638653_0d7505c76f40e185	2025-04-11 01:57:51.492	2026-04-11 01:57:51.492	2916	1	2916	\N	Active	2025-11-20 01:10:01.608	2025-11-20 01:10:01.608	f	\N	\N	\N	\N
mi6qi1zg027c8ff16c62a95e	unit_1763346638657_ea32c8f2b106aef0	2025-05-04 23:00:50.97	2026-05-04 23:00:50.97	2722	1	2722	\N	Active	2025-11-20 01:10:01.612	2025-11-20 01:10:01.612	f	\N	\N	\N	\N
mi6qi1zie1c28b5a79ba929d	unit_1763346638658_30525eda1826b928	2024-12-30 20:49:20.284	2025-12-30 20:49:20.284	2904	1	2904	\N	Active	2025-11-20 01:10:01.614	2025-11-20 01:10:01.614	f	\N	\N	\N	\N
mi6qi1zk6be4b66f1854ef1d	unit_1763346638659_41c25dba6931707f	2025-09-10 05:58:40.05	2026-09-10 05:58:40.05	1312	1	1312	\N	Active	2025-11-20 01:10:01.616	2025-11-20 01:10:01.616	f	\N	\N	\N	\N
mi6qi1zmba64cb28f35cf669	unit_1763346638659_749819861beac56f	2025-08-20 01:40:39.202	2026-08-20 01:40:39.202	2460	1	2460	\N	Active	2025-11-20 01:10:01.618	2025-11-20 01:10:01.618	f	\N	\N	\N	\N
mi6qi1zqa21cfc4ee0a796c5	unit_1763346638661_eea7177ed8ee6501	2025-03-08 02:22:29.194	2026-03-08 02:22:29.194	2737	1	2737	\N	Active	2025-11-20 01:10:01.622	2025-11-20 01:10:01.622	f	\N	\N	\N	\N
mi6qi1zs070d7c0c3b556d44	unit_1763346638662_7151a14da1b79b30	2024-07-29 22:29:58.633	2025-07-29 22:29:58.633	2026	1	2026	\N	Active	2025-11-20 01:10:01.624	2025-11-20 01:10:01.624	f	\N	\N	\N	\N
mi6qi1zu8e168073190d9f0b	unit_1763346638663_29268f11dce5cc89	2025-01-31 10:38:39.713	2026-01-31 10:38:39.713	1133	1	1133	\N	Active	2025-11-20 01:10:01.626	2025-11-20 01:10:01.626	f	\N	\N	\N	\N
mi6qi1zxad9ac727dfe2b852	unit_1763346638663_783dd056e1e7cf60	2025-07-10 14:32:50.759	2026-07-10 14:32:50.759	1001	1	1001	\N	Active	2025-11-20 01:10:01.629	2025-11-20 01:10:01.629	f	\N	\N	\N	\N
mi6qi1zz6d0401f7748f7aa5	unit_1763346638663_ad009e6edff299cf	2024-03-11 05:10:30.495	2025-03-11 05:10:30.495	1793	1	1793	\N	Active	2025-11-20 01:10:01.631	2025-11-20 01:10:01.631	f	\N	\N	\N	\N
mi6qi20139a534c9f543cbeb	unit_1763346638665_26407209da330cf1	2024-09-11 12:46:36.367	2025-09-11 12:46:36.367	1417	1	1417	\N	Active	2025-11-20 01:10:01.633	2025-11-20 01:10:01.633	f	\N	\N	\N	\N
mi6qi2040c54321642394aff	unit_1763346638666_ba9c19af614e0245	2025-08-05 05:02:35.523	2026-08-05 05:02:35.523	2955	1	2955	\N	Active	2025-11-20 01:10:01.636	2025-11-20 01:10:01.636	f	\N	\N	\N	\N
mi6qi20607836e36f78e2747	unit_1763346638669_4761173105e5a6d7	2025-03-09 09:29:05.038	2026-03-09 09:29:05.038	2591	1	2591	\N	Active	2025-11-20 01:10:01.638	2025-11-20 01:10:01.638	f	\N	\N	\N	\N
mi6qi209b1d052b537cb459a	unit_1763346638671_830c0c7f2c87f16e	2025-01-26 19:07:38.031	2026-01-26 19:07:38.031	2294	1	2294	\N	Active	2025-11-20 01:10:01.641	2025-11-20 01:10:01.641	f	\N	\N	\N	\N
mi6qi20ca52449bde037dfbb	unit_1763346638673_2dd477ce7e8d85b4	2025-10-19 22:00:24.273	2026-10-19 22:00:24.273	1045	1	1045	\N	Active	2025-11-20 01:10:01.644	2025-11-20 01:10:01.644	f	\N	\N	\N	\N
mi6qi20e62dc4fd325823b54	unit_1763346638675_b9bad1e2015ea9d1	2024-03-25 05:47:07.891	2025-03-25 05:47:07.891	1574	1	1574	\N	Active	2025-11-20 01:10:01.646	2025-11-20 01:10:01.646	f	\N	\N	\N	\N
mi6qi20he6c4ae312043dafb	unit_1763346638676_eb0d2896bbbfaaa0	2025-05-19 14:39:28.83	2026-05-19 14:39:28.83	1526	1	1526	\N	Active	2025-11-20 01:10:01.649	2025-11-20 01:10:01.649	f	\N	\N	\N	\N
mi6qi20j96e036aa09304f3d	unit_1763346638677_238e6565e6e6c911	2025-03-07 16:31:36.038	2026-03-07 16:31:36.038	2888	1	2888	\N	Active	2025-11-20 01:10:01.651	2025-11-20 01:10:01.651	f	\N	\N	\N	\N
mi6qi20mda929070fe4e6aca	unit_1763346638679_05255aa1bc499203	2024-08-15 12:52:27.065	2025-08-15 12:52:27.065	1934	1	1934	\N	Active	2025-11-20 01:10:01.654	2025-11-20 01:10:01.654	f	\N	\N	\N	\N
mi6qi20od513787f8928895c	unit_1763346638680_95ba6b5f7f557405	2024-08-20 14:25:43.786	2025-08-20 14:25:43.786	1173	1	1173	\N	Active	2025-11-20 01:10:01.656	2025-11-20 01:10:01.656	f	\N	\N	\N	\N
mi6qi20r993981e439df65a0	unit_1763346638682_9050f4224abcb9bc	2024-07-08 12:18:40.994	2025-07-08 12:18:40.994	2886	1	2886	\N	Active	2025-11-20 01:10:01.659	2025-11-20 01:10:01.659	f	\N	\N	\N	\N
mi6qi20ta1bbef09e3a747e2	unit_1763346638683_c292a76e9aacbdf6	2025-03-04 20:32:12.531	2026-03-04 20:32:12.531	1344	1	1344	\N	Active	2025-11-20 01:10:01.661	2025-11-20 01:10:01.661	f	\N	\N	\N	\N
mi6qi20w34ed66c8cf64f74d	unit_1763346638684_0599c5ad29c661cc	2025-05-26 22:53:26.401	2026-05-26 22:53:26.401	1680	1	1680	\N	Active	2025-11-20 01:10:01.664	2025-11-20 01:10:01.664	f	\N	\N	\N	\N
mi6qi20yfa70a59e677625f6	unit_1763346638685_425bfdb0789b39f0	2024-06-23 13:06:45.069	2025-06-23 13:06:45.069	1668	1	1668	\N	Active	2025-11-20 01:10:01.666	2025-11-20 01:10:01.666	f	\N	\N	\N	\N
mi6qi2117b5116b802fd54e0	unit_1763346638688_2bed5a6f9befdc20	2025-08-09 12:35:46.864	2026-08-09 12:35:46.864	2680	1	2680	\N	Active	2025-11-20 01:10:01.669	2025-11-20 01:10:01.669	f	\N	\N	\N	\N
mi6qi2143388c3c9dacc289e	unit_1763346638690_547261b4e9194e0f	2025-03-01 22:56:57.006	2026-03-01 22:56:57.006	1464	1	1464	\N	Active	2025-11-20 01:10:01.672	2025-11-20 01:10:01.672	f	\N	\N	\N	\N
mi6qi21699781472e908b9f2	unit_1763346638690_4e9c016c0fb5a979	2024-08-07 10:09:30.742	2025-08-07 10:09:30.742	1388	1	1388	\N	Active	2025-11-20 01:10:01.674	2025-11-20 01:10:01.674	f	\N	\N	\N	\N
mi6qi2194375a2bbc538024e	unit_1763346638691_8a893dbc79ed0d5e	2025-03-13 22:14:15.395	2026-03-13 22:14:15.395	2780	1	2780	\N	Active	2025-11-20 01:10:01.677	2025-11-20 01:10:01.677	f	\N	\N	\N	\N
mi6qi21b901a778bf1a82365	unit_1763346638693_60226a6c9b73b9bb	2024-04-06 17:44:25.481	2025-04-06 17:44:25.481	1076	1	1076	\N	Active	2025-11-20 01:10:01.679	2025-11-20 01:10:01.679	f	\N	\N	\N	\N
mi6qi21e5af91cfe5b29c008	unit_1763346638694_14cc117dfbcf4151	2024-11-29 08:50:15.143	2025-11-29 08:50:15.143	1475	1	1475	\N	Active	2025-11-20 01:10:01.682	2025-11-20 01:10:01.682	f	\N	\N	\N	\N
mi6qi2208fb1aff403f413cc	unit_1763346638695_be65b50de35f44d5	2025-03-12 17:34:08.963	2026-03-12 17:34:08.963	2750	1	2750	\N	Active	2025-11-20 01:10:01.704	2025-11-20 01:10:01.704	f	\N	\N	\N	\N
mi6qi2225dc5b85d7e5659e9	unit_1763346638695_8beeacce92e43caf	2024-01-02 01:20:49.697	2025-01-02 01:20:49.697	2463	1	2463	\N	Active	2025-11-20 01:10:01.706	2025-11-20 01:10:01.706	f	\N	\N	\N	\N
mi6qi2245e9f56464d73f440	unit_1763346638695_88f12b35d1de776d	2025-10-17 07:48:44.895	2026-10-17 07:48:44.895	2241	1	2241	\N	Active	2025-11-20 01:10:01.708	2025-11-20 01:10:01.708	f	\N	\N	\N	\N
mi6qi227690cb3fd8f5d5ec0	unit_1763346638697_e6941824bb2f9af4	2024-04-09 22:00:14.036	2025-04-09 22:00:14.036	1193	1	1193	\N	Active	2025-11-20 01:10:01.711	2025-11-20 01:10:01.711	f	\N	\N	\N	\N
mi6qi229b6bf7ff1b315ea27	unit_1763346638699_9d6cb2af8bb8994e	2024-05-11 14:26:25.929	2025-05-11 14:26:25.929	1924	1	1924	\N	Active	2025-11-20 01:10:01.713	2025-11-20 01:10:01.713	f	\N	\N	\N	\N
mi6qi22bbad00f25f0474842	unit_1763346638700_bfd2f1619c5f62cc	2024-01-29 09:06:12.514	2025-01-29 09:06:12.514	1584	1	1584	\N	Active	2025-11-20 01:10:01.715	2025-11-20 01:10:01.715	f	\N	\N	\N	\N
mi6qi22d0b808228aa917d11	unit_1763346638703_26349a00e3785055	2024-10-04 17:17:31.015	2025-10-04 17:17:31.015	2906	1	2906	\N	Active	2025-11-20 01:10:01.717	2025-11-20 01:10:01.717	f	\N	\N	\N	\N
mi6qi22fb4ada2a4d8aa2446	unit_1763346638704_94f3da4421c0e4f7	2025-03-21 12:25:47.661	2026-03-21 12:25:47.661	2551	1	2551	\N	Active	2025-11-20 01:10:01.719	2025-11-20 01:10:01.719	f	\N	\N	\N	\N
mi6qi22ic49ede7b018bfa43	unit_1763346638705_f8e7c5535eb1ada2	2024-01-17 01:57:05.482	2025-01-17 01:57:05.482	2980	1	2980	\N	Active	2025-11-20 01:10:01.722	2025-11-20 01:10:01.722	f	\N	\N	\N	\N
mi6qi22k9fcb1b9edcb5cc69	unit_1763346638707_7324a1af7553d93f	2025-07-30 00:07:08.033	2026-07-30 00:07:08.033	1185	1	1185	\N	Active	2025-11-20 01:10:01.724	2025-11-20 01:10:01.724	f	\N	\N	\N	\N
mi6qi22md6f9e6f44b464b77	unit_1763346638709_b412d031e748f4ad	2025-06-27 14:30:09.083	2026-06-27 14:30:09.083	2567	1	2567	\N	Active	2025-11-20 01:10:01.726	2025-11-20 01:10:01.726	f	\N	\N	\N	\N
mi6qi22p4b193ebb3b3908d3	unit_1763346638709_fa6096bb567f031d	2025-07-01 18:30:22.156	2026-07-01 18:30:22.156	1755	1	1755	\N	Active	2025-11-20 01:10:01.729	2025-11-20 01:10:01.729	f	\N	\N	\N	\N
mi6qi22r7d04ef06b4777980	unit_1763346638709_615c9d2f93c787a7	2025-06-09 11:18:49.977	2026-06-09 11:18:49.977	1281	1	1281	\N	Active	2025-11-20 01:10:01.731	2025-11-20 01:10:01.731	f	\N	\N	\N	\N
mi6qi22t65c244c2d1f8ca5f	unit_1763346638709_713dc582a3e021be	2025-08-31 20:27:31.6	2026-08-31 20:27:31.6	2139	1	2139	\N	Active	2025-11-20 01:10:01.733	2025-11-20 01:10:01.733	f	\N	\N	\N	\N
mi6qi22v647b7c8038efa1c1	unit_1763346638711_d02c5a0cc36397b7	2025-06-12 16:43:38.54	2026-06-12 16:43:38.54	1866	1	1866	\N	Active	2025-11-20 01:10:01.735	2025-11-20 01:10:01.735	f	\N	\N	\N	\N
mi6qi22xfe71fc9aa7d20479	unit_1763346638713_ee7554748d68ded7	2025-02-11 19:05:28.749	2026-02-11 19:05:28.749	1633	1	1633	\N	Active	2025-11-20 01:10:01.737	2025-11-20 01:10:01.737	f	\N	\N	\N	\N
mi6qi22z4e5e8606be9a416f	unit_1763346638715_f6b039dae9e88127	2024-02-25 08:46:45.671	2025-02-25 08:46:45.671	1380	1	1380	\N	Active	2025-11-20 01:10:01.739	2025-11-20 01:10:01.739	f	\N	\N	\N	\N
mi6qi231597c10e36c42c440	unit_1763346638717_0d633559d4b4bbb6	2024-08-14 08:05:53.4	2025-08-14 08:05:53.4	1774	1	1774	\N	Active	2025-11-20 01:10:01.741	2025-11-20 01:10:01.741	f	\N	\N	\N	\N
mi6qi233471aa2b7066d5cb4	unit_1763346638716_c7ee53e682aaaeb6	2024-09-25 23:59:03.103	2025-09-25 23:59:03.103	1117	1	1117	\N	Active	2025-11-20 01:10:01.743	2025-11-20 01:10:01.743	f	\N	\N	\N	\N
mi6qi23558685ba2a9c0b263	unit_1763346638717_085d24654491a016	2025-07-20 05:50:36.815	2026-07-20 05:50:36.815	1431	1	1431	\N	Active	2025-11-20 01:10:01.745	2025-11-20 01:10:01.745	f	\N	\N	\N	\N
mi6qi238fa17df10c2cb520b	unit_1763346638720_bc2c74f99b4eaf44	2024-03-01 17:43:13.108	2025-03-01 17:43:13.108	1061	1	1061	\N	Active	2025-11-20 01:10:01.748	2025-11-20 01:10:01.748	f	\N	\N	\N	\N
\.


--
-- Data for Name: LeaseDocument; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LeaseDocument" (id, "leaseId", "fileName", "originalName", "fileType", "fileSize", description, "storagePath", "uploadedAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: LeaseTenant; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LeaseTenant" ("leaseId", "tenantId", "isPrimaryTenant", "addedAt") FROM stdin;
mi6qi1xa7024934c0ee685f3	mi6qi1x5b78bfb0ebe763bf6	t	2025-11-20 01:10:01.535
mi6qi1xa7024934c0ee685f3	mi6qi1x93a2cd73a1c920a7a	f	2025-11-20 01:10:01.54
mi6qi1xjf71860d383b2bca6	mi6qi1xh40b9af431e5d84d1	t	2025-11-20 01:10:01.544
mi6qi1xjf71860d383b2bca6	mi6qi1xjd359fe7776f74dbe	f	2025-11-20 01:10:01.544
mi6qi1xn453c345741d58469	mi6qi1xl790e33a61c3802e7	t	2025-11-20 01:10:01.547
mi6qi1xn453c345741d58469	mi6qi1xm333bb0466365d310	f	2025-11-20 01:10:01.548
mi6qi1xq47e669d695d635e9	mi6qi1xob83df3fedb874af1	t	2025-11-20 01:10:01.55
mi6qi1xq47e669d695d635e9	mi6qi1xpd302804b263f02d9	f	2025-11-20 01:10:01.55
mi6qi1xsd1f9dd32c6b46abe	mi6qi1xr07e393bae5ac6f54	t	2025-11-20 01:10:01.552
mi6qi1xsd1f9dd32c6b46abe	mi6qi1xrfb069490879f8960	f	2025-11-20 01:10:01.553
mi6qi1xv70be0a4ed706e025	mi6qi1xtf7011353200c0c80	t	2025-11-20 01:10:01.555
mi6qi1xv70be0a4ed706e025	mi6qi1xuedd8787afbfac9f0	f	2025-11-20 01:10:01.556
mi6qi1xv70be0a4ed706e025	mi6qi1xu865f5acf9600f66e	f	2025-11-20 01:10:01.556
mi6qi1xz63b16613bfc31964	mi6qi1xxc3ea800479da2c10	t	2025-11-20 01:10:01.559
mi6qi1xz63b16613bfc31964	mi6qi1xy0a43b1d13b901366	f	2025-11-20 01:10:01.559
mi6qi1y1cd8dedaa340285a9	mi6qi1y0c033f6ead0d9fa43	t	2025-11-20 01:10:01.562
mi6qi1y1cd8dedaa340285a9	mi6qi1y1b8f80b7037892c40	f	2025-11-20 01:10:01.562
mi6qi1y47035597ca0b24b06	mi6qi1y39c1eb988a1e5e5e4	t	2025-11-20 01:10:01.565
mi6qi1y47035597ca0b24b06	mi6qi1y4a49413b9b22f2472	f	2025-11-20 01:10:01.565
mi6qi1y78f1b87f3e779158a	mi6qi1y529f7b0124c85e840	t	2025-11-20 01:10:01.567
mi6qi1y78f1b87f3e779158a	mi6qi1y60e481aac0c0af932	f	2025-11-20 01:10:01.568
mi6qi1y988e1e83886876b7d	mi6qi1y8208a0b3c2f6bffe8	t	2025-11-20 01:10:01.569
mi6qi1y988e1e83886876b7d	mi6qi1y9ad32e984eebc5106	f	2025-11-20 01:10:01.57
mi6qi1yd16eb65ea11f25edf	mi6qi1ya154f8ac0e984b9f7	t	2025-11-20 01:10:01.574
mi6qi1yd16eb65ea11f25edf	mi6qi1yc8c0547b8fd85eccf	f	2025-11-20 01:10:01.574
mi6qi1yd16eb65ea11f25edf	mi6qi1yd59d30d39e065628b	f	2025-11-20 01:10:01.575
mi6qi1yi7b700eb4b020764d	mi6qi1yg551a328e88247f24	t	2025-11-20 01:10:01.579
mi6qi1yi7b700eb4b020764d	mi6qi1yhfdd43314199d5b81	f	2025-11-20 01:10:01.579
mi6qi1ymbbd35db50e9eb167	mi6qi1yk9437251716bdf525	t	2025-11-20 01:10:01.583
mi6qi1ymbbd35db50e9eb167	mi6qi1ylfa11e94f1fc69c48	f	2025-11-20 01:10:01.586
mi6qi1yt4812603db7e5b6c1	mi6qi1yqaae714e966b0ef58	t	2025-11-20 01:10:01.59
mi6qi1yt4812603db7e5b6c1	mi6qi1yta070c408648be6a5	f	2025-11-20 01:10:01.59
mi6qi1yv530d8840052d8307	mi6qi1yu950420c3e992ac9d	t	2025-11-20 01:10:01.591
mi6qi1yv530d8840052d8307	mi6qi1yv0c6a636b466b6dfd	f	2025-11-20 01:10:01.592
mi6qi1yyb86e0e8e99c348d3	mi6qi1yw0fdd12783cf20656	t	2025-11-20 01:10:01.594
mi6qi1yyb86e0e8e99c348d3	mi6qi1yxb0ed522bdc1b368e	f	2025-11-20 01:10:01.595
mi6qi1yyb86e0e8e99c348d3	mi6qi1yxc35716007dae9084	f	2025-11-20 01:10:01.595
mi6qi1z1dd5c686fcc51c857	mi6qi1z0591b9e7e42c21672	t	2025-11-20 01:10:01.597
mi6qi1z1dd5c686fcc51c857	mi6qi1z0a225165d77160f67	f	2025-11-20 01:10:01.597
mi6qi1z3c0c21f01881c589e	mi6qi1z2c93560a099f67323	t	2025-11-20 01:10:01.599
mi6qi1z3c0c21f01881c589e	mi6qi1z2cd933535cac16648	f	2025-11-20 01:10:01.6
mi6qi1z5521b132eab227c94	mi6qi1z48e2521561c6b5144	t	2025-11-20 01:10:01.602
mi6qi1z5521b132eab227c94	mi6qi1z5f80a816a6d6fa90f	f	2025-11-20 01:10:01.602
mi6qi1z89dafbec3dd50f386	mi6qi1z72cb5fae8e75c3762	t	2025-11-20 01:10:01.605
mi6qi1z89dafbec3dd50f386	mi6qi1z848a11449b5dd58c6	f	2025-11-20 01:10:01.605
mi6qi1zbddc17e6bdf46445e	mi6qi1z9af7a4ba8b173bd06	t	2025-11-20 01:10:01.607
mi6qi1zbddc17e6bdf46445e	mi6qi1za94d2c7f2509a14ee	f	2025-11-20 01:10:01.607
mi6qi1zc53e17f96f58ba83e	mi6qi1zbe035cc949c60fa93	t	2025-11-20 01:10:01.609
mi6qi1zc53e17f96f58ba83e	mi6qi1zc2a4978b74c1e4761	f	2025-11-20 01:10:01.609
mi6qi1zg027c8ff16c62a95e	mi6qi1zd2edf68d04dab2f73	t	2025-11-20 01:10:01.612
mi6qi1zg027c8ff16c62a95e	mi6qi1ze4e31d5732965cc39	f	2025-11-20 01:10:01.612
mi6qi1zg027c8ff16c62a95e	mi6qi1zf2dda8cf7deada3d0	f	2025-11-20 01:10:01.613
mi6qi1zie1c28b5a79ba929d	mi6qi1zha703461ee31261cb	t	2025-11-20 01:10:01.615
mi6qi1zie1c28b5a79ba929d	mi6qi1zifc308756f33a91dd	f	2025-11-20 01:10:01.615
mi6qi1zk6be4b66f1854ef1d	mi6qi1zjbb54252b69bc7826	t	2025-11-20 01:10:01.617
mi6qi1zk6be4b66f1854ef1d	mi6qi1zk661f54ae3a40d3b8	f	2025-11-20 01:10:01.617
mi6qi1zmba64cb28f35cf669	mi6qi1zl0b5c4536dd690c1c	t	2025-11-20 01:10:01.619
mi6qi1zmba64cb28f35cf669	mi6qi1zm17c8a313002605b7	f	2025-11-20 01:10:01.62
mi6qi1zqa21cfc4ee0a796c5	mi6qi1zo616cdb4bebdb3a8c	t	2025-11-20 01:10:01.622
mi6qi1zqa21cfc4ee0a796c5	mi6qi1zp2ef363bc4cd6d499	f	2025-11-20 01:10:01.622
mi6qi1zs070d7c0c3b556d44	mi6qi1zr1d3ba147cd453dd1	t	2025-11-20 01:10:01.624
mi6qi1zs070d7c0c3b556d44	mi6qi1zrdb89ad8a9d65dcb8	f	2025-11-20 01:10:01.625
mi6qi1zu8e168073190d9f0b	mi6qi1ztc739d7790df42ff0	t	2025-11-20 01:10:01.626
mi6qi1zu8e168073190d9f0b	mi6qi1zu34ee3f1036173b53	f	2025-11-20 01:10:01.627
mi6qi1zxad9ac727dfe2b852	mi6qi1zvda64f0f0dea7987a	t	2025-11-20 01:10:01.629
mi6qi1zxad9ac727dfe2b852	mi6qi1zwf74fe5ebf4e79c81	f	2025-11-20 01:10:01.629
mi6qi1zz6d0401f7748f7aa5	mi6qi1zyc4c54f4397d069f7	t	2025-11-20 01:10:01.631
mi6qi1zz6d0401f7748f7aa5	mi6qi1zy10b328fa98de1d97	f	2025-11-20 01:10:01.631
mi6qi20139a534c9f543cbeb	mi6qi2000e681fc487d1d06f	t	2025-11-20 01:10:01.634
mi6qi20139a534c9f543cbeb	mi6qi200b9135e898a216f0a	f	2025-11-20 01:10:01.634
mi6qi20139a534c9f543cbeb	mi6qi20132a72337f37c4ed5	f	2025-11-20 01:10:01.634
mi6qi2040c54321642394aff	mi6qi203197ef653037dc43e	t	2025-11-20 01:10:01.636
mi6qi2040c54321642394aff	mi6qi203aabf3ef8dfb10f8a	f	2025-11-20 01:10:01.636
mi6qi20607836e36f78e2747	mi6qi20538d284d448507bb8	t	2025-11-20 01:10:01.639
mi6qi20607836e36f78e2747	mi6qi205cc3dacd0f16c6c58	f	2025-11-20 01:10:01.639
mi6qi20607836e36f78e2747	mi6qi206cb6929175dbb4c50	f	2025-11-20 01:10:01.639
mi6qi209b1d052b537cb459a	mi6qi207c285a66169a5d608	t	2025-11-20 01:10:01.641
mi6qi209b1d052b537cb459a	mi6qi2080f6cf7e4f7e5fcb2	f	2025-11-20 01:10:01.642
mi6qi20ca52449bde037dfbb	mi6qi20af77c923b3e5e59fb	t	2025-11-20 01:10:01.644
mi6qi20ca52449bde037dfbb	mi6qi20af5fccab774bd2537	f	2025-11-20 01:10:01.644
mi6qi20ca52449bde037dfbb	mi6qi20b4d0493a1f7eafbed	f	2025-11-20 01:10:01.645
mi6qi20e62dc4fd325823b54	mi6qi20dee81612e7065cf2b	t	2025-11-20 01:10:01.647
mi6qi20e62dc4fd325823b54	mi6qi20eb04ff0c9810dfb14	f	2025-11-20 01:10:01.647
mi6qi20he6c4ae312043dafb	mi6qi20f3e8e1120034417c6	t	2025-11-20 01:10:01.649
mi6qi20he6c4ae312043dafb	mi6qi20g02feeb55d33b8a8d	f	2025-11-20 01:10:01.649
mi6qi20j96e036aa09304f3d	mi6qi20hb0a36f7769673ce6	t	2025-11-20 01:10:01.651
mi6qi20j96e036aa09304f3d	mi6qi20if95e6d3833995403	f	2025-11-20 01:10:01.651
mi6qi20mda929070fe4e6aca	mi6qi20k39704cceb0d324fa	t	2025-11-20 01:10:01.654
mi6qi20mda929070fe4e6aca	mi6qi20l6461d6ab8ed9315a	f	2025-11-20 01:10:01.654
mi6qi20od513787f8928895c	mi6qi20n4a309f15c0f41d3e	t	2025-11-20 01:10:01.657
mi6qi20od513787f8928895c	mi6qi20o5e0ac269e18e7a96	f	2025-11-20 01:10:01.657
mi6qi20r993981e439df65a0	mi6qi20pca10167ce28ae6df	t	2025-11-20 01:10:01.659
mi6qi20r993981e439df65a0	mi6qi20q5304abaeb50e5cf6	f	2025-11-20 01:10:01.659
mi6qi20ta1bbef09e3a747e2	mi6qi20sebbb9a45b4380420	t	2025-11-20 01:10:01.661
mi6qi20ta1bbef09e3a747e2	mi6qi20sd333ffe8353fc193	f	2025-11-20 01:10:01.661
mi6qi20w34ed66c8cf64f74d	mi6qi20v11a3a61f1905a351	t	2025-11-20 01:10:01.664
mi6qi20w34ed66c8cf64f74d	mi6qi20vc88bdc64057b14a4	f	2025-11-20 01:10:01.665
mi6qi20yfa70a59e677625f6	mi6qi20xeb653d0cc0e108a6	t	2025-11-20 01:10:01.667
mi6qi20yfa70a59e677625f6	mi6qi20x5d54f346ab5537c2	f	2025-11-20 01:10:01.667
mi6qi2117b5116b802fd54e0	mi6qi20zba38b1b99d84e557	t	2025-11-20 01:10:01.67
mi6qi2117b5116b802fd54e0	mi6qi2106a7b5f24ce32af71	f	2025-11-20 01:10:01.67
mi6qi2117b5116b802fd54e0	mi6qi210baaf1e3ab8644c71	f	2025-11-20 01:10:01.67
mi6qi2143388c3c9dacc289e	mi6qi213ec5302a89fc93290	t	2025-11-20 01:10:01.672
mi6qi2143388c3c9dacc289e	mi6qi213554c023331510204	f	2025-11-20 01:10:01.672
mi6qi21699781472e908b9f2	mi6qi2157306431726e2c41f	t	2025-11-20 01:10:01.674
mi6qi21699781472e908b9f2	mi6qi215fb4b10002f5a2715	f	2025-11-20 01:10:01.675
mi6qi2194375a2bbc538024e	mi6qi2172ba1e58f8c3a1491	t	2025-11-20 01:10:01.678
mi6qi2194375a2bbc538024e	mi6qi218f62e3f75e6776818	f	2025-11-20 01:10:01.678
mi6qi21b901a778bf1a82365	mi6qi21a998371106b26d1d7	t	2025-11-20 01:10:01.68
mi6qi21b901a778bf1a82365	mi6qi21b759c32961d5aa970	f	2025-11-20 01:10:01.68
mi6qi21e5af91cfe5b29c008	mi6qi21d67f225b30d16b11f	t	2025-11-20 01:10:01.701
mi6qi21e5af91cfe5b29c008	mi6qi21db3c3135f372736ac	f	2025-11-20 01:10:01.702
mi6qi21e5af91cfe5b29c008	mi6qi21e8dae6f9fe4f2e4e8	f	2025-11-20 01:10:01.702
mi6qi2208fb1aff403f413cc	mi6qi21ze68e5e00a246dc75	t	2025-11-20 01:10:01.704
mi6qi2208fb1aff403f413cc	mi6qi220540711fd5a2952b9	f	2025-11-20 01:10:01.705
mi6qi2225dc5b85d7e5659e9	mi6qi221d7858a66cd8e9029	t	2025-11-20 01:10:01.706
mi6qi2225dc5b85d7e5659e9	mi6qi2210d7c3dc4ea6857c7	f	2025-11-20 01:10:01.706
mi6qi2245e9f56464d73f440	mi6qi223d7b7f4436f896abc	t	2025-11-20 01:10:01.709
mi6qi2245e9f56464d73f440	mi6qi223a474ddf722fbe340	f	2025-11-20 01:10:01.709
mi6qi2245e9f56464d73f440	mi6qi22411e6dcaad6c48283	f	2025-11-20 01:10:01.709
mi6qi227690cb3fd8f5d5ec0	mi6qi226262ac6895a500b95	t	2025-11-20 01:10:01.712
mi6qi227690cb3fd8f5d5ec0	mi6qi226925902509e621a75	f	2025-11-20 01:10:01.712
mi6qi227690cb3fd8f5d5ec0	mi6qi227fcbbe29323fe735c	f	2025-11-20 01:10:01.712
mi6qi229b6bf7ff1b315ea27	mi6qi228bfc894b9354acdfc	t	2025-11-20 01:10:01.714
mi6qi229b6bf7ff1b315ea27	mi6qi2292821f5b5ca2d6aab	f	2025-11-20 01:10:01.714
mi6qi22bbad00f25f0474842	mi6qi22a919feebaa44b3529	t	2025-11-20 01:10:01.715
mi6qi22bbad00f25f0474842	mi6qi22be4d04bc2aa8314c2	f	2025-11-20 01:10:01.716
mi6qi22d0b808228aa917d11	mi6qi22c8912a8c446030041	t	2025-11-20 01:10:01.718
mi6qi22d0b808228aa917d11	mi6qi22d62d544389f37ee41	f	2025-11-20 01:10:01.718
mi6qi22fb4ada2a4d8aa2446	mi6qi22e64db5dc934e349d4	t	2025-11-20 01:10:01.72
mi6qi22fb4ada2a4d8aa2446	mi6qi22f192ec5d0d4cfcb03	f	2025-11-20 01:10:01.72
mi6qi22ic49ede7b018bfa43	mi6qi22h1c147348c1a37d4f	t	2025-11-20 01:10:01.722
mi6qi22ic49ede7b018bfa43	mi6qi22ha62db475d7c008da	f	2025-11-20 01:10:01.722
mi6qi22k9fcb1b9edcb5cc69	mi6qi22j5edb7282c13e4e82	t	2025-11-20 01:10:01.724
mi6qi22k9fcb1b9edcb5cc69	mi6qi22j2fcd7c2ae51b7505	f	2025-11-20 01:10:01.725
mi6qi22md6f9e6f44b464b77	mi6qi22l059b0a2d5a262c0d	t	2025-11-20 01:10:01.727
mi6qi22md6f9e6f44b464b77	mi6qi22l8119b8a976580a87	f	2025-11-20 01:10:01.727
mi6qi22md6f9e6f44b464b77	mi6qi22m1dbc20f22efa447f	f	2025-11-20 01:10:01.727
mi6qi22p4b193ebb3b3908d3	mi6qi22o2241cb39e5d24bc6	t	2025-11-20 01:10:01.729
mi6qi22p4b193ebb3b3908d3	mi6qi22oec3bfbdcb965956a	f	2025-11-20 01:10:01.729
mi6qi22r7d04ef06b4777980	mi6qi22qbe9e48148fdb25c5	t	2025-11-20 01:10:01.731
mi6qi22r7d04ef06b4777980	mi6qi22qe4fc49e757d40d91	f	2025-11-20 01:10:01.731
mi6qi22t65c244c2d1f8ca5f	mi6qi22s9732d7359a5f7575	t	2025-11-20 01:10:01.733
mi6qi22t65c244c2d1f8ca5f	mi6qi22tb29daba3a87c833c	f	2025-11-20 01:10:01.734
mi6qi22v647b7c8038efa1c1	mi6qi22uf0486087cb319fca	t	2025-11-20 01:10:01.735
mi6qi22v647b7c8038efa1c1	mi6qi22ua2256f627a61f958	f	2025-11-20 01:10:01.736
mi6qi22xfe71fc9aa7d20479	mi6qi22w18f832970db6c7f2	t	2025-11-20 01:10:01.737
mi6qi22xfe71fc9aa7d20479	mi6qi22wa6bf27365366375b	f	2025-11-20 01:10:01.738
mi6qi22z4e5e8606be9a416f	mi6qi22ye9acf03e139c1380	t	2025-11-20 01:10:01.74
mi6qi22z4e5e8606be9a416f	mi6qi22yc9cd929f98b64757	f	2025-11-20 01:10:01.74
mi6qi231597c10e36c42c440	mi6qi2301871a2977367ff86	t	2025-11-20 01:10:01.741
mi6qi231597c10e36c42c440	mi6qi231de737ef8767020a7	f	2025-11-20 01:10:01.742
mi6qi233471aa2b7066d5cb4	mi6qi2321052b5718548c074	t	2025-11-20 01:10:01.743
mi6qi233471aa2b7066d5cb4	mi6qi2332d3ba244a0244202	f	2025-11-20 01:10:01.744
mi6qi23558685ba2a9c0b263	mi6qi234fec89b78dc395def	t	2025-11-20 01:10:01.746
mi6qi23558685ba2a9c0b263	mi6qi235632fa6e27ad33dc3	f	2025-11-20 01:10:01.746
mi6qi238fa17df10c2cb520b	mi6qi23723c761d27fb032ab	t	2025-11-20 01:10:01.748
mi6qi238fa17df10c2cb520b	mi6qi23784c64e7b4653f6df	f	2025-11-20 01:10:01.749
\.


--
-- Data for Name: Listing; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Listing" (id, "propertyId", "unitId", title, description, photos, pricing, availability, status, "createdBy", "createdByType", "createdByEmail", "createdByName", "isSyndicated", "syndicatedTo", "syndicationStatus", "lastEditedAt", "lastEditedBy", metadata, "publishedAt", "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: MaintenanceComment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MaintenanceComment" (id, "maintenanceRequestId", "authorEmail", "authorName", "authorRole", comment, "isStatusUpdate", "oldStatus", "newStatus", "createdAt") FROM stdin;
\.


--
-- Data for Name: MaintenanceRequest; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MaintenanceRequest" (id, "propertyId", "tenantId", title, description, category, priority, status, "requestedDate", "completedDate", "tenantApproved", "landlordApproved", "createdAt", "updatedAt", "ticketNumber", "initiatedBy", "lastViewedByLandlord", "lastViewedByTenant", "actualCost", "afterPhotos", "assignedToVendorId", "assignedToProviderId", "beforePhotos", "completionNotes", "estimatedCost", photos, rating, "scheduledDate", "tenantFeedback", "createdByPMC", "pmcId", "pmcApprovalRequestId") FROM stdin;
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Message" (id, "conversationId", "senderId", "senderLandlordId", "senderTenantId", "senderPMCId", "senderRole", "messageText", attachments, "readByLandlord", "readByTenant", "readByPMC", "readAt", "isRead", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: MessageAttachment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MessageAttachment" (id, "messageId", "fileName", "originalName", "fileType", "fileSize", "storagePath", "mimeType", "uploadedAt") FROM stdin;
\.


--
-- Data for Name: MessageNotification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MessageNotification" (id, "userId", "messageId", "isRead", "readAt") FROM stdin;
\.


--
-- Data for Name: Organization; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Organization" (id, name, subdomain, plan, status, "subscriptionId", "subscriptionStatus", "currentPeriodStart", "currentPeriodEnd", "cancelAtPeriodEnd", "maxProperties", "maxTenants", "maxUsers", "maxStorageGB", "maxApiCallsPerMonth", "billingEmail", "billingAddress", "billingCity", "billingState", "billingPostalCode", "billingCountry", "createdAt", "updatedAt", "trialEndsAt") FROM stdin;
\.


--
-- Data for Name: OrganizationSettings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."OrganizationSettings" (id, "organizationId", "logoUrl", "primaryColor", "secondaryColor", "companyName", features, integrations, "emailNotifications", "smsNotifications", "customDomain", "customCss", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: OwnerPayout; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."OwnerPayout" (id, "payoutDate", "payoutPeriodStart", "payoutPeriodEnd", "landlordId", "propertyId", "pmcId", "totalRent", "totalExpenses", commission, "netAmount", "paymentTerms", "dueDate", status, "approvedAt", "approvedBy", "approvedByType", "approvedByEmail", "approvedByName", "paidAt", "paidBy", "paidByType", "paidByEmail", "paidByName", "paymentMethod", "paymentReference", "approvalRequestId", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: OwnerStatement; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."OwnerStatement" (id, "statementDate", "statementPeriodStart", "statementPeriodEnd", "statementType", "landlordId", "propertyId", "totalIncome", "totalExpenses", "netProfit", commission, "incomeBreakdown", "expenseBreakdown", "templateId", "customFields", status, "generatedBy", "generatedByType", "generatedByEmail", "generatedByName", "generatedAt", "sentAt", "viewedAt", "pdfPath", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PMCLandlord; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PMCLandlord" (id, "pmcId", "landlordId", status, "startedAt", "endedAt", "contractTerms", notes) FROM stdin;
cmi2hrh5y0001nbvrlvrmpzlg	cmi2dt32o0000nbsps6g9p2tl	lld_1763344459933_42r6792tu	active	2025-11-17 01:54:19.942	\N	{"managementFee": 0.1, "commissionRate": 0.08}	Landlord 1 of 10 for AB Homes PMC
cmi2hrh630003nbvrpxcd5zg1	cmi2dt32o0000nbsps6g9p2tl	lld_1763344459945_nr6ussfrj	active	2025-11-17 01:54:19.947	\N	{"managementFee": 0.1, "commissionRate": 0.08}	Landlord 2 of 10 for AB Homes PMC
cmi2hrh650005nbvrz2hu6k9w	cmi2dt32o0000nbsps6g9p2tl	lld_1763344459948_8k66k9kb4	active	2025-11-17 01:54:19.949	\N	{"managementFee": 0.1, "commissionRate": 0.08}	Landlord 3 of 10 for AB Homes PMC
cmi2hrh670007nbvrb5id5njv	cmi2dt32o0000nbsps6g9p2tl	lld_1763344459950_2ud9maowk	active	2025-11-17 01:54:19.95	\N	{"managementFee": 0.1, "commissionRate": 0.08}	Landlord 4 of 10 for AB Homes PMC
cmi2hrh680009nbvrb9c8jvyd	cmi2dt32o0000nbsps6g9p2tl	lld_1763344459951_xaidopicm	active	2025-11-17 01:54:19.952	\N	{"managementFee": 0.1, "commissionRate": 0.08}	Landlord 5 of 10 for AB Homes PMC
cmi2hrh6b000bnbvr5jjy73gq	cmi2dt32o0000nbsps6g9p2tl	lld_1763344459953_9k0mhiks4	active	2025-11-17 01:54:19.954	\N	{"managementFee": 0.1, "commissionRate": 0.08}	Landlord 6 of 10 for AB Homes PMC
cmi2hrh6d000dnbvrtpeydb38	cmi2dt32o0000nbsps6g9p2tl	lld_1763344459956_x6v0haalr	active	2025-11-17 01:54:19.957	\N	{"managementFee": 0.1, "commissionRate": 0.08}	Landlord 7 of 10 for AB Homes PMC
cmi2hrh6e000fnbvr11o5oxae	cmi2dt32o0000nbsps6g9p2tl	lld_1763344459958_gztj01xmk	active	2025-11-17 01:54:19.958	\N	{"managementFee": 0.1, "commissionRate": 0.08}	Landlord 8 of 10 for AB Homes PMC
cmi2hrh6g000hnbvrknvbkmvq	cmi2dt32o0000nbsps6g9p2tl	lld_1763344459959_lz6ykg35f	active	2025-11-17 01:54:19.96	\N	{"managementFee": 0.1, "commissionRate": 0.08}	Landlord 9 of 10 for AB Homes PMC
cmi2hrh6h000jnbvrfvagvjkr	cmi2dt32o0000nbsps6g9p2tl	lld_1763344459960_6wlqekzar	active	2025-11-17 01:54:19.961	\N	{"managementFee": 0.1, "commissionRate": 0.08}	Landlord 10 of 10 for AB Homes PMC
\.


--
-- Data for Name: PMCLandlordApproval; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PMCLandlordApproval" (id, "pmcLandlordId", "approvalType", status, "entityType", "entityId", title, description, amount, "requestedBy", "requestedByEmail", "requestedByName", "requestedAt", "approvedBy", "approvedByEmail", "approvedByName", "approvedAt", "approvalNotes", "rejectedBy", "rejectedByEmail", "rejectedByName", "rejectedAt", "rejectionReason", "cancelledBy", "cancelledByEmail", "cancelledByName", "cancelledAt", "cancellationReason", metadata, attachments) FROM stdin;
\.


--
-- Data for Name: PartialPayment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PartialPayment" (id, "rentPaymentId", amount, "paidDate", "paymentMethod", "referenceNumber", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Property; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Property" (id, "propertyId", "landlordId", "organizationId", "propertyName", "addressLine1", "addressLine2", city, "provinceState", "postalZip", country, "countryCode", "regionCode", "propertyType", "unitCount", "yearBuilt", "purchasePrice", rent, rented, "createdAt", "updatedAt", "depositAmount", "interestRate", "mortgageAmount", "mortgageTermYears", "mortgageStartDate", "paymentFrequency", "squareFootage", "propertyDescription", "propertyTaxes", latitude, longitude) FROM stdin;
prop_1763346638516_3bff7470185555bfdb2033b001a707e2	PROP-LLD-PMC1-01-001	lld_1763344459933_42r6792tu	\N	Sunset Suites	5868 Oak Street	Unit 33	Kitchener	ON	M6K 6Y9	CA	CA	ON	Single Family	1	2001	278081	2762	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638594_024faa4cbbc447c732877992d807a30c	PROP-LLD-PMC1-01-002	lld_1763344459933_42r6792tu	\N	Garden Village	278 Pine Boulevard	\N	Oshawa	ON	J5B 7B0	CA	CA	ON	Single Family	1	1975	584548	2448	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638597_4eecda2a63246547e646164483a6c871	PROP-LLD-PMC1-01-003	lld_1763344459933_42r6792tu	\N	Hillside Gardens	1228 Front Avenue	\N	Mississauga	ON	P0S 4A0	CA	CA	ON	Single Family	1	1981	252709	1650	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638600_9bf231afa2634c19ced97be531b5e80c	PROP-LLD-PMC1-01-004	lld_1763344459933_42r6792tu	\N	Maple Villa	1155 Cedar Drive	\N	Sarnia	ON	S6H 3J4	CA	CA	ON	Single Family	1	2018	406564	3406	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638602_12a846f48534d3a1b9dd3840e9072b15	PROP-LLD-PMC1-01-005	lld_1763344459933_42r6792tu	\N	Valley Inn	8074 Front Street	\N	Brantford	ON	G1E 3B6	CA	CA	ON	Single Family	1	2024	235088	2461	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638604_15c53e1e69b27bd42f2e335ffaa90f95	PROP-LLD-PMC1-01-006	lld_1763344459933_42r6792tu	\N	Pine Homes	6173 First Drive	\N	Cornwall	ON	Z1S 5B1	CA	CA	ON	Single Family	1	2012	475483	2387	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638606_470e60e533ba9aba88f994d524064281	PROP-LLD-PMC1-01-007	lld_1763344459933_42r6792tu	\N	Court House	5432 Cedar Court	\N	Timmins	ON	D2W 4H7	CA	CA	ON	Multi-Unit	4	2018	336187	4807	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638610_e8fbc9ed2af1bbfb5c3e795dd46f6ce0	PROP-LLD-PMC1-01-008	lld_1763344459933_42r6792tu	\N	Meadow Cottages	1527 Queen Street	\N	Mississauga	ON	N1J 6F7	CA	CA	ON	Single Family	1	2012	433946	1524	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638611_49349ad94749f2dba066f4336c3c4c96	PROP-LLD-PMC1-01-009	lld_1763344459933_42r6792tu	\N	Riverside Suites	2664 Queen Court	Unit 18	Waterloo	ON	R3H 5E1	CA	CA	ON	Single Family	1	2004	370112	3452	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638613_e0668a6e8ddde74f8f5d62c98cb90693	PROP-LLD-PMC1-02-001	lld_1763344459945_nr6ussfrj	\N	Meadow Village	3556 Main Crescent	Unit 74	Orillia	ON	F8M 1Y0	CA	CA	ON	Single Family	1	2012	283919	2761	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638615_64d98852de6255980d798bc3ddcecbd4	PROP-LLD-PMC1-02-002	lld_1763344459945_nr6ussfrj	\N	Maple Complex	7672 Main Place	\N	St. Catharines	ON	T5T 9S7	CA	CA	ON	Single Family	1	2013	565490	1533	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638617_5ba114e0e12e4a04e6f0907a58f902b9	PROP-LLD-PMC1-02-003	lld_1763344459945_nr6ussfrj	\N	Riverside Cottages	7555 King Avenue	\N	Cornwall	ON	W7M 5H6	CA	CA	ON	Single Family	1	1986	427883	3391	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638618_36f83dd8779fbbf67a96d183a49783c8	PROP-LLD-PMC1-02-004	lld_1763344459945_nr6ussfrj	\N	Oak Homes	2722 Park Place	Unit 50	Orillia	ON	D9T 5L3	CA	CA	ON	Single Family	1	1980	491376	1756	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638620_cf06e77e03b2aa9aa18f1c208af316cc	PROP-LLD-PMC1-02-005	lld_1763344459945_nr6ussfrj	\N	Crest Suites	8897 Maple Street	\N	Barrie	ON	T2R 9T1	CA	CA	ON	Multi-Unit	4	1990	442544	2971	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638622_6e9857fee99a07678209cc384d3f9e94	PROP-LLD-PMC1-03-001	lld_1763344459948_8k66k9kb4	\N	Manor House	5855 Maple Lane	\N	Waterloo	ON	X1A 2H5	CA	CA	ON	Single Family	1	2022	282350	2544	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638624_e5482c2b674cc15b044bed252d3288a9	PROP-LLD-PMC1-03-002	lld_1763344459948_8k66k9kb4	\N	Court Villa	1213 Park Avenue	\N	Orillia	ON	B2C 3D4	CA	CA	ON	Single Family	1	2011	250425	3373	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638649_a7c4d775157bfc179c084c6a8c302a30	PROP-LLD-PMC1-03-003	lld_1763344459948_8k66k9kb4	\N	Ridge Homes	833 Oak Road	\N	Sarnia	ON	P8B 9T3	CA	CA	ON	Single Family	1	1983	409967	2817	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638651_6f0c42b030bbc4ea3e164a4dde74ba60	PROP-LLD-PMC1-03-004	lld_1763344459948_8k66k9kb4	\N	View Suites	875 Second Place	\N	St. Catharines	ON	K0L 1E0	CA	CA	ON	Single Family	1	1993	539657	3436	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638652_1019aa5c8352d24f60295c727b953f88	PROP-LLD-PMC1-03-005	lld_1763344459948_8k66k9kb4	\N	Ridge Residence	927 Church Lane	\N	Thunder Bay	ON	E0J 2R7	CA	CA	ON	Single Family	1	1996	546213	1783	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638654_fb61d508f503f4d40bd0b23254c01a49	PROP-LLD-PMC1-03-006	lld_1763344459948_8k66k9kb4	\N	Sunrise Complex	1221 Elm Court	\N	Sudbury	ON	S9S 5M7	CA	CA	ON	Single Family	1	2009	450275	2190	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638655_66757bdbc27060ec2112119376815d63	PROP-LLD-PMC1-03-007	lld_1763344459948_8k66k9kb4	\N	Court Villa	13 Church Place	Unit 53	Toronto	ON	S2F 3T3	CA	CA	ON	Single Family	1	1991	218941	1588	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638657_4ac2823ac1b40494c7f0a65a32513369	PROP-LLD-PMC1-03-008	lld_1763344459948_8k66k9kb4	\N	Sunrise Villa	3727 Bay Place	\N	Cornwall	ON	A8W 5Z4	CA	CA	ON	Multi-Unit	3	1981	455680	3846	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638659_afa6ec8250235b6e5e2c387fc584fe1b	PROP-LLD-PMC1-04-001	lld_1763344459950_2ud9maowk	\N	Valley Apartments	2079 Wellington Lane	\N	Thunder Bay	ON	R6G 2D3	CA	CA	ON	Single Family	1	1988	362928	1799	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638661_1a1ff26a9edc77564cb8c49d9b4881e1	PROP-LLD-PMC1-04-002	lld_1763344459950_2ud9maowk	\N	Manor Homes	9061 First Boulevard	\N	North Bay	ON	J9H 8A8	CA	CA	ON	Multi-Unit	4	1998	751636	3366	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638664_4868cc0c44f2394cdea9ac13d5f720c3	PROP-LLD-PMC1-04-003	lld_1763344459950_2ud9maowk	\N	Manor Place	1133 King Boulevard	Unit 64	Thunder Bay	ON	P0T 4J2	CA	CA	ON	Single Family	1	1981	476576	2791	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638665_9066c172217da32fa84534dc5884497b	PROP-LLD-PMC1-04-004	lld_1763344459950_2ud9maowk	\N	Valley Residence	9504 Second Drive	\N	Richmond Hill	ON	Z4J 9W6	CA	CA	ON	Single Family	1	1999	327873	2843	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638667_d93236c75dda2cbb6aa7c96b9219543e	PROP-LLD-PMC1-04-005	lld_1763344459950_2ud9maowk	\N	Riverside Apartments	1335 Third Lane	Unit 20	Waterloo	ON	K3A 4T6	CA	CA	ON	Single Family	1	2018	316509	1518	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638668_dc0a44a5fb7af3a673432c36d60bbdfe	PROP-LLD-PMC1-05-001	lld_1763344459951_xaidopicm	\N	Hillside Lodge	1781 Main Place	\N	St. Catharines	ON	W2Z 9E0	CA	CA	ON	Single Family	1	1996	252307	2923	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638670_ce24224648d1f56eaf777a0776b7c365	PROP-LLD-PMC1-05-002	lld_1763344459951_xaidopicm	\N	Garden Lodge	8338 Bay Lane	\N	Oshawa	ON	W0E 1K5	CA	CA	ON	Single Family	1	1990	569731	1639	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638671_143f9247d1367e2d541a85e9324f8af5	PROP-LLD-PMC1-05-003	lld_1763344459951_xaidopicm	\N	Oak Village	1525 College Lane	\N	Kingston	ON	Z8L 0L1	CA	CA	ON	Single Family	1	2003	376478	3302	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638674_3c925309e60449b59b910b36e5fdb08e	PROP-LLD-PMC1-05-004	lld_1763344459951_xaidopicm	\N	Riverside Complex	3203 Victoria Street	\N	Peterborough	ON	V2V 6P1	CA	CA	ON	Single Family	1	2007	312826	2767	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638675_55eb5cd0eebc00ba99018a13d5e86f05	PROP-LLD-PMC1-05-005	lld_1763344459951_xaidopicm	\N	Lakeside Lodge	7185 Yonge Drive	\N	Pembroke	ON	X0G 7K9	CA	CA	ON	Multi-Unit	3	2011	366850	2549	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638678_4a7e746e962e9fc7d4865cadf18cbe8f	PROP-LLD-PMC1-06-001	lld_1763344459953_9k0mhiks4	\N	View Complex	5799 Main Boulevard	\N	Belleville	ON	G5D 6Z3	CA	CA	ON	Single Family	1	2014	295389	1546	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638679_652104fc15d32a327afbf102185e8320	PROP-LLD-PMC1-06-002	lld_1763344459953_9k0mhiks4	\N	Sunrise Residence	8244 College Place	\N	Kingston	ON	R2G 0A5	CA	CA	ON	Single Family	1	2001	482686	1789	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638680_f7205adefc3482ba509aa42f627b7a78	PROP-LLD-PMC1-06-003	lld_1763344459953_9k0mhiks4	\N	Pine Estates	2474 Church Court	\N	Cambridge	ON	Y4K 7B1	CA	CA	ON	Single Family	1	2024	310111	2482	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638682_ee05eaffcba293c6d2807e958f197fa6	PROP-LLD-PMC1-06-004	lld_1763344459953_9k0mhiks4	\N	Oak Lodge	937 First Lane	\N	Timmins	ON	Y1R 5W7	CA	CA	ON	Single Family	1	1990	341361	2616	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638683_d3dcd1425bcb4adaec65b22760908fe3	PROP-LLD-PMC1-06-005	lld_1763344459953_9k0mhiks4	\N	Ridge Suites	5414 Victoria Boulevard	\N	North Bay	ON	H3S 2H0	CA	CA	ON	Multi-Unit	3	1988	596635	2119	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638686_cbd404ff05606f3cd1b197cc264034fa	PROP-LLD-PMC1-07-001	lld_1763344459956_x6v0haalr	\N	Elm Residence	2389 Front Crescent	\N	Sault Ste. Marie	ON	D0C 7W5	CA	CA	ON	Single Family	1	2020	258962	1536	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638687_289587bd095a99980134641fcf60bd29	PROP-LLD-PMC1-07-002	lld_1763344459956_x6v0haalr	\N	Court Lodge	4323 Second Street	\N	Kitchener	ON	G0X 6K3	CA	CA	ON	Single Family	1	1994	480338	2051	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638688_74c2187187e74d613af00e89bd31293c	PROP-LLD-PMC1-07-003	lld_1763344459956_x6v0haalr	\N	Meadow Apartments	9037 Front Place	\N	Ottawa	ON	P4W 4L1	CA	CA	ON	Multi-Unit	2	2004	415188	4012	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638690_f710923a7c6df773f93fb61500217248	PROP-LLD-PMC1-07-004	lld_1763344459956_x6v0haalr	\N	Meadow Residence	978 College Drive	\N	Sudbury	ON	W7N 8K7	CA	CA	ON	Single Family	1	2004	369319	2830	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638692_1a09f0740afe21686b8ea23eacf2449a	PROP-LLD-PMC1-07-005	lld_1763344459956_x6v0haalr	\N	Court Suites	8067 Cedar Crescent	Unit 33	Burlington	ON	C3X 5K0	CA	CA	ON	Single Family	1	1987	581868	3337	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638693_2a22255a5ed7510ad6b9b379622b04ed	PROP-LLD-PMC1-08-001	lld_1763344459958_gztj01xmk	\N	Riverside Villa	1173 Second Road	\N	Orillia	ON	A5K 5A4	CA	CA	ON	Multi-Unit	4	2016	418363	2676	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638696_92633b1561239eb1ca8424d5c07b9377	PROP-LLD-PMC1-08-002	lld_1763344459958_gztj01xmk	\N	Sunrise Village	5629 Church Avenue	\N	Peterborough	ON	F7D 2A0	CA	CA	ON	Single Family	1	1985	302686	1602	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638698_8559000b9db7f7ddbea09714be3cae04	PROP-LLD-PMC1-08-003	lld_1763344459958_gztj01xmk	\N	Ridge Apartments	380 Elm Drive	Unit 74	Sarnia	ON	B7N 4A4	CA	CA	ON	Single Family	1	1982	354106	3048	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638699_411d36b07bc3d822b43f27e63abcde8e	PROP-LLD-PMC1-08-004	lld_1763344459958_gztj01xmk	\N	Manor Place	8801 College Street	\N	Cornwall	ON	E0D 6W2	CA	CA	ON	Single Family	1	2008	293820	3210	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638700_b95d9f9e0da28a9d5f0d599cc1714379	PROP-LLD-PMC1-08-005	lld_1763344459958_gztj01xmk	\N	Maple Towers	3850 Park Court	Unit 79	Toronto	ON	E8A 9B8	CA	CA	ON	Single Family	1	2024	504974	3036	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638702_f8bf0252ec9f4950ab375d12c9d97eed	PROP-LLD-PMC1-09-001	lld_1763344459959_lz6ykg35f	\N	Sunrise Village	9010 Church Crescent	\N	Waterloo	ON	H2T 4F4	CA	CA	ON	Single Family	1	2004	502558	3198	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638703_d0184bcb011ef77feaabf55bd833232a	PROP-LLD-PMC1-09-002	lld_1763344459959_lz6ykg35f	\N	Elm Villa	4862 Cedar Place	\N	Sudbury	ON	M5H 9M2	CA	CA	ON	Single Family	1	2002	598025	2956	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638704_f688023afc34f01c7d51a541c74be071	PROP-LLD-PMC1-09-003	lld_1763344459959_lz6ykg35f	\N	Valley Homes	6806 Third Court	\N	Ottawa	ON	J4D 5E1	CA	CA	ON	Single Family	1	1991	579759	2011	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638706_aa734865d83110e56eab7c9b98bc312b	PROP-LLD-PMC1-09-004	lld_1763344459959_lz6ykg35f	\N	Oak Estates	52 Bay Crescent	\N	Pembroke	ON	A6V 4M7	CA	CA	ON	Single Family	1	2006	380019	3461	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638708_0fb02ddc42669b8563e51ad3244a759a	PROP-LLD-PMC1-09-005	lld_1763344459959_lz6ykg35f	\N	Valley Estates	1826 College Court	\N	Ottawa	ON	R2F 9V9	CA	CA	ON	Multi-Unit	4	1986	477931	2828	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638710_db2f29ec4359a3442b0100bdba14a52d	PROP-LLD-PMC1-09-006	lld_1763344459959_lz6ykg35f	\N	Ridge Apartments	4192 Park Road	\N	Peterborough	ON	E6M 7W4	CA	CA	ON	Single Family	1	2000	307818	3092	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638711_93dbee98d817184bbf95c49a85f41c75	PROP-LLD-PMC1-09-007	lld_1763344459959_lz6ykg35f	\N	Pine Residence	639 Front Boulevard	\N	Windsor	ON	D1M 6P1	CA	CA	ON	Single Family	1	1983	572828	2628	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638713_5e00127fd7cc6319135b0b05bb1bed52	PROP-LLD-PMC1-09-008	lld_1763344459959_lz6ykg35f	\N	Park Apartments	9232 Bay Street	\N	Windsor	ON	S8T 1X8	CA	CA	ON	Single Family	1	2004	431959	1936	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638714_d9e2792a43f282598e1c480dcdf3c6c5	PROP-LLD-PMC1-10-001	lld_1763344459960_6wlqekzar	\N	View Residence	1177 Park Place	Unit 69	Cambridge	ON	Z6N 2B0	CA	CA	ON	Single Family	1	2003	546569	2034	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638715_ff015a913f8a3c1e1c1a3420dbfdc3eb	PROP-LLD-PMC1-10-002	lld_1763344459960_6wlqekzar	\N	Valley Apartments	4219 Pine Place	\N	Thunder Bay	ON	X0K 6D7	CA	CA	ON	Multi-Unit	3	2000	333383	2581	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638717_4c74a552c89172e962960d259eaec29a	PROP-LLD-PMC1-10-003	lld_1763344459960_6wlqekzar	\N	Pine Homes	1407 Cedar Boulevard	\N	London	ON	Y9S 5V0	CA	CA	ON	Single Family	1	2016	554154	2290	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
prop_1763346638719_f41f1917955a21cf43b7b36c712ca6e1	PROP-LLD-PMC1-10-004	lld_1763344459960_6wlqekzar	\N	Cedar Gardens	335 Dundas Road	Unit 6	Barrie	ON	R8R 8T5	CA	CA	ON	Single Family	1	1978	488038	2285	No	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515	\N	\N	\N	\N	\N	biweekly	\N	\N	\N	\N	\N
\.


--
-- Data for Name: PropertyManagementCompany; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PropertyManagementCompany" (id, "companyId", "companyName", email, phone, "addressLine1", "addressLine2", city, "provinceState", "postalZip", country, "countryCode", "regionCode", "defaultCommissionRate", "commissionStructure", "approvalStatus", "approvedBy", "approvedAt", "rejectedBy", "rejectedAt", "rejectionReason", "invitedBy", "invitedAt", "isActive", "createdAt", "updatedAt") FROM stdin;
cmi2b6fyd0000nb70oqm01oop	PMC-1763333400898	Test Property Management Company	testpmc@pmc.local	555-0100	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	APPROVED	\N	2025-11-16 22:50:00.898	\N	\N	\N	\N	\N	t	2025-11-16 22:50:00.901	2025-11-16 22:50:00.901
cmi2dt32o0000nbsps6g9p2tl	PMC-AB-1763337816527	AB Homes	ab-homes@pmc.local	555-0200	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	APPROVED	\N	2025-11-17 00:03:36.527	\N	\N	\N	\N	\N	t	2025-11-17 00:03:36.529	2025-11-17 00:03:36.529
mhzjydymf9f6273898498c3d	PM0B86E902	AB Homes	skolagotla@gmail.com	2128142020	9 Marabrooke Street	\N	Nepean	ON	K2G 7A1	CA	CA	ON	0.05	null	APPROVED	\N	2025-11-15 00:47:08.114	\N	\N	\N	\N	2025-11-14 22:18:55.03	t	2025-11-15 00:32:23.087	2025-11-16 20:40:58.483
\.


--
-- Data for Name: PropertyOwnershipVerification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PropertyOwnershipVerification" (id, "pmcLandlordId", "landlordId", "propertyId", "documentType", "fileName", "originalName", "fileUrl", "fileSize", "mimeType", "uploadedAt", "uploadedBy", "uploadedByEmail", "uploadedByName", status, "verifiedAt", "verifiedBy", "verifiedByEmail", "verifiedByName", "verificationNotes", "rejectedAt", "rejectedBy", "rejectedByEmail", "rejectedByName", "rejectionReason", "expirationDate", "documentNumber", "issuedBy", "issuedDate", metadata, notes) FROM stdin;
\.


--
-- Data for Name: PropertyOwnershipVerificationHistory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PropertyOwnershipVerificationHistory" (id, "verificationId", action, "performedBy", "performedByEmail", "performedByName", "performedByRole", "previousStatus", "newStatus", notes, metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: RBACAuditLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RBACAuditLog" (id, "userId", "userType", "userEmail", "userName", action, resource, "resourceId", "roleId", "permissionId", "scopeId", "beforeState", "afterState", details, "ipAddress", "userAgent", "createdAt") FROM stdin;
cmi2b6fyu0005nb70i3h3zfz6	cmi2agu7j0000nb6bcw3lysx2	admin	\N	\N	assign_role	user	cmi2b6fyp0002nb7004at33e4	\N	\N	\N	\N	\N	{"role": "PMC_ADMIN", "pmcId": "cmi2b6fyd0000nb70oqm01oop", "pmcName": "Test Property Management Company"}	\N	\N	2025-11-16 22:50:00.919
cmi2b6fyz0009nb707e468jif	cmi2agu7j0000nb6bcw3lysx2	admin	\N	\N	assign_role	user	cmi2b6fyy0006nb70btsf8c9e	\N	\N	\N	\N	\N	{"role": "PMC_ADMIN", "pmcId": "cmi2b6fyd0000nb70oqm01oop", "pmcName": "Test Property Management Company"}	\N	\N	2025-11-16 22:50:00.924
cmi2b6fz1000dnb703aq8o5tt	cmi2agu7j0000nb6bcw3lysx2	admin	\N	\N	assign_role	user	cmi2b6fz0000anb70ckggyztb	\N	\N	\N	\N	\N	{"role": "PMC_ADMIN", "pmcId": "cmi2b6fyd0000nb70oqm01oop", "pmcName": "Test Property Management Company"}	\N	\N	2025-11-16 22:50:00.926
cmi2b6fz3000hnb702wrb8vro	cmi2agu7j0000nb6bcw3lysx2	admin	\N	\N	assign_role	user	cmi2b6fz2000enb70xvawro0o	\N	\N	\N	\N	\N	{"role": "PMC_ADMIN", "pmcId": "cmi2b6fyd0000nb70oqm01oop", "pmcName": "Test Property Management Company"}	\N	\N	2025-11-16 22:50:00.928
cmi2b6fz6000lnb70tspmfx54	cmi2agu7j0000nb6bcw3lysx2	admin	\N	\N	assign_role	user	cmi2b6fz4000inb70cj1rf2yz	\N	\N	\N	\N	\N	{"role": "PMC_ADMIN", "pmcId": "cmi2b6fyd0000nb70oqm01oop", "pmcName": "Test Property Management Company"}	\N	\N	2025-11-16 22:50:00.93
cmi2dt32w0004nbspm0r107ft	cmi2agu7j0000nb6bcw3lysx2	admin	\N	\N	assign_role	user	cmi2dt32t0001nbspol4blphp	\N	\N	\N	\N	\N	{"role": "PMC_ADMIN", "pmcId": "cmi2dt32o0000nbsps6g9p2tl", "pmcName": "AB Homes"}	\N	\N	2025-11-17 00:03:36.537
cmi2dt3300008nbspc0fn9mb8	cmi2agu7j0000nb6bcw3lysx2	admin	\N	\N	assign_role	user	cmi2dt32z0005nbsp0mpj13b4	\N	\N	\N	\N	\N	{"role": "PMC_ADMIN", "pmcId": "cmi2dt32o0000nbsps6g9p2tl", "pmcName": "AB Homes"}	\N	\N	2025-11-17 00:03:36.54
cmi22edtr0002nb4gdqssaux3	system	admin	\N	\N	assign_scope	user_role	admin_1762836944093_guaqbbv2f	\N	\N	\N	null	null	{"scope": {}, "roleId": "cmi221iw60000nbrful169jig"}	\N	\N	2025-11-16 18:44:14.847
cmi22edu90005nb4gxc0p07ph	system	admin	\N	\N	assign_scope	user_role	mhzjydymf9f6273898498c3d	\N	\N	\N	null	null	{"scope": {"pmcId": "mhzjydymf9f6273898498c3d"}, "roleId": "cmi221ix30005nbrfr9nxlkmv"}	\N	\N	2025-11-16 18:44:14.865
cmi22ftgr0000nb7tg9c0sjg5	admin_1762836944093_guaqbbv2f	admin	spamsambi@gmail.com	\N	test_action	test	test-id	\N	\N	\N	null	null	null	\N	\N	2025-11-16 18:45:21.771
cmi22ihrq0000nb18gouhkk2u	admin_1762836944093_guaqbbv2f	admin	spamsambi@gmail.com	\N	test_action	test	test-id	\N	\N	\N	null	null	null	\N	\N	2025-11-16 18:47:26.582
cmi25vw0z0000nb888ngcdi38	admin_1762836944093_guaqbbv2f	admin	\N	\N	assign_scope	user_role	mhzjydymf9f6273898498c3d	\N	\N	\N	null	null	{"scope": {}, "roleId": "cmi221ix30005nbrfr9nxlkmv"}	\N	\N	2025-11-16 20:21:50.435
cmi25vw1e0003nb887jj47qmi	admin_1762836944093_guaqbbv2f	admin	\N	\N	assign_scope	user_role	mhzjydymf9f6273898498c3d	\N	\N	\N	null	null	{"scope": {}, "roleId": "cmi221ix50006nbrfy4j46sjq"}	\N	\N	2025-11-16 20:21:50.451
cmi25wfyq0004nb88xtg1xz1y	admin_1762836944093_guaqbbv2f	admin	\N	\N	assign_scope	user_role	mhzjydymf9f6273898498c3d	\N	\N	\N	null	null	{"scope": {}, "roleId": "cmi221ix30005nbrfr9nxlkmv"}	\N	\N	2025-11-16 20:22:16.274
cmi25zln20005nb88zojddn7z	admin_1762836944093_guaqbbv2f	admin	\N	\N	assign_scope	user_role	mhzjydymf9f6273898498c3d	\N	\N	\N	null	null	{"scope": {}, "roleId": "cmi221ix30005nbrfr9nxlkmv"}	\N	\N	2025-11-16 20:24:43.599
cmi25zswn0006nb88akf70ts8	admin_1762836944093_guaqbbv2f	admin	\N	\N	remove_role	user_role	mhzjydymf9f6273898498c3d	\N	\N	\N	null	null	{"removedBy": "admin_1762836944093_guaqbbv2f", "removedRoleId": "cmi221ix50006nbrfy4j46sjq"}	\N	\N	2025-11-16 20:24:53.015
cmi260fty0007nb88bet69hhp	admin_1762836944093_guaqbbv2f	admin	\N	\N	assign_scope	user_role	mhzjydymf9f6273898498c3d	\N	\N	\N	null	null	{"scope": {}, "roleId": "cmi221ix30005nbrfr9nxlkmv"}	\N	\N	2025-11-16 20:25:22.727
cmi260fue000anb88f5rsg89t	admin_1762836944093_guaqbbv2f	admin	\N	\N	assign_scope	user_role	mhzjydymf9f6273898498c3d	\N	\N	\N	null	null	{"scope": {}, "roleId": "cmi221ix70008nbrfj76nm52b"}	\N	\N	2025-11-16 20:25:22.742
cmi260p75000bnb883tpis1l3	admin_1762836944093_guaqbbv2f	admin	\N	\N	assign_scope	user_role	mhzjydymf9f6273898498c3d	\N	\N	\N	null	null	{"scope": {}, "roleId": "cmi221ix30005nbrfr9nxlkmv"}	\N	\N	2025-11-16 20:25:34.865
cmi260vqp000cnb88lqy6l484	admin_1762836944093_guaqbbv2f	admin	\N	\N	assign_scope	user_role	mhzjydymf9f6273898498c3d	\N	\N	\N	null	null	{"scope": {}, "roleId": "cmi221ix30005nbrfr9nxlkmv"}	\N	\N	2025-11-16 20:25:43.346
cmi26176s000dnb88ps65uwq9	admin_1762836944093_guaqbbv2f	admin	\N	\N	assign_scope	user_role	mhzjydymf9f6273898498c3d	\N	\N	\N	null	null	{"scope": {}, "roleId": "cmi221ix30005nbrfr9nxlkmv"}	\N	\N	2025-11-16 20:25:58.181
cmi261y9r000enb88112dy73s	admin_1762836944093_guaqbbv2f	admin	\N	\N	assign_scope	user_role	mhzjydymf9f6273898498c3d	\N	\N	\N	null	null	{"scope": {}, "roleId": "cmi221ix30005nbrfr9nxlkmv"}	\N	\N	2025-11-16 20:26:33.279
cmi264k1l000fnb881zplj5ar	admin_1762836944093_guaqbbv2f	admin	\N	\N	assign_scope	user_role	mhzjydymf9f6273898498c3d	\N	\N	\N	null	null	{"scope": {}, "roleId": "cmi221ix30005nbrfr9nxlkmv"}	\N	\N	2025-11-16 20:28:34.81
cmi2696fp0000nbqg4pf8g90c	admin_1762836944093_guaqbbv2f	admin	\N	\N	assign_scope	user_role	mhzjydymf9f6273898498c3d	\N	\N	\N	null	null	{"scope": {}, "roleId": "cmi221ix30005nbrfr9nxlkmv"}	\N	\N	2025-11-16 20:32:10.454
cmi26aqiy0001nbqg5s768441	admin_1762836944093_guaqbbv2f	admin	\N	\N	assign_scope	user_role	mhzjydymf9f6273898498c3d	\N	\N	\N	null	null	{"scope": {}, "roleId": "cmi221ix30005nbrfr9nxlkmv"}	\N	\N	2025-11-16 20:33:23.147
cmi26bq3j0002nbqgj7itftkf	admin_1762836944093_guaqbbv2f	admin	\N	\N	assign_scope	user_role	mhzjydymf9f6273898498c3d	\N	\N	\N	null	null	{"scope": {}, "roleId": "cmi221ix30005nbrfr9nxlkmv"}	\N	\N	2025-11-16 20:34:09.248
cmi26f21t0003nbqgmm8hkxqz	admin_1762836944093_guaqbbv2f	admin	\N	\N	assign_scope	user_role	mhzjydymf9f6273898498c3d	\N	\N	\N	null	null	{"scope": {}, "roleId": "cmi221ix30005nbrfr9nxlkmv"}	\N	\N	2025-11-16 20:36:44.705
cmi26khuw0004nbqgi4qr585p	admin_1762836944093_guaqbbv2f	admin	\N	\N	remove_role	user_role	mhzjydymf9f6273898498c3d	\N	\N	\N	null	null	{"removedBy": "admin_1762836944093_guaqbbv2f", "removedRoleId": "cmi221ix70008nbrfj76nm52b", "removedUserRoleId": "cmi260fub0009nb884yrw99ih"}	\N	\N	2025-11-16 20:40:58.473
cmi26l4ni0007nbqg3xxkgvg4	admin_1762836944093_guaqbbv2f	admin	\N	\N	assign_scope	user_role	admin_1762836944093_guaqbbv2f	\N	\N	\N	null	null	{"scope": {}, "roleId": "cmi221iwn0002nbrfa3gni746"}	\N	\N	2025-11-16 20:41:28.015
cmi26ld8l0008nbqgthgoqwxx	admin_1762836944093_guaqbbv2f	admin	\N	\N	remove_role	user_role	admin_1762836944093_guaqbbv2f	\N	\N	\N	null	null	{"removedBy": "admin_1762836944093_guaqbbv2f", "removedRoleId": "cmi221iwn0002nbrfa3gni746", "removedUserRoleId": "cmi26l4ng0006nbqg0ngnvk6h"}	\N	\N	2025-11-16 20:41:39.142
cmi2frx610002nbwm1z5xyez8	cmi2agu7j0000nb6bcw3lysx2	admin	\N	\N	assign_scope	user_role	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	{"scope": {}, "roleId": "cmi221iw60000nbrful169jig"}	\N	\N	2025-11-17 00:58:41.449
cmi2fs5a10003nbwmzw9qdwc4	cmi2agu7j0000nb6bcw3lysx2	admin	\N	\N	assign_scope	user_role	cmi2agu7j0000nb6bcw3lysx2	\N	\N	\N	\N	\N	{"scope": {}, "roleId": "cmi221iw60000nbrful169jig"}	\N	\N	2025-11-17 00:58:51.961
cmi2fslch0004nbwmq3q4wcyo	cmi2agu7j0000nb6bcw3lysx2	admin	\N	\N	assign_scope	user_role	cmi2dt32t0001nbspol4blphp	\N	\N	\N	\N	\N	{"scope": {"pmcId": "cmi2dt32o0000nbsps6g9p2tl"}, "roleId": "cmi2b6fyk0001nb70c1iv3y79"}	\N	\N	2025-11-17 00:59:12.786
cmi4lsitd0000nbq5v0wv1vaa	cmi2agu7j0000nb6bcw3lysx2	admin	\N	\N	assign_role	user	cmi2dt32t0001nbspol4blphp	\N	\N	\N	\N	\N	{"role": "PMC_ADMIN", "pmcId": "cmi2dt32o0000nbsps6g9p2tl", "pmcName": "AB Homes"}	\N	\N	2025-11-18 13:22:39.553
cmi4lsith0001nbq5tqwzlpdd	cmi2agu7j0000nb6bcw3lysx2	admin	\N	\N	assign_role	user	cmi2dt32z0005nbsp0mpj13b4	\N	\N	\N	\N	\N	{"role": "PMC_ADMIN", "pmcId": "cmi2dt32o0000nbsps6g9p2tl", "pmcName": "AB Homes"}	\N	\N	2025-11-18 13:22:39.558
\.


--
-- Data for Name: RecurringMaintenance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RecurringMaintenance" (id, "propertyId", "unitId", title, description, frequency, "lastCompletedDate", "nextDueDate", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ReferenceData; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ReferenceData" (id, category, code, name, description, color, "sortOrder", "isActive", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Region; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Region" (id, "countryCode", code, name, "isActive", "sortOrder", "createdAt", "updatedAt", timezone, "utcOffset", latitude, longitude, "currencyCode", "taxRate", "legalFramework", "rentControl", "evictionRules") FROM stdin;
cmhgkgkjp0003nbz0tjt55fjp	CA	AB	Alberta	t	1	2025-11-01 17:38:54.086	2025-11-01 17:48:54.095	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkjr0005nbz0orsvqtsz	CA	BC	British Columbia	t	2	2025-11-01 17:38:54.088	2025-11-01 17:48:54.096	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkjs0007nbz0jeaw9rje	CA	MB	Manitoba	t	3	2025-11-01 17:38:54.088	2025-11-01 17:48:54.096	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkjt0009nbz03jmeqsmc	CA	NB	New Brunswick	t	4	2025-11-01 17:38:54.089	2025-11-01 17:48:54.097	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkju000bnbz0fthfaf4j	CA	NL	Newfoundland and Labrador	t	5	2025-11-01 17:38:54.09	2025-11-01 17:48:54.097	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkju000dnbz0w8zado3d	CA	NS	Nova Scotia	t	6	2025-11-01 17:38:54.091	2025-11-01 17:48:54.098	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkjv000fnbz0mv18mvhj	CA	NT	Northwest Territories	t	7	2025-11-01 17:38:54.092	2025-11-01 17:48:54.098	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkjw000hnbz05har1y3t	CA	NU	Nunavut	t	8	2025-11-01 17:38:54.092	2025-11-01 17:48:54.098	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkjw000jnbz0ala2exal	CA	ON	Ontario	t	9	2025-11-01 17:38:54.093	2025-11-01 17:48:54.099	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkjx000lnbz03wr0nj17	CA	PE	Prince Edward Island	t	10	2025-11-01 17:38:54.093	2025-11-01 17:48:54.099	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkjx000nnbz06ngw8cwg	CA	QC	Quebec	t	11	2025-11-01 17:38:54.094	2025-11-01 17:48:54.099	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkjy000pnbz0w5s8d7jv	CA	SK	Saskatchewan	t	12	2025-11-01 17:38:54.094	2025-11-01 17:48:54.1	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkjy000rnbz0fn6iec79	CA	YT	Yukon	t	13	2025-11-01 17:38:54.095	2025-11-01 17:48:54.1	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkjz000tnbz0465vqa3m	US	AL	Alabama	t	1	2025-11-01 17:38:54.095	2025-11-01 17:48:54.1	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkk0000vnbz04ot5hieb	US	AK	Alaska	t	2	2025-11-01 17:38:54.096	2025-11-01 17:48:54.101	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkk1000xnbz0go26xgmt	US	AZ	Arizona	t	3	2025-11-01 17:38:54.097	2025-11-01 17:48:54.101	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkk1000znbz0nqo5ylq5	US	AR	Arkansas	t	4	2025-11-01 17:38:54.097	2025-11-01 17:48:54.101	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkk10011nbz0w7pymm1g	US	CA	California	t	5	2025-11-01 17:38:54.098	2025-11-01 17:48:54.102	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkk20013nbz07mi5oz3e	US	CO	Colorado	t	6	2025-11-01 17:38:54.098	2025-11-01 17:48:54.102	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkk20015nbz04jsyikty	US	CT	Connecticut	t	7	2025-11-01 17:38:54.099	2025-11-01 17:48:54.102	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkk30017nbz01vxrvihx	US	DE	Delaware	t	8	2025-11-01 17:38:54.099	2025-11-01 17:48:54.103	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkk30019nbz0oh7ekand	US	FL	Florida	t	9	2025-11-01 17:38:54.1	2025-11-01 17:48:54.103	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkk4001bnbz0wbn35nq0	US	GA	Georgia	t	10	2025-11-01 17:38:54.1	2025-11-01 17:48:54.103	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkk4001dnbz0bxt55kog	US	HI	Hawaii	t	11	2025-11-01 17:38:54.101	2025-11-01 17:48:54.103	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkk5001fnbz02c765ugs	US	ID	Idaho	t	12	2025-11-01 17:38:54.101	2025-11-01 17:48:54.104	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkk5001hnbz0ekgnyi90	US	IL	Illinois	t	13	2025-11-01 17:38:54.101	2025-11-01 17:48:54.104	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkk5001jnbz05oh6xfr3	US	IN	Indiana	t	14	2025-11-01 17:38:54.102	2025-11-01 17:48:54.104	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkk6001lnbz0qnl9kqf8	US	IA	Iowa	t	15	2025-11-01 17:38:54.102	2025-11-01 17:48:54.105	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkk6001nnbz0pbq934tw	US	KS	Kansas	t	16	2025-11-01 17:38:54.103	2025-11-01 17:48:54.105	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkk7001pnbz00zgrg3we	US	KY	Kentucky	t	17	2025-11-01 17:38:54.103	2025-11-01 17:48:54.105	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkk7001rnbz0p3ys3vpv	US	LA	Louisiana	t	18	2025-11-01 17:38:54.103	2025-11-01 17:48:54.105	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkk7001tnbz0zfpbfgob	US	ME	Maine	t	19	2025-11-01 17:38:54.104	2025-11-01 17:48:54.106	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkk8001vnbz04jjbkgec	US	MD	Maryland	t	20	2025-11-01 17:38:54.104	2025-11-01 17:48:54.106	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkk8001xnbz09p5ext75	US	MA	Massachusetts	t	21	2025-11-01 17:38:54.105	2025-11-01 17:48:54.106	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkk9001znbz08jyffh6p	US	MI	Michigan	t	22	2025-11-01 17:38:54.105	2025-11-01 17:48:54.107	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkk90021nbz052t6ukqr	US	MN	Minnesota	t	23	2025-11-01 17:38:54.106	2025-11-01 17:48:54.107	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkka0023nbz02506fcf6	US	MS	Mississippi	t	24	2025-11-01 17:38:54.106	2025-11-01 17:48:54.107	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkka0025nbz08mjvmlpa	US	MO	Missouri	t	25	2025-11-01 17:38:54.107	2025-11-01 17:48:54.108	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkkb0027nbz069g10ujq	US	MT	Montana	t	26	2025-11-01 17:38:54.107	2025-11-01 17:48:54.108	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkkb0029nbz0iwsqmmkd	US	NE	Nebraska	t	27	2025-11-01 17:38:54.107	2025-11-01 17:48:54.108	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkkb002bnbz0rncv5jh3	US	NV	Nevada	t	28	2025-11-01 17:38:54.108	2025-11-01 17:48:54.109	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkkc002dnbz0fpx2e4ji	US	NH	New Hampshire	t	29	2025-11-01 17:38:54.108	2025-11-01 17:48:54.109	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkkc002fnbz0amklrwwa	US	NJ	New Jersey	t	30	2025-11-01 17:38:54.109	2025-11-01 17:48:54.109	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkkd002hnbz0af7peg26	US	NM	New Mexico	t	31	2025-11-01 17:38:54.109	2025-11-01 17:48:54.109	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkkd002jnbz06lmsprmi	US	NY	New York	t	32	2025-11-01 17:38:54.11	2025-11-01 17:48:54.11	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkkd002lnbz09fouh4za	US	NC	North Carolina	t	33	2025-11-01 17:38:54.11	2025-11-01 17:48:54.11	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkke002nnbz0r7lt02sp	US	ND	North Dakota	t	34	2025-11-01 17:38:54.11	2025-11-01 17:48:54.11	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkke002pnbz0bwaxhj59	US	OH	Ohio	t	35	2025-11-01 17:38:54.111	2025-11-01 17:48:54.11	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkke002rnbz05wywaa7t	US	OK	Oklahoma	t	36	2025-11-01 17:38:54.111	2025-11-01 17:48:54.111	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkkf002tnbz0euywvfql	US	OR	Oregon	t	37	2025-11-01 17:38:54.111	2025-11-01 17:48:54.111	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkkf002vnbz03zyp3i9i	US	PA	Pennsylvania	t	38	2025-11-01 17:38:54.112	2025-11-01 17:48:54.111	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkkf002xnbz0jjqz0pn3	US	RI	Rhode Island	t	39	2025-11-01 17:38:54.112	2025-11-01 17:48:54.112	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkkg002znbz0obxqnx9v	US	SC	South Carolina	t	40	2025-11-01 17:38:54.112	2025-11-01 17:48:54.112	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkkh0031nbz0fc8wl3t9	US	SD	South Dakota	t	41	2025-11-01 17:38:54.113	2025-11-01 17:48:54.112	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkkh0033nbz0mo58aqoh	US	TN	Tennessee	t	42	2025-11-01 17:38:54.113	2025-11-01 17:48:54.112	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkkh0035nbz0i7hzv6a2	US	TX	Texas	t	43	2025-11-01 17:38:54.114	2025-11-01 17:48:54.113	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkki0037nbz0eu346usl	US	UT	Utah	t	44	2025-11-01 17:38:54.114	2025-11-01 17:48:54.113	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkki0039nbz0fkr98o5f	US	VT	Vermont	t	45	2025-11-01 17:38:54.115	2025-11-01 17:48:54.113	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkkj003bnbz0anp39627	US	VA	Virginia	t	46	2025-11-01 17:38:54.115	2025-11-01 17:48:54.114	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkkj003dnbz0cvhinscg	US	WA	Washington	t	47	2025-11-01 17:38:54.115	2025-11-01 17:48:54.114	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkkj003fnbz0ucb49o00	US	WV	West Virginia	t	48	2025-11-01 17:38:54.116	2025-11-01 17:48:54.114	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkkk003hnbz02rfq3wrf	US	WI	Wisconsin	t	49	2025-11-01 17:38:54.116	2025-11-01 17:48:54.114	\N	\N	\N	\N	\N	\N	\N	f	null
cmhgkgkkk003jnbz07uqpvef2	US	WY	Wyoming	t	50	2025-11-01 17:38:54.117	2025-11-01 17:48:54.115	\N	\N	\N	\N	\N	\N	\N	f	null
\.


--
-- Data for Name: RentPayment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RentPayment" (id, "leaseId", amount, "dueDate", "paidDate", "paymentMethod", "referenceNumber", status, notes, "receiptNumber", "receiptSent", "receiptSentAt", "createdAt", "updatedAt", "overdueReminderSent", "overdueReminderSentAt", "reminderSent", "reminderSentAt") FROM stdin;
cmibvzzsm9GWo5KsMBl2n04Z6	mi6qi21e5af91cfe5b29c008	142.74	2024-11-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:42:47.543	2025-11-23 15:42:47.542	f	\N	f	\N
cmibw5xus1EFRQEPBp5rP8yR	mi6qi2225dc5b85d7e5659e9	2463	2024-01-01 05:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.965	2025-11-23 15:47:24.964	f	\N	f	\N
cmibw5xuuiuDqd1wgJOxqjKEK	mi6qi2225dc5b85d7e5659e9	2463	2024-02-01 05:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.967	2025-11-23 15:47:24.966	f	\N	f	\N
cmibw5xuv9cXPLUh6HpNfu7M8	mi6qi2225dc5b85d7e5659e9	2463	2024-03-01 05:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.968	2025-11-23 15:47:24.967	f	\N	f	\N
cmibw5xuwMW3IzanPRyF8G8	mi6qi2225dc5b85d7e5659e9	2463	2024-04-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.968	2025-11-23 15:47:24.968	f	\N	f	\N
cmibw5xuw8hG1IYCpQaKVNYJT	mi6qi2225dc5b85d7e5659e9	2463	2024-05-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.969	2025-11-23 15:47:24.968	f	\N	f	\N
cmibw5xuxbklGsCXc550rC1uK	mi6qi2225dc5b85d7e5659e9	2463	2024-06-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.97	2025-11-23 15:47:24.969	f	\N	f	\N
cmibw5xuysNy1bTtZTTXS2kVJ	mi6qi2225dc5b85d7e5659e9	2463	2024-07-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.971	2025-11-23 15:47:24.97	f	\N	f	\N
cmibw5xuzcZXPndXSvqg19ZP	mi6qi2225dc5b85d7e5659e9	2463	2024-08-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.972	2025-11-23 15:47:24.971	f	\N	f	\N
cmibw5xv0mzxtn0PhlrP92liy	mi6qi2225dc5b85d7e5659e9	2463	2024-09-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.973	2025-11-23 15:47:24.972	f	\N	f	\N
cmibw5xv1sLcuZ3KhNAIDgaR5	mi6qi2225dc5b85d7e5659e9	2463	2024-10-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.974	2025-11-23 15:47:24.973	f	\N	f	\N
cmibw5xv2XWiowgEt3mYEDcKK	mi6qi2225dc5b85d7e5659e9	2463	2024-11-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.974	2025-11-23 15:47:24.974	f	\N	f	\N
cmibw5xv667aacEqDkhXmGs2	mi6qi227690cb3fd8f5d5ec0	885.13	2024-04-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.979	2025-11-23 15:47:24.978	f	\N	f	\N
cmibw5xv7LpJlNrnZPTRHObZl	mi6qi227690cb3fd8f5d5ec0	1193	2024-05-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.98	2025-11-23 15:47:24.98	f	\N	f	\N
cmibw5xv98ve8tN9VStkKl170	mi6qi227690cb3fd8f5d5ec0	1193	2024-06-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.981	2025-11-23 15:47:24.981	f	\N	f	\N
cmibw5xvaFZY2ss7z2eO3Dj2	mi6qi227690cb3fd8f5d5ec0	1193	2024-07-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.983	2025-11-23 15:47:24.982	f	\N	f	\N
cmibw5xvbrvhVTD3MGy5Go5	mi6qi227690cb3fd8f5d5ec0	1193	2024-08-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.984	2025-11-23 15:47:24.983	f	\N	f	\N
cmibw5xvcSU2iauBOBGE99NU	mi6qi227690cb3fd8f5d5ec0	1193	2024-09-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.984	2025-11-23 15:47:24.984	f	\N	f	\N
cmibw5xvdziR6xMdKiWnzr68	mi6qi227690cb3fd8f5d5ec0	1193	2024-10-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.985	2025-11-23 15:47:24.985	f	\N	f	\N
cmibw5xvexCIlaM6SNWuSyXd	mi6qi227690cb3fd8f5d5ec0	1193	2024-11-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.987	2025-11-23 15:47:24.986	f	\N	f	\N
cmibw5xvgJXwVSY2WCdFx9VEE	mi6qi229b6bf7ff1b315ea27	1282.67	2024-05-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.989	2025-11-23 15:47:24.988	f	\N	f	\N
cmibw5xvhAOH996E5POmnNkN	mi6qi229b6bf7ff1b315ea27	1924	2024-06-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.99	2025-11-23 15:47:24.989	f	\N	f	\N
cmibw5xviOYAhuf4u6QWsOGdD	mi6qi229b6bf7ff1b315ea27	1924	2024-07-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.991	2025-11-23 15:47:24.99	f	\N	f	\N
cmibw5xvjl8gJH3HuRqdqHwPS	mi6qi229b6bf7ff1b315ea27	1924	2024-08-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.992	2025-11-23 15:47:24.991	f	\N	f	\N
cmibw5xvkEKmoLRBavXcaliR	mi6qi229b6bf7ff1b315ea27	1924	2024-09-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.993	2025-11-23 15:47:24.992	f	\N	f	\N
cmibw5xvllbWeQcPZFfEXBmv	mi6qi229b6bf7ff1b315ea27	1924	2024-10-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.994	2025-11-23 15:47:24.993	f	\N	f	\N
cmibw5xvmHtkAaJU11xmQHB8	mi6qi229b6bf7ff1b315ea27	1924	2024-11-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.995	2025-11-23 15:47:24.994	f	\N	f	\N
cmibw5xv3ZmWwjwi4yF6fMSv	mi6qi2245e9f56464d73f440	1045.8	2025-10-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.976	2025-11-23 15:47:24.975	f	\N	f	\N
cmibw5xv42X2qCAxd1GBM5IbB	mi6qi2245e9f56464d73f440	2241	2025-11-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.977	2025-11-23 15:47:24.976	f	\N	f	\N
cmibw5xuhYcD9fvLefmtNAoZM	mi6qi2208fb1aff403f413cc	1669.64	2025-03-01 05:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.954	2025-11-23 15:47:24.953	f	\N	f	\N
cmibw5xujfLpL8RThT1B1aW6r	mi6qi2208fb1aff403f413cc	2750	2025-04-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.956	2025-11-23 15:47:24.955	f	\N	f	\N
cmibw5xukVbsQzUeYPaJWbsI	mi6qi2208fb1aff403f413cc	2750	2025-05-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.957	2025-11-23 15:47:24.956	f	\N	f	\N
cmibw5xum7DKOnf4SHN1Z4ESS	mi6qi2208fb1aff403f413cc	2750	2025-06-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.959	2025-11-23 15:47:24.958	f	\N	f	\N
cmibw5xun25UTvzZ2dkYSd5IC	mi6qi2208fb1aff403f413cc	2750	2025-07-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.96	2025-11-23 15:47:24.959	f	\N	f	\N
cmibw5xuoOZJEMODVovWXi0B7	mi6qi2208fb1aff403f413cc	2750	2025-08-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.961	2025-11-23 15:47:24.96	f	\N	f	\N
cmibw5xupqIRIog35f4YH3Y	mi6qi2208fb1aff403f413cc	2750	2025-09-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.962	2025-11-23 15:47:24.961	f	\N	f	\N
cmibw5xuqTnA3hHV08k7z8M2K	mi6qi2208fb1aff403f413cc	2750	2025-10-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.962	2025-11-23 15:47:24.962	f	\N	f	\N
cmibw5xuqqVLlzKL7W3cjVH	mi6qi2208fb1aff403f413cc	2750	2025-11-01 04:00:00	\N	\N	\N	Overdue	\N	\N	f	\N	2025-11-23 15:47:24.963	2025-11-23 15:47:24.963	f	\N	f	\N
\.


--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Role" (id, name, "displayName", description, "isActive", "isSystem", "createdBy", "createdByPMCId", "createdAt", "updatedAt") FROM stdin;
cmi2b6fyk0001nb70c1iv3y79	PMC_ADMIN	PMC Admin	Property Management Company Administrator	t	t	\N	\N	2025-11-16 22:50:00.908	2025-11-16 22:50:00.908
cmi221iw60000nbrful169jig	SUPER_ADMIN	Super Admin	\N	t	t	\N	\N	2025-11-16 18:34:14.886	2025-11-16 18:34:14.886
cmi221iwi0001nbrfmz336d55	PLATFORM_ADMIN	Platform Admin	\N	t	t	\N	\N	2025-11-16 18:34:14.899	2025-11-16 18:34:14.899
cmi221iwn0002nbrfa3gni746	SUPPORT_ADMIN	Support Admin	\N	t	t	\N	\N	2025-11-16 18:34:14.903	2025-11-16 18:34:14.903
cmi221ix00003nbrfilcrndhp	BILLING_ADMIN	Billing Admin	\N	t	t	\N	\N	2025-11-16 18:34:14.916	2025-11-16 18:34:14.916
cmi221ix20004nbrf11cqjx11	AUDIT_ADMIN	Audit Admin	\N	t	t	\N	\N	2025-11-16 18:34:14.918	2025-11-16 18:34:14.918
cmi221ix50006nbrfy4j46sjq	PROPERTY_MANAGER	Property Manager	\N	t	t	\N	\N	2025-11-16 18:34:14.921	2025-11-16 18:34:14.921
cmi221ix60007nbrfk4vt9mqx	LEASING_AGENT	Leasing Agent	\N	t	t	\N	\N	2025-11-16 18:34:14.922	2025-11-16 18:34:14.922
cmi221ix70008nbrfj76nm52b	MAINTENANCE_TECH	Maintenance Tech	\N	t	t	\N	\N	2025-11-16 18:34:14.923	2025-11-16 18:34:14.923
cmi221ix80009nbrfa5sjxu07	ACCOUNTANT	Accountant	\N	t	t	\N	\N	2025-11-16 18:34:14.924	2025-11-16 18:34:14.924
cmi221ix9000anbrf2b8bu9rv	OWNER_LANDLORD	Owner/Landlord	\N	t	t	\N	\N	2025-11-16 18:34:14.925	2025-11-16 18:34:14.925
cmi221ixa000bnbrf4rvc3ccw	TENANT	Tenant	\N	t	t	\N	\N	2025-11-16 18:34:14.926	2025-11-16 18:34:14.926
cmi221ixb000cnbrf0jq45exw	VENDOR_SERVICE_PROVIDER	Vendor/Service Provider	\N	t	t	\N	\N	2025-11-16 18:34:14.927	2025-11-16 18:34:14.927
\.


--
-- Data for Name: RolePermission; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RolePermission" (id, "roleId", category, resource, action, conditions) FROM stdin;
cmi221ixi000knbrf6m21eaar	cmi221iw60000nbrful169jig	SYSTEM_SETTINGS	api_keys	CREATE	null
cmi221ixm0012nbrfgs29cbt5	cmi221ix50006nbrfy4j46sjq	PROPERTY_UNIT_MANAGEMENT	properties	UPDATE	{"approvalTimeout": 3, "requiresApproval": true}
cmi221ixm0014nbrf6venwxps	cmi221ix50006nbrfy4j46sjq	PROPERTY_UNIT_MANAGEMENT	units	CREATE	{"requiresApproval": true}
cmi221ixn0016nbrfu7knhsjs	cmi221ix50006nbrfy4j46sjq	TENANT_MANAGEMENT	tenants	VIEW	null
cmi221ixn0018nbrfd8o3omce	cmi221ix50006nbrfy4j46sjq	TENANT_MANAGEMENT	evictions	SUBMIT	null
cmi221ixo001anbrfd4lqoopx	cmi221ix50006nbrfy4j46sjq	LEASING_APPLICATIONS	applications	VIEW	null
cmi221ixo001cnbrfjzcp51c6	cmi221ix50006nbrfy4j46sjq	LEASING_APPLICATIONS	leases	CREATE	{"requiresApproval": true}
cmi221ixo001enbrf62q0n6nc	cmi221ix50006nbrfy4j46sjq	RENT_PAYMENTS	charges	CREATE	null
cmi221ixp001gnbrf6n3esgoh	cmi221ix50006nbrfy4j46sjq	RENT_PAYMENTS	payments	CREATE	null
cmi221ixp001inbrf64coyiih	cmi221ix50006nbrfy4j46sjq	RENT_PAYMENTS	refunds	APPROVE	null
cmi221ixp001knbrfydxe48xz	cmi221ix50006nbrfy4j46sjq	MAINTENANCE	work_orders	ASSIGN	null
cmi221ixq001mnbrfz6y6xb1t	cmi221ix50006nbrfy4j46sjq	MAINTENANCE	expenses	APPROVE	{"bigExpenseThreshold": true}
cmi221ixq001onbrfvyju8h60	cmi221ix50006nbrfy4j46sjq	REPORTING_OWNER_STATEMENTS	reports	VIEW	null
cmi221ixq001qnbrfrtjyrpsp	cmi221ix50006nbrfy4j46sjq	REPORTING_OWNER_STATEMENTS	reports	EXPORT	null
cmi221ixr001snbrfk4vumctn	cmi221ix50006nbrfy4j46sjq	COMMUNICATION_MESSAGING	messages	SEND	null
cmi221ixr001unbrfxu4cf3wn	cmi221ix50006nbrfy4j46sjq	COMMUNICATION_MESSAGING	inbox	VIEW	null
cmi221ixs001wnbrfjuhrb9pj	cmi221ix50006nbrfy4j46sjq	DOCUMENT_MANAGEMENT	documents	UPLOAD	null
cmi221ixs001ynbrf68apge3a	cmi221ix50006nbrfy4j46sjq	DOCUMENT_MANAGEMENT	documents	VIEW	null
cmi221ixt0020nbrffo2fbsmx	cmi221ix50006nbrfy4j46sjq	TASK_WORKFLOW_MANAGEMENT	tasks	ASSIGN	null
cmi221ixu0024nbrftn6pwf7m	cmi221ix50006nbrfy4j46sjq	PROPERTY_UNIT_MANAGEMENT	inspections	CREATE	null
cmi221ixu0026nbrfmtjmzr9x	cmi221ix50006nbrfy4j46sjq	PROPERTY_UNIT_MANAGEMENT	inspections	VIEW	null
cmi221ixu0028nbrf3ef4efd7	cmi221ix60007nbrfk4vt9mqx	LEASING_APPLICATIONS	applications	VIEW	null
cmi221ixv002anbrfhnvzd0rk	cmi221ix60007nbrfk4vt9mqx	LEASING_APPLICATIONS	applications	UPDATE	null
cmi221ixw002cnbrf8ym3es4t	cmi221ix60007nbrfk4vt9mqx	LEASING_APPLICATIONS	screening	SUBMIT	null
cmi221ixw002enbrf9wx7mt0x	cmi221ix60007nbrfk4vt9mqx	LEASING_APPLICATIONS	leases	CREATE	{"requiresApproval": true}
cmi221ixx002gnbrffd7qyxv6	cmi221ix60007nbrfk4vt9mqx	MARKETING_LISTINGS	listings	CREATE	null
cmi221ixx002inbrfvei7krgv	cmi221ix60007nbrfk4vt9mqx	MARKETING_LISTINGS	listings	UPDATE	null
cmi221iy1002knbrfp62473qy	cmi221ix60007nbrfk4vt9mqx	MARKETING_LISTINGS	listings	VIEW	null
cmi221iy1002mnbrfx93ewosz	cmi221ix60007nbrfk4vt9mqx	TENANT_MANAGEMENT	evictions	SUBMIT	null
cmi221iy2002onbrffe3jcs83	cmi221ix60007nbrfk4vt9mqx	PORTFOLIO_PROPERTY_ASSIGNMENT	units	ASSIGN	null
cmi221iy4002qnbrfwh0oiyis	cmi221ix60007nbrfk4vt9mqx	PORTFOLIO_PROPERTY_ASSIGNMENT	properties	VIEW	{"scopeRestriction": "property"}
cmi221iy5002snbrfn1bdbmtc	cmi221ix60007nbrfk4vt9mqx	TASK_WORKFLOW_MANAGEMENT	tasks	ASSIGN	null
cmi221iy5002unbrfvqp434k8	cmi221ix60007nbrfk4vt9mqx	COMMUNICATION_MESSAGING	messages	SEND	null
cmi221iy6002wnbrfewbde47t	cmi221ix70008nbrfj76nm52b	MAINTENANCE	work_orders	VIEW	{"scopeRestriction": "unit"}
cmi221iy6002ynbrfjhi1an55	cmi221ix70008nbrfj76nm52b	MAINTENANCE	work_orders	UPDATE	{"scopeRestriction": "unit"}
cmi221iy60030nbrfqtldhll1	cmi221ix70008nbrfj76nm52b	VENDOR_MANAGEMENT	invoices	SUBMIT	null
cmi221iy70032nbrf6cw00o5h	cmi221ix70008nbrfj76nm52b	DOCUMENT_MANAGEMENT	documents	VIEW	{"workOrderOnly": true}
cmi221iy80034nbrfenf08dxc	cmi221ix70008nbrfj76nm52b	COMMUNICATION_MESSAGING	messages	SEND	{"maintenanceOnly": true}
cmi221iy90036nbrfgepu2qu6	cmi221ix70008nbrfj76nm52b	COMMUNICATION_MESSAGING	inbox	VIEW	{"scopeRestriction": "unit"}
cmi221iy90038nbrf0tu6kmff	cmi221ix70008nbrfj76nm52b	PORTFOLIO_PROPERTY_ASSIGNMENT	properties	VIEW	{"scopeRestriction": "unit"}
cmi221iya003anbrf36n27pg8	cmi221ix80009nbrfa5sjxu07	ACCOUNTING	chart_of_accounts	MANAGE	null
cmi221iya003cnbrf4a85z20k	cmi221ix80009nbrfa5sjxu07	ACCOUNTING	bank_reconciliation	UPDATE	null
cmi221iyb003enbrfgm9373me	cmi221ix80009nbrfa5sjxu07	ACCOUNTING	payouts	CREATE	null
cmi221iyb003gnbrfaw2ohu27	cmi221ix80009nbrfa5sjxu07	ACCOUNTING	security_deposits	UPDATE	null
cmi221iyc003knbrfjtm2pko8	cmi221ix80009nbrfa5sjxu07	RENT_PAYMENTS	charges	CREATE	null
cmi221iyd003mnbrfgy4l89vq	cmi221ix80009nbrfa5sjxu07	RENT_PAYMENTS	refunds	APPROVE	null
cmi221iyd003onbrf9zolyh6v	cmi221ix80009nbrfa5sjxu07	MAINTENANCE	expenses	APPROVE	null
cmi221iyd003qnbrfv3bk94sb	cmi221ix80009nbrfa5sjxu07	VENDOR_MANAGEMENT	invoices	APPROVE	null
cmi221iye003snbrfyz5massr	cmi221ix80009nbrfa5sjxu07	REPORTING_OWNER_STATEMENTS	reports	CREATE	null
cmi221iye003unbrf679vro7u	cmi221ix80009nbrfa5sjxu07	REPORTING_OWNER_STATEMENTS	owner_statements	CREATE	null
cmi221iyf003wnbrfhb9zrixd	cmi221ix80009nbrfa5sjxu07	ACCOUNTING	data	EXPORT	null
cmi221iyf003ynbrfsirozxyu	cmi221ix9000anbrf2b8bu9rv	PROPERTY_UNIT_MANAGEMENT	properties	VIEW	null
cmi221iyg0040nbrfvkw4sk4n	cmi221ix9000anbrf2b8bu9rv	PROPERTY_UNIT_MANAGEMENT	properties	UPDATE	null
cmi221iyg0042nbrfay93keho	cmi221ix9000anbrf2b8bu9rv	PROPERTY_UNIT_MANAGEMENT	units	CREATE	null
cmi221iyg0044nbrfhk871d36	cmi221ix9000anbrf2b8bu9rv	TENANT_MANAGEMENT	tenants	VIEW	null
cmi221ixd000enbrf1c8j1gf6	cmi221iw60000nbrful169jig	USER_ROLE_MANAGEMENT	users	MANAGE	null
cmi221ixh000gnbrfibr7242b	cmi221iw60000nbrful169jig	USER_ROLE_MANAGEMENT	roles	MANAGE	null
cmi221iyk004knbrfazve75vr	cmi221ix9000anbrf2b8bu9rv	REPORTING_OWNER_STATEMENTS	reports	VIEW	null
cmi221iyl004mnbrf4ryrh99s	cmi221ix9000anbrf2b8bu9rv	REPORTING_OWNER_STATEMENTS	owner_statements	VIEW	null
cmi221iyu005qnbrfand81fer	cmi221ixa000bnbrf4rvc3ccw	COMMUNICATION_MESSAGING	inbox	VIEW	{"ownOnly": true}
cmi221iyv005snbrfncoqb5tw	cmi221ixa000bnbrf4rvc3ccw	ACCOUNTING	data	EXPORT	{"ownOnly": true}
cmi221iyv005unbrfyjuu1qve	cmi221ixa000bnbrf4rvc3ccw	PORTFOLIO_PROPERTY_ASSIGNMENT	units	VIEW	{"ownOnly": true}
cmi221iyv005wnbrfdn9ig1vj	cmi221ixb000cnbrf0jq45exw	MAINTENANCE	work_orders	VIEW	{"assignedOnly": true}
cmi221iyw005ynbrfjdva5tfp	cmi221ixb000cnbrf0jq45exw	VENDOR_MANAGEMENT	invoices	SUBMIT	null
cmi221ixh000inbrfjza0mbet	cmi221iw60000nbrful169jig	SYSTEM_SETTINGS	settings	MANAGE	null
cmi221ixt0022nbrf0ygg2cfy	cmi221ix50006nbrfy4j46sjq	PORTFOLIO_PROPERTY_ASSIGNMENT	properties	VIEW	null
cmi221iyc003inbrfpl0sx7sk	cmi221ix80009nbrfa5sjxu07	ACCOUNTING	financial_periods	UPDATE	null
cmi221iyh0046nbrfjjr7msbx	cmi221ix9000anbrf2b8bu9rv	LEASING_APPLICATIONS	applications	APPROVE	null
cmi221iyi0048nbrfd8ejp2pb	cmi221ix9000anbrf2b8bu9rv	LEASING_APPLICATIONS	leases	APPROVE	null
cmi221iyi004anbrfvlvdsl8j	cmi221ix9000anbrf2b8bu9rv	LEASING_APPLICATIONS	leases	VIEW	null
cmi221iyj004cnbrf0tudpj1l	cmi221ix9000anbrf2b8bu9rv	MAINTENANCE	expenses	APPROVE	null
cmi221iyj004enbrfv5iuxy9z	cmi221ix9000anbrf2b8bu9rv	MAINTENANCE	work_orders	ASSIGN	null
cmi221iyj004gnbrfy5czgr17	cmi221ix9000anbrf2b8bu9rv	ACCOUNTING	payouts	VIEW	null
cmi221iyk004inbrfnlrlgxrs	cmi221ix9000anbrf2b8bu9rv	ACCOUNTING	security_deposits	VIEW	null
cmi221iyl004onbrfhi37f4z9	cmi221ix9000anbrf2b8bu9rv	RENT_PAYMENTS	charges	CREATE	null
cmi221iym004qnbrfrmss8nzr	cmi221ix9000anbrf2b8bu9rv	RENT_PAYMENTS	refunds	APPROVE	null
cmi221iym004snbrfvmbz8nt8	cmi221ix9000anbrf2b8bu9rv	DOCUMENT_MANAGEMENT	documents	UPLOAD	null
cmi221iym004unbrf907dopbl	cmi221ix9000anbrf2b8bu9rv	DOCUMENT_MANAGEMENT	documents	VIEW	null
cmi221iyn004wnbrf1dt3kedj	cmi221ix9000anbrf2b8bu9rv	MARKETING_LISTINGS	listings	CREATE	null
cmi221iyn004ynbrffje0iq41	cmi221ix9000anbrf2b8bu9rv	PROPERTY_UNIT_MANAGEMENT	inspections	CREATE	null
cmi221iyn0050nbrfdcokbx8s	cmi221ix9000anbrf2b8bu9rv	PROPERTY_UNIT_MANAGEMENT	inspections	VIEW	null
cmi221iyo0052nbrfbwjfzeir	cmi221ixa000bnbrf4rvc3ccw	LEASING_APPLICATIONS	applications	SUBMIT	null
cmi221iyo0054nbrfhk0jwwad	cmi221ixa000bnbrf4rvc3ccw	LEASING_APPLICATIONS	applications	UPDATE	{"ownOnly": true, "deadline": 7}
cmi221iyo0056nbrf8f5z6ov4	cmi221ixa000bnbrf4rvc3ccw	LEASING_APPLICATIONS	screening	SUBMIT	null
cmi221iyp0058nbrfpnn81wfv	cmi221ixa000bnbrf4rvc3ccw	RENT_PAYMENTS	payments	CREATE	null
cmi221iyp005anbrfxe0dzwms	cmi221ixa000bnbrf4rvc3ccw	RENT_PAYMENTS	payments	VIEW	{"ownOnly": true}
cmi221iyp005cnbrfjkvpb6em	cmi221ixa000bnbrf4rvc3ccw	ACCOUNTING	security_deposits	VIEW	{"ownOnly": true}
cmi221iyq005enbrf89wp0465	cmi221ixa000bnbrf4rvc3ccw	MAINTENANCE	work_orders	CREATE	null
cmi221iyr005gnbrf3z0w92yl	cmi221ixa000bnbrf4rvc3ccw	MAINTENANCE	work_orders	UPDATE	{"ownOnly": true}
cmi221iyr005inbrf6klei5f9	cmi221ixa000bnbrf4rvc3ccw	MAINTENANCE	work_orders	DELETE	{"ownOnly": true}
cmi221iys005knbrfymz8pd36	cmi221ixa000bnbrf4rvc3ccw	DOCUMENT_MANAGEMENT	documents	UPLOAD	{"ownOnly": true}
cmi221iys005mnbrfamtrwnjk	cmi221ixa000bnbrf4rvc3ccw	DOCUMENT_MANAGEMENT	documents	VIEW	{"ownOnly": true}
cmi221iyu005onbrfw22l7psj	cmi221ixa000bnbrf4rvc3ccw	COMMUNICATION_MESSAGING	messages	SEND	null
cmi221iyw0060nbrfkypi9ngo	cmi221ixb000cnbrf0jq45exw	VENDOR_MANAGEMENT	ratings	VIEW	{"ownOnly": true}
cmi221iyx0062nbrfuivb20mk	cmi221ixb000cnbrf0jq45exw	VENDOR_MANAGEMENT	ratings	CREATE	null
cmi221iyx0064nbrfufb7ll2l	cmi221ixb000cnbrf0jq45exw	VENDOR_MANAGEMENT	tenant_ratings	CREATE	null
cmi221iyx0066nbrfxnygwesn	cmi221ixb000cnbrf0jq45exw	DOCUMENT_MANAGEMENT	documents	VIEW	{"workOrderOnly": true}
\.


--
-- Data for Name: Scope; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Scope" (id, type, name, "parentId", "portfolioId", "propertyId", "unitId", "pmcId", metadata, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SecurityDeposit; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SecurityDeposit" (id, "leaseId", "tenantId", "propertyId", "unitId", amount, "depositType", status, "heldInEscrow", "escrowAccount", "refundedAmount", "refundedAt", "refundedBy", "refundedByType", "refundedByEmail", "refundedByName", "approvalRequestId", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ServiceProvider; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ServiceProvider" (id, "providerId", type, name, "businessName", "contactName", "licenseNumber", email, phone, category, specialties, "addressLine1", "addressLine2", city, "provinceState", "postalZip", country, "countryCode", "regionCode", latitude, longitude, rating, "hourlyRate", notes, "isGlobal", "invitedBy", "invitedByRole", "approvedBy", "approvedAt", "isDeleted", "deletedAt", "deletedBy", "deletedByRole", "deletionReason", "retainedName", "retainedEmail", "retainedPhone", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: StripeCustomer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StripeCustomer" (id, "stripeCustomerId", "userId", "userRole", "userEmail", name, email, phone, "defaultPaymentMethodId", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: StripePayment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StripePayment" (id, "rentPaymentId", "stripePaymentIntentId", "stripeCustomerId", "stripeChargeId", amount, currency, status, "paymentMethod", last4, brand, metadata, "receiptUrl", "webhookReceived", "webhookReceivedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SupportTicket; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SupportTicket" (id, "ticketNumber", subject, description, priority, status, "propertyId", "createdBy", "createdByEmail", "createdByName", "createdByRole", "createdByLandlordId", "createdByTenantId", "assignedTo", "assignedToEmail", "assignedToName", "assignedToAdminId", "assignedToLandlordId", "assignedToPMCId", "contractorId", "vendorId", "serviceProviderId", "resolvedAt", "resolvedBy", resolution, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SystemAnnouncement; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SystemAnnouncement" (id, title, message, type, "isActive", "targetAudience", "startDate", "endDate", "createdBy", "createdByEmail", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Task; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Task" (id, "userId", "propertyId", title, description, type, category, "dueDate", "isCompleted", "completedAt", priority, "linkedEntityType", "linkedEntityId", "reminderDays", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TaskReminder; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TaskReminder" (id, "taskId", "reminderDate", "isSent", "sentAt") FROM stdin;
\.


--
-- Data for Name: Tenant; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Tenant" (id, "tenantId", "firstName", "lastName", email, phone, country, "provinceState", "countryCode", "regionCode", "dateOfBirth", "currentAddress", city, "numberOfAdults", "numberOfChildren", "moveInDate", "leaseTerm", "emergencyContactName", "emergencyContactPhone", "employmentStatus", "monthlyIncome", "invitationToken", "invitationSentAt", "invitedBy", "hasAccess", "lastLoginAt", timezone, "createdAt", "updatedAt", "middleName", "postalZip", theme, "approvalStatus", "approvedBy", "approvedAt", "rejectedBy", "rejectedAt", "rejectionReason") FROM stdin;
mi6qhv1s2d58ce40c9324131	TNF6CC0B6D	Gary	Gray	tenant1@test.local	+18095327394	Canada	Ontario	CA	ON	1989-01-22 17:48:29.064	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459933_42r6792tu	t	\N	America/New_York	2025-11-20 01:09:52.624	2025-11-20 01:09:52.624	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qhv2215d1cfd3d8a85cab	TN8C9AAA6E	Catherine	Estrada	tenant2@test.local	+13439464441	Canada	Ontario	CA	ON	1960-01-02 13:09:41.169	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459933_42r6792tu	t	\N	America/New_York	2025-11-20 01:09:52.634	2025-11-20 01:09:52.634	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1x5b78bfb0ebe763bf6	TN6F1D0967	Joshua	Guzman	tenant1_1763601001529_9913@test.local	+16604202972	Canada	Ontario	CA	ON	1978-12-21 14:13:13.925	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459933_42r6792tu	t	\N	America/New_York	2025-11-20 01:10:01.529	2025-11-20 01:10:01.529	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1x93a2cd73a1c920a7a	TN050A12E4	Paul	Williams	tenant2_1763601001533_4166@test.local	+11412827483	Canada	Ontario	CA	ON	1977-03-20 20:58:41.211	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459933_42r6792tu	t	\N	America/New_York	2025-11-20 01:10:01.533	2025-11-20 01:10:01.533	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1xh40b9af431e5d84d1	TN45A8DBF1	Alexis	Peters	tenant3_1763601001541_5454@test.local	+18697778797	Canada	Ontario	CA	ON	1993-09-16 17:12:32.984	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459933_42r6792tu	t	\N	America/New_York	2025-11-20 01:10:01.542	2025-11-20 01:10:01.542	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1xjd359fe7776f74dbe	TNE66B8545	Nicholas	Bell	tenant4_1763601001542_2066@test.local	+11105905196	Canada	Ontario	CA	ON	1999-11-08 06:16:07.681	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459933_42r6792tu	t	\N	America/New_York	2025-11-20 01:10:01.543	2025-11-20 01:10:01.543	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1xl790e33a61c3802e7	TNFAC0F43B	Pamela	King	tenant5_1763601001545_9037@test.local	+18442920239	Canada	Ontario	CA	ON	1951-02-10 03:37:05.97	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459933_42r6792tu	t	\N	America/New_York	2025-11-20 01:10:01.545	2025-11-20 01:10:01.545	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1xm333bb0466365d310	TN10829DB8	Sara	French	tenant6_1763601001546_4321@test.local	+17951408492	Canada	Ontario	CA	ON	1979-04-17 20:43:03.408	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459933_42r6792tu	t	\N	America/New_York	2025-11-20 01:10:01.546	2025-11-20 01:10:01.546	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1xob83df3fedb874af1	TN33BCB284	Kevin	Morales	tenant7_1763601001548_9729@test.local	+12822486039	Canada	Ontario	CA	ON	1981-04-03 08:14:41.505	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459933_42r6792tu	t	\N	America/New_York	2025-11-20 01:10:01.548	2025-11-20 01:10:01.548	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1xpd302804b263f02d9	TN45FD3169	Bobby	Castillo	tenant8_1763601001549_6713@test.local	+17413988626	Canada	Ontario	CA	ON	1974-05-07 15:50:46.861	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459933_42r6792tu	t	\N	America/New_York	2025-11-20 01:10:01.549	2025-11-20 01:10:01.549	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1xr07e393bae5ac6f54	TN8895DCE6	Jessica	Scott	tenant9_1763601001551_1985@test.local	+19234336288	Canada	Ontario	CA	ON	1951-06-15 09:14:30.081	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459933_42r6792tu	t	\N	America/New_York	2025-11-20 01:10:01.551	2025-11-20 01:10:01.551	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1xrfb069490879f8960	TN775976F0	Frances	Lindsey	tenant10_1763601001551_3439@test.local	+14685315170	Canada	Ontario	CA	ON	1972-09-04 18:56:39.393	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459933_42r6792tu	t	\N	America/New_York	2025-11-20 01:10:01.551	2025-11-20 01:10:01.551	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1xtf7011353200c0c80	TNA7A1F1AF	Angela	Powell	tenant11_1763601001553_2277@test.local	+11931385415	Canada	Ontario	CA	ON	1986-02-22 19:33:33.05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459933_42r6792tu	t	\N	America/New_York	2025-11-20 01:10:01.553	2025-11-20 01:10:01.553	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1xuedd8787afbfac9f0	TN92F039B6	Arthur	Bauer	tenant12_1763601001554_3903@test.local	+17218660393	Canada	Ontario	CA	ON	1981-02-06 22:48:20.368	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459933_42r6792tu	t	\N	America/New_York	2025-11-20 01:10:01.554	2025-11-20 01:10:01.554	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1xu865f5acf9600f66e	TN2B02226C	Catherine	Ford	tenant13_1763601001554_5721@test.local	+13221291216	Canada	Ontario	CA	ON	2002-12-22 01:22:29.737	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459933_42r6792tu	t	\N	America/New_York	2025-11-20 01:10:01.554	2025-11-20 01:10:01.554	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1xxc3ea800479da2c10	TN2CA48A57	Katherine	Garza	tenant14_1763601001557_9642@test.local	+19088641101	Canada	Ontario	CA	ON	1994-07-29 06:43:34.505	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459933_42r6792tu	t	\N	America/New_York	2025-11-20 01:10:01.557	2025-11-20 01:10:01.557	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1xy0a43b1d13b901366	TNDB8D6E61	William	Owens	tenant15_1763601001558_7691@test.local	+18272238293	Canada	Ontario	CA	ON	1981-11-15 21:19:25.491	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459933_42r6792tu	t	\N	America/New_York	2025-11-20 01:10:01.558	2025-11-20 01:10:01.558	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1y0c033f6ead0d9fa43	TN3569C36B	Brian	Gross	tenant16_1763601001560_1831@test.local	+14002538130	Canada	Ontario	CA	ON	1993-10-12 19:01:03.912	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459933_42r6792tu	t	\N	America/New_York	2025-11-20 01:10:01.56	2025-11-20 01:10:01.56	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1y1b8f80b7037892c40	TNB9FFC654	Cynthia	Schwartz	tenant17_1763601001561_3981@test.local	+12331716842	Canada	Ontario	CA	ON	1957-03-26 09:19:50.9	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459933_42r6792tu	t	\N	America/New_York	2025-11-20 01:10:01.561	2025-11-20 01:10:01.561	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1y39c1eb988a1e5e5e4	TNE24C211B	Carl	Ortega	tenant18_1763601001563_8677@test.local	+16593095273	Canada	Ontario	CA	ON	1998-07-10 04:47:51.271	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459933_42r6792tu	t	\N	America/New_York	2025-11-20 01:10:01.563	2025-11-20 01:10:01.563	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1y4a49413b9b22f2472	TN7FB87344	Theresa	Copeland	tenant19_1763601001564_8401@test.local	+18657139289	Canada	Ontario	CA	ON	1994-03-11 20:20:01.884	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459933_42r6792tu	t	\N	America/New_York	2025-11-20 01:10:01.564	2025-11-20 01:10:01.564	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1y529f7b0124c85e840	TNB61F7AEF	Sharon	Snyder	tenant20_1763601001565_86@test.local	+16125826897	Canada	Ontario	CA	ON	1967-07-13 19:29:49.571	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459933_42r6792tu	t	\N	America/New_York	2025-11-20 01:10:01.566	2025-11-20 01:10:01.566	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1y60e481aac0c0af932	TN27DC5C69	Russell	Delgado	tenant21_1763601001566_1343@test.local	+19652905769	Canada	Ontario	CA	ON	1992-10-15 20:16:13.799	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459933_42r6792tu	t	\N	America/New_York	2025-11-20 01:10:01.566	2025-11-20 01:10:01.566	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1y8208a0b3c2f6bffe8	TN9F970717	Carl	Carter	tenant22_1763601001568_9628@test.local	+14062460638	Canada	Ontario	CA	ON	1953-05-11 01:44:17.19	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459933_42r6792tu	t	\N	America/New_York	2025-11-20 01:10:01.568	2025-11-20 01:10:01.568	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1y9ad32e984eebc5106	TN1CBB96B4	Frances	Copeland	tenant23_1763601001569_4519@test.local	+16322834733	Canada	Ontario	CA	ON	1982-06-15 22:42:52.702	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459933_42r6792tu	t	\N	America/New_York	2025-11-20 01:10:01.569	2025-11-20 01:10:01.569	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1ya154f8ac0e984b9f7	TN1005703D	Megan	Phillips	tenant24_1763601001570_4888@test.local	+14268805427	Canada	Ontario	CA	ON	1949-03-08 06:31:12.327	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459945_nr6ussfrj	t	\N	America/New_York	2025-11-20 01:10:01.57	2025-11-20 01:10:01.57	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1yc8c0547b8fd85eccf	TN7F08ED86	Diane	Mason	tenant25_1763601001572_281@test.local	+19249175139	Canada	Ontario	CA	ON	1981-05-17 18:19:07.548	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459945_nr6ussfrj	t	\N	America/New_York	2025-11-20 01:10:01.572	2025-11-20 01:10:01.572	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1yd59d30d39e065628b	TNC67DA9D5	Kathleen	Fisher	tenant26_1763601001573_8164@test.local	+18183025945	Canada	Ontario	CA	ON	2001-05-10 04:19:39.886	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459945_nr6ussfrj	t	\N	America/New_York	2025-11-20 01:10:01.573	2025-11-20 01:10:01.573	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1yg551a328e88247f24	TN67DE6DD3	Patrick	Osborne	tenant27_1763601001576_8275@test.local	+13963007138	Canada	Ontario	CA	ON	1960-04-19 12:40:27.399	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459945_nr6ussfrj	t	\N	America/New_York	2025-11-20 01:10:01.576	2025-11-20 01:10:01.576	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1yhfdd43314199d5b81	TN130FE986	Ashley	Thompson	tenant28_1763601001577_7587@test.local	+18542592834	Canada	Ontario	CA	ON	1957-08-22 01:07:02.864	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459945_nr6ussfrj	t	\N	America/New_York	2025-11-20 01:10:01.577	2025-11-20 01:10:01.577	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1yk9437251716bdf525	TN0C52F171	Mary	Sandoval	tenant29_1763601001580_2196@test.local	+18419481796	Canada	Ontario	CA	ON	1999-06-17 05:00:23.199	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459945_nr6ussfrj	t	\N	America/New_York	2025-11-20 01:10:01.58	2025-11-20 01:10:01.58	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1ylfa11e94f1fc69c48	TN00DA9F4A	Ronald	Johnston	tenant30_1763601001581_3057@test.local	+11142301823	Canada	Ontario	CA	ON	1996-02-26 23:22:32.542	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459945_nr6ussfrj	t	\N	America/New_York	2025-11-20 01:10:01.581	2025-11-20 01:10:01.581	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1yqaae714e966b0ef58	TN176F11F9	Anthony	Vazquez	tenant31_1763601001586_3248@test.local	+16206070047	Canada	Ontario	CA	ON	1988-02-29 20:47:25.374	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459945_nr6ussfrj	t	\N	America/New_York	2025-11-20 01:10:01.586	2025-11-20 01:10:01.586	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1yta070c408648be6a5	TN213F8909	Marie	Doyle	tenant32_1763601001589_750@test.local	+19418501043	Canada	Ontario	CA	ON	1983-01-04 03:16:38.384	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459945_nr6ussfrj	t	\N	America/New_York	2025-11-20 01:10:01.589	2025-11-20 01:10:01.589	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1yu950420c3e992ac9d	TN7C7248FC	Madison	Cook	tenant33_1763601001590_9560@test.local	+15333516698	Canada	Ontario	CA	ON	1970-06-27 13:29:13.473	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459945_nr6ussfrj	t	\N	America/New_York	2025-11-20 01:10:01.59	2025-11-20 01:10:01.59	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1yv0c6a636b466b6dfd	TNF961B753	Walter	Ruiz	tenant34_1763601001591_3264@test.local	+15162926470	Canada	Ontario	CA	ON	1972-11-28 23:25:03.482	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459945_nr6ussfrj	t	\N	America/New_York	2025-11-20 01:10:01.591	2025-11-20 01:10:01.591	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1yw0fdd12783cf20656	TNF1E9F4C2	Alexis	Pittman	tenant35_1763601001592_7478@test.local	+19372765683	Canada	Ontario	CA	ON	1960-10-31 12:17:46.874	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459945_nr6ussfrj	t	\N	America/New_York	2025-11-20 01:10:01.592	2025-11-20 01:10:01.592	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1yxb0ed522bdc1b368e	TN8C5C8143	Olivia	Nunez	tenant36_1763601001593_6480@test.local	+19855451712	Canada	Ontario	CA	ON	1970-08-27 06:28:46.576	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459945_nr6ussfrj	t	\N	America/New_York	2025-11-20 01:10:01.593	2025-11-20 01:10:01.593	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1yxc35716007dae9084	TNBEBF0C24	Patrick	Holloway	tenant37_1763601001593_113@test.local	+18466556475	Canada	Ontario	CA	ON	2006-12-18 11:53:11.427	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459945_nr6ussfrj	t	\N	America/New_York	2025-11-20 01:10:01.593	2025-11-20 01:10:01.593	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1z0591b9e7e42c21672	TNF693C89C	Joyce	Brady	tenant38_1763601001596_8275@test.local	+13915459829	Canada	Ontario	CA	ON	1993-12-25 17:21:44.278	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459945_nr6ussfrj	t	\N	America/New_York	2025-11-20 01:10:01.596	2025-11-20 01:10:01.596	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1z0a225165d77160f67	TN1359EEBF	Gerald	Doyle	tenant39_1763601001596_9360@test.local	+11435280023	Canada	Ontario	CA	ON	1983-03-26 05:44:05.26	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459945_nr6ussfrj	t	\N	America/New_York	2025-11-20 01:10:01.596	2025-11-20 01:10:01.596	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1z2c93560a099f67323	TN9CEC5FA3	Adam	Gibbs	tenant40_1763601001598_9910@test.local	+12917030006	Canada	Ontario	CA	ON	1981-04-12 12:23:59.347	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459948_8k66k9kb4	t	\N	America/New_York	2025-11-20 01:10:01.598	2025-11-20 01:10:01.598	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1z2cd933535cac16648	TN97894E16	Victoria	Perry	tenant41_1763601001598_7033@test.local	+13249959880	Canada	Ontario	CA	ON	1957-05-18 19:50:41.933	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459948_8k66k9kb4	t	\N	America/New_York	2025-11-20 01:10:01.598	2025-11-20 01:10:01.598	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1z48e2521561c6b5144	TNF120FC8A	Megan	Murphy	tenant42_1763601001600_1628@test.local	+19243792914	Canada	Ontario	CA	ON	1974-06-24 03:14:07.711	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459948_8k66k9kb4	t	\N	America/New_York	2025-11-20 01:10:01.6	2025-11-20 01:10:01.6	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1z5f80a816a6d6fa90f	TN30FCFFDE	Deborah	Sherman	tenant43_1763601001601_5244@test.local	+15211652130	Canada	Ontario	CA	ON	2004-02-02 15:50:23.886	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459948_8k66k9kb4	t	\N	America/New_York	2025-11-20 01:10:01.601	2025-11-20 01:10:01.601	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1z72cb5fae8e75c3762	TNB89F2EEF	Samuel	Wise	tenant44_1763601001603_1180@test.local	+11374072308	Canada	Ontario	CA	ON	1953-12-03 00:13:10.44	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459948_8k66k9kb4	t	\N	America/New_York	2025-11-20 01:10:01.603	2025-11-20 01:10:01.603	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1z848a11449b5dd58c6	TNB7E0F052	Kenneth	Stokes	tenant45_1763601001603_3299@test.local	+18051116982	Canada	Ontario	CA	ON	1975-09-27 01:33:17.651	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459948_8k66k9kb4	t	\N	America/New_York	2025-11-20 01:10:01.604	2025-11-20 01:10:01.604	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1z9af7a4ba8b173bd06	TN79F7DB2A	Brandon	Woods	tenant46_1763601001605_7841@test.local	+12983403276	Canada	Ontario	CA	ON	1979-06-28 07:51:48.673	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459948_8k66k9kb4	t	\N	America/New_York	2025-11-20 01:10:01.605	2025-11-20 01:10:01.605	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1za94d2c7f2509a14ee	TN89B2312B	Christian	Contreras	tenant47_1763601001606_2134@test.local	+11027503250	Canada	Ontario	CA	ON	1975-02-04 11:44:03.938	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459948_8k66k9kb4	t	\N	America/New_York	2025-11-20 01:10:01.606	2025-11-20 01:10:01.606	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1zbe035cc949c60fa93	TN4C4902FB	Catherine	Ryan	tenant48_1763601001607_3738@test.local	+19582887851	Canada	Ontario	CA	ON	1955-03-12 12:41:31.157	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459948_8k66k9kb4	t	\N	America/New_York	2025-11-20 01:10:01.607	2025-11-20 01:10:01.607	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1zc2a4978b74c1e4761	TN9112547B	Stephen	Carroll	tenant49_1763601001608_9162@test.local	+17578547298	Canada	Ontario	CA	ON	1952-05-31 16:53:59.485	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459948_8k66k9kb4	t	\N	America/New_York	2025-11-20 01:10:01.608	2025-11-20 01:10:01.608	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1zd2edf68d04dab2f73	TNEFC3E87E	Charles	Gordon	tenant50_1763601001609_2602@test.local	+13531021461	Canada	Ontario	CA	ON	1969-01-27 04:16:38.884	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459948_8k66k9kb4	t	\N	America/New_York	2025-11-20 01:10:01.609	2025-11-20 01:10:01.609	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1ze4e31d5732965cc39	TNEFDE3C9F	Amy	Spencer	tenant51_1763601001610_4997@test.local	+17345360854	Canada	Ontario	CA	ON	1958-04-06 17:54:37.684	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459948_8k66k9kb4	t	\N	America/New_York	2025-11-20 01:10:01.61	2025-11-20 01:10:01.61	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1zf2dda8cf7deada3d0	TN8E0B7030	Frank	James	tenant52_1763601001611_3047@test.local	+13751949883	Canada	Ontario	CA	ON	2006-03-20 10:19:59.652	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459948_8k66k9kb4	t	\N	America/New_York	2025-11-20 01:10:01.611	2025-11-20 01:10:01.611	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1zha703461ee31261cb	TNABF2D29D	Grace	Carroll	tenant53_1763601001613_286@test.local	+18044546062	Canada	Ontario	CA	ON	1970-10-15 12:18:02.792	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459948_8k66k9kb4	t	\N	America/New_York	2025-11-20 01:10:01.613	2025-11-20 01:10:01.613	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1zifc308756f33a91dd	TNE258F8CD	Bobby	Morgan	tenant54_1763601001614_5945@test.local	+17378004584	Canada	Ontario	CA	ON	1994-10-05 06:49:31.692	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459948_8k66k9kb4	t	\N	America/New_York	2025-11-20 01:10:01.614	2025-11-20 01:10:01.614	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1zjbb54252b69bc7826	TNE72C3BB9	Lori	Powell	tenant55_1763601001615_8432@test.local	+19087998272	Canada	Ontario	CA	ON	1962-01-03 05:57:06.321	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459948_8k66k9kb4	t	\N	America/New_York	2025-11-20 01:10:01.615	2025-11-20 01:10:01.615	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1zk661f54ae3a40d3b8	TN28945B30	Nicole	Young	tenant56_1763601001616_1065@test.local	+16719623336	Canada	Ontario	CA	ON	1990-10-20 10:21:19.516	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459948_8k66k9kb4	t	\N	America/New_York	2025-11-20 01:10:01.616	2025-11-20 01:10:01.616	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1zl0b5c4536dd690c1c	TND503B515	Bruce	Peters	tenant57_1763601001617_4147@test.local	+13709657443	Canada	Ontario	CA	ON	2004-07-21 12:32:42.409	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459948_8k66k9kb4	t	\N	America/New_York	2025-11-20 01:10:01.617	2025-11-20 01:10:01.617	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1zm17c8a313002605b7	TN1C38FDCF	Amber	Stevens	tenant58_1763601001618_637@test.local	+11727003370	Canada	Ontario	CA	ON	1994-12-02 16:56:49.173	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459948_8k66k9kb4	t	\N	America/New_York	2025-11-20 01:10:01.618	2025-11-20 01:10:01.618	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1zo616cdb4bebdb3a8c	TND45E65CD	Bruce	Wood	tenant59_1763601001620_7197@test.local	+11619941511	Canada	Ontario	CA	ON	1998-07-14 03:41:12.603	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459950_2ud9maowk	t	\N	America/New_York	2025-11-20 01:10:01.62	2025-11-20 01:10:01.62	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1zp2ef363bc4cd6d499	TN8917930C	Nancy	Parsons	tenant60_1763601001621_1900@test.local	+18992324034	Canada	Ontario	CA	ON	1954-09-08 22:20:19.618	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459950_2ud9maowk	t	\N	America/New_York	2025-11-20 01:10:01.621	2025-11-20 01:10:01.621	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1zr1d3ba147cd453dd1	TN55610F23	Cheryl	Bell	tenant61_1763601001623_6484@test.local	+17151013148	Canada	Ontario	CA	ON	1971-10-08 13:59:53.861	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459950_2ud9maowk	t	\N	America/New_York	2025-11-20 01:10:01.623	2025-11-20 01:10:01.623	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1zrdb89ad8a9d65dcb8	TN684BB785	Noah	Ruiz	tenant62_1763601001623_282@test.local	+12049780761	Canada	Ontario	CA	ON	1992-04-27 18:12:22.08	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459950_2ud9maowk	t	\N	America/New_York	2025-11-20 01:10:01.623	2025-11-20 01:10:01.623	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1ztc739d7790df42ff0	TNEEDC004C	Logan	Holloway	tenant63_1763601001625_7539@test.local	+14327452698	Canada	Ontario	CA	ON	1975-04-16 14:53:34.614	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459950_2ud9maowk	t	\N	America/New_York	2025-11-20 01:10:01.625	2025-11-20 01:10:01.625	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1zu34ee3f1036173b53	TN8BFC897B	Christina	Sherman	tenant64_1763601001625_6935@test.local	+14757352833	Canada	Ontario	CA	ON	1951-01-07 07:40:53.838	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459950_2ud9maowk	t	\N	America/New_York	2025-11-20 01:10:01.626	2025-11-20 01:10:01.626	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1zvda64f0f0dea7987a	TNBE1F860D	Madison	Holloway	tenant65_1763601001627_8454@test.local	+12179699995	Canada	Ontario	CA	ON	1980-02-08 06:45:35.634	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459950_2ud9maowk	t	\N	America/New_York	2025-11-20 01:10:01.627	2025-11-20 01:10:01.627	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1zwf74fe5ebf4e79c81	TN00991CAC	Nathan	Mcbride	tenant66_1763601001628_2257@test.local	+17947392248	Canada	Ontario	CA	ON	1990-02-26 11:23:10.173	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459950_2ud9maowk	t	\N	America/New_York	2025-11-20 01:10:01.628	2025-11-20 01:10:01.628	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1zyc4c54f4397d069f7	TNECE4005D	Randy	Klein	tenant67_1763601001629_9443@test.local	+16333100387	Canada	Ontario	CA	ON	1956-02-06 04:46:02.988	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459950_2ud9maowk	t	\N	America/New_York	2025-11-20 01:10:01.63	2025-11-20 01:10:01.63	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi1zy10b328fa98de1d97	TN3A089101	Joseph	Crawford	tenant68_1763601001630_4327@test.local	+18183803989	Canada	Ontario	CA	ON	1950-05-22 00:03:59.928	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459950_2ud9maowk	t	\N	America/New_York	2025-11-20 01:10:01.63	2025-11-20 01:10:01.63	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi2000e681fc487d1d06f	TN91D33DC3	Marie	Black	tenant69_1763601001632_731@test.local	+18917616490	Canada	Ontario	CA	ON	1947-10-02 17:15:30.811	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459950_2ud9maowk	t	\N	America/New_York	2025-11-20 01:10:01.632	2025-11-20 01:10:01.632	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi200b9135e898a216f0a	TN9FDFCC11	Kyle	Hudson	tenant70_1763601001632_5979@test.local	+17989396120	Canada	Ontario	CA	ON	1990-07-21 06:46:23.269	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459950_2ud9maowk	t	\N	America/New_York	2025-11-20 01:10:01.632	2025-11-20 01:10:01.632	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi20132a72337f37c4ed5	TN73693B1E	Jacob	Silva	tenant71_1763601001633_1132@test.local	+14964024682	Canada	Ontario	CA	ON	2000-12-17 08:03:01.953	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459950_2ud9maowk	t	\N	America/New_York	2025-11-20 01:10:01.633	2025-11-20 01:10:01.633	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi203197ef653037dc43e	TNFB2A37BD	Danielle	Johnston	tenant72_1763601001635_6530@test.local	+14204035035	Canada	Ontario	CA	ON	1949-07-02 17:37:47.99	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459950_2ud9maowk	t	\N	America/New_York	2025-11-20 01:10:01.635	2025-11-20 01:10:01.635	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi203aabf3ef8dfb10f8a	TN5CA8787A	Sara	Stewart	tenant73_1763601001635_6448@test.local	+16557939088	Canada	Ontario	CA	ON	1998-03-08 11:40:21.149	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459950_2ud9maowk	t	\N	America/New_York	2025-11-20 01:10:01.635	2025-11-20 01:10:01.635	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi20538d284d448507bb8	TNA62F0E25	Edward	Moran	tenant74_1763601001637_7190@test.local	+11857550504	Canada	Ontario	CA	ON	1974-09-13 22:11:51.817	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459951_xaidopicm	t	\N	America/New_York	2025-11-20 01:10:01.637	2025-11-20 01:10:01.637	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi205cc3dacd0f16c6c58	TN5B794C0C	William	Lawrence	tenant75_1763601001637_6290@test.local	+11303103141	Canada	Ontario	CA	ON	1976-12-30 01:59:54.725	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459951_xaidopicm	t	\N	America/New_York	2025-11-20 01:10:01.637	2025-11-20 01:10:01.637	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi206cb6929175dbb4c50	TN58AF0319	Carolyn	Floyd	tenant76_1763601001638_9917@test.local	+16134441489	Canada	Ontario	CA	ON	2002-05-05 22:04:00.275	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459951_xaidopicm	t	\N	America/New_York	2025-11-20 01:10:01.638	2025-11-20 01:10:01.638	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi207c285a66169a5d608	TN3BFB1751	Jose	Kennedy	tenant77_1763601001639_9196@test.local	+14665385547	Canada	Ontario	CA	ON	1985-04-23 02:43:57.012	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459951_xaidopicm	t	\N	America/New_York	2025-11-20 01:10:01.639	2025-11-20 01:10:01.639	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi2080f6cf7e4f7e5fcb2	TN0B82EFB3	Maria	Stone	tenant78_1763601001640_1367@test.local	+12425230952	Canada	Ontario	CA	ON	1952-07-22 06:17:04.198	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459951_xaidopicm	t	\N	America/New_York	2025-11-20 01:10:01.64	2025-11-20 01:10:01.64	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi20af77c923b3e5e59fb	TNF3A91316	Denise	Dunn	tenant79_1763601001642_1508@test.local	+16708383555	Canada	Ontario	CA	ON	1972-04-06 01:57:09.877	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459951_xaidopicm	t	\N	America/New_York	2025-11-20 01:10:01.642	2025-11-20 01:10:01.642	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi20af5fccab774bd2537	TNA74D6DF4	Tyler	Hodges	tenant80_1763601001642_3387@test.local	+13038895314	Canada	Ontario	CA	ON	1995-04-14 04:10:47.235	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459951_xaidopicm	t	\N	America/New_York	2025-11-20 01:10:01.642	2025-11-20 01:10:01.642	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi20b4d0493a1f7eafbed	TNE264348E	Amanda	Wallace	tenant81_1763601001643_6971@test.local	+19619655010	Canada	Ontario	CA	ON	2002-03-16 11:19:31.242	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459951_xaidopicm	t	\N	America/New_York	2025-11-20 01:10:01.643	2025-11-20 01:10:01.643	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi20dee81612e7065cf2b	TN1FB7440C	Deborah	Wise	tenant82_1763601001645_2130@test.local	+13672807517	Canada	Ontario	CA	ON	1977-05-03 07:26:26.284	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459951_xaidopicm	t	\N	America/New_York	2025-11-20 01:10:01.645	2025-11-20 01:10:01.645	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi20eb04ff0c9810dfb14	TN56D06493	Logan	Medina	tenant83_1763601001646_3112@test.local	+18101340400	Canada	Ontario	CA	ON	1976-11-02 07:42:15.446	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459951_xaidopicm	t	\N	America/New_York	2025-11-20 01:10:01.646	2025-11-20 01:10:01.646	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi20f3e8e1120034417c6	TN2ECE849E	Christina	Pittman	tenant84_1763601001647_3944@test.local	+14438770244	Canada	Ontario	CA	ON	1992-12-29 18:26:19.777	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459951_xaidopicm	t	\N	America/New_York	2025-11-20 01:10:01.647	2025-11-20 01:10:01.647	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi20g02feeb55d33b8a8d	TN4713A363	David	Gonzales	tenant85_1763601001648_2257@test.local	+14435150674	Canada	Ontario	CA	ON	1972-12-07 07:36:54.498	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459951_xaidopicm	t	\N	America/New_York	2025-11-20 01:10:01.648	2025-11-20 01:10:01.648	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi20hb0a36f7769673ce6	TN27062768	Dylan	Roy	tenant86_1763601001649_9062@test.local	+11147862670	Canada	Ontario	CA	ON	1986-11-06 00:22:58.014	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459951_xaidopicm	t	\N	America/New_York	2025-11-20 01:10:01.649	2025-11-20 01:10:01.649	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi20if95e6d3833995403	TN90C5B5F2	Diane	Ortiz	tenant87_1763601001650_9156@test.local	+13535792172	Canada	Ontario	CA	ON	1981-05-06 23:26:22.623	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459951_xaidopicm	t	\N	America/New_York	2025-11-20 01:10:01.65	2025-11-20 01:10:01.65	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi20k39704cceb0d324fa	TN13F650B5	Kelly	Cook	tenant88_1763601001652_1881@test.local	+12426250105	Canada	Ontario	CA	ON	1962-02-24 06:26:44.183	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459953_9k0mhiks4	t	\N	America/New_York	2025-11-20 01:10:01.652	2025-11-20 01:10:01.652	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi20l6461d6ab8ed9315a	TN67BF5BEF	Juan	Barnes	tenant89_1763601001653_2748@test.local	+11803017715	Canada	Ontario	CA	ON	1983-02-03 10:58:42.329	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459953_9k0mhiks4	t	\N	America/New_York	2025-11-20 01:10:01.653	2025-11-20 01:10:01.653	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi20n4a309f15c0f41d3e	TN8D7830C6	Joyce	Colon	tenant90_1763601001655_7552@test.local	+17626883375	Canada	Ontario	CA	ON	1988-06-11 10:55:53.024	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459953_9k0mhiks4	t	\N	America/New_York	2025-11-20 01:10:01.655	2025-11-20 01:10:01.655	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi20o5e0ac269e18e7a96	TN919A2A02	Joseph	Edwards	tenant91_1763601001656_650@test.local	+13537264527	Canada	Ontario	CA	ON	1992-11-03 03:03:12.034	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459953_9k0mhiks4	t	\N	America/New_York	2025-11-20 01:10:01.656	2025-11-20 01:10:01.656	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi20pca10167ce28ae6df	TN07CEF820	Louis	Salazar	tenant92_1763601001657_29@test.local	+12532398790	Canada	Ontario	CA	ON	1992-10-21 01:28:54.587	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459953_9k0mhiks4	t	\N	America/New_York	2025-11-20 01:10:01.657	2025-11-20 01:10:01.657	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi20q5304abaeb50e5cf6	TN8C8C55AC	Michelle	Zimmerman	tenant93_1763601001658_2201@test.local	+16897117183	Canada	Ontario	CA	ON	1995-12-13 05:45:22.904	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459953_9k0mhiks4	t	\N	America/New_York	2025-11-20 01:10:01.658	2025-11-20 01:10:01.658	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi20sebbb9a45b4380420	TN013AE0ED	Andrew	Richards	tenant94_1763601001660_1754@test.local	+12285843918	Canada	Ontario	CA	ON	1988-12-17 02:49:30.418	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459953_9k0mhiks4	t	\N	America/New_York	2025-11-20 01:10:01.66	2025-11-20 01:10:01.66	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi20sd333ffe8353fc193	TNEDC01BBA	Jordan	Roy	tenant95_1763601001660_7536@test.local	+18163766480	Canada	Ontario	CA	ON	1968-02-24 19:10:07.134	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459953_9k0mhiks4	t	\N	America/New_York	2025-11-20 01:10:01.66	2025-11-20 01:10:01.66	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi20v11a3a61f1905a351	TN7B870EC2	William	Watkins	tenant96_1763601001663_5857@test.local	+16767092968	Canada	Ontario	CA	ON	1966-01-07 07:30:57.306	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459953_9k0mhiks4	t	\N	America/New_York	2025-11-20 01:10:01.663	2025-11-20 01:10:01.663	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi20vc88bdc64057b14a4	TN85324918	Laura	Lane	tenant97_1763601001663_2884@test.local	+18788587309	Canada	Ontario	CA	ON	1995-12-09 11:56:51.203	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459953_9k0mhiks4	t	\N	America/New_York	2025-11-20 01:10:01.663	2025-11-20 01:10:01.663	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi20xeb653d0cc0e108a6	TN6024764D	George	Hall	tenant98_1763601001665_8646@test.local	+11459148626	Canada	Ontario	CA	ON	1984-06-18 03:58:37.29	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459953_9k0mhiks4	t	\N	America/New_York	2025-11-20 01:10:01.665	2025-11-20 01:10:01.665	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi20x5d54f346ab5537c2	TN73768012	Judith	Anderson	tenant99_1763601001665_7002@test.local	+12047525903	Canada	Ontario	CA	ON	2005-01-20 01:30:30.907	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459953_9k0mhiks4	t	\N	America/New_York	2025-11-20 01:10:01.665	2025-11-20 01:10:01.665	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi20zba38b1b99d84e557	TNA5235412	Russell	Copeland	tenant100_1763601001667_648@test.local	+11498725366	Canada	Ontario	CA	ON	1957-02-07 00:48:56.721	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459956_x6v0haalr	t	\N	America/New_York	2025-11-20 01:10:01.667	2025-11-20 01:10:01.667	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi2106a7b5f24ce32af71	TNEBDBE067	Jennifer	Patel	tenant101_1763601001668_4290@test.local	+12267669718	Canada	Ontario	CA	ON	1964-10-11 23:33:12.382	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459956_x6v0haalr	t	\N	America/New_York	2025-11-20 01:10:01.668	2025-11-20 01:10:01.668	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi210baaf1e3ab8644c71	TN15779234	George	Osborne	tenant102_1763601001668_3543@test.local	+19929590739	Canada	Ontario	CA	ON	2002-01-08 03:10:36.494	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459956_x6v0haalr	t	\N	America/New_York	2025-11-20 01:10:01.668	2025-11-20 01:10:01.668	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi213ec5302a89fc93290	TN4C3D5E7A	Austin	Pittman	tenant103_1763601001671_9982@test.local	+11046192457	Canada	Ontario	CA	ON	1974-12-18 01:39:04.7	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459956_x6v0haalr	t	\N	America/New_York	2025-11-20 01:10:01.671	2025-11-20 01:10:01.671	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi213554c023331510204	TN8B2D1E93	Patricia	Day	tenant104_1763601001671_4096@test.local	+11963866855	Canada	Ontario	CA	ON	1963-09-30 11:47:29.909	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459956_x6v0haalr	t	\N	America/New_York	2025-11-20 01:10:01.671	2025-11-20 01:10:01.671	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi2157306431726e2c41f	TNC1785BE7	Lisa	Brown	tenant105_1763601001673_9556@test.local	+15636140265	Canada	Ontario	CA	ON	2000-03-20 13:01:00.302	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459956_x6v0haalr	t	\N	America/New_York	2025-11-20 01:10:01.673	2025-11-20 01:10:01.673	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi215fb4b10002f5a2715	TNCF3065CF	Gary	Gonzales	tenant106_1763601001673_5446@test.local	+19795182293	Canada	Ontario	CA	ON	2000-03-23 21:06:32.46	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459956_x6v0haalr	t	\N	America/New_York	2025-11-20 01:10:01.673	2025-11-20 01:10:01.673	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi2172ba1e58f8c3a1491	TNB131100C	Anna	Hansen	tenant107_1763601001675_3813@test.local	+18401763350	Canada	Ontario	CA	ON	1976-08-15 13:18:30.255	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459956_x6v0haalr	t	\N	America/New_York	2025-11-20 01:10:01.675	2025-11-20 01:10:01.675	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi218f62e3f75e6776818	TN9F5260BC	Alexander	Collins	tenant108_1763601001676_4124@test.local	+19862884474	Canada	Ontario	CA	ON	1959-04-02 00:49:41.461	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459956_x6v0haalr	t	\N	America/New_York	2025-11-20 01:10:01.676	2025-11-20 01:10:01.676	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi21a998371106b26d1d7	TNE9E41D8F	Nancy	Copeland	tenant109_1763601001678_9915@test.local	+13199662957	Canada	Ontario	CA	ON	1994-02-27 15:13:51.449	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459956_x6v0haalr	t	\N	America/New_York	2025-11-20 01:10:01.678	2025-11-20 01:10:01.678	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi21b759c32961d5aa970	TN91C65FA9	Marilyn	Doyle	tenant110_1763601001679_1710@test.local	+15702548928	Canada	Ontario	CA	ON	2002-09-28 03:49:58.381	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459956_x6v0haalr	t	\N	America/New_York	2025-11-20 01:10:01.679	2025-11-20 01:10:01.679	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi21d67f225b30d16b11f	TN3514005C	Kimberly	Kelly	tenant111_1763601001681_37@test.local	+17051333168	Canada	Ontario	CA	ON	1981-05-06 19:51:04.801	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459958_gztj01xmk	t	\N	America/New_York	2025-11-20 01:10:01.681	2025-11-20 01:10:01.681	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi21db3c3135f372736ac	TND9114BB9	Andrea	Moran	tenant112_1763601001681_7774@test.local	+12526012031	Canada	Ontario	CA	ON	1948-11-19 13:12:38.71	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459958_gztj01xmk	t	\N	America/New_York	2025-11-20 01:10:01.681	2025-11-20 01:10:01.681	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi21e8dae6f9fe4f2e4e8	TNAE02CC21	Steven	Stokes	tenant113_1763601001682_847@test.local	+18699842764	Canada	Ontario	CA	ON	2007-01-27 18:43:35.623	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459958_gztj01xmk	t	\N	America/New_York	2025-11-20 01:10:01.682	2025-11-20 01:10:01.682	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi21ze68e5e00a246dc75	TNFF9D3701	Steven	Aguilar	tenant114_1763601001703_8200@test.local	+14284155866	Canada	Ontario	CA	ON	1999-02-08 17:18:11.175	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459958_gztj01xmk	t	\N	America/New_York	2025-11-20 01:10:01.703	2025-11-20 01:10:01.703	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi220540711fd5a2952b9	TN810242E7	Carol	Simmons	tenant115_1763601001704_8596@test.local	+13163626272	Canada	Ontario	CA	ON	1948-04-01 08:06:24.007	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459958_gztj01xmk	t	\N	America/New_York	2025-11-20 01:10:01.704	2025-11-20 01:10:01.704	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi221d7858a66cd8e9029	TNA177CCAD	Maria	Vargas	tenant116_1763601001705_1954@test.local	+14225538229	Canada	Ontario	CA	ON	1979-11-25 22:54:48.964	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459958_gztj01xmk	t	\N	America/New_York	2025-11-20 01:10:01.705	2025-11-20 01:10:01.705	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi2210d7c3dc4ea6857c7	TN6D09713A	Marilyn	Bowman	tenant117_1763601001705_704@test.local	+12523523145	Canada	Ontario	CA	ON	1977-04-22 08:51:52.372	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459958_gztj01xmk	t	\N	America/New_York	2025-11-20 01:10:01.705	2025-11-20 01:10:01.705	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi223d7b7f4436f896abc	TNF0E5C03D	Susan	Lane	tenant118_1763601001707_3899@test.local	+13595391192	Canada	Ontario	CA	ON	1952-03-10 05:10:40.149	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459958_gztj01xmk	t	\N	America/New_York	2025-11-20 01:10:01.707	2025-11-20 01:10:01.707	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi223a474ddf722fbe340	TN51FB8C6F	Christopher	Santos	tenant119_1763601001707_6616@test.local	+17304826153	Canada	Ontario	CA	ON	1950-03-28 01:09:25.515	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459958_gztj01xmk	t	\N	America/New_York	2025-11-20 01:10:01.707	2025-11-20 01:10:01.707	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi22411e6dcaad6c48283	TN14D37AC5	Samuel	Watkins	tenant120_1763601001708_9780@test.local	+18404968973	Canada	Ontario	CA	ON	2004-12-30 15:40:39.56	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459958_gztj01xmk	t	\N	America/New_York	2025-11-20 01:10:01.708	2025-11-20 01:10:01.708	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi226262ac6895a500b95	TNFEBB83A3	Judith	Holmes	tenant121_1763601001710_3363@test.local	+17295054649	Canada	Ontario	CA	ON	2004-03-23 05:09:32.399	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459958_gztj01xmk	t	\N	America/New_York	2025-11-20 01:10:01.71	2025-11-20 01:10:01.71	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi226925902509e621a75	TNE9E34F38	Jose	Richardson	tenant122_1763601001710_9098@test.local	+11194048341	Canada	Ontario	CA	ON	2006-03-14 11:12:52.007	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459958_gztj01xmk	t	\N	America/New_York	2025-11-20 01:10:01.71	2025-11-20 01:10:01.71	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi227fcbbe29323fe735c	TN7C2DD650	Debra	Armstrong	tenant123_1763601001711_5948@test.local	+17511129507	Canada	Ontario	CA	ON	2007-07-31 20:11:46.158	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459958_gztj01xmk	t	\N	America/New_York	2025-11-20 01:10:01.711	2025-11-20 01:10:01.711	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi228bfc894b9354acdfc	TNEA43D1EF	Jessica	Mcbride	tenant124_1763601001712_7151@test.local	+16195310187	Canada	Ontario	CA	ON	1979-01-23 19:39:05.686	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459958_gztj01xmk	t	\N	America/New_York	2025-11-20 01:10:01.712	2025-11-20 01:10:01.712	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi2292821f5b5ca2d6aab	TNE73D8B89	Christopher	Burns	tenant125_1763601001713_2477@test.local	+15278010366	Canada	Ontario	CA	ON	1955-10-29 00:13:06.177	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459958_gztj01xmk	t	\N	America/New_York	2025-11-20 01:10:01.713	2025-11-20 01:10:01.713	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi22a919feebaa44b3529	TN595FC70D	Marie	Briggs	tenant126_1763601001714_108@test.local	+15779291747	Canada	Ontario	CA	ON	1976-06-06 12:29:03.935	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459958_gztj01xmk	t	\N	America/New_York	2025-11-20 01:10:01.714	2025-11-20 01:10:01.714	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi22be4d04bc2aa8314c2	TN1BC71FD3	Nathan	George	tenant127_1763601001715_8888@test.local	+11758040429	Canada	Ontario	CA	ON	1994-07-20 18:54:10.944	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459958_gztj01xmk	t	\N	America/New_York	2025-11-20 01:10:01.715	2025-11-20 01:10:01.715	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi22c8912a8c446030041	TNEF242B18	Sharon	Powell	tenant128_1763601001716_3043@test.local	+15132092929	Canada	Ontario	CA	ON	1955-12-26 05:16:36.006	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459959_lz6ykg35f	t	\N	America/New_York	2025-11-20 01:10:01.716	2025-11-20 01:10:01.716	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi22d62d544389f37ee41	TN16575746	Stephanie	Shaw	tenant129_1763601001717_4119@test.local	+12552640429	Canada	Ontario	CA	ON	1969-02-08 20:50:43.913	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459959_lz6ykg35f	t	\N	America/New_York	2025-11-20 01:10:01.717	2025-11-20 01:10:01.717	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi22e64db5dc934e349d4	TNEE0CDCF4	Frank	Bell	tenant130_1763601001718_8341@test.local	+16859937072	Canada	Ontario	CA	ON	2000-12-03 13:38:53.947	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459959_lz6ykg35f	t	\N	America/New_York	2025-11-20 01:10:01.718	2025-11-20 01:10:01.718	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi22f192ec5d0d4cfcb03	TNE3B116A9	Jeffrey	Pierce	tenant131_1763601001719_5735@test.local	+17823230731	Canada	Ontario	CA	ON	1979-08-04 20:21:08.23	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459959_lz6ykg35f	t	\N	America/New_York	2025-11-20 01:10:01.719	2025-11-20 01:10:01.719	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi22h1c147348c1a37d4f	TNDFA5124A	Carolyn	Nguyen	tenant132_1763601001720_8324@test.local	+12927978093	Canada	Ontario	CA	ON	2007-08-01 18:22:05.869	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459959_lz6ykg35f	t	\N	America/New_York	2025-11-20 01:10:01.721	2025-11-20 01:10:01.721	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi22ha62db475d7c008da	TN77C2DB85	Anna	Ruiz	tenant133_1763601001721_2521@test.local	+11251747814	Canada	Ontario	CA	ON	1959-05-09 19:02:49.514	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459959_lz6ykg35f	t	\N	America/New_York	2025-11-20 01:10:01.721	2025-11-20 01:10:01.721	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi22j5edb7282c13e4e82	TNE39AF730	Stephanie	Evans	tenant134_1763601001723_934@test.local	+11073655318	Canada	Ontario	CA	ON	1966-06-30 04:41:19.315	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459959_lz6ykg35f	t	\N	America/New_York	2025-11-20 01:10:01.723	2025-11-20 01:10:01.723	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi22j2fcd7c2ae51b7505	TN1D844C34	Justin	Perry	tenant135_1763601001723_9623@test.local	+12125538708	Canada	Ontario	CA	ON	1955-02-13 19:16:03.21	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459959_lz6ykg35f	t	\N	America/New_York	2025-11-20 01:10:01.723	2025-11-20 01:10:01.723	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi22l059b0a2d5a262c0d	TNDAB29E47	Douglas	Sullivan	tenant136_1763601001725_2170@test.local	+12868252729	Canada	Ontario	CA	ON	1992-02-28 16:42:15.068	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459959_lz6ykg35f	t	\N	America/New_York	2025-11-20 01:10:01.725	2025-11-20 01:10:01.725	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi22l8119b8a976580a87	TNAEA6848C	Jose	Lane	tenant137_1763601001725_7968@test.local	+11087175334	Canada	Ontario	CA	ON	1948-04-19 17:19:51.607	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459959_lz6ykg35f	t	\N	America/New_York	2025-11-20 01:10:01.725	2025-11-20 01:10:01.725	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi22m1dbc20f22efa447f	TN5D4C6402	Jack	Moran	tenant138_1763601001726_9162@test.local	+11659359625	Canada	Ontario	CA	ON	2006-01-27 06:11:59.188	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459959_lz6ykg35f	t	\N	America/New_York	2025-11-20 01:10:01.726	2025-11-20 01:10:01.726	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi22o2241cb39e5d24bc6	TN5AB4235E	Benjamin	Thompson	tenant139_1763601001728_8603@test.local	+17837402273	Canada	Ontario	CA	ON	2002-10-25 02:41:29.605	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459959_lz6ykg35f	t	\N	America/New_York	2025-11-20 01:10:01.728	2025-11-20 01:10:01.728	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi22oec3bfbdcb965956a	TNBA7F00EC	Samantha	Tucker	tenant140_1763601001728_4319@test.local	+18419617216	Canada	Ontario	CA	ON	2002-09-14 09:15:11.3	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459959_lz6ykg35f	t	\N	America/New_York	2025-11-20 01:10:01.728	2025-11-20 01:10:01.728	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi22qbe9e48148fdb25c5	TN9C070884	Jeremy	Walker	tenant141_1763601001730_5826@test.local	+11264490570	Canada	Ontario	CA	ON	1972-01-08 01:27:05.381	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459959_lz6ykg35f	t	\N	America/New_York	2025-11-20 01:10:01.73	2025-11-20 01:10:01.73	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi22qe4fc49e757d40d91	TNEED8F85F	Walter	Roy	tenant142_1763601001730_8786@test.local	+19498046773	Canada	Ontario	CA	ON	1950-03-04 00:11:37.796	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459959_lz6ykg35f	t	\N	America/New_York	2025-11-20 01:10:01.73	2025-11-20 01:10:01.73	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi22s9732d7359a5f7575	TN994A1EA7	Keith	Ruiz	tenant143_1763601001732_2821@test.local	+18457756215	Canada	Ontario	CA	ON	1975-07-29 17:32:26.167	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459959_lz6ykg35f	t	\N	America/New_York	2025-11-20 01:10:01.732	2025-11-20 01:10:01.732	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi22tb29daba3a87c833c	TN76AC249B	Michelle	Houston	tenant144_1763601001733_371@test.local	+16193164521	Canada	Ontario	CA	ON	1956-01-09 23:04:40.837	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459959_lz6ykg35f	t	\N	America/New_York	2025-11-20 01:10:01.733	2025-11-20 01:10:01.733	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi22uf0486087cb319fca	TNA09A0EF2	Judith	Black	tenant145_1763601001734_7909@test.local	+15626261859	Canada	Ontario	CA	ON	1985-11-12 14:17:59.347	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459959_lz6ykg35f	t	\N	America/New_York	2025-11-20 01:10:01.734	2025-11-20 01:10:01.734	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi22ua2256f627a61f958	TN6B1AD20E	Frank	Robinson	tenant146_1763601001734_9557@test.local	+14049593724	Canada	Ontario	CA	ON	2001-10-05 22:51:12.846	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459959_lz6ykg35f	t	\N	America/New_York	2025-11-20 01:10:01.734	2025-11-20 01:10:01.734	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi22w18f832970db6c7f2	TN19078AA9	Larry	Moran	tenant147_1763601001736_7213@test.local	+13534291572	Canada	Ontario	CA	ON	1982-12-03 07:08:33.356	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459959_lz6ykg35f	t	\N	America/New_York	2025-11-20 01:10:01.736	2025-11-20 01:10:01.736	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi22wa6bf27365366375b	TN9BBF6898	Sharon	Hernandez	tenant148_1763601001736_6231@test.local	+14233614916	Canada	Ontario	CA	ON	2003-09-20 21:57:17.948	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459959_lz6ykg35f	t	\N	America/New_York	2025-11-20 01:10:01.736	2025-11-20 01:10:01.736	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi22ye9acf03e139c1380	TNE466DF55	Joyce	Kelley	tenant149_1763601001738_8616@test.local	+13048329719	Canada	Ontario	CA	ON	1992-10-25 09:23:38.485	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459960_6wlqekzar	t	\N	America/New_York	2025-11-20 01:10:01.738	2025-11-20 01:10:01.738	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi22yc9cd929f98b64757	TN32C4CD47	Joshua	Thompson	tenant150_1763601001738_6955@test.local	+15844123472	Canada	Ontario	CA	ON	1963-04-04 04:37:05.024	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459960_6wlqekzar	t	\N	America/New_York	2025-11-20 01:10:01.738	2025-11-20 01:10:01.738	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi2301871a2977367ff86	TN65B996DB	Alan	Willis	tenant151_1763601001740_6750@test.local	+19291630353	Canada	Ontario	CA	ON	1959-05-28 17:52:28.685	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459960_6wlqekzar	t	\N	America/New_York	2025-11-20 01:10:01.74	2025-11-20 01:10:01.74	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi231de737ef8767020a7	TN56BF0CB2	Louis	Ross	tenant152_1763601001741_3535@test.local	+15588865433	Canada	Ontario	CA	ON	1972-10-24 00:35:19.352	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459960_6wlqekzar	t	\N	America/New_York	2025-11-20 01:10:01.741	2025-11-20 01:10:01.741	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi2321052b5718548c074	TNCCB95B44	Christine	Gross	tenant153_1763601001742_5724@test.local	+11165641019	Canada	Ontario	CA	ON	1954-03-26 18:28:22.974	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459960_6wlqekzar	t	\N	America/New_York	2025-11-20 01:10:01.742	2025-11-20 01:10:01.742	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi2332d3ba244a0244202	TN8863F388	Mark	Morgan	tenant154_1763601001743_8171@test.local	+15304833952	Canada	Ontario	CA	ON	2003-08-19 22:56:05.083	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459960_6wlqekzar	t	\N	America/New_York	2025-11-20 01:10:01.743	2025-11-20 01:10:01.743	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi234fec89b78dc395def	TN8AA677E4	Rebecca	Delgado	tenant155_1763601001744_3568@test.local	+14532113091	Canada	Ontario	CA	ON	1953-01-20 23:22:28.531	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459960_6wlqekzar	t	\N	America/New_York	2025-11-20 01:10:01.744	2025-11-20 01:10:01.744	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi235632fa6e27ad33dc3	TN98662457	Julie	Cox	tenant156_1763601001745_9852@test.local	+13453040258	Canada	Ontario	CA	ON	1958-12-19 13:36:47.85	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459960_6wlqekzar	t	\N	America/New_York	2025-11-20 01:10:01.745	2025-11-20 01:10:01.745	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi23723c761d27fb032ab	TN0F37CA41	Christian	Nunez	tenant157_1763601001747_7120@test.local	+18345368742	Canada	Ontario	CA	ON	1982-03-02 18:39:08.989	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459960_6wlqekzar	t	\N	America/New_York	2025-11-20 01:10:01.747	2025-11-20 01:10:01.747	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
mi6qi23784c64e7b4653f6df	TNBD5B81F3	Louis	Cook	tenant158_1763601001747_9516@test.local	+16622386267	Canada	Ontario	CA	ON	1974-01-06 14:57:00.859	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	lld_1763344459960_6wlqekzar	t	\N	America/New_York	2025-11-20 01:10:01.747	2025-11-20 01:10:01.747	\N	\N	default	APPROVED	\N	\N	\N	\N	\N
\.


--
-- Data for Name: TenantInvitation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TenantInvitation" (id, "tenantId", email, token, status, "invitedBy", "propertyId", "unitId", "expiresAt", "openedAt", "completedAt", "reminderSentAt", "reminderCount", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TenantRating; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TenantRating" (id, "tenantId", "ratedBy", "ratedByType", "ratedByEmail", "ratedByName", "workOrderId", "propertyId", "unitId", "paymentBehavior", "propertyCare", communication, overall, review, "tenantResponse", "tenantRespondedAt", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TicketAttachment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TicketAttachment" (id, "ticketId", "fileName", "originalName", "fileType", "fileSize", "storagePath", "uploadedBy", "uploadedAt") FROM stdin;
\.


--
-- Data for Name: TicketNote; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TicketNote" (id, "ticketId", content, "isInternal", "createdBy", "createdByEmail", "createdByName", "createdByRole", "createdAt") FROM stdin;
\.


--
-- Data for Name: UnifiedVerification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UnifiedVerification" (id, "verificationType", "entityType", "entityId", "requestedBy", "requestedByRole", "requestedByEmail", "requestedByName", "assignedTo", "assignedToRole", "assignedToEmail", "assignedToName", "verifiedBy", "verifiedByRole", "verifiedByEmail", "verifiedByName", status, priority, "requestedAt", "verifiedAt", "rejectedAt", "expiredAt", "cancelledAt", "dueDate", title, description, notes, "verificationNotes", "rejectionReason", "fileName", "originalName", "fileUrl", "fileSize", "mimeType", metadata) FROM stdin;
\.


--
-- Data for Name: UnifiedVerificationHistory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UnifiedVerificationHistory" (id, "verificationId", action, "performedBy", "performedByRole", "performedByEmail", "performedByName", "previousStatus", "newStatus", notes, metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: Unit; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Unit" (id, "propertyId", "unitName", "floorNumber", bedrooms, bathrooms, "rentPrice", "depositAmount", status, "createdAt", "updatedAt") FROM stdin;
unit_1763346638591_2cf4971d4f63d9f0	prop_1763346638516_3bff7470185555bfdb2033b001a707e2	Main Unit	\N	4	1.5	2762	1723	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638596_ba5b342fc132073e	prop_1763346638594_024faa4cbbc447c732877992d807a30c	Main Unit	\N	2	1.5	2448	2103	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638599_eeac82a5b208fad6	prop_1763346638597_4eecda2a63246547e646164483a6c871	Main Unit	\N	2	2.5	1650	1081	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638601_f231c81e01bed6b0	prop_1763346638600_9bf231afa2634c19ced97be531b5e80c	Main Unit	\N	3	2.5	3406	1561	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638603_673847096864fd6b	prop_1763346638602_12a846f48534d3a1b9dd3840e9072b15	Main Unit	\N	3	2.5	2461	2465	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638605_abd181ef8e4c2589	prop_1763346638604_15c53e1e69b27bd42f2e335ffaa90f95	Main Unit	\N	2	2.5	2387	1850	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638608_10b6ec27b8b64998	prop_1763346638606_470e60e533ba9aba88f994d524064281	Unit 1	5	1	2	2408	2553	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638609_76b2a34eca029fea	prop_1763346638606_470e60e533ba9aba88f994d524064281	Unit 2	1	1	1	1744	2835	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638609_79856da3b408cae3	prop_1763346638606_470e60e533ba9aba88f994d524064281	Unit 3	2	1	2	1381	1105	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638609_67ca536cd6a57010	prop_1763346638606_470e60e533ba9aba88f994d524064281	Unit 4	3	2	2	1643	1183	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638611_d00b2b7a4e6062ab	prop_1763346638610_e8fbc9ed2af1bbfb5c3e795dd46f6ce0	Main Unit	\N	4	1.5	1524	2304	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638613_2d55f95e0cfd8081	prop_1763346638611_49349ad94749f2dba066f4336c3c4c96	Main Unit	\N	3	2.5	3452	1290	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638615_442a5412a9cfb5a0	prop_1763346638613_e0668a6e8ddde74f8f5d62c98cb90693	Main Unit	\N	2	1.5	2761	1265	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638616_af26422cef543c83	prop_1763346638615_64d98852de6255980d798bc3ddcecbd4	Main Unit	\N	4	2.5	1533	1260	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638618_85770d582c4ea7d2	prop_1763346638617_5ba114e0e12e4a04e6f0907a58f902b9	Main Unit	\N	3	2.5	3391	1622	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638619_7ffce11abb2f4d63	prop_1763346638618_36f83dd8779fbbf67a96d183a49783c8	Main Unit	\N	3	1.5	1756	1218	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638621_54b6914845ef5ba0	prop_1763346638620_cf06e77e03b2aa9aa18f1c208af316cc	Unit 1	5	1	2	2492	2002	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638621_5c3b90d84a6985d8	prop_1763346638620_cf06e77e03b2aa9aa18f1c208af316cc	Unit 2	5	1	2	1955	1401	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638622_802ac55f844d7d01	prop_1763346638620_cf06e77e03b2aa9aa18f1c208af316cc	Unit 3	1	1	1	1301	1101	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638622_3a3abc20026396b5	prop_1763346638620_cf06e77e03b2aa9aa18f1c208af316cc	Unit 4	4	1	1	1229	2815	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638624_e6b8f8dc22c74501	prop_1763346638622_6e9857fee99a07678209cc384d3f9e94	Main Unit	\N	4	2.5	2544	2661	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638647_bb6dd56c0f3baf1c	prop_1763346638624_e5482c2b674cc15b044bed252d3288a9	Main Unit	\N	4	2.5	3373	2861	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638650_dc1131c9a24641d2	prop_1763346638649_a7c4d775157bfc179c084c6a8c302a30	Main Unit	\N	3	2.5	2817	2605	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638652_660fedde2e4cf47c	prop_1763346638651_6f0c42b030bbc4ea3e164a4dde74ba60	Main Unit	\N	2	2.5	3436	1340	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638653_0d7505c76f40e185	prop_1763346638652_1019aa5c8352d24f60295c727b953f88	Main Unit	\N	3	1.5	1783	1046	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638655_3178b05bf1e671db	prop_1763346638654_fb61d508f503f4d40bd0b23254c01a49	Main Unit	\N	4	2.5	2190	2586	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638657_ea32c8f2b106aef0	prop_1763346638655_66757bdbc27060ec2112119376815d63	Main Unit	\N	4	1.5	1588	1832	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638658_30525eda1826b928	prop_1763346638657_4ac2823ac1b40494c7f0a65a32513369	Unit 1	5	3	2	1497	1651	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638659_41c25dba6931707f	prop_1763346638657_4ac2823ac1b40494c7f0a65a32513369	Unit 2	4	3	2	2053	1794	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638659_749819861beac56f	prop_1763346638657_4ac2823ac1b40494c7f0a65a32513369	Unit 3	5	3	1	2279	2338	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638661_eea7177ed8ee6501	prop_1763346638659_afa6ec8250235b6e5e2c387fc584fe1b	Main Unit	\N	4	2.5	1799	2380	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638662_7151a14da1b79b30	prop_1763346638661_1a1ff26a9edc77564cb8c49d9b4881e1	Unit 1	3	2	1	1524	2572	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638663_29268f11dce5cc89	prop_1763346638661_1a1ff26a9edc77564cb8c49d9b4881e1	Unit 3	3	1	1	2169	2591	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638663_783dd056e1e7cf60	prop_1763346638661_1a1ff26a9edc77564cb8c49d9b4881e1	Unit 4	4	1	2	2420	1804	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638665_26407209da330cf1	prop_1763346638664_4868cc0c44f2394cdea9ac13d5f720c3	Main Unit	\N	2	2.5	2791	2120	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638666_ba9c19af614e0245	prop_1763346638665_9066c172217da32fa84534dc5884497b	Main Unit	\N	2	2.5	2843	2010	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638668_278d7b8e090886a8	prop_1763346638667_d93236c75dda2cbb6aa7c96b9219543e	Main Unit	\N	4	1.5	1518	1534	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638669_4761173105e5a6d7	prop_1763346638668_dc0a44a5fb7af3a673432c36d60bbdfe	Main Unit	\N	2	1.5	2923	1868	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638671_830c0c7f2c87f16e	prop_1763346638670_ce24224648d1f56eaf777a0776b7c365	Main Unit	\N	3	1.5	1639	2259	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638673_2dd477ce7e8d85b4	prop_1763346638671_143f9247d1367e2d541a85e9324f8af5	Main Unit	\N	2	1.5	3302	2389	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638675_b9bad1e2015ea9d1	prop_1763346638674_3c925309e60449b59b910b36e5fdb08e	Main Unit	\N	2	1.5	2767	1654	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638676_eb0d2896bbbfaaa0	prop_1763346638675_55eb5cd0eebc00ba99018a13d5e86f05	Unit 1	5	2	1	2048	1831	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638677_044b879c3629aa7b	prop_1763346638675_55eb5cd0eebc00ba99018a13d5e86f05	Unit 2	2	1	1	2135	2168	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638677_238e6565e6e6c911	prop_1763346638675_55eb5cd0eebc00ba99018a13d5e86f05	Unit 3	4	2	1	2405	1728	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638679_05255aa1bc499203	prop_1763346638678_4a7e746e962e9fc7d4865cadf18cbe8f	Main Unit	\N	4	1.5	1546	1755	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638680_95ba6b5f7f557405	prop_1763346638679_652104fc15d32a327afbf102185e8320	Main Unit	\N	2	2.5	1789	2935	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638682_9050f4224abcb9bc	prop_1763346638680_f7205adefc3482ba509aa42f627b7a78	Main Unit	\N	2	1.5	2482	2135	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638683_c292a76e9aacbdf6	prop_1763346638682_ee05eaffcba293c6d2807e958f197fa6	Main Unit	\N	3	2.5	2616	1918	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638684_0599c5ad29c661cc	prop_1763346638683_d3dcd1425bcb4adaec65b22760908fe3	Unit 1	4	2	1	1432	2245	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638685_7c51a6d4f48293ff	prop_1763346638683_d3dcd1425bcb4adaec65b22760908fe3	Unit 3	5	1	1	1665	1729	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638687_51ee63c6b8af1512	prop_1763346638686_cbd404ff05606f3cd1b197cc264034fa	Main Unit	\N	2	2.5	1536	2353	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638688_2bed5a6f9befdc20	prop_1763346638687_289587bd095a99980134641fcf60bd29	Main Unit	\N	3	1.5	2051	1494	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638690_547261b4e9194e0f	prop_1763346638688_74c2187187e74d613af00e89bd31293c	Unit 1	\N	3	2	1271	2070	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638690_4e9c016c0fb5a979	prop_1763346638688_74c2187187e74d613af00e89bd31293c	Unit 2	\N	2	1	2320	2925	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638691_8a893dbc79ed0d5e	prop_1763346638690_f710923a7c6df773f93fb61500217248	Main Unit	\N	2	2.5	2830	2120	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638693_60226a6c9b73b9bb	prop_1763346638692_1a09f0740afe21686b8ea23eacf2449a	Main Unit	\N	4	2.5	3337	1287	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638694_14cc117dfbcf4151	prop_1763346638693_2a22255a5ed7510ad6b9b379622b04ed	Unit 1	3	1	1	1453	1896	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638695_be65b50de35f44d5	prop_1763346638693_2a22255a5ed7510ad6b9b379622b04ed	Unit 2	3	1	2	2061	2962	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638695_8beeacce92e43caf	prop_1763346638693_2a22255a5ed7510ad6b9b379622b04ed	Unit 3	2	2	1	2213	1809	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638695_88f12b35d1de776d	prop_1763346638693_2a22255a5ed7510ad6b9b379622b04ed	Unit 4	3	3	1	1118	2237	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638697_e6941824bb2f9af4	prop_1763346638696_92633b1561239eb1ca8424d5c07b9377	Main Unit	\N	3	1.5	1602	2049	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638699_9d6cb2af8bb8994e	prop_1763346638698_8559000b9db7f7ddbea09714be3cae04	Main Unit	\N	3	1.5	3048	2310	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638700_bfd2f1619c5f62cc	prop_1763346638699_411d36b07bc3d822b43f27e63abcde8e	Main Unit	\N	3	1.5	3210	1608	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638701_ac1c3d566bace5da	prop_1763346638700_b95d9f9e0da28a9d5f0d599cc1714379	Main Unit	\N	3	2.5	3036	1809	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638703_26349a00e3785055	prop_1763346638702_f8bf0252ec9f4950ab375d12c9d97eed	Main Unit	\N	3	2.5	3198	1542	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638704_94f3da4421c0e4f7	prop_1763346638703_d0184bcb011ef77feaabf55bd833232a	Main Unit	\N	4	1.5	2956	2717	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638705_f8e7c5535eb1ada2	prop_1763346638704_f688023afc34f01c7d51a541c74be071	Main Unit	\N	4	1.5	2011	1001	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638707_7324a1af7553d93f	prop_1763346638706_aa734865d83110e56eab7c9b98bc312b	Main Unit	\N	2	1.5	3461	1826	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638709_b412d031e748f4ad	prop_1763346638708_0fb02ddc42669b8563e51ad3244a759a	Unit 1	1	2	2	1673	2989	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638709_fa6096bb567f031d	prop_1763346638708_0fb02ddc42669b8563e51ad3244a759a	Unit 2	1	3	1	1308	1273	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638709_615c9d2f93c787a7	prop_1763346638708_0fb02ddc42669b8563e51ad3244a759a	Unit 3	1	2	2	1845	2084	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638709_713dc582a3e021be	prop_1763346638708_0fb02ddc42669b8563e51ad3244a759a	Unit 4	4	3	2	2320	1236	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638711_d02c5a0cc36397b7	prop_1763346638710_db2f29ec4359a3442b0100bdba14a52d	Main Unit	\N	3	2.5	3092	2783	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638712_c841bfa2d98a2af3	prop_1763346638711_93dbee98d817184bbf95c49a85f41c75	Main Unit	\N	4	2.5	2628	1254	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638713_ee7554748d68ded7	prop_1763346638713_5e00127fd7cc6319135b0b05bb1bed52	Main Unit	\N	2	2.5	1936	1580	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638715_f6b039dae9e88127	prop_1763346638714_d9e2792a43f282598e1c480dcdf3c6c5	Main Unit	\N	4	1.5	2034	1371	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638719_624881f27f351687	prop_1763346638717_4c74a552c89172e962960d259eaec29a	Main Unit	\N	4	1.5	2290	1433	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638720_bc2c74f99b4eaf44	prop_1763346638719_f41f1917955a21cf43b7b36c712ca6e1	Main Unit	\N	4	1.5	2285	1727	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638717_0d633559d4b4bbb6	prop_1763346638715_ff015a913f8a3c1e1c1a3420dbfdc3eb	143	4	1	1	2373	\N	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638716_c7ee53e682aaaeb6	prop_1763346638715_ff015a913f8a3c1e1c1a3420dbfdc3eb	111	1	2	2	1168	\N	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638717_085d24654491a016	prop_1763346638715_ff015a913f8a3c1e1c1a3420dbfdc3eb	126	2	3	1	1675	\N	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638663_ad009e6edff299cf	prop_1763346638661_1a1ff26a9edc77564cb8c49d9b4881e1	Unit 2	2	3	1	2233	2376	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
unit_1763346638685_425bfdb0789b39f0	prop_1763346638683_d3dcd1425bcb4adaec65b22760908fe3	101	1	1	1	1218	1905	Vacant	2025-11-17 02:30:38.515	2025-11-17 02:30:38.515
\.


--
-- Data for Name: UserActivity; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserActivity" (id, "userId", "userEmail", "userName", "userRole", action, resource, "resourceId", "ipAddress", "userAgent", details, "createdAt") FROM stdin;
\.


--
-- Data for Name: UserPermission; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserPermission" (id, "userRoleId", category, resource, action, conditions, "isGranted", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: UserRole; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserRole" (id, "userId", "userType", "roleId", "portfolioId", "propertyId", "unitId", "pmcId", "landlordId", "isActive", "assignedAt", "assignedBy", "expiresAt", "createdAt", "updatedAt") FROM stdin;
cmi25vw1c0002nb88620yf6ve	mhzjydymf9f6273898498c3d	pmc	cmi221ix50006nbrfy4j46sjq	\N	\N	\N	\N	\N	f	2025-11-16 20:21:50.449	admin_1762836944093_guaqbbv2f	\N	2025-11-16 20:21:50.449	2025-11-16 20:24:53.013
cmi260fub0009nb884yrw99ih	mhzjydymf9f6273898498c3d	pmc	cmi221ix70008nbrfj76nm52b	\N	\N	\N	\N	\N	f	2025-11-16 20:25:22.74	admin_1762836944093_guaqbbv2f	\N	2025-11-16 20:25:22.74	2025-11-16 20:40:58.472
cmi2frx5y0001nbwmhyuzxnwv	cmi2agu7j0000nb6bcw3lysx2	admin	cmi221iw60000nbrful169jig	\N	\N	\N	\N	\N	t	2025-11-17 00:58:51.96	cmi2agu7j0000nb6bcw3lysx2	\N	2025-11-17 00:58:41.447	2025-11-17 00:58:51.961
cmi2dt32w0003nbspkgomvoo8	cmi2dt32t0001nbspol4blphp	admin	cmi2b6fyk0001nb70c1iv3y79	\N	\N	\N	cmi2dt32o0000nbsps6g9p2tl	\N	t	2025-11-18 13:22:39.551	cmi2agu7j0000nb6bcw3lysx2	\N	2025-11-17 00:03:36.536	2025-11-18 13:22:39.552
cmi2dt32z0007nbsp0d8oy5xd	cmi2dt32z0005nbsp0mpj13b4	admin	cmi2b6fyk0001nb70c1iv3y79	\N	\N	\N	cmi2dt32o0000nbsps6g9p2tl	\N	t	2025-11-18 13:22:39.557	cmi2agu7j0000nb6bcw3lysx2	\N	2025-11-17 00:03:36.54	2025-11-18 13:22:39.557
\.


--
-- Data for Name: VendorRating; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."VendorRating" (id, "vendorId", "ratedBy", "ratedByType", "ratedByEmail", "ratedByName", "workOrderId", "maintenanceRequestId", "propertyId", "unitId", quality, timeliness, communication, professionalism, overall, review, "vendorResponse", "vendorRespondedAt", status, "isBlocked", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_logs (id, user_id, user_email, user_name, user_role, user_type, action, entity_type, entity_id, entity_name, description, metadata, property_id, landlord_id, tenant_id, pmc_id, vendor_id, contractor_id, approval_request_id, conversation_id, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: admin_audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_audit_logs (id, action, resource, resource_id, target_user_id, target_user_role, target_entity_type, target_entity_id, approval_type, approval_entity_id, before_state, after_state, changed_fields, details, ip_address, user_agent, success, error_message, google_email, created_at, admin_id) FROM stdin;
\.


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admins (id, email, google_id, first_name, last_name, phone, role, is_active, is_locked, allowed_google_domains, ip_whitelist, require_ip_whitelist, last_login_at, last_login_ip, created_at, updated_at) FROM stdin;
1	superadmin@admin.local	\N	Super	Admin	\N	PLATFORM_ADMIN	t	f	[]	[]	f	2025-11-21 13:07:22.867-05	::1	2025-11-21 21:22:12.80177-05	2025-11-21 21:22:12.801774-05
2	pmc1-admin@pmc.local	\N	PMC	Admin 1	\N	PLATFORM_ADMIN	t	f	[]	[]	f	\N	\N	2025-11-21 21:22:12.802918-05	2025-11-21 21:22:12.802921-05
3	pmc2-admin@pmc.local	\N	PMC	Admin 2	\N	PLATFORM_ADMIN	t	f	[]	[]	f	\N	\N	2025-11-21 21:22:12.803573-05	2025-11-21 21:22:12.803575-05
\.


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.applications (id, applicant_id, applicant_email, applicant_name, applicant_phone, co_applicant_ids, status, deadline, screening_requested, screening_requested_at, screening_provider, screening_status, screening_data, approved_at, approved_by, approved_by_type, approved_by_email, approved_by_name, rejected_at, rejected_by, rejected_by_type, rejected_by_email, rejected_by_name, rejection_reason, application_data, metadata, is_archived, created_at, updated_at, lease_id, property_id, unit_id) FROM stdin;
\.


--
-- Data for Name: auth_group; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.auth_group (id, name) FROM stdin;
\.


--
-- Data for Name: auth_group_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.auth_group_permissions (id, group_id, permission_id) FROM stdin;
\.


--
-- Data for Name: auth_permission; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.auth_permission (id, name, content_type_id, codename) FROM stdin;
1	Can add log entry	1	add_logentry
2	Can change log entry	1	change_logentry
3	Can delete log entry	1	delete_logentry
4	Can view log entry	1	view_logentry
5	Can add permission	2	add_permission
6	Can change permission	2	change_permission
7	Can delete permission	2	delete_permission
8	Can view permission	2	view_permission
9	Can add group	3	add_group
10	Can change group	3	change_group
11	Can delete group	3	delete_group
12	Can view group	3	view_group
13	Can add user	4	add_user
14	Can change user	4	change_user
15	Can delete user	4	delete_user
16	Can view user	4	view_user
17	Can add content type	5	add_contenttype
18	Can change content type	5	change_contenttype
19	Can delete content type	5	delete_contenttype
20	Can view content type	5	view_contenttype
21	Can add session	6	add_session
22	Can change session	6	change_session
23	Can delete session	6	delete_session
24	Can view session	6	view_session
25	Can add Property	7	add_property
26	Can change Property	7	change_property
27	Can delete Property	7	delete_property
28	Can view Property	7	view_property
29	Can add Unit	8	add_unit
30	Can change Unit	8	change_unit
31	Can delete Unit	8	delete_unit
32	Can view Unit	8	view_unit
33	Can add Tenant	9	add_tenant
34	Can change Tenant	9	change_tenant
35	Can delete Tenant	9	delete_tenant
36	Can view Tenant	9	view_tenant
37	Can add Tenant Invitation	10	add_tenantinvitation
38	Can change Tenant Invitation	10	change_tenantinvitation
39	Can delete Tenant Invitation	10	delete_tenantinvitation
40	Can view Tenant Invitation	10	view_tenantinvitation
41	Can add Lease	11	add_lease
42	Can change Lease	11	change_lease
43	Can delete Lease	11	delete_lease
44	Can view Lease	11	view_lease
45	Can add Lease Document	12	add_leasedocument
46	Can change Lease Document	12	change_leasedocument
47	Can delete Lease Document	12	delete_leasedocument
48	Can view Lease Document	12	view_leasedocument
49	Can add Lease Termination	13	add_leasetermination
50	Can change Lease Termination	13	change_leasetermination
51	Can delete Lease Termination	13	delete_leasetermination
52	Can view Lease Termination	13	view_leasetermination
53	Can add Lease-Tenant Relationship	14	add_leasetenant
54	Can change Lease-Tenant Relationship	14	change_leasetenant
55	Can delete Lease-Tenant Relationship	14	delete_leasetenant
56	Can view Lease-Tenant Relationship	14	view_leasetenant
57	Can add Rent Payment	15	add_rentpayment
58	Can change Rent Payment	15	change_rentpayment
59	Can delete Rent Payment	15	delete_rentpayment
60	Can view Rent Payment	15	view_rentpayment
61	Can add Security Deposit	16	add_securitydeposit
62	Can change Security Deposit	16	change_securitydeposit
63	Can delete Security Deposit	16	delete_securitydeposit
64	Can view Security Deposit	16	view_securitydeposit
65	Can add Expense	17	add_expense
66	Can change Expense	17	change_expense
67	Can delete Expense	17	delete_expense
68	Can view Expense	17	view_expense
69	Can add Maintenance Request	18	add_maintenancerequest
70	Can change Maintenance Request	18	change_maintenancerequest
71	Can delete Maintenance Request	18	delete_maintenancerequest
72	Can view Maintenance Request	18	view_maintenancerequest
73	Can add Maintenance Comment	19	add_maintenancecomment
74	Can change Maintenance Comment	19	change_maintenancecomment
75	Can delete Maintenance Comment	19	delete_maintenancecomment
76	Can view Maintenance Comment	19	view_maintenancecomment
77	Can add Landlord	20	add_landlord
78	Can change Landlord	20	change_landlord
79	Can delete Landlord	20	delete_landlord
80	Can view Landlord	20	view_landlord
81	Can add Property Management Company	21	add_propertymanagementcompany
82	Can change Property Management Company	21	change_propertymanagementcompany
83	Can delete Property Management Company	21	delete_propertymanagementcompany
84	Can view Property Management Company	21	view_propertymanagementcompany
85	Can add Organization	22	add_organization
86	Can change Organization	22	change_organization
87	Can delete Organization	22	delete_organization
88	Can view Organization	22	view_organization
89	Can add Organization Settings	23	add_organizationsettings
90	Can change Organization Settings	23	change_organizationsettings
91	Can delete Organization Settings	23	delete_organizationsettings
92	Can view Organization Settings	23	view_organizationsettings
93	Can add Admin	24	add_admin
94	Can change Admin	24	change_admin
95	Can delete Admin	24	delete_admin
96	Can view Admin	24	view_admin
97	Can add Admin Audit Log	25	add_adminauditlog
98	Can change Admin Audit Log	25	change_adminauditlog
99	Can delete Admin Audit Log	25	delete_adminauditlog
100	Can view Admin Audit Log	25	view_adminauditlog
101	Can add Permission	26	add_permission
102	Can change Permission	26	change_permission
103	Can delete Permission	26	delete_permission
104	Can view Permission	26	view_permission
105	Can add Role	27	add_role
106	Can change Role	27	change_role
107	Can delete Role	27	delete_role
108	Can view Role	27	view_role
109	Can add User Role	28	add_userrole
110	Can change User Role	28	change_userrole
111	Can delete User Role	28	delete_userrole
112	Can view User Role	28	view_userrole
113	Can add Role Permission	29	add_rolepermission
114	Can change Role Permission	29	change_rolepermission
115	Can delete Role Permission	29	delete_rolepermission
116	Can view Role Permission	29	view_rolepermission
117	Can add Document	30	add_document
118	Can change Document	30	change_document
119	Can delete Document	30	delete_document
120	Can view Document	30	view_document
121	Can add Document Message	31	add_documentmessage
122	Can change Document Message	31	change_documentmessage
123	Can delete Document Message	31	delete_documentmessage
124	Can view Document Message	31	view_documentmessage
125	Can add Document Audit Log	32	add_documentauditlog
126	Can change Document Audit Log	32	change_documentauditlog
127	Can delete Document Audit Log	32	delete_documentauditlog
128	Can view Document Audit Log	32	view_documentauditlog
129	Can add Conversation	33	add_conversation
130	Can change Conversation	33	change_conversation
131	Can delete Conversation	33	delete_conversation
132	Can view Conversation	33	view_conversation
133	Can add Message	34	add_message
134	Can change Message	34	change_message
135	Can delete Message	34	delete_message
136	Can view Message	34	view_message
137	Can add Message Attachment	35	add_messageattachment
138	Can change Message Attachment	35	change_messageattachment
139	Can delete Message Attachment	35	delete_messageattachment
140	Can view Message Attachment	35	view_messageattachment
141	Can add Support Ticket	36	add_supportticket
142	Can change Support Ticket	36	change_supportticket
143	Can delete Support Ticket	36	delete_supportticket
144	Can view Support Ticket	36	view_supportticket
145	Can add Ticket Note	37	add_ticketnote
146	Can change Ticket Note	37	change_ticketnote
147	Can delete Ticket Note	37	delete_ticketnote
148	Can view Ticket Note	37	view_ticketnote
149	Can add Ticket Attachment	38	add_ticketattachment
150	Can change Ticket Attachment	38	change_ticketattachment
151	Can delete Ticket Attachment	38	delete_ticketattachment
152	Can view Ticket Attachment	38	view_ticketattachment
153	Can add Notification	39	add_notification
154	Can change Notification	39	change_notification
155	Can delete Notification	39	delete_notification
156	Can view Notification	39	view_notification
157	Can add Notification Preference	40	add_notificationpreference
158	Can change Notification Preference	40	change_notificationpreference
159	Can delete Notification Preference	40	delete_notificationpreference
160	Can view Notification Preference	40	view_notificationpreference
161	Can add Unified Verification	41	add_unifiedverification
162	Can change Unified Verification	41	change_unifiedverification
163	Can delete Unified Verification	41	delete_unifiedverification
164	Can view Unified Verification	41	view_unifiedverification
165	Can add Verification History	42	add_unifiedverificationhistory
166	Can change Verification History	42	change_unifiedverificationhistory
167	Can delete Verification History	42	delete_unifiedverificationhistory
168	Can view Verification History	42	view_unifiedverificationhistory
169	Can add Invitation	43	add_invitation
170	Can change Invitation	43	change_invitation
171	Can delete Invitation	43	delete_invitation
172	Can view Invitation	43	view_invitation
173	Can add Service Provider	44	add_serviceprovider
174	Can change Service Provider	44	change_serviceprovider
175	Can delete Service Provider	44	delete_serviceprovider
176	Can view Service Provider	44	view_serviceprovider
177	Can add Service Provider Rating	45	add_serviceproviderrating
178	Can change Service Provider Rating	45	change_serviceproviderrating
179	Can delete Service Provider Rating	45	delete_serviceproviderrating
180	Can view Service Provider Rating	45	view_serviceproviderrating
181	Can add Application	46	add_application
182	Can change Application	46	change_application
183	Can delete Application	46	delete_application
184	Can view Application	46	view_application
185	Can add Inspection Checklist	47	add_inspectionchecklist
186	Can change Inspection Checklist	47	change_inspectionchecklist
187	Can delete Inspection Checklist	47	delete_inspectionchecklist
188	Can view Inspection Checklist	47	view_inspectionchecklist
189	Can add Checklist Item	48	add_inspectionchecklistitem
190	Can change Checklist Item	48	change_inspectionchecklistitem
191	Can delete Checklist Item	48	delete_inspectionchecklistitem
192	Can view Checklist Item	48	view_inspectionchecklistitem
193	Can add Activity Log	49	add_activitylog
194	Can change Activity Log	49	change_activitylog
195	Can delete Activity Log	49	delete_activitylog
196	Can view Activity Log	49	view_activitylog
197	Can add User Activity	50	add_useractivity
198	Can change User Activity	50	change_useractivity
199	Can delete User Activity	50	delete_useractivity
200	Can view User Activity	50	view_useractivity
201	Can add Expense	51	add_expense
202	Can change Expense	51	change_expense
203	Can delete Expense	51	delete_expense
204	Can view Expense	51	view_expense
205	Can add Platform Settings	52	add_platformsettings
206	Can change Platform Settings	52	change_platformsettings
207	Can delete Platform Settings	52	delete_platformsettings
208	Can view Platform Settings	52	view_platformsettings
209	Can add LTB Document	53	add_ltbdocument
210	Can change LTB Document	53	change_ltbdocument
211	Can delete LTB Document	53	delete_ltbdocument
212	Can view LTB Document	53	view_ltbdocument
\.


--
-- Data for Name: auth_user; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.auth_user (id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined) FROM stdin;
1	pbkdf2_sha256$600000$gh00RFm7foS1SAqG7dJnLH$5krDFol763ha4hErgpVlcmnE0tbKLmCS2EqhwB2m1gI=	2025-11-21 23:29:05.517481-05	t	admin			admin@pinaka.com	t	t	2025-11-21 18:29:13.836706-05
2		2025-11-22 00:26:39.253317-05	t	superadmin@admin.local	Super	Admin	superadmin@admin.local	t	t	2025-11-21 23:32:56.659281-05
3		2025-11-22 01:28:25.178407-05	t	pmc1-admin@pmc.local	PMC	Admin 1	pmc1-admin@pmc.local	t	t	2025-11-21 23:35:08.717387-05
\.


--
-- Data for Name: auth_user_groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.auth_user_groups (id, user_id, group_id) FROM stdin;
\.


--
-- Data for Name: auth_user_user_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.auth_user_user_permissions (id, user_id, permission_id) FROM stdin;
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.conversations (id, subject, conversation_type, status, linked_entity_type, linked_entity_id, created_by, last_message_at, landlord_last_read_at, tenant_last_read_at, pmc_last_read_at, notify_landlord, notify_tenant, notify_pmc, metadata, priority, tags, created_at, updated_at, created_by_landlord_id, created_by_pmc_id, created_by_tenant_id, landlord_id, last_message_id, pmc_id, property_id, tenant_id) FROM stdin;
\.


--
-- Data for Name: django_admin_log; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.django_admin_log (id, action_time, object_id, object_repr, action_flag, change_message, content_type_id, user_id) FROM stdin;
\.


--
-- Data for Name: django_content_type; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.django_content_type (id, app_label, model) FROM stdin;
1	admin	logentry
2	auth	permission
3	auth	group
4	auth	user
5	contenttypes	contenttype
6	sessions	session
7	property	property
8	property	unit
9	tenant	tenant
10	tenant	tenantinvitation
11	lease	lease
12	lease	leasedocument
13	lease	leasetermination
14	lease	leasetenant
15	payment	rentpayment
16	payment	securitydeposit
17	payment	expense
18	maintenance	maintenancerequest
19	maintenance	maintenancecomment
20	landlord	landlord
21	pmc	propertymanagementcompany
22	organization	organization
23	organization	organizationsettings
24	rbac	admin
25	rbac	adminauditlog
26	rbac	permission
27	rbac	role
28	rbac	userrole
29	rbac	rolepermission
30	document	document
31	document	documentmessage
32	document	documentauditlog
33	message	conversation
34	message	message
35	message	messageattachment
36	support	supportticket
37	support	ticketnote
38	support	ticketattachment
39	notification	notification
40	notification	notificationpreference
41	verification	unifiedverification
42	verification	unifiedverificationhistory
43	invitation	invitation
44	service_provider	serviceprovider
45	service_provider	serviceproviderrating
46	application	application
47	inspection	inspectionchecklist
48	inspection	inspectionchecklistitem
49	activity	activitylog
50	activity	useractivity
51	expense	expense
52	shared	platformsettings
53	ltb_document	ltbdocument
\.


--
-- Data for Name: django_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.django_migrations (id, app, name, applied) FROM stdin;
1	contenttypes	0001_initial	2025-11-21 18:28:50.928655-05
2	auth	0001_initial	2025-11-21 18:28:50.973159-05
3	admin	0001_initial	2025-11-21 18:28:50.999039-05
4	admin	0002_logentry_remove_auto_add	2025-11-21 18:28:51.00382-05
5	admin	0003_logentry_add_action_flag_choices	2025-11-21 18:28:51.00846-05
6	contenttypes	0002_remove_content_type_name	2025-11-21 18:28:51.017793-05
7	auth	0002_alter_permission_name_max_length	2025-11-21 18:28:51.021831-05
8	auth	0003_alter_user_email_max_length	2025-11-21 18:28:51.025682-05
9	auth	0004_alter_user_username_opts	2025-11-21 18:28:51.030551-05
10	auth	0005_alter_user_last_login_null	2025-11-21 18:28:51.034625-05
11	auth	0006_require_contenttypes_0002	2025-11-21 18:28:51.036475-05
12	auth	0007_alter_validators_add_error_messages	2025-11-21 18:28:51.041265-05
13	auth	0008_alter_user_username_max_length	2025-11-21 18:28:51.050329-05
14	auth	0009_alter_user_last_name_max_length	2025-11-21 18:28:51.056413-05
15	auth	0010_alter_group_name_max_length	2025-11-21 18:28:51.061582-05
16	auth	0011_update_proxy_permissions	2025-11-21 18:28:51.065658-05
17	auth	0012_alter_user_first_name_max_length	2025-11-21 18:28:51.069985-05
18	property	0001_initial	2025-11-21 18:28:51.110866-05
19	sessions	0001_initial	2025-11-21 18:28:51.120091-05
20	tenant	0001_initial	2025-11-21 18:41:47.656632-05
21	lease	0001_initial	2025-11-21 18:41:47.706265-05
22	lease	0002_initial	2025-11-21 18:41:47.789544-05
23	maintenance	0001_initial	2025-11-21 18:41:58.968224-05
24	payment	0001_initial	2025-11-21 18:41:59.077627-05
25	property	0002_alter_property_landlord_id_alter_property_pmc_id	2025-11-21 18:54:54.673595-05
26	landlord	0001_initial	2025-11-21 21:20:36.162563-05
27	organization	0001_initial	2025-11-21 21:20:36.200977-05
28	pmc	0001_initial	2025-11-21 21:20:36.221397-05
29	rbac	0001_initial	2025-11-21 21:20:36.32922-05
30	document	0001_initial	2025-11-21 21:28:59.960309-05
31	message	0001_initial	2025-11-21 21:29:45.652249-05
32	support	0001_initial	2025-11-21 21:30:39.615008-05
33	notification	0001_initial	2025-11-21 21:36:53.252278-05
34	verification	0001_initial	2025-11-21 21:37:42.869663-05
35	invitation	0001_initial	2025-11-21 21:38:28.767996-05
36	service_provider	0001_initial	2025-11-21 21:39:17.683896-05
37	invitation	0002_invitation_approved_at_invitation_approved_by_and_more	2025-11-21 21:51:22.758317-05
38	application	0001_initial	2025-11-21 21:52:19.80932-05
39	inspection	0001_initial	2025-11-21 21:56:31.115563-05
40	activity	0001_initial	2025-11-21 22:01:24.616885-05
41	expense	0001_initial	2025-11-21 22:03:50.860958-05
42	rbac	0002_userrole_is_active_userrole_landlord_id_and_more	2025-11-22 00:22:16.548974-05
43	shared	0001_initial	2025-11-22 01:19:21.630008-05
44	shared	0002_update_platform_settings	2025-11-22 01:20:10.804914-05
45	ltb_document	0001_initial	2025-11-22 03:38:00.248965-05
\.


--
-- Data for Name: django_session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.django_session (session_key, session_data, expire_date) FROM stdin;
hs5ff2wz130n6mog1qb4woy8poq7snzx	.eJxVi0sKwjAQhu-StRSTNBPiUtz2DGWc-UuCmkKbrsS7a8GFbr_H04y8tTxuK5axqDkZZw6_7MpyQ93FmnmBdrtCbUW4lbl2l_nBpQ6z4n7-pn9_5jV_Zu-9WCBJOtrJwbFqiATvI7MoTZqm5NBHT0FtRCRywSaQMFHPBPN6A9ySOBo:1vMg8t:HcilfgJDmZTh-Yk3npvLI99I5FQ4I4NyrDRhyT1DKBs	2025-12-06 00:26:39.284295-05
nh09c7h9xw9bwve72oeau9bcvyy42z9r	.eJxVjMEKAiEURf_FdQyp4xNbRtu-QV6-OyiVwuison-PgRa1Pefc-1KRt5Hj1rHGIuqkrDr8shunO-oueuYVMu0KdZTEo7Q6XdqTS702weP8Tf_2mXveX61NGggpHPViYFjEeYK1njkJLRKWYDB7S060hycyTgdQYqKZCer9Ad0qOBs:1vMh6f:YMtTOhFTpOSmh3RpLKdDNHbot0uIYUYwQhgnFZHGBlc	2025-12-06 01:28:25.182465-05
\.


--
-- Data for Name: document_audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.document_audit_logs (id, action, performed_by, performed_by_email, performed_by_name, ip_address, user_agent, details, created_at, document_id) FROM stdin;
\.


--
-- Data for Name: document_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.document_messages (id, message, sender_role, sender_email, sender_name, is_read, read_at, created_at, updated_at, document_id) FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.documents (id, file_name, original_name, file_type, file_size, storage_path, category, subcategory, description, tags, metadata, uploaded_by, uploaded_by_email, uploaded_by_name, uploaded_at, updated_at, can_landlord_delete, can_tenant_delete, visibility, is_verified, verified_at, verified_by, verified_by_name, verified_by_role, verification_comment, is_rejected, rejected_at, rejected_by, rejected_by_name, rejected_by_role, rejection_reason, expiration_date, is_required, reminder_sent, reminder_sent_at, is_deleted, deleted_at, deleted_by, deleted_by_email, deleted_by_name, deletion_reason, document_hash, property_id, tenant_id) FROM stdin;
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expenses (id, expense_id, property_id, category, amount, expense_date, description, vendor, payment_method, reference_number, receipt_url, status, maintenance_request_id, created_at, updated_at, recorded_by) FROM stdin;
\.


--
-- Data for Name: inspection_checklist_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inspection_checklist_items (id, item_id, item_label, category, is_checked, notes, photos, landlord_notes, landlord_approval, landlord_approved_at, created_at, updated_at, checklist_id) FROM stdin;
\.


--
-- Data for Name: inspection_checklists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inspection_checklists (id, checklist_type, inspection_date, status, submitted_at, approved_at, approved_by, approved_by_name, rejection_reason, rejected_at, rejected_by, rejected_by_name, created_at, updated_at, lease_id, property_id, tenant_id, unit_id) FROM stdin;
\.


--
-- Data for Name: invitations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invitations (id, email, token, invitation_type, status, invited_by, invited_by_role, invited_by_name, invited_by_email, message, expires_at, sent_at, opened_at, completed_at, cancelled_at, metadata, created_at, updated_at, invited_by_admin_id, invited_by_landlord_id, invited_by_pmc_id, approved_at, approved_by, landlord_id, pmc_id, property_id, rejected_at, rejected_by, rejection_reason, service_provider_id, tenant_id, unit_id) FROM stdin;
\.


--
-- Data for Name: landlords; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.landlords (id, landlord_id, first_name, middle_name, last_name, email, phone, address_line1, address_line2, city, province_state, postal_zip, country, country_code, region_code, organization_id, timezone, theme, signature_file_name, approval_status, approved_by, approved_at, rejected_by, rejected_at, rejection_reason, invited_by, invited_at, created_at, updated_at) FROM stdin;
1	LLD-PMC1-01	Christopher	\N	Flores	pmc1-lld1@pmc.local	555-1001	\N	\N	\N	\N	\N	\N	CA	ON	\N	America/Toronto	default	\N	APPROVED	\N	2025-11-17 01:54:19.933-05	\N	\N	\N	\N	\N	2025-11-21 21:22:12.780852-05	2025-11-21 21:22:12.782391-05
2	LLD-PMC1-02	Kimberly	\N	King	pmc1-lld2@pmc.local	555-1002	\N	\N	\N	\N	\N	\N	CA	ON	\N	America/Toronto	default	\N	APPROVED	\N	2025-11-17 01:54:19.945-05	\N	\N	\N	\N	\N	2025-11-21 21:22:12.784878-05	2025-11-21 21:22:12.784881-05
3	LLD-PMC1-03	Linda	\N	Jackson	pmc1-lld3@pmc.local	555-1003	\N	\N	\N	\N	\N	\N	CA	ON	\N	America/Toronto	default	\N	APPROVED	\N	2025-11-17 01:54:19.948-05	\N	\N	\N	\N	\N	2025-11-21 21:22:12.785686-05	2025-11-21 21:22:12.785689-05
4	LLD-PMC1-04	Richard	\N	Robinson	pmc1-lld4@pmc.local	555-1004	\N	\N	\N	\N	\N	\N	CA	ON	\N	America/Toronto	default	\N	APPROVED	\N	2025-11-17 01:54:19.95-05	\N	\N	\N	\N	\N	2025-11-21 21:22:12.786467-05	2025-11-21 21:22:12.78647-05
5	LLD-PMC1-05	Lisa	\N	White	pmc1-lld5@pmc.local	555-1005	\N	\N	\N	\N	\N	\N	CA	ON	\N	America/Toronto	default	\N	APPROVED	\N	2025-11-17 01:54:19.951-05	\N	\N	\N	\N	\N	2025-11-21 21:22:12.787245-05	2025-11-21 21:22:12.787249-05
6	LLD-PMC1-06	Sandra	\N	Torres	pmc1-lld6@pmc.local	555-1006	\N	\N	\N	\N	\N	\N	CA	ON	\N	America/Toronto	default	\N	APPROVED	\N	2025-11-17 01:54:19.953-05	\N	\N	\N	\N	\N	2025-11-21 21:22:12.788037-05	2025-11-21 21:22:12.78804-05
7	LLD-PMC1-07	Mary	\N	Jackson	pmc1-lld7@pmc.local	555-1007	\N	\N	\N	\N	\N	\N	CA	ON	\N	America/Toronto	default	\N	APPROVED	\N	2025-11-17 01:54:19.956-05	\N	\N	\N	\N	\N	2025-11-21 21:22:12.78918-05	2025-11-21 21:22:12.789183-05
8	LLD-PMC1-08	Michael	\N	Martinez	pmc1-lld8@pmc.local	555-1008	\N	\N	\N	\N	\N	\N	CA	ON	\N	America/Toronto	default	\N	APPROVED	\N	2025-11-17 01:54:19.958-05	\N	\N	\N	\N	\N	2025-11-21 21:22:12.790034-05	2025-11-21 21:22:12.790038-05
9	LLD-PMC1-09	Robert	\N	King	pmc1-lld9@pmc.local	555-1009	\N	\N	\N	\N	\N	\N	CA	ON	\N	America/Toronto	default	\N	APPROVED	\N	2025-11-17 01:54:19.959-05	\N	\N	\N	\N	\N	2025-11-21 21:22:12.790773-05	2025-11-21 21:22:12.790776-05
10	LLD-PMC1-10	Susan	\N	Martin	pmc1-lld10@pmc.local	555-1010	\N	\N	\N	\N	\N	\N	CA	ON	\N	America/Toronto	default	\N	APPROVED	\N	2025-11-17 01:54:19.96-05	\N	\N	\N	\N	\N	2025-11-21 21:22:12.791553-05	2025-11-21 21:22:12.791556-05
\.


--
-- Data for Name: lease_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lease_documents (id, document_id, file_name, original_name, file_type, file_size, storage_path, description, uploaded_at, updated_at, lease_id) FROM stdin;
\.


--
-- Data for Name: lease_tenants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lease_tenants (id, is_primary_tenant, added_at, lease_id, tenant_id) FROM stdin;
1	t	2025-11-21 21:14:44.798275-05	2	3
2	f	2025-11-21 21:14:44.799322-05	2	4
3	t	2025-11-21 21:14:44.8002-05	3	5
4	f	2025-11-21 21:14:44.801079-05	3	6
5	t	2025-11-21 21:14:44.80195-05	4	7
6	f	2025-11-21 21:14:44.802959-05	4	8
7	t	2025-11-21 21:14:44.803844-05	5	9
8	f	2025-11-21 21:14:44.80472-05	5	10
9	t	2025-11-21 21:14:44.805577-05	6	11
10	f	2025-11-21 21:14:44.806443-05	6	12
11	t	2025-11-21 21:14:44.807278-05	7	13
12	f	2025-11-21 21:14:44.808106-05	7	14
13	f	2025-11-21 21:14:44.808977-05	7	15
14	t	2025-11-21 21:14:44.809882-05	8	16
15	f	2025-11-21 21:14:44.81075-05	8	17
16	t	2025-11-21 21:14:44.811696-05	9	18
17	f	2025-11-21 21:14:44.81254-05	9	19
18	t	2025-11-21 21:14:44.813359-05	10	20
19	f	2025-11-21 21:14:44.814197-05	10	21
20	t	2025-11-21 21:14:44.815029-05	11	22
21	f	2025-11-21 21:14:44.815844-05	11	23
22	t	2025-11-21 21:14:44.816697-05	12	24
23	f	2025-11-21 21:14:44.817512-05	12	25
24	t	2025-11-21 21:14:44.818311-05	13	26
25	f	2025-11-21 21:14:44.819199-05	13	27
26	f	2025-11-21 21:14:44.820098-05	13	28
27	t	2025-11-21 21:14:44.820907-05	14	29
28	f	2025-11-21 21:14:44.821729-05	14	30
29	t	2025-11-21 21:14:44.822565-05	15	31
30	f	2025-11-21 21:14:44.823385-05	15	32
31	t	2025-11-21 21:14:44.824199-05	16	33
32	f	2025-11-21 21:14:44.82503-05	16	34
33	t	2025-11-21 21:14:44.8259-05	17	35
34	f	2025-11-21 21:14:44.826766-05	17	36
35	t	2025-11-21 21:14:44.827805-05	18	37
36	f	2025-11-21 21:14:44.829007-05	18	38
37	f	2025-11-21 21:14:44.829978-05	18	39
38	t	2025-11-21 21:14:44.830882-05	19	40
39	f	2025-11-21 21:14:44.831788-05	19	41
40	t	2025-11-21 21:14:44.832682-05	20	42
41	f	2025-11-21 21:14:44.833564-05	20	43
42	t	2025-11-21 21:14:44.834438-05	21	44
43	f	2025-11-21 21:14:44.835304-05	21	45
44	t	2025-11-21 21:14:44.836199-05	22	46
45	f	2025-11-21 21:14:44.837095-05	22	47
46	t	2025-11-21 21:14:44.837977-05	23	48
47	f	2025-11-21 21:14:44.838825-05	23	49
48	t	2025-11-21 21:14:44.839692-05	24	50
49	f	2025-11-21 21:14:44.840542-05	24	51
50	t	2025-11-21 21:14:44.84138-05	25	52
51	f	2025-11-21 21:14:44.842234-05	25	53
52	f	2025-11-21 21:14:44.843086-05	25	54
53	t	2025-11-21 21:14:44.843993-05	26	55
54	f	2025-11-21 21:14:44.844855-05	26	56
55	t	2025-11-21 21:14:44.845718-05	27	57
56	f	2025-11-21 21:14:44.846567-05	27	58
57	t	2025-11-21 21:14:44.847403-05	28	59
58	f	2025-11-21 21:14:44.848232-05	28	60
59	t	2025-11-21 21:14:44.849055-05	29	61
60	f	2025-11-21 21:14:44.849881-05	29	62
61	t	2025-11-21 21:14:44.850733-05	30	63
62	f	2025-11-21 21:14:44.851558-05	30	64
63	t	2025-11-21 21:14:44.852408-05	31	65
64	f	2025-11-21 21:14:44.853238-05	31	66
65	t	2025-11-21 21:14:44.854072-05	32	67
66	f	2025-11-21 21:14:44.854884-05	32	68
67	t	2025-11-21 21:14:44.855715-05	33	69
68	f	2025-11-21 21:14:44.856543-05	33	70
69	t	2025-11-21 21:14:44.857405-05	34	71
70	f	2025-11-21 21:14:44.858231-05	34	72
71	f	2025-11-21 21:14:44.859083-05	34	73
72	t	2025-11-21 21:14:44.859882-05	35	74
73	f	2025-11-21 21:14:44.860752-05	35	75
74	t	2025-11-21 21:14:44.861619-05	36	76
75	f	2025-11-21 21:14:44.862466-05	36	77
76	f	2025-11-21 21:14:44.863255-05	36	78
77	t	2025-11-21 21:14:44.864103-05	37	79
78	f	2025-11-21 21:14:44.864917-05	37	80
79	t	2025-11-21 21:14:44.865718-05	38	81
80	f	2025-11-21 21:14:44.866583-05	38	82
81	f	2025-11-21 21:14:44.867379-05	38	83
82	t	2025-11-21 21:14:44.868181-05	39	84
83	f	2025-11-21 21:14:44.869082-05	39	85
84	t	2025-11-21 21:14:44.86996-05	40	86
85	f	2025-11-21 21:14:44.870801-05	40	87
86	t	2025-11-21 21:14:44.871623-05	41	88
87	f	2025-11-21 21:14:44.872458-05	41	89
88	t	2025-11-21 21:14:44.873302-05	42	90
89	f	2025-11-21 21:14:44.874097-05	42	91
90	t	2025-11-21 21:14:44.874938-05	43	92
91	f	2025-11-21 21:14:44.87576-05	43	93
92	t	2025-11-21 21:14:44.876573-05	44	94
93	f	2025-11-21 21:14:44.877404-05	44	95
94	t	2025-11-21 21:14:44.878275-05	45	96
95	f	2025-11-21 21:14:44.879082-05	45	97
96	t	2025-11-21 21:14:44.879898-05	46	98
97	f	2025-11-21 21:14:44.880742-05	46	99
98	t	2025-11-21 21:14:44.881556-05	47	100
99	f	2025-11-21 21:14:44.882369-05	47	101
100	t	2025-11-21 21:14:44.883191-05	48	102
101	f	2025-11-21 21:14:44.884014-05	48	103
102	f	2025-11-21 21:14:44.884811-05	48	104
103	t	2025-11-21 21:14:44.885668-05	49	105
104	f	2025-11-21 21:14:44.886537-05	49	106
105	t	2025-11-21 21:14:44.887357-05	50	107
106	f	2025-11-21 21:14:44.888145-05	50	108
107	t	2025-11-21 21:14:44.888972-05	51	109
108	f	2025-11-21 21:14:44.889776-05	51	110
109	t	2025-11-21 21:14:44.890564-05	52	111
110	f	2025-11-21 21:14:44.891378-05	52	112
111	t	2025-11-21 21:14:44.892223-05	53	113
112	f	2025-11-21 21:14:44.893058-05	53	114
113	f	2025-11-21 21:14:44.893848-05	53	115
114	t	2025-11-21 21:14:44.894712-05	54	116
115	f	2025-11-21 21:14:44.89552-05	54	117
116	t	2025-11-21 21:14:44.896378-05	55	118
117	f	2025-11-21 21:14:44.897201-05	55	119
118	t	2025-11-21 21:14:44.89801-05	56	120
119	f	2025-11-21 21:14:44.898836-05	56	121
120	f	2025-11-21 21:14:44.899662-05	56	122
121	t	2025-11-21 21:14:44.900483-05	57	123
122	f	2025-11-21 21:14:44.901522-05	57	124
123	f	2025-11-21 21:14:44.902372-05	57	125
124	t	2025-11-21 21:14:44.903243-05	58	126
125	f	2025-11-21 21:14:44.904052-05	58	127
126	t	2025-11-21 21:14:44.90485-05	59	128
127	f	2025-11-21 21:14:44.905696-05	59	129
128	t	2025-11-21 21:14:44.906505-05	60	130
129	f	2025-11-21 21:14:44.907303-05	60	131
130	t	2025-11-21 21:14:44.908118-05	61	132
131	f	2025-11-21 21:14:44.908963-05	61	133
132	t	2025-11-21 21:14:44.909779-05	62	134
133	f	2025-11-21 21:14:44.910576-05	62	135
134	t	2025-11-21 21:14:44.911434-05	63	136
135	f	2025-11-21 21:14:44.912262-05	63	137
136	t	2025-11-21 21:14:44.913056-05	64	138
137	f	2025-11-21 21:14:44.913856-05	64	139
138	f	2025-11-21 21:14:44.914704-05	64	140
139	t	2025-11-21 21:14:44.915507-05	65	141
140	f	2025-11-21 21:14:44.916319-05	65	142
141	t	2025-11-21 21:14:44.917158-05	66	143
142	f	2025-11-21 21:14:44.91796-05	66	144
143	t	2025-11-21 21:14:44.918764-05	67	145
144	f	2025-11-21 21:14:44.919643-05	67	146
145	t	2025-11-21 21:14:44.920481-05	68	147
146	f	2025-11-21 21:14:44.921292-05	68	148
147	t	2025-11-21 21:14:44.922108-05	69	149
148	f	2025-11-21 21:14:44.922957-05	69	150
149	t	2025-11-21 21:14:44.923783-05	70	151
150	f	2025-11-21 21:14:44.924603-05	70	152
151	t	2025-11-21 21:14:44.925446-05	71	153
152	f	2025-11-21 21:14:44.926254-05	71	154
153	t	2025-11-21 21:14:44.927069-05	72	155
154	f	2025-11-21 21:14:44.927996-05	72	156
155	t	2025-11-21 21:14:44.928883-05	73	157
156	f	2025-11-21 21:14:44.929712-05	73	158
157	t	2025-11-21 21:14:44.93051-05	74	159
158	f	2025-11-21 21:14:44.931348-05	74	160
\.


--
-- Data for Name: lease_terminations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lease_terminations (id, termination_id, initiated_by, reason, termination_date, actual_loss, form_type, status, approved_by, approved_at, rejected_by, rejected_at, rejection_reason, completed_at, created_at, updated_at, lease_id) FROM stdin;
\.


--
-- Data for Name: leases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leases (id, lease_id, lease_start, lease_end, rent_amount, rent_due_day, security_deposit, payment_method, status, renewal_reminder_sent, renewal_reminder_sent_at, renewal_decision, renewal_decision_at, renewal_decision_by, created_at, updated_at, unit_id) FROM stdin;
1	mi6qhv249aebd5cb4c3bf067	2025-07-31	2026-07-31	1096.00	1	1096.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.745946-05	2025-11-21 21:14:44.74595-05	91c92ec7-f9f1-434e-8f34-688fb11031a8
2	mi6qi1xa7024934c0ee685f3	2025-02-03	2026-02-03	1711.00	1	1711.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.748385-05	2025-11-21 21:14:44.748387-05	91c92ec7-f9f1-434e-8f34-688fb11031a8
3	mi6qi1xjf71860d383b2bca6	2025-09-08	2026-09-08	2784.00	1	2784.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.749144-05	2025-11-21 21:14:44.749147-05	b6e7a320-1b96-4e50-b067-afcf3ca799f3
4	mi6qi1xn453c345741d58469	2025-06-16	2026-06-16	2402.00	1	2402.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.749896-05	2025-11-21 21:14:44.749898-05	76fb5325-a435-457b-8eae-32256548e788
5	mi6qi1xq47e669d695d635e9	2024-09-03	2025-09-03	1538.00	1	1538.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.750675-05	2025-11-21 21:14:44.750677-05	c2d9426b-70e3-4a70-9ede-6154a104526b
6	mi6qi1xsd1f9dd32c6b46abe	2025-08-26	2026-08-26	1553.00	1	1553.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.751375-05	2025-11-21 21:14:44.751377-05	b317b5a7-a3b9-4765-b2f5-76ac78b05f50
7	mi6qi1xv70be0a4ed706e025	2025-05-23	2026-05-23	1967.00	1	1967.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.752068-05	2025-11-21 21:14:44.75207-05	4749bae8-d28e-422d-98ba-6a0670b1de4f
8	mi6qi1xz63b16613bfc31964	2025-03-11	2026-03-11	1305.00	1	1305.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.752819-05	2025-11-21 21:14:44.752821-05	5b63fa46-f41f-48f7-b638-df4ea001a4cf
9	mi6qi1y1cd8dedaa340285a9	2024-05-10	2025-05-10	2324.00	1	2324.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.753567-05	2025-11-21 21:14:44.753569-05	cb1d520a-4196-4310-87fb-a3fd912b3c39
10	mi6qi1y47035597ca0b24b06	2025-01-25	2026-01-25	1729.00	1	1729.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.754254-05	2025-11-21 21:14:44.754256-05	1d7c9e5a-d0a2-4743-b8a3-7d4b8357a4b3
11	mi6qi1y78f1b87f3e779158a	2024-04-01	2025-04-01	2265.00	1	2265.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.755006-05	2025-11-21 21:14:44.755009-05	abdc0084-a251-4377-85aa-ad211fdaf159
12	mi6qi1y988e1e83886876b7d	2025-10-18	2026-10-18	1185.00	1	1185.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.755747-05	2025-11-21 21:14:44.755749-05	67776e5a-91f1-4892-ade9-d422da6e5f39
13	mi6qi1yd16eb65ea11f25edf	2025-09-24	2026-09-24	1903.00	1	1903.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.75638-05	2025-11-21 21:14:44.756382-05	665e16cc-25ee-453a-8d9c-822ae0a25afe
14	mi6qi1yi7b700eb4b020764d	2024-04-17	2025-04-17	1116.00	1	1116.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.757026-05	2025-11-21 21:14:44.757028-05	c389fdeb-325c-4dcc-9813-0bc986d6abf8
15	mi6qi1ymbbd35db50e9eb167	2024-03-19	2025-03-19	1269.00	1	1269.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.757693-05	2025-11-21 21:14:44.757695-05	846f3d44-f40d-43b1-9c73-5616617545c9
16	mi6qi1yt4812603db7e5b6c1	2024-09-05	2025-09-05	1562.00	1	1562.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.758348-05	2025-11-21 21:14:44.75835-05	949a0ffb-108e-4b3e-b69e-a4e624a7fd40
17	mi6qi1yv530d8840052d8307	2025-08-05	2026-08-05	2969.00	1	2969.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.759031-05	2025-11-21 21:14:44.759034-05	c071ae8d-b681-4f80-920d-6df85cfafac6
18	mi6qi1yyb86e0e8e99c348d3	2024-10-04	2025-10-04	1570.00	1	1570.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.759672-05	2025-11-21 21:14:44.759674-05	b7b7be4e-8062-4d48-9968-3d430c56c032
19	mi6qi1z1dd5c686fcc51c857	2024-10-03	2025-10-03	2037.00	1	2037.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.760306-05	2025-11-21 21:14:44.760308-05	c6264d7d-ad89-44f8-ad3f-d3c89ed700e9
20	mi6qi1z3c0c21f01881c589e	2025-05-02	2026-05-02	1350.00	1	1350.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.761024-05	2025-11-21 21:14:44.761027-05	1257e2c1-6804-419b-8b40-1e2959333ddf
21	mi6qi1z5521b132eab227c94	2024-10-20	2025-10-20	2653.00	1	2653.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.761717-05	2025-11-21 21:14:44.761719-05	51c6f28f-17d3-405b-85a8-dd48a84a9824
22	mi6qi1z89dafbec3dd50f386	2024-12-17	2025-12-17	1117.00	1	1117.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.762352-05	2025-11-21 21:14:44.762354-05	17ff04ca-ad9f-48d4-8a8a-45d993ff5ad8
23	mi6qi1zbddc17e6bdf46445e	2024-01-30	2025-01-30	2150.00	1	2150.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.762969-05	2025-11-21 21:14:44.762971-05	31c7bba2-90aa-4f0c-a84a-6f277d3682f9
24	mi6qi1zc53e17f96f58ba83e	2025-04-11	2026-04-11	2916.00	1	2916.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.763593-05	2025-11-21 21:14:44.763595-05	d1451562-4fc8-4d37-a1a7-6cb84b0befd2
25	mi6qi1zg027c8ff16c62a95e	2025-05-04	2026-05-04	2722.00	1	2722.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.764216-05	2025-11-21 21:14:44.764218-05	0f90592b-144b-43f6-b6ac-6764ec038036
26	mi6qi1zie1c28b5a79ba929d	2024-12-30	2025-12-30	2904.00	1	2904.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.764832-05	2025-11-21 21:14:44.764834-05	a482afe6-a394-47a4-8a07-d0d8fbb37c3f
27	mi6qi1zk6be4b66f1854ef1d	2025-09-10	2026-09-10	1312.00	1	1312.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.765457-05	2025-11-21 21:14:44.765459-05	78aca53d-b8a6-45eb-a767-df513196ed66
28	mi6qi1zmba64cb28f35cf669	2025-08-20	2026-08-20	2460.00	1	2460.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.766092-05	2025-11-21 21:14:44.766094-05	929a21b3-62d2-4c08-bdd3-dd4f0af7cf7c
29	mi6qi1zqa21cfc4ee0a796c5	2025-03-08	2026-03-08	2737.00	1	2737.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.766734-05	2025-11-21 21:14:44.766737-05	07507d9a-5214-4960-986b-a55046e52906
30	mi6qi1zs070d7c0c3b556d44	2024-07-29	2025-07-29	2026.00	1	2026.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.767363-05	2025-11-21 21:14:44.767365-05	0366ba9e-ffba-4cd0-a595-5ab53de5f0a7
31	mi6qi1zu8e168073190d9f0b	2025-01-31	2026-01-31	1133.00	1	1133.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.767972-05	2025-11-21 21:14:44.767974-05	3993abef-4cb2-45d8-b92c-5d759066c104
32	mi6qi1zxad9ac727dfe2b852	2025-07-10	2026-07-10	1001.00	1	1001.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.768624-05	2025-11-21 21:14:44.768627-05	20c38da5-1333-4c1d-bb29-e87af518f8c5
33	mi6qi1zz6d0401f7748f7aa5	2024-03-11	2025-03-11	1793.00	1	1793.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.769303-05	2025-11-21 21:14:44.769305-05	1cb6c8fd-747a-4ffb-8eb3-3d1fabd409cb
34	mi6qi20139a534c9f543cbeb	2024-09-11	2025-09-11	1417.00	1	1417.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.769972-05	2025-11-21 21:14:44.769975-05	614dee33-74d4-4d06-8a92-f1e15fec9e90
35	mi6qi2040c54321642394aff	2025-08-05	2026-08-05	2955.00	1	2955.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.770584-05	2025-11-21 21:14:44.770586-05	e7ca84a1-6cbf-4d33-aec7-99e617cc0cd9
36	mi6qi20607836e36f78e2747	2025-03-09	2026-03-09	2591.00	1	2591.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.771209-05	2025-11-21 21:14:44.771211-05	94023fb4-b9e5-4f9e-a544-58a20de067b5
37	mi6qi209b1d052b537cb459a	2025-01-26	2026-01-26	2294.00	1	2294.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.771824-05	2025-11-21 21:14:44.771826-05	a0e52b2e-f3cd-45ed-a2d6-9bd14c7bd84e
38	mi6qi20ca52449bde037dfbb	2025-10-19	2026-10-19	1045.00	1	1045.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.772449-05	2025-11-21 21:14:44.772452-05	fbb75367-a4cf-4d22-a7bc-3c2a144987bd
39	mi6qi20e62dc4fd325823b54	2024-03-25	2025-03-25	1574.00	1	1574.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.773057-05	2025-11-21 21:14:44.773059-05	4b572fa7-95e4-4884-aad4-cc4491e8c91b
40	mi6qi20he6c4ae312043dafb	2025-05-19	2026-05-19	1526.00	1	1526.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.773669-05	2025-11-21 21:14:44.773671-05	9fb85d9f-3f24-429a-a563-f7b02d64715e
41	mi6qi20j96e036aa09304f3d	2025-03-07	2026-03-07	2888.00	1	2888.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.774276-05	2025-11-21 21:14:44.774278-05	43521577-f405-48e2-bd52-21b22a8b4bb2
42	mi6qi20mda929070fe4e6aca	2024-08-15	2025-08-15	1934.00	1	1934.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.774899-05	2025-11-21 21:14:44.774901-05	8a5ef962-a255-4412-906d-23120343c72a
43	mi6qi20od513787f8928895c	2024-08-20	2025-08-20	1173.00	1	1173.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.775526-05	2025-11-21 21:14:44.775528-05	f510ae4d-e5cc-463a-91b4-e50deba73437
44	mi6qi20r993981e439df65a0	2024-07-08	2025-07-08	2886.00	1	2886.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.776138-05	2025-11-21 21:14:44.77614-05	432a447f-85e2-41ef-8a0f-e1d622d724f2
45	mi6qi20ta1bbef09e3a747e2	2025-03-04	2026-03-04	1344.00	1	1344.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.776748-05	2025-11-21 21:14:44.77675-05	88229d4c-0338-4d7c-ad7b-96eaa860ade5
46	mi6qi20w34ed66c8cf64f74d	2025-05-26	2026-05-26	1680.00	1	1680.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.777418-05	2025-11-21 21:14:44.77742-05	35905032-cf7f-4e39-aff3-5197784b7b58
47	mi6qi20yfa70a59e677625f6	2024-06-23	2025-06-23	1668.00	1	1668.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.778063-05	2025-11-21 21:14:44.778066-05	723d2d2b-eb6a-4cc0-b953-789cefb9b812
48	mi6qi2117b5116b802fd54e0	2025-08-09	2026-08-09	2680.00	1	2680.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.778703-05	2025-11-21 21:14:44.778705-05	8b65dc55-4c60-4976-9859-5301c0a0479f
49	mi6qi2143388c3c9dacc289e	2025-03-01	2026-03-01	1464.00	1	1464.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.779312-05	2025-11-21 21:14:44.779314-05	b51b9da3-f4fb-43c0-9d9a-4406d78747f3
50	mi6qi21699781472e908b9f2	2024-08-07	2025-08-07	1388.00	1	1388.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.77992-05	2025-11-21 21:14:44.779922-05	792fab35-a89c-4583-a02c-cf1b4fde9051
51	mi6qi2194375a2bbc538024e	2025-03-13	2026-03-13	2780.00	1	2780.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.780535-05	2025-11-21 21:14:44.780538-05	49d969c8-fe61-4871-9f5c-50be57b967fd
52	mi6qi21b901a778bf1a82365	2024-04-06	2025-04-06	1076.00	1	1076.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.781165-05	2025-11-21 21:14:44.781167-05	d7638de0-b47e-4adb-9bc5-f2291a9d82bd
53	mi6qi21e5af91cfe5b29c008	2024-11-29	2025-11-29	1475.00	1	1475.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.781774-05	2025-11-21 21:14:44.781776-05	ae9a24ee-f56e-4c22-8822-25ce7fbbece5
54	mi6qi2208fb1aff403f413cc	2025-03-12	2026-03-12	2750.00	1	2750.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.782397-05	2025-11-21 21:14:44.782399-05	0cf4add7-1ecd-4179-9b56-f38efd9b4074
55	mi6qi2225dc5b85d7e5659e9	2024-01-02	2025-01-02	2463.00	1	2463.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.783006-05	2025-11-21 21:14:44.783009-05	f7d0f8c9-97db-4f46-975e-894030934db6
56	mi6qi2245e9f56464d73f440	2025-10-17	2026-10-17	2241.00	1	2241.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.783641-05	2025-11-21 21:14:44.783644-05	5b8c3c8a-3f51-4c01-99dd-cc20289111a2
57	mi6qi227690cb3fd8f5d5ec0	2024-04-09	2025-04-09	1193.00	1	1193.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.784267-05	2025-11-21 21:14:44.784269-05	cf5b7b83-8315-48fd-8838-4ae31883f18d
58	mi6qi229b6bf7ff1b315ea27	2024-05-11	2025-05-11	1924.00	1	1924.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.7849-05	2025-11-21 21:14:44.784902-05	154ce1cf-157d-45ea-b680-cd0d7da31c1f
59	mi6qi22bbad00f25f0474842	2024-01-29	2025-01-29	1584.00	1	1584.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.785508-05	2025-11-21 21:14:44.78551-05	77fa6e88-19d1-4c0b-b064-727af0acee47
60	mi6qi22d0b808228aa917d11	2024-10-04	2025-10-04	2906.00	1	2906.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.786405-05	2025-11-21 21:14:44.786408-05	b659d3b8-f66a-485a-a7d4-b1f73ad454f7
61	mi6qi22fb4ada2a4d8aa2446	2025-03-21	2026-03-21	2551.00	1	2551.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.787036-05	2025-11-21 21:14:44.787038-05	bae9936c-b724-460f-b0b5-a7a5915e6ea7
62	mi6qi22ic49ede7b018bfa43	2024-01-17	2025-01-17	2980.00	1	2980.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.787648-05	2025-11-21 21:14:44.78765-05	3f409566-4081-458b-857e-ee3a99ce76e7
63	mi6qi22k9fcb1b9edcb5cc69	2025-07-30	2026-07-30	1185.00	1	1185.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.788254-05	2025-11-21 21:14:44.788256-05	f85a6d55-c9b0-471d-90f6-4c7b5a4a3ba5
64	mi6qi22md6f9e6f44b464b77	2025-06-27	2026-06-27	2567.00	1	2567.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.788868-05	2025-11-21 21:14:44.78887-05	46000f38-055c-472f-b3bd-16c354deef71
65	mi6qi22p4b193ebb3b3908d3	2025-07-01	2026-07-01	1755.00	1	1755.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.789501-05	2025-11-21 21:14:44.789503-05	7c4fdd97-f209-406b-a7b8-62f1ce154d8b
66	mi6qi22r7d04ef06b4777980	2025-06-09	2026-06-09	1281.00	1	1281.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.790116-05	2025-11-21 21:14:44.790117-05	83851553-268e-4f23-b724-3b463ecb8b5e
67	mi6qi22t65c244c2d1f8ca5f	2025-08-31	2026-08-31	2139.00	1	2139.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.790743-05	2025-11-21 21:14:44.790745-05	59954d1c-aedb-4b68-a239-828de6e4eb91
68	mi6qi22v647b7c8038efa1c1	2025-06-12	2026-06-12	1866.00	1	1866.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.791368-05	2025-11-21 21:14:44.79137-05	4361b84e-9c75-49d1-8809-cf2263d0e58e
69	mi6qi22xfe71fc9aa7d20479	2025-02-11	2026-02-11	1633.00	1	1633.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.792007-05	2025-11-21 21:14:44.792009-05	ffb8b46d-97c1-4c05-b2c2-1f8b4ce58ea5
70	mi6qi22z4e5e8606be9a416f	2024-02-25	2025-02-25	1380.00	1	1380.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.792626-05	2025-11-21 21:14:44.792628-05	dee26ed8-9f8d-4dfa-934c-36b5ab4d9ea8
71	mi6qi231597c10e36c42c440	2024-08-14	2025-08-14	1774.00	1	1774.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.793234-05	2025-11-21 21:14:44.793236-05	65e951b4-4254-454c-9442-f4eed416113b
72	mi6qi233471aa2b7066d5cb4	2024-09-25	2025-09-25	1117.00	1	1117.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.793851-05	2025-11-21 21:14:44.793853-05	8750bfa8-f37a-46bf-a5d5-90edae72fafc
73	mi6qi23558685ba2a9c0b263	2025-07-20	2026-07-20	1431.00	1	1431.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.79457-05	2025-11-21 21:14:44.794573-05	a8532b24-4264-444b-8e00-6cb71cb470e1
74	mi6qi238fa17df10c2cb520b	2024-03-01	2025-03-01	1061.00	1	1061.00	\N	ACTIVE	f	\N	\N	\N	\N	2025-11-21 21:14:44.795283-05	2025-11-21 21:14:44.795285-05	6b6de052-0239-4f79-a0b8-70da15c058e0
\.


--
-- Data for Name: ltb_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ltb_documents (id, form_number, name, description, category, audience, pdf_url, instruction_url, country, province, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: maintenance_comments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.maintenance_comments (id, comment_id, author_email, author_name, author_role, comment, is_status_update, old_status, new_status, created_at, maintenance_request_id) FROM stdin;
\.


--
-- Data for Name: maintenance_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.maintenance_requests (id, request_id, ticket_number, title, description, category, priority, status, initiated_by, requested_date, scheduled_date, completed_date, assigned_to_vendor_id, assigned_to_provider_id, estimated_cost, actual_cost, tenant_approved, landlord_approved, created_by_pmc, pmc_id, photos, before_photos, after_photos, completion_notes, rating, tenant_feedback, last_viewed_by_landlord, last_viewed_by_tenant, created_at, updated_at, property_id, tenant_id) FROM stdin;
\.


--
-- Data for Name: message_attachments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.message_attachments (id, file_name, original_name, file_type, file_size, storage_path, mime_type, uploaded_at, message_id) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, sender_id, sender_role, message_text, is_edited, edited_at, is_read, read_by_landlord, read_by_tenant, read_by_pmc, read_at_landlord, read_at_tenant, read_at_pmc, is_deleted, deleted_at, deleted_by, created_at, updated_at, conversation_id, sender_landlord_id, sender_pmc_id, sender_tenant_id) FROM stdin;
\.


--
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification (id, "userId", "userRole", "userEmail", type, title, message, priority, "entityType", "entityId", "verificationId", "isRead", "readAt", "isArchived", "archivedAt", "emailSent", "emailSentAt", "smsSent", "smsSentAt", "pushSent", "pushSentAt", "actionUrl", "actionLabel", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: notification_preference; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification_preference (id, "userId", "userRole", "userEmail", "notificationType", "emailEnabled", "smsEnabled", "pushEnabled", "sendBeforeDays", "sendOnDay", "sendAfterDays", "quietHoursStart", "quietHoursEnd", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: notification_preferences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification_preferences (id, user_id, user_role, user_email, notification_type, email_enabled, sms_enabled, push_enabled, send_before_days, send_on_day, send_after_days, quiet_hours_start, quiet_hours_end, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, user_role, user_email, notification_type, title, message, priority, entity_type, entity_id, verification_id, is_read, read_at, is_sent, sent_at, email_sent, email_sent_at, sms_sent, sms_sent_at, push_sent, push_sent_at, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: organization_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organization_settings (id, logo_url, primary_color, secondary_color, company_name, features, integrations, email_notifications, sms_notifications, custom_domain, custom_css, created_at, updated_at, organization_id) FROM stdin;
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organizations (id, name, subdomain, plan, status, subscription_id, subscription_status, current_period_start, current_period_end, cancel_at_period_end, max_properties, max_tenants, max_users, max_storage_gb, max_api_calls_per_month, billing_email, billing_address, billing_city, billing_state, billing_postal_code, billing_country, trial_ends_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.permissions (id, category, resource, action, conditions, created_at) FROM stdin;
1	ADMIN	*	MANAGE	\N	2025-11-22 00:01:11.982683-05
2	PROPERTY	*	MANAGE	\N	2025-11-22 00:01:11.985978-05
3	TENANT	*	MANAGE	\N	2025-11-22 00:01:11.987669-05
4	LEASE	*	MANAGE	\N	2025-11-22 00:01:11.989554-05
5	PAYMENT	*	MANAGE	\N	2025-11-22 00:01:11.991878-05
6	MAINTENANCE	*	MANAGE	\N	2025-11-22 00:01:11.993628-05
7	LANDLORD	*	MANAGE	\N	2025-11-22 00:01:11.995157-05
8	PMC	*	MANAGE	\N	2025-11-22 00:01:11.996665-05
9	SETTINGS	*	MANAGE	\N	2025-11-22 00:01:11.998509-05
10	ADMIN	users	MANAGE	\N	2025-11-22 00:01:12.000918-05
11	ADMIN	roles	MANAGE	\N	2025-11-22 00:01:12.002456-05
12	ADMIN	settings	READ	\N	2025-11-22 00:01:12.00397-05
13	PROPERTY	*	READ	\N	2025-11-22 00:01:12.005844-05
14	TENANT	*	READ	\N	2025-11-22 00:01:12.007373-05
15	LEASE	*	READ	\N	2025-11-22 00:01:12.008854-05
16	PAYMENT	*	READ	\N	2025-11-22 00:01:12.010093-05
17	MAINTENANCE	*	READ	\N	2025-11-22 00:01:12.011355-05
18	LANDLORD	*	READ	\N	2025-11-22 00:01:12.018213-05
19	PMC	own	MANAGE	\N	2025-11-22 00:01:12.019555-05
20	UNIT	*	MANAGE	\N	2025-11-22 00:01:12.022884-05
21	UNIT	*	READ	\N	2025-11-22 00:01:12.034828-05
22	PAYMENT	*	WRITE	\N	2025-11-22 00:01:12.038089-05
23	FINANCIAL	*	READ	\N	2025-11-22 00:01:12.041908-05
24	FINANCIAL	*	WRITE	\N	2025-11-22 00:01:12.043215-05
25	PROPERTY	own	MANAGE	\N	2025-11-22 00:01:12.04504-05
26	UNIT	own	MANAGE	\N	2025-11-22 00:01:12.046755-05
27	TENANT	own	READ	\N	2025-11-22 00:01:12.048052-05
28	LEASE	own	READ	\N	2025-11-22 00:01:12.049428-05
29	PAYMENT	own	READ	\N	2025-11-22 00:01:12.050701-05
30	MAINTENANCE	own	READ	\N	2025-11-22 00:01:12.051839-05
31	PROPERTY	own	READ	\N	2025-11-22 00:01:12.053548-05
32	UNIT	own	READ	\N	2025-11-22 00:01:12.054795-05
33	MAINTENANCE	own	MANAGE	\N	2025-11-22 00:01:12.058184-05
34	MAINTENANCE	assigned	MANAGE	\N	2025-11-22 00:01:12.059966-05
35	PROPERTY	assigned	READ	\N	2025-11-22 00:01:12.061186-05
36	ADMIN	audit_logs	READ	\N	2025-11-22 01:49:22.765529-05
37	ADMIN	audit_logs	EXPORT	\N	2025-11-22 01:49:22.769534-05
38	ADMIN	users	READ	\N	2025-11-22 01:49:22.77118-05
39	ADMIN	users	UPDATE	\N	2025-11-22 01:49:22.78178-05
40	MAINTENANCE	*	UPDATE	\N	2025-11-22 01:49:22.786498-05
\.


--
-- Data for Name: platform_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.platform_settings (id, "maintenanceMode", "featureFlags", email, notifications, stripe, "createdAt", "updatedAt") FROM stdin;
platform_settings	f	{"rentPayments": true, "documentVault": true, "tenantInvitations": true, "maintenanceRequests": true}	{"enabled": true, "provider": "gmail"}	{"enabled": true, "channels": ["email"]}	{"enabled": false, "secretKey": "", "webhookSecret": "", "publishableKey": ""}	2025-11-17 23:29:05.781	2025-11-17 23:29:05.781
1	f	{"rentPayments": true, "documentVault": true, "tenantInvitations": true, "maintenanceRequests": true}	{"enabled": true, "provider": "gmail"}	{"enabled": true, "channels": ["email"]}	{}	2025-11-22 11:20:30.534	2025-11-22 06:23:44.305
\.


--
-- Data for Name: properties; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.properties (id, created_at, updated_at, property_name, address_line1, address_line2, city, province_state, postal_zip, country, property_type, unit_count, year_built, square_footage, lot_size, purchase_price, purchase_date, assessed_value, description, notes, image_url, status, landlord_id, pmc_id) FROM stdin;
e35e4721-9574-4f7c-b570-435690165d47	2025-11-21 21:02:00.578055-05	2025-11-21 21:02:00.578241-05	Sunset Suites	5868 Oak Street	Unit 33	Kitchener	ON	M6K 6Y9	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459933_42r6792tu	\N
3c862e28-09f8-4e7a-9f72-05925cded0b3	2025-11-21 21:02:00.581669-05	2025-11-21 21:02:00.581674-05	Garden Village	278 Pine Boulevard		Oshawa	ON	J5B 7B0	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459933_42r6792tu	\N
1abdb90b-2a62-4a4e-83a1-6a34361d016a	2025-11-21 21:02:00.582476-05	2025-11-21 21:02:00.582479-05	Hillside Gardens	1228 Front Avenue		Mississauga	ON	P0S 4A0	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459933_42r6792tu	\N
ab301d27-0a30-42e2-8e42-329310ef159d	2025-11-21 21:02:00.583191-05	2025-11-21 21:02:00.583194-05	Maple Villa	1155 Cedar Drive		Sarnia	ON	S6H 3J4	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459933_42r6792tu	\N
da775e39-a0a5-4439-b135-26cbc68ae7c6	2025-11-21 21:02:00.583888-05	2025-11-21 21:02:00.583891-05	Valley Inn	8074 Front Street		Brantford	ON	G1E 3B6	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459933_42r6792tu	\N
6c6006cb-a822-46d9-ac07-38a5e56f4493	2025-11-21 21:02:00.584654-05	2025-11-21 21:02:00.584656-05	Pine Homes	6173 First Drive		Cornwall	ON	Z1S 5B1	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459933_42r6792tu	\N
4ad5095a-99cf-4c37-8d72-184c1764d56f	2025-11-21 21:02:00.585389-05	2025-11-21 21:02:00.585392-05	Court House	5432 Cedar Court		Timmins	ON	D2W 4H7	CA	Multi-Unit	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459933_42r6792tu	\N
adabad5f-05a6-42ba-99a2-c35708b0ebf4	2025-11-21 21:02:00.586131-05	2025-11-21 21:02:00.586133-05	Meadow Cottages	1527 Queen Street		Mississauga	ON	N1J 6F7	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459933_42r6792tu	\N
46522812-d3cb-41ca-8621-db257a026452	2025-11-21 21:02:00.58688-05	2025-11-21 21:02:00.586882-05	Riverside Suites	2664 Queen Court	Unit 18	Waterloo	ON	R3H 5E1	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459933_42r6792tu	\N
96a8d7aa-2091-467c-8f06-dcdc174a35c8	2025-11-21 21:02:00.587688-05	2025-11-21 21:02:00.58769-05	Meadow Village	3556 Main Crescent	Unit 74	Orillia	ON	F8M 1Y0	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459945_nr6ussfrj	\N
2d7d2902-d9cc-4cfa-b082-97692a64bb1f	2025-11-21 21:02:00.588344-05	2025-11-21 21:02:00.588346-05	Maple Complex	7672 Main Place		St. Catharines	ON	T5T 9S7	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459945_nr6ussfrj	\N
f50d97a4-c195-48c3-b528-23035dc0e7fb	2025-11-21 21:02:00.589003-05	2025-11-21 21:02:00.589007-05	Riverside Cottages	7555 King Avenue		Cornwall	ON	W7M 5H6	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459945_nr6ussfrj	\N
96fac330-0c74-466c-a31c-eb50af40d8b9	2025-11-21 21:02:00.589872-05	2025-11-21 21:02:00.589876-05	Oak Homes	2722 Park Place	Unit 50	Orillia	ON	D9T 5L3	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459945_nr6ussfrj	\N
e0298ba3-8bc8-4843-a831-6c55220803ff	2025-11-21 21:02:00.590845-05	2025-11-21 21:02:00.590848-05	Crest Suites	8897 Maple Street		Barrie	ON	T2R 9T1	CA	Multi-Unit	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459945_nr6ussfrj	\N
445eb493-d179-4c05-8c40-093536a2a2cc	2025-11-21 21:02:00.591535-05	2025-11-21 21:02:00.591538-05	Manor House	5855 Maple Lane		Waterloo	ON	X1A 2H5	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459948_8k66k9kb4	\N
d57a6393-019a-4444-bea0-1f12566e041d	2025-11-21 21:02:00.592188-05	2025-11-21 21:02:00.592191-05	Court Villa	1213 Park Avenue		Orillia	ON	B2C 3D4	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459948_8k66k9kb4	\N
21d4918b-a305-4942-8171-7daab01d301a	2025-11-21 21:02:00.592875-05	2025-11-21 21:02:00.592877-05	Ridge Homes	833 Oak Road		Sarnia	ON	P8B 9T3	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459948_8k66k9kb4	\N
6b75f340-0674-4e78-bf1e-b961f90db1f2	2025-11-21 21:02:00.593557-05	2025-11-21 21:02:00.59356-05	View Suites	875 Second Place		St. Catharines	ON	K0L 1E0	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459948_8k66k9kb4	\N
f4861135-a88f-4ea5-b3dc-de2c15ac3a65	2025-11-21 21:02:00.594293-05	2025-11-21 21:02:00.594295-05	Ridge Residence	927 Church Lane		Thunder Bay	ON	E0J 2R7	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459948_8k66k9kb4	\N
6a1484f6-9a4f-4b00-91c0-4d190485caed	2025-11-21 21:02:00.594997-05	2025-11-21 21:02:00.595-05	Sunrise Complex	1221 Elm Court		Sudbury	ON	S9S 5M7	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459948_8k66k9kb4	\N
2f541d11-b335-4367-97c4-8cffd0827db8	2025-11-21 21:02:00.597496-05	2025-11-21 21:02:00.5975-05	Court Villa	13 Church Place	Unit 53	Toronto	ON	S2F 3T3	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459948_8k66k9kb4	\N
e022065c-0699-4d90-876f-6d24ed30e88c	2025-11-21 21:02:00.599252-05	2025-11-21 21:02:00.599254-05	Sunrise Villa	3727 Bay Place		Cornwall	ON	A8W 5Z4	CA	Multi-Unit	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459948_8k66k9kb4	\N
a02aedb6-6c06-47ee-b4fa-308452ce0300	2025-11-21 21:02:00.599985-05	2025-11-21 21:02:00.599987-05	Valley Apartments	2079 Wellington Lane		Thunder Bay	ON	R6G 2D3	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459950_2ud9maowk	\N
e7e6ae5d-3a00-4f98-a118-39373e6ecb9c	2025-11-21 21:02:00.600697-05	2025-11-21 21:02:00.6007-05	Manor Homes	9061 First Boulevard		North Bay	ON	J9H 8A8	CA	Multi-Unit	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459950_2ud9maowk	\N
b5208a61-3f33-411f-853f-ca1304277c28	2025-11-21 21:02:00.601437-05	2025-11-21 21:02:00.60144-05	Manor Place	1133 King Boulevard	Unit 64	Thunder Bay	ON	P0T 4J2	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459950_2ud9maowk	\N
c84a2a03-2c43-452c-80c5-04c1522a96ec	2025-11-21 21:02:00.602125-05	2025-11-21 21:02:00.602128-05	Valley Residence	9504 Second Drive		Richmond Hill	ON	Z4J 9W6	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459950_2ud9maowk	\N
e638dc22-e815-48b5-9974-3f395c561734	2025-11-21 21:02:00.602822-05	2025-11-21 21:02:00.602825-05	Riverside Apartments	1335 Third Lane	Unit 20	Waterloo	ON	K3A 4T6	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459950_2ud9maowk	\N
7efde364-86b1-4831-a048-4fd2d4b29fa6	2025-11-21 21:02:00.603529-05	2025-11-21 21:02:00.603532-05	Hillside Lodge	1781 Main Place		St. Catharines	ON	W2Z 9E0	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459951_xaidopicm	\N
a99f17b7-c38e-41f0-a489-a39e8b5d7e94	2025-11-21 21:02:00.604227-05	2025-11-21 21:02:00.60423-05	Garden Lodge	8338 Bay Lane		Oshawa	ON	W0E 1K5	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459951_xaidopicm	\N
636b4837-b21e-498a-96ad-b12381d64c09	2025-11-21 21:02:00.604893-05	2025-11-21 21:02:00.604896-05	Oak Village	1525 College Lane		Kingston	ON	Z8L 0L1	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459951_xaidopicm	\N
0b0642c7-91cc-488d-9bd9-8fa3f6e10f3e	2025-11-21 21:02:00.605541-05	2025-11-21 21:02:00.605544-05	Riverside Complex	3203 Victoria Street		Peterborough	ON	V2V 6P1	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459951_xaidopicm	\N
71bf5c8d-e625-4b6f-b03b-60658fa7076e	2025-11-21 21:02:00.606303-05	2025-11-21 21:02:00.606307-05	Lakeside Lodge	7185 Yonge Drive		Pembroke	ON	X0G 7K9	CA	Multi-Unit	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459951_xaidopicm	\N
19068eb7-7961-491e-b51a-27e7a629293c	2025-11-21 21:02:00.607015-05	2025-11-21 21:02:00.607017-05	View Complex	5799 Main Boulevard		Belleville	ON	G5D 6Z3	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459953_9k0mhiks4	\N
a45aa89d-2c3f-40b8-a1c7-b0d3b5743ff8	2025-11-21 21:02:00.607685-05	2025-11-21 21:02:00.607687-05	Sunrise Residence	8244 College Place		Kingston	ON	R2G 0A5	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459953_9k0mhiks4	\N
4908fb52-29c6-44cd-a507-759421ad0b15	2025-11-21 21:02:00.608327-05	2025-11-21 21:02:00.608329-05	Pine Estates	2474 Church Court		Cambridge	ON	Y4K 7B1	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459953_9k0mhiks4	\N
9b7ed28f-b91b-4714-bf1f-377ff0ec5a71	2025-11-21 21:02:00.608967-05	2025-11-21 21:02:00.608969-05	Oak Lodge	937 First Lane		Timmins	ON	Y1R 5W7	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459953_9k0mhiks4	\N
ed1ce9da-3a29-4252-8b32-f7c7664081cd	2025-11-21 21:02:00.609682-05	2025-11-21 21:02:00.609684-05	Ridge Suites	5414 Victoria Boulevard		North Bay	ON	H3S 2H0	CA	Multi-Unit	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459953_9k0mhiks4	\N
a07f683a-aac4-4ea4-ab92-3a261577e9d3	2025-11-21 21:02:00.610449-05	2025-11-21 21:02:00.610452-05	Elm Residence	2389 Front Crescent		Sault Ste. Marie	ON	D0C 7W5	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459956_x6v0haalr	\N
e9bb014a-87fb-47c7-9cd2-2ae4bc8f824b	2025-11-21 21:02:00.611132-05	2025-11-21 21:02:00.611135-05	Court Lodge	4323 Second Street		Kitchener	ON	G0X 6K3	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459956_x6v0haalr	\N
765cbfe2-f4bd-43de-a457-03e7e4b1c1d6	2025-11-21 21:02:00.61184-05	2025-11-21 21:02:00.611843-05	Meadow Apartments	9037 Front Place		Ottawa	ON	P4W 4L1	CA	Multi-Unit	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459956_x6v0haalr	\N
412f1635-deca-4885-bf73-450dd4b452dd	2025-11-21 21:02:00.612631-05	2025-11-21 21:02:00.612633-05	Meadow Residence	978 College Drive		Sudbury	ON	W7N 8K7	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459956_x6v0haalr	\N
ff5c2829-f749-416c-b4cd-b2e63acff943	2025-11-21 21:02:00.613306-05	2025-11-21 21:02:00.613308-05	Court Suites	8067 Cedar Crescent	Unit 33	Burlington	ON	C3X 5K0	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459956_x6v0haalr	\N
8627ba6c-296b-42d8-866f-07feb4b6d881	2025-11-21 21:02:00.613976-05	2025-11-21 21:02:00.61398-05	Riverside Villa	1173 Second Road		Orillia	ON	A5K 5A4	CA	Multi-Unit	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459958_gztj01xmk	\N
3ba89232-dcc0-4e05-8135-943b917f4f0f	2025-11-21 21:02:00.614798-05	2025-11-21 21:02:00.614802-05	Sunrise Village	5629 Church Avenue		Peterborough	ON	F7D 2A0	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459958_gztj01xmk	\N
f788e00e-7531-4e03-82a7-c3d0b6cbd8c7	2025-11-21 21:02:00.615936-05	2025-11-21 21:02:00.615938-05	Ridge Apartments	380 Elm Drive	Unit 74	Sarnia	ON	B7N 4A4	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459958_gztj01xmk	\N
29e08b95-67e3-4dcc-952e-b7f028022606	2025-11-21 21:02:00.616606-05	2025-11-21 21:02:00.616609-05	Manor Place	8801 College Street		Cornwall	ON	E0D 6W2	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459958_gztj01xmk	\N
6a768538-a576-42b9-b1b4-6f581e1ffb8e	2025-11-21 21:02:00.617266-05	2025-11-21 21:02:00.617269-05	Maple Towers	3850 Park Court	Unit 79	Toronto	ON	E8A 9B8	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459958_gztj01xmk	\N
7eb4071c-0eac-47b3-b3c6-c0cf2dfb5fb1	2025-11-21 21:02:00.617957-05	2025-11-21 21:02:00.617959-05	Sunrise Village	9010 Church Crescent		Waterloo	ON	H2T 4F4	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459959_lz6ykg35f	\N
470a59ed-e473-4a1f-80bb-aec3ca54801f	2025-11-21 21:02:00.618648-05	2025-11-21 21:02:00.61865-05	Elm Villa	4862 Cedar Place		Sudbury	ON	M5H 9M2	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459959_lz6ykg35f	\N
6022e29a-85be-4b25-9e0d-92feb1bb6f53	2025-11-21 21:02:00.619314-05	2025-11-21 21:02:00.619317-05	Valley Homes	6806 Third Court		Ottawa	ON	J4D 5E1	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459959_lz6ykg35f	\N
45f1d053-56bc-43d1-9cab-3a184a544b3e	2025-11-21 21:02:00.620003-05	2025-11-21 21:02:00.620006-05	Oak Estates	52 Bay Crescent		Pembroke	ON	A6V 4M7	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459959_lz6ykg35f	\N
d4d47264-a045-48c1-8867-0e5e113959f5	2025-11-21 21:02:00.62078-05	2025-11-21 21:02:00.620782-05	Valley Estates	1826 College Court		Ottawa	ON	R2F 9V9	CA	Multi-Unit	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459959_lz6ykg35f	\N
52c9f468-7049-4ec7-9a58-a31264a79419	2025-11-21 21:02:00.621418-05	2025-11-21 21:02:00.621421-05	Ridge Apartments	4192 Park Road		Peterborough	ON	E6M 7W4	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459959_lz6ykg35f	\N
cde1d980-b4ae-42b5-98ce-75cde7ee6b59	2025-11-21 21:02:00.622059-05	2025-11-21 21:02:00.622062-05	Pine Residence	639 Front Boulevard		Windsor	ON	D1M 6P1	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459959_lz6ykg35f	\N
7e0a7d29-8024-4e1c-b205-e0bbfbe73e0d	2025-11-21 21:02:00.622757-05	2025-11-21 21:02:00.62276-05	Park Apartments	9232 Bay Street		Windsor	ON	S8T 1X8	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459959_lz6ykg35f	\N
33f9b754-1d6f-4f96-add8-a80d99867cec	2025-11-21 21:02:00.623424-05	2025-11-21 21:02:00.623427-05	View Residence	1177 Park Place	Unit 69	Cambridge	ON	Z6N 2B0	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459960_6wlqekzar	\N
64a5fd32-b2f7-4f9a-b9e1-d1778142d743	2025-11-21 21:02:00.624067-05	2025-11-21 21:02:00.62407-05	Valley Apartments	4219 Pine Place		Thunder Bay	ON	X0K 6D7	CA	Multi-Unit	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459960_6wlqekzar	\N
235faaa3-1232-4052-8765-1b8906388238	2025-11-21 21:02:00.624672-05	2025-11-21 21:02:00.624675-05	Pine Homes	1407 Cedar Boulevard		London	ON	Y9S 5V0	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459960_6wlqekzar	\N
b8024b2e-5b3c-41b2-acb0-ce1e9c29d459	2025-11-21 21:02:00.625275-05	2025-11-21 21:02:00.625278-05	Cedar Gardens	335 Dundas Road	Unit 6	Barrie	ON	R8R 8T5	CA	Single Family	1	\N	\N	\N	\N	\N	\N				ACTIVE	lld_1763344459960_6wlqekzar	\N
\.


--
-- Data for Name: property_expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.property_expenses (id, category, amount, date, description, receipt_url, paid_to, payment_method, is_recurring, recurring_frequency, created_by, created_by_pmc, pmc_id, pmc_approval_request_id, created_at, updated_at, maintenance_request_id, property_id) FROM stdin;
\.


--
-- Data for Name: property_management_companies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.property_management_companies (id, company_id, company_name, email, phone, address_line1, address_line2, city, province_state, postal_zip, country, country_code, region_code, default_commission_rate, commission_structure, is_active, approval_status, approved_by, approved_at, rejected_by, rejected_at, rejection_reason, invited_by, invited_at, created_at, updated_at) FROM stdin;
1	PM0B86E902	AB Homes	skolagotla@gmail.com	2128142020	9 Marabrooke Street	\N	Nepean	ON	K2G 7A1	CA	CA	ON	0.05	"null"	t	APPROVED	\N	2025-11-15 00:47:08.114-05	\N	\N	\N	\N	2025-11-14 22:18:55.03-05	2025-11-21 21:22:12.795962-05	2025-11-21 21:22:12.795964-05
2	PMC-1763333400898	Test Property Management Company	testpmc@pmc.local	555-0100	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	APPROVED	\N	2025-11-16 22:50:00.898-05	\N	\N	\N	\N	\N	2025-11-21 21:22:12.797285-05	2025-11-21 21:22:12.797288-05
3	PMC-AB-1763337816527	AB Homes	ab-homes@pmc.local	555-0200	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	APPROVED	\N	2025-11-17 00:03:36.527-05	\N	\N	\N	\N	\N	2025-11-21 21:22:12.798034-05	2025-11-21 21:22:12.798037-05
\.


--
-- Data for Name: rent_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rent_payments (id, payment_id, amount, payment_date, payment_method, payment_for_month, status, reference_number, notes, receipt_url, is_late, late_fee, created_at, updated_at, recorded_by, lease_id) FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.role_permissions (id, conditions, permission_id, role_id) FROM stdin;
276	\N	36	5
277	\N	37	5
278	\N	38	5
279	\N	16	4
280	\N	22	4
281	\N	23	4
282	\N	24	4
283	\N	15	4
284	\N	38	3
285	\N	39	3
286	\N	14	3
287	\N	18	3
288	\N	17	3
289	\N	40	3
221	\N	1	1
222	\N	2	1
223	\N	3	1
224	\N	4	1
225	\N	5	1
226	\N	6	1
227	\N	7	1
228	\N	8	1
229	\N	9	1
230	\N	10	2
231	\N	11	2
232	\N	12	2
233	\N	13	2
234	\N	14	2
235	\N	15	2
236	\N	16	2
237	\N	17	2
238	\N	2	6
239	\N	3	6
240	\N	4	6
241	\N	5	6
242	\N	6	6
243	\N	18	6
244	\N	19	6
245	\N	2	7
246	\N	20	7
247	\N	14	7
248	\N	15	7
249	\N	6	7
250	\N	13	8
251	\N	3	8
252	\N	4	8
253	\N	16	8
254	\N	6	9
255	\N	13	9
256	\N	21	9
257	\N	16	10
258	\N	22	10
259	\N	15	10
260	\N	13	10
261	\N	23	10
262	\N	24	10
263	\N	25	11
264	\N	26	11
265	\N	27	11
266	\N	28	11
267	\N	29	11
268	\N	30	11
269	\N	31	12
270	\N	32	12
271	\N	28	12
272	\N	29	12
273	\N	33	12
274	\N	34	13
275	\N	35	13
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, name, display_name, description, is_active, is_system, created_by, created_by_pmc_id, created_at, updated_at) FROM stdin;
5	AUDIT_ADMIN	Audit Admin	Audit logs and compliance monitoring	t	t	\N	\N	2025-11-22 00:01:11.963502-05	2025-11-22 00:24:30.529685-05
6	PMC_ADMIN	PMC Admin	Property Management Company administrator	t	t	\N	\N	2025-11-22 00:01:11.964486-05	2025-11-22 00:24:30.53036-05
7	PROPERTY_MANAGER	Property Manager	Property and unit management	t	t	\N	\N	2025-11-22 00:01:11.967106-05	2025-11-22 00:24:30.53108-05
8	LEASING_AGENT	Leasing Agent	Lease and tenant management	t	t	\N	\N	2025-11-22 00:01:11.968972-05	2025-11-22 00:24:30.532312-05
9	MAINTENANCE_TECH	Maintenance Technician	Maintenance request management	t	t	\N	\N	2025-11-22 00:01:11.969861-05	2025-11-22 00:24:30.532973-05
10	ACCOUNTANT	Accountant	Financial reporting and accounting	t	t	\N	\N	2025-11-22 00:01:11.971367-05	2025-11-22 00:24:30.53361-05
11	OWNER_LANDLORD	Owner/Landlord	Property owner with full property access	t	t	\N	\N	2025-11-22 00:01:11.972202-05	2025-11-22 00:24:30.534207-05
12	TENANT	Tenant	Tenant with limited access to own data	t	t	\N	\N	2025-11-22 00:01:11.972945-05	2025-11-22 00:24:30.534791-05
13	VENDOR_SERVICE_PROVIDER	Vendor/Service Provider	Service provider with maintenance access	t	t	\N	\N	2025-11-22 00:01:11.973903-05	2025-11-22 00:24:30.535467-05
1	SUPER_ADMIN	Super Admin	Full system access with all permissions	t	t	\N	\N	2025-11-22 00:01:11.952183-05	2025-11-22 00:24:30.526146-05
2	PLATFORM_ADMIN	Platform Admin	Platform administration and user management	t	t	\N	\N	2025-11-22 00:01:11.959927-05	2025-11-22 00:24:30.527641-05
3	SUPPORT_ADMIN	Support Admin	Support ticket management and customer service	t	t	\N	\N	2025-11-22 00:01:11.960896-05	2025-11-22 00:24:30.528268-05
4	BILLING_ADMIN	Billing Admin	Billing and payment management	t	t	\N	\N	2025-11-22 00:01:11.961792-05	2025-11-22 00:24:30.528889-05
\.


--
-- Data for Name: security_deposits; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.security_deposits (id, deposit_id, amount, received_date, payment_method, status, return_date, amount_returned, amount_deducted, deduction_reason, receipt_url, return_receipt_url, created_at, updated_at, lease_id) FROM stdin;
\.


--
-- Data for Name: service_provider_ratings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_provider_ratings (id, rated_by, rated_by_type, rated_by_email, rated_by_name, work_order_id, maintenance_request_id, property_id, unit_id, quality, timeliness, communication, professionalism, overall_rating, review_text, is_public, created_at, updated_at, service_provider_id) FROM stdin;
\.


--
-- Data for Name: service_providers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_providers (id, provider_id, provider_type, company_name, contact_name, email, phone, address_line1, address_line2, city, province_state, postal_zip, country, country_code, region_code, tax_id, license_number, insurance_info, services, specialties, is_active, is_verified, verified_at, verified_by, approval_status, approved_by, approved_at, rejected_by, rejected_at, rejection_reason, invited_by, invited_by_role, invited_at, average_rating, total_ratings, notes, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: support_tickets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.support_tickets (id, ticket_number, subject, description, priority, status, created_by, created_by_email, created_by_name, created_by_role, assigned_to, assigned_to_email, assigned_to_name, contractor_id, vendor_id, service_provider_id, resolved_at, resolved_by, resolution, created_at, updated_at, assigned_to_admin_id, assigned_to_landlord_id, assigned_to_pmc_id, created_by_landlord_id, created_by_tenant_id, property_id) FROM stdin;
\.


--
-- Data for Name: tenant_invitations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tenant_invitations (id, email, invited_by_landlord_id, status, token, expires_at, sent_at, accepted_at, rejected_at, unit_id) FROM stdin;
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tenants (id, tenant_id, first_name, middle_name, last_name, email, phone, address_line1, address_line2, city, province_state, postal_zip, country, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, employer_name, employer_phone, employer_address, occupation, annual_income, status, approval_status, approved_at, rejected_at, rejection_reason, signature_file_name, created_at, updated_at) FROM stdin;
1	TNF6CC0B6D	Gary	\N	Gray	tenant1@test.local	+18095327394	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.631448-05	2025-11-21 21:14:44.631451-05
2	TN8C9AAA6E	Catherine	\N	Estrada	tenant2@test.local	+13439464441	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.634307-05	2025-11-21 21:14:44.63431-05
3	TN6F1D0967	Joshua	\N	Guzman	tenant1_1763601001529_9913@test.local	+16604202972	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.649285-05	2025-11-21 21:14:44.649291-05
4	TN050A12E4	Paul	\N	Williams	tenant2_1763601001533_4166@test.local	+11412827483	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.6503-05	2025-11-21 21:14:44.650303-05
5	TN45A8DBF1	Alexis	\N	Peters	tenant3_1763601001541_5454@test.local	+18697778797	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.651098-05	2025-11-21 21:14:44.651102-05
6	TNE66B8545	Nicholas	\N	Bell	tenant4_1763601001542_2066@test.local	+11105905196	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.651911-05	2025-11-21 21:14:44.651914-05
7	TNFAC0F43B	Pamela	\N	King	tenant5_1763601001545_9037@test.local	+18442920239	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.652835-05	2025-11-21 21:14:44.652839-05
8	TN10829DB8	Sara	\N	French	tenant6_1763601001546_4321@test.local	+17951408492	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.653674-05	2025-11-21 21:14:44.653677-05
9	TN33BCB284	Kevin	\N	Morales	tenant7_1763601001548_9729@test.local	+12822486039	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.654498-05	2025-11-21 21:14:44.6545-05
10	TN45FD3169	Bobby	\N	Castillo	tenant8_1763601001549_6713@test.local	+17413988626	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.655253-05	2025-11-21 21:14:44.655256-05
11	TN8895DCE6	Jessica	\N	Scott	tenant9_1763601001551_1985@test.local	+19234336288	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.656021-05	2025-11-21 21:14:44.656024-05
12	TN775976F0	Frances	\N	Lindsey	tenant10_1763601001551_3439@test.local	+14685315170	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.656783-05	2025-11-21 21:14:44.656786-05
13	TNA7A1F1AF	Angela	\N	Powell	tenant11_1763601001553_2277@test.local	+11931385415	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.657498-05	2025-11-21 21:14:44.6575-05
14	TN92F039B6	Arthur	\N	Bauer	tenant12_1763601001554_3903@test.local	+17218660393	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.658217-05	2025-11-21 21:14:44.65822-05
15	TN2B02226C	Catherine	\N	Ford	tenant13_1763601001554_5721@test.local	+13221291216	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.659026-05	2025-11-21 21:14:44.659028-05
16	TN2CA48A57	Katherine	\N	Garza	tenant14_1763601001557_9642@test.local	+19088641101	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.65975-05	2025-11-21 21:14:44.659753-05
17	TNDB8D6E61	William	\N	Owens	tenant15_1763601001558_7691@test.local	+18272238293	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.660439-05	2025-11-21 21:14:44.660442-05
18	TN3569C36B	Brian	\N	Gross	tenant16_1763601001560_1831@test.local	+14002538130	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.661149-05	2025-11-21 21:14:44.661151-05
19	TNB9FFC654	Cynthia	\N	Schwartz	tenant17_1763601001561_3981@test.local	+12331716842	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.661908-05	2025-11-21 21:14:44.661911-05
20	TNE24C211B	Carl	\N	Ortega	tenant18_1763601001563_8677@test.local	+16593095273	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.662577-05	2025-11-21 21:14:44.662579-05
21	TN7FB87344	Theresa	\N	Copeland	tenant19_1763601001564_8401@test.local	+18657139289	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.663231-05	2025-11-21 21:14:44.663233-05
22	TNB61F7AEF	Sharon	\N	Snyder	tenant20_1763601001565_86@test.local	+16125826897	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.66389-05	2025-11-21 21:14:44.663893-05
23	TN27DC5C69	Russell	\N	Delgado	tenant21_1763601001566_1343@test.local	+19652905769	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.664596-05	2025-11-21 21:14:44.664598-05
24	TN9F970717	Carl	\N	Carter	tenant22_1763601001568_9628@test.local	+14062460638	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.665306-05	2025-11-21 21:14:44.665309-05
25	TN1CBB96B4	Frances	\N	Copeland	tenant23_1763601001569_4519@test.local	+16322834733	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.665999-05	2025-11-21 21:14:44.666001-05
26	TN1005703D	Megan	\N	Phillips	tenant24_1763601001570_4888@test.local	+14268805427	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.666709-05	2025-11-21 21:14:44.666711-05
27	TN7F08ED86	Diane	\N	Mason	tenant25_1763601001572_281@test.local	+19249175139	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.667562-05	2025-11-21 21:14:44.667564-05
28	TNC67DA9D5	Kathleen	\N	Fisher	tenant26_1763601001573_8164@test.local	+18183025945	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.66824-05	2025-11-21 21:14:44.668242-05
29	TN67DE6DD3	Patrick	\N	Osborne	tenant27_1763601001576_8275@test.local	+13963007138	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.668939-05	2025-11-21 21:14:44.668941-05
30	TN130FE986	Ashley	\N	Thompson	tenant28_1763601001577_7587@test.local	+18542592834	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.66971-05	2025-11-21 21:14:44.669712-05
31	TN0C52F171	Mary	\N	Sandoval	tenant29_1763601001580_2196@test.local	+18419481796	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.670438-05	2025-11-21 21:14:44.67044-05
32	TN00DA9F4A	Ronald	\N	Johnston	tenant30_1763601001581_3057@test.local	+11142301823	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.671119-05	2025-11-21 21:14:44.671121-05
33	TN176F11F9	Anthony	\N	Vazquez	tenant31_1763601001586_3248@test.local	+16206070047	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.671784-05	2025-11-21 21:14:44.671786-05
34	TN213F8909	Marie	\N	Doyle	tenant32_1763601001589_750@test.local	+19418501043	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.672466-05	2025-11-21 21:14:44.672469-05
35	TN7C7248FC	Madison	\N	Cook	tenant33_1763601001590_9560@test.local	+15333516698	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.673184-05	2025-11-21 21:14:44.673186-05
36	TNF961B753	Walter	\N	Ruiz	tenant34_1763601001591_3264@test.local	+15162926470	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.673887-05	2025-11-21 21:14:44.673889-05
37	TNF1E9F4C2	Alexis	\N	Pittman	tenant35_1763601001592_7478@test.local	+19372765683	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.674557-05	2025-11-21 21:14:44.67456-05
38	TN8C5C8143	Olivia	\N	Nunez	tenant36_1763601001593_6480@test.local	+19855451712	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.675476-05	2025-11-21 21:14:44.675478-05
39	TNBEBF0C24	Patrick	\N	Holloway	tenant37_1763601001593_113@test.local	+18466556475	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.676182-05	2025-11-21 21:14:44.676184-05
40	TNF693C89C	Joyce	\N	Brady	tenant38_1763601001596_8275@test.local	+13915459829	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.676844-05	2025-11-21 21:14:44.676846-05
41	TN1359EEBF	Gerald	\N	Doyle	tenant39_1763601001596_9360@test.local	+11435280023	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.677529-05	2025-11-21 21:14:44.677531-05
42	TN9CEC5FA3	Adam	\N	Gibbs	tenant40_1763601001598_9910@test.local	+12917030006	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.678273-05	2025-11-21 21:14:44.678275-05
43	TN97894E16	Victoria	\N	Perry	tenant41_1763601001598_7033@test.local	+13249959880	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.678946-05	2025-11-21 21:14:44.678948-05
44	TNF120FC8A	Megan	\N	Murphy	tenant42_1763601001600_1628@test.local	+19243792914	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.679574-05	2025-11-21 21:14:44.679577-05
45	TN30FCFFDE	Deborah	\N	Sherman	tenant43_1763601001601_5244@test.local	+15211652130	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.68018-05	2025-11-21 21:14:44.680182-05
46	TNB89F2EEF	Samuel	\N	Wise	tenant44_1763601001603_1180@test.local	+11374072308	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.680871-05	2025-11-21 21:14:44.680873-05
47	TNB7E0F052	Kenneth	\N	Stokes	tenant45_1763601001603_3299@test.local	+18051116982	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.681544-05	2025-11-21 21:14:44.681546-05
48	TN79F7DB2A	Brandon	\N	Woods	tenant46_1763601001605_7841@test.local	+12983403276	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.682202-05	2025-11-21 21:14:44.682204-05
49	TN89B2312B	Christian	\N	Contreras	tenant47_1763601001606_2134@test.local	+11027503250	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.683457-05	2025-11-21 21:14:44.68346-05
50	TN4C4902FB	Catherine	\N	Ryan	tenant48_1763601001607_3738@test.local	+19582887851	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.68423-05	2025-11-21 21:14:44.684233-05
51	TN9112547B	Stephen	\N	Carroll	tenant49_1763601001608_9162@test.local	+17578547298	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.684894-05	2025-11-21 21:14:44.684896-05
52	TNEFC3E87E	Charles	\N	Gordon	tenant50_1763601001609_2602@test.local	+13531021461	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.685536-05	2025-11-21 21:14:44.685538-05
53	TNEFDE3C9F	Amy	\N	Spencer	tenant51_1763601001610_4997@test.local	+17345360854	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.686199-05	2025-11-21 21:14:44.686202-05
54	TN8E0B7030	Frank	\N	James	tenant52_1763601001611_3047@test.local	+13751949883	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.686879-05	2025-11-21 21:14:44.686881-05
55	TNABF2D29D	Grace	\N	Carroll	tenant53_1763601001613_286@test.local	+18044546062	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.687532-05	2025-11-21 21:14:44.687534-05
56	TNE258F8CD	Bobby	\N	Morgan	tenant54_1763601001614_5945@test.local	+17378004584	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.688301-05	2025-11-21 21:14:44.688303-05
57	TNE72C3BB9	Lori	\N	Powell	tenant55_1763601001615_8432@test.local	+19087998272	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.689288-05	2025-11-21 21:14:44.68929-05
58	TN28945B30	Nicole	\N	Young	tenant56_1763601001616_1065@test.local	+16719623336	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.690221-05	2025-11-21 21:14:44.690223-05
59	TND503B515	Bruce	\N	Peters	tenant57_1763601001617_4147@test.local	+13709657443	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.69125-05	2025-11-21 21:14:44.691252-05
60	TN1C38FDCF	Amber	\N	Stevens	tenant58_1763601001618_637@test.local	+11727003370	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.692041-05	2025-11-21 21:14:44.692044-05
61	TND45E65CD	Bruce	\N	Wood	tenant59_1763601001620_7197@test.local	+11619941511	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.692758-05	2025-11-21 21:14:44.69276-05
62	TN8917930C	Nancy	\N	Parsons	tenant60_1763601001621_1900@test.local	+18992324034	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.693517-05	2025-11-21 21:14:44.693523-05
63	TN55610F23	Cheryl	\N	Bell	tenant61_1763601001623_6484@test.local	+17151013148	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.69421-05	2025-11-21 21:14:44.694212-05
64	TN684BB785	Noah	\N	Ruiz	tenant62_1763601001623_282@test.local	+12049780761	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.694909-05	2025-11-21 21:14:44.694912-05
65	TNEEDC004C	Logan	\N	Holloway	tenant63_1763601001625_7539@test.local	+14327452698	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.695562-05	2025-11-21 21:14:44.695564-05
66	TN8BFC897B	Christina	\N	Sherman	tenant64_1763601001625_6935@test.local	+14757352833	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.696188-05	2025-11-21 21:14:44.696191-05
67	TNBE1F860D	Madison	\N	Holloway	tenant65_1763601001627_8454@test.local	+12179699995	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.696804-05	2025-11-21 21:14:44.696807-05
68	TN00991CAC	Nathan	\N	Mcbride	tenant66_1763601001628_2257@test.local	+17947392248	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.697451-05	2025-11-21 21:14:44.697453-05
69	TNECE4005D	Randy	\N	Klein	tenant67_1763601001629_9443@test.local	+16333100387	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.698234-05	2025-11-21 21:14:44.698236-05
70	TN3A089101	Joseph	\N	Crawford	tenant68_1763601001630_4327@test.local	+18183803989	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.698904-05	2025-11-21 21:14:44.698906-05
71	TN91D33DC3	Marie	\N	Black	tenant69_1763601001632_731@test.local	+18917616490	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.699535-05	2025-11-21 21:14:44.699538-05
72	TN9FDFCC11	Kyle	\N	Hudson	tenant70_1763601001632_5979@test.local	+17989396120	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.700195-05	2025-11-21 21:14:44.700197-05
73	TN73693B1E	Jacob	\N	Silva	tenant71_1763601001633_1132@test.local	+14964024682	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.700915-05	2025-11-21 21:14:44.700917-05
74	TNFB2A37BD	Danielle	\N	Johnston	tenant72_1763601001635_6530@test.local	+14204035035	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.701563-05	2025-11-21 21:14:44.701565-05
75	TN5CA8787A	Sara	\N	Stewart	tenant73_1763601001635_6448@test.local	+16557939088	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.70221-05	2025-11-21 21:14:44.702213-05
76	TNA62F0E25	Edward	\N	Moran	tenant74_1763601001637_7190@test.local	+11857550504	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.702892-05	2025-11-21 21:14:44.702894-05
77	TN5B794C0C	William	\N	Lawrence	tenant75_1763601001637_6290@test.local	+11303103141	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.70357-05	2025-11-21 21:14:44.703573-05
78	TN58AF0319	Carolyn	\N	Floyd	tenant76_1763601001638_9917@test.local	+16134441489	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.704173-05	2025-11-21 21:14:44.704175-05
79	TN3BFB1751	Jose	\N	Kennedy	tenant77_1763601001639_9196@test.local	+14665385547	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.704788-05	2025-11-21 21:14:44.70479-05
80	TN0B82EFB3	Maria	\N	Stone	tenant78_1763601001640_1367@test.local	+12425230952	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.705401-05	2025-11-21 21:14:44.705404-05
81	TNF3A91316	Denise	\N	Dunn	tenant79_1763601001642_1508@test.local	+16708383555	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.706037-05	2025-11-21 21:14:44.706039-05
82	TNA74D6DF4	Tyler	\N	Hodges	tenant80_1763601001642_3387@test.local	+13038895314	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.706708-05	2025-11-21 21:14:44.70671-05
83	TNE264348E	Amanda	\N	Wallace	tenant81_1763601001643_6971@test.local	+19619655010	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.707183-05	2025-11-21 21:14:44.707185-05
84	TN1FB7440C	Deborah	\N	Wise	tenant82_1763601001645_2130@test.local	+13672807517	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.70768-05	2025-11-21 21:14:44.707682-05
85	TN56D06493	Logan	\N	Medina	tenant83_1763601001646_3112@test.local	+18101340400	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.708169-05	2025-11-21 21:14:44.708171-05
86	TN2ECE849E	Christina	\N	Pittman	tenant84_1763601001647_3944@test.local	+14438770244	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.708659-05	2025-11-21 21:14:44.708662-05
87	TN4713A363	David	\N	Gonzales	tenant85_1763601001648_2257@test.local	+14435150674	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.709087-05	2025-11-21 21:14:44.70909-05
88	TN27062768	Dylan	\N	Roy	tenant86_1763601001649_9062@test.local	+11147862670	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.709552-05	2025-11-21 21:14:44.709554-05
89	TN90C5B5F2	Diane	\N	Ortiz	tenant87_1763601001650_9156@test.local	+13535792172	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.709979-05	2025-11-21 21:14:44.709981-05
90	TN13F650B5	Kelly	\N	Cook	tenant88_1763601001652_1881@test.local	+12426250105	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.710403-05	2025-11-21 21:14:44.710405-05
91	TN67BF5BEF	Juan	\N	Barnes	tenant89_1763601001653_2748@test.local	+11803017715	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.710931-05	2025-11-21 21:14:44.710933-05
92	TN8D7830C6	Joyce	\N	Colon	tenant90_1763601001655_7552@test.local	+17626883375	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.711409-05	2025-11-21 21:14:44.711412-05
93	TN919A2A02	Joseph	\N	Edwards	tenant91_1763601001656_650@test.local	+13537264527	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.711842-05	2025-11-21 21:14:44.711845-05
94	TN07CEF820	Louis	\N	Salazar	tenant92_1763601001657_29@test.local	+12532398790	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.712269-05	2025-11-21 21:14:44.712271-05
95	TN8C8C55AC	Michelle	\N	Zimmerman	tenant93_1763601001658_2201@test.local	+16897117183	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.712686-05	2025-11-21 21:14:44.712688-05
96	TN013AE0ED	Andrew	\N	Richards	tenant94_1763601001660_1754@test.local	+12285843918	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.713137-05	2025-11-21 21:14:44.713139-05
97	TNEDC01BBA	Jordan	\N	Roy	tenant95_1763601001660_7536@test.local	+18163766480	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.713566-05	2025-11-21 21:14:44.713568-05
98	TN7B870EC2	William	\N	Watkins	tenant96_1763601001663_5857@test.local	+16767092968	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.714036-05	2025-11-21 21:14:44.714038-05
99	TN85324918	Laura	\N	Lane	tenant97_1763601001663_2884@test.local	+18788587309	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.714465-05	2025-11-21 21:14:44.714468-05
100	TN6024764D	George	\N	Hall	tenant98_1763601001665_8646@test.local	+11459148626	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.71491-05	2025-11-21 21:14:44.714912-05
101	TN73768012	Judith	\N	Anderson	tenant99_1763601001665_7002@test.local	+12047525903	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.715349-05	2025-11-21 21:14:44.715351-05
102	TNA5235412	Russell	\N	Copeland	tenant100_1763601001667_648@test.local	+11498725366	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.715768-05	2025-11-21 21:14:44.71577-05
103	TNEBDBE067	Jennifer	\N	Patel	tenant101_1763601001668_4290@test.local	+12267669718	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.716186-05	2025-11-21 21:14:44.716188-05
104	TN15779234	George	\N	Osborne	tenant102_1763601001668_3543@test.local	+19929590739	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.716643-05	2025-11-21 21:14:44.716645-05
105	TN4C3D5E7A	Austin	\N	Pittman	tenant103_1763601001671_9982@test.local	+11046192457	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.717112-05	2025-11-21 21:14:44.717114-05
106	TN8B2D1E93	Patricia	\N	Day	tenant104_1763601001671_4096@test.local	+11963866855	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.717548-05	2025-11-21 21:14:44.71755-05
107	TNC1785BE7	Lisa	\N	Brown	tenant105_1763601001673_9556@test.local	+15636140265	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.718022-05	2025-11-21 21:14:44.718024-05
108	TNCF3065CF	Gary	\N	Gonzales	tenant106_1763601001673_5446@test.local	+19795182293	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.71851-05	2025-11-21 21:14:44.718512-05
109	TNB131100C	Anna	\N	Hansen	tenant107_1763601001675_3813@test.local	+18401763350	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.718979-05	2025-11-21 21:14:44.718981-05
110	TN9F5260BC	Alexander	\N	Collins	tenant108_1763601001676_4124@test.local	+19862884474	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.719464-05	2025-11-21 21:14:44.719466-05
111	TNE9E41D8F	Nancy	\N	Copeland	tenant109_1763601001678_9915@test.local	+13199662957	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.719925-05	2025-11-21 21:14:44.719927-05
112	TN91C65FA9	Marilyn	\N	Doyle	tenant110_1763601001679_1710@test.local	+15702548928	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.720375-05	2025-11-21 21:14:44.720378-05
113	TN3514005C	Kimberly	\N	Kelly	tenant111_1763601001681_37@test.local	+17051333168	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.720809-05	2025-11-21 21:14:44.720811-05
114	TND9114BB9	Andrea	\N	Moran	tenant112_1763601001681_7774@test.local	+12526012031	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.721238-05	2025-11-21 21:14:44.72124-05
115	TNAE02CC21	Steven	\N	Stokes	tenant113_1763601001682_847@test.local	+18699842764	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.721649-05	2025-11-21 21:14:44.721651-05
116	TNFF9D3701	Steven	\N	Aguilar	tenant114_1763601001703_8200@test.local	+14284155866	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.722088-05	2025-11-21 21:14:44.72209-05
117	TN810242E7	Carol	\N	Simmons	tenant115_1763601001704_8596@test.local	+13163626272	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.722539-05	2025-11-21 21:14:44.722541-05
118	TNA177CCAD	Maria	\N	Vargas	tenant116_1763601001705_1954@test.local	+14225538229	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.722993-05	2025-11-21 21:14:44.722995-05
119	TN6D09713A	Marilyn	\N	Bowman	tenant117_1763601001705_704@test.local	+12523523145	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.723412-05	2025-11-21 21:14:44.723414-05
120	TNF0E5C03D	Susan	\N	Lane	tenant118_1763601001707_3899@test.local	+13595391192	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.723846-05	2025-11-21 21:14:44.723848-05
121	TN51FB8C6F	Christopher	\N	Santos	tenant119_1763601001707_6616@test.local	+17304826153	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.724268-05	2025-11-21 21:14:44.72427-05
122	TN14D37AC5	Samuel	\N	Watkins	tenant120_1763601001708_9780@test.local	+18404968973	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.724677-05	2025-11-21 21:14:44.72468-05
123	TNFEBB83A3	Judith	\N	Holmes	tenant121_1763601001710_3363@test.local	+17295054649	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.725114-05	2025-11-21 21:14:44.725116-05
124	TNE9E34F38	Jose	\N	Richardson	tenant122_1763601001710_9098@test.local	+11194048341	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.72556-05	2025-11-21 21:14:44.725562-05
125	TN7C2DD650	Debra	\N	Armstrong	tenant123_1763601001711_5948@test.local	+17511129507	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.725986-05	2025-11-21 21:14:44.725988-05
126	TNEA43D1EF	Jessica	\N	Mcbride	tenant124_1763601001712_7151@test.local	+16195310187	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.726438-05	2025-11-21 21:14:44.72644-05
127	TNE73D8B89	Christopher	\N	Burns	tenant125_1763601001713_2477@test.local	+15278010366	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.726862-05	2025-11-21 21:14:44.726864-05
128	TN595FC70D	Marie	\N	Briggs	tenant126_1763601001714_108@test.local	+15779291747	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.727319-05	2025-11-21 21:14:44.727322-05
129	TN1BC71FD3	Nathan	\N	George	tenant127_1763601001715_8888@test.local	+11758040429	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.72781-05	2025-11-21 21:14:44.727813-05
130	TNEF242B18	Sharon	\N	Powell	tenant128_1763601001716_3043@test.local	+15132092929	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.728271-05	2025-11-21 21:14:44.728273-05
131	TN16575746	Stephanie	\N	Shaw	tenant129_1763601001717_4119@test.local	+12552640429	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.728731-05	2025-11-21 21:14:44.728733-05
132	TNEE0CDCF4	Frank	\N	Bell	tenant130_1763601001718_8341@test.local	+16859937072	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.729182-05	2025-11-21 21:14:44.729184-05
133	TNE3B116A9	Jeffrey	\N	Pierce	tenant131_1763601001719_5735@test.local	+17823230731	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.729641-05	2025-11-21 21:14:44.729643-05
134	TNDFA5124A	Carolyn	\N	Nguyen	tenant132_1763601001720_8324@test.local	+12927978093	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.730076-05	2025-11-21 21:14:44.730078-05
135	TN77C2DB85	Anna	\N	Ruiz	tenant133_1763601001721_2521@test.local	+11251747814	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.730499-05	2025-11-21 21:14:44.730501-05
136	TNE39AF730	Stephanie	\N	Evans	tenant134_1763601001723_934@test.local	+11073655318	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.730947-05	2025-11-21 21:14:44.730949-05
137	TN1D844C34	Justin	\N	Perry	tenant135_1763601001723_9623@test.local	+12125538708	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.7314-05	2025-11-21 21:14:44.731402-05
138	TNDAB29E47	Douglas	\N	Sullivan	tenant136_1763601001725_2170@test.local	+12868252729	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.731838-05	2025-11-21 21:14:44.73184-05
139	TNAEA6848C	Jose	\N	Lane	tenant137_1763601001725_7968@test.local	+11087175334	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.732262-05	2025-11-21 21:14:44.732265-05
140	TN5D4C6402	Jack	\N	Moran	tenant138_1763601001726_9162@test.local	+11659359625	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.732691-05	2025-11-21 21:14:44.732693-05
141	TN5AB4235E	Benjamin	\N	Thompson	tenant139_1763601001728_8603@test.local	+17837402273	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.733136-05	2025-11-21 21:14:44.733139-05
142	TNBA7F00EC	Samantha	\N	Tucker	tenant140_1763601001728_4319@test.local	+18419617216	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.73358-05	2025-11-21 21:14:44.733582-05
143	TN9C070884	Jeremy	\N	Walker	tenant141_1763601001730_5826@test.local	+11264490570	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.734033-05	2025-11-21 21:14:44.734036-05
144	TNEED8F85F	Walter	\N	Roy	tenant142_1763601001730_8786@test.local	+19498046773	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.734474-05	2025-11-21 21:14:44.734476-05
145	TN994A1EA7	Keith	\N	Ruiz	tenant143_1763601001732_2821@test.local	+18457756215	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.734914-05	2025-11-21 21:14:44.734917-05
146	TN76AC249B	Michelle	\N	Houston	tenant144_1763601001733_371@test.local	+16193164521	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.735356-05	2025-11-21 21:14:44.735358-05
147	TNA09A0EF2	Judith	\N	Black	tenant145_1763601001734_7909@test.local	+15626261859	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.735844-05	2025-11-21 21:14:44.735846-05
148	TN6B1AD20E	Frank	\N	Robinson	tenant146_1763601001734_9557@test.local	+14049593724	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.736274-05	2025-11-21 21:14:44.736277-05
149	TN19078AA9	Larry	\N	Moran	tenant147_1763601001736_7213@test.local	+13534291572	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.736758-05	2025-11-21 21:14:44.73676-05
150	TN9BBF6898	Sharon	\N	Hernandez	tenant148_1763601001736_6231@test.local	+14233614916	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.737224-05	2025-11-21 21:14:44.737226-05
151	TNE466DF55	Joyce	\N	Kelley	tenant149_1763601001738_8616@test.local	+13048329719	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.737685-05	2025-11-21 21:14:44.737687-05
152	TN32C4CD47	Joshua	\N	Thompson	tenant150_1763601001738_6955@test.local	+15844123472	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.73814-05	2025-11-21 21:14:44.738142-05
153	TN65B996DB	Alan	\N	Willis	tenant151_1763601001740_6750@test.local	+19291630353	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.738602-05	2025-11-21 21:14:44.738604-05
154	TN56BF0CB2	Louis	\N	Ross	tenant152_1763601001741_3535@test.local	+15588865433	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.739085-05	2025-11-21 21:14:44.739087-05
155	TNCCB95B44	Christine	\N	Gross	tenant153_1763601001742_5724@test.local	+11165641019	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.739562-05	2025-11-21 21:14:44.739564-05
156	TN8863F388	Mark	\N	Morgan	tenant154_1763601001743_8171@test.local	+15304833952	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.740025-05	2025-11-21 21:14:44.740027-05
157	TN8AA677E4	Rebecca	\N	Delgado	tenant155_1763601001744_3568@test.local	+14532113091	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.7405-05	2025-11-21 21:14:44.740502-05
158	TN98662457	Julie	\N	Cox	tenant156_1763601001745_9852@test.local	+13453040258	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.74095-05	2025-11-21 21:14:44.740952-05
159	TN0F37CA41	Christian	\N	Nunez	tenant157_1763601001747_7120@test.local	+18345368742	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.74156-05	2025-11-21 21:14:44.741563-05
160	TNBD5B81F3	Louis	\N	Cook	tenant158_1763601001747_9516@test.local	+16622386267	\N	\N	\N	Ontario	\N	Canada	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	APPROVED	\N	\N	\N	\N	2025-11-21 21:14:44.742033-05	2025-11-21 21:14:44.742035-05
\.


--
-- Data for Name: ticket_attachments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ticket_attachments (id, file_name, original_name, file_type, file_size, storage_path, mime_type, uploaded_at, ticket_id) FROM stdin;
\.


--
-- Data for Name: ticket_notes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ticket_notes (id, content, created_by, created_by_email, created_by_name, created_by_role, is_internal, created_at, updated_at, ticket_id) FROM stdin;
\.


--
-- Data for Name: unified_verification_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.unified_verification_history (id, action, performed_by, performed_by_role, performed_by_email, performed_by_name, previous_status, new_status, notes, metadata, created_at, verification_id) FROM stdin;
\.


--
-- Data for Name: unified_verifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.unified_verifications (id, verification_type, entity_type, entity_id, requested_by, requested_by_role, requested_by_email, requested_by_name, assigned_to, assigned_to_role, assigned_to_email, assigned_to_name, verified_by, verified_by_role, verified_by_email, verified_by_name, status, priority, requested_at, verified_at, rejected_at, expired_at, cancelled_at, due_date, title, description, notes, verification_notes, rejection_reason, file_name, original_name, file_url, file_size, mime_type, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: units; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.units (id, created_at, updated_at, unit_name, bedrooms, bathrooms, square_feet, floor_number, rent_price, security_deposit, status, has_parking, has_storage, has_balcony, is_furnished, pets_allowed, description, notes, property_id) FROM stdin;
91c92ec7-f9f1-434e-8f34-688fb11031a8	2025-11-21 21:14:44.519732-05	2025-11-21 21:14:44.519943-05	Main Unit	4	1.5	\N	\N	2762.00	1723.00	VACANT	f	f	f	f	f			e35e4721-9574-4f7c-b570-435690165d47
b6e7a320-1b96-4e50-b067-afcf3ca799f3	2025-11-21 21:14:44.525865-05	2025-11-21 21:14:44.525868-05	Main Unit	2	1.5	\N	\N	2448.00	2103.00	VACANT	f	f	f	f	f			3c862e28-09f8-4e7a-9f72-05925cded0b3
76fb5325-a435-457b-8eae-32256548e788	2025-11-21 21:14:44.527207-05	2025-11-21 21:14:44.527211-05	Main Unit	2	2.5	\N	\N	1650.00	1081.00	VACANT	f	f	f	f	f			1abdb90b-2a62-4a4e-83a1-6a34361d016a
c2d9426b-70e3-4a70-9ede-6154a104526b	2025-11-21 21:14:44.528526-05	2025-11-21 21:14:44.52853-05	Main Unit	3	2.5	\N	\N	3406.00	1561.00	VACANT	f	f	f	f	f			ab301d27-0a30-42e2-8e42-329310ef159d
b317b5a7-a3b9-4765-b2f5-76ac78b05f50	2025-11-21 21:14:44.529906-05	2025-11-21 21:14:44.529909-05	Main Unit	3	2.5	\N	\N	2461.00	2465.00	VACANT	f	f	f	f	f			da775e39-a0a5-4439-b135-26cbc68ae7c6
4749bae8-d28e-422d-98ba-6a0670b1de4f	2025-11-21 21:14:44.531252-05	2025-11-21 21:14:44.531255-05	Main Unit	2	2.5	\N	\N	2387.00	1850.00	VACANT	f	f	f	f	f			6c6006cb-a822-46d9-ac07-38a5e56f4493
997a9aea-e721-4b7d-b7e7-d616b10e8508	2025-11-21 21:14:44.532502-05	2025-11-21 21:14:44.532505-05	Unit 1	1	2.0	\N	5	2408.00	2553.00	VACANT	f	f	f	f	f			4ad5095a-99cf-4c37-8d72-184c1764d56f
5b63fa46-f41f-48f7-b638-df4ea001a4cf	2025-11-21 21:14:44.534219-05	2025-11-21 21:14:44.534222-05	Unit 2	1	1.0	\N	1	1744.00	2835.00	VACANT	f	f	f	f	f			4ad5095a-99cf-4c37-8d72-184c1764d56f
cb1d520a-4196-4310-87fb-a3fd912b3c39	2025-11-21 21:14:44.535413-05	2025-11-21 21:14:44.535415-05	Unit 3	1	2.0	\N	2	1381.00	1105.00	VACANT	f	f	f	f	f			4ad5095a-99cf-4c37-8d72-184c1764d56f
1d7c9e5a-d0a2-4743-b8a3-7d4b8357a4b3	2025-11-21 21:14:44.536767-05	2025-11-21 21:14:44.53677-05	Unit 4	2	2.0	\N	3	1643.00	1183.00	VACANT	f	f	f	f	f			4ad5095a-99cf-4c37-8d72-184c1764d56f
abdc0084-a251-4377-85aa-ad211fdaf159	2025-11-21 21:14:44.538101-05	2025-11-21 21:14:44.538104-05	Main Unit	4	1.5	\N	\N	1524.00	2304.00	VACANT	f	f	f	f	f			adabad5f-05a6-42ba-99a2-c35708b0ebf4
67776e5a-91f1-4892-ade9-d422da6e5f39	2025-11-21 21:14:44.539329-05	2025-11-21 21:14:44.539332-05	Main Unit	3	2.5	\N	\N	3452.00	1290.00	VACANT	f	f	f	f	f			46522812-d3cb-41ca-8621-db257a026452
665e16cc-25ee-453a-8d9c-822ae0a25afe	2025-11-21 21:14:44.540458-05	2025-11-21 21:14:44.540461-05	Main Unit	2	1.5	\N	\N	2761.00	1265.00	VACANT	f	f	f	f	f			96a8d7aa-2091-467c-8f06-dcdc174a35c8
c389fdeb-325c-4dcc-9813-0bc986d6abf8	2025-11-21 21:14:44.541667-05	2025-11-21 21:14:44.54167-05	Main Unit	4	2.5	\N	\N	1533.00	1260.00	VACANT	f	f	f	f	f			2d7d2902-d9cc-4cfa-b082-97692a64bb1f
846f3d44-f40d-43b1-9c73-5616617545c9	2025-11-21 21:14:44.542913-05	2025-11-21 21:14:44.542915-05	Main Unit	3	2.5	\N	\N	3391.00	1622.00	VACANT	f	f	f	f	f			f50d97a4-c195-48c3-b528-23035dc0e7fb
949a0ffb-108e-4b3e-b69e-a4e624a7fd40	2025-11-21 21:14:44.544048-05	2025-11-21 21:14:44.544052-05	Main Unit	3	1.5	\N	\N	1756.00	1218.00	VACANT	f	f	f	f	f			96fac330-0c74-466c-a31c-eb50af40d8b9
b5e67f02-b211-4870-b113-9a80bd4a4098	2025-11-21 21:14:44.545285-05	2025-11-21 21:14:44.545288-05	Unit 1	1	2.0	\N	5	2492.00	2002.00	VACANT	f	f	f	f	f			e0298ba3-8bc8-4843-a831-6c55220803ff
c071ae8d-b681-4f80-920d-6df85cfafac6	2025-11-21 21:14:44.546385-05	2025-11-21 21:14:44.546388-05	Unit 2	1	2.0	\N	5	1955.00	1401.00	VACANT	f	f	f	f	f			e0298ba3-8bc8-4843-a831-6c55220803ff
b7b7be4e-8062-4d48-9968-3d430c56c032	2025-11-21 21:14:44.547482-05	2025-11-21 21:14:44.547484-05	Unit 3	1	1.0	\N	1	1301.00	1101.00	VACANT	f	f	f	f	f			e0298ba3-8bc8-4843-a831-6c55220803ff
c6264d7d-ad89-44f8-ad3f-d3c89ed700e9	2025-11-21 21:14:44.548619-05	2025-11-21 21:14:44.548622-05	Unit 4	1	1.0	\N	4	1229.00	2815.00	VACANT	f	f	f	f	f			e0298ba3-8bc8-4843-a831-6c55220803ff
1257e2c1-6804-419b-8b40-1e2959333ddf	2025-11-21 21:14:44.549829-05	2025-11-21 21:14:44.549832-05	Main Unit	4	2.5	\N	\N	2544.00	2661.00	VACANT	f	f	f	f	f			445eb493-d179-4c05-8c40-093536a2a2cc
51c6f28f-17d3-405b-85a8-dd48a84a9824	2025-11-21 21:14:44.550972-05	2025-11-21 21:14:44.550975-05	Main Unit	4	2.5	\N	\N	3373.00	2861.00	VACANT	f	f	f	f	f			d57a6393-019a-4444-bea0-1f12566e041d
17ff04ca-ad9f-48d4-8a8a-45d993ff5ad8	2025-11-21 21:14:44.552024-05	2025-11-21 21:14:44.552026-05	Main Unit	3	2.5	\N	\N	2817.00	2605.00	VACANT	f	f	f	f	f			21d4918b-a305-4942-8171-7daab01d301a
31c7bba2-90aa-4f0c-a84a-6f277d3682f9	2025-11-21 21:14:44.553195-05	2025-11-21 21:14:44.553198-05	Main Unit	2	2.5	\N	\N	3436.00	1340.00	VACANT	f	f	f	f	f			6b75f340-0674-4e78-bf1e-b961f90db1f2
d1451562-4fc8-4d37-a1a7-6cb84b0befd2	2025-11-21 21:14:44.554275-05	2025-11-21 21:14:44.554278-05	Main Unit	3	1.5	\N	\N	1783.00	1046.00	VACANT	f	f	f	f	f			f4861135-a88f-4ea5-b3dc-de2c15ac3a65
76b705f2-24be-4d53-93dd-ee21dcccd705	2025-11-21 21:14:44.555327-05	2025-11-21 21:14:44.55533-05	Main Unit	4	2.5	\N	\N	2190.00	2586.00	VACANT	f	f	f	f	f			6a1484f6-9a4f-4b00-91c0-4d190485caed
0f90592b-144b-43f6-b6ac-6764ec038036	2025-11-21 21:14:44.556432-05	2025-11-21 21:14:44.556435-05	Main Unit	4	1.5	\N	\N	1588.00	1832.00	VACANT	f	f	f	f	f			2f541d11-b335-4367-97c4-8cffd0827db8
a482afe6-a394-47a4-8a07-d0d8fbb37c3f	2025-11-21 21:14:44.55752-05	2025-11-21 21:14:44.557523-05	Unit 1	3	2.0	\N	5	1497.00	1651.00	VACANT	f	f	f	f	f			e022065c-0699-4d90-876f-6d24ed30e88c
78aca53d-b8a6-45eb-a767-df513196ed66	2025-11-21 21:14:44.55862-05	2025-11-21 21:14:44.558622-05	Unit 2	3	2.0	\N	4	2053.00	1794.00	VACANT	f	f	f	f	f			e022065c-0699-4d90-876f-6d24ed30e88c
929a21b3-62d2-4c08-bdd3-dd4f0af7cf7c	2025-11-21 21:14:44.559738-05	2025-11-21 21:14:44.559741-05	Unit 3	3	1.0	\N	5	2279.00	2338.00	VACANT	f	f	f	f	f			e022065c-0699-4d90-876f-6d24ed30e88c
07507d9a-5214-4960-986b-a55046e52906	2025-11-21 21:14:44.560824-05	2025-11-21 21:14:44.560826-05	Main Unit	4	2.5	\N	\N	1799.00	2380.00	VACANT	f	f	f	f	f			a02aedb6-6c06-47ee-b4fa-308452ce0300
0366ba9e-ffba-4cd0-a595-5ab53de5f0a7	2025-11-21 21:14:44.561952-05	2025-11-21 21:14:44.561954-05	Unit 1	2	1.0	\N	3	1524.00	2572.00	VACANT	f	f	f	f	f			e7e6ae5d-3a00-4f98-a118-39373e6ecb9c
3993abef-4cb2-45d8-b92c-5d759066c104	2025-11-21 21:14:44.563049-05	2025-11-21 21:14:44.563052-05	Unit 3	1	1.0	\N	3	2169.00	2591.00	VACANT	f	f	f	f	f			e7e6ae5d-3a00-4f98-a118-39373e6ecb9c
20c38da5-1333-4c1d-bb29-e87af518f8c5	2025-11-21 21:14:44.564152-05	2025-11-21 21:14:44.564155-05	Unit 4	1	2.0	\N	4	2420.00	1804.00	VACANT	f	f	f	f	f			e7e6ae5d-3a00-4f98-a118-39373e6ecb9c
614dee33-74d4-4d06-8a92-f1e15fec9e90	2025-11-21 21:14:44.565305-05	2025-11-21 21:14:44.565307-05	Main Unit	2	2.5	\N	\N	2791.00	2120.00	VACANT	f	f	f	f	f			b5208a61-3f33-411f-853f-ca1304277c28
e7ca84a1-6cbf-4d33-aec7-99e617cc0cd9	2025-11-21 21:14:44.566388-05	2025-11-21 21:14:44.566391-05	Main Unit	2	2.5	\N	\N	2843.00	2010.00	VACANT	f	f	f	f	f			c84a2a03-2c43-452c-80c5-04c1522a96ec
9360ed23-8a19-4359-838f-34dedc72df6a	2025-11-21 21:14:44.567629-05	2025-11-21 21:14:44.567631-05	Main Unit	4	1.5	\N	\N	1518.00	1534.00	VACANT	f	f	f	f	f			e638dc22-e815-48b5-9974-3f395c561734
94023fb4-b9e5-4f9e-a544-58a20de067b5	2025-11-21 21:14:44.568737-05	2025-11-21 21:14:44.56874-05	Main Unit	2	1.5	\N	\N	2923.00	1868.00	VACANT	f	f	f	f	f			7efde364-86b1-4831-a048-4fd2d4b29fa6
a0e52b2e-f3cd-45ed-a2d6-9bd14c7bd84e	2025-11-21 21:14:44.569921-05	2025-11-21 21:14:44.569924-05	Main Unit	3	1.5	\N	\N	1639.00	2259.00	VACANT	f	f	f	f	f			a99f17b7-c38e-41f0-a489-a39e8b5d7e94
fbb75367-a4cf-4d22-a7bc-3c2a144987bd	2025-11-21 21:14:44.571-05	2025-11-21 21:14:44.571003-05	Main Unit	2	1.5	\N	\N	3302.00	2389.00	VACANT	f	f	f	f	f			636b4837-b21e-498a-96ad-b12381d64c09
4b572fa7-95e4-4884-aad4-cc4491e8c91b	2025-11-21 21:14:44.572033-05	2025-11-21 21:14:44.572035-05	Main Unit	2	1.5	\N	\N	2767.00	1654.00	VACANT	f	f	f	f	f			0b0642c7-91cc-488d-9bd9-8fa3f6e10f3e
9fb85d9f-3f24-429a-a563-f7b02d64715e	2025-11-21 21:14:44.57312-05	2025-11-21 21:14:44.573122-05	Unit 1	2	1.0	\N	5	2048.00	1831.00	VACANT	f	f	f	f	f			71bf5c8d-e625-4b6f-b03b-60658fa7076e
2c58f78f-d107-4b36-9a7e-fb8988e9b95d	2025-11-21 21:14:44.574221-05	2025-11-21 21:14:44.574224-05	Unit 2	1	1.0	\N	2	2135.00	2168.00	VACANT	f	f	f	f	f			71bf5c8d-e625-4b6f-b03b-60658fa7076e
43521577-f405-48e2-bd52-21b22a8b4bb2	2025-11-21 21:14:44.575461-05	2025-11-21 21:14:44.575463-05	Unit 3	2	1.0	\N	4	2405.00	1728.00	VACANT	f	f	f	f	f			71bf5c8d-e625-4b6f-b03b-60658fa7076e
8a5ef962-a255-4412-906d-23120343c72a	2025-11-21 21:14:44.576566-05	2025-11-21 21:14:44.576568-05	Main Unit	4	1.5	\N	\N	1546.00	1755.00	VACANT	f	f	f	f	f			19068eb7-7961-491e-b51a-27e7a629293c
f510ae4d-e5cc-463a-91b4-e50deba73437	2025-11-21 21:14:44.577816-05	2025-11-21 21:14:44.57782-05	Main Unit	2	2.5	\N	\N	1789.00	2935.00	VACANT	f	f	f	f	f			a45aa89d-2c3f-40b8-a1c7-b0d3b5743ff8
432a447f-85e2-41ef-8a0f-e1d622d724f2	2025-11-21 21:14:44.579098-05	2025-11-21 21:14:44.579101-05	Main Unit	2	1.5	\N	\N	2482.00	2135.00	VACANT	f	f	f	f	f			4908fb52-29c6-44cd-a507-759421ad0b15
88229d4c-0338-4d7c-ad7b-96eaa860ade5	2025-11-21 21:14:44.580191-05	2025-11-21 21:14:44.580193-05	Main Unit	3	2.5	\N	\N	2616.00	1918.00	VACANT	f	f	f	f	f			9b7ed28f-b91b-4714-bf1f-377ff0ec5a71
35905032-cf7f-4e39-aff3-5197784b7b58	2025-11-21 21:14:44.581341-05	2025-11-21 21:14:44.581343-05	Unit 1	2	1.0	\N	4	1432.00	2245.00	VACANT	f	f	f	f	f			ed1ce9da-3a29-4252-8b32-f7c7664081cd
5d46bacc-fba1-4f24-8bf5-53051071add6	2025-11-21 21:14:44.582733-05	2025-11-21 21:14:44.582736-05	Unit 3	1	1.0	\N	5	1665.00	1729.00	VACANT	f	f	f	f	f			ed1ce9da-3a29-4252-8b32-f7c7664081cd
219d8eb1-1d60-46dc-a72c-895e44f9ce73	2025-11-21 21:14:44.584021-05	2025-11-21 21:14:44.584024-05	Main Unit	2	2.5	\N	\N	1536.00	2353.00	VACANT	f	f	f	f	f			a07f683a-aac4-4ea4-ab92-3a261577e9d3
8b65dc55-4c60-4976-9859-5301c0a0479f	2025-11-21 21:14:44.585155-05	2025-11-21 21:14:44.585157-05	Main Unit	3	1.5	\N	\N	2051.00	1494.00	VACANT	f	f	f	f	f			e9bb014a-87fb-47c7-9cd2-2ae4bc8f824b
b51b9da3-f4fb-43c0-9d9a-4406d78747f3	2025-11-21 21:14:44.586328-05	2025-11-21 21:14:44.586332-05	Unit 1	3	2.0	\N	\N	1271.00	2070.00	VACANT	f	f	f	f	f			765cbfe2-f4bd-43de-a457-03e7e4b1c1d6
792fab35-a89c-4583-a02c-cf1b4fde9051	2025-11-21 21:14:44.587445-05	2025-11-21 21:14:44.587448-05	Unit 2	2	1.0	\N	\N	2320.00	2925.00	VACANT	f	f	f	f	f			765cbfe2-f4bd-43de-a457-03e7e4b1c1d6
49d969c8-fe61-4871-9f5c-50be57b967fd	2025-11-21 21:14:44.58852-05	2025-11-21 21:14:44.588522-05	Main Unit	2	2.5	\N	\N	2830.00	2120.00	VACANT	f	f	f	f	f			412f1635-deca-4885-bf73-450dd4b452dd
d7638de0-b47e-4adb-9bc5-f2291a9d82bd	2025-11-21 21:14:44.589631-05	2025-11-21 21:14:44.589634-05	Main Unit	4	2.5	\N	\N	3337.00	1287.00	VACANT	f	f	f	f	f			ff5c2829-f749-416c-b4cd-b2e63acff943
ae9a24ee-f56e-4c22-8822-25ce7fbbece5	2025-11-21 21:14:44.590747-05	2025-11-21 21:14:44.590749-05	Unit 1	1	1.0	\N	3	1453.00	1896.00	VACANT	f	f	f	f	f			8627ba6c-296b-42d8-866f-07feb4b6d881
0cf4add7-1ecd-4179-9b56-f38efd9b4074	2025-11-21 21:14:44.591886-05	2025-11-21 21:14:44.591889-05	Unit 2	1	2.0	\N	3	2061.00	2962.00	VACANT	f	f	f	f	f			8627ba6c-296b-42d8-866f-07feb4b6d881
f7d0f8c9-97db-4f46-975e-894030934db6	2025-11-21 21:14:44.593063-05	2025-11-21 21:14:44.593065-05	Unit 3	2	1.0	\N	2	2213.00	1809.00	VACANT	f	f	f	f	f			8627ba6c-296b-42d8-866f-07feb4b6d881
5b8c3c8a-3f51-4c01-99dd-cc20289111a2	2025-11-21 21:14:44.594216-05	2025-11-21 21:14:44.594219-05	Unit 4	3	1.0	\N	3	1118.00	2237.00	VACANT	f	f	f	f	f			8627ba6c-296b-42d8-866f-07feb4b6d881
cf5b7b83-8315-48fd-8838-4ae31883f18d	2025-11-21 21:14:44.595603-05	2025-11-21 21:14:44.595606-05	Main Unit	3	1.5	\N	\N	1602.00	2049.00	VACANT	f	f	f	f	f			3ba89232-dcc0-4e05-8135-943b917f4f0f
154ce1cf-157d-45ea-b680-cd0d7da31c1f	2025-11-21 21:14:44.596706-05	2025-11-21 21:14:44.596709-05	Main Unit	3	1.5	\N	\N	3048.00	2310.00	VACANT	f	f	f	f	f			f788e00e-7531-4e03-82a7-c3d0b6cbd8c7
77fa6e88-19d1-4c0b-b064-727af0acee47	2025-11-21 21:14:44.599493-05	2025-11-21 21:14:44.599496-05	Main Unit	3	1.5	\N	\N	3210.00	1608.00	VACANT	f	f	f	f	f			29e08b95-67e3-4dcc-952e-b7f028022606
e0d59918-d364-40b1-be8c-f48631e62d88	2025-11-21 21:14:44.600697-05	2025-11-21 21:14:44.600699-05	Main Unit	3	2.5	\N	\N	3036.00	1809.00	VACANT	f	f	f	f	f			6a768538-a576-42b9-b1b4-6f581e1ffb8e
b659d3b8-f66a-485a-a7d4-b1f73ad454f7	2025-11-21 21:14:44.602024-05	2025-11-21 21:14:44.602027-05	Main Unit	3	2.5	\N	\N	3198.00	1542.00	VACANT	f	f	f	f	f			7eb4071c-0eac-47b3-b3c6-c0cf2dfb5fb1
bae9936c-b724-460f-b0b5-a7a5915e6ea7	2025-11-21 21:14:44.603404-05	2025-11-21 21:14:44.603409-05	Main Unit	4	1.5	\N	\N	2956.00	2717.00	VACANT	f	f	f	f	f			470a59ed-e473-4a1f-80bb-aec3ca54801f
3f409566-4081-458b-857e-ee3a99ce76e7	2025-11-21 21:14:44.604719-05	2025-11-21 21:14:44.604722-05	Main Unit	4	1.5	\N	\N	2011.00	1001.00	VACANT	f	f	f	f	f			6022e29a-85be-4b25-9e0d-92feb1bb6f53
f85a6d55-c9b0-471d-90f6-4c7b5a4a3ba5	2025-11-21 21:14:44.60585-05	2025-11-21 21:14:44.605853-05	Main Unit	2	1.5	\N	\N	3461.00	1826.00	VACANT	f	f	f	f	f			45f1d053-56bc-43d1-9cab-3a184a544b3e
46000f38-055c-472f-b3bd-16c354deef71	2025-11-21 21:14:44.607034-05	2025-11-21 21:14:44.607037-05	Unit 1	2	2.0	\N	1	1673.00	2989.00	VACANT	f	f	f	f	f			d4d47264-a045-48c1-8867-0e5e113959f5
7c4fdd97-f209-406b-a7b8-62f1ce154d8b	2025-11-21 21:14:44.608154-05	2025-11-21 21:14:44.608157-05	Unit 2	3	1.0	\N	1	1308.00	1273.00	VACANT	f	f	f	f	f			d4d47264-a045-48c1-8867-0e5e113959f5
83851553-268e-4f23-b724-3b463ecb8b5e	2025-11-21 21:14:44.60935-05	2025-11-21 21:14:44.609353-05	Unit 3	2	2.0	\N	1	1845.00	2084.00	VACANT	f	f	f	f	f			d4d47264-a045-48c1-8867-0e5e113959f5
59954d1c-aedb-4b68-a239-828de6e4eb91	2025-11-21 21:14:44.610446-05	2025-11-21 21:14:44.610448-05	Unit 4	3	2.0	\N	4	2320.00	1236.00	VACANT	f	f	f	f	f			d4d47264-a045-48c1-8867-0e5e113959f5
4361b84e-9c75-49d1-8809-cf2263d0e58e	2025-11-21 21:14:44.611603-05	2025-11-21 21:14:44.611606-05	Main Unit	3	2.5	\N	\N	3092.00	2783.00	VACANT	f	f	f	f	f			52c9f468-7049-4ec7-9a58-a31264a79419
acc42793-4dd0-4630-9d77-3fee360b1ac8	2025-11-21 21:14:44.612717-05	2025-11-21 21:14:44.61272-05	Main Unit	4	2.5	\N	\N	2628.00	1254.00	VACANT	f	f	f	f	f			cde1d980-b4ae-42b5-98ce-75cde7ee6b59
ffb8b46d-97c1-4c05-b2c2-1f8b4ce58ea5	2025-11-21 21:14:44.613786-05	2025-11-21 21:14:44.613788-05	Main Unit	2	2.5	\N	\N	1936.00	1580.00	VACANT	f	f	f	f	f			7e0a7d29-8024-4e1c-b205-e0bbfbe73e0d
dee26ed8-9f8d-4dfa-934c-36b5ab4d9ea8	2025-11-21 21:14:44.614845-05	2025-11-21 21:14:44.614848-05	Main Unit	4	1.5	\N	\N	2034.00	1371.00	VACANT	f	f	f	f	f			33f9b754-1d6f-4f96-add8-a80d99867cec
4e3cb968-fe2b-436c-b6b8-5608ce5d17a1	2025-11-21 21:14:44.615951-05	2025-11-21 21:14:44.615953-05	Main Unit	4	1.5	\N	\N	2290.00	1433.00	VACANT	f	f	f	f	f			235faaa3-1232-4052-8765-1b8906388238
6b6de052-0239-4f79-a0b8-70da15c058e0	2025-11-21 21:14:44.617212-05	2025-11-21 21:14:44.617215-05	Main Unit	4	1.5	\N	\N	2285.00	1727.00	VACANT	f	f	f	f	f			b8024b2e-5b3c-41b2-acb0-ce1e9c29d459
65e951b4-4254-454c-9442-f4eed416113b	2025-11-21 21:14:44.618299-05	2025-11-21 21:14:44.618302-05	143	1	1.0	\N	4	2373.00	\N	VACANT	f	f	f	f	f			64a5fd32-b2f7-4f9a-b9e1-d1778142d743
8750bfa8-f37a-46bf-a5d5-90edae72fafc	2025-11-21 21:14:44.619453-05	2025-11-21 21:14:44.619456-05	111	2	2.0	\N	1	1168.00	\N	VACANT	f	f	f	f	f			64a5fd32-b2f7-4f9a-b9e1-d1778142d743
a8532b24-4264-444b-8e00-6cb71cb470e1	2025-11-21 21:14:44.620564-05	2025-11-21 21:14:44.620566-05	126	3	1.0	\N	2	1675.00	\N	VACANT	f	f	f	f	f			64a5fd32-b2f7-4f9a-b9e1-d1778142d743
1cb6c8fd-747a-4ffb-8eb3-3d1fabd409cb	2025-11-21 21:14:44.621638-05	2025-11-21 21:14:44.621641-05	Unit 2	3	1.0	\N	2	2233.00	2376.00	VACANT	f	f	f	f	f			e7e6ae5d-3a00-4f98-a118-39373e6ecb9c
723d2d2b-eb6a-4cc0-b953-789cefb9b812	2025-11-21 21:14:44.62278-05	2025-11-21 21:14:44.622782-05	101	1	1.0	\N	1	1218.00	1905.00	VACANT	f	f	f	f	f			ed1ce9da-3a29-4252-8b32-f7c7664081cd
\.


--
-- Data for Name: user_activities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_activities (id, user_id, user_email, user_name, user_role, action, resource, resource_id, ip_address, user_agent, details, created_at) FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_roles (id, user_id, user_type, scope, assigned_at, assigned_by, role_id, is_active, landlord_id, pmc_id) FROM stdin;
2	3	ADMIN	{}	2025-11-22 00:01:12.071859-05	\N	2	t	\N	\N
3	2	ADMIN	{}	2025-11-22 00:01:12.073239-05	\N	2	t	\N	\N
5	3	ADMIN	{}	2025-11-22 00:01:12.079681-05	\N	6	t	\N	\N
6	10	LANDLORD	{"landlord_id": "10"}	2025-11-22 00:01:12.084184-05	\N	11	t	\N	\N
7	9	LANDLORD	{"landlord_id": "9"}	2025-11-22 00:01:12.085505-05	\N	11	t	\N	\N
8	8	LANDLORD	{"landlord_id": "8"}	2025-11-22 00:01:12.086803-05	\N	11	t	\N	\N
9	7	LANDLORD	{"landlord_id": "7"}	2025-11-22 00:01:12.088047-05	\N	11	t	\N	\N
10	6	LANDLORD	{"landlord_id": "6"}	2025-11-22 00:01:12.089281-05	\N	11	t	\N	\N
11	5	LANDLORD	{"landlord_id": "5"}	2025-11-22 00:01:12.090631-05	\N	11	t	\N	\N
12	4	LANDLORD	{"landlord_id": "4"}	2025-11-22 00:01:12.092016-05	\N	11	t	\N	\N
13	3	LANDLORD	{"landlord_id": "3"}	2025-11-22 00:01:12.0933-05	\N	11	t	\N	\N
14	2	LANDLORD	{"landlord_id": "2"}	2025-11-22 00:01:12.094601-05	\N	11	t	\N	\N
15	1	LANDLORD	{"landlord_id": "1"}	2025-11-22 00:01:12.095956-05	\N	11	t	\N	\N
16	160	TENANT	{"tenant_id": "160"}	2025-11-22 00:01:12.100162-05	\N	12	t	\N	\N
17	159	TENANT	{"tenant_id": "159"}	2025-11-22 00:01:12.101534-05	\N	12	t	\N	\N
18	158	TENANT	{"tenant_id": "158"}	2025-11-22 00:01:12.102871-05	\N	12	t	\N	\N
19	157	TENANT	{"tenant_id": "157"}	2025-11-22 00:01:12.104474-05	\N	12	t	\N	\N
20	156	TENANT	{"tenant_id": "156"}	2025-11-22 00:01:12.105914-05	\N	12	t	\N	\N
21	155	TENANT	{"tenant_id": "155"}	2025-11-22 00:01:12.108023-05	\N	12	t	\N	\N
22	154	TENANT	{"tenant_id": "154"}	2025-11-22 00:01:12.110071-05	\N	12	t	\N	\N
23	153	TENANT	{"tenant_id": "153"}	2025-11-22 00:01:12.111316-05	\N	12	t	\N	\N
24	152	TENANT	{"tenant_id": "152"}	2025-11-22 00:01:12.112902-05	\N	12	t	\N	\N
25	151	TENANT	{"tenant_id": "151"}	2025-11-22 00:01:12.114831-05	\N	12	t	\N	\N
26	150	TENANT	{"tenant_id": "150"}	2025-11-22 00:01:12.116151-05	\N	12	t	\N	\N
27	149	TENANT	{"tenant_id": "149"}	2025-11-22 00:01:12.117369-05	\N	12	t	\N	\N
28	148	TENANT	{"tenant_id": "148"}	2025-11-22 00:01:12.118543-05	\N	12	t	\N	\N
29	147	TENANT	{"tenant_id": "147"}	2025-11-22 00:01:12.119754-05	\N	12	t	\N	\N
30	146	TENANT	{"tenant_id": "146"}	2025-11-22 00:01:12.121423-05	\N	12	t	\N	\N
31	145	TENANT	{"tenant_id": "145"}	2025-11-22 00:01:12.12292-05	\N	12	t	\N	\N
32	144	TENANT	{"tenant_id": "144"}	2025-11-22 00:01:12.124807-05	\N	12	t	\N	\N
33	143	TENANT	{"tenant_id": "143"}	2025-11-22 00:01:12.126431-05	\N	12	t	\N	\N
34	142	TENANT	{"tenant_id": "142"}	2025-11-22 00:01:12.127624-05	\N	12	t	\N	\N
35	141	TENANT	{"tenant_id": "141"}	2025-11-22 00:01:12.129101-05	\N	12	t	\N	\N
36	140	TENANT	{"tenant_id": "140"}	2025-11-22 00:01:12.130502-05	\N	12	t	\N	\N
37	139	TENANT	{"tenant_id": "139"}	2025-11-22 00:01:12.131919-05	\N	12	t	\N	\N
38	138	TENANT	{"tenant_id": "138"}	2025-11-22 00:01:12.133217-05	\N	12	t	\N	\N
39	137	TENANT	{"tenant_id": "137"}	2025-11-22 00:01:12.134563-05	\N	12	t	\N	\N
40	136	TENANT	{"tenant_id": "136"}	2025-11-22 00:01:12.13582-05	\N	12	t	\N	\N
41	135	TENANT	{"tenant_id": "135"}	2025-11-22 00:01:12.137297-05	\N	12	t	\N	\N
42	134	TENANT	{"tenant_id": "134"}	2025-11-22 00:01:12.138692-05	\N	12	t	\N	\N
43	133	TENANT	{"tenant_id": "133"}	2025-11-22 00:01:12.140663-05	\N	12	t	\N	\N
44	132	TENANT	{"tenant_id": "132"}	2025-11-22 00:01:12.142101-05	\N	12	t	\N	\N
45	131	TENANT	{"tenant_id": "131"}	2025-11-22 00:01:12.143335-05	\N	12	t	\N	\N
46	130	TENANT	{"tenant_id": "130"}	2025-11-22 00:01:12.148892-05	\N	12	t	\N	\N
47	129	TENANT	{"tenant_id": "129"}	2025-11-22 00:01:12.150307-05	\N	12	t	\N	\N
48	128	TENANT	{"tenant_id": "128"}	2025-11-22 00:01:12.151796-05	\N	12	t	\N	\N
49	127	TENANT	{"tenant_id": "127"}	2025-11-22 00:01:12.152987-05	\N	12	t	\N	\N
50	126	TENANT	{"tenant_id": "126"}	2025-11-22 00:01:12.154165-05	\N	12	t	\N	\N
51	125	TENANT	{"tenant_id": "125"}	2025-11-22 00:01:12.155394-05	\N	12	t	\N	\N
52	124	TENANT	{"tenant_id": "124"}	2025-11-22 00:01:12.156561-05	\N	12	t	\N	\N
53	123	TENANT	{"tenant_id": "123"}	2025-11-22 00:01:12.157774-05	\N	12	t	\N	\N
54	122	TENANT	{"tenant_id": "122"}	2025-11-22 00:01:12.158917-05	\N	12	t	\N	\N
55	121	TENANT	{"tenant_id": "121"}	2025-11-22 00:01:12.160022-05	\N	12	t	\N	\N
56	120	TENANT	{"tenant_id": "120"}	2025-11-22 00:01:12.161378-05	\N	12	t	\N	\N
57	119	TENANT	{"tenant_id": "119"}	2025-11-22 00:01:12.162607-05	\N	12	t	\N	\N
58	118	TENANT	{"tenant_id": "118"}	2025-11-22 00:01:12.163827-05	\N	12	t	\N	\N
59	117	TENANT	{"tenant_id": "117"}	2025-11-22 00:01:12.16504-05	\N	12	t	\N	\N
60	116	TENANT	{"tenant_id": "116"}	2025-11-22 00:01:12.166303-05	\N	12	t	\N	\N
61	115	TENANT	{"tenant_id": "115"}	2025-11-22 00:01:12.167519-05	\N	12	t	\N	\N
62	114	TENANT	{"tenant_id": "114"}	2025-11-22 00:01:12.168685-05	\N	12	t	\N	\N
63	113	TENANT	{"tenant_id": "113"}	2025-11-22 00:01:12.170119-05	\N	12	t	\N	\N
64	112	TENANT	{"tenant_id": "112"}	2025-11-22 00:01:12.171372-05	\N	12	t	\N	\N
65	111	TENANT	{"tenant_id": "111"}	2025-11-22 00:01:12.172618-05	\N	12	t	\N	\N
66	110	TENANT	{"tenant_id": "110"}	2025-11-22 00:01:12.174129-05	\N	12	t	\N	\N
67	109	TENANT	{"tenant_id": "109"}	2025-11-22 00:01:12.175756-05	\N	12	t	\N	\N
68	108	TENANT	{"tenant_id": "108"}	2025-11-22 00:01:12.177129-05	\N	12	t	\N	\N
69	107	TENANT	{"tenant_id": "107"}	2025-11-22 00:01:12.178401-05	\N	12	t	\N	\N
70	106	TENANT	{"tenant_id": "106"}	2025-11-22 00:01:12.180151-05	\N	12	t	\N	\N
71	105	TENANT	{"tenant_id": "105"}	2025-11-22 00:01:12.1814-05	\N	12	t	\N	\N
72	104	TENANT	{"tenant_id": "104"}	2025-11-22 00:01:12.191407-05	\N	12	t	\N	\N
73	103	TENANT	{"tenant_id": "103"}	2025-11-22 00:01:12.193685-05	\N	12	t	\N	\N
74	102	TENANT	{"tenant_id": "102"}	2025-11-22 00:01:12.194995-05	\N	12	t	\N	\N
75	101	TENANT	{"tenant_id": "101"}	2025-11-22 00:01:12.198025-05	\N	12	t	\N	\N
76	100	TENANT	{"tenant_id": "100"}	2025-11-22 00:01:12.199383-05	\N	12	t	\N	\N
77	99	TENANT	{"tenant_id": "99"}	2025-11-22 00:01:12.200628-05	\N	12	t	\N	\N
78	98	TENANT	{"tenant_id": "98"}	2025-11-22 00:01:12.20185-05	\N	12	t	\N	\N
79	97	TENANT	{"tenant_id": "97"}	2025-11-22 00:01:12.203116-05	\N	12	t	\N	\N
80	96	TENANT	{"tenant_id": "96"}	2025-11-22 00:01:12.20447-05	\N	12	t	\N	\N
81	95	TENANT	{"tenant_id": "95"}	2025-11-22 00:01:12.205784-05	\N	12	t	\N	\N
82	94	TENANT	{"tenant_id": "94"}	2025-11-22 00:01:12.207087-05	\N	12	t	\N	\N
83	93	TENANT	{"tenant_id": "93"}	2025-11-22 00:01:12.208376-05	\N	12	t	\N	\N
84	92	TENANT	{"tenant_id": "92"}	2025-11-22 00:01:12.209581-05	\N	12	t	\N	\N
85	91	TENANT	{"tenant_id": "91"}	2025-11-22 00:01:12.210756-05	\N	12	t	\N	\N
86	90	TENANT	{"tenant_id": "90"}	2025-11-22 00:01:12.211953-05	\N	12	t	\N	\N
87	89	TENANT	{"tenant_id": "89"}	2025-11-22 00:01:12.213243-05	\N	12	t	\N	\N
88	88	TENANT	{"tenant_id": "88"}	2025-11-22 00:01:12.214653-05	\N	12	t	\N	\N
89	87	TENANT	{"tenant_id": "87"}	2025-11-22 00:01:12.216011-05	\N	12	t	\N	\N
90	86	TENANT	{"tenant_id": "86"}	2025-11-22 00:01:12.217342-05	\N	12	t	\N	\N
91	85	TENANT	{"tenant_id": "85"}	2025-11-22 00:01:12.218584-05	\N	12	t	\N	\N
92	84	TENANT	{"tenant_id": "84"}	2025-11-22 00:01:12.22248-05	\N	12	t	\N	\N
93	83	TENANT	{"tenant_id": "83"}	2025-11-22 00:01:12.223802-05	\N	12	t	\N	\N
94	82	TENANT	{"tenant_id": "82"}	2025-11-22 00:01:12.225082-05	\N	12	t	\N	\N
95	81	TENANT	{"tenant_id": "81"}	2025-11-22 00:01:12.226487-05	\N	12	t	\N	\N
96	80	TENANT	{"tenant_id": "80"}	2025-11-22 00:01:12.227686-05	\N	12	t	\N	\N
97	79	TENANT	{"tenant_id": "79"}	2025-11-22 00:01:12.228961-05	\N	12	t	\N	\N
98	78	TENANT	{"tenant_id": "78"}	2025-11-22 00:01:12.230204-05	\N	12	t	\N	\N
99	77	TENANT	{"tenant_id": "77"}	2025-11-22 00:01:12.231474-05	\N	12	t	\N	\N
100	76	TENANT	{"tenant_id": "76"}	2025-11-22 00:01:12.232915-05	\N	12	t	\N	\N
101	75	TENANT	{"tenant_id": "75"}	2025-11-22 00:01:12.234274-05	\N	12	t	\N	\N
102	74	TENANT	{"tenant_id": "74"}	2025-11-22 00:01:12.235468-05	\N	12	t	\N	\N
103	73	TENANT	{"tenant_id": "73"}	2025-11-22 00:01:12.236761-05	\N	12	t	\N	\N
104	72	TENANT	{"tenant_id": "72"}	2025-11-22 00:01:12.238033-05	\N	12	t	\N	\N
105	71	TENANT	{"tenant_id": "71"}	2025-11-22 00:01:12.239335-05	\N	12	t	\N	\N
106	70	TENANT	{"tenant_id": "70"}	2025-11-22 00:01:12.240544-05	\N	12	t	\N	\N
107	69	TENANT	{"tenant_id": "69"}	2025-11-22 00:01:12.241853-05	\N	12	t	\N	\N
108	68	TENANT	{"tenant_id": "68"}	2025-11-22 00:01:12.243316-05	\N	12	t	\N	\N
109	67	TENANT	{"tenant_id": "67"}	2025-11-22 00:01:12.244687-05	\N	12	t	\N	\N
110	66	TENANT	{"tenant_id": "66"}	2025-11-22 00:01:12.245978-05	\N	12	t	\N	\N
111	65	TENANT	{"tenant_id": "65"}	2025-11-22 00:01:12.247348-05	\N	12	t	\N	\N
112	64	TENANT	{"tenant_id": "64"}	2025-11-22 00:01:12.24863-05	\N	12	t	\N	\N
113	63	TENANT	{"tenant_id": "63"}	2025-11-22 00:01:12.249945-05	\N	12	t	\N	\N
114	62	TENANT	{"tenant_id": "62"}	2025-11-22 00:01:12.251191-05	\N	12	t	\N	\N
115	61	TENANT	{"tenant_id": "61"}	2025-11-22 00:01:12.252377-05	\N	12	t	\N	\N
116	60	TENANT	{"tenant_id": "60"}	2025-11-22 00:01:12.253551-05	\N	12	t	\N	\N
117	59	TENANT	{"tenant_id": "59"}	2025-11-22 00:01:12.254758-05	\N	12	t	\N	\N
118	58	TENANT	{"tenant_id": "58"}	2025-11-22 00:01:12.256012-05	\N	12	t	\N	\N
119	57	TENANT	{"tenant_id": "57"}	2025-11-22 00:01:12.257413-05	\N	12	t	\N	\N
120	56	TENANT	{"tenant_id": "56"}	2025-11-22 00:01:12.258639-05	\N	12	t	\N	\N
121	55	TENANT	{"tenant_id": "55"}	2025-11-22 00:01:12.260741-05	\N	12	t	\N	\N
122	54	TENANT	{"tenant_id": "54"}	2025-11-22 00:01:12.262961-05	\N	12	t	\N	\N
123	53	TENANT	{"tenant_id": "53"}	2025-11-22 00:01:12.267949-05	\N	12	t	\N	\N
124	52	TENANT	{"tenant_id": "52"}	2025-11-22 00:01:12.269033-05	\N	12	t	\N	\N
125	51	TENANT	{"tenant_id": "51"}	2025-11-22 00:01:12.27005-05	\N	12	t	\N	\N
126	50	TENANT	{"tenant_id": "50"}	2025-11-22 00:01:12.270969-05	\N	12	t	\N	\N
127	49	TENANT	{"tenant_id": "49"}	2025-11-22 00:01:12.271994-05	\N	12	t	\N	\N
128	48	TENANT	{"tenant_id": "48"}	2025-11-22 00:01:12.272861-05	\N	12	t	\N	\N
129	47	TENANT	{"tenant_id": "47"}	2025-11-22 00:01:12.273773-05	\N	12	t	\N	\N
130	46	TENANT	{"tenant_id": "46"}	2025-11-22 00:01:12.274736-05	\N	12	t	\N	\N
131	45	TENANT	{"tenant_id": "45"}	2025-11-22 00:01:12.27571-05	\N	12	t	\N	\N
132	44	TENANT	{"tenant_id": "44"}	2025-11-22 00:01:12.276598-05	\N	12	t	\N	\N
133	43	TENANT	{"tenant_id": "43"}	2025-11-22 00:01:12.277464-05	\N	12	t	\N	\N
134	42	TENANT	{"tenant_id": "42"}	2025-11-22 00:01:12.27832-05	\N	12	t	\N	\N
135	41	TENANT	{"tenant_id": "41"}	2025-11-22 00:01:12.279186-05	\N	12	t	\N	\N
136	40	TENANT	{"tenant_id": "40"}	2025-11-22 00:01:12.280038-05	\N	12	t	\N	\N
137	39	TENANT	{"tenant_id": "39"}	2025-11-22 00:01:12.280946-05	\N	12	t	\N	\N
138	38	TENANT	{"tenant_id": "38"}	2025-11-22 00:01:12.281951-05	\N	12	t	\N	\N
139	37	TENANT	{"tenant_id": "37"}	2025-11-22 00:01:12.282987-05	\N	12	t	\N	\N
140	36	TENANT	{"tenant_id": "36"}	2025-11-22 00:01:12.283936-05	\N	12	t	\N	\N
141	35	TENANT	{"tenant_id": "35"}	2025-11-22 00:01:12.284831-05	\N	12	t	\N	\N
142	34	TENANT	{"tenant_id": "34"}	2025-11-22 00:01:12.285885-05	\N	12	t	\N	\N
143	33	TENANT	{"tenant_id": "33"}	2025-11-22 00:01:12.286766-05	\N	12	t	\N	\N
144	32	TENANT	{"tenant_id": "32"}	2025-11-22 00:01:12.287671-05	\N	12	t	\N	\N
145	31	TENANT	{"tenant_id": "31"}	2025-11-22 00:01:12.288546-05	\N	12	t	\N	\N
146	30	TENANT	{"tenant_id": "30"}	2025-11-22 00:01:12.289427-05	\N	12	t	\N	\N
147	29	TENANT	{"tenant_id": "29"}	2025-11-22 00:01:12.290487-05	\N	12	t	\N	\N
148	28	TENANT	{"tenant_id": "28"}	2025-11-22 00:01:12.291476-05	\N	12	t	\N	\N
149	27	TENANT	{"tenant_id": "27"}	2025-11-22 00:01:12.292415-05	\N	12	t	\N	\N
150	26	TENANT	{"tenant_id": "26"}	2025-11-22 00:01:12.293265-05	\N	12	t	\N	\N
151	25	TENANT	{"tenant_id": "25"}	2025-11-22 00:01:12.294139-05	\N	12	t	\N	\N
152	24	TENANT	{"tenant_id": "24"}	2025-11-22 00:01:12.295023-05	\N	12	t	\N	\N
153	23	TENANT	{"tenant_id": "23"}	2025-11-22 00:01:12.295954-05	\N	12	t	\N	\N
154	22	TENANT	{"tenant_id": "22"}	2025-11-22 00:01:12.296892-05	\N	12	t	\N	\N
155	21	TENANT	{"tenant_id": "21"}	2025-11-22 00:01:12.297776-05	\N	12	t	\N	\N
156	20	TENANT	{"tenant_id": "20"}	2025-11-22 00:01:12.298698-05	\N	12	t	\N	\N
157	19	TENANT	{"tenant_id": "19"}	2025-11-22 00:01:12.299624-05	\N	12	t	\N	\N
158	18	TENANT	{"tenant_id": "18"}	2025-11-22 00:01:12.300603-05	\N	12	t	\N	\N
159	17	TENANT	{"tenant_id": "17"}	2025-11-22 00:01:12.301489-05	\N	12	t	\N	\N
160	16	TENANT	{"tenant_id": "16"}	2025-11-22 00:01:12.302449-05	\N	12	t	\N	\N
161	15	TENANT	{"tenant_id": "15"}	2025-11-22 00:01:12.303373-05	\N	12	t	\N	\N
162	14	TENANT	{"tenant_id": "14"}	2025-11-22 00:01:12.304275-05	\N	12	t	\N	\N
163	13	TENANT	{"tenant_id": "13"}	2025-11-22 00:01:12.30526-05	\N	12	t	\N	\N
164	12	TENANT	{"tenant_id": "12"}	2025-11-22 00:01:12.30617-05	\N	12	t	\N	\N
165	11	TENANT	{"tenant_id": "11"}	2025-11-22 00:01:12.307043-05	\N	12	t	\N	\N
166	10	TENANT	{"tenant_id": "10"}	2025-11-22 00:01:12.30813-05	\N	12	t	\N	\N
167	9	TENANT	{"tenant_id": "9"}	2025-11-22 00:01:12.309043-05	\N	12	t	\N	\N
168	8	TENANT	{"tenant_id": "8"}	2025-11-22 00:01:12.309903-05	\N	12	t	\N	\N
169	7	TENANT	{"tenant_id": "7"}	2025-11-22 00:01:12.310782-05	\N	12	t	\N	\N
170	6	TENANT	{"tenant_id": "6"}	2025-11-22 00:01:12.311635-05	\N	12	t	\N	\N
171	5	TENANT	{"tenant_id": "5"}	2025-11-22 00:01:12.312487-05	\N	12	t	\N	\N
172	4	TENANT	{"tenant_id": "4"}	2025-11-22 00:01:12.313345-05	\N	12	t	\N	\N
173	3	TENANT	{"tenant_id": "3"}	2025-11-22 00:01:12.314218-05	\N	12	t	\N	\N
174	2	TENANT	{"tenant_id": "2"}	2025-11-22 00:01:12.31516-05	\N	12	t	\N	\N
175	1	TENANT	{"tenant_id": "1"}	2025-11-22 00:01:12.316137-05	\N	12	t	\N	\N
4	2	ADMIN	{"pmcId": "3", "pmc_id": "3"}	2025-11-22 00:01:12.077501-05	\N	6	t	\N	3
176	LLD-PMC1-10	LANDLORD	\N	2025-11-22 01:49:05.546494-05	\N	11	t	\N	\N
1	1	ADMIN	{}	2025-11-22 00:01:12.067537-05	\N	1	t	\N	\N
177	LLD-PMC1-09	LANDLORD	\N	2025-11-22 01:49:05.548222-05	\N	11	t	\N	\N
178	LLD-PMC1-08	LANDLORD	\N	2025-11-22 01:49:05.549127-05	\N	11	t	\N	\N
179	LLD-PMC1-07	LANDLORD	\N	2025-11-22 01:49:05.549994-05	\N	11	t	\N	\N
180	LLD-PMC1-06	LANDLORD	\N	2025-11-22 01:49:05.550729-05	\N	11	t	\N	\N
181	LLD-PMC1-05	LANDLORD	\N	2025-11-22 01:49:05.551577-05	\N	11	t	\N	\N
182	LLD-PMC1-04	LANDLORD	\N	2025-11-22 01:49:05.55232-05	\N	11	t	\N	\N
183	LLD-PMC1-03	LANDLORD	\N	2025-11-22 01:49:05.553621-05	\N	11	t	\N	\N
184	LLD-PMC1-02	LANDLORD	\N	2025-11-22 01:49:05.55446-05	\N	11	t	\N	\N
185	LLD-PMC1-01	LANDLORD	\N	2025-11-22 01:49:05.55516-05	\N	11	t	\N	\N
186	TNBD5B81F3	TENANT	\N	2025-11-22 01:49:05.559378-05	\N	12	t	\N	\N
187	TN0F37CA41	TENANT	\N	2025-11-22 01:49:05.560315-05	\N	12	t	\N	\N
188	TN98662457	TENANT	\N	2025-11-22 01:49:05.561307-05	\N	12	t	\N	\N
189	TN8AA677E4	TENANT	\N	2025-11-22 01:49:05.562191-05	\N	12	t	\N	\N
190	TN8863F388	TENANT	\N	2025-11-22 01:49:05.56311-05	\N	12	t	\N	\N
191	TNCCB95B44	TENANT	\N	2025-11-22 01:49:05.564579-05	\N	12	t	\N	\N
192	TN56BF0CB2	TENANT	\N	2025-11-22 01:49:05.566248-05	\N	12	t	\N	\N
193	TN65B996DB	TENANT	\N	2025-11-22 01:49:05.567151-05	\N	12	t	\N	\N
194	TN32C4CD47	TENANT	\N	2025-11-22 01:49:05.568115-05	\N	12	t	\N	\N
195	TNE466DF55	TENANT	\N	2025-11-22 01:49:05.57064-05	\N	12	t	\N	\N
196	TN9BBF6898	TENANT	\N	2025-11-22 01:49:05.573831-05	\N	12	t	\N	\N
197	TN19078AA9	TENANT	\N	2025-11-22 01:49:05.576216-05	\N	12	t	\N	\N
198	TN6B1AD20E	TENANT	\N	2025-11-22 01:49:05.57697-05	\N	12	t	\N	\N
199	TNA09A0EF2	TENANT	\N	2025-11-22 01:49:05.577689-05	\N	12	t	\N	\N
200	TN76AC249B	TENANT	\N	2025-11-22 01:49:05.578476-05	\N	12	t	\N	\N
201	TN994A1EA7	TENANT	\N	2025-11-22 01:49:05.579399-05	\N	12	t	\N	\N
202	TNEED8F85F	TENANT	\N	2025-11-22 01:49:05.5802-05	\N	12	t	\N	\N
203	TN9C070884	TENANT	\N	2025-11-22 01:49:05.581166-05	\N	12	t	\N	\N
204	TNBA7F00EC	TENANT	\N	2025-11-22 01:49:05.582153-05	\N	12	t	\N	\N
205	TN5AB4235E	TENANT	\N	2025-11-22 01:49:05.582879-05	\N	12	t	\N	\N
206	TN5D4C6402	TENANT	\N	2025-11-22 01:49:05.583556-05	\N	12	t	\N	\N
207	TNAEA6848C	TENANT	\N	2025-11-22 01:49:05.584236-05	\N	12	t	\N	\N
208	TNDAB29E47	TENANT	\N	2025-11-22 01:49:05.585007-05	\N	12	t	\N	\N
209	TN1D844C34	TENANT	\N	2025-11-22 01:49:05.585733-05	\N	12	t	\N	\N
210	TNE39AF730	TENANT	\N	2025-11-22 01:49:05.586534-05	\N	12	t	\N	\N
211	TN77C2DB85	TENANT	\N	2025-11-22 01:49:05.587377-05	\N	12	t	\N	\N
212	TNDFA5124A	TENANT	\N	2025-11-22 01:49:05.588087-05	\N	12	t	\N	\N
213	TNE3B116A9	TENANT	\N	2025-11-22 01:49:05.588878-05	\N	12	t	\N	\N
214	TNEE0CDCF4	TENANT	\N	2025-11-22 01:49:05.589856-05	\N	12	t	\N	\N
215	TN16575746	TENANT	\N	2025-11-22 01:49:05.590583-05	\N	12	t	\N	\N
216	TNEF242B18	TENANT	\N	2025-11-22 01:49:05.59127-05	\N	12	t	\N	\N
217	TN1BC71FD3	TENANT	\N	2025-11-22 01:49:05.591929-05	\N	12	t	\N	\N
218	TN595FC70D	TENANT	\N	2025-11-22 01:49:05.592811-05	\N	12	t	\N	\N
219	TNE73D8B89	TENANT	\N	2025-11-22 01:49:05.593589-05	\N	12	t	\N	\N
220	TNEA43D1EF	TENANT	\N	2025-11-22 01:49:05.594328-05	\N	12	t	\N	\N
221	TN7C2DD650	TENANT	\N	2025-11-22 01:49:05.595183-05	\N	12	t	\N	\N
222	TNE9E34F38	TENANT	\N	2025-11-22 01:49:05.596252-05	\N	12	t	\N	\N
223	TNFEBB83A3	TENANT	\N	2025-11-22 01:49:05.597108-05	\N	12	t	\N	\N
224	TN14D37AC5	TENANT	\N	2025-11-22 01:49:05.598238-05	\N	12	t	\N	\N
225	TN51FB8C6F	TENANT	\N	2025-11-22 01:49:05.599233-05	\N	12	t	\N	\N
226	TNF0E5C03D	TENANT	\N	2025-11-22 01:49:05.60018-05	\N	12	t	\N	\N
227	TN6D09713A	TENANT	\N	2025-11-22 01:49:05.601014-05	\N	12	t	\N	\N
228	TNA177CCAD	TENANT	\N	2025-11-22 01:49:05.601769-05	\N	12	t	\N	\N
229	TN810242E7	TENANT	\N	2025-11-22 01:49:05.602534-05	\N	12	t	\N	\N
230	TNFF9D3701	TENANT	\N	2025-11-22 01:49:05.603342-05	\N	12	t	\N	\N
231	TNAE02CC21	TENANT	\N	2025-11-22 01:49:05.604077-05	\N	12	t	\N	\N
232	TND9114BB9	TENANT	\N	2025-11-22 01:49:05.604858-05	\N	12	t	\N	\N
233	TN3514005C	TENANT	\N	2025-11-22 01:49:05.605801-05	\N	12	t	\N	\N
234	TN91C65FA9	TENANT	\N	2025-11-22 01:49:05.606793-05	\N	12	t	\N	\N
235	TNE9E41D8F	TENANT	\N	2025-11-22 01:49:05.607527-05	\N	12	t	\N	\N
236	TN9F5260BC	TENANT	\N	2025-11-22 01:49:05.608209-05	\N	12	t	\N	\N
237	TNB131100C	TENANT	\N	2025-11-22 01:49:05.608955-05	\N	12	t	\N	\N
238	TNCF3065CF	TENANT	\N	2025-11-22 01:49:05.610101-05	\N	12	t	\N	\N
239	TNC1785BE7	TENANT	\N	2025-11-22 01:49:05.610951-05	\N	12	t	\N	\N
240	TN8B2D1E93	TENANT	\N	2025-11-22 01:49:05.611808-05	\N	12	t	\N	\N
241	TN4C3D5E7A	TENANT	\N	2025-11-22 01:49:05.612593-05	\N	12	t	\N	\N
242	TN15779234	TENANT	\N	2025-11-22 01:49:05.613364-05	\N	12	t	\N	\N
243	TNEBDBE067	TENANT	\N	2025-11-22 01:49:05.614357-05	\N	12	t	\N	\N
244	TNA5235412	TENANT	\N	2025-11-22 01:49:05.615362-05	\N	12	t	\N	\N
245	TN73768012	TENANT	\N	2025-11-22 01:49:05.616077-05	\N	12	t	\N	\N
246	TN6024764D	TENANT	\N	2025-11-22 01:49:05.616779-05	\N	12	t	\N	\N
247	TN85324918	TENANT	\N	2025-11-22 01:49:05.617467-05	\N	12	t	\N	\N
248	TN7B870EC2	TENANT	\N	2025-11-22 01:49:05.618162-05	\N	12	t	\N	\N
249	TNEDC01BBA	TENANT	\N	2025-11-22 01:49:05.618833-05	\N	12	t	\N	\N
250	TN013AE0ED	TENANT	\N	2025-11-22 01:49:05.619592-05	\N	12	t	\N	\N
251	TN8C8C55AC	TENANT	\N	2025-11-22 01:49:05.620358-05	\N	12	t	\N	\N
252	TN07CEF820	TENANT	\N	2025-11-22 01:49:05.621048-05	\N	12	t	\N	\N
253	TN919A2A02	TENANT	\N	2025-11-22 01:49:05.621722-05	\N	12	t	\N	\N
254	TN8D7830C6	TENANT	\N	2025-11-22 01:49:05.622422-05	\N	12	t	\N	\N
255	TN67BF5BEF	TENANT	\N	2025-11-22 01:49:05.623449-05	\N	12	t	\N	\N
256	TN13F650B5	TENANT	\N	2025-11-22 01:49:05.624553-05	\N	12	t	\N	\N
257	TN90C5B5F2	TENANT	\N	2025-11-22 01:49:05.6258-05	\N	12	t	\N	\N
258	TN27062768	TENANT	\N	2025-11-22 01:49:05.626729-05	\N	12	t	\N	\N
259	TN4713A363	TENANT	\N	2025-11-22 01:49:05.627484-05	\N	12	t	\N	\N
260	TN2ECE849E	TENANT	\N	2025-11-22 01:49:05.628302-05	\N	12	t	\N	\N
261	TN56D06493	TENANT	\N	2025-11-22 01:49:05.629015-05	\N	12	t	\N	\N
262	TN1FB7440C	TENANT	\N	2025-11-22 01:49:05.629748-05	\N	12	t	\N	\N
263	TNE264348E	TENANT	\N	2025-11-22 01:49:05.630927-05	\N	12	t	\N	\N
264	TNA74D6DF4	TENANT	\N	2025-11-22 01:49:05.631695-05	\N	12	t	\N	\N
265	TNF3A91316	TENANT	\N	2025-11-22 01:49:05.632402-05	\N	12	t	\N	\N
266	TN0B82EFB3	TENANT	\N	2025-11-22 01:49:05.633077-05	\N	12	t	\N	\N
267	TN3BFB1751	TENANT	\N	2025-11-22 01:49:05.633799-05	\N	12	t	\N	\N
268	TN58AF0319	TENANT	\N	2025-11-22 01:49:05.635109-05	\N	12	t	\N	\N
269	TN5B794C0C	TENANT	\N	2025-11-22 01:49:05.635866-05	\N	12	t	\N	\N
270	TNA62F0E25	TENANT	\N	2025-11-22 01:49:05.636625-05	\N	12	t	\N	\N
271	TN5CA8787A	TENANT	\N	2025-11-22 01:49:05.637316-05	\N	12	t	\N	\N
272	TNFB2A37BD	TENANT	\N	2025-11-22 01:49:05.638003-05	\N	12	t	\N	\N
273	TN73693B1E	TENANT	\N	2025-11-22 01:49:05.638707-05	\N	12	t	\N	\N
274	TN9FDFCC11	TENANT	\N	2025-11-22 01:49:05.639524-05	\N	12	t	\N	\N
275	TN91D33DC3	TENANT	\N	2025-11-22 01:49:05.640303-05	\N	12	t	\N	\N
276	TN3A089101	TENANT	\N	2025-11-22 01:49:05.641228-05	\N	12	t	\N	\N
277	TNECE4005D	TENANT	\N	2025-11-22 01:49:05.641883-05	\N	12	t	\N	\N
278	TN00991CAC	TENANT	\N	2025-11-22 01:49:05.642611-05	\N	12	t	\N	\N
279	TNBE1F860D	TENANT	\N	2025-11-22 01:49:05.643309-05	\N	12	t	\N	\N
280	TN8BFC897B	TENANT	\N	2025-11-22 01:49:05.64411-05	\N	12	t	\N	\N
281	TNEEDC004C	TENANT	\N	2025-11-22 01:49:05.644839-05	\N	12	t	\N	\N
282	TN684BB785	TENANT	\N	2025-11-22 01:49:05.645884-05	\N	12	t	\N	\N
283	TN55610F23	TENANT	\N	2025-11-22 01:49:05.646664-05	\N	12	t	\N	\N
284	TN8917930C	TENANT	\N	2025-11-22 01:49:05.647411-05	\N	12	t	\N	\N
285	TND45E65CD	TENANT	\N	2025-11-22 01:49:05.648439-05	\N	12	t	\N	\N
286	TN1C38FDCF	TENANT	\N	2025-11-22 01:49:05.649282-05	\N	12	t	\N	\N
287	TND503B515	TENANT	\N	2025-11-22 01:49:05.65008-05	\N	12	t	\N	\N
288	TN28945B30	TENANT	\N	2025-11-22 01:49:05.650772-05	\N	12	t	\N	\N
289	TNE72C3BB9	TENANT	\N	2025-11-22 01:49:05.651424-05	\N	12	t	\N	\N
290	TNE258F8CD	TENANT	\N	2025-11-22 01:49:05.652058-05	\N	12	t	\N	\N
291	TNABF2D29D	TENANT	\N	2025-11-22 01:49:05.652752-05	\N	12	t	\N	\N
292	TN8E0B7030	TENANT	\N	2025-11-22 01:49:05.653574-05	\N	12	t	\N	\N
293	TNEFDE3C9F	TENANT	\N	2025-11-22 01:49:05.654248-05	\N	12	t	\N	\N
294	TNEFC3E87E	TENANT	\N	2025-11-22 01:49:05.654911-05	\N	12	t	\N	\N
295	TN9112547B	TENANT	\N	2025-11-22 01:49:05.655556-05	\N	12	t	\N	\N
296	TN4C4902FB	TENANT	\N	2025-11-22 01:49:05.656556-05	\N	12	t	\N	\N
297	TN89B2312B	TENANT	\N	2025-11-22 01:49:05.657299-05	\N	12	t	\N	\N
298	TN79F7DB2A	TENANT	\N	2025-11-22 01:49:05.657991-05	\N	12	t	\N	\N
299	TNB7E0F052	TENANT	\N	2025-11-22 01:49:05.658649-05	\N	12	t	\N	\N
300	TNB89F2EEF	TENANT	\N	2025-11-22 01:49:05.659332-05	\N	12	t	\N	\N
301	TN30FCFFDE	TENANT	\N	2025-11-22 01:49:05.660064-05	\N	12	t	\N	\N
302	TNF120FC8A	TENANT	\N	2025-11-22 01:49:05.660896-05	\N	12	t	\N	\N
303	TN97894E16	TENANT	\N	2025-11-22 01:49:05.661599-05	\N	12	t	\N	\N
304	TN9CEC5FA3	TENANT	\N	2025-11-22 01:49:05.662331-05	\N	12	t	\N	\N
305	TN1359EEBF	TENANT	\N	2025-11-22 01:49:05.663094-05	\N	12	t	\N	\N
306	TNF693C89C	TENANT	\N	2025-11-22 01:49:05.66438-05	\N	12	t	\N	\N
307	TNBEBF0C24	TENANT	\N	2025-11-22 01:49:05.665358-05	\N	12	t	\N	\N
308	TN8C5C8143	TENANT	\N	2025-11-22 01:49:05.666135-05	\N	12	t	\N	\N
309	TNF1E9F4C2	TENANT	\N	2025-11-22 01:49:05.667168-05	\N	12	t	\N	\N
310	TNF961B753	TENANT	\N	2025-11-22 01:49:05.667933-05	\N	12	t	\N	\N
311	TN7C7248FC	TENANT	\N	2025-11-22 01:49:05.668605-05	\N	12	t	\N	\N
312	TN213F8909	TENANT	\N	2025-11-22 01:49:05.669312-05	\N	12	t	\N	\N
313	TN176F11F9	TENANT	\N	2025-11-22 01:49:05.670108-05	\N	12	t	\N	\N
314	TN00DA9F4A	TENANT	\N	2025-11-22 01:49:05.670862-05	\N	12	t	\N	\N
315	TN0C52F171	TENANT	\N	2025-11-22 01:49:05.671579-05	\N	12	t	\N	\N
316	TN130FE986	TENANT	\N	2025-11-22 01:49:05.672412-05	\N	12	t	\N	\N
317	TN67DE6DD3	TENANT	\N	2025-11-22 01:49:05.673533-05	\N	12	t	\N	\N
318	TNC67DA9D5	TENANT	\N	2025-11-22 01:49:05.6743-05	\N	12	t	\N	\N
319	TN7F08ED86	TENANT	\N	2025-11-22 01:49:05.674971-05	\N	12	t	\N	\N
320	TN1005703D	TENANT	\N	2025-11-22 01:49:05.675666-05	\N	12	t	\N	\N
321	TN1CBB96B4	TENANT	\N	2025-11-22 01:49:05.676358-05	\N	12	t	\N	\N
322	TN9F970717	TENANT	\N	2025-11-22 01:49:05.677032-05	\N	12	t	\N	\N
323	TN27DC5C69	TENANT	\N	2025-11-22 01:49:05.677723-05	\N	12	t	\N	\N
324	TNB61F7AEF	TENANT	\N	2025-11-22 01:49:05.67842-05	\N	12	t	\N	\N
325	TN7FB87344	TENANT	\N	2025-11-22 01:49:05.679117-05	\N	12	t	\N	\N
326	TNE24C211B	TENANT	\N	2025-11-22 01:49:05.679892-05	\N	12	t	\N	\N
327	TNB9FFC654	TENANT	\N	2025-11-22 01:49:05.680583-05	\N	12	t	\N	\N
328	TN3569C36B	TENANT	\N	2025-11-22 01:49:05.681553-05	\N	12	t	\N	\N
329	TNDB8D6E61	TENANT	\N	2025-11-22 01:49:05.682413-05	\N	12	t	\N	\N
330	TN2CA48A57	TENANT	\N	2025-11-22 01:49:05.683129-05	\N	12	t	\N	\N
331	TN2B02226C	TENANT	\N	2025-11-22 01:49:05.683834-05	\N	12	t	\N	\N
332	TN92F039B6	TENANT	\N	2025-11-22 01:49:05.684889-05	\N	12	t	\N	\N
333	TNA7A1F1AF	TENANT	\N	2025-11-22 01:49:05.685646-05	\N	12	t	\N	\N
334	TN775976F0	TENANT	\N	2025-11-22 01:49:05.68639-05	\N	12	t	\N	\N
335	TN8895DCE6	TENANT	\N	2025-11-22 01:49:05.687129-05	\N	12	t	\N	\N
336	TN45FD3169	TENANT	\N	2025-11-22 01:49:05.688322-05	\N	12	t	\N	\N
337	TN33BCB284	TENANT	\N	2025-11-22 01:49:05.689748-05	\N	12	t	\N	\N
338	TN10829DB8	TENANT	\N	2025-11-22 01:49:05.690637-05	\N	12	t	\N	\N
339	TNFAC0F43B	TENANT	\N	2025-11-22 01:49:05.691313-05	\N	12	t	\N	\N
340	TNE66B8545	TENANT	\N	2025-11-22 01:49:05.691968-05	\N	12	t	\N	\N
341	TN45A8DBF1	TENANT	\N	2025-11-22 01:49:05.692681-05	\N	12	t	\N	\N
342	TN050A12E4	TENANT	\N	2025-11-22 01:49:05.693376-05	\N	12	t	\N	\N
343	TN6F1D0967	TENANT	\N	2025-11-22 01:49:05.694027-05	\N	12	t	\N	\N
344	TN8C9AAA6E	TENANT	\N	2025-11-22 01:49:05.694791-05	\N	12	t	\N	\N
345	TNF6CC0B6D	TENANT	\N	2025-11-22 01:49:05.695558-05	\N	12	t	\N	\N
\.


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 1, false);


--
-- Name: admin_audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admin_audit_logs_id_seq', 1, false);


--
-- Name: admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admins_id_seq', 3, true);


--
-- Name: applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.applications_id_seq', 1, false);


--
-- Name: auth_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.auth_group_id_seq', 1, false);


--
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.auth_group_permissions_id_seq', 1, false);


--
-- Name: auth_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.auth_permission_id_seq', 212, true);


--
-- Name: auth_user_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.auth_user_groups_id_seq', 1, false);


--
-- Name: auth_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.auth_user_id_seq', 3, true);


--
-- Name: auth_user_user_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.auth_user_user_permissions_id_seq', 1, false);


--
-- Name: conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.conversations_id_seq', 1, false);


--
-- Name: django_admin_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.django_admin_log_id_seq', 1, false);


--
-- Name: django_content_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.django_content_type_id_seq', 53, true);


--
-- Name: django_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.django_migrations_id_seq', 45, true);


--
-- Name: document_audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.document_audit_logs_id_seq', 1, false);


--
-- Name: document_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.document_messages_id_seq', 1, false);


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.documents_id_seq', 1, false);


--
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.expenses_id_seq', 1, false);


--
-- Name: inspection_checklist_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.inspection_checklist_items_id_seq', 1, false);


--
-- Name: inspection_checklists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.inspection_checklists_id_seq', 1, false);


--
-- Name: invitations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.invitations_id_seq', 1, false);


--
-- Name: landlords_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.landlords_id_seq', 10, true);


--
-- Name: lease_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.lease_documents_id_seq', 1, false);


--
-- Name: lease_tenants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.lease_tenants_id_seq', 158, true);


--
-- Name: lease_terminations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.lease_terminations_id_seq', 1, false);


--
-- Name: leases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.leases_id_seq', 74, true);


--
-- Name: ltb_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ltb_documents_id_seq', 1, false);


--
-- Name: maintenance_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.maintenance_comments_id_seq', 1, false);


--
-- Name: maintenance_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.maintenance_requests_id_seq', 1, false);


--
-- Name: message_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.message_attachments_id_seq', 1, false);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- Name: notification_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notification_preferences_id_seq', 1, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: organization_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.organization_settings_id_seq', 1, false);


--
-- Name: organizations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.organizations_id_seq', 1, false);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.permissions_id_seq', 40, true);


--
-- Name: property_expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.property_expenses_id_seq', 1, false);


--
-- Name: property_management_companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.property_management_companies_id_seq', 3, true);


--
-- Name: rent_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rent_payments_id_seq', 1, false);


--
-- Name: role_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.role_permissions_id_seq', 289, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_id_seq', 13, true);


--
-- Name: security_deposits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.security_deposits_id_seq', 1, false);


--
-- Name: service_provider_ratings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.service_provider_ratings_id_seq', 1, false);


--
-- Name: service_providers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.service_providers_id_seq', 1, false);


--
-- Name: support_tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.support_tickets_id_seq', 1, false);


--
-- Name: tenant_invitations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tenant_invitations_id_seq', 1, false);


--
-- Name: tenants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tenants_id_seq', 160, true);


--
-- Name: ticket_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ticket_attachments_id_seq', 1, false);


--
-- Name: ticket_notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ticket_notes_id_seq', 1, false);


--
-- Name: unified_verification_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.unified_verification_history_id_seq', 1, false);


--
-- Name: unified_verifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.unified_verifications_id_seq', 1, false);


--
-- Name: user_activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_activities_id_seq', 1, false);


--
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_roles_id_seq', 345, true);


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

\unrestrict IeCMlqN1aKD6AWI8zQB0vkEZ94qHj4ofxNO05c2eSizIhYsJKaTCBoQmc38h4bm

