/**
 * Custom hook to use Ant Design message API with context support
 * This fixes the warning: "Static function can not consume context like dynamic theme"
 */
import { App } from 'antd';

export function useMessage() {
  const { message } = App.useApp();
  return message;
}

