/**
 * Tax Reporting Page
 * Generate T776 tax forms
 */

import { withAuth } from '@/lib/utils/page-wrapper';
import dynamic from 'next/dynamic';

const TaxReportingClient = dynamic(() => 
  import('@/components/pages/accountant/tax-reporting/ui').then(mod => mod.default)
);

export default withAuth(async ({ user, userRole }) => {
  // Landlords, accountants, PMC admins, and system admins can access
  if (!['landlord', 'accountant', 'pmc', 'admin'].includes(userRole)) {
    return (
      <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        <h1>Access Denied</h1>
        <p>You don't have permission to access tax reporting.</p>
      </div>
    );
  }

  return <TaxReportingClient user={user} userRole={userRole} />;
}, { role: ['landlord', 'accountant', 'pmc', 'admin'] });

