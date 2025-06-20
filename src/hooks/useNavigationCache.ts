import { useState, useCallback } from 'react';
import { useDataCache } from './useDataCache';

interface NavigationCacheOptions {
  ttl?: number;
  key: string;
}

interface NavigationState {
  currentRoute: string;
  params: any;
  timestamp: number;
}

export function useNavigationCache() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getCachedData, setCachedData, removeCachedData } = useDataCache<NavigationState>();

  const saveNavigationState = useCallback(async (
    currentRoute: string,
    params: any,
    { key }: NavigationCacheOptions
  ) => {
    setLoading(true);
    setError(null);

    try {
      const navigationState: NavigationState = {
        currentRoute,
        params,
        timestamp: Date.now(),
      };

      await setCachedData(navigationState, { key });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar estado de navegação');
    } finally {
      setLoading(false);
    }
  }, [setCachedData]);

  const loadNavigationState = useCallback(async ({ key, ttl }: NavigationCacheOptions) => {
    setLoading(true);
    setError(null);

    try {
      const cachedState = await getCachedData({ key, ttl });
      return cachedState;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar estado de navegação');
      return null;
    } finally {
      setLoading(false);
    }
  }, [getCachedData]);

  const clearNavigationState = useCallback(async ({ key }: NavigationCacheOptions) => {
    setLoading(true);
    setError(null);

    try {
      await removeCachedData({ key });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao limpar estado de navegação');
    } finally {
      setLoading(false);
    }
  }, [removeCachedData]);

  const useNavigationWithCache = useCallback((options: NavigationCacheOptions) => {
    const [navigationState, setNavigationState] = useState<NavigationState | null>(null);

    const navigate = useCallback(async (route: string, params: any = {}) => {
      await saveNavigationState(route, params, options);
      setNavigationState({
        currentRoute: route,
        params,
        timestamp: Date.now(),
      });
    }, [options, saveNavigationState]);

    const goBack = useCallback(async () => {
      const previousState = await loadNavigationState(options);
      if (previousState) {
        setNavigationState(previousState);
      }
    }, [options, loadNavigationState]);

    const reset = useCallback(async () => {
      await clearNavigationState(options);
      setNavigationState(null);
    }, [options, clearNavigationState]);

    return {
      navigationState,
      navigate,
      goBack,
      reset,
    };
  }, [saveNavigationState, loadNavigationState, clearNavigationState]);

  return {
    loading,
    error,
    saveNavigationState,
    loadNavigationState,
    clearNavigationState,
    useNavigationWithCache,
  };
} 