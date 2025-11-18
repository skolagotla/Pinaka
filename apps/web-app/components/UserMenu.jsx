"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Dropdown, Space, Typography } from 'antd';
import {
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

export default function UserMenu({ firstName, lastName, userRole, collapsed = false }) {
  const router = useRouter();

  function handleSettings() {
    router.push("/settings");
  }

  async function handleLogout() {
    // Admin users should use admin logout endpoint
    if (userRole === 'admin') {
      try {
        // Call admin logout API and redirect to admin login
        const { adminApi } = await import('@/lib/api/admin-api');
        await adminApi.logout();
        window.location.href = '/admin/login';
      } catch (err) {
        console.error('Admin logout error:', err);
        // Still redirect even if API call fails
        window.location.href = '/admin/login';
      }
    } else {
      // Check if user is using email/password login (has auth0_test_email cookie)
      // or Auth0 login
      const hasTestCookie = document.cookie.includes('auth0_test_email=');
      
      if (hasTestCookie) {
        // Email/password users - clear cookie and redirect to home
        fetch('/api/auth/logout', { method: 'POST' })
          .then(() => {
            window.location.href = '/';
          })
          .catch((err) => {
            console.error('Logout error:', err);
            // Still redirect even if API call fails
            window.location.href = '/';
          });
      } else {
        // Regular users use Auth0 logout endpoint
        window.location.href = '/auth/logout';
      }
    }
  }

  if (!firstName && !lastName) {
    return null;
  }

  const displayName = `${firstName} ${lastName}`;
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`;

  const menuItems = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '4px 0' }}>
          <Text strong style={{ display: 'block' }}>
            {displayName}
          </Text>
        </div>
      ),
      disabled: true,
      icon: <UserOutlined />,
    },
    {
      type: 'divider',
    },
  ];

  if (userRole === 'landlord' || userRole === 'tenant' || userRole === 'pmc') {
    menuItems.push({
      key: 'settings',
      label: 'Settings',
      icon: <SettingOutlined />,
      onClick: handleSettings,
    });
  }

  menuItems.push({
    key: 'logout',
    label: 'Logout',
    icon: <LogoutOutlined />,
    danger: true,
    onClick: handleLogout,
  });

  return (
    <Dropdown
      menu={{ items: menuItems }}
      placement={collapsed ? "bottomLeft" : "bottomRight"}
      arrow
      trigger={['click']}
    >
      <Space 
        style={{ 
          cursor: 'pointer',
          width: '100%',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        {!collapsed && (
          <Text strong style={{ fontSize: '14px', marginRight: 8 }}>
            {displayName}
          </Text>
        )}
        <Avatar style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}>
          {initials}
        </Avatar>
      </Space>
    </Dropdown>
  );
}
