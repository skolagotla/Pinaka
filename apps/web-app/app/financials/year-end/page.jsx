/**
 * Year-End Closing Page
 * For accountants and PMC admins to close financial periods
 */

import { withAuth } from '@/lib/utils/page-wrapper';
import dynamic from 'next/dynamic';

const YearEndClosingClient = dynamic(() => 
  import('@/components/pages/accountant/year-end-closing/ui').then(mod => mod.default)
);

export default withAuth(async ({ user, userRole }) => {
  // Only accountants, PMC admins, and system admins can access
  if (userRole !== 'accountant' && userRole !== 'pmc' && userRole !== 'admin') {
    return (
      <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        <h1>Access Denied</h1>
        <p>Only accountants and PMC admins can access year-end closing.</p>
      </div>
    );
  }

  return <YearEndClosingClient user={user} userRole={userRole} />;
}, { role: ['accountant', 'pmc', 'admin'] });

