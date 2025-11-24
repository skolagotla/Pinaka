"use client";

import { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Tag, Space, Rate, Tooltip, Popconfirm, Empty } from 'antd';
// Lazy load Pro components to reduce initial bundle size (~200KB savings)
import { ProTable, ProForm } from '@/components/shared/LazyProComponents';
import { PlusOutlined, PhoneOutlined, MailOutlined, ToolOutlined, EditOutlined, DeleteOutlined, GlobalOutlined } from '@ant-design/icons';
import AddressAutocomplete from '@/components/forms/AddressAutocomplete';
import { PageLayout, TableWrapper, EmptyState, StandardModal, FormTextInput, FormSelect, FormPhoneInput, DeleteConfirmButton } from '@/components/shared';
import { notify } from '@/lib/utils/notification-helper';
import { useUnifiedApi } from '@/lib/hooks/useUnifiedApi';
import { useModalState, useFormSubmission, useDataLoader, useResizableTable, configureTableColumns } from '@/lib/hooks';
import { MAINTENANCE_CATEGORIES } from '@/lib/constants/statuses';
import { VENDOR_COLUMNS, createActionColumn } from '@/lib/constants/column-definitions';
import { rules } from '@/lib/utils/validation-rules';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useVendors, useCreateVendor, useUpdateVendor, useDeleteVendor } from '@/lib/hooks/useV2Data';

export default function PMCVendorsClient({ vendorsData }) {
  const { fetch } = useUnifiedApi({ showUserMessage: true });
  const { isOpen: modalOpen, open: openModal, close: closeModal, editingItem: editingVendor, openForEdit, openForCreate, reset: resetModal } = useModalState();
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('CA');

  // Load vendors data - use v2 API
  const { user } = useV2Auth();
  const organizationId = user?.organization_id;
  const { data: vendorsData_v2, isLoading: vendorsLoading, refetch: refetchVendors } = useVendors(organizationId, searchTerm);
  
  // Legacy data loader for fallback (if needed)
  const { data, loading, refetch } = useDataLoader({
    endpoints: {
      vendors: '/api/v1/vendors' // Fallback only
    },
    showUserMessages: false,
    autoLoad: false // Don't auto-load, use v2 instead
  });

  // Use v2 API data first, then server-provided, then fallback to v1
  const vendors = vendorsData_v2 && Array.isArray(vendorsData_v2)
    ? vendorsData_v2
    : vendorsData?.vendors 
      ? Array.isArray(vendorsData.vendors) ? vendorsData.vendors : []
      : Array.isArray(data.vendors) ? data.vendors : [];
  
  // Filter vendors based on search (including category keywords)
  const filteredVendors = vendors.filter(vendor => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const categoryLower = vendor.category?.toLowerCase() || '';
    
    // Check if search matches common category keywords
    const categoryKeywords = {
      'pest control': ['pest', 'exterminator', 'pest control'],
      'hvac': ['hvac', 'heating', 'cooling', 'air conditioning', 'furnace', 'ac'],
      'plumbing': ['plumbing', 'plumber', 'pipe', 'drain'],
      'electrical': ['electrical', 'electrician', 'electric'],
      'landscaping': ['landscaping', 'landscape', 'lawn', 'garden'],
      'cleaning': ['cleaning', 'cleaner', 'janitorial'],
      'painting': ['painting', 'painter'],
      'roofing': ['roofing', 'roofer', 'roof'],
      'general contracting': ['general', 'contracting', 'contractor', 'construction'],
    };
    
    // Check if search term matches any category keywords
    const matchesCategory = Object.entries(categoryKeywords).some(([category, keywords]) => {
      if (categoryLower.includes(category)) {
        return keywords.some(keyword => search.includes(keyword));
      }
      return false;
    });
    
    return (
      vendor.name?.toLowerCase().includes(search) ||
      vendor.businessName?.toLowerCase().includes(search) ||
      vendor.email?.toLowerCase().includes(search) ||
      vendor.phone?.toLowerCase().includes(search) ||
      categoryLower.includes(search) ||
      matchesCategory
    );
  });

  // Use v2 hooks for vendor mutations
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  
  // Form submission for add/edit (v2 API)
  const handleSubmitVendor = async (values) => {
    try {
      if (editingVendor) {
        await updateVendor.mutateAsync({
          id: editingVendor.id,
          data: {
            company_name: values.name || values.businessName || values.company_name,
            contact_name: values.contactName || values.contact_name,
            email: values.email,
            phone: values.phone,
            service_categories: values.specialties || values.service_categories || [],
            status: values.isActive === false ? 'inactive' : 'active',
          },
        });
      } else {
        await createVendor.mutateAsync({
          organization_id: organizationId!,
          company_name: values.name || values.businessName || values.company_name,
          contact_name: values.contactName || values.contact_name,
          email: values.email,
          phone: values.phone,
          service_categories: values.specialties || values.service_categories || [],
          status: 'active',
        });
      }
      notify.success(`Vendor ${editingVendor ? 'updated' : 'added'} successfully`);
      closeModal();
      form.resetFields();
      refetchVendors();
    } catch (error) {
      console.error('Error saving vendor:', error);
      notify.error(error.message || 'Failed to save vendor');
    }
  };
  
  const submittingVendor = createVendor.isPending || updateVendor.isPending;

  const handleAddVendor = async (values) => {
    await handleSubmitVendor(values);
  };

  const handleEditVendor = (vendor) => {
    openForEdit(vendor);
    const countryCode = vendor.countryCode || vendor.country || 'CA';
    setSelectedCountry(countryCode);
    form.setFieldsValue({
      ...vendor,
      country: countryCode,
      countryCode: countryCode,
    });
  };

  const deleteVendor = useDeleteVendor();
  
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
    try {
      // Use v1Api for vendor search
      const { apiClient } = await import('@/lib/utils/api-client');
      const response = await apiClient('/api/v1/vendors/search', {
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json();
        // Open a modal to search and add global vendors
        notify.info('Global vendor search functionality coming soon');
      }
    } catch (error) {
      console.error('Error searching vendors:', error);
    }
  };

  const handleAddToMyList = async (vendorId) => {
    try {
      // Use v1Api for adding vendor to landlord
      const { apiClient } = await import('@/lib/utils/api-client');
      const response = await apiClient(`/api/v1/vendors/${vendorId}/add-to-landlord`, {
        method: 'POST',
      });

      if (response.ok) {
        notify.success('Vendor added to your list');
        refetch();
      } else {
        const data = await response.json();
        throw new Error(data.error || data.message || 'Failed to add vendor');
      }
    } catch (error) {
      console.error('Error adding vendor to list:', error);
      notify.error(error.message || 'Failed to add vendor to list');
    }
  };

  const handleRemoveFromList = async (vendorId) => {
    try {
      // Use v1Api for removing vendor from landlord
      const { apiClient } = await import('@/lib/utils/api-client');
      const response = await apiClient(`/api/v1/vendors/${vendorId}/remove-from-landlord`, {
        method: 'DELETE',
      });

      if (response.ok) {
        notify.success('Vendor removed from your list');
        refetch();
      } else {
        const data = await response.json();
        throw new Error(data.error || data.message || 'Failed to remove vendor');
      }
    } catch (error) {
      console.error('Error removing vendor from list:', error);
      notify.error(error.message || 'Failed to remove vendor from list');
    }
  };

  // Use consolidated column definitions with modifications
  const columns = [
    {
      ...VENDOR_COLUMNS.CONTACT_NAME,
      render: (text, record) => (
        <Space>
          {text}
          {record.isGlobal && (
            <Tooltip title="Global Vendor">
              <GlobalOutlined style={{ color: '#1890ff' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    VENDOR_COLUMNS.BUSINESS_NAME,
    VENDOR_COLUMNS.CATEGORY,
    VENDOR_COLUMNS.PHONE,
    VENDOR_COLUMNS.EMAIL,
    VENDOR_COLUMNS.RATING,
    VENDOR_COLUMNS.HOURLY_RATE,
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => {
        const isInMyList = record.addedAt !== null;
        const isLocal = !record.isGlobal;
        
        return (
          <Space>
            {!isInMyList && record.isGlobal && (
              <Tooltip title="Add to my list">
                <Button
                  type="link"
                  icon={<PlusOutlined />}
                  onClick={() => handleAddToMyList(record.id)}
                >
                  Add
                </Button>
              </Tooltip>
            )}
            {isInMyList && isLocal && (
              <>
                <Tooltip title="Edit vendor">
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleEditVendor(record)}
                  >
                    Edit
                  </Button>
                </Tooltip>
                <DeleteConfirmButton
                  entityName="vendor"
                  description="This action cannot be undone if the vendor has no active requests."
                  onConfirm={() => handleDeleteVendor(record.id)}
                  type="link"
                  buttonProps={{ children: "Delete" }}
                />
              </>
            )}
            {isInMyList && record.isGlobal && (
              <Popconfirm
                title="Remove vendor from your list?"
                description="This will remove the vendor from your list but won't delete them."
                onConfirm={() => handleRemoveFromList(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                >
                  Remove
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  // Configure columns with standard settings
  const configuredColumns = configureTableColumns(columns);
  
  // Use resizable table hook
  const { tableProps } = useResizableTable(configuredColumns, {
    storageKey: 'vendors-table',
    defaultSort: { field: 'name', order: 'ascend' },
  });

  return (
    <PageLayout
      title="Vendors"
      actions={[
        {
          key: 'add',
          icon: <PlusOutlined />,
          label: 'Add Vendor',
          type: 'primary',
          onClick: () => {
            openForCreate();
            form.resetFields();
          }
        },
        {
          key: 'search-global',
          icon: <GlobalOutlined />,
          label: 'Search Global',
          type: 'default',
          onClick: handleAddGlobalVendor,
        },
      ]}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      onSearchClear={() => setSearchTerm('')}
      searchPlaceholder="Search by name, business, category (e.g., pest control, HVAC, plumbing)..."
    >
      {filteredVendors.length === 0 ? (
        <EmptyState
          description={searchTerm ? 'No vendors found matching your search' : 'No vendors available'}
          icon={<ToolOutlined />}
        />
      ) : (
        <TableWrapper>
          <ProTable
            {...tableProps}
            dataSource={filteredVendors}
            rowKey="id"
            loading={loading}
            search={false}
            toolBarRender={false}
            pagination={{ pageSize: 20 }}
          />
        </TableWrapper>
      )}

      {/* Add/Edit Vendor Modal */}
      <StandardModal
        title={editingVendor ? 'Edit Vendor' : 'Add Vendor'}
        open={modalOpen}
        form={form}
        loading={submittingVendor}
        submitText={editingVendor ? 'Save' : 'Submit'}
        onCancel={() => {
          closeModal();
          form.resetFields();
          setSelectedCountry('CA');
        }}
        onFinish={handleAddVendor}
        width={600}
      >
        <FormTextInput
          name="name"
          label="Contact Name"
          required
          placeholder="e.g., John Smith"
        />

        <FormTextInput
          name="businessName"
          label="Business Name (Optional)"
          placeholder="e.g., ABC Services Inc."
        />

        <FormPhoneInput
          name="phone"
          label="Phone Number"
          required
          placeholder="(XXX) XXX-XXXX"
        />

        <FormTextInput
          name="email"
          label="Email"
          type="email"
          required
          placeholder="vendor@example.com"
        />

        <Form.Item
          name="category"
          label="Service Category"
          rules={[rules.required('Category')]}
        >
          <Select placeholder="Select category" showSearch>
            <Select.OptGroup label="Essential Services">
              <Select.Option value="Plumbing">Plumbing</Select.Option>
              <Select.Option value="Electrical">Electrical</Select.Option>
              <Select.Option value="HVAC">HVAC</Select.Option>
              <Select.Option value="Pest Control">Pest Control</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="Property Maintenance">
              <Select.Option value="Landscaping">Landscaping</Select.Option>
              <Select.Option value="Appliance">Appliance</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="Other">
              <Select.Option value="Structural">Structural</Select.Option>
              <Select.Option value="General Contracting">General Contracting</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select.OptGroup>
          </Select>
        </Form.Item>

        <Form.Item
          name="addressLine1"
          label="Billing Address"
          rules={[rules.required('Address')]}
        >
          <AddressAutocomplete
            value={form.getFieldValue('addressLine1') || ''}
            onChange={(e) => {
              form.setFieldsValue({ addressLine1: e.target.value });
            }}
            onSelect={(addressData) => {
              form.setFieldsValue({
                addressLine1: addressData.addressLine1,
                city: addressData.city,
                provinceState: addressData.provinceState,
                postalZip: addressData.postalZip,
                country: addressData.country || 'CA',
                countryCode: addressData.countryCode || 'CA',
                regionCode: addressData.regionCode,
                latitude: addressData.latitude,
                longitude: addressData.longitude,
              });
              setSelectedCountry(addressData.countryCode || 'CA');
            }}
            placeholder="Type an address (e.g., 123 Main St, Toronto)"
            country="CA,US"
          />
        </Form.Item>

        <Form.Item name="hourlyRate" label="Hourly Rate (Optional)">
          <Input prefix="$" type="number" step="0.01" placeholder="0.00" />
        </Form.Item>
      </StandardModal>
    </PageLayout>
  );
}

