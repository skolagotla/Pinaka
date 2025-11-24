'use client';

import { Card } from 'flowbite-react';
import { HiShoppingBag } from 'react-icons/hi';

export default function VendorDashboard() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold flex items-center gap-2 mb-2">
        <HiShoppingBag className="h-6 w-6" />
        Vendor Dashboard
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Welcome to your vendor dashboard. This page is under development.
      </p>
      
      <div className="grid grid-cols-1 gap-4 mt-6">
        <Card>
          <h3 className="text-lg font-semibold mb-2">Vendor Features</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Vendor-specific features will be available here soon.
          </p>
        </Card>
      </div>
    </div>
  );
}
