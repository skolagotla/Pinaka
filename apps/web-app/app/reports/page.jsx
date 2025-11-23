/**
 * Reports Page
 * 
 * Role-based reports dashboard
 * - super_admin/pmc_admin/pm/landlord: Full reporting access
 * - tenant/vendor: Limited or no access
 */

"use client";

import { useState } from 'react';
import { Card, Tabs, Alert } from 'flowbite-react';
import { HiChartBar, HiDocumentText, HiCurrencyDollar, HiClipboard } from 'react-icons/hi';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Reports
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and analyze your portfolio performance
        </p>
      </div>

      <Tabs activeTab={activeTab} onActiveTabChange={setActiveTab}>
        <Tabs.Item active title="Overview" icon={HiChartBar}>
          <Card className="mt-4">
            <p className="text-gray-600 dark:text-gray-400">
              Reports overview coming soon. This will include:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600 dark:text-gray-400">
              <li>Portfolio performance metrics</li>
              <li>Revenue and expense reports</li>
              <li>Occupancy analytics</li>
              <li>Work order statistics</li>
            </ul>
          </Card>
        </Tabs.Item>
        
        <Tabs.Item title="Financial" icon={HiCurrencyDollar}>
          <Card className="mt-4">
            <p className="text-gray-600 dark:text-gray-400">
              Financial reports coming soon.
            </p>
          </Card>
        </Tabs.Item>
        
        <Tabs.Item title="Operations" icon={HiClipboard}>
          <Card className="mt-4">
            <p className="text-gray-600 dark:text-gray-400">
              Operations reports coming soon.
            </p>
          </Card>
        </Tabs.Item>
      </Tabs>
    </div>
  );
}

