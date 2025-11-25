"use client";

import { ReactNode } from 'react';
import Link from 'next/link';
import { Card } from 'flowbite-react';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep?: number;
  totalSteps?: number;
  stepLabels?: string[];
}

export default function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  stepLabels,
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/portfolio" className="inline-flex items-center">
            <img
              src="/favicon.ico"
              alt="Pinaka Logo"
              className="mr-3 h-10"
            />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              Pinaka
            </span>
          </Link>
        </div>

        {/* Stepper */}
        {currentStep && totalSteps && stepLabels && (
          <div className="mb-6">
            <Card>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Step {currentStep} of {totalSteps}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {Math.round((currentStep / totalSteps) * 100)}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  {stepLabels.map((label, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;
                    const isPending = stepNumber > currentStep;

                    return (
                      <div
                        key={stepNumber}
                        className="flex flex-col items-center flex-1"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                            isCompleted
                              ? 'bg-purple-600 text-white'
                              : isCurrent
                              ? 'bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300 border-2 border-purple-600'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {isCompleted ? '✓' : stepNumber}
                        </div>
                        <span
                          className={`mt-2 text-xs text-center max-w-[80px] ${
                            isCurrent
                              ? 'text-purple-600 dark:text-purple-400 font-medium'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Content */}
        <Card className="shadow-2xl">
          {children}
        </Card>
      </div>
    </div>
  );
}

