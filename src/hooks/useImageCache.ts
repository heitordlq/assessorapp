import { useState, useCallback } from 'react';
import FastImage from 'react-native-fast-image';
import { usePermissions } from './usePermissions';

interface ImageCacheOptions {
  priority?: 'low' | 'normal' | 'high';
  cache?: 'immutable' | 'web' | 'memory';
}

export function useImageCache() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { requestPermission } = usePermissions();

  const preloadImages = useCallback(async (urls: string[], options: ImageCacheOptions = {}) => {
    setLoading(true);
    setError(null);

    try {
      const { granted } = await requestPermission(
        'android.permission.WRITE_EXTERNAL_STORAGE'
      );

      if (!granted) {
        throw new Error('Permissão de escrita negada');
      }

      await FastImage.preload(
        urls.map((url) => ({
          uri: url,
          priority: FastImage.priority[options.priority?.toUpperCase() || 'NORMAL'],
          cache: FastImage.cacheControl[options.cache?.toUpperCase() || 'IMMUTABLE'],
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao pré-carregar imagens');
    } finally {
      setLoading(false);
    }
  }, [requestPermission]);

  const clearImageCache = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await FastImage.clearMemoryCache();
      await FastImage.clearDiskCache();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao limpar cache de imagens');
    } finally {
      setLoading(false);
    }
  }, []);

  const getImageSize = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);

    try {
      const size = await FastImage.getSize(url);
      return size;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao obter tamanho da imagem');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    preloadImages,
    clearImageCache,
    getImageSize,
  };
} 