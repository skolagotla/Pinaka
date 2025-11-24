"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, TextInput, Alert, Checkbox, Label } from 'flowbite-react';
import { HiLockClosed, HiUser } from 'react-icons/hi';
import LoginIllustration from '@/components/admin/LoginIllustration';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    const errorParam = searchParams?.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Use adminApi for authentication
      const { adminApi } = await import('@/lib/api/admin-api');
      const loginResult = await adminApi.login(email, password);
      
      // Store token if provided
      if (loginResult.access_token) {
        localStorage.setItem('v2_access_token', loginResult.access_token);
      }
      
      // Get user info
      const user = await adminApi.getCurrentUser();
      if (user && user.success && user.user) {
        // Store user data
        localStorage.setItem('v2_user', JSON.stringify(user.user));
        router.push('/admin/dashboard');
        return;
      }
      
      setError('Login failed. Please check your credentials.');
    } catch (err) {
      console.error('Login error:', err);
      setError(err?.message || 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full mx-auto grid lg:grid-cols-2 gap-0 px-0 py-0 max-w-none relative z-10">
        {/* Login Form - Left Side */}
        <div className="w-full flex items-center justify-center px-6 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20 xl:px-16 xl:py-24 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm lg:bg-white dark:lg:bg-gray-900 lg:backdrop-blur-none">
          <div className="w-full max-w-md mx-auto">
            {/* Logo & Branding */}
            <div className="mb-8 text-center lg:text-left">
              <div className="inline-flex items-center justify-center lg:justify-start mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                  <HiLockClosed className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent" suppressHydrationWarning>
                  Pinaka Platform Admin
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
                Welcome back
              </h1>
              <p className="text-base text-gray-600 dark:text-gray-300">
                Sign in to access the Platform Administrator dashboard
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

            <form onSubmit={handlePasswordLogin} className="space-y-5">
              <div>
                <Label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Email address
                </Label>
                <TextInput
                  id="email"
                  type="email"
                  placeholder="admin@pinaka.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full h-12 text-base"
                  theme={{
                    field: {
                      input: {
                        base: "block w-full border disabled:cursor-not-allowed disabled:opacity-50",
                        sizes: {
                          md: "p-3 text-base"
                        }
                      }
                    }
                  }}
                />
              </div>
              <div>
                <Label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <TextInput
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full h-12 text-base"
                  theme={{
                    field: {
                      input: {
                        base: "block w-full border disabled:cursor-not-allowed disabled:opacity-50",
                        sizes: {
                          md: "p-3 text-base"
                        }
                      }
                    }
                  }}
                />
              </div>

              {/* Remember me and Forgot password */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <Checkbox id="remember" className="rounded" />
                  <Label htmlFor="remember" className="ml-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <a
                  href="#"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset coming soon');
                  }}
                >
                  Forgot password?
                </a>
              </div>

              {/* Sign in button */}
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all shadow-lg shadow-blue-500/50" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign in to your account'
                )}
              </Button>

              {/* Divider with "or" */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  color="light"
                  className="w-full h-11 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                  onClick={() => {
                    alert('Social login coming soon');
                  }}
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#google)">
                      <path d="M20.3081 10.2303C20.3081 9.55056 20.253 8.86711 20.1354 8.19836H10.7031V12.0492H16.1046C15.8804 13.2911 15.1602 14.3898 14.1057 15.0879V17.5866H17.3282C19.2205 15.8449 20.3081 13.2728 20.3081 10.2303Z" fill="#3F83F8"/>
                      <path d="M10.7019 20.0006C13.3989 20.0006 15.6734 19.1151 17.3306 17.5865L14.1081 15.0879C13.2115 15.6979 12.0541 16.0433 10.7056 16.0433C8.09669 16.0433 5.88468 14.2832 5.091 11.9169H1.76562V14.4927C3.46322 17.8695 6.92087 20.0006 10.7019 20.0006Z" fill="#34A853"/>
                      <path d="M5.08857 11.9169C4.66969 10.6749 4.66969 9.33008 5.08857 8.08811V5.51233H1.76688C0.348541 8.33798 0.348541 11.667 1.76688 14.4927L5.08857 11.9169Z" fill="#FBBC04"/>
                      <path d="M10.7019 3.95805C12.1276 3.936 13.5055 4.47247 14.538 5.45722L17.393 2.60218C15.5852 0.904587 13.1858 -0.0287217 10.7019 0.000673888C6.92087 0.000673888 3.46322 2.13185 1.76562 5.51234L5.08732 8.08813C5.87733 5.71811 8.09302 3.95805 10.7019 3.95805Z" fill="#EA4335"/>
                    </g>
                    <defs><clipPath id="google"><rect width="20" height="20" fill="white" transform="translate(0.5)"/></clipPath></defs>
                  </svg>
                  Google
                </Button>
                <Button
                  type="button"
                  color="light"
                  className="w-full h-11 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                  onClick={() => {
                    alert('Social login coming soon');
                  }}
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#apple)">
                      <path d="M18.6574 15.5863C18.3549 16.2851 17.9969 16.9283 17.5821 17.5196C17.0167 18.3257 16.5537 18.8838 16.1969 19.1936C15.6439 19.7022 15.0513 19.9627 14.4168 19.9775C13.9612 19.9775 13.4119 19.8479 12.7724 19.585C12.1308 19.3232 11.5412 19.1936 11.0021 19.1936C10.4366 19.1936 9.83024 19.3232 9.18162 19.585C8.53201 19.8479 8.00869 19.985 7.60858 19.9985C7.00008 20.0245 6.39356 19.7566 5.78814 19.1936C5.40174 18.8566 4.91842 18.2788 4.33942 17.4603C3.71821 16.5863 3.20749 15.5727 2.80738 14.4172C2.37887 13.1691 2.16406 11.9605 2.16406 10.7904C2.16406 9.45009 2.45368 8.29407 3.03379 7.32534C3.4897 6.54721 4.09622 5.9334 4.85533 5.4828C5.61445 5.03219 6.43467 4.80257 7.31797 4.78788C7.80129 4.78788 8.4351 4.93738 9.22273 5.2312C10.0081 5.52601 10.5124 5.67551 10.7335 5.67551C10.8988 5.67551 11.4591 5.5007 12.4088 5.15219C13.3069 4.82899 14.0649 4.69517 14.6859 4.74788C16.3685 4.88368 17.6327 5.54699 18.4734 6.74202C16.9685 7.65384 16.2241 8.93097 16.2389 10.5693C16.2525 11.8454 16.7154 12.9074 17.6253 13.7506C18.0376 14.1419 18.4981 14.4444 19.0104 14.6592C18.8993 14.9814 18.7821 15.29 18.6574 15.5863ZM14.7982 0.400358C14.7982 1.40059 14.4328 2.3345 13.7044 3.19892C12.8254 4.22654 11.7623 4.82035 10.6093 4.72665C10.5947 4.60665 10.5861 4.48036 10.5861 4.34765C10.5861 3.38743 11.0041 2.3598 11.7465 1.51958C12.1171 1.09416 12.5884 0.740434 13.16 0.458257C13.7304 0.18029 14.2698 0.0265683 14.7772 0.000244141C14.7921 0.133959 14.7982 0.267682 14.7982 0.400345V0.400358Z" fill="currentColor"/>
                    </g>
                    <defs><clipPath id="apple"><rect width="20" height="20" fill="white" transform="translate(0.5)"/></clipPath></defs>
                  </svg>
                  Apple
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Custom Illustration - Right Side */}
        <div className="hidden lg:flex items-center justify-center p-8 xl:p-12 bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-purple-600/10 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20">
          <div className="w-full h-full max-w-4xl flex items-center justify-center">
            <LoginIllustration className="w-full h-full min-h-[600px]" />
          </div>
        </div>
      </div>
    </section>
  );
}
