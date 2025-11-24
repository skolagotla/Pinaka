"use client";

import { Tabs } from 'flowbite-react';
import { useSettings } from '@/lib/hooks';

export default function SettingsClient({ user, userRole, pmcData }) {
  // 🎯 Use consolidated settings hook
  const { settingsTabs } = useSettings({ user, userRole, pmcData });

  // Show loading/empty state if no user or no tabs
  if (!user) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Settings</h2>
          <p className="text-gray-500 dark:text-gray-400">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!settingsTabs || settingsTabs.length === 0) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Settings</h2>
          <p className="text-gray-500 dark:text-gray-400">No settings available</p>
        </div>
      </div>
    );
  }

  // Convert settingsTabs to Flowbite Tabs format
  const flowbiteTabs = settingsTabs.map(tab => ({
    title: tab.label,
    content: tab.children,
    active: tab.key === settingsTabs[0]?.key,
  }));

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Settings</h2>
        <p className="text-gray-500 dark:text-gray-400">Manage your account preferences and appearance</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mt-6 overflow-hidden">
        <Tabs aria-label="Settings tabs" style="underline">
          {flowbiteTabs.map((tab, index) => (
            <Tabs.Item key={index} active={tab.active} title={tab.title}>
              {tab.content}
            </Tabs.Item>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
