"use client";

import { useEffect, useRef } from 'react';

interface SpotlightProps {
  targetElement: HTMLElement | null;
  isActive: boolean;
}

export default function Spotlight({ targetElement, isActive }: SpotlightProps) {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !targetElement || !spotlightRef.current) return;

    const updateSpotlight = () => {
      if (!spotlightRef.current || !targetElement) return;

      const rect = targetElement.getBoundingClientRect();
      const spotlight = spotlightRef.current;

      spotlight.style.position = 'fixed';
      spotlight.style.top = `${rect.top - 4}px`;
      spotlight.style.left = `${rect.left - 4}px`;
      spotlight.style.width = `${rect.width + 8}px`;
      spotlight.style.height = `${rect.height + 8}px`;
    };

    updateSpotlight();
    window.addEventListener('scroll', updateSpotlight);
    window.addEventListener('resize', updateSpotlight);

    return () => {
      window.removeEventListener('scroll', updateSpotlight);
      window.removeEventListener('resize', updateSpotlight);
    };
  }, [isActive, targetElement]);

  if (!isActive || !targetElement) return null;

  return (
    <div
      ref={spotlightRef}
      className="pointer-events-none fixed z-[9999] rounded-lg border-4 border-purple-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] transition-all duration-300"
      style={{
        boxShadow: '0 0 0 4px rgba(147, 51, 234, 0.5), 0 0 20px rgba(147, 51, 234, 0.3)',
      }}
    />
  );
}

