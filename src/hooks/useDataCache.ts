import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  key: string;
}

interface CacheData<T> {
  data: T;
  timestamp: number;
}

export function useDataCache<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCachedData = useCallback(async ({ key, ttl }: CacheOptions) => {
    setLoading(true);
    setError(null);

    try {
      const cachedData = await AsyncStorage.getItem(key);

      if (!cachedData) {
        return null;
      }

      const { data, timestamp }: CacheData<T> = JSON.parse(cachedData);

      if (ttl && Date.now() - timestamp > ttl) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao obter dados do cache');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const setCachedData = useCallback(async (data: T, { key }: CacheOptions) => {
    setLoading(true);
    setError(null);

    try {
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar dados no cache');
    } finally {
      setLoading(false);
    }
  }, []);

  const removeCachedData = useCallback(async ({ key }: CacheOptions) => {
    setLoading(true);
    setError(null);

    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover dados do cache');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCache = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith('@AssessorApp:cache:'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao limpar cache');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getCachedData,
    setCachedData,
    removeCachedData,
    clearCache,
  };
} 