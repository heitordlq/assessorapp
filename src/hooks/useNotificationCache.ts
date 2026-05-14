import { useState, useCallback } from 'react';
import { useDataCache } from './useDataCache';

interface NotificationCacheOptions {
  ttl?: number;
  key: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: number;
  data?: any;
}

export function useNotificationCache() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getCachedData, setCachedData, removeCachedData } = useDataCache<Notification[]>();

  const loadNotifications = useCallback(async ({ key, ttl }: NotificationCacheOptions) => {
    setLoading(true);
    setError(null);

    try {
      const cachedNotifications = await getCachedData({ key, ttl });
      return cachedNotifications || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar notificações');
      return [];
    } finally {
      setLoading(false);
    }
  }, [getCachedData]);

  const saveNotification = useCallback(async (notification: Omit<Notification, 'timestamp'>, { key }: NotificationCacheOptions) => {
    setLoading(true);
    setError(null);

    try {
      const notifications = await getCachedData({ key }) || [];
      const newNotification: Notification = {
        ...notification,
        timestamp: Date.now(),
      };

      const updatedNotifications = [newNotification, ...notifications];
      await setCachedData(updatedNotifications, { key });
      return newNotification;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar notificação');
      return null;
    } finally {
      setLoading(false);
    }
  }, [getCachedData, setCachedData]);

  const markAsRead = useCallback(async (notificationId: string, { key }: NotificationCacheOptions) => {
    setLoading(true);
    setError(null);

    try {
      const notifications = await getCachedData({ key }) || [];
      const updatedNotifications = notifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      );

      await setCachedData(updatedNotifications, { key });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao marcar notificação como lida');
      return false;
    } finally {
      setLoading(false);
    }
  }, [getCachedData, setCachedData]);

  const deleteNotification = useCallback(async (notificationId: string, { key }: NotificationCacheOptions) => {
    setLoading(true);
    setError(null);

    try {
      const notifications = await getCachedData({ key }) || [];
      const updatedNotifications = notifications.filter(
        (notification) => notification.id !== notificationId
      );

      await setCachedData(updatedNotifications, { key });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir notificação');
      return false;
    } finally {
      setLoading(false);
    }
  }, [getCachedData, setCachedData]);

  const clearNotifications = useCallback(async ({ key }: NotificationCacheOptions) => {
    setLoading(true);
    setError(null);

    try {
      await setCachedData([], { key });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao limpar notificações');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setCachedData]);

  const useNotificationsWithCache = useCallback((options: NotificationCacheOptions) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback(async (notification: Omit<Notification, 'timestamp'>) => {
      const newNotification = await saveNotification(notification, options);
      if (newNotification) {
        setNotifications((prev) => [newNotification, ...prev]);
      }
    }, [options, saveNotification]);

    const markNotificationAsRead = useCallback(async (notificationId: string) => {
      const success = await markAsRead(notificationId, options);
      if (success) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
      }
    }, [options, markAsRead]);

    const removeNotification = useCallback(async (notificationId: string) => {
      const success = await deleteNotification(notificationId, options);
      if (success) {
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== notificationId)
        );
      }
    }, [options, deleteNotification]);

    const clearAll = useCallback(async () => {
      const success = await clearNotifications(options);
      if (success) {
        setNotifications([]);
      }
    }, [options, clearNotifications]);

    return {
      notifications,
      addNotification,
      markNotificationAsRead,
      removeNotification,
      clearAll,
    };
  }, [saveNotification, markAsRead, deleteNotification, clearNotifications]);

  return {
    loading,
    error,
    loadNotifications,
    saveNotification,
    markAsRead,
    deleteNotification,
    clearNotifications,
    useNotificationsWithCache,
  };
} 