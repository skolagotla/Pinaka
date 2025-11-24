/**
 * useSettings Hook
 * Centralized settings page logic for both landlord and tenant
 * 
 * Features:
 * - User profile data
 * - Theme management
 * - Settings tabs configuration
 * - Timezone management
 * 
 * Usage:
 * const { user, currentTheme, settingsTabs, loading } = useSettings({ 
 *   user, 
 *   userRole 
 * });
 */

import { useMemo } from 'react';
import { HiColorSwatch, HiUser, HiClock, HiPencilAlt, HiUserGroup } from 'react-icons/hi';
import { Card, Button } from 'flowbite-react';
// Divider component - use a simple hr element instead
const Divider = () => <hr className="my-4 border-gray-200 dark:border-gray-700" />;
import ThemeSelector from '@/components/ThemeSelector';
import TimezoneSelector from '@/components/TimezoneSelector';
import SignatureUpload from '@/components/SignatureUpload';
import LandlordOrganizationSettings from '@/components/settings/LandlordOrganizationSettings';
import PMCOrganizationSettings from '@/components/settings/PMCOrganizationSettings';
import { useRouter } from 'next/navigation';


export function useSettings({ user, userRole, pmcData }) {
  // Generate settings tabs configuration
  const settingsTabs = useMemo(() => {
    // Early return if user is not available
    if (!user) {
      return [];
    }

    const baseTabs = [
      {
        key: 'appearance',
        label: (
          <span className="flex items-center gap-2 py-1">
            <HiColorSwatch className="h-4 w-4" />
            <span>Appearance</span>
          </span>
        ),
        children: (
          <div className="p-8">
            <h4 className="text-xl font-semibold mb-2">Choose Your Theme</h4>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Personalize your experience by selecting a theme that suits your style.
              Changes will take effect immediately after selection.
            </p>
            
            <Divider />
            
            <ThemeSelector currentTheme={user?.theme || 'default'} />
          </div>
        ),
      },
      {
        key: 'profile',
        label: (
          <span className="flex items-center gap-2 py-1">
            <HiUser className="h-4 w-4" />
            <span>Profile</span>
          </span>
        ),
        children: (
          <div className="p-8">
            <h4 className="text-xl font-semibold mb-4">Profile Information</h4>
            <Card>
              <div className="mb-4">
                <span className="font-semibold">Name:</span>
                <br />
                <span>{user?.firstName || ''} {user?.middleName && `${user.middleName}. `}{user?.lastName || ''}</span>
              </div>
              {userRole === 'landlord' && user?.landlordId && (
                <div className="mb-4">
                  <span className="font-semibold">Landlord ID:</span>
                  <br />
                  <code className="text-sm font-mono">{user.landlordId}</code>
                </div>
              )}
              {userRole === 'tenant' && user?.tenantId && (
                <div className="mb-4">
                  <span className="font-semibold">Tenant ID:</span>
                  <br />
                  <code className="text-sm font-mono">{user.tenantId}</code>
                </div>
              )}
              <div className="mb-4">
                <span className="font-semibold">Email:</span>
                <br />
                <span>{user?.email || 'N/A'}</span>
              </div>
              {user?.phone && (
                <div className="mb-4">
                  <span className="font-semibold">Phone:</span>
                  <br />
                  <span>{user.phone}</span>
                </div>
              )}
              {userRole === 'landlord' && user?.addressLine1 && (
                <div>
                  <span className="font-semibold">Address:</span>
                  <br />
                  <span>
                    {user.addressLine1}
                    {user.addressLine2 && `, ${user.addressLine2}`}
                    <br />
                    {user.city && `${user.city}, `}
                    {user.provinceState || ''} {user.postalZip || ''}
                    <br />
                    {user.country || ''}
                  </span>
                </div>
              )}
              {userRole === 'tenant' && user?.currentAddress && (
                <div>
                  <span className="font-semibold">Current Address:</span>
                  <br />
                  <span>{user.currentAddress}</span>
                </div>
              )}
            </Card>
          </div>
        ),
      },
      {
        key: 'preferences',
        label: (
          <span className="flex items-center gap-2 py-1">
            <HiClock className="h-4 w-4" />
            <span>Preferences</span>
          </span>
        ),
        children: (
          <div className="p-8">
            <h4 className="text-xl font-semibold mb-2">Date & Time Preferences</h4>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Set your timezone to ensure all dates and times display correctly for your location.
            </p>
            
            <Divider />
            
            <TimezoneSelector 
              currentTimezone={user?.timezone || (userRole === 'landlord' ? 'America/Toronto' : 'America/New_York')}
              userId={user?.id}
              userRole={userRole}
            />
          </div>
        ),
      },
    ];

    // Add organization tab for landlords
    if (userRole === 'landlord') {
      baseTabs.push({
        key: 'organization',
        label: (
          <span className="flex items-center gap-2 py-1">
            <HiUserGroup className="h-4 w-4" />
            <span>Organization</span>
          </span>
        ),
        children: (
          <div className="p-8">
            <LandlordOrganizationSettings />
          </div>
        ),
      });

      // Add signature tab
      baseTabs.push({
        key: 'signature',
        label: (
          <span className="flex items-center gap-2 py-1">
            <HiPencilAlt className="h-4 w-4" />
            <span>Signature</span>
          </span>
        ),
        children: (
          <div className="p-8">
            <SignatureUpload />
          </div>
        ),
      });
    }

    // Add organization tab for PMC
    if (userRole === 'pmc') {
      baseTabs.push({
        key: 'organization',
        label: (
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
            <TeamOutlined style={{ fontSize: '16px' }} />
            <span>Organization</span>
          </span>
        ),
        children: (
          <div style={{ padding: '32px' }}>
            <PMCOrganizationSettings pmcData={pmcData} />
          </div>
        ),
      });
    }

    // Add organization tab for tenants (if they have organization)
    if (userRole === 'tenant' && user?.organizationId) {
      baseTabs.push({
        key: 'organization',
        label: (
          <span className="flex items-center gap-2 py-1">
            <HiUserGroup className="h-4 w-4" />
            <span>Organization</span>
          </span>
        ),
        children: (
          <div className="p-8">
            <LandlordOrganizationSettings />
          </div>
        ),
      });
    }

    return baseTabs;
  }, [user, userRole, pmcData]);

  return {
    user,
    currentTheme: user?.theme || 'default',
    settingsTabs,
    userRole,
  };
}

export default useSettings;

