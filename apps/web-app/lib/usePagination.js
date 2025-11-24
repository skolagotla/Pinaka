/**
 * Custom hook for table pagination
 * Provides consistent pagination logic across all table pages
 * 
 * @param {Array} data - The array of data to paginate
 * @param {number} defaultRowsPerPage - Default number of rows per page (default: 10)
 * @returns {Object} - Pagination state and handlers
 */

import { useState, useMemo } from 'react';

export function usePagination(data, defaultRowsPerPage = 10) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, page, rowsPerPage]);

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when changing rows per page
  };

  // Reset to first page when data changes (e.g., after filtering)
  const resetPage = () => {
    setPage(0);
  };

  return {
    page,
    rowsPerPage,
    paginatedData,
    handleChangePage,
    handleChangeRowsPerPage,
    resetPage,
  };
}

