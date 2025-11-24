import { useMemo } from 'react';
import { HiPlus } from 'react-icons/hi';
import PageBanner from '@/components/shared/PageBanner';
import PageHeader from '@/components/PageHeader';
import { useSearch } from './useSearch';

/**
 * Custom hook for consistent page banners across the application
 * 
 * @param {Object} config - Configuration object
 * @param {string} config.title - Page title
 * @param {string} config.subtitle - Optional subtitle (for PageHeader)
 * @param {Array} config.data - Data array to calculate stats from
 * @param {Function} config.calculateStats - Function to calculate stats from data
 * @param {Array} config.searchFields - Fields to search in data
 * @param {Function} config.customSearch - Custom search function (item, searchTerm) => boolean
 * @param {string} config.searchPlaceholder - Placeholder for search input
 * @param {Object} config.actions - Actions configuration
 * @param {Function} config.actions.onAdd - Add button handler
 * @param {string} config.actions.addTooltip - Add button tooltip
 * @param {Function} config.actions.onRefresh - Refresh button handler
 * @param {React.ReactNode} config.dropdown - Dropdown component (filters, selectors, etc.)
 * @param {string} config.component - 'banner' or 'header' (default: 'banner')
 * @param {Object} config.extra - Extra content for PageHeader
 * 
 * @returns {Object} { BannerComponent, filteredData, search }
 */
export function usePageBanner({
  title,
  subtitle,
  data = [],
  calculateStats,
  searchFields = [],
  customSearch = null,
  searchPlaceholder = 'Search...',
  actions = {},
  dropdown = null,
  component = 'banner',
  extra = null
}) {
  // Ensure data is always an array to prevent filter errors
  const dataArray = Array.isArray(data) ? data : [];
  
  // Setup search functionality
  const search = useSearch(dataArray, searchFields, { debounceMs: 300 });

  // Apply custom search if provided
  const finalFilteredData = useMemo(() => {
    if (!customSearch || !search.searchTerm || !search.searchTerm.trim()) {
      return search.filteredData;
    }
    
    // Use custom search function - ensure dataArray is used
    return dataArray.filter(item => item && customSearch(item, search.searchTerm));
  }, [customSearch, dataArray, search.filteredData, search.searchTerm]);

  // Calculate stats from filtered data (or all data if no search)
  const stats = useMemo(() => {
    if (!calculateStats) return [];
    const dataForStats = finalFilteredData.length > 0 || search.searchTerm ? finalFilteredData : dataArray;
    return calculateStats(dataForStats);
  }, [calculateStats, finalFilteredData, search.searchTerm, dataArray]);

  // Build actions array based on configuration
  const actionsList = useMemo(() => {
    const acts = [];
    
    // Consistent order: Refresh, then Add
    if (actions.onRefresh) {
      acts.push({
        icon: <span style={{ fontSize: 16 }}>↻</span>,
        tooltip: actions.refreshTooltip || 'Refresh',
        onClick: actions.onRefresh
      });
    }
    
    if (actions.onAdd) {
      acts.push({
        icon: actions.addIcon || <HiPlus />,
        tooltip: actions.addTooltip || 'Add',
        onClick: actions.onAdd,
        type: 'primary',
        disabled: actions.addDisabled || false
      });
    }

    // Add any custom actions
    if (actions.custom && Array.isArray(actions.custom)) {
      acts.push(...actions.custom);
    }
    
    return acts;
  }, [actions]);

  // Determine if stats should be shown
  const showStats = dataArray.length > 0;

  // Create the banner/header component
  const BannerComponent = useMemo(() => {
    const commonProps = {
      title,
      searchValue: search.searchTerm,
      onSearchChange: search.setSearchTerm,
      onSearchClear: search.clearSearch,
      searchPlaceholder,
    };

    if (component === 'header') {
      // PageHeader doesn't have showStats, dropdown, or actions array
      // It uses onAdd, onRefresh directly, and extra for dropdown
      return (
        <PageHeader
          {...commonProps}
          subtitle={subtitle}
          stats={showStats ? stats : undefined}
          onRefresh={actions.onRefresh}
          onAdd={actions.onAdd}
          onSearch={search.searchTerm ? () => {} : undefined}
          addButtonText={actions.addTooltip}
          extra={dropdown || extra}
        />
      );
    }

    // Default to PageBanner
    return (
      <PageBanner
        {...commonProps}
        stats={stats}
        actions={actionsList}
        dropdown={dropdown}
        showStats={showStats}
      />
    );
  }, [
    component,
    title,
    subtitle,
    stats,
    actionsList,
    dropdown,
    extra,
    showStats,
    search.searchTerm,
    search.setSearchTerm,
    search.clearSearch,
    searchPlaceholder,
    actions
  ]);

  return {
    /**
     * Ready-to-render banner/header component
     */
    BannerComponent,
    
    /**
     * Filtered data based on search (includes custom search if provided)
     */
    filteredData: finalFilteredData,
    
    /**
     * Search object with utilities
     */
    search,
    
    /**
     * Calculated stats
     */
    stats
  };
}

