/**
 * useNotification Hook
 * 
 * Enhanced notification hook with standardized message formats and auto-dismiss.
 * 
 * Features:
 * - Standardized message formats
 * - Auto-dismiss timers
 * - Action buttons in notifications
 * - Success/error/warning/info variants
 * - Persistent notifications option
 * 
 * @returns {Object} Notification methods
 * 
 * @example
 * const notification = useNotification();
 * 
 * notification.success('User created successfully', {
 *   action: { label: 'View', onClick: () => router.push('/users') }
 * });
 * 
 * notification.error('Failed to save', { duration: 0 }); // Persistent
 */

import { message, notification as antdNotification } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';

const DEFAULT_DURATION = 3; // seconds

export function useNotification() {
  const showMessage = (type, content, options = {}) => {
    const {
      duration = DEFAULT_DURATION,
      action,
      onClose,
      ...restOptions
    } = options;

    const config = {
      duration: duration === 0 ? 0 : duration,
      ...restOptions,
    };

    if (action) {
      // Use notification API for actions
      antdNotification[type]({
        message: content,
        description: action.description,
        duration: duration === 0 ? 0 : duration,
        icon: getIcon(type),
        btn: action.label && action.onClick ? (
          <span onClick={action.onClick} style={{ cursor: 'pointer', color: '#1890ff' }}>
            {action.label}
          </span>
        ) : undefined,
        onClose,
        ...restOptions,
      });
    } else {
      // Use message API for simple notifications
      message[type](content, duration === 0 ? 0 : duration, onClose);
    }
  };

  return {
    success: (content, options) => showMessage('success', content, options),
    error: (content, options) => showMessage('error', content, options),
    warning: (content, options) => showMessage('warning', content, options),
    info: (content, options) => showMessage('info', content, options),
    loading: (content, duration) => message.loading(content, duration || DEFAULT_DURATION),
  };
}

function getIcon(type) {
  const icons = {
    success: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    error: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
    warning: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
    info: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
  };
  return icons[type];
}

export default useNotification;

