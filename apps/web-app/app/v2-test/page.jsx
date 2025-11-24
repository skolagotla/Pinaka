/**
 * V2 API Integration Test Page
 * Tests the FastAPI v2 backend integration
 */
"use client";

import { useState } from 'react';
import { Button, Card, Alert, Spinner } from 'flowbite-react';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useWorkOrders, useProperties, useOrganizations } from '@/lib/hooks/useV2Data';
import { v2Api } from '@/lib/api/v2-client';

export default function V2TestPage() {
  const { user, loading: authLoading, login, logout, error: authError } = useV2Auth();
  const { data: organizations, isLoading: orgsLoading } = useOrganizations();
  const { data: properties, isLoading: propsLoading } = useProperties(user?.organization_id || undefined);
  const { data: workOrders, isLoading: woLoading } = useWorkOrders({ organization_id: user?.organization_id });

  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const handleTestLogin = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const success = await login('superadmin@pinaka.com', 'SuperAdmin123');
      if (success) {
        setTestResult('✅ Login successful');
      } else {
        setTestResult('❌ Login failed');
      }
    } catch (err) {
      setTestResult(`❌ Error: ${err?.message || 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  const handleTestDirectApi = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await v2Api.listWorkOrders();
      setTestResult(`✅ API call successful Found ${result.length} work orders`);
    } catch (err) {
      setTestResult(`❌ API Error: ${err?.detail || err?.message || 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="xl" />
          <span className="ml-3">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">V2 API Integration Test</h1>

      {/* Authentication Status */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
        {user ? (
          <div className="space-y-2">
            <Alert color="success">✅ Authenticated</Alert>
            <p><strong>Email:</strong> {user.user.email}</p>
            <p><strong>Name:</strong> {user.user.full_name || 'N/A'}</p>
            <p><strong>Roles:</strong> {user.roles.map(r => r.name).join(', ')}</p>
            <p><strong>Organization ID:</strong> {user.organization_id || 'None'}</p>
            <Button color="failure" onClick={logout}>Logout</Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Alert color="warning">⚠️ Not authenticated</Alert>
            <Button onClick={handleTestLogin} disabled={testing}>
              {testing ? <Spinner size="sm" /> : 'Test Login'}
            </Button>
            {authError && <Alert color="failure">{authError}</Alert>}
          </div>
        )}
        {testResult && <Alert color={testResult.includes('✅') ? 'success' : 'failure'}>{testResult}</Alert>}
      </Card>

      {/* Test Actions */}
      {user && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">API Tests</h2>
          <div className="space-y-2">
            <Button onClick={handleTestDirectApi} disabled={testing}>
              {testing ? <Spinner size="sm" /> : 'Test Direct API Call'}
            </Button>
          </div>
        </Card>
      )}

      {/* Organizations */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Organizations</h2>
        {orgsLoading ? (
          <Spinner />
        ) : organizations && organizations.length > 0 ? (
          <ul className="list-disc list-inside">
            {organizations.map((org) => (
              <li key={org.id}>
                {org.name} ({org.type}) - {org.id}
              </li>
            ))}
          </ul>
        ) : (
          <p>No organizations found</p>
        )}
      </Card>

      {/* Properties */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Properties</h2>
        {propsLoading ? (
          <Spinner />
        ) : properties && properties.length > 0 ? (
          <ul className="list-disc list-inside">
            {properties.map((prop) => (
              <li key={prop.id}>
                {prop.name || prop.address_line1} - {prop.id}
              </li>
            ))}
          </ul>
        ) : (
          <p>No properties found</p>
        )}
      </Card>

      {/* Work Orders */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Work Orders</h2>
        {woLoading ? (
          <Spinner />
        ) : workOrders && workOrders.length > 0 ? (
          <div className="space-y-2">
            {workOrders.map((wo) => (
              <div key={wo.id} className="border p-3 rounded">
                <p><strong>{wo.title}</strong></p>
                <p className="text-sm text-gray-600">Status: {wo.status} | Priority: {wo.priority}</p>
                <p className="text-xs text-gray-500">ID: {wo.id}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No work orders found</p>
        )}
      </Card>

      {/* API Configuration */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
        <p><strong>Base URL:</strong> {process.env.NEXT_PUBLIC_API_V2_BASE_URL || 'http://localhost:8000/api/v2'}</p>
        <p><strong>Token:</strong> {v2Api.getToken() ? '✅ Present' : '❌ Missing'}</p>
      </Card>
    </div>
  );
}

