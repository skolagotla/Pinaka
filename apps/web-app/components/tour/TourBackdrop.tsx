"use client";

import { useEffect, useRef } from 'react';

interface TourBackdropProps {
  targetElement: HTMLElement | null;
  isActive: boolean;
  onClick?: () => void;
}

export default function TourBackdrop({
  targetElement,
  isActive,
  onClick,
}: TourBackdropProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !targetElement || !backdropRef.current) return;

    const updateBackdrop = () => {
      if (!backdropRef.current || !targetElement) return;

      const rect = targetElement.getBoundingClientRect();
      const backdrop = backdropRef.current;

      // Create a clip path that highlights the target element
      const clipPath = `polygon(
        0% 0%,
        0% 100%,
        ${rect.left}px 100%,
        ${rect.left}px ${rect.top}px,
        ${rect.right}px ${rect.top}px,
        ${rect.right}px ${rect.bottom}px,
        ${rect.left}px ${rect.bottom}px,
        ${rect.left}px 100%,
        100% 100%,
        100% 0%
      )`;

      backdrop.style.clipPath = clipPath;
    };

    updateBackdrop();
    window.addEventListener('scroll', updateBackdrop);
    window.addEventListener('resize', updateBackdrop);

    return () => {
      window.removeEventListener('scroll', updateBackdrop);
      window.removeEventListener('resize', updateBackdrop);
    };
  }, [isActive, targetElement]);

  if (!isActive) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm transition-all duration-300"
      onClick={onClick}
      style={{
        pointerEvents: onClick ? 'auto' : 'none',
      }}
    />
  );
}

