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
import { BgColorsOutlined, UserOutlined, ClockCircleOutlined, EditOutlined, TeamOutlined } from '@ant-design/icons';
import { Typography, Card, Divider, Button } from 'antd';
import ThemeSelector from '../../apps/web-app/components/ThemeSelector';
import TimezoneSelector from '../../apps/web-app/components/TimezoneSelector';
import SignatureUpload from '../../apps/web-app/components/SignatureUpload';
import LandlordOrganizationSettings from '../../apps/web-app/components/settings/LandlordOrganizationSettings';
import PMCOrganizationSettings from '../../apps/web-app/components/settings/PMCOrganizationSettings';
import { useRouter } from 'next/navigation';

const { Title, Text, Paragraph } = Typography;

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
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
            <BgColorsOutlined style={{ fontSize: '16px' }} />
            <span>Appearance</span>
          </span>
        ),
        children: (
          <div style={{ padding: '32px' }}>
            <Title level={4}>Choose Your Theme</Title>
            <Paragraph type="secondary">
              Personalize your experience by selecting a theme that suits your style.
              Changes will take effect immediately after selection.
            </Paragraph>
            
            <Divider />
            
            <ThemeSelector currentTheme={user?.theme || 'default'} />
          </div>
        ),
      },
      {
        key: 'profile',
        label: (
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
            <UserOutlined style={{ fontSize: '16px' }} />
            <span>Profile</span>
          </span>
        ),
        children: (
          <div style={{ padding: '32px' }}>
            <Title level={4}>Profile Information</Title>
            <Card>
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Name:</Text>
                <br />
                <Text>{user?.firstName || ''} {user?.middleName && `${user.middleName}. `}{user?.lastName || ''}</Text>
              </div>
              {userRole === 'landlord' && user?.landlordId && (
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>Landlord ID:</Text>
                  <br />
                  <Text code style={{ fontSize: '14px', fontFamily: 'monospace' }}>{user.landlordId}</Text>
                </div>
              )}
              {userRole === 'tenant' && user?.tenantId && (
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>Tenant ID:</Text>
                  <br />
                  <Text code style={{ fontSize: '14px', fontFamily: 'monospace' }}>{user.tenantId}</Text>
                </div>
              )}
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Email:</Text>
                <br />
                <Text>{user?.email || 'N/A'}</Text>
              </div>
              {user?.phone && (
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>Phone:</Text>
                  <br />
                  <Text>{user.phone}</Text>
                </div>
              )}
              {userRole === 'landlord' && user?.addressLine1 && (
                <div>
                  <Text strong>Address:</Text>
                  <br />
                  <Text>
                    {user.addressLine1}
                    {user.addressLine2 && `, ${user.addressLine2}`}
                    <br />
                    {user.city && `${user.city}, `}
                    {user.provinceState || ''} {user.postalZip || ''}
                    <br />
                    {user.country || ''}
                  </Text>
                </div>
              )}
              {userRole === 'tenant' && user?.currentAddress && (
                <div>
                  <Text strong>Current Address:</Text>
                  <br />
                  <Text>{user.currentAddress}</Text>
                </div>
              )}
            </Card>
          </div>
        ),
      },
      {
        key: 'preferences',
        label: (
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
            <ClockCircleOutlined style={{ fontSize: '16px' }} />
            <span>Preferences</span>
          </span>
        ),
        children: (
          <div style={{ padding: '32px' }}>
            <Title level={4}>Date & Time Preferences</Title>
            <Paragraph type="secondary">
              Set your timezone to ensure all dates and times display correctly for your location.
            </Paragraph>
            
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
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
            <TeamOutlined style={{ fontSize: '16px' }} />
            <span>Organization</span>
          </span>
        ),
        children: (
          <div style={{ padding: '32px' }}>
            <LandlordOrganizationSettings />
          </div>
        ),
      });

      // Add signature tab
      baseTabs.push({
        key: 'signature',
        label: (
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
            <EditOutlined style={{ fontSize: '16px' }} />
            <span>Signature</span>
          </span>
        ),
        children: (
          <div style={{ padding: '32px' }}>
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
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
            <TeamOutlined style={{ fontSize: '16px' }} />
            <span>Organization</span>
          </span>
        ),
        children: (
          <div style={{ padding: '32px' }}>
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

