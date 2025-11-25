"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Spinner } from 'flowbite-react';
import { HiCheckCircle, HiArrowRight } from 'react-icons/hi';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useOnboarding } from '@/lib/hooks/useOnboarding';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';

export default function OnboardingCompletePage() {
  const router = useRouter();
  const { user } = useV2Auth();
  const { complete, loading } = useOnboarding();
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const finishOnboarding = async () => {
      try {
        setCompleting(true);
        await complete();
        // Small delay to show success message
        setTimeout(() => {
          router.push('/portfolio');
        }, 2000);
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
        // Still redirect after a delay
        setTimeout(() => {
          router.push('/portfolio');
        }, 2000);
      }
    };

    if (!loading) {
      finishOnboarding();
    }
  }, [complete, loading, router]);

  return (
    <OnboardingLayout>
      <div className="text-center space-y-6 py-12">
        <div className="space-y-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto">
            <HiCheckCircle className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            You're All Set!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your account has been set up successfully. You're ready to start using Pinaka.
          </p>
        </div>

        {completing ? (
          <div className="flex flex-col items-center space-y-4">
            <Spinner size="xl" />
            <p className="text-gray-600 dark:text-gray-400">
              Completing setup...
            </p>
          </div>
        ) : (
          <div className="pt-6">
            <Button
              size="lg"
              onClick={() => router.push('/portfolio')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Go to Dashboard
              <HiArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
}

