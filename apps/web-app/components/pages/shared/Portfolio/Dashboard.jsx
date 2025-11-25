"use client";

import React from 'react';
import PortfolioClient from './ui';

/**
 * Portfolio Dashboard Component
 * Wraps the existing Portfolio UI component for the /portfolio route
 */
export default function PortfolioDashboard({ userRole, user }) {
  return <PortfolioClient userRole={userRole} user={user} />;
}

