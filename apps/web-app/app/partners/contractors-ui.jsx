/**
 * Contractors UI - Migrated to v2 FastAPI + Flowbite
 * 
 * Contractors are vendors with specific service categories.
 * Uses v2 vendors API and Flowbite UI components.
 */
"use client";

import { useState, useMemo } from 'react';
import { Card, Table, Button, Modal, Label, TextInput, Select, Textarea, Badge, Spinner, Alert, Tooltip } from 'flowbite-react';
import { HiPlus, HiPhone, HiMail, HiPencil, HiTrash, HiSearch, HiGlobe } from 'react-icons/hi';
import AddressAutocomplete from '@/components/forms/AddressAutocomplete';
import { PageLayout } from '@/components/shared';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useVendors, useCreateVendor, useUpdateVendor, useDeleteVendor } from '@/lib/hooks/useV2Data';
import { notify } from '@/lib/utils/notification-helper';

// Contractor specialties map to vendor service_categories
const CONTRACTOR_SPECIALTIES = [
  'plumbing', 'electrical', 'hvac', 'roofing', 'painting', 'flooring',
  'carpentry', 'drywall', 'landscaping', 'general-contracting'
];

export default function ContractorsClient({ userRole, contractorsData }) {
  const { user } = useV2Auth();
  const organizationId = user?.organization_id;
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    service_categories: [],
    license_number: '',
    hourly_rate: '',
    address_line1: '',
    city: '',
    province_state: '',
    postal_code: '',
    country: 'CA',
  });

  // Fetch vendors (contractors are vendors with contractor specialties)
  const { data: vendorsData, isLoading: vendorsLoading, refetch: refetchVendors } = useVendors(
    organizationId,
    searchTerm,
    'active' // status filter
  );

  const vendors = vendorsData?.data || [];
  
  // Filter to show only contractors (vendors with contractor specialties)
  const contractors = useMemo(() => {
    return vendors.filter(vendor => {
      const categories = vendor.service_categories || [];
      return categories.some(cat => CONTRACTOR_SPECIALTIES.includes(cat.toLowerCase()));
    });
  }, [vendors]);

  // Filter by search term
  const filteredContractors = useMemo(() => {
    if (!searchTerm) return contractors;
    const search = searchTerm.toLowerCase();
    return contractors.filter(contractor => {
      const categories = (contractor.service_categories || []).join(' ').toLowerCase();
      return (
        contractor.company_name?.toLowerCase().includes(search) ||
        contractor.contact_name?.toLowerCase().includes(search) ||
        contractor.email?.toLowerCase().includes(search) ||
        contractor.phone?.toLowerCase().includes(search) ||
        categories.includes(search)
      );
    });
  }, [contractors, searchTerm]);

  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  const deleteVendor = useDeleteVendor();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        organization_id: organizationId,
        company_name: formData.company_name,
        contact_name: formData.contact_name,
        email: formData.email,
        phone: formData.phone,
        service_categories: formData.service_categories,
        status: 'active',
      };

      if (editingContractor) {
        await updateVendor.mutateAsync({ vendorId: editingContractor.id, data: payload });
        notify.success('Contractor updated successfully');
      } else {
        await createVendor.mutateAsync(payload);
        notify.success('Contractor created successfully');
      }
      
      setModalOpen(false);
      resetForm();
      refetchVendors();
    } catch (error) {
      console.error('[Contractors] Error:', error);
      notify.error(error.message || 'Failed to save contractor');
    }
  };

  const handleEdit = (contractor) => {
    setEditingContractor(contractor);
    setFormData({
      company_name: contractor.company_name || '',
      contact_name: contractor.contact_name || '',
      email: contractor.email || '',
      phone: contractor.phone || '',
      service_categories: contractor.service_categories || [],
      license_number: contractor.license_number || '',
      hourly_rate: contractor.hourly_rate || '',
      address_line1: contractor.address_line1 || '',
      city: contractor.city || '',
      province_state: contractor.province_state || '',
      postal_code: contractor.postal_code || '',
      country: contractor.country || 'CA',
    });
    setModalOpen(true);
  };

  const handleDelete = async (contractorId) => {
    if (!confirm('Are you sure you want to delete this contractor?')) return;
    try {
      await deleteVendor.mutateAsync(contractorId);
      notify.success('Contractor deleted successfully');
      refetchVendors();
    } catch (error) {
      console.error('[Contractors] Error:', error);
      notify.error(error.message || 'Failed to delete contractor');
    }
  };

  const resetForm = () => {
    setEditingContractor(null);
    setFormData({
      company_name: '',
      contact_name: '',
      email: '',
      phone: '',
      service_categories: [],
      license_number: '',
      hourly_rate: '',
      address_line1: '',
      city: '',
      province_state: '',
      postal_code: '',
      country: 'CA',
    });
  };

  const tableColumns = [
    { header: 'Company Name', accessor: 'company_name' },
    { header: 'Contact Name', accessor: 'contact_name' },
    {
      header: 'Specialties',
      accessor: 'service_categories',
      render: (categories) => (
        <div className="flex flex-wrap gap-1">
          {categories && categories.length > 0 ? (
            categories.map((cat, idx) => (
              <Badge key={idx} color="blue">{cat}</Badge>
            ))
          ) : (
            <Badge color="gray">N/A</Badge>
          )}
        </div>
      ),
    },
    {
      header: 'Phone',
      accessor: 'phone',
      render: (phone) => (
        <div className="flex items-center gap-2">
          <HiPhone className="h-4 w-4" />
          {phone || '-'}
        </div>
      ),
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (email) => (
        <div className="flex items-center gap-2">
          <HiMail className="h-4 w-4" />
          {email || '-'}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (status) => (
        <Badge color={status === 'active' ? 'success' : 'gray'}>
          {status || 'active'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (id, contractor) => (
        <div className="flex gap-2">
          <Button size="xs" color="light" onClick={() => handleEdit(contractor)}>
            <HiPencil className="h-4 w-4" />
          </Button>
          <Button size="xs" color="failure" onClick={() => handleDelete(id)}>
            <HiTrash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (vendorsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageLayout
        headerTitle="Contractors"
        headerActions={
          <Button color="blue" onClick={() => { resetForm(); setModalOpen(true); }}>
            <HiPlus className="mr-2 h-4 w-4" />
            Add Contractor
          </Button>
        }
      >
        <Card>
          <div className="mb-4">
            <TextInput
              type="text"
              placeholder="Search by company, contact, specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={HiSearch}
            />
          </div>

          {filteredContractors.length === 0 ? (
            <Alert color="info">
              {searchTerm ? 'No contractors found matching your search' : 'No contractors available'}
            </Alert>
          ) : (
            <FlowbiteTable
              data={filteredContractors}
              columns={tableColumns}
            />
          )}
        </Card>
      </PageLayout>

      {/* Add/Edit Modal */}
      <Modal show={modalOpen} onClose={() => { setModalOpen(false); resetForm(); }}>
        <Modal.Header>
          {editingContractor ? 'Edit Contractor' : 'Add Contractor'}
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="company_name">Company Name *</Label>
              <TextInput
                id="company_name"
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="contact_name">Contact Name *</Label>
              <TextInput
                id="contact_name"
                type="text"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <TextInput
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone *</Label>
              <TextInput
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="service_categories">Specialties *</Label>
              <Select
                id="service_categories"
                multiple
                value={formData.service_categories}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData({ ...formData, service_categories: values });
                }}
                required
              >
                {CONTRACTOR_SPECIALTIES.map(spec => (
                  <option key={spec} value={spec}spec}</option>
                ))}
              </Select>
              <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
            </div>

            <div>
              <Label htmlFor="address_line1">Address</Label>
              <AddressAutocomplete
                placeholder="Type an address"
                country="CA,US"
                onSelect={(addressData) => {
                  setFormData({
                    ...formData,
                    address_line1: addressData.addressLine1,
                    city: addressData.city,
                    province_state: addressData.provinceState,
                    postal_code: addressData.postalZip,
                    country: addressData.country || 'CA',
                  });
                }}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" color="blue" disabled={createVendor.isPending || updateVendor.isPending}>
                {createVendor.isPending || updateVendor.isPending ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  editingContractor ? 'Update' : 'Create'
                )}
              </Button>
              <Button color="gray" onClick={() => { setModalOpen(false); resetForm(); }}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
