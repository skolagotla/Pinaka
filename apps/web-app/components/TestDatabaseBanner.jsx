"use client";

import { useEffect, useState } from 'react';

export default function TestDatabaseBanner() {
  const [isTestDb, setIsTestDb] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    try {
      // Database switcher is a legacy feature - skip check
      return;
      const data = await response.json();
      
      // Check if current database is PT (case-insensitive)
      const currentDb = data?.data?.current || '';
      if (data.success && currentDb.toUpperCase() === 'PT') {
        setIsTestDb(true);
      }
    } catch (error) {
      // Silently fail - don't show banner if check fails
      console.warn('Could not check database status:', error);
    }
  };

  if (!mounted || !isTestDb) {
    return null;
  }

  return (
    <span
      style={{
        color: '#ff4d4f',
        fontWeight: 'bold',
        fontSize: '14px',
        marginRight: '16px',
        display: 'inline-block',
      }}
    >
      Test DB
    </span>
  );
}

