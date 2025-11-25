"use client";

import { useEffect, useState } from 'react';
import { useTour } from './TourProvider';
import TourBackdrop from './TourBackdrop';
import Spotlight from './Spotlight';
import TourTooltip from './TourTooltip';

export default function GuidedTour() {
  const {
    isActive,
    currentStep,
    currentTour,
    nextStep,
    prevStep,
    stopTour,
  } = useTour();

  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !currentTour) {
      setTargetElement(null);
      return;
    }

    const step = currentTour.steps[currentStep];
    if (!step) {
      setTargetElement(null);
      return;
    }

    // Execute action if provided
    if (step.action) {
      step.action();
    }

    // Find target element
    const findTarget = () => {
      let element: HTMLElement | null = null;

      // Try data-tour-id first
      if (step.target.startsWith('[data-tour-id=')) {
        const id = step.target.match(/data-tour-id="([^"]+)"/)?.[1];
        if (id) {
          element = document.querySelector(`[data-tour-id="${id}"]`) as HTMLElement;
        }
      } else {
        // Try as CSS selector
        element = document.querySelector(step.target) as HTMLElement;
      }

      // If not found, try to find by ID
      if (!element && step.target.includes('#')) {
        const id = step.target.replace(/[#\[\]]/g, '');
        element = document.getElementById(id);
      }

      // Scroll element into view if found
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Small delay to ensure scroll completes
        setTimeout(() => {
          setTargetElement(element);
        }, 300);
      } else {
        // If element not found, still show tooltip in center
        setTargetElement(null);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(findTarget, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [isActive, currentStep, currentTour]);

  if (!isActive || !currentTour) return null;

  const step = currentTour.steps[currentStep];
  if (!step) return null;

  return (
    <>
      <TourBackdrop
        targetElement={targetElement}
        isActive={isActive}
        onClick={stopTour}
      />
      <Spotlight
        targetElement={targetElement}
        isActive={isActive && !!targetElement}
      />
      <TourTooltip
        targetElement={targetElement}
        title={step.title}
        content={step.content}
        position={step.position || 'bottom'}
        currentStep={currentStep}
        totalSteps={currentTour.steps.length}
        onNext={nextStep}
        onPrev={prevStep}
        onClose={stopTour}
        isActive={isActive}
      />
    </>
  );
}

