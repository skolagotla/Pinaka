/**
 * Status Constants
 * Centralized location for all status-related data
 */

// Unit Statuses
export const UNIT_STATUSES = ["Vacant", "Occupied", "Under Maintenance"];

// Lease Statuses
export const LEASE_STATUSES = ["Active", "Terminated", "Expired"];

// Payment Statuses
export const PAYMENT_STATUSES = ["Unpaid", "Paid", "Overdue", "Partial"];

// Payment Statuses with "All" filter option
export const PAYMENT_STATUS_FILTERS = ["All", ...PAYMENT_STATUSES];

// Payment Methods
export const PAYMENT_METHODS = [
  "Cash",
  "Check",
  "Bank Transfer",
  "E-Transfer",
  "Credit Card",
  "Debit"
];

// Maintenance Request Statuses
export const MAINTENANCE_STATUSES = [
  "New",
  "Pending",
  "In Progress",
  "Completed"
];

// Maintenance Request Priorities
export const MAINTENANCE_PRIORITIES = [
  "Low",
  "Normal",
  "High",
  "Urgent"
];

// Maintenance Categories
export const MAINTENANCE_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Appliance",
  "Structural",
  "Pest Control",
  "Landscaping",
  "General Contracting",
  "Other"
];

// N4 Form Statuses
export const N4_STATUSES = [
  "Draft",
  "Generated",
  "Served",
  "Withdrawn",
  "Resolved"
];

// Document Categories
export const DOCUMENT_CATEGORIES = [
  "Lease Agreement",
  "Rental Receipt",
  "Insurance",
  "Identification",
  "Other"
];

