/**
 * Partners/Vendors Page - Migrated to v2 FastAPI
 * 
 * Lists vendors using v2 FastAPI backend with role-based filtering.
 * All data comes from FastAPI v2 endpoints - no Next.js API routes or Prisma.
 */
"use client";

import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useVendors, useCreateVendor, useUpdateVendor, useDeleteVendor } from '@/lib/hooks/useV2Data';
import { Card, Table, Badge, Button, Spinner, Alert, Modal, TextInput, Textarea, Select } from 'flowbite-react';
import { HiPlus, HiShoppingBag, HiPencil, HiTrash } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PartnersPage() {
  const router = useRouter();
  const { user, loading: authLoading, hasRole } = useV2Auth();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const organizationId = user?.organization_id || undefined;
  const { data: vendors, isLoading } = useVendors(organizationId, searchTerm);
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  const deleteVendor = useDeleteVendor();
  
  const [newVendor, setNewVendor] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    service_categories: [] as string[],
    status: 'active',
  });
  
  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <Alert color="warning" className="m-4">
        Please log in to view vendors.
      </Alert>
    );
  }
  
  const canViewVendors = hasRole('super_admin') || hasRole('pmc_admin') || hasRole('pm') || hasRole('landlord');
  
  if (!canViewVendors) {
    return (
      <Alert color="failure" className="m-4">
        You don't have permission to view vendors.
      </Alert>
    );
  }
  
  const canCreateVendors = hasRole('super_admin') || hasRole('pmc_admin') || hasRole('pm');
  
  const handleCreateVendor = async () => {
    if (!newVendor.company_name.trim()) {
      alert('Please enter a company name');
      return;
    }
    
    try {
      await createVendor.mutateAsync({
        organization_id: organizationId!,
        company_name: newVendor.company_name,
        contact_name: newVendor.contact_name || undefined,
        email: newVendor.email || undefined,
        phone: newVendor.phone || undefined,
        service_categories: newVendor.service_categories.length > 0 ? newVendor.service_categories : undefined,
        status: newVendor.status,
      });
      
      setCreateModalOpen(false);
      setNewVendor({
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        service_categories: [],
        status: 'active',
      });
    } catch (error) {
      console.error('Failed to create vendor:', error);
      alert('Failed to create vendor');
    }
  };
  
  const handleEditVendor = (vendor: any) => {
    setSelectedVendor(vendor);
    setNewVendor({
      company_name: vendor.company_name,
      contact_name: vendor.contact_name || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      service_categories: vendor.service_categories || [],
      status: vendor.status,
    });
    setEditModalOpen(true);
  };
  
  const handleUpdateVendor = async () => {
    if (!selectedVendor) return;
    
    try {
      await updateVendor.mutateAsync({
        id: selectedVendor.id,
        data: {
          company_name: newVendor.company_name,
          contact_name: newVendor.contact_name || undefined,
          email: newVendor.email || undefined,
          phone: newVendor.phone || undefined,
          service_categories: newVendor.service_categories.length > 0 ? newVendor.service_categories : undefined,
          status: newVendor.status,
        },
      });
      
      setEditModalOpen(false);
      setSelectedVendor(null);
    } catch (error) {
      console.error('Failed to update vendor:', error);
      alert('Failed to update vendor');
    }
  };
  
  const handleDeleteVendor = async (vendorId: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;
    
    try {
      await deleteVendor.mutateAsync(vendorId);
    } catch (error) {
      console.error('Failed to delete vendor:', error);
      alert('Failed to delete vendor');
    }
  };
  
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vendors</h1>
        <div className="flex gap-2">
          <TextInput
            type="text"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          {canCreateVendors && (
            <Button color="blue" onClick={() => setCreateModalOpen(true)}>
              <HiPlus className="mr-2 h-4 w-4" />
              New Vendor
            </Button>
          )}
        </div>
      </div>
      
      {vendors && vendors.length > 0 ? (
        <Card>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Company Name</Table.HeadCell>
              <Table.HeadCell>Contact</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Phone</Table.HeadCell>
              <Table.HeadCell>Categories</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {vendors.map((vendor: any) => (
                <Table.Row key={vendor.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {vendor.company_name}
                  </Table.Cell>
                  <Table.Cell>{vendor.contact_name || '-'}</Table.Cell>
                  <Table.Cell>{vendor.email || '-'}</Table.Cell>
                  <Table.Cell>{vendor.phone || '-'}</Table.Cell>
                  <Table.Cell>
                    {vendor.service_categories && vendor.service_categories.length > 0
                      ? vendor.service_categories.join(', ')
                      : '-'}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={vendor.status === 'active' ? 'success' : 'gray'}>
                      {vendor.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      {canCreateVendors && (
                        <>
                          <Button size="xs" color="light" onClick={() => handleEditVendor(vendor)}>
                            <HiPencil className="h-4 w-4" />
                          </Button>
                          <Button size="xs" color="failure" onClick={() => handleDeleteVendor(vendor.id)}>
                            <HiTrash className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      ) : (
        <Card>
          <div className="text-center py-8">
            <HiShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No vendors found.</p>
            {canCreateVendors && (
              <Button color="blue" className="mt-4" onClick={() => setCreateModalOpen(true)}>
                <HiPlus className="mr-2 h-4 w-4" />
                Add Your First Vendor
              </Button>
            )}
          </div>
        </Card>
      )}
      
      {/* Create Vendor Modal */}
      <Modal show={createModalOpen} onClose={() => setCreateModalOpen(false)} size="md">
        <Modal.Header>Create New Vendor</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Company Name *</label>
              <TextInput
                value={newVendor.company_name}
                onChange={(e) => setNewVendor({ ...newVendor, company_name: e.target.value })}
                placeholder="Enter company name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Contact Name</label>
              <TextInput
                value={newVendor.contact_name}
                onChange={(e) => setNewVendor({ ...newVendor, contact_name: e.target.value })}
                placeholder="Enter contact name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <TextInput
                type="email"
                value={newVendor.email}
                onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <TextInput
                value={newVendor.phone}
                onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                placeholder="Enter phone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select
                value={newVendor.status}
                onChange={(value) => setNewVendor({ ...newVendor, status: value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setCreateModalOpen(false)}>
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={handleCreateVendor}
            disabled={!newVendor.company_name.trim() || createVendor.isPending}
          >
            {createVendor.isPending ? 'Creating...' : 'Create Vendor'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Edit Vendor Modal */}
      <Modal show={editModalOpen} onClose={() => setEditModalOpen(false)} size="md">
        <Modal.Header>Edit Vendor</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Company Name *</label>
              <TextInput
                value={newVendor.company_name}
                onChange={(e) => setNewVendor({ ...newVendor, company_name: e.target.value })}
                placeholder="Enter company name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Contact Name</label>
              <TextInput
                value={newVendor.contact_name}
                onChange={(e) => setNewVendor({ ...newVendor, contact_name: e.target.value })}
                placeholder="Enter contact name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <TextInput
                type="email"
                value={newVendor.email}
                onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <TextInput
                value={newVendor.phone}
                onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                placeholder="Enter phone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select
                value={newVendor.status}
                onChange={(value) => setNewVendor({ ...newVendor, status: value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setEditModalOpen(false)}>
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={handleUpdateVendor}
            disabled={!newVendor.company_name.trim() || updateVendor.isPending}
          >
            {updateVendor.isPending ? 'Updating...' : 'Update Vendor'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
