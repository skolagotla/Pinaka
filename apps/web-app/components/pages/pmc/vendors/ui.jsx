/**
 * PMC Vendors Component - Migrated to Flowbite UI + v2 FastAPI
 * 
 * Uses v2 API endpoints for vendor management
 * UI converted from Ant Design to Flowbite
 */
"use client";

import { useState, useMemo } from 'react';
import { 
  Card, Button, Modal, TextInput, Label, Select, Textarea, 
  Badge, Tooltip, Spinner, Table
} from 'flowbite-react';
import { 
  HiPlus, HiPhone, HiMail, HiTool, HiPencil, HiTrash, 
  HiGlobeAlt, HiX
} from 'react-icons/hi';
import AddressAutocomplete from '@/components/forms/AddressAutocomplete';
import { PageLayout, EmptyState } from '@/components/shared';
import { notify } from '@/lib/utils/notification-helper';
import { useModalState } from '@/lib/hooks/useModalState';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useVendors, useCreateVendor, useUpdateVendor, useDeleteVendor } from '@/lib/hooks/useV2Data';
import { useFormState } from '@/lib/hooks/useFormState';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import FlowbitePopconfirm from '@/components/shared/FlowbitePopconfirm';
import { renderPhone, renderEmail } from '@/components/shared/FlowbiteTableRenderers';

export default function PMCVendorsClient({ vendorsData }) {
  const { user } = useV2Auth();
  const organizationId = user?.organization_id;
  const { isOpen: modalOpen, open: openModal, close: closeModal, editingItem: editingVendor, openForEdit, openForCreate } = useModalState();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('CA');

  // Use v2 API hooks
  const { data: vendorsData_v2, isLoading: vendorsLoading, refetch: refetchVendors } = useVendors(organizationId, searchTerm);
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  const deleteVendor = useDeleteVendor();

  const vendorForm = useFormState({
    contact_name: '',
    company_name: '',
    phone: '',
    email: '',
    service_categories: [],
    address_line1: '',
    city: '',
    province_state: '',
    postal_code: '',
    country: 'CA',
    hourly_rate: null
  });

  // Use v2 API data
  const vendors = vendorsData_v2 && Array.isArray(vendorsData_v2)
    ? vendorsData_v2
    : vendorsData?.vendors 
      ? Array.isArray(vendorsData.vendors) ? vendorsData.vendors : []
      : [];
  
  // Filter vendors based on search
  const filteredVendors = useMemo(() => {
    if (!searchTerm) return vendors;
    const search = searchTerm.toLowerCase();
    return vendors.filter(vendor => {
      const categoryLower = (vendor.service_categories || []).join(' ').toLowerCase();
      return (
        vendor.contact_name?.toLowerCase().includes(search) ||
        vendor.company_name?.toLowerCase().includes(search) ||
        vendor.email?.toLowerCase().includes(search) ||
        vendor.phone?.toLowerCase().includes(search) ||
        categoryLower.includes(search)
      );
    });
  }, [vendors, searchTerm]);

  const handleSubmitVendor = async () => {
    try {
      const values = vendorForm.getFieldsValue();
      
      if (!values.contact_name || !values.email || !values.phone) {
        notify.error('Contact name, email, and phone are required');
        return;
      }

      const vendorData = {
        organization_id: organizationId,
        contact_name: values.contact_name,
        company_name: values.company_name || null,
        email: values.email,
        phone: values.phone,
        service_categories: values.service_categories || [],
        address_line1: values.address_line1 || null,
        city: values.city || null,
        province_state: values.province_state || null,
        postal_code: values.postal_code || null,
        country: values.country || 'CA',
        hourly_rate: values.hourly_rate ? parseFloat(values.hourly_rate) : null,
        status: 'active',
      };

      if (editingVendor) {
        await updateVendor.mutateAsync({
          id: editingVendor.id,
          data: vendorData,
        });
        notify.success('Vendor updated successfully');
      } else {
        await createVendor.mutateAsync(vendorData);
        notify.success('Vendor added successfully');
      }

      closeModal();
      vendorForm.reset();
      refetchVendors();
    } catch (error) {
      console.error('Error saving vendor:', error);
      notify.error(error.message || 'Failed to save vendor');
    }
  };

  const handleEditVendor = (vendor) => {
    openForEdit(vendor);
    const countryCode = vendor.country || 'CA';
    setSelectedCountry(countryCode);
    vendorForm.setFields({
      contact_name: vendor.contact_name || '',
      company_name: vendor.company_name || '',
      phone: vendor.phone || '',
      email: vendor.email || '',
      service_categories: vendor.service_categories || [],
      address_line1: vendor.address_line1 || '',
      city: vendor.city || '',
      province_state: vendor.province_state || '',
      postal_code: vendor.postal_code || '',
      country: countryCode,
      hourly_rate: vendor.hourly_rate || null,
    });
  };

  const handleDeleteVendor = async (vendorId) => {
    try {
      await deleteVendor.mutateAsync(vendorId);
      notify.success('Vendor deleted successfully');
      refetchVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      notify.error(error.message || 'Failed to delete vendor');
    }
  };

  const handleAddGlobalVendor = async () => {
    notify.info('Global vendor search functionality coming soon');
  };

  // Table columns
  const columns = [
    {
      title: 'Contact Name',
      dataIndex: 'contact_name',
      key: 'contact_name',
      render: (text, record) => (
        <div className="flex items-center gap-2">
          <span>{text || 'N/A'}</span>
          {record.is_global && (
            <Tooltip content="Global Vendor">
              <HiGlobeAlt className="h-4 w-4 text-blue-500" />
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: 'Company Name',
      dataIndex: 'company_name',
      key: 'company_name',
    },
    {
      title: 'Category',
      dataIndex: 'service_categories',
      key: 'service_categories',
      render: (categories) => {
        if (!categories || categories.length === 0) return 'N/A';
        return (
          <div className="flex flex-wrap gap-1">
            {categories.slice(0, 2).map((cat, idx) => (
              <Badge key={idx} color="info" size="sm">
                {cat}
              </Badge>
            ))}
            {categories.length > 2 && (
              <Badge color="gray" size="sm">
                +{categories.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: renderPhone,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: renderEmail,
    },
    {
      title: 'Hourly Rate',
      dataIndex: 'hourly_rate',
      key: 'hourly_rate',
      render: (rate) => rate ? `$${parseFloat(rate).toFixed(2)}` : 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_text, record) => (
        <div className="flex gap-2">
          <Tooltip content="Edit vendor">
            <Button
              size="xs"
              color="light"
              onClick={() => handleEditVendor(record)}
            >
              <HiPencil className="h-4 w-4" />
            </Button>
          </Tooltip>
          <FlowbitePopconfirm
            title="Delete this vendor?"
            description="This action cannot be undone if the vendor has active work orders."
            onConfirm={() => handleDeleteVendor(record.id)}
          >
            <Button
              size="xs"
              color="failure"
            >
              <HiTrash className="h-4 w-4" />
            </Button>
          </FlowbitePopconfirm>
        </div>
      ),
    },
  ];

  const submittingVendor = createVendor.isPending || updateVendor.isPending;

  return (
    <PageLayout
      title="Vendors"
      actions={
        {
          key: 'add',
          icon: <HiPlus className="h-5 w-5" />,
          label: 'Add Vendor',
          type: 'primary',
          onClick: () => {
            vendorForm.reset();
            openForCreate();
          }
        },
        {
          key: 'search-global',
          icon: <HiGlobeAlt className="h-5 w-5" />,
          label: 'Search Global',
          type: 'default',
          onClick: handleAddGlobalVendor,
        },
      }
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      onSearchClear={() => setSearchTerm('')}
      searchPlaceholder="Search by name, business, category..."
    >
      {vendorsLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="xl" />
        </div>
      ) : filteredVendors.length === 0 ? (
        <EmptyState
          description={searchTerm ? 'No vendors found matching your search' : 'No vendors available'}
          icon={<HiTool className="h-12 w-12" />}
        />
      ) : (
        <FlowbiteTable
          dataSource={filteredVendors}
          columns={columns}
          rowKey="id"
          loading={vendorsLoading}
          pagination={{ pageSize: 20 }}
        />
      )}

      {/* Add/Edit Vendor Modal */}
      <Modal show={modalOpen} onClose={closeModal} size="md">
        <Modal.Header>
          {editingVendor ? 'Edit Vendor' : 'Add Vendor'}
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <Label htmlFor="contact_name" className="mb-2 block">
                Contact Name <span className="text-red-500">*</span>
              </Label>
              <TextInput
                id="contact_name"
                value={vendorForm.getFieldValue('contact_name')}
                onChange={(e) => vendorForm.setField('contact_name', e.target.value)}
                required
                placeholder="e.g., John Smith"
              />
            </div>

            <div>
              <Label htmlFor="company_name" className="mb-2 block">
                Business Name (Optional)
              </Label>
              <TextInput
                id="company_name"
                value={vendorForm.getFieldValue('company_name')}
                onChange={(e) => vendorForm.setField('company_name', e.target.value)}
                placeholder="e.g., ABC Services Inc."
              />
            </div>

            <div>
              <Label htmlFor="phone" className="mb-2 block">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <TextInput
                id="phone"
                type="tel"
                value={vendorForm.getFieldValue('phone')}
                onChange={(e) => vendorForm.setField('phone', e.target.value)}
                required
                placeholder="(XXX) XXX-XXXX"
              />
            </div>

            <div>
              <Label htmlFor="email" className="mb-2 block">
                Email <span className="text-red-500">*</span>
              </Label>
              <TextInput
                id="email"
                type="email"
                value={vendorForm.getFieldValue('email')}
                onChange={(e) => vendorForm.setField('email', e.target.value)}
                required
                placeholder="vendor@example.com"
              />
            </div>

            <div>
              <Label htmlFor="service_categories" className="mb-2 block">
                Service Categories
              </Label>
              <Select
                id="service_categories"
                multiple
                value={vendorForm.getFieldValue('service_categories') || [}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  vendorForm.setField('service_categories', selected);
                }}
              >
                <optgroup label="Essential Services">
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Pest Control">Pest Control</option>
                </optgroup>
                <optgroup label="Property Maintenance">
                  <option value="Landscaping">Landscaping</option>
                  <option value="Appliance">Appliance</option>
                </optgroup>
                <optgroup label="Other">
                  <option value="Structural">Structural</option>
                  <option value="General Contracting">General Contracting</option>
                  <option value="Other">Other</option>
                </optgroup>
              </Select>
            </div>

            <div>
              <Label htmlFor="address_line1" className="mb-2 block">
                Billing Address
              </Label>
              <AddressAutocomplete
                value={vendorForm.getFieldValue('address_line1') || ''}
                onChange={(e) => {
                  vendorForm.setField('address_line1', e.target.value);
                }}
                onSelect={(addressData) => {
                  vendorForm.setFields({
                    address_line1: addressData.addressLine1,
                    city: addressData.city,
                    province_state: addressData.provinceState,
                    postal_code: addressData.postalZip,
                    country: addressData.countryCode || 'CA',
                  });
                  setSelectedCountry(addressData.countryCode || 'CA');
                }}
                placeholder="Type an address (e.g., 123 Main St, Toronto)"
                country="CA,US"
              />
            </div>

            <div>
              <Label htmlFor="hourly_rate" className="mb-2 block">
                Hourly Rate (Optional)
              </Label>
              <TextInput
                id="hourly_rate"
                type="number"
                step="0.01"
                value={vendorForm.getFieldValue('hourly_rate') || ''}
                onChange={(e) => vendorForm.setField('hourly_rate', e.target.value)}
                placeholder="0.00"
                addon="$"
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={closeModal} color="gray">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitVendor} 
            color="blue"
            disabled={submittingVendor}
          >
            {submittingVendor ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              editingVendor ? 'Save' : 'Add Vendor'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </PageLayout>
  );
}
