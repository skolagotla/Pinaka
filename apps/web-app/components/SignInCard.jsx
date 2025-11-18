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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        message.success('Login successful!');
        // Redirect to appropriate dashboard
        if (data.redirect) {
          router.push(data.redirect);
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.error || 'Login failed');
        message.error(data.error || 'Login failed');
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
