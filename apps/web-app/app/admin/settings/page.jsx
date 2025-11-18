"use client";

import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Switch,
  Space,
  Typography,
  message,
  Row,
  Col,
  Input,
} from 'antd';
import {
  SettingOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { PageLayout, FormTextInput, FormActions } from '@/components/shared';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.getSettings();

      if (data.success) {
        setSettings(data.data);
        form.setFieldsValue(data.data);
      } else {
        message.error(data.error || 'Failed to fetch settings');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      message.error(err?.message || 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.updateSettings(values);

      if (data.success) {
        message.success('Settings saved successfully');
        setSettings(data.data);
      } else {
        message.error(data.error || 'Failed to save settings');
      }
    } catch (err) {
      if (err.errorFields) {
        // Validation errors
        return;
      }
      console.error('Error saving settings:', err);
      message.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <PageLayout
      headerTitle={<><SettingOutlined /> Platform Configuration</>}
      contentStyle={{ maxWidth: 1000, margin: '0 auto' }}
    >

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={settings}
      >
        <Card title="System Settings" style={{ marginBottom: 24 }}>
          <Form.Item
            name={['maintenanceMode']}
            label="Maintenance Mode"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Typography.Text type="secondary">
            When enabled, the platform will be unavailable to users.
          </Typography.Text>
        </Card>

        <Card title="Feature Flags" style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name={['featureFlags', 'tenantInvitations']}
                label="Tenant Invitations"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['featureFlags', 'documentVault']}
                label="Document Vault"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['featureFlags', 'maintenanceRequests']}
                label="Maintenance Requests"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['featureFlags', 'rentPayments']}
                label="Rent Payments"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Email Configuration" style={{ marginBottom: 24 }}>
          <Form.Item
            name={['email', 'enabled']}
            label="Enable Email"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name={['email', 'provider']}
            label="Email Provider"
          >
            <Typography.Text>{settings?.email?.provider || 'gmail'}</Typography.Text>
          </Form.Item>
        </Card>

        <Card title="Notifications" style={{ marginBottom: 24 }}>
          <Form.Item
            name={['notifications', 'enabled']}
            label="Enable Notifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name={['notifications', 'channels']}
            label="Notification Channels"
          >
            <Typography.Text>{settings?.notifications?.channels?.join(', ') || 'email'}</Typography.Text>
          </Form.Item>
        </Card>

        <Card title="Stripe Payment Processing" style={{ marginBottom: 24 }}>
          <Form.Item
            name={['stripe', 'enabled']}
            label="Enable Stripe Payments"
            valuePropName="checked"
            tooltip="When enabled, tenants can pay rent online via Stripe"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues?.stripe?.enabled !== currentValues?.stripe?.enabled
            }
          >
            {({ getFieldValue }) =>
              getFieldValue(['stripe', 'enabled']) ? (
                <>
                  <Form.Item
                    name={['stripe', 'secretKey']}
                    label="Stripe Secret Key"
                    rules={[
                      { required: true, message: 'Secret key is required' },
                      {
                        pattern: /^sk_(test|live)_/,
                        message: 'Secret key must start with sk_test_ or sk_live_',
                      },
                    ]}
                  >
                    <Input.Password placeholder="sk_test_..." />
                  </Form.Item>
                  <FormTextInput
                    name={['stripe', 'publishableKey']}
                    label="Stripe Publishable Key"
                    required
                    placeholder="pk_test_..."
                    rules={[
                      {
                        pattern: /^pk_(test|live)_/,
                        message: 'Publishable key must start with pk_test_ or pk_live_',
                      },
                    ]}
                  />
                  <Form.Item
                    name={['stripe', 'webhookSecret']}
                    label="Stripe Webhook Secret"
                    rules={[
                      { required: true, message: 'Webhook secret is required' },
                      {
                        pattern: /^whsec_/,
                        message: 'Webhook secret must start with whsec_',
                      },
                    ]}
                    tooltip="Get this from your Stripe Dashboard > Developers > Webhooks"
                  >
                    <Input.Password placeholder="whsec_..." />
                  </Form.Item>
                  <Typography.Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                    ⚠️ Make sure to configure the webhook endpoint in Stripe Dashboard pointing to:{' '}
                    <code>{typeof window !== 'undefined' ? window.location.origin : ''}/api/stripe/webhook</code>
                  </Typography.Text>
                </>
              ) : (
                <Typography.Text type="secondary">
                  Stripe payment processing is currently disabled. Enable it to allow tenants to pay rent online.
                </Typography.Text>
              )
            }
          </Form.Item>
        </Card>

        <FormActions
          onSave={handleSave}
          onReset={fetchSettings}
          loading={saving}
          saveText="Save Settings"
          resetText="Reset"
          showCancel={false}
          showReset={true}
        />
      </Form>
    </PageLayout>
  );
}

