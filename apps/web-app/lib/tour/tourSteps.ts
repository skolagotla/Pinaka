/**
 * Role-based Tour Steps Configuration
 */
import { TourConfig } from '@/lib/hooks/useTourState';

export const SUPER_ADMIN_TOUR: TourConfig = {
  id: 'super_admin_tour',
  name: 'Super Admin Tour',
  steps: [
    {
      id: 'dashboard-overview',
      target: '[data-tour-id="dashboard-overview"]',
      title: 'Welcome to Pinaka!',
      content: 'This is your Portfolio Dashboard. Here you can see an overview of all properties, tenants, and key metrics across the entire platform.',
      position: 'center',
    },
    {
      id: 'sidebar-navigation',
      target: '[data-tour-id="sidebar-navigation"]',
      title: 'Navigation Sidebar',
      content: 'Use the sidebar to navigate between different sections. As a Super Admin, you have access to all Portfolio and Platform features.',
      position: 'right',
    },
    {
      id: 'administrators-tab',
      target: '[data-tour-id="administrators-tab"]',
      title: 'Administrators',
      content: 'Manage system administrators and their permissions. You can create, edit, and assign roles to administrators.',
      position: 'right',
    },
    {
      id: 'pmcs-tab',
      target: '[data-tour-id="pmcs-tab"]',
      title: 'PMCs (Property Management Companies)',
      content: 'View and manage all Property Management Companies in the system. Create new PMCs and assign administrators.',
      position: 'right',
    },
    {
      id: 'properties-tab',
      target: '[data-tour-id="properties-tab"]',
      title: 'Properties',
      content: 'View all properties across all organizations. You can see property details, units, and associated tenants.',
      position: 'right',
    },
    {
      id: 'landlords-tab',
      target: '[data-tour-id="landlords-tab"]',
      title: 'Landlords',
      content: 'Manage all landlords in the system. View their properties, tenants, and lease agreements.',
      position: 'right',
    },
    {
      id: 'tenants-tab',
      target: '[data-tour-id="tenants-tab"]',
      title: 'Tenants',
      content: 'View all tenants across all properties. Access tenant profiles, lease information, and communication history.',
      position: 'right',
    },
    {
      id: 'leases-tab',
      target: '[data-tour-id="leases-tab"]',
      title: 'Leases',
      content: 'Manage all lease agreements in the system. Track lease terms, renewals, and payments.',
      position: 'right',
    },
    {
      id: 'vendors-tab',
      target: '[data-tour-id="vendors-tab"]',
      title: 'Vendors',
      content: 'View and manage all vendors and contractors. Track work orders and service history.',
      position: 'right',
    },
    {
      id: 'platform-settings',
      target: '[data-tour-id="platform-settings"]',
      title: 'Platform Settings',
      content: 'Access global platform settings, system configuration, and audit logs. This section is only available to Super Admins.',
      position: 'right',
    },
  ],
};

export const PMC_ADMIN_TOUR: TourConfig = {
  id: 'pmc_admin_tour',
  name: 'PMC Admin Tour',
  steps: [
    {
      id: 'dashboard-summary',
      target: '[data-tour-id="dashboard-summary"]',
      title: 'Dashboard Overview',
      content: 'Welcome to your Portfolio Dashboard! Here you can see a summary of your organization\'s properties, tenants, and key metrics.',
      position: 'center',
    },
    {
      id: 'properties-list',
      target: '[data-tour-id="properties-list"]',
      title: 'Properties',
      content: 'View and manage all properties under your organization. Create new properties, add units, and track property details.',
      position: 'right',
    },
    {
      id: 'landlords-section',
      target: '[data-tour-id="landlords-section"]',
      title: 'Landlords',
      content: 'Manage landlords associated with your properties. View their contact information and property relationships.',
      position: 'right',
    },
    {
      id: 'tenants-section',
      target: '[data-tour-id="tenants-section"]',
      title: 'Tenants',
      content: 'View all tenants across your properties. Access tenant profiles, lease information, and communication history.',
      position: 'right',
    },
    {
      id: 'units-section',
      target: '[data-tour-id="units-section"]',
      title: 'Units',
      content: 'Manage all units within your properties. Track unit availability, tenants, and maintenance status.',
      position: 'right',
    },
    {
      id: 'leases-section',
      target: '[data-tour-id="leases-section"]',
      title: 'Leases',
      content: 'Manage lease agreements for all your properties. Track lease terms, renewals, and payment schedules.',
      position: 'right',
    },
    {
      id: 'vendors-section',
      target: '[data-tour-id="vendors-section"]',
      title: 'Vendors',
      content: 'View and manage vendors and contractors. Track work orders, service history, and vendor performance.',
      position: 'right',
    },
  ],
};

export const PM_TOUR: TourConfig = {
  id: 'pm_tour',
  name: 'Property Manager Tour',
  steps: [
    {
      id: 'pm-dashboard',
      target: '[data-tour-id="pm-dashboard"]',
      title: 'Your Dashboard',
      content: 'Welcome! This dashboard shows you the properties you manage, active work orders, and important updates.',
      position: 'center',
    },
    {
      id: 'assigned-properties',
      target: '[data-tour-id="assigned-properties"]',
      title: 'Assigned Properties',
      content: 'View all properties assigned to you. Click on any property to see details, units, and tenants.',
      position: 'right',
    },
    {
      id: 'units-management',
      target: '[data-tour-id="units-management"]',
      title: 'Units',
      content: 'Manage units within your assigned properties. Track occupancy, maintenance needs, and tenant information.',
      position: 'right',
    },
    {
      id: 'tenants-management',
      target: '[data-tour-id="tenants-management"]',
      title: 'Tenants',
      content: 'View and communicate with tenants in your properties. Access lease information and tenant history.',
      position: 'right',
    },
    {
      id: 'work-orders',
      target: '[data-tour-id="work-orders"]',
      title: 'Work Orders',
      content: 'Create and manage work orders for maintenance and repairs. Track work order status and vendor assignments.',
      position: 'right',
    },
  ],
};

export const LANDLORD_TOUR: TourConfig = {
  id: 'landlord_tour',
  name: 'Landlord Tour',
  steps: [
    {
      id: 'landlord-dashboard',
      target: '[data-tour-id="landlord-dashboard"]',
      title: 'Your Portfolio',
      content: 'Welcome! This dashboard shows an overview of your properties, tenants, and lease information.',
      position: 'center',
    },
    {
      id: 'my-properties',
      target: '[data-tour-id="my-properties"]',
      title: 'My Properties',
      content: 'View all properties you own or manage. See property details, units, and current occupancy status.',
      position: 'right',
    },
    {
      id: 'my-tenants',
      target: '[data-tour-id="my-tenants"]',
      title: 'My Tenants',
      content: 'View all tenants across your properties. Access tenant contact information and lease details.',
      position: 'right',
    },
    {
      id: 'my-leases',
      target: '[data-tour-id="my-leases"]',
      title: 'Leases',
      content: 'View all lease agreements for your properties. Track lease terms, renewal dates, and payment schedules.',
      position: 'right',
    },
    {
      id: 'vendor-list',
      target: '[data-tour-id="vendor-list"]',
      title: 'Vendors',
      content: 'Access a list of approved vendors and contractors. View vendor profiles and service history.',
      position: 'right',
    },
  ],
};

export const TENANT_TOUR: TourConfig = {
  id: 'tenant_tour',
  name: 'Tenant Tour',
  steps: [
    {
      id: 'tenant-dashboard',
      target: '[data-tour-id="tenant-dashboard"]',
      title: 'Welcome!',
      content: 'This is your tenant dashboard. Here you can view your lease information, submit work orders, and contact your property manager.',
      position: 'center',
    },
    {
      id: 'my-lease',
      target: '[data-tour-id="my-lease"]',
      title: 'My Lease',
      content: 'View your lease agreement details, including lease terms, renewal dates, and payment information.',
      position: 'right',
    },
    {
      id: 'my-unit',
      target: '[data-tour-id="my-unit"]',
      title: 'My Unit',
      content: 'View information about your rental unit, including address, amenities, and unit details.',
      position: 'right',
    },
    {
      id: 'submit-work-order',
      target: '[data-tour-id="submit-work-order"]',
      title: 'Submit Work Orders',
      content: 'Need maintenance or repairs? Click here to submit a work order. Your property manager will be notified immediately.',
      position: 'right',
    },
    {
      id: 'vendor-contact',
      target: '[data-tour-id="vendor-contact"]',
      title: 'Vendor Contact',
      content: 'View contact information for approved vendors and contractors. You can reach out directly for emergency repairs.',
      position: 'right',
    },
  ],
};

export const VENDOR_TOUR: TourConfig = {
  id: 'vendor_tour',
  name: 'Vendor Tour',
  steps: [
    {
      id: 'vendor-dashboard',
      target: '[data-tour-id="vendor-dashboard"]',
      title: 'Vendor Dashboard',
      content: 'Welcome! This dashboard shows you assigned work orders, service history, and important updates.',
      position: 'center',
    },
    {
      id: 'work-orders-assigned',
      target: '[data-tour-id="work-orders-assigned"]',
      title: 'Assigned Work Orders',
      content: 'View all work orders assigned to you. Update status, add notes, and track completion.',
      position: 'right',
    },
  ],
};

/**
 * Get tour configuration based on user role
 */
export function getTourForRole(role: string | null): TourConfig | null {
  switch (role) {
    case 'super_admin':
      return SUPER_ADMIN_TOUR;
    case 'pmc_admin':
      return PMC_ADMIN_TOUR;
    case 'pm':
      return PM_TOUR;
    case 'landlord':
      return LANDLORD_TOUR;
    case 'tenant':
      return TENANT_TOUR;
    case 'vendor':
      return VENDOR_TOUR;
    default:
      return null;
  }
}

