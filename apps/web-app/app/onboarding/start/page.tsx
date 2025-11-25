"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from 'flowbite-react';
import { HiArrowRight, HiCheckCircle } from 'react-icons/hi';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useOnboarding } from '@/lib/hooks/useOnboarding';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import { Spinner } from 'flowbite-react';

export default function OnboardingStartPage() {
  const router = useRouter();
  const { user, loading: authLoading, hasRole } = useV2Auth();
  const { status, loading: onboardingLoading } = useOnboarding();

  useEffect(() => {
    // Redirect if already completed onboarding
    if (!onboardingLoading && status?.onboarding_completed) {
      router.push('/portfolio');
    }
  }, [status, onboardingLoading, router]);

  if (authLoading || onboardingLoading) {
    return (
      <OnboardingLayout>
        <div className="flex justify-center items-center py-12">
          <Spinner size="xl" />
        </div>
      </OnboardingLayout>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  // Determine role and get step labels
  const getRoleSteps = () => {
    if (hasRole('super_admin')) {
      return {
        totalSteps: 5,
        stepLabels: ['Welcome', 'Profile', 'PMCs', 'Invite Admins', 'Complete'],
        nextStep: '/onboarding/profile',
      };
    } else if (hasRole('pmc_admin')) {
      return {
        totalSteps: 6,
        stepLabels: ['Welcome', 'Profile', 'Organization', 'Properties', 'Invite Team', 'Complete'],
        nextStep: '/onboarding/profile',
      };
    } else if (hasRole('pm')) {
      return {
        totalSteps: 5,
        stepLabels: ['Welcome', 'Profile', 'Properties', 'Preferences', 'Complete'],
        nextStep: '/onboarding/profile',
      };
    } else if (hasRole('landlord')) {
      return {
        totalSteps: 5,
        stepLabels: ['Welcome', 'Profile', 'Properties', 'Preferences', 'Complete'],
        nextStep: '/onboarding/profile',
      };
    } else if (hasRole('tenant')) {
      return {
        totalSteps: 5,
        stepLabels: ['Welcome', 'Profile', 'Lease', 'Preferences', 'Complete'],
        nextStep: '/onboarding/profile',
      };
    } else if (hasRole('vendor')) {
      return {
        totalSteps: 4,
        stepLabels: ['Welcome', 'Profile', 'Services', 'Complete'],
        nextStep: '/onboarding/profile',
      };
    }
    return {
      totalSteps: 3,
      stepLabels: ['Welcome', 'Profile', 'Complete'],
      nextStep: '/onboarding/profile',
    };
  };

  const roleSteps = getRoleSteps();

  const handleStart = () => {
    router.push(roleSteps.nextStep);
  };

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={roleSteps.totalSteps}
      stepLabels={roleSteps.stepLabels}
    >
      <div className="text-center space-y-6 py-8">
        <div className="space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mx-auto">
            <HiCheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to Pinaka!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Let's get you set up. This will only take a few minutes.
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 text-left max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            What we'll cover:
          </h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            {roleSteps.stepLabels.slice(1, -1).map((step, index) => (
              <li key={index} className="flex items-center">
                <HiCheckCircle className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-6">
          <Button
            size="lg"
            onClick={handleStart}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            Get Started
            <HiArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}

