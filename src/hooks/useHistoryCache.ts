import { useState, useCallback } from 'react';
import { useDataCache } from './useDataCache';

interface HistoryCacheOptions {
  ttl?: number;
  key: string;
  maxItems?: number;
}

interface HistoryItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  timestamp: number;
  data?: any;
}

export function useHistoryCache() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getCachedData, setCachedData, removeCachedData } = useDataCache<HistoryItem[]>();

  const loadHistory = useCallback(async ({ key, ttl }: HistoryCacheOptions) => {
    setLoading(true);
    setError(null);

    try {
      const cachedHistory = await getCachedData({ key, ttl });
      return cachedHistory || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar histórico');
      return [];
    } finally {
      setLoading(false);
    }
  }, [getCachedData]);

  const addToHistory = useCallback(async (item: Omit<HistoryItem, 'timestamp'>, { key, maxItems = 100 }: HistoryCacheOptions) => {
    setLoading(true);
    setError(null);

    try {
      const history = await getCachedData({ key }) || [];
      const newItem: HistoryItem = {
        ...item,
        timestamp: Date.now(),
      };

      const updatedHistory = [newItem, ...history].slice(0, maxItems);
      await setCachedData(updatedHistory, { key });
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar ao histórico');
      return null;
    } finally {
      setLoading(false);
    }
  }, [getCachedData, setCachedData]);

  const removeFromHistory = useCallback(async (itemId: string, { key }: HistoryCacheOptions) => {
    setLoading(true);
    setError(null);

    try {
      const history = await getCachedData({ key }) || [];
      const updatedHistory = history.filter((item) => item.id !== itemId);

      await setCachedData(updatedHistory, { key });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover do histórico');
      return false;
    } finally {
      setLoading(false);
    }
  }, [getCachedData, setCachedData]);

  const clearHistory = useCallback(async ({ key }: HistoryCacheOptions) => {
    setLoading(true);
    setError(null);

    try {
      await setCachedData([], { key });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao limpar histórico');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setCachedData]);

  const useHistoryWithCache = useCallback((options: HistoryCacheOptions) => {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    const addItem = useCallback(async (item: Omit<HistoryItem, 'timestamp'>) => {
      const newItem = await addToHistory(item, options);
      if (newItem) {
        setHistory((prev) => [newItem, ...prev].slice(0, options.maxItems));
      }
    }, [options, addToHistory]);

    const removeItem = useCallback(async (itemId: string) => {
      const success = await removeFromHistory(itemId, options);
      if (success) {
        setHistory((prev) => prev.filter((item) => item.id !== itemId));
      }
    }, [options, removeFromHistory]);

    const clearAll = useCallback(async () => {
      const success = await clearHistory(options);
      if (success) {
        setHistory([]);
      }
    }, [options, clearHistory]);

    return {
      history,
      addItem,
      removeItem,
      clearAll,
    };
  }, [addToHistory, removeFromHistory, clearHistory]);

  return {
    loading,
    error,
    loadHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
    useHistoryWithCache,
  };
} 