"use client";

import { Card, Progress } from 'flowbite-react';

interface OnboardingStepperProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export default function OnboardingStepper({
  currentStep,
  totalSteps,
  stepLabels,
}: OnboardingStepperProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <Card className="mb-6">
      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress progress={progress} color="purple" size="lg" />
        </div>

        {/* Step Indicators */}
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
                  className={`mt-2 text-xs text-center ${
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
  );
}

