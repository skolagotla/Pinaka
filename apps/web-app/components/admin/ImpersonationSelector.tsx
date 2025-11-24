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
      const { v2Api } = await import('@/lib/api/v2-client');
      
      let fetchedUsers: User[] = [];
      
      if (userType === 'landlord') {
        const landlords = await v2Api.listLandlords();
        fetchedUsers = (Array.isArray(landlords) ? landlords : []).map((u: any) => ({
          id: u.id,
          email: u.email || '',
          name: u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || 'Unknown',
          type: 'landlord',
        }));
      } else if (userType === 'tenant') {
        const tenants = await v2Api.listTenants();
        fetchedUsers = (Array.isArray(tenants) ? tenants : []).map((u: any) => ({
          id: u.id,
          email: u.email || '',
          name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || 'Unknown',
          type: 'tenant',
        }));
      } else if (userType === 'pmc') {
        // PMCs are organizations in v2 - use adminApi for now
        const response = await adminApi.getUsers({ limit: 100 });
        if (response.success && response.data) {
          fetchedUsers = (Array.isArray(response.data) ? response.data : []).map((u: any) => ({
            id: u.id,
            email: u.email,
            name: u.companyName || u.name || u.email,
            type: 'pmc',
          }));
        }
      } else if (userType === 'vendor') {
        const vendors = await v2Api.listVendors();
        const vendorsData = Array.isArray(vendors) ? vendors : (vendors?.data || []);
        fetchedUsers = vendorsData.map((u: any) => ({
          id: u.id,
          email: u.email || '',
          name: u.company_name || u.contact_name || u.email || 'Unknown',
          type: 'vendor',
        }));
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
      // Use adminApi for impersonation (if endpoint exists)
      // For now, fallback to fetch if adminApi doesn't have this method
      const { adminApi } = await import('@/lib/api/admin-api');
      await adminApi.startImpersonation(selectedUserId, selectedUserType);
      window.location.reload();
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

