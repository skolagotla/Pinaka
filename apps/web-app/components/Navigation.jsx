"use client";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from 'antd';
import {
  DashboardOutlined,
  HomeOutlined,
  AppstoreOutlined,
  TeamOutlined,
  FileTextOutlined,
  DollarOutlined,
  FileAddOutlined,
  ToolOutlined,
  ReconciliationOutlined,
  LockOutlined,
  FormOutlined,
  WalletOutlined,
  CalendarOutlined,
  MessageOutlined,
  ContactsOutlined,
  BookOutlined,
  BankOutlined,
  CheckCircleOutlined,
  CalculatorOutlined,
  FileSearchOutlined,
  MailOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  DatabaseOutlined,
  SettingOutlined,
  CustomerServiceOutlined,
  SafetyOutlined,
  DownloadOutlined,
  BellOutlined,
  KeyOutlined,
} from '@ant-design/icons';

export default function Navigation({ show, userRole, collapsed = false }) {
  const pathname = usePathname();
  const router = useRouter();
  
  if (!show) return null;
  
  // Different navigation items based on user role
  // Using unified root-level routes that determine content based on role
  const landlordNavItems = [
    { key: "/dashboard", label: "Dashboard", icon: <DashboardOutlined /> },
    { key: "/properties", label: "Properties", icon: <HomeOutlined /> },
    { key: "/tenants", label: "Tenants", icon: <TeamOutlined /> },
    { key: "/leases", label: "Leases", icon: <FileTextOutlined /> },
    { key: "/financials", label: "Financials", icon: <WalletOutlined /> },
    { key: "/documents", label: "Documents", icon: <BookOutlined /> },
    { key: "/operations", label: "Operations", icon: <ToolOutlined /> },
    { key: "/calendar", label: "Calendar", icon: <CalendarOutlined /> },
    { key: "/messages", label: "Messages", icon: <MessageOutlined /> },
    { key: "/partners", label: "Partners", icon: <ContactsOutlined /> },
    { key: "/settings", label: "PMC Permissions", icon: <LockOutlined /> },
    { key: "/verifications", label: "Verifications", icon: <SafetyCertificateOutlined /> },
  ];
  
  const tenantNavItems = [
    { key: "/dashboard", label: "Dashboard", icon: <DashboardOutlined /> },
    { key: "/payments", label: "Payments", icon: <DollarOutlined /> },
    { key: "/operations", label: "Operations", icon: <ToolOutlined /> },
    { key: "/documents", label: "Documents", icon: <BookOutlined /> },
    { key: "/messages", label: "Messages", icon: <MessageOutlined /> },
    { key: "/checklist", label: "Checklist", icon: <CheckCircleOutlined /> },
    { key: "/estimator", label: "Estimator", icon: <CalculatorOutlined /> },
    { key: "/verifications", label: "Verifications", icon: <SafetyCertificateOutlined /> },
  ];
  
  const pmcNavItems = [
    { key: "/dashboard", label: "Dashboard", icon: <DashboardOutlined /> },
    { key: "/properties", label: "Properties", icon: <HomeOutlined /> },
    { key: "/landlords", label: "Landlords", icon: <TeamOutlined /> },
    { key: "/tenants", label: "Tenants", icon: <TeamOutlined /> },
    { key: "/leases", label: "Leases", icon: <FileTextOutlined /> },
    { key: "/financials", label: "Financials", icon: <WalletOutlined /> },
    { key: "/invitations", label: "Invitations", icon: <MailOutlined /> },
    { key: "/documents", label: "Documents", icon: <BookOutlined /> },
    { key: "/operations", label: "Operations", icon: <ToolOutlined /> },
    { key: "/calendar", label: "Calendar", icon: <CalendarOutlined /> },
    { key: "/messages", label: "Messages", icon: <MessageOutlined /> },
    { key: "/partners", label: "Partners", icon: <ContactsOutlined /> },
    { key: "/rbac", label: "RBAC Settings", icon: <LockOutlined /> },
    { key: "/verifications", label: "Verifications", icon: <SafetyCertificateOutlined /> },
  ];
  
  // Admin navigation items - use admin routes (must match app/admin/layout.jsx)
  const adminNavItems = [
    { key: "/admin/dashboard", label: "Dashboard", icon: <DashboardOutlined /> },
    { key: "/admin/users", label: "Users", icon: <UserOutlined /> },
    { key: "/admin/rbac", label: "RBAC Settings", icon: <LockOutlined /> },
    { key: "/verifications", label: "Verifications", icon: <SafetyCertificateOutlined /> },
    { key: "/admin/system", label: "System Monitoring", icon: <DatabaseOutlined /> },
    { key: "/admin/audit-logs", label: "Audit Logs", icon: <FileTextOutlined /> },
    { key: "/admin/settings", label: "Platform Settings", icon: <SettingOutlined /> },
    { key: "/admin/analytics", label: "Analytics", icon: <BarChartOutlined /> },
    { key: "/admin/support-tickets", label: "Support Tickets", icon: <CustomerServiceOutlined /> },
    { key: "/admin/security", label: "Security Center", icon: <SafetyOutlined /> },
    { key: "/admin/data-export", label: "Data Export", icon: <DownloadOutlined /> },
    { key: "/admin/notifications", label: "Notifications", icon: <BellOutlined /> },
    { key: "/admin/user-activity", label: "User Activity", icon: <UserOutlined /> },
    { key: "/admin/content", label: "Content Management", icon: <FileTextOutlined /> },
    { key: "/admin/api-keys", label: "API Keys", icon: <KeyOutlined /> },
    { key: "/admin/database", label: "Database", icon: <DatabaseOutlined /> },
  ];
  
  // Determine navigation items based on role
  let navItems;
  if (userRole === 'admin') {
    navItems = adminNavItems;
  } else if (userRole === 'tenant') {
    navItems = tenantNavItems;
  } else if (userRole === 'pmc') {
    navItems = pmcNavItems;
  } else {
    navItems = landlordNavItems;
  }
  
  const handleClick = (e) => {
    // Use window.location for more reliable navigation that handles redirects better
    if (e.key && e.key !== pathname) {
      window.location.href = e.key;
    }
  };
  
  return (
    <Menu
      onClick={handleClick}
      selectedKeys={[pathname]}
      mode="inline"
      items={navItems}
      style={{
        borderRight: 'none',
        backgroundColor: 'transparent',
        height: '100%',
      }}
    />
  );
}
