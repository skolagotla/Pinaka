/**
 * Resource Name Labels
 * 
 * Maps technical resource names to human-readable labels for display in the UI
 */

export const RESOURCE_LABELS: Record<string, string> = {
  // Property & Unit Management
  'property': 'Property',
  'properties': 'Properties',
  'unit': 'Unit',
  'units': 'Units',
  'portfolio': 'Portfolio',
  'portfolios': 'Portfolios',
  
  // Tenant Management
  'tenant': 'Tenant',
  'tenants': 'Tenants',
  'lease': 'Lease',
  'leases': 'Leases',
  'application': 'Application',
  'applications': 'Applications',
  
  // Rent & Payments
  'rent_payment': 'Rent Payment',
  'rent_payments': 'Rent Payments',
  'charges': 'Charges',
  'refunds': 'Refunds',
  'security_deposit': 'Security Deposit',
  'security_deposits': 'Security Deposits',
  
  // Accounting
  'chart_of_accounts': 'Chart of Accounts',
  'bank_reconciliation': 'Bank Reconciliation',
  'bank_reconciliations': 'Bank Reconciliations',
  'payout': 'Payout',
  'payouts': 'Payouts',
  'owner_statement': 'Owner Statement',
  'owner_statements': 'Owner Statements',
  'financial_period': 'Financial Period',
  'financial_periods': 'Financial Periods',
  'data': 'Data',
  
  // Maintenance
  'maintenance_request': 'Maintenance Request',
  'maintenance_requests': 'Maintenance Requests',
  'work_order': 'Work Order',
  'work_orders': 'Work Orders',
  'expense': 'Expense',
  'expenses': 'Expenses',
  'inspection': 'Inspection',
  'inspections': 'Inspections',
  
  // Vendor Management
  'vendor': 'Vendor',
  'vendors': 'Vendors',
  'service_provider': 'Service Provider',
  'service_providers': 'Service Providers',
  'invoice': 'Invoice',
  'invoices': 'Invoices',
  'vendor_rating': 'Vendor Rating',
  'vendor_ratings': 'Vendor Ratings',
  
  // Reporting
  'report': 'Report',
  'reports': 'Reports',
  'dashboard': 'Dashboard',
  'dashboards': 'Dashboards',
  
  // User & Role Management
  'user': 'User',
  'users': 'Users',
  'role': 'Role',
  'roles': 'Roles',
  'permission': 'Permission',
  'permissions': 'Permissions',
  
  // System Settings
  'settings': 'Settings',
  'system_settings': 'System Settings',
  'notification': 'Notification',
  'notifications': 'Notifications',
  'api_key': 'API Key',
  'api_keys': 'API Keys',
  
  // Documents
  'document': 'Document',
  'documents': 'Documents',
  'file': 'File',
  'files': 'Files',
  
  // Communication
  'message': 'Message',
  'messages': 'Messages',
  'conversation': 'Conversation',
  'conversations': 'Conversations',
  
  // Listings & Marketing
  'listing': 'Listing',
  'listings': 'Listings',
  'marketing': 'Marketing',
  
  // Evictions
  'eviction': 'Eviction',
  'evictions': 'Evictions',
  
  // Tasks
  'task': 'Task',
  'tasks': 'Tasks',
};

/**
 * Convert a technical resource name to a human-readable label
 * @param resource - Technical resource name (e.g., 'chart_of_accounts')
 * @returns Human-readable label (e.g., 'Chart of Accounts')
 */
export function getResourceLabel(resource: string): string {
  // Check exact match first
  if (RESOURCE_LABELS[resource]) {
    return RESOURCE_LABELS[resource];
  }
  
  // Try lowercase version
  const lowerResource = resource.toLowerCase();
  if (RESOURCE_LABELS[lowerResource]) {
    return RESOURCE_LABELS[lowerResource];
  }
  
  // Fallback: Convert snake_case or camelCase to Title Case
  return resource
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get category label
 */
export function getCategoryLabel(category: string): string {
  const categoryLabels: Record<string, string> = {
    'PROPERTY_UNIT_MANAGEMENT': 'Property & Unit Management',
    'TENANT_MANAGEMENT': 'Tenant Management',
    'LEASING_APPLICATIONS': 'Leasing & Applications',
    'RENT_PAYMENTS': 'Rent & Payments',
    'ACCOUNTING': 'Accounting',
    'MAINTENANCE': 'Maintenance',
    'VENDOR_MANAGEMENT': 'Vendor Management',
    'REPORTING_OWNER_STATEMENTS': 'Reporting & Owner Statements',
    'USER_ROLE_MANAGEMENT': 'User & Role Management',
    'SYSTEM_SETTINGS': 'System Settings',
    'DOCUMENTS': 'Documents',
    'COMMUNICATION': 'Communication',
    'MARKETING_LISTINGS': 'Marketing & Listings',
  };
  
  return categoryLabels[category] || category.replace(/_/g, ' ');
}

/**
 * Get role label (human-readable role name)
 */
export function getRoleLabel(roleName: string): string {
  const roleLabels: Record<string, string> = {
    'SUPER_ADMIN': 'Super Admin',
    'PLATFORM_ADMIN': 'Platform Admin',
    'SUPPORT_ADMIN': 'Support Admin',
    'BILLING_ADMIN': 'Billing Admin',
    'AUDIT_ADMIN': 'Audit Admin',
    'PMC_ADMIN': 'PMC Admin',
    'PROPERTY_MANAGER': 'Property Manager',
    'LEASING_AGENT': 'Leasing Agent',
    'MAINTENANCE_TECH': 'Maintenance Technician',
    'ACCOUNTANT': 'Accountant',
    'OWNER_LANDLORD': 'Owner / Landlord',
    'TENANT': 'Tenant',
    'VENDOR_SERVICE_PROVIDER': 'Vendor / Service Provider',
  };
  
  return roleLabels[roleName] || roleName.replace(/_/g, ' ');
}

