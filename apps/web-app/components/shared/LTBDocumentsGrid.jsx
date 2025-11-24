"use client";

import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { 
  Table, Badge, TextInput, Select, Button, Tooltip, Tabs, 
  Spinner, Alert, Card
} from 'flowbite-react';
import { Empty } from '@/components/shared';
import {
  HiEye,
  HiDownload,
  HiGlobeAlt,
  HiDocumentText,
  HiSearch,
  HiFilter,
  HiX,
  HiDocumentSearch,
  HiStar,
  HiFire,
} from 'react-icons/hi';
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
  const [activeTab, setActiveTab] = useState(0); // Use index for Flowbite Tabs
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
  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setInternalSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  // Use external search query if provided, otherwise use internal
  const searchQuery = externalSearchQuery !== undefined 
    ? externalSearchQuery 
    : internalSearchQuery;

  // Debounce the search query for API calls (150ms for responsive search)
  const debouncedSearchQuery = useDebounce(searchQuery, 150);

  // Map tab index to tab key
  const tabKeys = ['all', 'landlord', 'tenant', 'both'];
  const activeTabKey = tabKeys[activeTab] || 'all';

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
      
      // Apply tab-based filtering
      if (activeTabKey !== 'all') {
        params.append('audience', activeTabKey);
      }
      
      // Sanitize search query
      if (debouncedSearchQuery) {
        const sanitized = debouncedSearchQuery.trim().slice(0, 100);
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
  }, [selectedCountry, selectedProvince, selectedCategory, activeTabKey, debouncedSearchQuery, isOntarioSelected, mounted]);

  // Handle view document
  const handleViewDocument = useCallback((doc) => {
    const proxyUrl = `/api/v1/ltb-documents/${doc.formNumber}/view`;
    setSelectedDocument({ ...doc, pdfUrl: proxyUrl });
    setPdfViewerOpen(true);
  }, []);

  // Handle download document
  const handleDownloadDocument = useCallback(async (doc) => {
    try {
      const proxyUrl = `/api/v1/ltb-documents/${doc.formNumber}/view`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
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
      
      const anchor = globalThis.document.createElement('a');
      anchor.href = url;
      anchor.download = `${doc.formNumber}.pdf`;
      globalThis.document.body.appendChild(anchor);
      anchor.click();
      globalThis.document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[LTBDocumentsGrid] Error downloading document:', err);
      if (err.name !== 'AbortError') {
        window.open(doc.pdfUrl, '_blank', 'noopener,noreferrer');
      }
    }
  }, []);

  // Handle open LTB portal
  const handleOpenLTBPortal = useCallback((doc) => {
    window.open(doc.pdfUrl, '_blank', 'noopener,noreferrer');
  }, []);

  // Handle view instructions
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

  // Table columns
  const columns = useMemo(() => [
    {
      title: 'Form',
      dataIndex: 'formNumber',
      key: 'formNumber',
      render: (formNumber, record) => {
        let tagColor = 'cyan';
        if (record.audience === 'landlord') tagColor = 'blue';
        if (record.audience === 'tenant') tagColor = 'green';
        if (record.audience === 'both') tagColor = 'warning';
        
        const tooltipText = 
          record.audience === 'landlord' ? 'Landlord' :
          record.audience === 'tenant' ? 'Tenant' :
          'Both';
        
        const isCommonlyUsed = COMMONLY_USED_FORMS[userRole]?.includes(formNumber) || 
                               COMMONLY_USED_FORMS.admin?.includes(formNumber);
        const isUrgent = record.category === 'Eviction' && (formNumber === 'N4' || formNumber === 'N7');
        
        return (
          <div className="flex items-center gap-1">
            <Tooltip content={tooltipText}>
              <Badge 
                color={tagColor}
                className={`font-bold text-sm ${isUrgent ? 'border border-red-500' : ''}`}
              >
                {formNumber}
              </Badge>
            </Tooltip>
            {isCommonlyUsed && (
              <Tooltip content="Commonly used form">
                <HiStar className="h-3 w-3 text-yellow-500" />
              </Tooltip>
            )}
            {isUrgent && (
              <Tooltip content="Urgent - Use when immediate action is needed">
                <HiFire className="h-3 w-3 text-red-500" />
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: 'Form Name',
      dataIndex: 'name',
      key: 'name',
      render: (name) => (
        <div className="font-medium text-sm">
          {name}
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description, record) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {description || `This form is used for ${record.category.toLowerCase()} related matters.`}
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => {
        const categoryColors = {
          'Rent': 'blue',
          'Eviction': 'red',
          'Application': 'green',
          'Agreement': 'purple',
          'Notice Response': 'warning',
          'Tenant Rights': 'cyan',
          'Maintenance': 'info',
          'Other': 'gray',
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
          <Badge 
            color={categoryColors[category] || 'gray'}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium"
          >
            <span>{categoryIcons[category] || '📄'}</span>
            <span>{category}</span>
          </Badge>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <TableActionButton
            icon={<HiEye />}
            onClick={() => handleViewDocument(record)}
            tooltip="View PDF"
            actionType="view"
          />
          <TableActionButton
            icon={<HiGlobeAlt />}
            onClick={() => handleOpenLTBPortal(record)}
            tooltip="Open on LTB Website"
            actionType="website"
          />
          <TableActionButton
            icon={<HiDownload />}
            onClick={() => handleDownloadDocument(record)}
            tooltip="Download PDF"
            actionType="download"
          />
          {record.instructionUrl && (
            <TableActionButton
              icon={<HiDocumentText />}
              onClick={() => handleViewInstructions(record)}
              tooltip="View Instructions"
              actionType="instructions"
            />
          )}
        </div>
      ),
    },
  ], [handleViewDocument, handleOpenLTBPortal, handleDownloadDocument, handleViewInstructions, userRole]);

  return (
    <div className="flex flex-col h-full p-5">
      {showTitle && (
        <div className="mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="m-0 text-lg font-semibold text-gray-900 dark:text-white">LTB Legal Documents</h2>
        </div>
      )}
      
      {showFilters && (
        <Card className="mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Left: Filters */}
            <div className="flex gap-3 items-center flex-wrap flex-1 min-w-0">
              <Select
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-32 min-w-[130px]"
              >
                {COUNTRIES.map(country => (
                  <option key={country.value} value={country.value}>{country.label}</option>
                ))}
              </Select>
              
              <Select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-40 min-w-[170px]"
              >
                {getRegionOptions(selectedCountry).map(region => (
                  <option key={region.value} value={region.value}>{region.label}</option>
                ))}
              </Select>
              
              <Select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || undefined)}
                className="w-36 min-w-[150px]"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </Select>

              {hasActiveFilters && (
                <Button
                  color="light"
                  onClick={clearFilters}
                  size="sm"
                  className="flex items-center gap-1 text-gray-500 text-xs h-8 px-2"
                >
                  <HiX className="h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>

            {/* Center: Tabs */}
            {mounted && (
              <div className="flex justify-center items-center flex-shrink-0 mx-4">
                <Tabs aria-label="Document tabs" style="underline" onActiveTabChange={setActiveTab}>
                  <Tabs.Item active={activeTab === 0} title={
                    <span>All <Badge color="purple">{tabCounts.all}</Badge></span>
                  }>
                  </Tabs.Item>
                  <Tabs.Item active={activeTab === 1} title={
                    <span>Landlord <Badge color="blue">{tabCounts.landlord}</Badge></span>
                  }>
                  </Tabs.Item>
                  <Tabs.Item active={activeTab === 2} title={
                    <span>Tenant <Badge color="green">{tabCounts.tenant}</Badge></span>
                  }>
                  </Tabs.Item>
                  <Tabs.Item active={activeTab === 3} title={
                    <span>Both <Badge color="warning">{tabCounts.both}</Badge></span>
                  }>
                  </Tabs.Item>
                </Tabs>
              </div>
            )}

            {/* Right: Search */}
            <div className="flex-shrink-0 min-w-[300px] flex-0-auto">
              <TextInput
                icon={HiSearch}
                placeholder="Search forms..."
                value={externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  if (externalSearchQuery === undefined) {
                    setInternalSearchQuery(value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    fetchDocuments(1);
                  }
                }}
                className="w-full max-w-[340px]"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-4">
          <Alert color="failure" onDismiss={() => setError(null)}>
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </Alert>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {!isOntarioSelected ? (
          <div className="flex justify-center items-center min-h-[400px] flex-col py-10 px-5">
            <Empty description={
              <div className="text-center">
                <div className="text-base font-medium text-gray-900 dark:text-white mb-2">
                  Coming Soon: Documents for other regions
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Please select Canada and Ontario to view available documents.
                </div>
              </div>
            } />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                {columns.map(col => (
                  <Table.HeadCell key={col.key}>{col.title}</Table.HeadCell>
                ))}
              </Table.Head>
              <Table.Body className="divide-y">
                {loading ? (
                  <Table.Row>
                    <Table.Cell colSpan={columns.length} className="text-center py-8">
                      <Spinner size="xl" />
                    </Table.Cell>
                  </Table.Row>
                ) : documents.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={columns.length} className="text-center py-8">
                      <Empty description={
                        <div className="text-center">
                          <HiDocumentSearch className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                          <div className="text-base font-medium text-gray-900 dark:text-white mb-2">
                            No forms found
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {searchQuery ? 'Try adjusting your search or filters' : 'No documents match your current filters'}
                          </div>
                        </div>
                      } />
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  documents.map((record) => (
                    <Table.Row key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      {columns.map((col) => (
                        <Table.Cell key={col.key}>
                          {col.render ? col.render(record[col.dataIndex], record) : record[col.dataIndex]}
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table>
          </div>
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
  return (
    prevProps.userRole === nextProps.userRole &&
    prevProps.showFilters === nextProps.showFilters &&
    prevProps.showTitle === nextProps.showTitle
  );
});
