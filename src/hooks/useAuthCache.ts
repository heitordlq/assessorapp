import { useState, useCallback } from 'react';
import { useDataCache } from './useDataCache';
import { useStore } from './useStore';

interface AuthCacheOptions {
  ttl?: number;
  key: string;
}

interface AuthState {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  timestamp: number;
}

export function useAuthCache() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getCachedData, setCachedData, removeCachedData } = useDataCache<AuthState>();
  const { setUser, setToken } = useStore();

  const saveAuthState = useCallback(async (
    token: string,
    user: AuthState['user'],
    { key }: AuthCacheOptions
  ) => {
    setLoading(true);
    setError(null);

    try {
      const authState: AuthState = {
        token,
        user,
        timestamp: Date.now(),
      };

      await setCachedData(authState, { key });
      setUser(user);
      setToken(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar estado de autenticação');
    } finally {
      setLoading(false);
    }
  }, [setCachedData, setUser, setToken]);

  const loadAuthState = useCallback(async ({ key, ttl }: AuthCacheOptions) => {
    setLoading(true);
    setError(null);

    try {
      const cachedState = await getCachedData({ key, ttl });
      if (cachedState) {
        setUser(cachedState.user);
        setToken(cachedState.token);
      }
      return cachedState;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar estado de autenticação');
      return null;
    } finally {
      setLoading(false);
    }
  }, [getCachedData, setUser, setToken]);

  const clearAuthState = useCallback(async ({ key }: AuthCacheOptions) => {
    setLoading(true);
    setError(null);

    try {
      await removeCachedData({ key });
      setUser(null);
      setToken(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao limpar estado de autenticação');
    } finally {
      setLoading(false);
    }
  }, [removeCachedData, setUser, setToken]);

  const useAuthWithCache = useCallback((options: AuthCacheOptions) => {
    const [authState, setAuthState] = useState<AuthState | null>(null);

    const login = useCallback(async (token: string, user: AuthState['user']) => {
      await saveAuthState(token, user, options);
      setAuthState({
        token,
        user,
        timestamp: Date.now(),
      });
    }, [options, saveAuthState]);

    const logout = useCallback(async () => {
      await clearAuthState(options);
      setAuthState(null);
    }, [options, clearAuthState]);

    const refresh = useCallback(async () => {
      const cachedState = await loadAuthState(options);
      if (cachedState) {
        setAuthState(cachedState);
      }
    }, [options, loadAuthState]);

    return {
      authState,
      login,
      logout,
      refresh,
    };
  }, [saveAuthState, clearAuthState, loadAuthState]);

  return {
    loading,
    error,
    saveAuthState,
    loadAuthState,
    clearAuthState,
    useAuthWithCache,
  };
} 