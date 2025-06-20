import { renderHook, act } from '@testing-library/react-hooks';
import { useNotificationCache } from '../useNotificationCache';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

describe('useNotificationCache', () => {
  const mockNotification = {
    id: '1',
    title: 'Test Notification',
    message: 'Test Message',
    type: 'info',
    read: false,
    timestamp: Date.now(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('deve carregar notificações vazias inicialmente', async () => {
    const { result } = renderHook(() => useNotificationCache());
    
    await act(async () => {
      const notifications = await result.current.loadNotifications({ key: 'test' });
      expect(notifications).toEqual([]);
    });
  });

  it('deve salvar nova notificação', async () => {
    const { result } = renderHook(() => useNotificationCache());
    
    await act(async () => {
      const success = await result.current.saveNotification(mockNotification, { key: 'test' });
      expect(success).toBe(true);
    });
  });

  it('deve marcar notificação como lida', async () => {
    const { result } = renderHook(() => useNotificationCache());
    
    await act(async () => {
      await result.current.saveNotification(mockNotification, { key: 'test' });
      const success = await result.current.markAsRead(mockNotification.id, { key: 'test' });
      expect(success).toBe(true);
    });
  });

  it('deve deletar notificação', async () => {
    const { result } = renderHook(() => useNotificationCache());
    
    await act(async () => {
      await result.current.saveNotification(mockNotification, { key: 'test' });
      const success = await result.current.deleteNotification(mockNotification.id, { key: 'test' });
      expect(success).toBe(true);
    });
  });

  it('deve limpar todas as notificações', async () => {
    const { result } = renderHook(() => useNotificationCache());
    
    await act(async () => {
      await result.current.saveNotification(mockNotification, { key: 'test' });
      const success = await result.current.clearNotifications({ key: 'test' });
      expect(success).toBe(true);
    });
  });

  it('deve gerenciar estado local com useNotificationsWithCache', async () => {
    const { result } = renderHook(() => useNotificationCache());
    const { result: notificationsResult } = renderHook(() => 
      result.current.useNotificationsWithCache({ key: 'test' })
    );
    
    await act(async () => {
      await notificationsResult.current.addNotification(mockNotification);
      expect(notificationsResult.current.notifications.length).toBe(1);
      
      await notificationsResult.current.markAsRead(mockNotification.id);
      expect(notificationsResult.current.notifications[0].read).toBe(true);
      
      await notificationsResult.current.removeNotification(mockNotification.id);
      expect(notificationsResult.current.notifications.length).toBe(0);
    });
  });

  it('deve lidar com erros adequadamente', async () => {
    const { result } = renderHook(() => useNotificationCache());
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Test error'));
    
    await act(async () => {
      const notifications = await result.current.loadNotifications({ key: 'test' });
      expect(notifications).toEqual([]);
      expect(result.current.error).toBe('Test error');
    });
  });
}); 