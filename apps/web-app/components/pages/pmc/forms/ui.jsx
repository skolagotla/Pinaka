"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Modal, Select, TextInput, Textarea, Badge, Tooltip, Spinner, Alert } from 'flowbite-react';
import {
  HiPlus, HiDocumentText, HiEye, HiPencil, HiTrash,
  HiCheckCircle, HiDownload, HiDocumentCheck, HiClock,
  HiPaperAirplane, HiShieldCheck
} from 'react-icons/hi';
import dayjs from 'dayjs';
import { formatDateDisplay, formatDateMonthYear, formatDateTimeDisplay } from '@/lib/utils/safe-date-formatter';
import { formatAmount } from '@/lib/currency-utils';
import { PageLayout, TableWrapper, renderDate, DeleteConfirmButton, FormTextInput, FormSelect, FormDatePicker, EmptyState, FlowbiteTable } from '@/components/shared';
import { renderStatus } from '@/components/shared/TableRenderers';
import { notify } from '@/lib/utils/notification-helper';
import { rules } from '@/lib/utils/validation-rules';
import { useLoading } from '@/lib/hooks/useLoading';
import SigningFlow from '@/components/SigningFlow';
import dynamic from 'next/dynamic';
import { useUnifiedApi } from '@/lib/hooks/useUnifiedApi';
import { useResizableTable, configureTableColumns, useModalState } from '@/lib/hooks';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useForms, useTenants, useProperties } from '@/lib/hooks/useV2Data';
import { useFormState } from '@/lib/hooks/useFormState';

// Lazy load PDFViewerModal to reduce initial bundle size
const PDFViewerModal = dynamic(
  () => import('@/components/shared/PDFViewerModal'),
  { ssr: false, loading: () => null }
);

export default function PMCGeneratedFormsClient() {
  const router = useRouter();
  const { fetch } = useUnifiedApi({ showUserMessage: true });
  const { user: v2User } = useV2Auth();
  const organizationId = v2User?.organization_id;
  const { loading, withLoading } = useLoading(true);
  
  // v2 API hooks
  const { data: formsData, refetch: refetchForms } = useForms(organizationId);
  const { data: tenantsData } = useTenants(organizationId);
  const { data: propertiesData } = useProperties(organizationId);
  
  const [forms, setForms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [tenantsWithBalance, setTenantsWithBalance] = useState([]);
  const [properties, setProperties] = useState([]);
  
  // Use v2 data if available
  useEffect(() => {
    if (formsData && Array.isArray(formsData)) {
      setForms(formsData);
    }
  }, [formsData]);
  
  useEffect(() => {
    if (tenantsData && Array.isArray(tenantsData)) {
      setTenants(tenantsData);
    }
  }, [tenantsData]);
  
  useEffect(() => {
    if (propertiesData && Array.isArray(propertiesData)) {
      setProperties(propertiesData);
    }
  }, [propertiesData]);
  
  // Removed filter state - now using table column filters
  
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
  const { formData, updateField, resetForm } = useFormState({
    arrearsStartDate: null,
    terminationDate: null,
    notes: '',
    misconductDetails: '',
    incidentDate: null,
    personMovingIn: '',
    relationshipToLandlord: ''
  });

  // Load signature on mount - skip for PMC users as they need a landlordId
  // Signature will be fetched when a landlord is selected during form generation
  // useEffect(() => {
  //   fetchSignature();
  // }, []);

  const fetchSignature = async (landlordId = null) => {
    try {
      // Use v1Api to get signature
      const { v1Api } = await import('@/lib/api/v1-client');
      const data = await v1Api.signatures.getSignature(landlordId || undefined);
      setSignatureUrl(data.signatureUrl);
    } catch (error) {
      // For PMC users, signature might not be available until a landlord is selected
      setSignatureUrl(null);
    }
  };

  // Helper function to format tenant names for display
  const formatTenantName = (tenant, allTenantsList = null) => {
    // For tenants with balance (N4 forms), use allTenants if available
    if (tenant.allTenants && tenant.allTenants.length > 1) {
      return tenant.allTenants.map(t => `${t.firstName} ${t.lastName}`).join(', ');
    }
    
    // For regular tenants, check if they have multiple tenants on the same lease
    if (tenant.leaseTenants && tenant.leaseTenants.length > 0 && allTenantsList) {
      // Find active lease
      const activeLeaseTenant = tenant.leaseTenants.find(
        lt => lt.lease && lt.lease.status === 'Active'
      );
      
      if (activeLeaseTenant && activeLeaseTenant.lease) {
        // Get all tenants for this lease from the allTenantsList array
        const leaseId = activeLeaseTenant.lease.id;
        const leaseTenants = allTenantsList.filter(t => 
          t.leaseTenants && t.leaseTenants.some(
            lt => lt.lease && lt.lease.id === leaseId && lt.lease.status === 'Active'
          )
        );
        
        if (leaseTenants.length > 1) {
          // Sort: primary first, then by name
          const sorted = [...leaseTenants].sort((a, b) => {
            const aIsPrimary = a.leaseTenants.find(lt => lt.lease?.id === leaseId)?.isPrimaryTenant || false;
            const bIsPrimary = b.leaseTenants.find(lt => lt.lease?.id === leaseId)?.isPrimaryTenant || false;
            if (aIsPrimary && !bIsPrimary) return -1;
            if (!aIsPrimary && bIsPrimary) return 1;
            return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          });
          
          return sorted.map(t => `${t.firstName} ${t.lastName}`).join(', ');
        }
      }
    }
    
    // Default: single tenant
    return `${tenant.firstName} ${tenant.lastName}`;
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
    loadData();
  }, []);

  const loadData = async () => {
    await withLoading(async () => {
      // Use v1Api for all endpoints
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
        const data = await formsRes.json();
        setForms(data.forms || []);
      }

      if (tenantsRes) {
        const data = await tenantsRes.json();
        setTenants(data.tenants || []);
      }

      if (tenantsWithBalanceRes) {
        const data = await tenantsWithBalanceRes.json();
        setTenantsWithBalance(data.tenants || []);
        
        // Extract unique properties eligible for N4 (properties with tenants who have outstanding balances)
        const uniqueProperties = new Map();
        (data.tenants || []).forEach(tenant => {
          if (tenant.property && tenant.property.id) {
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
      }

      if (propertiesRes) {
        const data = await propertiesRes.json();
        setProperties(data.properties || []);
      }

    }).catch(error => {
      // Error already handled by useUnifiedApi
    });
  };

  const fetchTenantRentData = async (tenantId) => {
    try {
      // Use v1Api to get tenant rent data
      const { v1Api } = await import('@/lib/api/v1-client');
      const data = await v1Api.specialized.getTenantRentData(tenantId);
      
      const payments = data.rentPayments || [];
      const unpaidPayments = payments.filter(p => {
        const status = (p.status || '').toLowerCase();
        return status !== 'paid' && status !== 'completed';
      });
      
      if (unpaidPayments.length === 0) {
        // No arrears - just set termination date
        const terminationDate = new Date();
        terminationDate.setDate(terminationDate.getDate() + 15);
        return {
          terminationDate: dayjs(terminationDate),
          notes: 'No outstanding rent balance'
        };
      }
      
      // Find first unpaid payment (arrears start date)
      const firstUnpaid = unpaidPayments.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )[0];
      
      // Calculate total arrears
      const totalArrears = unpaidPayments.reduce(
        (sum, p) => sum + (p.amount || 0),
        0
      );
      
      // Format dates
      const arrearsStartDate = firstUnpaid.dueDate 
        ? dayjs(firstUnpaid.dueDate).add(1, 'day') // Day after due date
        : null;
      
      const lastUnpaid = unpaidPayments.sort(
        (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      )[0];
      const arrearsEndDate = lastUnpaid.dueDate 
        ? dayjs(lastUnpaid.dueDate)
        : null;
      
      // Get landlord name from settings
      let landlordName = 'the landlord';
      try {
        const settingsRes = await fetch(
          '/api/settings',
          {},
          { operation: 'Fetch landlord settings', showUserMessage: false }
        );
        const settingsData = await settingsRes.json();
        if (settingsData.landlord?.firstName && settingsData.landlord?.lastName) {
          landlordName = `${settingsData.landlord.firstName} ${settingsData.landlord.lastName}`;
        }
      } catch (e) {
        // Error already handled by useUnifiedApi
      }
      
      // Format notes with detailed arrears information
      let notes = '';
      if (arrearsStartDate && arrearsEndDate) {
        notes = `Rent owed from ${arrearsStartDate.format('MMMM D, YYYY')} until ${arrearsEndDate.format('MMMM D, YYYY')} to the amount of $${totalArrears.toFixed(2)} to the landlord ${landlordName}.`;
      } else if (arrearsStartDate) {
        notes = `Rent owed from ${arrearsStartDate.format('MMMM D, YYYY')} to the amount of $${totalArrears.toFixed(2)} to the landlord ${landlordName}.`;
      } else {
        notes = `Total outstanding rent: $${totalArrears.toFixed(2)} to the landlord ${landlordName}.`;
      }
      
      // Set termination date (15 days from today)
      const terminationDate = new Date();
      terminationDate.setDate(terminationDate.getDate() + 15);
      
      return {
        arrearsStartDate,
        terminationDate: dayjs(terminationDate),
        notes,
        totalArrears,
        unpaidPaymentsCount: unpaidPayments.length
      };
    } catch (error) {
      // Error already handled by useUnifiedApi
    }
    
    // Fallback: just set termination date
    const terminationDate = new Date();
    terminationDate.setDate(terminationDate.getDate() + 15);
    
    return {
      terminationDate: dayjs(terminationDate),
      notes: 'Arrears calculated automatically from database'
    };
    
    // OLD CODE - keeping for reference but disabled
    /*
    try {
      // Fetch rent payments for this tenant
      console.log('📞 [Frontend] Calling API: /api/tenant-rent-data?tenantId=' + tenantId);
      const response = await fetch(`/api/tenant-rent-data?tenantId=${tenantId}`);
      console.log('📡 [Frontend] API response status:', response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ [Frontend] API response:', data);
        const payments = data.rentPayments || [];
        console.log('📋 [Frontend] Payments received:', payments.length);
        
        // Calculate arrears
        const now = new Date();
        console.log('📊 [Frontend] Payment statuses:', payments.map(p => ({ status: p.status, amount: p.amount })));
        const unpaidPayments = payments.filter(p => {
          if (!p.status) return true; // If no status, consider unpaid
          const status = String(p.status).toLowerCase();
          return status !== 'paid' && status !== 'completed';
        });
        console.log('💰 [Frontend] Unpaid payments:', unpaidPayments.length);
        
        // Find first unpaid payment
        let arrearsStartDate = null;
        let totalArrears = 0;
        let arrearsMonths = [];
        let arrearsBreakdown = [];
        
        if (unpaidPayments.length > 0) {
          // Sort by dueDate ascending
          unpaidPayments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
          
          const firstUnpaid = unpaidPayments[0];
          const firstDueDate = new Date(firstUnpaid.dueDate);
          
          // Arrears start the day after rent was due
          arrearsStartDate = new Date(firstDueDate);
          arrearsStartDate.setDate(arrearsStartDate.getDate() + 1);
          
          // Calculate total arrears, months, and detailed breakdown
          unpaidPayments.forEach(payment => {
            // RentPayment has 'amount' field, not 'amountDue'
            // Partial payments are in a separate table, for now treat unpaid as fully owing
            const amountOwing = payment.amount;
            totalArrears += amountOwing;
            arrearsMonths.push(formatDateMonthYear(payment.dueDate));
            
            // Add to breakdown for PDF
            // The rent period is typically the month the rent is FOR, not when it's due
            // For example, rent due Nov 1 is for the period Nov 1 - Nov 30
            const dueDate = dayjs(payment.dueDate);
            const periodStart = dueDate.startOf('month');
            const periodEnd = dueDate.endOf('month');
            
            arrearsBreakdown.push({
              fromDate: periodStart.format('YYYY-MM-DD'),
              toDate: periodEnd.format('YYYY-MM-DD'),
              rentCharged: payment.amount,
              rentPaid: 0  // Note: Partial payments are handled by the API endpoint
            });
          });
        }
      
      // Termination date is 15 days from today
      const terminationDate = new Date(now);
      terminationDate.setDate(terminationDate.getDate() + 15);
      
      // Generate notes
      let notes = '';
      if (unpaidPayments.length > 0) {
        notes = `Outstanding rent arrears of $${totalArrears.toFixed(2)} for the following period(s): ${arrearsMonths.join(', ')}. `;
        notes += `First unpaid rent was due ${formatDateDisplay(unpaidPayments[0].dueDate)}.`;
      }
      
      const rentData = {
        arrearsStartDate: arrearsStartDate ? dayjs(arrearsStartDate) : null,
        terminationDate: dayjs(terminationDate),
        totalArrears,
        arrearsMonths,
        arrearsBreakdown,
        notes,
        unpaidCount: unpaidPayments.length
      };
      
      console.log('💾 [Frontend] Setting tenantRentData:', {
        totalArrears: rentData.totalArrears,
        arrearsBreakdownLength: rentData.arrearsBreakdown?.length,
        unpaidCount: rentData.unpaidCount
      });
      
      setTenantRentData(rentData);
      
      return {
        arrearsStartDate: arrearsStartDate ? dayjs(arrearsStartDate) : null,
        terminationDate: dayjs(terminationDate),
        arrearsBreakdown,
        notes
      };
      }
    } catch (error) {
      console.error('[Forms] Error fetching rent data:', error);
    }
    return null;
    */
  };

  const handleTenantSelect = async (tenantId) => {
    setSelectedTenant(tenantId);
    
    // If we're selecting tenant for N4 form, fetch rent data
    if (selectedFormType === 'N4') {
      const rentData = await fetchTenantRentData(tenantId);
      
      // Store rent data in state for display
      setTenantRentData(rentData);
      
      // Auto-populate form fields
      if (rentData) {
        updateField('arrearsStartDate', rentData.arrearsStartDate);
        updateField('terminationDate', rentData.terminationDate);
        updateField('notes', rentData.notes);
      }
    } else {
      // Clear rent data for non-N4 forms
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
    resetForm();
  };

  const closeWizard = () => {
    setWizardOpen(false);
    setSelectedFormType(null);
    setSelectedProperty(null);
    setSelectedTenant(null);
    setSelectedLease(null);
    setGeneratedFormData(null);
    setTenantRentData(null);
    resetForm();
  };

  const handleGenerateForm = async () => {
    try {
      setGenerating(true);

      const customData = formData;
      
      // Arrears data is now calculated automatically on the backend
      // No need to pass it from frontend
      
      // Use v1Api for form generation (specialized endpoint)
      const { apiClient } = await import('@/lib/utils/api-client');
      const response = await apiClient('/api/v1/forms/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: selectedFormType,
          tenantId: selectedTenant,
          propertyId: selectedProperty,
          leaseId: selectedLease,
          customData
        }),
      });
      const data = await response.json();
      setGeneratedFormData(data.form);
      // No success message - will open review modal instead

    } catch (error) {
      // Error already handled by useUnifiedApi
    } finally {
      setGenerating(false);
    }
  };

  const handleFinalizeForm = async (formId) => {
    try {
      // Use v1Api client
      const { v1Api } = await import('@/lib/api/v1-client');
      await v1Api.generatedForms.update(formId, { status: 'finalized' });

      notify.success('Form finalized successfully');
      loadData();
      closeWizard();

    } catch (error) {
      // Error already handled by useUnifiedApi
    }
  };

  const handleViewForm = async (formRecord) => {
    try {
      // Use v1Api to download form PDF
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
    // Open signing flow for DocuSign-like experience
      setSigningForm(record);
      openSigningFlow();
  };

  const handleSendForm = async (record) => {
    try {
      notify.loading('Sending email to tenant...');
      
      // Use v1Api to send form
      const { v1Api } = await import('@/lib/api/v1-client');
      await v1Api.forms.sendForm(record.id);

      notify.success('Email sent successfully to tenant');
      
      // Update form status to 'sent' and refresh the list
      loadData();
    } catch (error) {
      notify.error(error.message || 'Failed to send email');
    }
  };

  const handleReviewPDF = async () => {
    try {
      // If form not generated yet, generate it first
      if (!generatedFormData) {
        setGenerating(true);
        
        const customData = formData;
        
        // Use v1Api to generate form
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
        
        // Close the form generation modal
        closeWizard();
        
        // Refresh forms list to show the new draft
        await loadData();
        
        // Open review modal with the generated form
        setSigningForm(data.form);
        openSigningFlow();
      } else {
        // Form already generated, close modal and open review
        closeWizard();
        setSigningForm(generatedFormData);
        openSigningFlow();
      }
    } catch (error) {
      // Error already handled by useUnifiedApi
      setGenerating(false);
    }
  };

  const handleSignComplete = () => {
    notify.success('Document signed and downloaded successfully');
    loadData(); // Refresh the forms list
  };


  // Table columns
  const baseColumns = [
    {
      title: 'Form Type',
      dataIndex: 'formType',
      key: 'formType',
      render: (type) => (
        <Badge color={
          type.startsWith('L') ? 'red' :
          type === 'N4' || type === 'N7' ? 'warning' :
          'info'
        }>
          {type}
        </Badge>
      ),
      filters: formTypes.map(ft => ({ text: ft.value, value: ft.value })),
      onFilter: (value, record) => record.formType === value,
      filterMultiple: false,
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
        const propertyName = record.propertyName || address || 'N/A';
        
        // Single unit: show property name only
        if (record.propertyUnitCount === 1) {
          return <span>{propertyName}</span>;
        }
        
        // Multiple units: show "Unit# - Property Name" (e.g., "1801 Aspen")
        const unitName = record.unitName || '';
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
        // Map form statuses to standard status names for renderStatus
        const statusMap = {
          draft: 'Draft',
          finalized: 'Completed',
          sent: 'In Progress',
          filed: 'Completed'
        };
        return renderStatus(statusMap[status] || status, {
          customColors: {
            'Draft': 'default',
            'Completed': 'success',
            'In Progress': 'processing',
            'Sent': 'processing',
            'Filed': 'purple'
          }
        });
      },
      filters: [
        { text: 'Draft', value: 'draft' },
        { text: 'Finalized', value: 'finalized' },
        { text: 'Sent', value: 'sent' },
        { text: 'Filed', value: 'filed' }
      ],
      onFilter: (value, record) => record.status === value,
      filterMultiple: false,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Tooltip content="View">
            <Button
              size="xs"
              color="gray"
              onClick={() => handleViewForm(record)}
            >
              <HiEye className="h-4 w-4" />
            </Button>
          </Tooltip>
          {record.status === 'draft' && (
            <>
              <Tooltip content="Edit">
                <Button
                  size="xs"
                  color="gray"
                  onClick={() => {
                    notify.info('Edit functionality coming soon');
                  }}
                >
                  <HiPencil className="h-4 w-4" />
                </Button>
              </Tooltip>
              <Tooltip content="Finalize">
                <Button
                  size="xs"
                  color="gray"
                  onClick={() => handleFinalizeForm(record.id)}
                >
                  <HiCheckCircle className="h-4 w-4" />
                </Button>
              </Tooltip>
            </>
          )}
          <Tooltip content="Download PDF">
            <Button
              size="xs"
              color="gray"
              onClick={() => handleDownloadPDF(record)}
            >
              <HiDownload className="h-4 w-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Send to Tenant">
            <Button
              size="xs"
              color="gray"
              onClick={() => handleSendForm(record)}
            >
              <HiPaperAirplane className="h-4 w-4" />
            </Button>
          </Tooltip>
          {/* Allow delete for drafts and finalized forms, but not for sent/filed forms */}
          {(record.status === 'draft' || record.status === 'finalized') && (
            <DeleteConfirmButton
              entityName={record.status === 'draft' ? 'draft' : 'form'}
              description={
                record.status === 'draft' 
                  ? "This draft will be permanently deleted. This action cannot be undone."
                  : "This finalized form will be permanently deleted. This action cannot be undone."
              }
              onConfirm={() => handleDeleteForm(record.id)}
              type="text"
              buttonProps={{ 
                title: record.status === 'draft' ? "Delete Draft" : "Delete Form"
              }}
              popconfirmProps={{
                okText: "Yes, Delete",
                cancelText: "Cancel"
              }}
            />
          )}
        </div>
      ),
      sorter: false, // Disable sorting for actions
      fixed: 'right'
    }
  ];

  // Configure columns with standard settings (sorting, center alignment, resizable)
  const columns = configureTableColumns(baseColumns);
  
  // Use resizable table hook
  const { tableProps } = useResizableTable(columns, {
    storageKey: 'landlord-forms-table',
    defaultSort: { field: 'generatedAt', order: 'descend' },
  });

  // No need for client-side filtering - table handles it via column filters

  const statsData = [
    {
      title: 'Total Forms',
      value: forms.length,
      prefix: <HiDocumentText className="h-5 w-5" />,
    },
    {
      title: 'Drafts',
      value: forms.filter(f => f.status === 'draft').length,
      prefix: <HiDocumentText className="h-5 w-5" />,
      valueStyle: { color: '#f59e0b' },
    },
    {
      title: 'Finalized',
      value: forms.filter(f => f.status === 'finalized').length,
      prefix: <HiCheckCircle className="h-5 w-5" />,
      valueStyle: { color: '#10b981' },
    },
    {
      title: 'Sent',
      value: forms.filter(f => f.status === 'sent').length,
      prefix: <HiPaperAirplane className="h-5 w-5" />,
      valueStyle: { color: '#3b82f6' },
    },
  ];

  return (
    <PageLayout
      headerTitle={<><HiDocumentText className="h-5 w-5 inline mr-2" /> Generated Forms</>}
      headerActions={[
        <Button
          key="generate"
          color="blue"
          onClick={openWizard}
        >
          <HiPlus className="h-4 w-4 mr-2" />
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
        ) : forms.length === 0 ? (
          <EmptyState
            icon={<HiDocumentText className="h-16 w-16 text-gray-300" />}
            title="No forms generated yet"
            description="Get started by generating your first form"
            action={
              <Button color="blue" onClick={openWizard}>
                <HiPlus className="h-4 w-4 mr-2" />
                Generate Your First Form
              </Button>
            }
          />
        ) : (
          <TableWrapper>
            <FlowbiteTable
              {...tableProps}
              data={forms}
              rowKey="id"
              pagination={{ pageSize: 20 }}
            />
          </TableWrapper>
        )}
      </Card>

      {/* Form Generation - Single Screen */}
      <Modal
        show={wizardOpen}
        onClose={closeWizard}
        size="4xl"
      >
        <Modal.Header>
          {selectedFormType ? `Generate ${selectedFormType}` : "Generate Legal Form"}
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            {/* Step 1: Select Form Type (Dropdown) */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Select Form Type:
              </label>
              <Select
                value={selectedFormType || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedFormType(value);
                  setSelectedProperty(null);
                  setSelectedTenant(null);
                  setTenantRentData(null);
                  resetForm();
                }}
              >
                <option value="">Choose the form you need</option>
                {formTypes.map(ft => (
                  <option key={ft.value} value={ft.value]
                    {ft.value} - {ft.label} {ft.urgent && '(Urgent)'}
                  </option>
                ))}
              </Select>
            </div>

          {/* Step 2: Property, Tenant, and Amount Owed - All in one row */}
          {selectedFormType && (
            <div>
              <div className={`grid gap-4 ${selectedFormType === 'N4' && selectedTenant && tenantRentData ? 'grid-cols-3' : selectedTenant ? 'grid-cols-2' : 'grid-cols-1'}`]
                {/* Property */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Property:
                  </label>
                  {selectedFormType === 'N4' ? (
                    eligibleProperties.length === 0 ? (
                      <Alert color="warning">
                        <div>
                          <div className="font-semibold">No properties with tenants who owe rent</div>
                          <div className="text-sm">N4 forms are only available for properties with tenants who have outstanding balances.</div>
                        </div>
                      </Alert>
                    ) : (
                      <Select
                        value={selectedProperty || ''}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value) : null;
                          setSelectedProperty(value);
                          setSelectedTenant(null);
                          setTenantRentData(null);
                          resetForm();
                        }}
                      >
                        <option value="">Select property</option>
                        {eligibleProperties.map(p => (
                          <option key={p.id} value={p.id]
                            {`${p.propertyName || p.addressLine1}${p.city ? `, ${p.city}` : ''}`}
                          </option>
                        ))}
                      </Select>
                    )
                  ) : (
                    properties.length === 0 ? (
                      <Alert color="info">
                        <div>
                          <div className="font-semibold">No properties found</div>
                          <div className="text-sm">You need to create properties first.</div>
                        </div>
                      </Alert>
                    ) : (
                      <Select
                        value={selectedProperty || ''}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value) : null;
                          setSelectedProperty(value);
                          setSelectedTenant(null);
                          setTenantRentData(null);
                          resetForm();
                        }}
                      >
                        <option value="">Select property</option>
                        {properties.map(p => (
                          <option key={p.id} value={p.id]
                            {`${p.propertyName || p.addressLine1}${p.city ? `, ${p.city}` : ''}`}
                          </option>
                        ))}
                      </Select>
                    )
                  )}
                </div>

                {/* Tenant */}
                {selectedProperty && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Select Tenant:
                    </label>
                    {selectedFormType === 'N4' ? (
                      (() => {
                        // Filter tenants by selected property
                        const filteredTenants = tenantsWithBalance.filter(t => 
                          t.property && t.property.id === selectedProperty
                        );
                        
                        if (filteredTenants.length === 0) {
                          return (
                            <Alert color="warning">
                              <div>
                                <div className="font-semibold">No tenants with outstanding balance for this property</div>
                                <div className="text-sm">This property has no tenants who owe rent.</div>
                              </div>
                            </Alert>
                          );
                        }
                        
                        return (
                          <Select
                            value={selectedTenant || ''}
                            onChange={(e) => {
                              const value = e.target.value ? parseInt(e.target.value) : null;
                              handleTenantSelect(value);
                            }}
                          >
                            <option value="">Search by tenant name</option>
                            {filteredTenants.map(t => (
                              <option key={t.id} value={t.id]
                                {formatTenantName(t)}
                              </option>
                            ))}
                          </Select>
                        );
                      })()
                    ) : (
                      tenants.length === 0 ? (
                        <Alert color="info">
                          <div>
                            <div className="font-semibold">No tenants found</div>
                            <div className="text-sm">You need to create tenants first.</div>
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
                          onChange={(e) => {
                            const value = e.target.value ? parseInt(e.target.value) : null;
                            handleTenantSelect(value);
                          }}
                        >
                          <option value="">Search by tenant name or email</option>
                          {tenants.map(t => (
                            <option key={t.id} value={t.id]
                              {formatTenantName(t, tenants)}
                            </option>
                          ))}
                        </Select>
                      )
                    )}
                  </div>
                )}
                
                {/* Amount Owed - Show after tenant selection on same line */}
                {selectedTenant && tenantRentData && selectedFormType === 'N4' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Amount Owed:
                    </label>
                    <TextInput
                      value={`$${formatAmount(tenantRentData.totalArrears || 0)}`}
                      readOnly
                      className="bg-gray-50 font-semibold"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Details - Always visible */}
          {selectedFormType && selectedProperty && selectedTenant && (
            <div>
              {selectedFormType === 'N4' && tenantRentData && tenantRentData.unpaidCount > 0 && (
                <Alert color="warning" className="mb-4">
                  <div>
                    <div className="font-semibold">Rent Arrears Detected</div>
                    <div className="text-sm font-semibold">Total Arrears: ${formatAmount(tenantRentData.totalArrears || 0)}</div>
                  </div>
                </Alert>
              )}
              
              <div className="space-y-4">
                {selectedFormType === 'N4' && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormDatePicker
                      label="Arrears Start Date"
                      value={formData.arrearsStartDate}
                      onChange={(date) => updateField('arrearsStartDate', date)}
                      tooltip="Day after rent was first due and unpaid"
                    />
                    <FormDatePicker
                      label="Termination Date"
                      value={formData.terminationDate}
                      onChange={(date) => updateField('terminationDate', date)}
                      tooltip="15 days from today (standard notice period)"
                    />
                  </div>
                )}
                
                {selectedFormType === 'N5' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Misconduct Details <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        rows={4}
                        placeholder="Describe the misconduct..."
                        value={formData.misconductDetails}
                        onChange={(e) => updateField('misconductDetails', e.target.value)}
                        required
                      />
                    </div>
                    <FormDatePicker
                      label="Incident Date"
                      value={formData.incidentDate}
                      onChange={(date) => updateField('incidentDate', date)}
                    />
                  </>
                )}
                
                {selectedFormType === 'N12' && (
                  <>
                    <FormTextInput
                      label="Person Moving In"
                      value={formData.personMovingIn}
                      onChange={(e) => updateField('personMovingIn', e.target.value)}
                      placeholder="e.g., Myself, My son"
                    />
                    <FormSelect
                      label="Relationship to Landlord"
                      value={formData.relationshipToLandlord}
                      onChange={(e) => updateField('relationshipToLandlord', e.target.value)}
                      options={
                        { value: 'Self', label: 'Self' },
                        { value: 'Spouse', label: 'Spouse' },
                        { value: 'Child', label: 'Child' },
                        { value: 'Parent', label: 'Parent' }
                      }
                    />
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Additional Notes
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="Any additional information..."
                    value={formData.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6">
            <Button color="gray" onClick={closeWizard]
              Cancel
            </Button>
            {selectedFormType && selectedProperty && selectedTenant && (
              <Button
                color="blue"
                onClick={handleReviewPDF}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <HiEye className="h-4 w-4 mr-2" />
                    Review PDF
                  </>
                )}
              </Button>
            )}
          </div>
        </Modal.Body>
      </Modal>

      {/* PDF Viewer Modal */}
      <PDFViewerModal
        open={pdfViewerOpen}
        title={pdfViewerTitle}
        pdfUrl={pdfViewerUrl}
        onClose={() => {
          setPdfViewerOpen(false);
          // Clean up blob URL to prevent memory leaks
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

      {/* Signing Flow Modal - DocuSign-like Experience */}
      <SigningFlow
        open={signingFlowOpen}
        onClose={() => {
          closeSigningFlow();
          setSigningForm(null);
          // Refresh forms list when closing signing flow
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
