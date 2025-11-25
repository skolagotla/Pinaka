/**
 * Tour State Management Hook
 */
"use client";

import { useState, useCallback, useEffect } from 'react';

export interface TourStep {
  id: string;
  target: string; // CSS selector or data-tour-id
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void; // Optional action to perform before showing step
}

export interface TourConfig {
  id: string;
  name: string;
  steps: TourStep[];
}

export function useTourState() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentTour, setCurrentTour] = useState<TourConfig | null>(null);
  const [completedTours, setCompletedTours] = useState<Set<string>>(new Set());

  // Load completed tours from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pinaka_tour_completed');
      if (stored) {
        try {
          const completed = JSON.parse(stored);
          setCompletedTours(new Set(completed));
        } catch (e) {
          console.error('Failed to parse completed tours:', e);
        }
      }
    }
  }, []);

  const startTour = useCallback((tour: TourConfig) => {
    setCurrentTour(tour);
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const stopTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    if (currentTour) {
      const newCompleted = new Set(completedTours);
      newCompleted.add(currentTour.id);
      setCompletedTours(newCompleted);
      if (typeof window !== 'undefined') {
        localStorage.setItem('pinaka_tour_completed', JSON.stringify(Array.from(newCompleted)));
      }
    }
    setCurrentTour(null);
  }, [currentTour, completedTours]);

  const nextStep = useCallback(() => {
    if (!currentTour) return;
    
    if (currentStep < currentTour.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      stopTour();
    }
  }, [currentStep, currentTour, stopTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((stepIndex: number) => {
    if (currentTour && stepIndex >= 0 && stepIndex < currentTour.steps.length) {
      setCurrentStep(stepIndex);
    }
  }, [currentTour]);

  const isTourCompleted = useCallback((tourId: string) => {
    return completedTours.has(tourId);
  }, [completedTours]);

  return {
    isActive,
    currentStep,
    currentTour,
    startTour,
    stopTour,
    nextStep,
    prevStep,
    goToStep,
    isTourCompleted,
  };
}

