"use client";

import { useState, useEffect } from 'react';
import { Modal, Button } from 'flowbite-react';
import { HiSparkles } from 'react-icons/hi';
import { useTour } from './TourProvider';
import { getTourForRole } from '@/lib/tour/tourSteps';
import { useV2Auth } from '@/lib/hooks/useV2Auth';

// Safe wrapper for useTour
function useTourSafe() {
  try {
    return useTour();
  } catch {
    return null;
  }
}

export default function FirstTimeModal() {
  const [show, setShow] = useState(false);
  const tour = useTourSafe();
  const { hasRole } = useV2Auth();

  useEffect(() => {
    // Check if user has completed onboarding and hasn't seen the tour
    if (typeof window === 'undefined' || !tour) return;

    // Get user's primary role
    let userRole: string | null = null;
    if (hasRole('super_admin')) userRole = 'super_admin';
    else if (hasRole('pmc_admin')) userRole = 'pmc_admin';
    else if (hasRole('pm')) userRole = 'pm';
    else if (hasRole('landlord')) userRole = 'landlord';
    else if (hasRole('tenant')) userRole = 'tenant';
    else if (hasRole('vendor')) userRole = 'vendor';

    if (!userRole) return;

    const tourConfig = getTourForRole(userRole);
    if (!tourConfig) return;

    // Check if tour was already completed
    const completed = tour.isTourCompleted(tourConfig.id);
    
    // Check if this is first visit to portfolio dashboard
    const hasVisitedPortfolio = localStorage.getItem('pinaka_visited_portfolio');
    
    if (!completed && !hasVisitedPortfolio) {
      setShow(true);
      localStorage.setItem('pinaka_visited_portfolio', 'true');
    }
  }, [hasRole, tour]);

  const handleStartTour = () => {
    if (!tour) return;
    
    setShow(false);
    
    // Get user's primary role
    let userRole: string | null = null;
    if (hasRole('super_admin')) userRole = 'super_admin';
    else if (hasRole('pmc_admin')) userRole = 'pmc_admin';
    else if (hasRole('pm')) userRole = 'pm';
    else if (hasRole('landlord')) userRole = 'landlord';
    else if (hasRole('tenant')) userRole = 'tenant';
    else if (hasRole('vendor')) userRole = 'vendor';

    if (!userRole) return;

    const tourConfig = getTourForRole(userRole);
    if (tourConfig) {
      tour.startTour(tourConfig);
    }
  };

  const handleSkip = () => {
    setShow(false);
  };

  if (!show) return null;

  return (
    <Modal show={show} onClose={handleSkip} size="md">
      <Modal.Body className="relative rounded-lg bg-white p-4 shadow dark:bg-gray-800 sm:p-5">
        <div className="mb-4 flex items-center justify-between rounded-t border-b pb-4 dark:border-gray-600 sm:mb-5">
          <div className="flex items-center gap-2">
            <HiSparkles className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              First time here?
            </h3>
          </div>
          <button
            onClick={handleSkip}
            className="absolute right-5 top-[18px] ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
          >
            <span className="sr-only">Close modal</span>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Welcome to Pinaka! Would you like to take a quick guided tour to learn about the key features?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            The tour will show you around the dashboard and help you get started. You can always access it later from the help menu.
          </p>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-600">
          <Button color="gray" onClick={handleSkip}>
            Skip for now
          </Button>
          <Button
            color="purple"
            onClick={handleStartTour}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            Start Tour
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
