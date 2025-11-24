'use client';

import { Card } from 'flowbite-react';
import { HiCog } from 'react-icons/hi';

export default function ContractorDashboard() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold flex items-center gap-2 mb-2">
        <HiCog className="h-6 w-6" />
        Contractor Dashboard
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Welcome to your contractor dashboard. This page is under development.
      </p>
      
      <div className="grid grid-cols-1 gap-4 mt-6">
        <Card>
          <h3 className="text-lg font-semibold mb-2">Contractor Features</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Contractor-specific features will be available here soon.
          </p>
        </Card>
      </div>
    </div>
  );
}
