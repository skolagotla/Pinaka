"use client";

import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { 
  Table, Tag, Input, Select, Space, Button, Tooltip, Tabs, Badge,
  Empty, Spin, Alert, Card
} from 'antd';
import {
  EyeOutlined,
  DownloadOutlined,
  GlobalOutlined,
  FileTextOutlined,
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  FileSearchOutlined,
  StarOutlined,
  FireOutlined,
} from '@ant-design/icons';
import TableActionButton from './TableActionButton';
import dynamic from 'next/dynamic';
import { getRegionOptions, getRegionLabel } from '@/lib/constants/regions';
import { useDebounce } from '@/lib/hooks';

// Lazy load PDFViewerModal to reduce initial bundle size
const PDFViewerModal = dynamic(
  () => import('@/components/shared/PDFViewerModal'),
  {
    ssr: false,
    loading: () => null,
  }
);

const { Search } = Input;

const COUNTRIES = [
  { value: 'CA', label: 'Canada' },
  { value: 'US', label: 'United States' },
];

const CATEGORIES = [
  { value: 'Rent', label: 'Rent' },
  { value: 'Eviction', label: 'Eviction' },
  { value: 'Application', label: 'Application' },
  { value: 'Agreement', label: 'Agreement' },
  { value: 'Notice Response', label: 'Notice Response' },
  { value: 'Tenant Rights', label: 'Tenant Rights' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Other', label: 'Other' },
];

// Commonly used forms by role - Quick access
const COMMONLY_USED_FORMS = {
  landlord: ['N4', 'N5', 'N7', 'L1', 'L2', 'N12'],
  tenant: ['T1', 'T2', 'T6', 'T5', 'T3'],
  admin: ['N4', 'N5', 'L1', 'L2', 'T1', 'T2'],
  pmc: ['N4', 'N5', 'L1', 'L2', 'T1', 'T2'],
};

/**
 * LTB Documents Grid Component
 * Reusable component for displaying LTB documents with filtering and role-based access
 * 
 * @param {string} userRole - User role: 'admin', 'pmc', 'landlord', 'tenant'
 * @param {boolean} showFilters - Whether to show filter bar (default: true)
 * @param {boolean} showTitle - Whether to show title (default: false)
 * @param {string} externalSearchQuery - External search query from parent component (optional)
 */
function LTBDocumentsGrid({ 
  userRole = 'admin',
  showFilters = true,
  showTitle = false,
  externalSearchQuery = undefined
}) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState('CA');
  const [selectedProvince, setSelectedProvince] = useState('ON');

  // Handle country change and auto-set default province
  const handleCountryChange = useCallback((country) => {
    setSelectedCountry(country);
    // Auto-set default province: CA -> ON, US -> NJ
    const defaultProvince = country === 'CA' ? 'ON' : country === 'US' ? 'NJ' : 'ON';
    setSelectedProvince(defaultProvince);
  }, []);
  const [selectedCategory, setSelectedCategory] = useState(undefined);
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // Default to 'all' for all roles
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
  });

  // Check if Ontario is selected
  const isOntarioSelected = selectedCountry === 'CA' && selectedProvince === 'ON';

  // Sync external search query to internal state when it changes
  // Always sync, even if empty string, to properly clear search
  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setInternalSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  // Use external search query if provided, otherwise use internal
  // Always use external if it's defined (even if empty string)
  const searchQuery = externalSearchQuery !== undefined 
    ? externalSearchQuery 
    : internalSearchQuery;

  // Debounce the search query for API calls (150ms for responsive search)
  const debouncedSearchQuery = useDebounce(searchQuery, 150);

  // Removed role-based filtering - all roles see all documents
  // Users can filter using the tabs (All, Landlord, Tenant, Both)

  // Fetch documents
  const fetchDocuments = async (page = 1) => {
    // Only fetch if Ontario is selected
    if (!isOntarioSelected) {
      setDocuments([]);
      setPagination(prev => ({
        ...prev,
        current: 1,
        total: 0,
      }));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        country: selectedCountry,
        province: selectedProvince,
        page: page.toString(),
        limit: pagination.pageSize.toString(),
      });
      
      if (selectedCategory) params.append('category', selectedCategory);
      
      // Apply tab-based filtering (user-selected, not role-based)
      if (activeTab !== 'all') {
        params.append('audience', activeTab);
      }
      
      // Sanitize search query to prevent injection
      if (debouncedSearchQuery) {
        const sanitized = debouncedSearchQuery.trim().slice(0, 100); // Limit length and trim
        if (sanitized) {
          params.append('search', sanitized);
        }
      }

      const { apiClient } = await import('@/lib/utils/api-client');
      const response = await apiClient(`/api/v1/ltb-documents?${params.toString()}`, {
        method: 'GET',
      });

      if (response && response.ok) {
        const data = await response.json();
        if (data.success) {
          // Show all documents - no role-based filtering
          const filteredDocs = data.data || [];
          
          setDocuments(filteredDocs);
          setPagination(prev => ({
            ...prev,
            current: page,
            total: filteredDocs.length,
          }));
        } else {
          setError(data.error || 'Failed to fetch documents');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Failed to fetch documents');
      }
    } catch (err) {
      console.error('[LTBDocumentsGrid] Error fetching documents:', err);
      setError(err.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  // Set mounted flag to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch on mount and when filters change
  useEffect(() => {
    if (mounted) {
      fetchDocuments(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, selectedProvince, selectedCategory, activeTab, debouncedSearchQuery, isOntarioSelected, mounted]);

  // Handle view document - memoized with useCallback
  const handleViewDocument = useCallback((doc) => {
    const proxyUrl = `/api/v1/ltb-documents/${doc.formNumber}/view`;
    setSelectedDocument({ ...doc, pdfUrl: proxyUrl });
    setPdfViewerOpen(true);
  }, []);

  // Handle download document - memoized with useCallback
  const handleDownloadDocument = useCallback(async (doc) => {
    try {
      const proxyUrl = `/api/v1/ltb-documents/${doc.formNumber}/view`;
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(proxyUrl, {
        credentials: 'include',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Use global document object (not parameter) to avoid shadowing bug
      const anchor = globalThis.document.createElement('a');
      anchor.href = url;
      anchor.download = `${doc.formNumber}.pdf`;
      globalThis.document.body.appendChild(anchor);
      anchor.click();
      globalThis.document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[LTBDocumentsGrid] Error downloading document:', err);
      // Fallback to opening in new tab if download fails
      if (err.name !== 'AbortError') {
        window.open(doc.pdfUrl, '_blank', 'noopener,noreferrer');
      }
    }
  }, []);

  // Handle open LTB portal - memoized with useCallback
  const handleOpenLTBPortal = useCallback((doc) => {
    window.open(doc.pdfUrl, '_blank', 'noopener,noreferrer');
  }, []);

  // Handle view instructions - memoized with useCallback
  const handleViewInstructions = useCallback((doc) => {
    if (doc.instructionUrl) {
      window.open(doc.instructionUrl, '_blank', 'noopener,noreferrer');
    }
  }, []);

  // Get tab counts
  const tabCounts = useMemo(() => {
    const all = documents.length;
    const landlord = documents.filter(d => d.audience === 'landlord').length;
    const tenant = documents.filter(d => d.audience === 'tenant').length;
    const both = documents.filter(d => d.audience === 'both').length;
    return { all, landlord, tenant, both };
  }, [documents]);


  // Check if any filters are active
  const hasActiveFilters = selectedCategory || searchQuery;

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSelectedCategory(undefined);
    setInternalSearchQuery('');
  }, []);

  // Determine which tabs to show - show for all roles for consistency
  const tabItems = useMemo(() => {
    // All roles see the same tabs for consistency
    return [
      {
        key: 'all',
        label: (
          <span>
            All <Badge count={tabCounts.all} style={{ backgroundColor: '#722ed1' }} />
          </span>
        ),
      },
      {
        key: 'landlord',
        label: (
          <span>
            Landlord <Badge count={tabCounts.landlord} style={{ backgroundColor: '#1890ff' }} />
          </span>
        ),
      },
      {
        key: 'tenant',
        label: (
          <span>
            Tenant <Badge count={tabCounts.tenant} style={{ backgroundColor: '#52c41a' }} />
          </span>
        ),
      },
      {
        key: 'both',
        label: (
          <span>
            Both <Badge count={tabCounts.both} style={{ backgroundColor: '#fa8c16' }} />
          </span>
        ),
      },
    ];
  }, [tabCounts]);

  // Table columns - memoized to prevent recreation on every render
  const columns = useMemo(() => [
    {
      title: 'Form',
      dataIndex: 'formNumber',
      key: 'formNumber',
      width: 120,
      render: (formNumber, record) => {
        let tagColor = 'cyan';
        if (record.audience === 'landlord') tagColor = 'blue';
        if (record.audience === 'tenant') tagColor = 'green';
        if (record.audience === 'both') tagColor = 'orange';
        
        const tooltipText = 
          record.audience === 'landlord' ? 'Landlord' :
          record.audience === 'tenant' ? 'Tenant' :
          'Both';
        
        const isCommonlyUsed = COMMONLY_USED_FORMS[userRole]?.includes(formNumber) || 
                               COMMONLY_USED_FORMS.admin?.includes(formNumber);
        const isUrgent = record.category === 'Eviction' && (formNumber === 'N4' || formNumber === 'N7');
        
        return (
          <Space size={4}>
            <Tooltip title={tooltipText}>
              <Tag 
                color={tagColor} 
                style={{ 
                  fontWeight: 'bold', 
                  fontSize: '13px',
                  border: isUrgent ? '1px solid #ff4d4f' : undefined,
                }}
              >
                {formNumber}
              </Tag>
            </Tooltip>
            {isCommonlyUsed && (
              <Tooltip title="Commonly used form">
                <StarOutlined style={{ color: '#faad14', fontSize: '12px' }} />
              </Tooltip>
            )}
            {isUrgent && (
              <Tooltip title="Urgent - Use when immediate action is needed">
                <FireOutlined style={{ color: '#ff4d4f', fontSize: '12px' }} />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Form Name',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (name) => (
        <div style={{ fontWeight: 500, fontSize: '14px' }}>
          {name}
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      render: (description, record) => (
        <div style={{ fontSize: '13px', color: '#595959', lineHeight: '1.5' }}>
          {description || `This form is used for ${record.category.toLowerCase()} related matters.`}
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      filters: CATEGORIES.filter(cat => cat.value !== undefined).map(cat => ({
        text: cat.label,
        value: cat.value,
      })),
      onFilter: (value, record) => record.category === value,
      render: (category) => {
        const categoryColors = {
          'Rent': 'blue',
          'Eviction': 'red',
          'Application': 'green',
          'Agreement': 'purple',
          'Notice Response': 'orange',
          'Tenant Rights': 'cyan',
          'Maintenance': 'geekblue',
          'Other': 'default',
        };
        const categoryIcons = {
          'Rent': '💰',
          'Eviction': '⚖️',
          'Application': '📋',
          'Agreement': '📝',
          'Notice Response': '📨',
          'Tenant Rights': '🛡️',
          'Maintenance': '🔧',
          'Other': '📄',
        };
        return (
          <Tag 
            color={categoryColors[category] || 'default'}
            style={{ 
              borderRadius: '4px',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>{categoryIcons[category] || '📄'}</span>
            <span>{category}</span>
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <TableActionButton
            icon={<EyeOutlined />}
            onClick={() => handleViewDocument(record)}
            tooltip="View PDF"
            actionType="view"
          />
          <TableActionButton
            icon={<GlobalOutlined />}
            onClick={() => handleOpenLTBPortal(record)}
            tooltip="Open on LTB Website"
            actionType="website"
          />
          <TableActionButton
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadDocument(record)}
            tooltip="Download PDF"
            actionType="download"
          />
          {record.instructionUrl && (
            <TableActionButton
              icon={<FileTextOutlined />}
              onClick={() => handleViewInstructions(record)}
              tooltip="View Instructions"
              actionType="instructions"
            />
          )}
        </Space>
      ),
    },
  ], [handleViewDocument, handleOpenLTBPortal, handleDownloadDocument, handleViewInstructions]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px' }}>
      {showTitle && (
        <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#262626' }}>LTB Legal Documents</h2>
        </div>
      )}
      
      {showFilters && (
        <div style={{ 
          margin: '0 0 24px 0',
          padding: '18px 24px',
          backgroundColor: '#ffffff',
          border: '1px solid #e8e8e8',
          borderRadius: '8px',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
        }}>
          <div style={{ 
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            {/* Left: Filters */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              alignItems: 'center', 
              flexWrap: 'wrap',
              flex: '1 1 auto',
              minWidth: 0,
            }}>
              <Select
                value={selectedCountry}
                onChange={handleCountryChange}
                options={COUNTRIES}
                style={{ width: 130, minWidth: 130 }}
                size="middle"
                bordered={true}
              />
              
              <Select
                value={selectedProvince}
                onChange={setSelectedProvince}
                options={getRegionOptions(selectedCountry)}
                placeholder={`Select ${getRegionLabel(selectedCountry)}`}
                style={{ width: 170, minWidth: 170 }}
                size="middle"
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ minWidth: 250 }}
                bordered={true}
              />
              
              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={[{ value: undefined, label: 'All Categories' }, ...CATEGORIES]}
                placeholder="Category"
                style={{ width: 150, minWidth: 150 }}
                size="middle"
                allowClear
                bordered={true}
              />

              {hasActiveFilters && (
                <Button
                  type="text"
                  icon={<ClearOutlined />}
                  onClick={clearFilters}
                  size="small"
                  style={{ 
                    color: '#8c8c8c', 
                    fontSize: '12px',
                    height: '32px',
                    padding: '0 8px',
                  }}
                >
                  Clear
                </Button>
              )}
            </div>

            {/* Center: Tabs - Show for all roles for consistency */}
            {mounted && tabItems.length > 0 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                flex: '0 0 auto',
                margin: '0 16px',
              }}>
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  items={tabItems}
                  size="small"
                  style={{ margin: 0 }}
                />
              </div>
            )}

            {/* Right: Search */}
            <div style={{ 
              flexShrink: 0, 
              minWidth: 300,
              flex: '0 0 auto',
            }}>
              <Search
                placeholder="Search forms..."
                value={externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  if (externalSearchQuery === undefined) {
                    setInternalSearchQuery(value);
                  }
                  // Search will trigger automatically via useEffect when debouncedSearchQuery changes
                }}
                onSearch={() => fetchDocuments(1)}
                allowClear
                size="middle"
                style={{ width: '100%', maxWidth: 340 }}
                onClear={() => {
                  if (externalSearchQuery === undefined) {
                    setInternalSearchQuery('');
                  }
                  // Clear will trigger automatically via useEffect when debouncedSearchQuery changes
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div style={{ marginBottom: 16 }}>
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ borderRadius: '6px' }}
          />
        </div>
      )}


      {/* Table */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {!isOntarioSelected ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: 400,
            flexDirection: 'column',
            padding: '40px 20px',
          }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 500, color: '#262626', marginBottom: 8 }}>
                    Coming Soon: Documents for other regions
                  </div>
                  <div style={{ fontSize: '14px', color: '#8c8c8c' }}>
                    Please select Canada and Ontario to view available documents.
                  </div>
                </div>
              }
            />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={documents}
            loading={loading}
            rowKey="id"
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} forms`,
              onChange: (page) => fetchDocuments(page),
              onShowSizeChange: (current, size) => {
                setPagination(prev => ({ ...prev, pageSize: size }));
                fetchDocuments(1);
              },
              style: { marginTop: 16 },
            }}
            scroll={{ x: 'max-content' }}
            size="middle"
            style={{ backgroundColor: '#fff' }}
            onRow={(record) => ({
              onMouseEnter: (e) => {
                e.currentTarget.style.backgroundColor = '#fafafa';
                e.currentTarget.style.cursor = 'pointer';
              },
              onMouseLeave: (e) => {
                e.currentTarget.style.backgroundColor = '';
              },
            })}
            locale={{
              emptyText: (
                <Empty
                  description={
                    <div style={{ textAlign: 'center' }}>
                      <FileSearchOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: 16 }} />
                      <div style={{ fontSize: '16px', fontWeight: 500, color: '#262626', marginBottom: 8 }}>
                        No forms found
                      </div>
                      <div style={{ fontSize: '14px', color: '#8c8c8c' }}>
                        {searchQuery ? 'Try adjusting your search or filters' : 'No documents match your current filters'}
                      </div>
                    </div>
                  }
                />
              ),
            }}
          />
        )}
      </div>

      {/* PDF Viewer Modal */}
      {selectedDocument && (
        <PDFViewerModal
          open={pdfViewerOpen}
          title={`${selectedDocument.formNumber} - ${selectedDocument.name}`}
          pdfUrl={selectedDocument.pdfUrl}
          onClose={() => {
            setPdfViewerOpen(false);
            setSelectedDocument(null);
          }}
          onDownload={() => handleDownloadDocument(selectedDocument)}
          downloadFileName={`${selectedDocument.formNumber}.pdf`}
        />
      )}
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(LTBDocumentsGrid, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.userRole === nextProps.userRole &&
    prevProps.showFilters === nextProps.showFilters &&
    prevProps.showTitle === nextProps.showTitle
  );
});

