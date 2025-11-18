/**
 * useDocumentModals Hook
 * Manages modal state for document operations
 * Shared between landlord and tenant document vaults
 */

import { useState } from 'react';

export function useDocumentModals() {
  const [deleteModal, setDeleteModal] = useState({
    visible: false,
    document: null,
    reason: '',
    loading: false,
  });

  const openDeleteModal = (doc) => {
    setDeleteModal({
      visible: true,
      document: doc,
      reason: '',
      loading: false,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      visible: false,
      document: null,
      reason: '',
      loading: false,
    });
  };

  const updateDeleteReason = (reason) => {
    setDeleteModal(prev => ({ ...prev, reason }));
  };

  const setDeleteLoading = (loading) => {
    setDeleteModal(prev => ({ ...prev, loading }));
  };

  return {
    deleteModal,
    openDeleteModal,
    closeDeleteModal,
    updateDeleteReason,
    setDeleteLoading,
  };
}

export default useDocumentModals;

