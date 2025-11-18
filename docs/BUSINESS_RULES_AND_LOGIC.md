# Business Rules and Logic Documentation

This document captures all business rules, validation logic, and feature requirements for the Pinaka property management system.

**Last Updated:** January 17, 2025

---

## 1. Lease Expiration and Auto-Renewal Logic

### Ontario, Canada Properties
- **Auto-convert to month-to-month:** Yes, automatically after lease expiration (LTB law)
- **Grace period:** No grace period
- **Notification schedule:**
  - 90 days before: First email
  - 75 days before: Second reminder
  - 65-61 days before: Daily reminders
  - 59 days before: If no response, assume tenant wants month-to-month
- **N11 Form:** Required when both parties agree to terminate
- **N12 Form:** Required when landlord/purchaser/family member needs the unit

### Renewal Policies
- Can be set per property/lease (agreed by PM/landlord and tenant)
- **Note:** Ontario law still applies - after expiry, automatically month-to-month

### New Lease Creation
- Can overlap with existing lease
- New lease always starts from the end of current lease

### Other Jurisdictions
- Logic to be defined later
- System must be jurisdiction-aware and support different rules

---

## 2. Rent Payment Processing and Partial Payments

### Payment Allocation
- **User choice:** For now, user can choose allocation
- **Priority rule:** If tenant owes rent from last month, partial payments go to oldest rent owed first
- **Allocation priority:** Rent → Late fees → Damages

### Partial Payments
- **Late fee reduction:** Only after full month rent is paid on due date
- **Until full rent paid:** Rent is considered late

### Overpayments
- **Tenant choice:** Give tenant option to:
  - Apply to next month's rent automatically
  - Be held as credit balance
  - Be refunded immediately

### NSF/Bounced Checks
- **Original payment:** Marked as failed
- **NSF fees:** Automatically charged

### Payment Method Verification
- **Checks:** 5-day hold period before marking as "cleared"
- **Always required:** Hold period should always be enforced for checks

---

## 3. Maintenance Work Order Assignment and Reassignment

### Work Order Visibility
- **Maintenance Techs:** Can only see work orders assigned to them (including past assignments)
- **Not visible:** Cannot see work orders for same property assigned to other techs

### Reassignment Rules
- **Maintenance Tech:** Can reject work order if busy/unavailable
- **PM:** Can reassign work orders
- **PMC Admin:** Can reassign work orders

### Response Time Requirements
- **Critical/High Priority:** 3 hours to respond
  - If no response: Notify PMC/PM or Landlord to find alternatives
- **Other priorities:** 6 hours to respond

### Urgent Work Orders
- **Broadcast workflow:** Broadcast to all available techs
- **Information shown:** Only work order info (what needs to be done)
- **Details hidden:** No other details shown in broadcast

### Work Order Completion Approval
- **Approval hierarchy:**
  1. Tenant first (if tenant attached to property)
  2. If no tenant: Landlord/PMC
  3. If no tenant: PMC/Landlord based on who manages property
- **Maintenance Tech:** Can mark as complete but needs approval from tenant/landlord/PMC
- **Comments:** Look for comments in approval process

---

## 4. Property Transfer and Ownership Changes

### Transfer Workflow
- **PropertyTransfer workflow object:** Required
- **Transfer types:** Ownership, Management, or Both
- **Statuses:** Requested | Pending Acceptance | Completed | Cancelled

### What Transfers Automatically
1. **Active Leases & Tenants:** Automatically move with property (leases reference `property_id`, tenants reference `lease_id`)
2. **Outstanding Rent, Balances, Ledgers:**
   - **Option A:** Ledgers transfer entirely (new owner inherits balances, prepaid rent, deposits)
   - **Option B:** Split accounting (previous transactions belong to old owner, future transactions belong to new owner, outstanding balances transfer but marked as 'prior owner period')
3. **Maintenance Work Orders:** Transfer based on who manages property after transfer
4. **Historical Financial Records:** Never deleted, remain attached to property
   - Old owner: Read-only access for regulatory reasons
   - New owner: Full access from moment of transfer
5. **Security Deposits/LMR:** Ledger transfers to new owner (not refunded unless transfer triggers move-out)

### What Does NOT Transfer
- Prior owner's banking information
- Vendor contracts (optional: may allow opt-in transfer)

### New Owner/PMC Already in System
1. Old owner/PMC initiates Transfer Request
2. System prompts for: New owner/PMC, Effective date, Transfer type
3. New owner/PMC receives notification and must approve
4. Once approved: Property ownership/management updates, all related data transfers

### New Owner/PMC NOT in System
1. Old owner starts transfer
2. Provides: New owner's name, email, contact info
3. System sends: Invite to create account (linking to transfer)
4. Transfer state = "pending_new_user_signup"
5. Once new user signs up → Transfer continues as normal

### If New Owner Refuses to Join
- Property becomes "external-managed"
- Leases freeze (cannot be modified)
- Tenants get message to contact new external owner
- Allow "download tenant/lease packet" export for compliance

### Edge Cases
- Owner sells portfolio of multiple properties
- PMC resigns from managing a property
- Missing deposit information
- Tenants with upcoming automated payments
- Pending eviction cases
- Subsidized housing payment transfers
- Local legal requirements (receipts, jurisdiction notices)

---

## 5. Security Deposit / Last Month's Rent Management

### Ontario, Canada Properties Only

#### Overview
- **Security deposits:** NOT ALLOWED (illegal in Ontario)
- **Last Month's Rent (LMR):** Only permitted deposit
- **All references to "security deposit" must be removed or replaced with LMR workflow**

#### LMR Collection
- **When:** At lease signing or before move-in
- **Amount:** Must equal current monthly rent on date collected
- **Partial LMR:** Not typically allowed (but system should track top-ups if needed)

#### LMR Interest Calculation
- **Required:** Ontario law requires interest on LMR
- **Rate:** Annual guideline rent increase percentage (not market rate)
- **Frequency:** Once per year (on anniversary of LMR receipt)
- **Application:**
  - Applied as **top-up** to increase LMR to equal current rent (most common)
  - OR paid to tenant directly (rare)

#### Move-Out Process
- **LMR application:** Must be applied to last rental period (it's prepaid rent, not a damage deposit)
- **Cannot use for:** Damages, cleaning, unpaid utilities, etc.
- **If tenant owes money:** Must bill directly, file LTB A1 if unpaid
- **Refund workflow:** Only if:
  - Rent decreases (rare)
  - Tenant overpaid LMR
  - LMR exceeds final month's rent
  - Landlord mistakenly collected illegal deposit

#### Damages and Outstanding Charges
- **Documentation:** Photos uploaded, itemized list with costs, move-in/move-out inspection records
- **Communication:** Automated charge notice or manual communication
- **If unpaid:** File LTB A1 (Application for Former Tenants), send to collections, internal follow-up workflow

#### Illegal Deposit Prevention
- **System should prevent:**
  - Security deposits
  - Damage deposits
  - Cleaning deposits
  - Key deposits above replacement cost
  - Pet deposits (except assistance animals cannot be charged anyway)
- **System behavior:**
  - Warnings if user tries to add illegal deposit
  - Block creation entirely
  - Log compliance violation

### Other Jurisdictions
- Logic to be defined later
- System must be jurisdiction-aware and support different deposit rules

---

## 6. Document Retention and Expiration Management

### Document Retention Policy

| Document Type | Retention Period |
|--------------|------------------|
| Tax / Financial Records (rent payments, invoices, receipts) | 6+ years (to satisfy CRA) |
| Lease / Tenancy Agreements | 7 years after tenancy ends |
| Security Deposit Records & Move-in/out documentation | 7 years (in case of disputes) |
| Communication Records (notices, emails, repair requests) | 1-3 years after tenancy (or longer if dispute risk) |
| Personal Info / Application Data (credit report, IDs) | As long as reasonably needed, securely destroyed when not needed |

### Document Expiration
- **Reminder schedule:** 54 days, 30 days, and 15 days before expiration
- **Expired documents:** Should be archived (not deleted)
- **Renewal:** Expired documents must be renewed/updated, new document needs to be uploaded

### Account Deactivation/Deletion
- **Documents:** Everything archived for at least 7 years (no deletion)
- **Access to archived documents:**
  - All parties (old landlord, new landlord, PMC, system admins) can view and download
  - Cannot do anything in system except view and download documents
- **Legal compliance:** At least 7 years, configurable by state/province

### Document Sharing and Access
- **External sharing:** Yes, for legal issues, documentation, or taxation purposes only
- **Restrictions:** No PII information (IDs, passports, credit records) - only leases, rent receipts, etc.
- **Audit trail:** Yes, should be audit trail for everything

---

## 7. Financial Reconciliation and Reporting

### Bank Reconciliation Process
- **Frequency:** Monthly or quarterly
- **Who can perform:** Accountant, PMC Admin, Landlord
- **Discrepancies:** Mark and work on it
- **Matching:** Manual for now, working towards automation

### Owner Payouts and Statements
- **Calculation:** Rent - Expenses - Commission = Payout
- **Schedule:** Depends on agreement (set during agreement period)
- **Type:** Always scheduled (not on-demand)
- **Information included:** Income, expenses, net profit, commission breakdown
- **Customization:** Not for now, may be future enhancement

### Financial Periods and Year-End Closing
- **Definition:** According to CRA or IRS standards (regular taxation period)
- **Who can close:** Accountant, PMC Admin, Landlord
- **Reopening:** Currently open, but should have audit trail (4 W's: Who, What, When, Where)
- **Year-end procedures:** Yes, always required (final reconciliation, statement generation)

### Expense Approval Workflows
- **Threshold:** Configurable per property/PMC
- **Approval required:** Both PMC Admin + Landlord
- **Timing:** Approval should happen when work order quote starts (not retroactively)

---

## 8. Multi-Tenant Lease Scenarios and Roommate Management

### Rent Payment Responsibility
- **Current tracking:** Not tracking individual tenant splits
- **Responsibility:** Primary and co-applicants are equally responsible
- **Payment:** Full payment required each month (portion payment is considered partial payment)
- **If one doesn't pay:** All tenants on lease are responsible

### Primary Tenant Designation
- **Responsibilities/Privileges:** Same as defined on lease
- **Change during lease:** Yes, but should be approved by current primary tenant
- **Permissions:** Same for both for now, will work on split and permissions later

### Adding/Removing Tenants
- **Adding mid-term:** Yes, needs approval when added
- **Removing tenant:** Yes, but LMR stays with landlord until all vacate
- **Tenant portion:** Tenants/co-tenants have to deal with their portion among themselves (logic to be implemented later)
- **If one moves out:** Lease continues (no new lease required)

### Communication and Notifications
- **Lease notifications:** Go to all tenants (not just primary)
- **Tenant-to-tenant communication:** No (not an IM system, purely between PMC/landlord and tenants)

### Financial Tracking
- **Current tracking:** Total lease payments only (until tenant split logic implemented)
- **Overpayment:** All goes towards rent in lease, tenants/co-tenants need to handle among themselves
- **Future feature:** Individual payment tracking per tenant

---

## 9. Notification System and Communication Workflows

### Notification Channels and Preferences
- **Supported channels:** Email and in-app push (SMS option for later expansion)
- **User preferences:** Users can set different preferences for different event types
- **Mandatory notifications:** Yes, some cannot be disabled (payment due reminders, lease expiration warnings)
- **PMC Admin defaults:** Yes, PMC Admins can set default notification preferences for their PMC users

### Rent Payment Reminders
- **Schedule:** 7 days before, 3 days before, on due date, after due date (late payment notification)
- **Reminder attempts:** 3 attempts before escalation
- **Content:** Should include payment links or instructions

### Maintenance Work Order Notifications
- **On creation:** All parties notified (tenant, landlord, PMC, assigned Maintenance Tech)
- **On status change:** All parties notified (assigned, in progress, completed)
- **Scheduled maintenance:** Tenants receive notifications and must approve

### Lease and Document Notifications
- **Lease expiration:** 90, 75, 65-61 days (as discussed earlier)
- **Document expiration:** All parties notified (document owner, landlord, PMC)
- **Pending approvals:** Yes, always notify (lease creation, big expenses, refunds)

### Bulk Communications
- **Allowed:** Yes, landlords/PMCs can send bulk messages to multiple tenants
- **Restrictions:** Only operational messages (marketing opt-in, off by default)
- **Logging:** Yes, bulk communications must be logged and tracked

---

## 10. Data Validation, Business Rules, and Edge Cases

### Property and Unit Management
- **Zero units:** No, property must have at least 1 unit (set to 1 for single home or town homes)
- **Delete with active leases:** Cannot delete property with active lease and tenants (show message)
- **Merge/split units:** Not for now, but keep option open for later implementation
- **Address validation:** 
  - Same property cannot be added with same address by same landlord
  - Format should always come from TomTom API

### Lease Validation and Business Rules
- **Backdating:** Yes, allowed (especially when implementing system new)
- **End date before start date:** Not allowed
- **Active lease conflict:** Cannot create lease for unit with active lease (until date changed on existing lease)
- **Lease duration:** Minimum 1 month, maximum 24 months
- **Negative rent:** Yes, allowed (credits/refunds for overpayment, can be adjusted next month or refunded)

### Financial Data Validation
- **Overpayment:** Auto-adjusted to next month rent, if user wants refund, process refund
- **Negative expenses:** Yes, allowed (credits/refunds from vendors), logged correctly, tracked and audited
- **Expense categories:** Maintenance expenses are expense, not income

### User and Access Management
- **Landlord access:** Cannot access property they don't own (system should prevent)
- **Tenant access:** Cannot access lease/property they're not associated with (system should help them stick with their own property)
- **Multiple roles:** Tabled for now (need to work on logic for landlord who is also tenant, vendors/contractors/maintenance tech who also rent/manage property - do they need multiple accounts or multiple roles?)

### Data Consistency and Integrity
- **Landlord deactivation with active leases:** Landlord can see existing info but cannot do anything in system
- **PMC relationship ends with active leases:** Landlord automatically becomes the one who manages property until they sign up with new PMC (give landlord 30 days access)
- **Deletion rules:** Soft delete and archive only (no hard deletes)

---

## Summary of Key Principles

1. **Jurisdiction-Aware:** System must handle Ontario-specific rules (LMR) and be expandable for other jurisdictions
2. **Audit Trail:** Everything must be logged (4 W's: Who, What, When, Where)
3. **Soft Delete/Archive:** No hard deletes, everything archived for compliance
4. **Approval Workflows:** Critical actions require appropriate approvals
5. **Data Integrity:** Validation rules prevent invalid data entry
6. **Future-Proof:** Many features marked as "future enhancement" or "keep open for later"
7. **User Choice:** Where appropriate, give users flexibility (payment allocation, overpayment handling)
8. **Compliance:** Follow legal requirements (CRA, IRS, LTB) for retention, reporting, and data handling

---

## Implementation Priority

### Phase 1 (Current/Immediate)
- Basic lease expiration and month-to-month conversion (Ontario)
- Payment processing with partial payment support
- Maintenance work order assignment and reassignment
- Document retention and expiration reminders
- Basic notification system (email, in-app)

### Phase 2 (Near-term)
- Property transfer workflow
- Bank reconciliation (manual)
- Owner payouts and statements
- Multi-tenant lease support (basic)
- Enhanced notification preferences

### Phase 3 (Future Enhancements)
- Automated bank reconciliation
- Individual tenant payment splits
- Unit merge/split functionality
- Multiple roles per user
- SMS notifications
- Custom owner statement formats
- Advanced multi-tenant permissions

---

---

## 11. Payment Processing - Failed Payments and Retries

### Failed Payment Retry Logic
- **Automatic retries:** Yes, 3 times total
- **Retry intervals:** 12 hours apart
- **First retry:** Automatic (12 hours after first failure)
- **Second and third retries:** Require tenant approval
  - If tenant doesn't respond to approval request, only 1 automatic attempt is made
- **Tenant notifications:** Yes, tenants are notified after each failed attempt
- **After all retries fail:** 
  - Payment marked as "Failed"
  - Late fees applied after due date passes

### Payment Disputes and Chargebacks (Ontario-Specific)

#### Payment Status Tracking
- **Statuses used:** "Completed", "Disputed", "Chargeback Pending", "Chargeback Won/Lost", "Reversed (Funds Pulled)"
- **Status changes:** Automatically change payment status when dispute/chargeback detected
- **Ledger entries:** Mark payment as reversed in rent ledger

#### Late Fees During Disputes
- **DO NOT automatically reverse late fees** unless payment processor explicitly instructs
- **Freeze late fee assessment** while chargeback is open
- **If landlord wins:** Re-enable or adjust fees
- **If landlord loses:** Fees remain frozen, rent marked as unpaid

#### Notifications
- **Tenant:** "Payment is under dispute. Rent may be considered unpaid."
- **Landlord/PMC:** "Funds reversed. Rent is now unpaid."
- **Accountant:** Optional but recommended for audits

#### System Workflow (Ontario-Compliant)
1. **Chargeback detected:** Payment status = "Chargeback Pending", rent ledger entry becomes "reversed"
2. **Automatic notifications sent** to tenant and landlord/PMC
3. **System holds late fees** (stops calculating new late fees until dispute closed)
4. **Landlord prompted:** "Would you like to mark rent as unpaid?" (manual action, not automatic)
5. **After processor decision:**
   - **If landlord wins:** Payment status = "Completed (Recovered)", unfreeze late fees, adjust balance
   - **If landlord loses:** Payment status = "Chargeback Lost → Unpaid Rent", landlord may issue N4 Notice

#### Automatic Actions (CAN do)
- Freeze tenant account (cannot make new payments until dispute resolved)
- Prevent new maintenance requests (optional)
- Notify legal team or support
- Provide templates/steps to generate N4 form manually

#### Automatic Actions (MUST NOT do - Ontario RTA)
- **DO NOT** evict automatically
- **DO NOT** send eviction notices automatically
- **DO NOT** lock tenant out of portal in a way that prevents rent payment

### Payment Gateway Failures
- **Queue payments:** Yes, using retry window + idempotency
- **Notify tenants:** Yes, assure no penalties due to outage
- **Fallback methods:** Allowed (e-Transfer recommended)
- **Auto-payments:** Retry; never mark late due to gateway outage
- **Legal issues:** Landlord cannot issue N4 until payment truly unpaid

---

## 12. Early Lease Termination (Ontario-Specific)

### Penalties and Fees
- **No flat "lease-break fees":** Illegal in Ontario - cannot demand flat fee just for breaking lease
- **Actual losses only:** Landlord can only claim actual financial losses after attempting to mitigate
- **Landlord must mitigate:** Cannot sit on unit and demand full remainder rent if they could reasonably find new tenant
- **Not configurable:** Penalties must be based on actual losses, not arbitrary amounts

### Calculation
- **No automatic system calculation:** No generic "lease break fee" - must be based on actual loss
- **Manual calculation:** Landlord calculates based on:
  - Lost rent (if unit not re-rented)
  - Re-rental costs (advertising, etc.)
  - Must show reasonable efforts to re-rent
- **Dispute resolution:** If disputed, goes to LTB who will look at actual losses and mitigation efforts

### Security Deposit/LMR When Lease Terminates Early
- **LMR can be used:** To cover unpaid rent or damages (not as penalty)
- **Cannot be held as penalty:** If landlord hasn't actually suffered loss
- **If new tenant moves in:** Landlord's loss may be lower, less/no claim beyond deposit
- **LTB application required:** If landlord wants to keep deposit for unpaid rent, must apply to LTB

### Buy-Out
- **Not a formal regulated fee:** "Buy-out" isn't a formal fixed fee under RTA
- **Mutual agreement (N11):** What people call "buy-out" is negotiating with landlord via Form N11
- **Cost tied to actual loss:** Usually tied to what landlord expects to lose plus re-rental costs
- **Not standardized:** Not a standardized "2 months rent" unless justified by actual losses

### Landlord Approval
- **Yes, required:** For assignment, mutual termination (N11), etc.
- **Assignment:** Requires landlord approval (refusal cannot be unreasonable)
- **Mutual termination:** Requires landlord agreement via N11 to formally end lease early

### Notice Requirements
- **60 days written notice:** Required if paying monthly
- **Fixed-term leases:** 60-day notice applies, but termination date normally can't be before last day of lease unless agreement
- **Forms:**
  - **N9:** Notice to End Tenancy
  - **N11:** Agreement to End the Tenancy (when both agree)
  - **N15:** Tenant's Notice to End because of Domestic Violence (28 days, no penalty)

### Special Exceptions (No Penalty)
- **Domestic/Sexual Violence:** Can give 28 days' notice using Form N15, terminate without penalty
- **Uninhabitable conditions:** May have legal basis depending on situation

---

## 13. Tax Reporting (T776 - Ontario/Canada)

### T776 Form Generation
- **When:** Annually (calendar year Jan 1 - Dec 31)
- **Who prepares:** Landlord prepares T776 as part of personal or business tax return
- **Not auto-generated:** No "auto-generate" T776 like U.S. 1099s - landlord prepares it
- **Distribution:** Landlord does NOT send T776 to tenants - it's for CRA/tax-filing only

### What's Included in T776
- **Gross Rents:** Cash or cheque rental payments (line 8141)
- **Other Income:** Non-cash value (services) at fair-market value (line 8230)
- **Total Rental Income:** Sum reported on line 8299, feeds into main tax return
- **Expenses:** Advertising, insurance, interest, bank charges, office/management fees, repairs/maintenance, property taxes, utilities, travel, etc.
- **Capital Cost Allowance (CCA):** Optional depreciation of capital assets (building, equipment)
- **NOT deductible:** Mortgage principal (only interest), penalties, own labour, personal-use portions

### Record-Keeping
- **Required:** Receipts, invoices, contracts, bank statements to support claims
- **Retention:** 6 years from end of tax year (CRA requirement)

### Accounting Methods
- **Accrual method (most common):** Report income when earned, expenses when incurred
- **Cash method:** Only if net rental income would be nearly same under both methods

### Vendor/Service Provider Reporting
- **1099s (U.S.):** Not applicable in Canada
- **T4A (Canada):** May be required for contractors/vendors if they meet threshold
- **Threshold:** To be determined based on CRA requirements

### Customization
- **Not for now:** Tax report formats not customizable (may be future enhancement)
- **Distribution:** Reports must be downloaded (not automatically sent via email)

---

## 14. Financial Year-End Closing Process

### Pre-Close Steps (Before Period Can Be Closed)

#### Transaction Finalization
- Enter all rent charges, CAM charges, late fees, manual journal entries
- Post all recurring charges and scheduled transactions

#### Payment & Receipt Completion
- Apply all pending payments (tenant payments, owner contributions, refunds, etc.)
- Clear unapplied credits / unapplied cash

#### Bank Reconciliation
- Complete reconciliation for all bank accounts (operating, trust, escrow, security deposit accounts)
- Resolve any unmatched or leftover transactions

#### Vendor & Owner Invoices
- Ensure all vendor bills or owner payouts are posted and approved
- Approve all property manager charges

#### Lease & Contract Review
- Ensure move-outs/renewals are processed and prorations calculated
- Validate deposit transfers and deposit refunds

### Validation Checks (System Integrity)

#### Data Validation
- All transactions posted (no drafts or unposted journals)
- No pending approvals for: vendor bills, refunds, management fees, adjustments
- All reconciliations completed with zero differences

#### Exception Review
- Negative balances on tenant ledgers
- Leases with invalid configurations
- Duplicate or missing transactions
- Unpaid owner statements

#### Compliance Checks
- Trust account compliance (for PMCs)
- Escrow balance validation
- Deposit liability vs. bank balance match

### Reports Generated During Year-End Closing

#### Financial Statements
- Balance Sheet
- Income Statement (P&L)
- Trial Balance
- Ledger summaries per property / per entity

#### Audit & Reconciliation Reports
- Bank reconciliation statements
- Transaction audit log
- Deposit liability reports
- Rent roll & lease ledger summaries

#### Tax-Relevant Reports
- T776 reports (for Canada-based systems)
- Owner statements & Schedule E type reports
- Vendor payment summaries

#### Operational Reports
- Vacancy reports
- Tenant aged receivables
- Work-order cost summaries

### Reversal or Re-Opening of Year-End

#### Typically Allowed with Restrictions
- Re-open last closed fiscal period (admin-only permission)
- Post correcting journal entries
- Re-run validations and close again

#### Typically Not Allowed
- Modifying or deleting historical posted transactions in a closed year
- Changing tax-related data (e.g., after T776s are issued)

#### Best Practice
- If re-opening isn't allowed, create:
  - Adjustment entries dated Jan 1 of the next year
  - Audit note documenting the correction

### Notifications to Stakeholders

#### Landlords / Property Owners
- Owner statements
- Year-end performance summaries
- Tax documents (e.g., T776s, Schedule-E style summaries)

#### Accountants / Financial Teams
- Confirmation that the period is closed
- Exported books
- Compliance status reports

#### PMCs (Property Management Companies)
- Trust account compliance results
- Fee summaries
- Operational KPIs

---

## 15. Backup and Disaster Recovery

### Backup Frequency
- **Best Case:** Real-time or near real-time incremental backups (continuous database binlog streaming), full backups at least daily, redundant backups across multiple regions and cloud providers, automated monitoring and alerts
- **Minimum Requirement:** Daily full backups with incremental backups

### Data Coverage
- **Best Case:** Full application database, file storage (tenant documents, leases, invoices, images), configuration data (env settings, secrets with encryption), infrastructure as code, logging and audit trails
- **Must Include:** Database, files, configuration, audit logs

### Retention Policy
- **Best Case:** Tiered retention - hourly backups kept for 48-72 hours, daily backups kept for 30-90 days, monthly backups kept for 1-7 years, meets compliance standards (SOC2, ISO 27001, CRA/IRS requirements), retrievable on demand
- **Minimum:** 7 years for compliance (CRA requirement)

### Recovery Time Objective (RTO) and Recovery Point Objective (RPO)
- **RTO (Recovery Time Objective):** How fast you can recover
  - **Best Case:** < 1 hour (system fully back online within the hour)
  - **Minimum:** < 24 hours
- **RPO (Recovery Point Objective):** How much data you can lose
  - **Best Case:** < 5 minutes (only 5 minutes of lost data in worst case)
  - **Minimum:** < 1 hour
- **Achieved through:** Hot standbys, failovers, replica databases

### Backup Testing
- **Best Case:** Scheduled restore tests quarterly or monthly, automated restore verification (checksum, data consistency), DR simulations performed annually, failover tested in real conditions
- **Minimum:** Quarterly restore tests, annual DR simulations

### Disaster Recovery Plan
- **Best Case:** Full DR plan with step-by-step restore instructions, communication plan, roles/responsibilities, dependencies & risks, cloud provider architecture diagrams, failover automation, DR plan tested annually, offsite copy stored securely
- **Minimum:** Documented DR plan with restore instructions, roles/responsibilities, tested annually

---

**Note:** This document should be updated as new business rules are defined or existing rules are refined.

