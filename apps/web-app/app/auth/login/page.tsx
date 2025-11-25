"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  TextInput,
  Alert,
  Card,
  Spinner,
} from 'flowbite-react';
import {
  HiMail,
  HiLockClosed,
  HiShieldCheck,
} from 'react-icons/hi';
import { v2Api } from '@/lib/api/v2-client';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const errorParam = searchParams?.get('error');
      if (errorParam) {
        setError(decodeURIComponent(errorParam));
      }
    }
  }, [searchParams]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailError(null);
    setPasswordError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await v2Api.login(email.trim(), password);
      const currentUser = await v2Api.getCurrentUser();

      if (currentUser && currentUser.user) {
        // Check onboarding status
        const onboardingCompleted = currentUser.user.onboarding_completed ?? false;
        
        if (!onboardingCompleted) {
          // Redirect to onboarding start
          router.push('/onboarding/start');
          return;
        }

        // Onboarding completed - redirect based on role
        const roles = currentUser.roles || [];
        const isSuperAdmin = roles.some((r) => r.name === 'super_admin');
        const isPmcAdmin = roles.some((r) => r.name === 'pmc_admin');

        if (isSuperAdmin) {
          router.push('/portfolio');
        } else if (isPmcAdmin) {
          router.push('/portfolio');
        } else {
          const nextUrl = searchParams?.get('next') || '/portfolio';
          router.push(nextUrl);
        }
        return;
      }

      setError('Login failed. Please try again.');
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err?.detail || err?.message || 'An error occurred during login.';
      
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to fetch')) {
        setError('Unable to connect to server. Please ensure the API server is running.');
      } else if (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('incorrect')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // UI only - no backend implementation
    console.log('Google login clicked (UI only)');
    // TODO: Implement Google OAuth when backend is ready
  };

  const handleAppleLogin = () => {
    // UI only - no backend implementation
    console.log('Apple login clicked (UI only)');
    // TODO: Implement Apple Sign In when backend is ready
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-20" />
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 relative z-10">
        <div className="p-8 sm:p-10">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <HiShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Sign in to Pinaka
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert color="failure" className="mb-6" onDismiss={() => setError(null)}>
              <div>
                <div className="font-medium">Authentication Error</div>
                <div className="text-sm mt-1">{error}</div>
              </div>
            </Alert>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              color="light"
              className="w-full h-12 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>

            <Button
              type="button"
              color="light"
              className="w-full h-12 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={handleAppleLogin}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="#000000"/>
              </svg>
              Continue with Apple
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Email Address
              </label>
              <TextInput
                id="email"
                type="email"
                icon={HiMail}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(null);
                }}
                color={emailError ? 'failure' : undefined}
                required
                className="h-12"
                autoComplete="username"
                disabled={loading}
              />
              {emailError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-900 dark:text-white">
                  Password
                </label>
                <a
                  href="#"
                  className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: Implement forgot password flow
                    console.log('Forgot password clicked');
                  }}
                >
                  Forgot password?
                </a>
              </div>
              <TextInput
                id="password"
                type="password"
                icon={HiLockClosed}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(null);
                }}
                color={passwordError ? 'failure' : undefined}
                required
                className="h-12"
                autoComplete="current-password"
                disabled={loading}
              />
              {passwordError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {passwordError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-0 shadow-lg transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          {/* Security Badge */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
              <HiShieldCheck className="w-4 h-4 text-green-500" />
              <span>Secure authentication with encrypted connection</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

