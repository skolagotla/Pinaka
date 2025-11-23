"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card, Button, Modal, Select, TextInput, Label, Textarea,
  Tooltip, Badge, Alert, Spinner
} from 'flowbite-react';
import {
  HiPlus,
  HiDocumentText,
  HiEye,
  HiPencil,
  HiTrash,
  HiCheckCircle,
  HiDownload,
  HiPaperClip,
  HiClock,
  HiPaperAirplane,
  HiX,
} from 'react-icons/hi';
import dayjs from 'dayjs';
import { formatDateDisplay, formatDateMonthYear, formatDateTimeDisplay } from '@/lib/utils/safe-date-formatter';
import { formatAmount } from '@/lib/currency-utils';
import { PageLayout, TableWrapper, renderDate, DeleteConfirmButton } from '@/components/shared';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import FlowbitePopconfirm from '@/components/shared/FlowbitePopconfirm';
import { renderStatus } from '@/components/shared/FlowbiteTableRenderers';
import { notify } from '@/lib/utils/notification-helper';
import { rules } from '@/lib/utils/validation-rules';
import { useLoading } from '@/lib/hooks/useLoading';
import SigningFlow from '@/components/SigningFlow';
import dynamic from 'next/dynamic';
import { useUnifiedApi } from '@/lib/hooks/useUnifiedApi';
import { useResizableTable, configureTableColumns, useModalState } from '@/lib/hooks';
import { useFormState } from '@/lib/hooks/useFormState';

// Lazy load PDFViewerModal to reduce initial bundle size
const PDFViewerModal = dynamic(
  () => import('@/components/shared/PDFViewerModal'),
  { ssr: false, loading: () => null }
);

export default function GeneratedFormsClient({ userRole, user = null }) {
  const router = useRouter();
  const { fetch } = useUnifiedApi({ showUserMessage: true });
  const { loading, withLoading } = useLoading(true);
  const [forms, setForms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [tenantsWithBalance, setTenantsWithBalance] = useState([]);
  const [properties, setProperties] = useState([]);
  
  // Form generation state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedFormType, setSelectedFormType] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [selectedLease, setSelectedLease] = useState(null);
  const [generatedFormData, setGeneratedFormData] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [tenantRentData, setTenantRentData] = useState(null);
  const [eligibleProperties, setEligibleProperties] = useState([]);
  
  // View modal state
  const { isOpen: viewModalOpen, open: openViewModal, close: closeViewModalHook, editingItem: viewingForm, openForEdit: openViewModalForEdit } = useModalState();
  
  // PDF Viewer state
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfViewerUrl, setPdfViewerUrl] = useState(null);
  const [pdfViewerTitle, setPdfViewerTitle] = useState('');
  
  // Signing flow state
  const { isOpen: signingFlowOpen, open: openSigningFlow, close: closeSigningFlow, editingItem: signingForm, setEditingItem: setSigningForm } = useModalState();
  const [signatureUrl, setSignatureUrl] = useState(null);

  // Form for custom data
  const form = useFormState();

  // Use a ref to prevent duplicate API calls
  const signatureFetchAttempted = useRef(false);

  // Load signature on mount - ONLY for landlords
  useEffect(() => {
    if (signatureFetchAttempted.current) {
      return;
    }

    const currentUserRole = String(userRole || '').trim();
    
    if (currentUserRole !== 'landlord') {
      if (process.env.NODE_ENV === 'development') {
        console.log('[GeneratedFormsClient] Skipping signature fetch - userRole is not "landlord":', currentUserRole);
      }
      return;
    }
    
    signatureFetchAttempted.current = true;
    
    const fetchSignature = async () => {
      const roleCheck = String(userRole || '').trim();
      if (roleCheck !== 'landlord') {
        if (process.env.NODE_ENV === 'development') {
          console.log('[GeneratedFormsClient] Aborting signature fetch - userRole changed:', roleCheck);
        }
        return;
      }
      
      try {
        const { v1Api } = await import('@/lib/api/v1-client');
        const data = await v1Api.signatures.getSignature(undefined);
        setSignatureUrl(data.signatureUrl);
      } catch (error) {
        setSignatureUrl(null);
      }
    };
    
    fetchSignature();
  }, [userRole, fetch]);

  // Helper function to format tenant names for display
  const formatTenantName = (tenant, allTenantsList = null) => {
    if (!tenant) return 'N/A';
    
    if (tenant.allTenants && Array.isArray(tenant.allTenants) && tenant.allTenants.length > 1) {
      return tenant.allTenants
        .filter(t => t && t.firstName && t.lastName)
        .map(t => `${t.firstName} ${t.lastName}`)
        .join(', ');
    }
    
    if (tenant.leaseTenants && Array.isArray(tenant.leaseTenants) && tenant.leaseTenants.length > 0 && allTenantsList) {
      const activeLeaseTenant = tenant.leaseTenants.find(
        lt => lt?.lease && lt.lease.status === 'Active'
      );
      
      if (activeLeaseTenant && activeLeaseTenant.lease) {
        const leaseId = activeLeaseTenant.lease.id;
        const leaseTenants = Array.isArray(allTenantsList) ? allTenantsList.filter(t => 
          t && t.leaseTenants && Array.isArray(t.leaseTenants) && t.leaseTenants.some(
            lt => lt?.lease && lt.lease.id === leaseId && lt.lease.status === 'Active'
          )
        ) : [];
        
        if (leaseTenants.length > 1) {
          const sorted = [...leaseTenants].sort((a, b) => {
            if (!a || !b) return 0;
            const aIsPrimary = a.leaseTenants?.find(lt => lt?.lease?.id === leaseId)?.isPrimaryTenant || false;
            const bIsPrimary = b.leaseTenants?.find(lt => lt?.lease?.id === leaseId)?.isPrimaryTenant || false;
            if (aIsPrimary && !bIsPrimary) return -1;
            if (!aIsPrimary && bIsPrimary) return 1;
            const aName = `${a.firstName || ''} ${a.lastName || ''}`.trim();
            const bName = `${b.firstName || ''} ${b.lastName || ''}`.trim();
            return aName.localeCompare(bName);
          });
          
          return sorted
            .filter(t => t && t.firstName && t.lastName)
            .map(t => `${t.firstName} ${t.lastName}`)
            .join(', ');
        }
      }
    }
    
    if (tenant.firstName && tenant.lastName) {
      return `${tenant.firstName} ${tenant.lastName}`;
    }
    return 'N/A';
  };

  const formTypes = [
    { 
      value: 'N4', 
      label: 'N4 - Non-Payment of Rent', 
      category: 'eviction', 
      urgent: true,
      description: 'Your tenant owes you rent money and you want them to pay up or leave'
    },
    { 
      value: 'N5', 
      label: 'N5 - Tenant Misconduct', 
      category: 'eviction', 
      urgent: false,
      description: 'Tenant is breaking stuff, being too loud, or you\'ve got too many people living there'
    },
    { 
      value: 'N7', 
      label: 'N7 - Serious Illegal Act/Damage', 
      category: 'eviction', 
      urgent: true,
      description: 'Someone could get seriously hurt because of what your tenant is doing - acts fast'
    },
    { 
      value: 'N8', 
      label: 'N8 - End Tenancy at End of Term', 
      category: 'notice', 
      urgent: false,
      description: 'The lease is almost over and you don\'t want this tenant to stay anymore'
    },
    { 
      value: 'N12', 
      label: 'N12 - Landlord/Family Needs Unit', 
      category: 'eviction', 
      urgent: false,
      description: 'You or a family member needs to move into the rental unit'
    },
    { 
      value: 'L1', 
      label: 'L1 - Application for Non-Payment', 
      category: 'application', 
      urgent: true,
      description: 'Application to the Landlord and Tenant Board for unpaid rent'
    },
    { 
      value: 'L2', 
      label: 'L2 - Application to Evict', 
      category: 'application', 
      urgent: false,
      description: 'Application to the Landlord and Tenant Board to evict a tenant'
    },
  ];

  useEffect(() => {
    try {
      loadData();
    } catch (error) {
      console.error('[GeneratedFormsClient] Error in loadData useEffect:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    await withLoading(async () => {
      const { v1Api } = await import('@/lib/api/v1-client');
      const [formsRes, tenantsRes, tenantsWithBalanceRes, propertiesRes] = await Promise.all([
        v1Api.generatedForms.list({ page: 1, limit: 1000 }).then(response => {
          const formsData = response.forms || response.data?.forms || [];
          return { ok: true, json: async () => ({ forms: Array.isArray(formsData) ? formsData : [] }) };
        }).catch(() => null),
        v1Api.tenants.list({ page: 1, limit: 1000 }).then(response => {
          const tenantsData = response.data?.data || response.data || [];
          return { ok: true, json: async () => ({ tenants: Array.isArray(tenantsData) ? tenantsData : [] }) };
        }).catch(() => null),
        v1Api.specialized.getTenantsWithOutstandingBalance().then(data => {
          const tenants = data.tenants || data.data || [];
          return { ok: true, json: async () => ({ tenants: Array.isArray(tenants) ? tenants : [] }) };
        }).catch(() => null),
        v1Api.properties.list({ page: 1, limit: 1000 }).then(response => {
          const propertiesData = response.data?.data || response.data || [];
          return { ok: true, json: async () => ({ properties: Array.isArray(propertiesData) ? propertiesData : [] }) };
        }).catch(() => null)
      ]);

      if (formsRes) {
        try {
          const data = await formsRes.json();
          setForms(Array.isArray(data?.forms) ? data.forms : []);
        } catch (error) {
          console.error('[GeneratedFormsClient] Error parsing forms:', error);
          setForms([]);
        }
      }

      if (tenantsRes) {
        try {
          const data = await tenantsRes.json();
          setTenants(Array.isArray(data?.tenants) ? data.tenants : []);
        } catch (error) {
          console.error('[GeneratedFormsClient] Error parsing tenants:', error);
          setTenants([]);
        }
      }

      if (tenantsWithBalanceRes) {
        try {
          const data = await tenantsWithBalanceRes.json();
          const tenantsList = Array.isArray(data?.tenants) ? data.tenants : [];
          setTenantsWithBalance(tenantsList);
          
          const uniqueProperties = new Map();
          tenantsList.forEach(tenant => {
            if (tenant?.property && tenant.property.id) {
              if (!uniqueProperties.has(tenant.property.id)) {
                uniqueProperties.set(tenant.property.id, {
                  id: tenant.property.id,
                  propertyName: tenant.property.propertyName || tenant.property.addressLine1,
                  addressLine1: tenant.property.addressLine1,
                  city: tenant.property.city,
                  provinceState: tenant.property.provinceState
                });
              }
            }
          });
          setEligibleProperties(Array.from(uniqueProperties.values()));
        } catch (error) {
          console.error('[GeneratedFormsClient] Error parsing tenants with balance:', error);
          setTenantsWithBalance([]);
          setEligibleProperties([]);
        }
      }

      if (propertiesRes) {
        try {
          const data = await propertiesRes.json();
          setProperties(Array.isArray(data?.properties) ? data.properties : []);
        } catch (error) {
          console.error('[GeneratedFormsClient] Error parsing properties:', error);
          setProperties([]);
        }
      }

    }).catch(error => {
      // Error already handled by useUnifiedApi
    });
  };

  const fetchTenantRentData = async (tenantId) => {
    try {
      const { v1Api } = await import('@/lib/api/v1-client');
      const data = await v1Api.specialized.getTenantRentData(tenantId);
      
      const payments = data.rentPayments || [];
      const unpaidPayments = payments.filter(p => {
        const status = (p.status || '').toLowerCase();
        return status !== 'paid' && status !== 'completed';
      });
      
      if (unpaidPayments.length === 0) {
        const terminationDate = new Date();
        terminationDate.setDate(terminationDate.getDate() + 15);
        return {
          terminationDate: dayjs(terminationDate).format('YYYY-MM-DD'),
          notes: 'No outstanding rent balance'
        };
      }
      
      const firstUnpaid = unpaidPayments.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )[0];
      
      const totalArrears = unpaidPayments.reduce(
        (sum, p) => sum + (p.amount || 0),
        0
      );
      
      const arrearsStartDate = firstUnpaid.dueDate 
        ? dayjs(firstUnpaid.dueDate).add(1, 'day').format('YYYY-MM-DD')
        : null;
      
      const lastUnpaid = unpaidPayments.sort(
        (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      )[0];
      const arrearsEndDate = lastUnpaid.dueDate 
        ? dayjs(lastUnpaid.dueDate).format('YYYY-MM-DD')
        : null;
      
      let landlordName = 'the landlord';
      try {
        const settingsRes = await fetch('/api/settings');
        const settingsData = await settingsRes.json();
        if (settingsData.landlord?.firstName && settingsData.landlord?.lastName) {
          landlordName = `${settingsData.landlord.firstName} ${settingsData.landlord.lastName}`;
        }
      } catch (e) {
        // Error handling
      }
      
      let notes = '';
      if (arrearsStartDate && arrearsEndDate) {
        notes = `Rent owed from ${dayjs(arrearsStartDate).format('MMMM D, YYYY')} until ${dayjs(arrearsEndDate).format('MMMM D, YYYY')} to the amount of $${totalArrears.toFixed(2)} to the landlord ${landlordName}.`;
      } else if (arrearsStartDate) {
        notes = `Rent owed from ${dayjs(arrearsStartDate).format('MMMM D, YYYY')} to the amount of $${totalArrears.toFixed(2)} to the landlord ${landlordName}.`;
      } else {
        notes = `Total outstanding rent: $${totalArrears.toFixed(2)} to the landlord ${landlordName}.`;
      }
      
      const terminationDate = new Date();
      terminationDate.setDate(terminationDate.getDate() + 15);
      
      return {
        arrearsStartDate,
        terminationDate: dayjs(terminationDate).format('YYYY-MM-DD'),
        notes,
        totalArrears,
        unpaidCount: unpaidPayments.length
      };
    } catch (error) {
      // Error handling
    }
    
    const terminationDate = new Date();
    terminationDate.setDate(terminationDate.getDate() + 15);
    
    return {
      terminationDate: dayjs(terminationDate).format('YYYY-MM-DD'),
      notes: 'Arrears calculated automatically from database'
    };
  };

  const handleTenantSelect = async (tenantId) => {
    setSelectedTenant(tenantId);
    
    if (selectedFormType === 'N4') {
      const rentData = await fetchTenantRentData(tenantId);
      
      setTenantRentData(rentData);
      
      if (rentData) {
        form.setFieldsValue({
          arrearsStartDate: rentData.arrearsStartDate,
          terminationDate: rentData.terminationDate,
          notes: rentData.notes
        });
      }
    } else {
      setTenantRentData(null);
    }
  };

  const openWizard = () => {
    setWizardOpen(true);
    setSelectedFormType(null);
    setSelectedTenant(null);
    setSelectedLease(null);
    setGeneratedFormData(null);
    setTenantRentData(null);
    form.resetFields();
  };

  const closeWizard = () => {
    setWizardOpen(false);
    setSelectedFormType(null);
    setSelectedProperty(null);
    setSelectedTenant(null);
    setSelectedLease(null);
    setGeneratedFormData(null);
    setTenantRentData(null);
    form.resetFields();
  };

  const handleGenerateForm = async () => {
    try {
      setGenerating(true);

      const customData = form.getFieldsValue();
      
      const { v1Api } = await import('@/lib/api/v1-client');
      const response = await v1Api.forms.generateForm({
        formType: selectedFormType,
        tenantId: selectedTenant,
        propertyId: selectedProperty,
        leaseId: selectedLease,
        customData
      });
      setGeneratedFormData(response.form);

    } catch (error) {
      // Error already handled by useUnifiedApi
    } finally {
      setGenerating(false);
    }
  };

  const handleFinalizeForm = async (formId) => {
    try {
      const { v1Api } = await import('@/lib/api/v1-client');
      await v1Api.generatedForms.update(formId, { status: 'finalized' });

      notify.success('Form finalized successfully!');
      loadData();
      closeWizard();

    } catch (error) {
      // Error already handled by useUnifiedApi
    }
  };

  const handleViewForm = async (formRecord) => {
    try {
      const { v1Api } = await import('@/lib/api/v1-client');
      const blob = await v1Api.forms.downloadForm(formRecord.id);
      const url = URL.createObjectURL(blob);
      
      setPdfViewerUrl(url);
      setPdfViewerTitle(`${formRecord.formType} Form - ${formRecord.tenantName || 'Unknown Tenant'}`);
      setPdfViewerOpen(true);
    } catch (error) {
      notify.error(error.message || 'Failed to load PDF. Please try again.');
    }
  };

  const closeViewModal = () => {
    closeViewModalHook();
  };

  const handleDeleteForm = async (formId) => {
    try {
      const { v1Api } = await import('@/lib/api/v1-client');
      await v1Api.generatedForms.delete(formId);

      notify.success('Form deleted successfully');
      loadData();

    } catch (error) {
      // Error already handled by useUnifiedApi
    }
  };

  const handleDownloadPDF = async (record) => {
    setSigningForm(record);
    openSigningFlow();
  };

  const handleSendForm = async (record) => {
    try {
      notify.loading('Sending email to tenant...');
      
      const { v1Api } = await import('@/lib/api/v1-client');
      await v1Api.forms.sendForm(record.id);

      notify.success('Email sent successfully to tenant!');
      
      loadData();
    } catch (error) {
      notify.error(error.message || 'Failed to send email');
    }
  };

  const handleReviewPDF = async () => {
    try {
      if (!generatedFormData) {
        setGenerating(true);
        
        const customData = form.getFieldsValue();
        
        const { v1Api } = await import('@/lib/api/v1-client');
        const response = await v1Api.forms.generateForm({
          formType: selectedFormType,
          tenantId: selectedTenant,
          propertyId: selectedProperty,
          leaseId: selectedLease,
          customData
        });
        setGeneratedFormData(response.form);
        setGenerating(false);
        
        closeWizard();
        
        await loadData();
        
        setSigningForm(response.form);
        openSigningFlow();
      } else {
        closeWizard();
        setSigningForm(generatedFormData);
        openSigningFlow();
      }
    } catch (error) {
      setGenerating(false);
    }
  };

  const handleSignComplete = () => {
    notify.success('Document signed and downloaded successfully!');
    loadData();
  };

  // Table columns
  const baseColumns = [
    {
      title: 'Form Type',
      dataIndex: 'formType',
      key: 'formType',
      render: (type) => {
        if (!type) return <Badge color="gray">N/A</Badge>;
        return (
          <Badge color={
            type.startsWith('L') ? 'failure' :
            type === 'N4' || type === 'N7' ? 'warning' :
            'blue'
          }>
            {type}
          </Badge>
        );
      },
    },
    {
      title: 'Tenant',
      dataIndex: 'tenantName',
      key: 'tenantName',
      render: (name) => (
        <span className="font-semibold">{name || 'N/A'}</span>
      )
    },
    {
      title: 'Property',
      dataIndex: 'propertyAddress',
      key: 'propertyAddress',
      render: (address, record) => {
        if (!record) return <span>N/A</span>;
        const propertyName = record?.propertyName || address || 'N/A';
        
        if (record?.propertyUnitCount === 1) {
          return <span>{propertyName}</span>;
        }
        
        const unitName = record?.unitName || '';
        if (unitName) {
          return <span>{unitName} - {propertyName}</span>;
        }
        
        return <span>{propertyName}</span>;
      }
    },
    {
      title: 'Generated',
      dataIndex: 'generatedAt',
      key: 'generatedAt',
      render: (_, record) => renderDate(record.generatedAt),
      width: 180
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (!status) return <Badge color="gray">N/A</Badge>;
        const statusMap = {
          draft: 'Draft',
          finalized: 'Completed',
          sent: 'In Progress',
          filed: 'Completed'
        };
        return renderStatus(statusMap[status] || status, {
          customColors: {
            'Draft': 'gray',
            'Completed': 'success',
            'In Progress': 'info',
            'Sent': 'info',
            'Filed': 'purple'
          }
        });
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        if (!record) return null;
        return (
          <div className="flex items-center gap-2">
            <Tooltip content="View" style="dark" placement="top">
              <Button
                size="sm"
                color="gray"
                onClick={() => handleViewForm(record)}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <HiEye className="h-4 w-4" />
              </Button>
            </Tooltip>
            {record?.status === 'draft' && (
              <>
                <Tooltip content="Edit" style="dark" placement="top">
                  <Button
                    size="sm"
                    color="gray"
                    onClick={() => {
                      notify.info('Edit functionality coming soon');
                    }}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <HiPencil className="h-4 w-4" />
                  </Button>
                </Tooltip>
                <Tooltip content="Finalize" style="dark" placement="top">
                  <Button
                    size="sm"
                    color="success"
                    onClick={() => handleFinalizeForm(record?.id)}
                    className="hover:bg-green-700 transition-colors"
                  >
                    <HiCheckCircle className="h-4 w-4" />
                  </Button>
                </Tooltip>
              </>
            )}
            <Tooltip content="Download PDF" style="dark" placement="top">
              <Button
                size="sm"
                color="gray"
                onClick={() => handleDownloadPDF(record)}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <HiDownload className="h-4 w-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Send to Tenant" style="dark" placement="top">
              <Button
                size="sm"
                color="blue"
                onClick={() => handleSendForm(record)}
                className="hover:bg-blue-700 transition-colors"
              >
                <HiPaperAirplane className="h-4 w-4" />
              </Button>
            </Tooltip>
            {(record.status === 'draft' || record.status === 'finalized') && (
              <FlowbitePopconfirm
                title={`Delete ${record.status === 'draft' ? 'draft' : 'form'}?`}
                description={
                  record.status === 'draft' 
                    ? "This draft will be permanently deleted. This action cannot be undone."
                    : "This finalized form will be permanently deleted. This action cannot be undone."
                }
                onConfirm={() => handleDeleteForm(record.id)}
                okText="Yes, Delete"
                cancelText="Cancel"
                danger={true}
              >
                <Button
                  size="sm"
                  color="failure"
                  title={record.status === 'draft' ? "Delete Draft" : "Delete Form"}
                >
                  <HiTrash className="h-4 w-4" />
                </Button>
              </FlowbitePopconfirm>
            )}
          </div>
        );
      },
      fixed: 'right'
    }
  ];

  // Configure columns
  const columns = configureTableColumns(baseColumns);
  
  // Use resizable table hook
  const { tableProps } = useResizableTable(columns, {
    storageKey: 'landlord-forms-table',
    defaultSort: { field: 'generatedAt', order: 'descend' },
  });

  const statsData = [
    {
      title: 'Total Forms',
      value: Array.isArray(forms) ? forms.length : 0,
      prefix: <HiDocumentText className="h-5 w-5" />,
    },
    {
      title: 'Drafts',
      value: Array.isArray(forms) ? forms.filter(f => f?.status === 'draft').length : 0,
      prefix: <HiDocumentText className="h-5 w-5" />,
      valueStyle: { color: '#faad14' },
    },
    {
      title: 'Finalized',
      value: Array.isArray(forms) ? forms.filter(f => f?.status === 'finalized').length : 0,
      prefix: <HiCheckCircle className="h-5 w-5" />,
      valueStyle: { color: '#52c41a' },
    },
    {
      title: 'Sent',
      value: Array.isArray(forms) ? forms.filter(f => f?.status === 'sent').length : 0,
      prefix: <HiPaperAirplane className="h-5 w-5" />,
      valueStyle: { color: '#1890ff' },
    },
  ];

  return (
    <PageLayout
      headerTitle={
        <div className="flex items-center gap-2">
          <HiDocumentText className="h-5 w-5" />
          <span>Generated Forms</span>
        </div>
      }
      headerActions={[
        <Button
          key="generate"
          color="blue"
          onClick={openWizard}
          className="flex items-center gap-2"
        >
          <HiPlus className="h-4 w-4" />
          Generate Form
        </Button>
      ]}
      stats={statsData}
      statsCols={4}
    >
      {/* Generated Forms Table */}
      <Card>
        {loading ? (
          <div className="text-center py-12">
            <Spinner size="xl" />
          </div>
        ) : !Array.isArray(forms) || forms.length === 0 ? (
          <div className="text-center py-12">
            <HiDocumentText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No forms generated yet</p>
            <Button color="blue" onClick={openWizard} className="flex items-center gap-2 mx-auto">
              <HiPlus className="h-4 w-4" />
              Generate Your First Form
            </Button>
          </div>
        ) : (
          <TableWrapper>
            <FlowbiteTable
              {...tableProps}
              dataSource={Array.isArray(forms) ? forms : []}
              rowKey="id"
              pagination={{ pageSize: 20 }}
            />
          </TableWrapper>
        )}
      </Card>

      {/* Form Generation Modal with Flowbite Pro styling */}
      <Modal
        show={wizardOpen}
        onClose={closeWizard}
        size="4xl"
        className="[&>div]:rounded-lg"
      >
        <Modal.Header className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between w-full">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <HiDocumentText className="h-6 w-6 text-blue-600" />
              {selectedFormType ? `Generate ${selectedFormType}` : "Generate Legal Form"}
            </h3>
            <button
              onClick={closeWizard}
              className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white transition-colors"
            >
              <HiX className="h-5 w-5" />
              <span className="sr-only">Close modal</span>
            </button>
          </div>
        </Modal.Header>
        <Modal.Body className="p-6">
          <div className="space-y-6">
            {/* Step 1: Select Form Type with Flowbite Pro styling */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <Label htmlFor="formType" className="mb-3 text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <HiDocumentText className="h-5 w-5 text-blue-600" />
                Select Form Type:
              </Label>
              <Select
                id="formType"
                name="formType"
                value={selectedFormType || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedFormType(value || null);
                  setSelectedProperty(null);
                  setSelectedTenant(null);
                  setTenantRentData(null);
                  form.resetFields();
                }}
                className="w-full"
              >
                <option value="">Choose the form you need</option>
                {Array.isArray(formTypes) ? formTypes.map(ft => (
                  <option key={ft?.value} value={ft?.value}>
                    {ft?.value} - {ft?.label}
                  </option>
                )) : []}
              </Select>
              {selectedFormType && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {formTypes.find(ft => ft.value === selectedFormType)?.description}
                  </p>
                </div>
              )}
            </div>

            {/* Step 2: Property, Tenant, and Amount Owed */}
            {selectedFormType && (
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4">
                  {/* Property */}
                  <div className={selectedFormType === 'N4' && selectedTenant && tenantRentData ? 'col-span-4' : selectedTenant ? 'col-span-4' : 'col-span-6'}>
                    <Label className="mb-2 text-base font-semibold">Property:</Label>
                    {selectedFormType === 'N4' ? (
                      !Array.isArray(eligibleProperties) || eligibleProperties.length === 0 ? (
                        <Alert color="warning" className="mb-0">
                          <div>
                            <p className="font-semibold">No properties with tenants who owe rent</p>
                            <p className="text-sm">N4 forms are only available for properties with tenants who have outstanding balances.</p>
                          </div>
                        </Alert>
                      ) : (
                        <Select
                          value={selectedProperty || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSelectedProperty(value || null);
                            setSelectedTenant(null);
                            setTenantRentData(null);
                            form.resetFields();
                          }}
                        >
                          <option value="">Select property</option>
                          {Array.isArray(eligibleProperties) ? eligibleProperties.map(p => (
                            <option key={p?.id} value={p?.id}>
                              {`${p?.propertyName || p?.addressLine1 || 'N/A'}${p?.city ? `, ${p.city}` : ''}`}
                            </option>
                          )) : []}
                        </Select>
                      )
                    ) : (
                      !Array.isArray(properties) || properties.length === 0 ? (
                        <Alert color="info" className="mb-0">
                          <div>
                            <p className="font-semibold">No properties found</p>
                            <p className="text-sm">You need to create properties first.</p>
                          </div>
                        </Alert>
                      ) : (
                        <Select
                          value={selectedProperty || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSelectedProperty(value || null);
                            setSelectedTenant(null);
                            setTenantRentData(null);
                            form.resetFields();
                          }}
                        >
                          <option value="">Select property</option>
                          {Array.isArray(properties) ? properties.map(p => (
                            <option key={p?.id} value={p?.id}>
                              {`${p?.propertyName || p?.addressLine1 || 'N/A'}${p?.city ? `, ${p.city}` : ''}`}
                            </option>
                          )) : []}
                        </Select>
                      )
                    )}
                  </div>

                  {/* Tenant */}
                  {selectedProperty && (
                    <div className={selectedFormType === 'N4' && selectedTenant && tenantRentData ? 'col-span-4' : 'col-span-6'}>
                      <Label className="mb-2 text-base font-semibold">Select Tenant:</Label>
                      {selectedFormType === 'N4' ? (
                        (() => {
                          const filteredTenants = Array.isArray(tenantsWithBalance) ? tenantsWithBalance.filter(t => 
                            t?.property && t.property.id === selectedProperty
                          ) : [];
                          
                          if (!Array.isArray(filteredTenants) || filteredTenants.length === 0) {
                            return (
                              <Alert color="warning" className="mb-0">
                                <div>
                                  <p className="font-semibold">No tenants with outstanding balance for this property</p>
                                  <p className="text-sm">This property has no tenants who owe rent.</p>
                                </div>
                              </Alert>
                            );
                          }
                          
                          return (
                            <Select
                              value={selectedTenant || ''}
                              onChange={(e) => handleTenantSelect(e.target.value)}
                            >
                              <option value="">Search by tenant name</option>
                              {Array.isArray(filteredTenants) ? filteredTenants.map(t => (
                                <option key={t?.id} value={t?.id}>
                                  {formatTenantName(t)}
                                </option>
                              )) : []}
                            </Select>
                          );
                        })()
                      ) : (
                        !Array.isArray(tenants) || tenants.length === 0 ? (
                          <Alert color="info" className="mb-0">
                            <div>
                              <p className="font-semibold">No tenants found</p>
                              <p className="text-sm">You need to create tenants first.</p>
                              <Button
                                size="sm"
                                color="blue"
                                onClick={() => router.push('/tenants')}
                                className="mt-2"
                              >
                                Go to Tenants
                              </Button>
                            </div>
                          </Alert>
                        ) : (
                          <Select
                            value={selectedTenant || ''}
                            onChange={(e) => handleTenantSelect(e.target.value)}
                          >
                            <option value="">Search by tenant name or email</option>
                            {Array.isArray(tenants) ? tenants.map(t => (
                              <option key={t?.id} value={t?.id}>
                                {formatTenantName(t, tenants)}
                              </option>
                            )) : []}
                          </Select>
                        )
                      )}
                    </div>
                  )}
                  
                  {/* Amount Owed */}
                  {selectedTenant && tenantRentData && selectedFormType === 'N4' && (
                    <div className="col-span-4">
                      <Label className="mb-2 text-base font-semibold">Amount Owed:</Label>
                      <TextInput
                        value={`$${formatAmount(tenantRentData.totalArrears || 0)}`}
                        readOnly
                        className="bg-gray-100 font-semibold"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form Details */}
            {selectedFormType && selectedProperty && selectedTenant && (
              <div className="space-y-4">
                {selectedFormType === 'N4' && tenantRentData && tenantRentData.unpaidCount > 0 && (
                  <Alert color="warning">
                    <div>
                      <p className="font-semibold">Rent Arrears Detected</p>
                      <p className="text-sm">Total Arrears: ${formatAmount(tenantRentData.totalArrears || 0)}</p>
                    </div>
                  </Alert>
                )}
                
                <form className="space-y-4">
                  {selectedFormType === 'N4' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="arrearsStartDate" className="mb-2">
                          Arrears Start Date
                          <Tooltip content="Day after rent was first due and unpaid">
                            <span className="ml-1 text-gray-400 cursor-help">ℹ️</span>
                          </Tooltip>
                        </Label>
                        <TextInput
                          id="arrearsStartDate"
                          name="arrearsStartDate"
                          type="date"
                          value={form.values.arrearsStartDate || ''}
                          onChange={(e) => form.setFieldsValue({ arrearsStartDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="terminationDate" className="mb-2">
                          Termination Date
                          <Tooltip content="15 days from today (standard notice period)">
                            <span className="ml-1 text-gray-400 cursor-help">ℹ️</span>
                          </Tooltip>
                        </Label>
                        <TextInput
                          id="terminationDate"
                          name="terminationDate"
                          type="date"
                          value={form.values.terminationDate || ''}
                          onChange={(e) => form.setFieldsValue({ terminationDate: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                  
                  {selectedFormType === 'N5' && (
                    <>
                      <div>
                        <Label htmlFor="misconductDetails" className="mb-2">
                          Misconduct Details <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="misconductDetails"
                          name="misconductDetails"
                          rows={4}
                          placeholder="Describe the misconduct..."
                          value={form.values.misconductDetails || ''}
                          onChange={(e) => form.setFieldsValue({ misconductDetails: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="incidentDate" className="mb-2">Incident Date</Label>
                        <TextInput
                          id="incidentDate"
                          name="incidentDate"
                          type="date"
                          value={form.values.incidentDate || ''}
                          onChange={(e) => form.setFieldsValue({ incidentDate: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                  
                  {selectedFormType === 'N12' && (
                    <>
                      <div>
                        <Label htmlFor="personMovingIn" className="mb-2">Person Moving In</Label>
                        <TextInput
                          id="personMovingIn"
                          name="personMovingIn"
                          placeholder="e.g., Myself, My son"
                          value={form.values.personMovingIn || ''}
                          onChange={(e) => form.setFieldsValue({ personMovingIn: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="relationshipToLandlord" className="mb-2">Relationship to Landlord</Label>
                        <Select
                          id="relationshipToLandlord"
                          name="relationshipToLandlord"
                          value={form.values.relationshipToLandlord || ''}
                          onChange={(e) => form.setFieldsValue({ relationshipToLandlord: e.target.value })}
                        >
                          <option value="">Select relationship</option>
                          <option value="Self">Self</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Child">Child</option>
                          <option value="Parent">Parent</option>
                        </Select>
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="notes" className="mb-2">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      placeholder="Any additional information..."
                      value={form.values.notes || ''}
                      onChange={(e) => form.setFieldsValue({ notes: e.target.value })}
                    />
                  </div>
                </form>
              </div>
            )}

          </div>
        </Modal.Body>
        <Modal.Footer className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between w-full">
            <Button color="gray" onClick={closeWizard} className="min-w-[100px]">
              Cancel
            </Button>
            {selectedFormType && selectedProperty && selectedTenant && (
              <Button
                color="blue"
                onClick={handleReviewPDF}
                disabled={generating}
                className="min-w-[150px] flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <Spinner size="sm" />
                    Generating...
                  </>
                ) : (
                  <>
                    <HiEye className="h-4 w-4" />
                    Review PDF
                  </>
                )}
              </Button>
            )}
          </div>
        </Modal.Footer>
      </Modal>

      {/* PDF Viewer Modal */}
      <PDFViewerModal
        open={pdfViewerOpen}
        title={pdfViewerTitle}
        pdfUrl={pdfViewerUrl}
        onClose={() => {
          setPdfViewerOpen(false);
          if (pdfViewerUrl) {
            URL.revokeObjectURL(pdfViewerUrl);
            setPdfViewerUrl(null);
          }
        }}
        onDownload={() => {
          if (pdfViewerUrl) {
            const a = document.createElement('a');
            a.href = pdfViewerUrl;
            a.download = `${pdfViewerTitle.replace(/\s+/g, '-')}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        }}
        downloadFileName={`${pdfViewerTitle.replace(/\s+/g, '-')}.pdf`}
        width={1100}
        height={750}
      />

      {/* Signing Flow Modal */}
      <SigningFlow
        open={signingFlowOpen}
        onClose={() => {
          closeSigningFlow();
          loadData();
        }}
        formId={signingForm?.id}
        formData={signingForm}
        onSignComplete={handleSignComplete}
        signatureUrl={signatureUrl}
      />
    </PageLayout>
  );
}
