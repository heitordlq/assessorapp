import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheOptions {
  key: string;
  ttl?: number; // Time to live in milliseconds
}

export function useCache<T>({ key, ttl }: CacheOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadFromCache = useCallback(async () => {
    try {
      const cachedData = await AsyncStorage.getItem(key);
      if (cachedData) {
        const { value, timestamp } = JSON.parse(cachedData);
        if (!ttl || Date.now() - timestamp < ttl) {
          setData(value);
        } else {
          await AsyncStorage.removeItem(key);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar cache'));
    } finally {
      setLoading(false);
    }
  }, [key, ttl]);

  const saveToCache = useCallback(async (value: T) => {
    try {
      const cacheData = {
        value,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
      setData(value);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao salvar cache'));
    }
  }, [key]);

  const clearCache = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(key);
      setData(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao limpar cache'));
    }
  }, [key]);

  useEffect(() => {
    loadFromCache();
  }, [loadFromCache]);

  return {
    data,
    loading,
    error,
    saveToCache,
    clearCache,
    refresh: loadFromCache,
  };
} 