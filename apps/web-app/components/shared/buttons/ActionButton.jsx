"use client";

/**
 * ActionButton Component
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
import { Button, Tooltip } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  EyeOutlined,
  SendOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  ReloadOutlined,
  CopyOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';

const ACTION_CONFIG = {
  add: {
    icon: <PlusOutlined />,
    type: 'primary',
    defaultTooltip: 'Add',
    defaultText: 'Add',
  },
  edit: {
    icon: <EditOutlined />,
    type: 'default',
    defaultTooltip: 'Edit',
    defaultText: 'Edit',
  },
  delete: {
    icon: <DeleteOutlined />,
    type: 'default',
    danger: true,
    defaultTooltip: 'Delete',
    defaultText: 'Delete',
  },
  save: {
    icon: <SaveOutlined />,
    type: 'primary',
    defaultTooltip: 'Save',
    defaultText: 'Save',
  },
  cancel: {
    icon: <CloseOutlined />,
    type: 'default',
    defaultTooltip: 'Cancel',
    defaultText: 'Cancel',
  },
  view: {
    icon: <EyeOutlined />,
    type: 'default',
    defaultTooltip: 'View',
    defaultText: 'View',
  },
  send: {
    icon: <SendOutlined />,
    type: 'default',
    defaultTooltip: 'Send',
    defaultText: 'Send',
  },
  download: {
    icon: <DownloadOutlined />,
    type: 'default',
    defaultTooltip: 'Download',
    defaultText: 'Download',
  },
  approve: {
    icon: <CheckCircleOutlined />,
    type: 'primary',
    defaultTooltip: 'Approve',
    defaultText: 'Approve',
  },
  reject: {
    icon: <CloseCircleOutlined />,
    type: 'default',
    danger: true,
    defaultTooltip: 'Reject',
    defaultText: 'Reject',
  },
  archive: {
    icon: <FileTextOutlined />,
    type: 'default',
    defaultTooltip: 'Archive',
    defaultText: 'Archive',
  },
  refresh: {
    icon: <ReloadOutlined />,
    type: 'default',
    defaultTooltip: 'Refresh',
    defaultText: 'Refresh',
  },
  copy: {
    icon: <CopyOutlined />,
    type: 'default',
    defaultTooltip: 'Copy',
    defaultText: 'Copy',
  },
  share: {
    icon: <ShareAltOutlined />,
    type: 'default',
    defaultTooltip: 'Share',
    defaultText: 'Share',
  },
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
  buttonType, // 'default' | 'text' | 'link' - overrides config.type for table actions
  ...restProps
}) {
  const config = ACTION_CONFIG[action];
  
  if (!config) {
    console.warn(`[ActionButton] Unknown action: ${action}`);
    return null;
  }

  // Use buttonType prop if provided (for table actions), otherwise use config.type
  const finalType = buttonType || config.type;
  
  // For icon-only buttons (no text), use 'text' type for cleaner appearance in tables
  // For buttons with text, use the configured type
  const isIconOnly = !showText;
  const buttonTypeForIconOnly = isIconOnly && (buttonType === 'text' || buttonType === 'link') ? 'text' : finalType;
  
  // Wrap onClick to add debugging and ensure it's called
  // Note: onClick from useGridActions expects to be called with the event
  // and will handle passing the record internally
  const handleClick = onClick ? (e) => {
    console.log(`[ActionButton] ${action} button clicked`, { onClick: !!onClick, event: e });
    if (e) {
      e.stopPropagation();
    }
    // Call the onClick handler - it will handle the record internally
    if (onClick) {
      onClick(e);
    }
  } : undefined;
  
  const buttonProps = {
    type: buttonTypeForIconOnly,
    danger: config.danger,
    icon: config.icon,
    onClick: handleClick,
    loading,
    disabled,
    size,
    shape: showText ? 'round' : undefined, // No shape for icon-only buttons in tables
    style: {
      cursor: disabled ? 'not-allowed' : 'pointer',
      ...restProps.style,
    },
    ...restProps,
  };

  if (htmlType) {
    buttonProps.htmlType = htmlType;
  }

  const button = <Button {...buttonProps}>{showText && (text || config.defaultText)}</Button>;
  const tooltipText = tooltip || config.defaultTooltip;

  // Wrap in Tooltip if needed - Tooltip should not block onClick events
  // For icon-only buttons, Tooltip can wrap the button directly
  if (tooltipText && !showText) {
    return (
      <Tooltip title={tooltipText} mouseEnterDelay={0.3}>
        {button}
      </Tooltip>
    );
  }
  
  return button;
}

