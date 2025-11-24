"use client";

import { Button } from 'flowbite-react';
import { HiDownload, HiX } from 'react-icons/hi';

export default function BulkActionsToolbar({
  selectionCount,
  onBulkDelete,
  onBulkExport,
  onBulkUpdateStatus,
  availableActions = ['export'], // Default to only export
  customActions = [],
}) {
  if (selectionCount === 0) {
    return null;
  }

  return (
    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-semibold text-gray-900 dark:text-white">
          {selectionCount} item(s) selected
        </span>
        <span className="text-gray-400">|</span>
        
        {/* Only show export - delete and status updates removed */}
        {availableActions.includes('export') && onBulkExport && (
          <Button 
            color="light" 
            size="sm" 
            onClick={onBulkExport}
            className="flex items-center gap-2"
          >
            <HiDownload className="h-4 w-4" />
            Export
          </Button>
        )}

        {customActions.map((action, index) => (
          <Button
            key={index}
            color={action.color || 'light'}
            size="sm"
            onClick={() => action.onClick(selectionCount)}
            className="flex items-center gap-2"
          >
            {action.icon && <span>{action.icon}</span>}
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
