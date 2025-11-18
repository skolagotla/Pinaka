/**
 * SignatureFontProvider Component
 * 
 * Lazy loads signature fonts only when signature component is used
 * This prevents loading 8 Google Fonts on every page load
 */

"use client";

import { useEffect, useState } from 'react';

export default function SignatureFontProvider({ children }) {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Only load fonts when signature component is actually used
    // This prevents blocking initial page load
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Pacifico&family=Allura&family=Alex+Brush&family=Sacramento&family=Satisfy&family=Tangerine:wght@400;700&display=swap';
    link.media = 'print';
    link.onload = () => {
      link.media = 'all';
      setFontsLoaded(true);
    };
    
    // Preconnect for faster font loading
    const preconnect1 = document.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect1);
    
    const preconnect2 = document.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect2);
    
    document.head.appendChild(link);

    return () => {
      // Cleanup on unmount
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, []);

  return children;
}

