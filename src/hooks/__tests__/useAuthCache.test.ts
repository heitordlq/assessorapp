import { renderHook, act } from '@testing-library/react-hooks';
import { useAuthCache } from '../useAuthCache';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

describe('useAuthCache', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    token: 'test-token',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('deve carregar usuário vazio inicialmente', async () => {
    const { result } = renderHook(() => useAuthCache());
    
    await act(async () => {
      const user = await result.current.loadUser();
      expect(user).toBeNull();
    });
  });

  it('deve salvar usuário', async () => {
    const { result } = renderHook(() => useAuthCache());
    
    await act(async () => {
      const success = await result.current.saveUser(mockUser);
      expect(success).toBe(true);
    });
  });

  it('deve atualizar usuário', async () => {
    const { result } = renderHook(() => useAuthCache());
    
    await act(async () => {
      await result.current.saveUser(mockUser);
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      const success = await result.current.updateUser(updatedUser);
      expect(success).toBe(true);
    });
  });

  it('deve limpar dados do usuário', async () => {
    const { result } = renderHook(() => useAuthCache());
    
    await act(async () => {
      await result.current.saveUser(mockUser);
      const success = await result.current.clearUser();
      expect(success).toBe(true);
    });
  });

  it('deve verificar se usuário está autenticado', async () => {
    const { result } = renderHook(() => useAuthCache());
    
    await act(async () => {
      await result.current.saveUser(mockUser);
      const isAuthenticated = await result.current.isAuthenticated();
      expect(isAuthenticated).toBe(true);
    });
  });

  it('deve gerenciar token', async () => {
    const { result } = renderHook(() => useAuthCache());
    
    await act(async () => {
      await result.current.saveToken('test-token');
      const token = await result.current.getToken();
      expect(token).toBe('test-token');
    });
  });

  it('deve lidar com erros adequadamente', async () => {
    const { result } = renderHook(() => useAuthCache());
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Test error'));
    
    await act(async () => {
      const user = await result.current.loadUser();
      expect(user).toBeNull();
      expect(result.current.error).toBe('Test error');
    });
  });

  it('deve gerenciar estado local com useAuthWithCache', async () => {
    const { result } = renderHook(() => useAuthCache());
    const { result: authResult } = renderHook(() => result.current.useAuthWithCache());
    
    await act(async () => {
      await authResult.current.login(mockUser);
      expect(authResult.current.user).toEqual(mockUser);
      expect(authResult.current.isAuthenticated).toBe(true);
      
      await authResult.current.logout();
      expect(authResult.current.user).toBeNull();
      expect(authResult.current.isAuthenticated).toBe(false);
    });
  });
}); 