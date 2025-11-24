/**
 * TypeScript type definitions for usePagination hook
 */

export interface PaginationReturn<T = any> {
  page: number;
  rowsPerPage: number;
  paginatedData: T[];
  handleChangePage: (event: any, newPage: number) => void;
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  resetPage: () => void;
}

export function usePagination<T = any>(
  data: T[],
  defaultRowsPerPage?: number
): PaginationReturn<T>;

