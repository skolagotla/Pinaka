"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Alert, Typography, Space, Form, Input, Divider } from 'antd';
import { GoogleOutlined, LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function AdminLoginPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for error in URL params (client-side only to avoid hydration issues)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get('error');
      if (errorParam) {
        setError(decodeURIComponent(errorParam));
      }
    }
  }, []);

  const handlePasswordLogin = async (values) => {
    setLoading(true);
    setError(null);

    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.login(values.email, values.password);

      if (data.success) {
        // Redirect to admin dashboard
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err?.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setError(null);
    
    // Redirect to Google OAuth (App Router route)
    window.location.href = '/admin/auth/google';
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 450,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <LockOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <Title level={2} style={{ marginBottom: 8 }}>
            Admin Login
          </Title>
          <Text type="secondary">
            Pinaka Property Management System
          </Text>
        </div>

        {error && (
          <Alert
            message="Authentication Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          name="admin-login"
          onFinish={handlePasswordLogin}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="email"
            label="User ID / Email"
            rules={[
              { required: true, message: 'Please enter your User ID or Email' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your User ID or Email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              style={{
                height: 48,
                fontSize: 16,
                fontWeight: 500,
              }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <Text type="secondary">OR</Text>
        </Divider>

        <Button
          size="large"
          block
          icon={<GoogleOutlined />}
          onClick={handleGoogleLogin}
          loading={googleLoading}
          style={{
            height: 48,
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          Sign in with Google
        </Button>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', textAlign: 'center' }}>
            🔒 Secure authentication
          </Text>
        </div>
      </Card>
    </div>
  );
}

