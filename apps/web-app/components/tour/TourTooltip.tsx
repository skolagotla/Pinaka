"use client";

import { useEffect, useState, useRef } from 'react';
import { Button } from 'flowbite-react';
import { HiArrowRight, HiArrowLeft, HiX } from 'react-icons/hi';

interface TourTooltipProps {
  targetElement: HTMLElement | null;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  isActive: boolean;
}

export default function TourTooltip({
  targetElement,
  title,
  content,
  position = 'bottom',
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onClose,
  isActive,
}: TourTooltipProps) {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !targetElement || !tooltipRef.current) return;

    const updatePosition = () => {
      if (!targetElement || !tooltipRef.current) return;

      const rect = targetElement.getBoundingClientRect();
      const tooltip = tooltipRef.current;
      const tooltipRect = tooltip.getBoundingClientRect();

      let top = 0;
      let left = 0;

      if (position === 'center') {
        // Center on screen
        top = window.innerHeight / 2 - tooltipRect.height / 2;
        left = window.innerWidth / 2 - tooltipRect.width / 2;
      } else if (position === 'top') {
        top = rect.top - tooltipRect.height - 16;
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;
      } else if (position === 'bottom') {
        top = rect.bottom + 16;
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;
      } else if (position === 'left') {
        top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        left = rect.left - tooltipRect.width - 16;
      } else if (position === 'right') {
        top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        left = rect.right + 16;
      }

      // Keep tooltip within viewport
      const padding = 16;
      top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));
      left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));

      setTooltipPosition({ top, left });
    };

    // Small delay to ensure tooltip is rendered
    setTimeout(updatePosition, 10);
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isActive, targetElement, position]);

  if (!isActive || !targetElement) return null;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div
      ref={tooltipRef}
      className="fixed z-[10000] w-[280px] rounded-xl bg-white p-4 shadow-xl dark:bg-gray-800"
      style={{
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`,
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-2 top-2 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
      >
        <HiX className="h-4 w-4" />
      </button>

      {/* Progress indicator */}
      <div className="mb-3 text-xs font-medium text-gray-500 dark:text-gray-400">
        Step {currentStep + 1} of {totalSteps}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>

      {/* Content */}
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        {content}
      </p>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          {!isFirstStep && (
            <Button
              color="gray"
              size="sm"
              onClick={onPrev}
              className="mr-2"
            >
              <HiArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          )}
        </div>
        <div>
          {isLastStep ? (
            <Button
              color="purple"
              size="sm"
              onClick={onNext}
            >
              Finish
            </Button>
          ) : (
            <Button
              color="purple"
              size="sm"
              onClick={onNext}
            >
              Next
              <HiArrowRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

