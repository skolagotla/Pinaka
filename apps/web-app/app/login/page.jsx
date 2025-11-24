"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, TextInput, Alert, Card } from 'flowbite-react';
import { HiLockClosed, HiUser, HiShieldCheck, HiCheckCircle } from 'react-icons/hi';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const errorParam = searchParams?.get('error');
      if (errorParam) {
        setError(decodeURIComponent(errorParam));
      }
    }
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Use FastAPI v2 for login
      const { v2Api } = await import('@/lib/api/v2-client');
      const { adminApi } = await import('@/lib/api/admin-api');
      
      try {
        // Try FastAPI v2 login first
        await v2Api.login(email, password);
        const currentUser = await v2Api.getCurrentUser();
        
        if (currentUser && currentUser.user) {
          const roles = currentUser.roles || [];
          const isSuperAdmin = roles.some(r => r.name === 'super_admin');
          const isPmcAdmin = roles.some(r => r.name === 'pmc_admin');
          
          const nextUrl = searchParams?.get('next') || '/';
          
          if (isSuperAdmin) {
            router.push('/admin/dashboard');
          } else if (isPmcAdmin) {
            router.push('/admin/dashboard');
          } else {
            router.push(nextUrl);
          }
          return;
        }
      } catch (v2Error) {
        // Fallback to admin API for admin users
        try {
          await adminApi.login(email, password);
          const adminUser = await adminApi.getCurrentUser();
          
          if (adminUser && adminUser.user) {
            router.push('/admin/dashboard');
            return;
          }
        } catch (adminError) {
          // Both failed
          setError('Invalid email or password');
          return;
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err?.message || 'An error occurred during login.';
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to fetch')) {
        setError('Unable to connect to server. Please ensure the API server is running on port 3001.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-radial from-white/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-3/5 h-3/5 bg-gradient-radial from-white/5 to-transparent pointer-events-none" />

      <Card className="w-full max-w-md shadow-2xl rounded-2xl border-0 overflow-hidden relative z-10">
        <div className="p-12">
          {/* Logo/Brand Section */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <HiLockClosed className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-gray-600 text-base font-normal">
              Sign in to your Pinaka account
            </p>
          </div>

          {error && (
            <Alert color="failure" className="mb-6 rounded-lg">
              <div>
                <div className="font-medium">Authentication Error</div>
                <div className="text-sm mt-1">{error}</div>
              </div>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <TextInput
                id="email"
                type="email"
                icon={HiUser}
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base"
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-semibold text-gray-700">
                Password
              </label>
              <TextInput
                id="password"
                type="password"
                icon={HiLockClosed}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 text-base"
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-base font-semibold bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* Security Badge */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
              <HiShieldCheck className="w-4 h-4 text-green-500" />
              <span>Secure authentication with encrypted connection</span>
            </div>
          </div>

          {/* Test Credentials */}
          <div className="mt-6 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <div className="mb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <HiCheckCircle className="w-4 h-4 text-green-500" />
                Test Credentials
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Admin:</span>
                <div className="flex items-center gap-1">
                  <code className="bg-white px-2 py-1 rounded text-blue-600 font-medium">superadmin@admin.local</code>
                  <span className="text-gray-400">/</span>
                  <code className="bg-white px-2 py-1 rounded text-blue-600 font-medium">superadmin</code>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">PMC:</span>
                <div className="flex items-center gap-1">
                  <code className="bg-white px-2 py-1 rounded text-blue-600 font-medium">pmc1-admin@pmc.local</code>
                  <span className="text-gray-400">/</span>
                  <code className="bg-white px-2 py-1 rounded text-blue-600 font-medium">pmcadmin</code>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Landlord:</span>
                <div className="flex items-center gap-1">
                  <code className="bg-white px-2 py-1 rounded text-blue-600 font-medium">pmc1-lld1@pmc.local</code>
                  <span className="text-gray-400">/</span>
                  <code className="bg-white px-2 py-1 rounded text-blue-600 font-medium">testlld</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
