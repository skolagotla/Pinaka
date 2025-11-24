/**
 * useFloatingActions Hook
 * 
 * Provides standardized floating action buttons for mobile and overlay contexts
 * 
 * @param {Array} actions - Array of action configs
 * @param {string} position - 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
 * @returns {Array} Floating action button components
 * 
 * Usage:
 *   const floatingActions = useFloatingActions({
 *     actions: [
 *       { icon: <PlusOutlined />, onClick: handleAdd, tooltip: 'Add' },
 *       { icon: <SearchOutlined />, onClick: handleSearch, tooltip: 'Search' },
 *     ],
 *     position: 'bottom-right',
 *   });
 * 
 *   // In component:
 *   {floatingActions}
 */

import React from 'react';
import { FloatingActionButton } from '@/components/shared/buttons';

export function useFloatingActions({ actions = [], position = 'bottom-right' }) {
  if (!Array.isArray(actions) || actions.length === 0) {
    return [];
  }

  // Calculate offset for multiple buttons (stacked vertically)
  const baseOffset = 24;
  const buttonSpacing = 64; // Button size + gap

  return actions.map((action, index) => {
    const offset = baseOffset + (actions.length - 1 - index) * buttonSpacing;
    
    return (
      <FloatingActionButton
        key={index}
        icon={action.icon}
        onClick={action.onClick}
        tooltip={action.tooltip}
        position={position}
        offset={offset}
        type={action.type || 'primary'}
        loading={action.loading}
        disabled={action.disabled}
        {...action.props}
      />
    );
  });
}

