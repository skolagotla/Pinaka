"use client";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from 'flowbite-react';
import {
  HiHome,
  HiUser,
  HiDocumentText,
  HiCurrencyDollar,
  HiClipboard,
  HiLockClosed,
  HiCalendar,
  HiChat,
  HiBookOpen,
  HiMail,
  HiShieldCheck,
  HiCheckCircle,
  HiCalculator,
  HiDatabase,
  HiCog,
  HiDownload,
  HiBell,
  HiKey,
} from 'react-icons/hi';

export default function Navigation({ show, userRole, collapsed = false }) {
  const pathname = usePathname();
  const router = useRouter();
  
  if (!show) return null;
  
  const landlordNavItems = [
    { key: "/dashboard", label: "Dashboard", icon: HiHome },
    { key: "/portfolio", label: "Portfolio", icon: HiHome },
    { key: "/properties", label: "Properties", icon: HiHome },
    { key: "/tenants", label: "Tenants", icon: HiUser },
    { key: "/leases", label: "Leases", icon: HiDocumentText },
    { key: "/financials", label: "Financials", icon: HiCurrencyDollar },
    { key: "/library", label: "Library", icon: HiBookOpen },
    { key: "/legal", label: "Legal", icon: HiDocumentText },
    { key: "/operations", label: "Operations", icon: HiClipboard },
    { key: "/calendar", label: "Calendar", icon: HiCalendar },
    { key: "/messages", label: "Messages", icon: HiChat },
    { key: "/partners", label: "Partners", icon: HiUser },
    { key: "/settings", label: "PMC Permissions", icon: HiLockClosed },
    { key: "/verifications", label: "Verifications", icon: HiShieldCheck },
  ];
  
  const tenantNavItems = [
    { key: "/dashboard", label: "Dashboard", icon: HiHome },
    { key: "/payments", label: "Payments", icon: HiCurrencyDollar },
    { key: "/operations", label: "Operations", icon: HiClipboard },
    { key: "/library", label: "Library", icon: HiBookOpen },
    { key: "/messages", label: "Messages", icon: HiChat },
    { key: "/checklist", label: "Checklist", icon: HiCheckCircle },
    { key: "/estimator", label: "Estimator", icon: HiCalculator },
    { key: "/verifications", label: "Verifications", icon: HiShieldCheck },
  ];
  
  const pmcNavItems = [
    { key: "/dashboard", label: "Dashboard", icon: HiHome },
    { key: "/portfolio", label: "Portfolio", icon: HiHome },
    { key: "/properties", label: "Properties", icon: HiHome },
    { key: "/landlords", label: "Landlords", icon: HiUser },
    { key: "/tenants", label: "Tenants", icon: HiUser },
    { key: "/leases", label: "Leases", icon: HiDocumentText },
    { key: "/financials", label: "Financials", icon: HiCurrencyDollar },
    { key: "/invitations", label: "Invitations", icon: HiMail },
    { key: "/library", label: "Library", icon: HiBookOpen },
    { key: "/legal", label: "Legal", icon: HiDocumentText },
    { key: "/operations", label: "Operations", icon: HiClipboard },
    { key: "/calendar", label: "Calendar", icon: HiCalendar },
    { key: "/messages", label: "Messages", icon: HiChat },
    { key: "/partners", label: "Partners", icon: HiUser },
    { key: "/rbac", label: "RBAC Settings", icon: HiLockClosed },
    { key: "/verifications", label: "Verifications", icon: HiShieldCheck },
  ];
  
  const adminNavItems = [
    { key: "/admin/dashboard", label: "Dashboard", icon: HiHome },
    { key: "/admin/portfolio", label: "Portfolio", icon: HiHome },
    { key: "/admin/users", label: "Users", icon: HiUser },
    { key: "/admin/rbac", label: "RBAC Settings", icon: HiLockClosed },
    { key: "/verifications", label: "Verifications", icon: HiShieldCheck },
    { key: "/admin/system", label: "System Monitoring", icon: HiDatabase },
    { key: "/admin/audit-logs", label: "Audit Logs", icon: HiDocumentText },
    { key: "/admin/settings", label: "Platform Settings", icon: HiCog },
    { key: "/admin/analytics", label: "Analytics", icon: HiCog },
    { key: "/admin/support-tickets", label: "Support Tickets", icon: HiMail },
    { key: "/admin/security", label: "Security Center", icon: HiShieldCheck },
    { key: "/admin/data-export", label: "Data Export", icon: HiDownload },
    { key: "/admin/notifications", label: "Notifications", icon: HiBell },
    { key: "/admin/user-activity", label: "User Activity", icon: HiUser },
    { key: "/admin/content", label: "Content Management", icon: HiDocumentText },
    { key: "/admin/api-keys", label: "API Keys", icon: HiKey },
    { key: "/admin/database", label: "Database", icon: HiDatabase },
  ];
  
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
  
  const handleClick = (path) => {
    if (path !== pathname) {
      window.location.href = path;
    }
  };
  
  return (
    <Sidebar.Items>
      <Sidebar.ItemGroup>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.key;
          return (
            <Sidebar.Item
              key={item.key}
              href={item.key}
              icon={Icon}
              active={isActive}
              onClick={(e) => {
                e.preventDefault();
                handleClick(item.key);
              }}
            >
              {item.label}
            </Sidebar.Item>
          );
        })}
      </Sidebar.ItemGroup>
    </Sidebar.Items>
  );
}
