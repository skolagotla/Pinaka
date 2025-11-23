"use client";

/**
 * ActionButton Component (Flowbite Version)
 * 
 * Standardized action button for common actions
 * Ensures consistent look and feel across all pages
 * 
 * @param {string} action - 'add' | 'edit' | 'delete' | 'save' | 'cancel' | 'view' | 'send' | 'download' | 'approve' | 'reject' | 'archive' | 'refresh' | 'copy' | 'share'
 * @param {function} onClick - Click handler
 * @param {boolean} loading - Loading state
 * @param {boolean} disabled - Disabled state
 * @param {string} tooltip - Tooltip text
 * @param {string} size - 'small' | 'middle' | 'large' (default: 'large')
 * @param {boolean} showText - Show text label (default: false for icon-only)
 * @param {string} text - Custom text label
 * @param {string} buttonType - 'default' | 'text' | 'link' (for table actions, use 'link' or 'text')
 */

import React from 'react';
import { Button, Tooltip } from 'flowbite-react';
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiSave,
  HiX,
  HiEye,
  HiPaperAirplane,
  HiDownload,
  HiCheckCircle,
  HiXCircle,
  HiDocumentText,
  HiRefresh,
  HiClipboard,
  HiShare,
} from 'react-icons/hi';

const ACTION_CONFIG = {
  add: {
    icon: HiPlus,
    color: 'blue',
    defaultTooltip: 'Add',
    defaultText: 'Add',
  },
  edit: {
    icon: HiPencil,
    color: 'gray',
    defaultTooltip: 'Edit',
    defaultText: 'Edit',
  },
  delete: {
    icon: HiTrash,
    color: 'failure',
    defaultTooltip: 'Delete',
    defaultText: 'Delete',
  },
  save: {
    icon: HiSave,
    color: 'blue',
    defaultTooltip: 'Save',
    defaultText: 'Save',
  },
  cancel: {
    icon: HiX,
    color: 'gray',
    defaultTooltip: 'Cancel',
    defaultText: 'Cancel',
  },
  view: {
    icon: HiEye,
    color: 'gray',
    defaultTooltip: 'View',
    defaultText: 'View',
  },
  send: {
    icon: HiPaperAirplane,
    color: 'gray',
    defaultTooltip: 'Send',
    defaultText: 'Send',
  },
  download: {
    icon: HiDownload,
    color: 'gray',
    defaultTooltip: 'Download',
    defaultText: 'Download',
  },
  approve: {
    icon: HiCheckCircle,
    color: 'blue',
    defaultTooltip: 'Approve',
    defaultText: 'Approve',
  },
  reject: {
    icon: HiXCircle,
    color: 'failure',
    defaultTooltip: 'Reject',
    defaultText: 'Reject',
  },
  archive: {
    icon: HiDocumentText,
    color: 'gray',
    defaultTooltip: 'Archive',
    defaultText: 'Archive',
  },
  refresh: {
    icon: HiRefresh,
    color: 'gray',
    defaultTooltip: 'Refresh',
    defaultText: 'Refresh',
  },
  copy: {
    icon: HiClipboard,
    color: 'gray',
    defaultTooltip: 'Copy',
    defaultText: 'Copy',
  },
  share: {
    icon: HiShare,
    color: 'gray',
    defaultTooltip: 'Share',
    defaultText: 'Share',
  },
};

const SIZE_MAP = {
  small: 'xs',
  middle: 'sm',
  large: 'md',
};

export default function ActionButton({
  action,
  onClick,
  loading = false,
  disabled = false,
  tooltip,
  size = 'large',
  showText = false,
  text,
  htmlType,
  buttonType, // 'default' | 'text' | 'link' - overrides config.color for table actions
  ...restProps
}) {
  const config = ACTION_CONFIG[action];
  
  if (!config) {
    console.warn(`[ActionButton] Unknown action: ${action}`);
    return null;
  }

  const Icon = config.icon;
  const flowbiteSize = SIZE_MAP[size] || 'md';
  
  // For icon-only buttons, use outline style; for buttons with text, use solid
  const isIconOnly = !showText;
  const color = buttonType === 'text' || buttonType === 'link' ? 'light' : config.color;
  const outline = isIconOnly && buttonType !== 'text' && buttonType !== 'link';
  
  // Wrap onClick to add debugging and ensure it's called
  const handleClick = onClick ? (e) => {
    console.log(`[ActionButton] ${action} button clicked`, { onClick: !!onClick, event: e });
    if (e) {
      e.stopPropagation();
    }
    if (onClick) {
      onClick(e);
    }
  } : undefined;
  
  const button = (
    <Button
      color={color}
      size={flowbiteSize}
      outline={outline}
      disabled={disabled || loading}
      onClick={handleClick}
      type={htmlType}
      className={buttonType === 'text' || buttonType === 'link' ? 'text-gray-600 hover:text-gray-900' : ''}
      {...restProps}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      <Icon className="h-4 w-4" />
      {showText && <span className="ml-2">{text || config.defaultText}</span>}
    </Button>
  );

  const tooltipText = tooltip || config.defaultTooltip;

  // Wrap in Tooltip if needed - for icon-only buttons
  if (tooltipText && !showText) {
    return (
      <Tooltip content={tooltipText} trigger="hover">
        {button}
      </Tooltip>
    );
  }
  
  return button;
}
