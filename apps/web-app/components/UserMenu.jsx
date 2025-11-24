"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Dropdown, Button } from 'flowbite-react';
import {
  HiCog,
  HiLogout,
  HiUser,
} from 'react-icons/hi';

export default function UserMenu({ 
  firstName, 
  lastName, 
  userRole, 
  collapsed = false,
  onLogout,
  onSettings 
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  function handleSettings() {
    if (onSettings) {
      onSettings();
    } else if (userRole === 'admin') {
      router.push("/admin/settings");
    } else {
      router.push("/settings");
    }
    setIsOpen(false);
  }

  async function handleLogout() {
    if (onLogout) {
      onLogout();
    } else if (userRole === 'admin') {
      try {
        const { adminApi } = await import('@/lib/api/admin-api');
        await adminApi.logout();
        window.location.href = '/admin/login';
      } catch (err) {
        console.error('Admin logout error:', err);
        window.location.href = '/admin/login';
      }
    } else {
      const hasTestCookie = document.cookie.includes('auth0_test_email=');
      
      // Use FastAPI v2 logout
      try {
        const { v2Api } = await import('@/lib/api/v2-client');
        v2Api.logout();
        window.location.href = '/login';
      } catch (err) {
        console.error('Logout error:', err);
        window.location.href = '/login';
      }
    }
    setIsOpen(false);
  }

  if (!firstName && !lastName) {
    return null;
  }

  const displayName = `${firstName} ${lastName}`;
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="relative">
      <Button
        color="gray"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2"
      >
        {!collapsed && (
          <span className="text-sm font-medium text-gray-700">{displayName}</span>
        )}
        <Avatar
          placeholderInitials={initials}
          rounded
          className="bg-blue-600 text-white"
        />
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-56 rounded-lg bg-white shadow-lg border border-gray-200 z-50">
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Avatar
                  placeholderInitials={initials}
                  rounded
                  className="bg-blue-600 text-white"
                />
                <div>
                  <div className="text-sm font-semibold text-gray-900">{displayName}</div>
                  <div className="text-xs text-gray-500 capitalize">{userRole}</div>
                </div>
              </div>
            </div>
            
            <div className="py-1">
              {(userRole === 'landlord' || userRole === 'tenant' || userRole === 'pmc') && (
                <button
                  onClick={handleSettings}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <HiCog className="h-4 w-4" />
                  Settings
                </button>
              )}
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <HiLogout className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
