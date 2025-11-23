"use client";

import { useState, useEffect } from 'react';
import { Button, Modal, Select, Label, Alert, Spinner } from 'flowbite-react';
import { HiUser } from 'react-icons/hi';

interface User {
  id: string;
  email: string;
  name: string;
  type: string;
}

interface ImpersonationSelectorProps {
  users?: User[];
}

export default function ImpersonationSelector({ users = [] }: ImpersonationSelectorProps) {
  const [visible, setVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserType, setSelectedUserType] = useState('landlord');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  // Fetch users when modal opens or user type changes
  useEffect(() => {
    if (visible && selectedUserType) {
      fetchUsersForType(selectedUserType);
    }
  }, [visible, selectedUserType]);

  const fetchUsersForType = async (userType: string) => {
    try {
      setLoading(true);
      const { adminApi } = await import('@/lib/api/admin-api');
      
      let fetchedUsers: User[] = [];
      
      if (userType === 'landlord') {
        const { v1Api } = await import('@/lib/api/v1-client');
        const response = await v1Api.landlords.list({ page: 1, limit: 100 });
        if (response.success && response.data) {
          fetchedUsers = (Array.isArray(response.data) ? response.data : response.data.data || []).map((u: any) => ({
            id: u.id,
            email: u.email,
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
            type: 'landlord',
          }));
        }
      } else if (userType === 'tenant') {
        const { v1Api } = await import('@/lib/api/v1-client');
        const response = await v1Api.tenants.list({ page: 1, limit: 100 });
        if (response.success && response.data) {
          fetchedUsers = (Array.isArray(response.data) ? response.data : response.data.data || []).map((u: any) => ({
            id: u.id,
            email: u.email,
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
            type: 'tenant',
          }));
        }
      } else if (userType === 'pmc') {
        const { v1Api } = await import('@/lib/api/v1-client');
        const response = await v1Api.pmcs?.list?.({ page: 1, limit: 100 }) || { success: false, data: [] };
        if (response.success && response.data) {
          fetchedUsers = (Array.isArray(response.data) ? response.data : response.data.data || []).map((u: any) => ({
            id: u.id,
            email: u.email,
            name: u.companyName || u.name || u.email,
            type: 'pmc',
          }));
        }
      } else if (userType === 'vendor') {
        const { v1Api } = await import('@/lib/api/v1-client');
        const response = await v1Api.vendors.list({ page: 1, limit: 100 });
        if (response.success && response.data) {
          fetchedUsers = (Array.isArray(response.data) ? response.data : response.data.data || []).map((u: any) => ({
            id: u.id,
            email: u.email,
            name: u.name || u.businessName || u.email,
            type: 'vendor',
          }));
        }
      } else if (userType === 'admin') {
        const response = await adminApi.getUsers({ limit: 100 });
        if (response.success && response.data) {
          fetchedUsers = (Array.isArray(response.data) ? response.data : []).map((u: any) => ({
            id: u.id,
            email: u.email,
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
            type: 'admin',
          }));
        }
      }

      setAvailableUsers(fetchedUsers);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonate = async () => {
    if (!selectedUserId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: selectedUserId,
          userType: selectedUserType,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Reload page to start impersonation
        window.location.reload();
      } else {
        setError(data.error || 'Failed to start impersonation');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start impersonation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button color="gray" onClick={() => setVisible(true)}>
        <HiUser className="h-4 w-4 mr-2" />
        Impersonate User
      </Button>

      <Modal show={visible} onClose={() => setVisible(false)}>
        <Modal.Header>Impersonate User</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <Label htmlFor="user-type">User Type</Label>
              <Select
                id="user-type"
                value={selectedUserType}
                onChange={(e) => {
                  setSelectedUserType(e.target.value);
                  setSelectedUserId('');
                  setAvailableUsers([]);
                }}
              >
                <option value="landlord">Landlord</option>
                <option value="tenant">Tenant</option>
                <option value="pmc">PMC</option>
                <option value="vendor">Vendor</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="user-select">Select User</Label>
              {loading && availableUsers.length === 0 ? (
                <div className="flex items-center gap-2 p-4">
                  <Spinner size="sm" />
                  <span className="text-sm text-gray-500">Loading users...</span>
                </div>
              ) : (
                <Select
                  id="user-select"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">-- Select User --</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </Select>
              )}
              {availableUsers.length === 0 && !loading && (
                <p className="text-sm text-gray-500 mt-1">No users found for this type</p>
              )}
            </div>
            {error && <Alert color="failure">{error}</Alert>}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setVisible(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={handleImpersonate}
            disabled={loading || !selectedUserId}
          >
            {loading ? <Spinner size="sm" className="mr-2" /> : null}
            Start Impersonation
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

