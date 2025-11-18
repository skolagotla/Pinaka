"use client";

import { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, message, Tag, Space, Rate, Tooltip, Popconfirm, Empty } from 'antd';
import { ProTable, ProForm } from '@/components/shared/LazyProComponents';
import { PlusOutlined, PhoneOutlined, MailOutlined, TeamOutlined, EditOutlined, DeleteOutlined, SearchOutlined, GlobalOutlined } from '@ant-design/icons';
import AddressAutocomplete from '@/components/forms/AddressAutocomplete';
import { PageLayout, TableWrapper, EmptyState, StandardModal, FormTextInput, FormSelect, FormPhoneInput } from '@/components/shared';
import { useModalState, useFormSubmission, useDataLoader, useResizableTable, configureTableColumns } from '@/lib/hooks';
import { MAINTENANCE_CATEGORIES } from '@/lib/constants/statuses';

export default function ContractorsClient({ userRole, contractorsData }) {
  const { isOpen: modalOpen, open: openModal, close: closeModal, editingItem: editingContractor, openForEdit, openForCreate, reset: resetModal } = useModalState();
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('CA');
  
  // Form submission for add/edit using v1Api.vendors
  const [submittingContractor, setSubmittingContractor] = useState(false);
  const submitContractor = async (values) => {
    setSubmittingContractor(true);
    try {
      const { v1Api } = await import('@/lib/api/v1-client');
      if (editingContractor) {
        await v1Api.vendors.update(editingContractor.id, { ...values, type: 'contractor' });
        message.success('Contractor updated successfully');
      } else {
        await v1Api.vendors.create({ ...values, type: 'contractor' });
        message.success('Contractor created successfully');
      }
      closeModal();
      form.resetFields();
      refetch();
    } catch (error) {
      console.error('[Contractors] Error submitting:', error);
      message.error(`Failed to ${editingContractor ? 'update' : 'create'} contractor`);
    } finally {
      setSubmittingContractor(false);
    }
  };

  // Load contractors data - use v1Api.vendors with type='contractor'
  const [contractorsLoading, setContractorsLoading] = useState(false);
  const [contractorsList, setContractorsList] = useState(contractorsData?.contractors || []);
  
  const refetch = async () => {
    if (contractorsData?.contractors) return; // Use server data if available
    setContractorsLoading(true);
    try {
      const { v1Api } = await import('@/lib/api/v1-client');
      const response = await v1Api.vendors.list({ type: 'contractor', page: 1, limit: 1000 });
      const vendors = response.data?.data || response.data || [];
      setContractorsList(Array.isArray(vendors) ? vendors : []);
    } catch (error) {
      console.error('[Contractors] Error loading contractors:', error);
    } finally {
      setContractorsLoading(false);
    }
  };
  
  const loading = contractorsLoading;

  // Use server-provided data if available, otherwise use API data
  const contractors = contractorsData?.contractors 
    ? Array.isArray(contractorsData.contractors) ? contractorsData.contractors : []
    : contractorsList;
  
  // Filter contractors based on search (including specialties)
  const filteredContractors = contractors.filter(contractor => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const specialties = Array.isArray(contractor.specialties) 
      ? contractor.specialties.map(s => s.toLowerCase())
      : [];
    
    // Check if search matches common specialty keywords
    const specialtyKeywords = {
      'plumbing': ['plumbing', 'plumber', 'pipe', 'drain', 'water'],
      'electrical': ['electrical', 'electrician', 'electric', 'wiring'],
      'hvac': ['hvac', 'heating', 'cooling', 'air conditioning', 'furnace', 'ac', 'ventilation'],
      'roofing': ['roofing', 'roofer', 'roof', 'shingle'],
      'painting': ['painting', 'painter', 'paint'],
      'flooring': ['flooring', 'floor', 'carpet', 'tile'],
      'carpentry': ['carpentry', 'carpenter', 'woodwork', 'cabinetry'],
      'drywall': ['drywall', 'sheetrock', 'gypsum'],
      'landscaping': ['landscaping', 'landscape', 'lawn', 'garden', 'yard'],
      'general contracting': ['general', 'contracting', 'contractor', 'construction', 'renovation'],
    };
    
    // Check if search term matches any specialty keywords
    const matchesSpecialty = Object.entries(specialtyKeywords).some(([specialty, keywords]) => {
      const hasSpecialty = specialties.some(s => s.includes(specialty));
      if (hasSpecialty) {
        return keywords.some(keyword => search.includes(keyword));
      }
      return false;
    });
    
    return (
      contractor.companyName?.toLowerCase().includes(search) ||
      contractor.contactName?.toLowerCase().includes(search) ||
      contractor.licenseNumber?.toLowerCase().includes(search) ||
      contractor.email?.toLowerCase().includes(search) ||
      contractor.phone?.toLowerCase().includes(search) ||
      specialties.some(spec => spec.includes(search)) ||
      matchesSpecialty
    );
  });

  const handleAddGlobalContractor = async () => {
    try {
      const { v1Api } = await import('@/lib/api/v1-client');
      // Search for contractors using v1Api.vendors with type filter
      const response = await v1Api.vendors.list({ type: 'contractor', page: 1, limit: 100 });
      // Open a modal to search and add global contractors
      message.info('Global contractor search functionality coming soon');
    } catch (error) {
      console.error('[Contractors] Search global error:', error);
      message.error('Failed to search global contractors');
    }
  };

  const handleAddToMyList = async (contractorId) => {
    try {
      const { v1Api } = await import('@/lib/api/v1-client');
      // Get current user's landlord ID - this might need to come from context
      const landlordId = null; // TODO: Get from user context
      // Use v1Api.vendors to add contractor to landlord (this would need a specialized endpoint)
      // For now, this is a placeholder - the actual implementation would need a specialized endpoint
      message.info('Adding contractor to landlord list - specialized endpoint needed');
      refetch();
    } catch (error) {
      console.error('[Contractors] Add to list error:', error);
      message.error('Failed to add contractor');
    }
  };

  const handleRemoveFromList = async (contractorId) => {
    try {
      // Remove from landlord's list (soft delete) using v1Api.vendors
      const { v1Api } = await import('@/lib/api/v1-client');
      await v1Api.vendors.delete(contractorId);
      message.success('Contractor removed from your list');
      refetch();
    } catch (error) {
      console.error('[Contractors] Remove from list error:', error);
      message.error('Failed to remove contractor');
    }
  };

  const handleAddContractor = async (values) => {
    // Convert specialties string to array if needed
    const specialties = Array.isArray(values.specialties) 
      ? values.specialties 
      : values.specialties 
        ? values.specialties.split(',').map(s => s.trim()).filter(s => s)
        : [];
    
    await submitContractor({
      ...values,
      specialties,
    });
  };

  const handleEditContractor = (contractor) => {
    openForEdit(contractor);
    const countryCode = contractor.countryCode || contractor.country || 'CA';
    setSelectedCountry(countryCode);
    form.setFieldsValue({
      ...contractor,
      specialties: Array.isArray(contractor.specialties) ? contractor.specialties : [],
      country: countryCode,
      countryCode: countryCode,
    });
  };

  const columns = [
    {
      title: 'Company Name',
      dataIndex: 'companyName',
      key: 'companyName',
      sorter: true,
      render: (text, record) => (
        <Space>
          {text}
          {record.isGlobal && (
            <Tooltip title="Global Contractor">
              <GlobalOutlined style={{ color: '#1890ff' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Contact Name',
      dataIndex: 'contactName',
      key: 'contactName',
      sorter: true,
    },
    {
      title: 'License Number',
      dataIndex: 'licenseNumber',
      key: 'licenseNumber',
      render: (text) => text || <Tag color="default">N/A</Tag>,
    },
    {
      title: 'Specialties',
      dataIndex: 'specialties',
      key: 'specialties',
      render: (specialties) => (
        <Space wrap>
          {Array.isArray(specialties) && specialties.length > 0 ? (
            specialties.map((spec, idx) => (
              <Tag key={idx} color="blue">{spec}</Tag>
            ))
          ) : (
            <Tag color="default">N/A</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => (
        <Space>
          <PhoneOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => (
        <Space>
          <MailOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      sorter: true,
      render: (rating) => rating ? <Rate disabled defaultValue={rating} allowHalf /> : <Tag>No rating</Tag>,
    },
    {
      title: 'Hourly Rate',
      dataIndex: 'hourlyRate',
      key: 'hourlyRate',
      sorter: true,
      render: (rate) => rate ? `$${rate.toFixed(2)}` : <Tag color="default">N/A</Tag>,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.isActive ? 'green' : 'red'}>
          {record.isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => {
        const isInMyList = record.addedAt !== null;
        
        return (
          <Space>
            {!isInMyList && userRole === 'landlord' && (
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
            {isInMyList && (userRole === 'landlord' || userRole === 'pmc') && !record.isGlobal && (
              <>
                <Tooltip title="Edit contractor">
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleEditContractor(record)}
                  >
                    Edit
                  </Button>
                </Tooltip>
                <Popconfirm
                  title="Remove contractor from your list?"
                  description="This will remove the contractor from your list but won't delete them."
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
              </>
            )}
            {isInMyList && record.isGlobal && (userRole === 'landlord' || userRole === 'pmc') && (
              <Popconfirm
                title="Remove contractor from your list?"
                description="This will remove the contractor from your list but won't delete them."
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
    storageKey: 'contractors-table',
    defaultSort: { field: 'companyName', order: 'ascend' },
  });

  return (
    <PageLayout
      title="Contractors"
      actions={[
        {
          key: 'add',
          icon: <PlusOutlined />,
          label: 'Add Contractor',
          tooltip: 'Add Contractor',
          type: 'primary',
          onClick: () => {
            openForCreate();
            form.resetFields();
          },
        },
        {
          key: 'search-global',
          icon: <GlobalOutlined />,
          label: 'Search Global',
          tooltip: 'Search Global Contractors',
          type: 'default',
          onClick: handleAddGlobalContractor,
        },
      ]}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      onSearchClear={() => setSearchTerm('')}
      searchPlaceholder="Search by company, contact, specialty (e.g., plumbing, HVAC, electrical)..."
    >
      {filteredContractors.length === 0 ? (
        <EmptyState
          description={searchTerm ? 'No contractors found matching your search' : 'No contractors available'}
          icon={<TeamOutlined />}
        />
      ) : (
        <TableWrapper>
          <ProTable
            {...tableProps}
            dataSource={filteredContractors}
            rowKey="id"
            loading={loading}
            search={false}
            toolBarRender={false}
            pagination={{ pageSize: 20 }}
          />
        </TableWrapper>
      )}

      {/* Add/Edit Contractor Modal */}
      <StandardModal
        title={editingContractor ? 'Edit Contractor' : 'Add Contractor'}
        open={modalOpen}
        form={form}
        loading={submittingContractor}
        submitText={editingContractor ? 'Save' : 'Submit'}
        onCancel={() => {
          closeModal();
          form.resetFields();
          setSelectedCountry('CA');
        }}
        onFinish={handleAddContractor}
        width={700}
      >
        <FormTextInput
          name="companyName"
          label="Company Name"
          required
          placeholder="e.g., ABC Plumbing Services"
        />

        <FormTextInput
          name="contactName"
          label="Contact Name"
          required
          placeholder="e.g., John Smith"
        />

        <FormTextInput
          name="email"
          label="Email"
          type="email"
          required
          placeholder="contractor@example.com"
        />

        <FormPhoneInput
          name="phone"
          label="Phone Number"
          required
          placeholder="(XXX) XXX-XXXX"
        />

          <Form.Item
            name="specialties"
            label="Specialties"
            rules={[{ required: true, message: 'At least one specialty is required' }]}
            tooltip="Select or type specialties (e.g., plumbing, electrical, HVAC). You can add custom specialties by typing them."
          >
            <Select
              mode="tags"
              placeholder="Select or type specialties"
              tokenSeparators={[',']}
              options={[
                {
                  label: 'Core Trades',
                  options: [
                    { label: 'Plumbing', value: 'plumbing' },
                    { label: 'Electrical', value: 'electrical' },
                    { label: 'HVAC', value: 'hvac' },
                    { label: 'General Contracting', value: 'general-contracting' },
                  ],
                },
                {
                  label: 'Construction & Renovation',
                  options: [
                    { label: 'Roofing', value: 'roofing' },
                    { label: 'Painting', value: 'painting' },
                    { label: 'Flooring', value: 'flooring' },
                    { label: 'Carpentry', value: 'carpentry' },
                    { label: 'Drywall', value: 'drywall' },
                  ],
                },
                {
                  label: 'Property Services',
                  options: [
                    { label: 'Landscaping', value: 'landscaping' },
                  ],
                },
                {
                  label: 'Other',
                  options: [
                    { label: 'Other', value: 'other' },
                  ],
                },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="addressLine1"
            label="Billing Address"
            rules={[{ required: true, message: 'Address is required for billing' }]}
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

        <FormTextInput
          name="licenseNumber"
          label="License Number (Optional)"
          placeholder="e.g., LIC-12345"
        />

        <Form.Item name="hourlyRate" label="Hourly Rate (Optional)">
          <Input prefix="$" type="number" step="0.01" placeholder="0.00" />
        </Form.Item>
      </StandardModal>
    </PageLayout>
  );
}

