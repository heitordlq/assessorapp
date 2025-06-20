import { useState, useCallback } from 'react';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { usePermissions } from './usePermissions';

interface ImagePickerOptions {
  mediaType: 'photo' | 'video';
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
  includeBase64?: boolean;
}

interface ImagePickerResponse {
  uri: string;
  type: string;
  name: string;
  size: number;
  base64?: string;
}

export function useCamera() {
  const [image, setImage] = useState<ImagePickerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { requestPermission } = usePermissions();

  const takePhoto = useCallback(async (options: ImagePickerOptions = {
    mediaType: 'photo',
    quality: 0.8,
    maxWidth: 1200,
    maxHeight: 1200,
    includeBase64: true,
  }) => {
    setLoading(true);
    setError(null);

    try {
      const { granted } = await requestPermission(
        'android.permission.CAMERA'
      );

      if (!granted) {
        throw new Error('Permissão da câmera negada');
      }

      const result = await launchCamera({
        ...options,
        saveToPhotos: true,
      });

      if (result.didCancel) {
        setLoading(false);
        return;
      }

      if (result.errorCode) {
        throw new Error(result.errorMessage || 'Erro ao capturar imagem');
      }

      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setImage({
          uri: asset.uri || '',
          type: asset.type || 'image/jpeg',
          name: asset.fileName || 'photo.jpg',
          size: asset.fileSize || 0,
          base64: asset.base64,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao capturar imagem');
    } finally {
      setLoading(false);
    }
  }, [requestPermission]);

  const pickImage = useCallback(async (options: ImagePickerOptions = {
    mediaType: 'photo',
    quality: 0.8,
    maxWidth: 1200,
    maxHeight: 1200,
    includeBase64: true,
  }) => {
    setLoading(true);
    setError(null);

    try {
      const result = await launchImageLibrary({
        ...options,
        selectionLimit: 1,
      });

      if (result.didCancel) {
        setLoading(false);
        return;
      }

      if (result.errorCode) {
        throw new Error(result.errorMessage || 'Erro ao selecionar imagem');
      }

      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setImage({
          uri: asset.uri || '',
          type: asset.type || 'image/jpeg',
          name: asset.fileName || 'photo.jpg',
          size: asset.fileSize || 0,
          base64: asset.base64,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao selecionar imagem');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearImage = useCallback(() => {
    setImage(null);
  }, []);

  return {
    image,
    loading,
    error,
    takePhoto,
    pickImage,
    clearImage,
  };
} 