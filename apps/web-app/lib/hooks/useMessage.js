/**
 * Custom hook to use notification helper
 * Replaces Ant Design message API with Flowbite-compatible notifications
 */
import { notify } from '@/lib/utils/notification-helper';

export function useMessage() {
  return {
    success: (content, duration, onClose) => notify.success(content, duration, onClose),
    error: (content, duration, onClose) => notify.error(content, duration, onClose),
    warning: (content, duration, onClose) => notify.warning(content, duration, onClose),
    info: (content, duration, onClose) => notify.info(content, duration, onClose),
    loading: (content, duration, onClose) => notify.loading(content, duration, onClose),
    destroy: () => notify.destroy(),
  };
}

export default useMessage;
