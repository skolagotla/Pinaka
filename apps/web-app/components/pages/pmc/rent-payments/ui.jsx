"use client";
// Reuse the landlord rent payments UI component
import RentPaymentsClient from '../../landlord/rent-payments/ui';

/**
 * PMC Rent Payments Client
 * Wrapper that reuses the landlord rent payments UI
 */
export default function PMCRentPaymentsClient({ leases, landlordCountry }) {
  return (
    <RentPaymentsClient 
      leases={leases}
      landlordCountry={landlordCountry}
    />
  );
}
