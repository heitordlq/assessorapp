import { useState, useCallback } from 'react';
import { useDataCache } from './useDataCache';
import { useNetwork } from './useNetwork';

interface RequestCacheOptions {
  ttl?: number;
  key: string;
  forceRefresh?: boolean;
}

export function useRequestCache<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getCachedData, setCachedData } = useDataCache<T>();
  const { isConnected } = useNetwork();

  const getCachedRequest = useCallback(async (
    request: () => Promise<T>,
    { key, ttl, forceRefresh = false }: RequestCacheOptions
  ) => {
    setLoading(true);
    setError(null);

    try {
      if (!isConnected && !forceRefresh) {
        const cachedData = await getCachedData({ key, ttl });
        if (cachedData) {
          return cachedData;
        }
        throw new Error('Sem conexão e sem dados em cache');
      }

      const data = await request();
      await setCachedData(data, { key });
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na requisição');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getCachedData, setCachedData, isConnected]);

  const getCachedRequestWithFallback = useCallback(async (
    request: () => Promise<T>,
    { key, ttl, forceRefresh = false }: RequestCacheOptions
  ) => {
    setLoading(true);
    setError(null);

    try {
      if (!isConnected && !forceRefresh) {
        const cachedData = await getCachedData({ key, ttl });
        if (cachedData) {
          return cachedData;
        }
      }

      const data = await request();
      await setCachedData(data, { key });
      return data;
    } catch (err) {
      const cachedData = await getCachedData({ key, ttl });
      if (cachedData) {
        return cachedData;
      }
      setError(err instanceof Error ? err.message : 'Erro na requisição');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getCachedData, setCachedData, isConnected]);

  return {
    loading,
    error,
    getCachedRequest,
    getCachedRequestWithFallback,
  };
} 