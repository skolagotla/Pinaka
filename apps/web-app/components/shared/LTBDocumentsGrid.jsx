"use client";

import { useState, useEffect, useMemo } from 'react';
import { 
  Table, Tag, Input, Select, Space, Button, Tooltip, Tabs, Badge,
  Empty, Spin, Alert
} from 'antd';
import {
  EyeOutlined,
  DownloadOutlined,
  GlobalOutlined,
  FileTextOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import PDFViewerModal from '@/components/shared/PDFViewerModal';
import { CANADIAN_PROVINCES, US_STATES, getRegionOptions, getRegionLabel } from '@/lib/constants/regions';

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

/**
 * LTB Documents Grid Component
 * Reusable component for displaying LTB documents with filtering and role-based access
 * 
 * @param {string} userRole - User role: 'admin', 'pmc', 'landlord', 'tenant'
 * @param {boolean} showFilters - Whether to show filter bar (default: true)
 * @param {boolean} showTitle - Whether to show title (default: false)
 */
export default function LTBDocumentsGrid({ 
  userRole = 'admin',
  showFilters = true,
  showTitle = false 
}) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState('CA');
  const [selectedProvince, setSelectedProvince] = useState('ON');
  const [selectedCategory, setSelectedCategory] = useState(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(() => {
    // Set default tab based on role
    if (userRole === 'landlord') return 'landlord';
    if (userRole === 'tenant') return 'tenant';
    return 'all';
  });
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

  // Determine which documents to show based on role
  const getAudienceFilter = () => {
    if (userRole === 'landlord') {
      // Landlords see landlord + both documents
      return ['landlord', 'both'];
    } else if (userRole === 'tenant') {
      // Tenants see tenant + both documents
      return ['tenant', 'both'];
    } else {
      // Admin and PMC see all documents
      return null; // null means show all
    }
  };

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
      
      // Apply role-based filtering
      const audienceFilter = getAudienceFilter();
      if (audienceFilter) {
        // For landlord/tenant, we need to filter on client side since API doesn't support multiple audiences
        // We'll fetch all and filter client-side
      } else if (activeTab !== 'all') {
        params.append('audience', activeTab);
      }
      
      if (searchQuery) params.append('search', searchQuery);

      const { apiClient } = await import('@/lib/utils/api-client');
      const response = await apiClient(`/api/v1/ltb-documents?${params.toString()}`, {
        method: 'GET',
      });

      if (response && response.ok) {
        const data = await response.json();
        if (data.success) {
          let filteredDocs = data.data || [];
          
          // Apply role-based filtering on client side
          if (audienceFilter) {
            filteredDocs = filteredDocs.filter(doc => 
              audienceFilter.includes(doc.audience)
            );
          }
          
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
  }, [selectedCountry, selectedProvince, selectedCategory, activeTab, searchQuery, isOntarioSelected, mounted]);

  // Handle view document
  const handleViewDocument = (document) => {
    const proxyUrl = `/api/v1/ltb-documents/${document.formNumber}/view`;
    setSelectedDocument({ ...document, pdfUrl: proxyUrl });
    setPdfViewerOpen(true);
  };

  // Handle download document
  const handleDownloadDocument = async (document) => {
    try {
      const proxyUrl = `/api/v1/ltb-documents/${document.formNumber}/view`;
      const response = await fetch(proxyUrl, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to download');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${document.formNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[LTBDocumentsGrid] Error downloading document:', err);
      window.open(document.pdfUrl, '_blank');
    }
  };

  // Handle open LTB portal
  const handleOpenLTBPortal = (document) => {
    window.open(document.pdfUrl, '_blank', 'noopener,noreferrer');
  };

  // Handle view instructions
  const handleViewInstructions = (document) => {
    if (document.instructionUrl) {
      window.open(document.instructionUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Get tab counts
  const tabCounts = useMemo(() => {
    const all = documents.length;
    const landlord = documents.filter(d => d.audience === 'landlord').length;
    const tenant = documents.filter(d => d.audience === 'tenant').length;
    const both = documents.filter(d => d.audience === 'both').length;
    return { all, landlord, tenant, both };
  }, [documents]);

  // Determine which tabs to show based on role
  const getTabItems = () => {
    if (userRole === 'admin' || userRole === 'pmc') {
      // Admin and PMC see all tabs
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
    } else {
      // Landlord and Tenant don't see tabs (they're auto-filtered)
      return [];
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Form',
      dataIndex: 'formNumber',
      key: 'formNumber',
      width: 100,
      render: (formNumber, record) => {
        let tagColor = 'cyan';
        if (record.audience === 'landlord') tagColor = 'blue';
        if (record.audience === 'tenant') tagColor = 'green';
        if (record.audience === 'both') tagColor = 'orange';
        
        const tooltipText = 
          record.audience === 'landlord' ? 'Landlord' :
          record.audience === 'tenant' ? 'Tenant' :
          'Both';
        
        return (
          <Tooltip title={tooltipText}>
            <Tag color={tagColor} style={{ fontWeight: 'bold', fontSize: '13px' }}>
              {formNumber}
            </Tag>
          </Tooltip>
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
      render: (category) => (
        <Tag color="orange">{category}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDocument(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Open on LTB Website">
            <Button
              type="text"
              icon={<GlobalOutlined />}
              onClick={() => handleOpenLTBPortal(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadDocument(record)}
              size="small"
            />
          </Tooltip>
          {record.instructionUrl && (
            <Tooltip title="Instructions">
              <Button
                type="text"
                icon={<FileTextOutlined />}
                onClick={() => handleViewInstructions(record)}
                size="small"
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = getTabItems();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {showTitle && (
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>LTB Legal Documents</h2>
        </div>
      )}
      
      {showFilters && (
        <div style={{ 
          padding: '12px 24px', 
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'nowrap',
          width: '100%',
        }}>
          <span style={{ fontWeight: 500, marginRight: 8, whiteSpace: 'nowrap', flexShrink: 0 }}>Filters:</span>
          <Select
            value={selectedCountry}
            onChange={setSelectedCountry}
            options={COUNTRIES}
            style={{ width: 120, flexShrink: 0 }}
            size="small"
          />
          <Select
            value={selectedProvince}
            onChange={setSelectedProvince}
            options={getRegionOptions(selectedCountry)}
            placeholder={`Select ${getRegionLabel(selectedCountry)}`}
            style={{ width: 200, flexShrink: 0 }}
            size="small"
            dropdownMatchSelectWidth={false}
            dropdownStyle={{ minWidth: 250 }}
          />
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={[{ value: undefined, label: 'All Categories' }, ...CATEGORIES]}
            placeholder="Category"
            style={{ width: 150, flexShrink: 0 }}
            size="small"
            allowClear
          />
          {/* Tabs - Only for admin/PMC, and only render on client to prevent hydration mismatch */}
          {mounted && (userRole === 'admin' || userRole === 'pmc') && tabItems.length > 0 && (
            <div style={{ 
              flex: '1 1 auto', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minWidth: 0 
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
          <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'flex-end', minWidth: 0 }}>
            <Search
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={() => fetchDocuments(1)}
              style={{ width: '100%', maxWidth: 400 }}
              size="small"
              allowClear
            />
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div style={{ padding: '16px 24px' }}>
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
          />
        </div>
      )}

      {/* Table */}
      <div style={{ padding: '0 24px 24px 24px', flex: 1, overflow: 'auto' }}>
        {!isOntarioSelected ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: 400,
            flexDirection: 'column',
          }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Coming Soon: Documents for other regions"
            />
            <p style={{ marginTop: 16, color: '#8c8c8c' }}>
              Please select Canada and Ontario to view available documents.
            </p>
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
              showTotal: (total) => `Total ${total} forms`,
              onChange: (page) => fetchDocuments(page),
              onShowSizeChange: (current, size) => {
                setPagination(prev => ({ ...prev, pageSize: size }));
                fetchDocuments(1);
              },
            }}
            scroll={{ x: 'max-content' }}
            locale={{
              emptyText: (
                <Empty
                  description="No forms found"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
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

