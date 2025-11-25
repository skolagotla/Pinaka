"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useTourState, TourConfig } from '@/lib/hooks/useTourState';

interface TourContextType {
  isActive: boolean;
  currentStep: number;
  currentTour: TourConfig | null;
  startTour: (tour: TourConfig) => void;
  stopTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (stepIndex: number) => void;
  isTourCompleted: (tourId: string) => boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: ReactNode }) {
  const tourState = useTourState();

  return (
    <TourContext.Provider value={tourState}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}

