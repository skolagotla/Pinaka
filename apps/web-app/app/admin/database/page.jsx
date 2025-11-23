"use client";

import { useState } from 'react';
import { Card, Alert } from 'flowbite-react';
import {
  HiDatabase,
  HiTable,
} from 'react-icons/hi';

export default function AdminDatabasePage() {
  const [stats, setStats] = useState({
    landlords: 0,
    tenants: 0,
    properties: 0,
    leases: 0,
    documents: 0,
    maintenanceRequests: 0,
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <HiDatabase className="h-6 w-6" />
        Database Management
      </h1>

      <Alert color="info" className="mb-6">
        <div>
          <div className="font-medium">Read-Only View</div>
          <div className="text-sm mt-1">
            This is a read-only view of database statistics. Direct database queries are disabled for security.
          </div>
        </div>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <HiTable className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Landlords</p>
              <p className="text-2xl font-bold text-gray-900">{stats.landlords}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <HiTable className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tenants</p>
              <p className="text-2xl font-bold text-gray-900">{stats.tenants}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <HiTable className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Properties</p>
              <p className="text-2xl font-bold text-gray-900">{stats.properties}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <HiTable className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Leases</p>
              <p className="text-2xl font-bold text-gray-900">{stats.leases}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Database Tables</h3>
        <div className="space-y-2">
          <div>
            <p className="font-medium text-gray-900 mb-2">Core Tables:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Admin</li>
              <li>Landlord</li>
              <li>Tenant</li>
              <li>Property</li>
              <li>Unit</li>
              <li>Lease</li>
              <li>Document</li>
              <li>MaintenanceRequest</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
