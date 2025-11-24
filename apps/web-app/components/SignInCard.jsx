"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Card, Input, Button, Typography, Form, message, Alert } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function SignInCard() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePasswordLogin = async (values) => {
    setLoading(true);
    setError(null);

    try {
      // Use FastAPI v2 for login
      const { v2Api } = await import('@/lib/api/v2-client');
      const { adminApi } = await import('@/lib/api/admin-api');
      
      try {
        // Try v2 login first
        await v2Api.login(values.email, values.password);
        const currentUser = await v2Api.getCurrentUser();
        
        if (currentUser && currentUser.user) {
          const roles = currentUser.roles || [];
          const isSuperAdmin = roles.some(r => r.name === 'super_admin');
          const isPmcAdmin = roles.some(r => r.name === 'pmc_admin');
          
          message.success('Login successful!');
          
          if (isSuperAdmin) {
            router.push('/admin/dashboard');
          } else if (isPmcAdmin) {
            router.push('/admin/dashboard');
          } else {
            router.push('/dashboard');
          }
          return;
        }
      } catch (v2Error) {
        // Fallback to admin API for admin users
        try {
          await adminApi.login(values.email, values.password);
          const adminUser = await adminApi.getCurrentUser();
          
          if (adminUser && adminUser.user) {
            message.success('Login successful!');
            router.push('/admin/dashboard');
            return;
          }
        } catch (adminError) {
          // Both failed
          setError('Invalid email or password');
          message.error('Invalid email or password');
          return;
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
      message.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      style={{
        maxWidth: 450,
        width: '100%',
        margin: '0 auto',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      <div style={{ padding: '16px' }}>
        <Title
          level={2}
          style={{
            textAlign: 'center',
            fontWeight: 700,
            marginBottom: 32,
            color: '#1890ff',
          }}
        >
          Sign in to Pinaka
        </Title>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          onFinish={handlePasswordLogin}
          layout="vertical"
          autoComplete="off"
        >
        <Form.Item
          name="email"
          label="User ID / Email"
          rules={[
            { required: true, message: 'Please enter your User ID or email' },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            size="large"
            placeholder="Enter your User ID or email"
          />
        </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              size="large"
              placeholder="Enter your password"
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


        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Text type="secondary">
            Don't have an account?{' '}
            <Link href="#" style={{ color: '#1890ff', textDecoration: 'none', fontWeight: 600 }}>
              Register now
            </Link>
          </Text>
        </div>
      </div>
    </Card>
  );
}
