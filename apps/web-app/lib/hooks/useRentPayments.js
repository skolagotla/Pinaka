"use client";

import { useState, useEffect, useMemo } from 'react';

/**
 * Custom hook for rent payment/receipt management
 * Handles data fetching, loading states, and stats calculation
 * Used by both landlord and tenant sides
 * 
 * @param {Array} initialData - Initial data (from server)
 * @param {Object} options - Configuration options
 * @param {string} options.userRole - 'landlord' or 'tenant'
 * @param {string} options.apiEndpoint - API endpoint to fetch data from
 * @param {boolean} options.autoRefresh - Enable auto-refresh (default: false)
 * @param {number} options.refreshInterval - Refresh interval in ms (default: 60000)
 * @returns {Object} Hook state and methods
 */
export function useRentPayments(initialData, options = {}) {
  const {
    userRole = 'tenant',
    apiEndpoint,
    autoRefresh = false,
    refreshInterval = 60000,
  } = options;

  const [data, setData] = useState(initialData || []);
  const [loading, setLoading] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);

  // Fetch data from API
  const fetchData = async () => {
    if (!apiEndpoint) return;
    
    setLoading(true);
    try {
      const response = await fetch(apiEndpoint);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching rent payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh capability
  useEffect(() => {
    if (autoRefresh && apiEndpoint) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, apiEndpoint, refreshInterval]);

  // Calculate stats (landlord-only)
  const stats = useMemo(() => {
    if (userRole !== 'landlord') return null;
    
    const total = data.length;
    const totalAmount = data.reduce((sum, p) => sum + p.amount, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate amounts for each status
    let paidAmount = 0;
    let unpaidAmount = 0;
    let overdueAmount = 0;
    let partialAmount = 0;
    
    // Currency breakdowns - first build totalByCurrency
    const totalByCurrency = {};
    
    for (const payment of data) {
      const country = payment.lease?.unit?.property?.country || 'US';
      const currency = country === 'CA' ? 'CAD' : 'USD';
      
      // Track total by currency
      if (!totalByCurrency[currency]) {
        totalByCurrency[currency] = 0;
      }
      totalByCurrency[currency] += payment.amount;
    }
    
    // Initialize paid, unpaid, overdue, and partial with all currencies (defaults to 0)
    const paidByCurrency = { ...totalByCurrency };
    Object.keys(paidByCurrency).forEach(key => paidByCurrency[key] = 0);
    
    const unpaidByCurrency = { ...totalByCurrency };
    Object.keys(unpaidByCurrency).forEach(key => unpaidByCurrency[key] = 0);
    
    const overdueByCurrency = { ...totalByCurrency };
    Object.keys(overdueByCurrency).forEach(key => overdueByCurrency[key] = 0);
    
    const partialByCurrency = { ...totalByCurrency };
    Object.keys(partialByCurrency).forEach(key => partialByCurrency[key] = 0);
    
    // Now process payments to update the amounts
    for (const payment of data) {
      const country = payment.lease?.unit?.property?.country || 'US';
      const currency = country === 'CA' ? 'CAD' : 'USD';
      
      if (payment.status === "Paid" || payment.balance === 0) {
        // Full payment received
        paidAmount += payment.amount;
        paidByCurrency[currency] += payment.amount;
      } else if (payment.status === "Unpaid" && payment.balance === payment.amount) {
        // Full amount is unpaid
        unpaidAmount += payment.amount;
        unpaidByCurrency[currency] += payment.amount;
      } else if (payment.status === "Partial" || (payment.balance > 0 && payment.balance < payment.amount)) {
        // Partial payment made
        const paidPortion = payment.amount - payment.balance;
        paidAmount += paidPortion;
        paidByCurrency[currency] += paidPortion;
        
        partialAmount += payment.balance;
        partialByCurrency[currency] += payment.balance;
      }
      
      // Check if overdue
      const dueDate = new Date(payment.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      if (payment.balance > 0 && dueDate < today) {
        overdueAmount += payment.balance;
        overdueByCurrency[currency] += payment.balance;
      }
    }
    
    return {
      total,
      totalAmount,
      paidAmount,
      unpaidAmount,
      overdueAmount,
      partialAmount,
      totalByCurrency,
      paidByCurrency,
      unpaidByCurrency,
      overdueByCurrency,
      partialByCurrency,
    };
  }, [data, userRole]);

  return {
    data,
    setData,
    loading,
    setLoading,
    viewingReceipt,
    setViewingReceipt,
    stats, // null for tenants, object for landlords
    fetchData,
  };
}

