import { useState, useCallback } from 'react';
import { useDataCache } from './useDataCache';

interface FormCacheOptions {
  ttl?: number;
  key: string;
  autoSave?: boolean;
  autoLoad?: boolean;
}

export function useFormCache<T extends { [key: string]: any }>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getCachedData, setCachedData, removeCachedData } = useDataCache<T>();

  const loadFormData = useCallback(async ({ key, ttl }: FormCacheOptions) => {
    setLoading(true);
    setError(null);

    try {
      const cachedData = await getCachedData({ key, ttl });
      return cachedData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do formulário');
      return null;
    } finally {
      setLoading(false);
    }
  }, [getCachedData]);

  const saveFormData = useCallback(async (data: T, { key }: FormCacheOptions) => {
    setLoading(true);
    setError(null);

    try {
      await setCachedData(data, { key });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar dados do formulário');
    } finally {
      setLoading(false);
    }
  }, [setCachedData]);

  const clearFormData = useCallback(async ({ key }: FormCacheOptions) => {
    setLoading(true);
    setError(null);

    try {
      await removeCachedData({ key });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao limpar dados do formulário');
    } finally {
      setLoading(false);
    }
  }, [removeCachedData]);

  const useFormWithCache = useCallback((initialData: T, options: FormCacheOptions) => {
    const [formData, setFormData] = useState<T>(initialData);
    const [isDirty, setIsDirty] = useState(false);

    const handleChange = useCallback((field: keyof T, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      setIsDirty(true);

      if (options.autoSave) {
        saveFormData(
          {
            ...formData,
            [field]: value,
          },
          options
        );
      }
    }, [formData, options, saveFormData]);

    const handleSubmit = useCallback(async (onSubmit: (data: T) => void) => {
      if (options.autoSave) {
        await saveFormData(formData, options);
      }
      onSubmit(formData);
      setIsDirty(false);
    }, [formData, options, saveFormData]);

    const handleReset = useCallback(async () => {
      if (options.autoLoad) {
        const cachedData = await loadFormData(options);
        if (cachedData) {
          setFormData(cachedData);
        } else {
          setFormData(initialData);
        }
      } else {
        setFormData(initialData);
      }
      setIsDirty(false);
    }, [initialData, options, loadFormData]);

    return {
      formData,
      isDirty,
      handleChange,
      handleSubmit,
      handleReset,
    };
  }, [loadFormData, saveFormData]);

  return {
    loading,
    error,
    loadFormData,
    saveFormData,
    clearFormData,
    useFormWithCache,
  };
} 