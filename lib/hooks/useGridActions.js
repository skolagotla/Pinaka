/**
 * useGridActions Hook
 * 
 * Provides flexible, reusable action buttons for table/grid rows
 * Supports conditional rendering, confirmations, and custom actions
 * 
 * @param {object} config - Configuration object
 * @param {array} config.actions - Array of action definitions
 * @param {string} config.size - Button size: 'small' | 'middle' | 'large' (default: 'small')
 * @param {string} config.buttonType - Button type: 'default' | 'text' | 'link' (default: 'link' for table actions)
 * @param {string} config.spacing - Space size between buttons: 'small' | 'middle' | 'large' (default: 'small')
 * 
 * Action definition:
 * {
 *   type: 'view' | 'edit' | 'delete' | 'send' | 'download' | 'approve' | 'reject' | 'archive' | etc.
 *   onClick: (record) => void - Click handler
 *   condition?: (record) => boolean - Optional condition to show/hide action
 *   tooltip?: string - Custom tooltip text
 *   disabled?: boolean | (record) => boolean - Disable state
 *   loading?: boolean | (record) => boolean - Loading state
 *   confirm?: { title: string, content?: string, onOk?: () => void } - Confirmation dialog config
 *   customIcon?: ReactNode - Custom icon (overrides default)
 *   customText?: string - Custom text label
 *   showText?: boolean - Show text label
 * }
 * 
 * @returns {function} renderActions - Function to render action buttons for a record
 * 
 * Usage:
 *   const { renderActions } = useGridActions({
 *     actions: [
 *       { type: 'view', onClick: (record) => handleView(record) },
 *       { 
 *         type: 'edit', 
 *         onClick: (record) => handleEdit(record),
 *         condition: (record) => record.status === 'draft'
 *       },
 *       { 
 *         type: 'delete', 
 *         onClick: (record) => handleDelete(record.id),
 *         confirm: { title: 'Delete?', content: 'This cannot be undone' }
 *       }
 *     ],
 *     size: 'small',
 *     buttonType: 'link'
 *   });
 * 
 *   // In table columns:
 *   {
 *     title: 'Actions',
 *     key: 'actions',
 *     render: (_, record) => renderActions(record)
 *   }
 */

import React from 'react';
import { Space, Modal, Popconfirm } from 'antd';
import { ActionButton } from '../../apps/web-app/components/shared/buttons';

export function useGridActions({ actions = [], size = 'small', buttonType = 'link', spacing = 'small' } = {}) {
  const renderActions = (record) => {
    if (!actions || actions.length === 0) {
      return null;
    }

    const buttons = [];

    actions.forEach((actionConfig, index) => {
      const {
        type,
        onClick,
        condition,
        tooltip,
        disabled,
        loading,
        confirm,
        customIcon,
        customText,
        showText = false,
        ...restProps
      } = actionConfig;

      // Check condition - if false, skip this action
      if (condition && !condition(record)) {
        return;
      }

      // Evaluate disabled state (can be boolean or function)
      const isDisabled = typeof disabled === 'function' ? disabled(record) : disabled;
      
      // Evaluate loading state (can be boolean or function)
      const isLoading = typeof loading === 'function' ? loading(record) : loading;

      // Create button props (without key - React key must be passed directly)
      const buttonKey = `${type}-${index}`;
      
      // Create onClick handler that will be used
      const handleClick = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        console.log(`[useGridActions] ${type} clicked for record:`, record?.id || record?.email || record);
        try {
          onClick(record);
        } catch (error) {
          console.error(`[useGridActions] Error in ${type} handler:`, error);
        }
      };
      
      const buttonProps = {
        action: type,
        onClick: handleClick,
        tooltip,
        size,
        buttonType,
        disabled: isDisabled,
        loading: isLoading,
        showText,
        text: customText,
        ...restProps,
      };

      // If custom icon provided, we need to handle it differently
      // (ActionButton doesn't support custom icons directly, so we'd need to extend it)
      // For now, we'll use the default icon from ActionButton

      // Handle confirmation dialogs
      if (confirm && type === 'delete') {
        // Delete actions typically use Popconfirm
        // Keep onClick in buttonProps but make it a no-op since Popconfirm handles the confirmation
        const buttonPropsForPopconfirm = {
          ...buttonProps,
          onClick: (e) => {
            // Popconfirm will handle the click, but we still need to prevent default behavior
            if (e) {
              e.stopPropagation();
            }
          },
        };
        buttons.push(
          <Popconfirm
            key={`${type}-${index}-confirm`}
            title={confirm.title}
            description={confirm.content}
            onConfirm={async () => {
              console.log(`[useGridActions] Delete confirmed for record:`, record?.id || record?.email || record);
              try {
                if (confirm.onOk) {
                  await confirm.onOk(record);
                } else {
                  await onClick(record);
                }
              } catch (error) {
                console.error(`[useGridActions] Error in delete handler:`, error);
              }
            }}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <span style={{ display: 'inline-block' }}>
              <ActionButton key={buttonKey} {...buttonPropsForPopconfirm} />
            </span>
          </Popconfirm>
        );
      } else if (confirm) {
        // Other actions with confirmation use Modal.confirm
        buttons.push(
          <ActionButton
            key={buttonKey}
            {...buttonProps}
            onClick={(e) => {
              e?.stopPropagation?.();
              Modal.confirm({
                title: confirm.title,
                content: confirm.content,
                onOk: () => {
                  if (confirm.onOk) {
                    confirm.onOk(record);
                  } else {
                    onClick(record);
                  }
                },
              });
            }}
          />
        );
      } else {
        // No confirmation needed - onClick is already in buttonProps
        buttons.push(<ActionButton key={buttonKey} {...buttonProps} />);
      }
    });

    return buttons.length > 0 ? <Space size={spacing}>{buttons}</Space> : null;
  };

  return { renderActions };
}

