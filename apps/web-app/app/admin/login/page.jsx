"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Button, Alert, Typography, Space, Form, Input } from 'antd';
import { LockOutlined, UserOutlined, SafetyOutlined, CheckCircleOutlined, CrownOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for error in URL params (client-side only to avoid hydration issues)
    if (typeof window !== 'undefined') {
      const errorParam = searchParams?.get('error');
      if (errorParam) {
        setError(decodeURIComponent(errorParam));
      }
    }
  }, [searchParams]);

  const handlePasswordLogin = async (values) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        // Redirect to admin dashboard
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err?.message || 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-30%',
          width: '60%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <Card
        style={{
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          borderRadius: '16px',
          border: 'none',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}
        bodyStyle={{
          padding: '48px 40px',
        }}
      >
        {/* Logo/Brand Section */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 24px rgba(30, 60, 114, 0.5)',
              position: 'relative',
            }}
          >
            <CrownOutlined style={{ fontSize: 40, color: '#fff' }} />
            <div
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#52c41a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid #fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              <LockOutlined style={{ fontSize: 12, color: '#fff' }} />
            </div>
          </div>
          <Title 
            level={2} 
            style={{ 
              marginBottom: 8, 
              fontWeight: 700,
              fontSize: 32,
              color: '#1a1a1a',
              letterSpacing: '-0.5px',
            }}
          >
            Admin Portal
          </Title>
          <Text 
            type="secondary" 
            style={{ 
              fontSize: 16,
              color: '#8c8c8c',
              fontWeight: 400,
            }}
          >
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
            style={{ 
              marginBottom: 24,
              borderRadius: '8px',
            }}
          />
        )}

        <Form
          form={form}
          name="admin-login"
          onFinish={handlePasswordLogin}
          layout="vertical"
          autoComplete="off"
          size="large"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label={
              <span style={{ fontWeight: 600, color: '#262626', fontSize: 14 }}>
                Admin Email
              </span>
            }
            rules={[
              { required: true, message: 'Please enter your admin email' },
              { type: 'email', message: 'Please enter a valid email address' },
            ]}
            style={{ marginBottom: 20 }}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Enter your admin email"
              autoComplete="username"
              style={{
                height: 48,
                borderRadius: '8px',
                fontSize: 15,
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={
              <span style={{ fontWeight: 600, color: '#262626', fontSize: 14 }}>
                Password
              </span>
            }
            rules={[{ required: true, message: 'Please enter your password' }]}
            style={{ marginBottom: 8 }}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Enter your password"
              autoComplete="current-password"
              style={{
                height: 48,
                borderRadius: '8px',
                fontSize: 15,
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 24, marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                height: 52,
                fontSize: 16,
                fontWeight: 600,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(30, 60, 114, 0.4)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(30, 60, 114, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 60, 114, 0.4)';
              }}
            >
              {loading ? 'Signing In...' : 'Sign In to Admin Portal'}
            </Button>
          </Form.Item>
        </Form>

        {/* Security & Links */}
        <div 
          style={{ 
            marginTop: 32, 
            paddingTop: 24, 
            borderTop: '1px solid #f0f0f0',
          }}
        >
          <Space direction="vertical" size="small" style={{ width: '100%', textAlign: 'center' }}>
            <Space size="small">
              <SafetyOutlined style={{ color: '#52c41a', fontSize: 16 }} />
              <Text type="secondary" style={{ fontSize: 13 }}>
                Enterprise-grade security
              </Text>
            </Space>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Regular user?{' '}
                <a 
                  href="/login" 
                  style={{ 
                    color: '#1890ff',
                    fontWeight: 500,
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Sign in here
                </a>
              </Text>
            </div>
          </Space>
        </div>

        {/* Test Credentials - Professional Styled */}
        <div 
          style={{ 
            marginTop: 24, 
            padding: 20, 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
            borderRadius: '12px',
            border: '1px solid #e8e8e8',
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <Text strong style={{ fontSize: 13, color: '#595959', display: 'block', marginBottom: 8 }}>
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 6 }} />
              Test Credentials
            </Text>
          </div>
          <Space direction="vertical" size={6} style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: '#8c8c8c' }}>Admin:</Text>
              <code style={{ 
                fontSize: 11, 
                background: '#fff', 
                padding: '4px 8px', 
                borderRadius: '4px',
                color: '#1890ff',
                fontWeight: 500,
              }}>
                superadmin@admin.local
              </code>
              <Text style={{ fontSize: 11, color: '#bfbfbf' }}>/</Text>
              <code style={{ 
                fontSize: 11, 
                background: '#fff', 
                padding: '4px 8px', 
                borderRadius: '4px',
                color: '#1890ff',
                fontWeight: 500,
              }}>
                superadmin
              </code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: '#8c8c8c' }}>PMC:</Text>
              <code style={{ 
                fontSize: 11, 
                background: '#fff', 
                padding: '4px 8px', 
                borderRadius: '4px',
                color: '#1890ff',
                fontWeight: 500,
              }}>
                pmc1-admin@pmc.local
              </code>
              <Text style={{ fontSize: 11, color: '#bfbfbf' }}>/</Text>
              <code style={{ 
                fontSize: 11, 
                background: '#fff', 
                padding: '4px 8px', 
                borderRadius: '4px',
                color: '#1890ff',
                fontWeight: 500,
              }}>
                pmcadmin
              </code>
            </div>
          </Space>
        </div>
      </Card>
    </div>
  );
}
