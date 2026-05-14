import { useState, useCallback } from 'react';
import Toast from 'react-native-toast-message';

interface Notification {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

export function useNotification() {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = useCallback(({ type, title, message }: Notification) => {
    setNotification({ type, title, message });

    Toast.show({
      type,
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 30,
      bottomOffset: 40,
    });
  }, []);

  const showSuccess = useCallback((title: string, message: string) => {
    showNotification({ type: 'success', title, message });
  }, [showNotification]);

  const showError = useCallback((title: string, message: string) => {
    showNotification({ type: 'error', title, message });
  }, [showNotification]);

  const showInfo = useCallback((title: string, message: string) => {
    showNotification({ type: 'info', title, message });
  }, [showNotification]);

  const showWarning = useCallback((title: string, message: string) => {
    showNotification({ type: 'warning', title, message });
  }, [showNotification]);

  return {
    notification,
    showNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
} 