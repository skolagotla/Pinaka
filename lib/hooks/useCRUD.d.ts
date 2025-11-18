/**
 * TypeScript type definitions for useCRUD hook
 */

export interface CRUDOptions<T = any> {
  onCreateSuccess?: (item: T) => void;
  onUpdateSuccess?: (item: T) => void;
  onDeleteSuccess?: (id: string) => void;
  onError?: (error: Error) => void;
  confirmDelete?: boolean;
  deleteConfirmMessage?: (item: T | null) => string;
}

export interface CRUDResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  cancelled?: boolean;
}

export interface CRUDReturn<T = any> {
  data: T[];
  loading: boolean;
  error: string | null;
  create: (payload: Partial<T>) => Promise<CRUDResult<T>>;
  update: (id: string, payload: Partial<T>) => Promise<CRUDResult<T>>;
  remove: (id: string, item?: T | null) => Promise<CRUDResult<void>>;
  refresh: () => Promise<CRUDResult<T[]>>;
  setData: (newData: T[]) => void;
}

export function useCRUD<T = any>(
  apiEndpoint: string,
  initialData?: T[],
  options?: CRUDOptions<T>
): CRUDReturn<T>;

