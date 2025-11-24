/**
 * Star Rating Component
 * A simple star rating display component (replaces Ant Design Rate)
 */

"use client";

import React from 'react';

export default function StarRating({ value, max = 5, size = 'sm' }) {
  const fullStars = Math.floor(value);
  const hasHalfStar = value % 1 >= 0.5;
  const emptyStars = max - fullStars - (hasHalfStar ? 1 : 0);
  
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.sm;
  
  return (
    <div className={`flex items-center gap-1 ${sizeClass}`}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <span key={i} className="text-yellow-400">★</span>
      ))}
      {hasHalfStar && <span className="text-yellow-400">☆</span>}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <span key={i} className="text-gray-300">★</span>
      ))}
    </div>
  );
}

