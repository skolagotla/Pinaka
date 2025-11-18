/**
 * TypeScript definitions for useRentPayments hook
 */

export interface RentPaymentStats {
  total: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  overdueAmount: number;
  partialAmount: number;
  totalByCurrency: Record<string, number>;
  paidByCurrency: Record<string, number>;
  unpaidByCurrency: Record<string, number>;
  overdueByCurrency: Record<string, number>;
  partialByCurrency: Record<string, number>;
}

export interface RentPayment {
  id: string;
  receiptNumber: string | null;
  amount: number;
  balance: number;
  dueDate: string;
  paidDate: string | null;
  status: 'Paid' | 'Unpaid' | 'Partial' | 'Overdue';
  lease: {
    unit: {
      unitName: string;
      property: {
        propertyName: string | null;
        addressLine1: string;
        country: string;
        unitCount: number;
      };
    };
    leaseTenants?: Array<{
      tenant: {
        firstName: string;
        lastName: string;
      };
    }>;
  };
}

export interface UseRentPaymentsOptions {
  userRole?: 'landlord' | 'tenant';
  apiEndpoint?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseRentPaymentsReturn {
  data: RentPayment[];
  setData: (data: RentPayment[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  viewingReceipt: RentPayment | null;
  setViewingReceipt: (receipt: RentPayment | null) => void;
  stats: RentPaymentStats | null;
  fetchData: () => Promise<void>;
}

export function useRentPayments(
  initialData: RentPayment[] | null,
  options?: UseRentPaymentsOptions
): UseRentPaymentsReturn;

