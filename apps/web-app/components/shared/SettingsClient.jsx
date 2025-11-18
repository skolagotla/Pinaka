"use client";

import { Tabs, Typography } from 'antd';
import { useSettings } from '@/lib/hooks';

const { Title, Text } = Typography;

export default function SettingsClient({ user, userRole, pmcData }) {
  // 🎯 Use consolidated settings hook
  const { settingsTabs } = useSettings({ user, userRole, pmcData });

  // Show loading/empty state if no user or no tabs
  if (!user) {
    return (
      <div style={{ 
        padding: '24px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={2}>Settings</Title>
          <Text type="secondary">Loading user data...</Text>
        </div>
      </div>
    );
  }

  if (!settingsTabs || settingsTabs.length === 0) {
    return (
      <div style={{ 
        padding: '24px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={2}>Settings</Title>
          <Text type="secondary">No settings available</Text>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SECURITY NOTE: dangerouslySetInnerHTML is safe here because content is static CSS controlled by the application, not user-generated content */}
      <style dangerouslySetInnerHTML={{__html: `
        .settings-tabs-left {
          display: flex !important;
          flex-direction: row !important;
        }
        .settings-tabs-left .ant-tabs-nav {
          order: 1 !important;
          width: 240px !important;
          min-width: 240px !important;
          max-width: 240px !important;
        }
        .settings-tabs-left .ant-tabs-content-holder {
          order: 2 !important;
          flex: 1 !important;
        }
        .settings-tabs-left .ant-tabs-nav-list {
          flex-direction: column !important;
        }
      `}} />
      <div style={{ 
        padding: '24px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <Title level={2}>Settings</Title>
          <Text type="secondary">Manage your account preferences and appearance</Text>
        </div>

        <div style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginTop: '24px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row'
        }}>
          <Tabs 
            defaultActiveKey="appearance" 
            items={settingsTabs}
            tabPosition="left"
            style={{ 
              minHeight: '600px',
              width: '100%',
              display: 'flex',
              flexDirection: 'row'
            }}
            tabBarStyle={{
              width: '240px',
              backgroundColor: '#fafafa',
              margin: 0,
              paddingTop: '16px',
              borderRight: '1px solid #e8e8e8',
              minHeight: '600px',
              flexShrink: 0
            }}
            tabBarGutter={0}
            size="large"
            className="settings-tabs-left"
          />
        </div>
      </div>
    </>
  );
}

