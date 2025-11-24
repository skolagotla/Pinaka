/**
 * Bulk Operations Hook
 * Handles selection and bulk actions on data tables
 */

import { useState, useCallback } from 'react';
import { notify } from '@/lib/utils/notification-helper';

export function useBulkOperations(options = {}) {
  const {
    onBulkAction,
    successMessage = 'Bulk operation completed successfully',
    errorMessage = 'Bulk operation failed',
  } = options;

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => {
      setSelectedRowKeys(keys);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      setSelectedRowKeys(selected ? changeRows.map(row => row.id || row.key) : []);
    },
  };

  const handleBulkAction = useCallback(async (action, actionParams = {}) => {
    if (selectedRowKeys.length === 0) {
      notify.warning('Please select at least one item');
      return;
    }

    try {
      setLoading(true);
      const result = await onBulkAction(action, selectedRowKeys, actionParams);
      if (result) {
        notify.success(successMessage);
        setSelectedRowKeys([]);
      }
      return result;
    } catch (error) {
      console.error('Bulk operation error:', error);
      notify.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [selectedRowKeys, onBulkAction, successMessage, errorMessage]);

  const clearSelection = useCallback(() => {
    setSelectedRowKeys([]);
  }, []);

  return {
    selectedRowKeys,
    setSelectedRowKeys,
    rowSelection,
    handleBulkAction,
    clearSelection,
    loading,
    hasSelection: selectedRowKeys.length > 0,
    selectionCount: selectedRowKeys.length,
  };
}

export default useBulkOperations;
