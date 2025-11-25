"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Card, TextInput, Button, Label, Alert } from 'flowbite-react';
import { HiMail, HiLockClosed } from 'react-icons/hi';
import { useFormState } from '@/lib/hooks/useFormState';
import { notify } from '@/lib/utils/notification-helper';

export default function SignInCard() {
  const router = useRouter();
  const form = useFormState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const values = form.getFieldsValue();

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
          
          notify.success('Login successful');
          
          if (isSuperAdmin) {
            router.push('/platform');
          } else if (isPmcAdmin) {
            router.push('/platform');
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
            notify.success('Login successful');
            router.push('/platform');
            return;
          }
        } catch (adminError) {
          // Both failed
          setError('Invalid email or password');
          notify.error('Invalid email or password');
          return;
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
      notify.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md w-full mx-auto shadow-lg">
      <div className="p-4">
        <h2 className="text-2xl font-bold text-center mb-8 text-blue-600">
          Sign in to Pinaka
        </h2>

        {error && (
          <Alert
            color="failure"
            className="mb-6"
            onDismiss={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <Label htmlFor="email" className="mb-2">User ID / Email</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <HiMail className="h-5 w-5 text-gray-400" />
              </div>
              <TextInput
                id="email"
                name="email"
                type="email"
                value={form.values.email || ''}
                onChange={(e) => form.setFieldsValue({ email: e.target.value })}
                placeholder="Enter your User ID or email"
                required
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="mb-2">Password</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <HiLockClosed className="h-5 w-5 text-gray-400" />
              </div>
              <TextInput
                id="password"
                name="password"
                type="password"
                value={form.values.password || ''}
                onChange={(e) => form.setFieldsValue({ password: e.target.value })}
                placeholder="Enter your password"
                required
                className="pl-10"
              />
            </div>
          </div>

          <Button
            type="submit"
            color="blue"
            size="lg"
            className="w-full h-12 text-base font-medium"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{' '}
            <Link href="#" className="text-blue-600 hover:underline font-semibold">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </Card>
  );
}
