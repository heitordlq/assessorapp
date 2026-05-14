import { useState, useCallback } from 'react';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { usePermissions } from './usePermissions';

interface FileInfo {
  uri: string;
  type: string;
  name: string;
  size: number;
}

export function useFile() {
  const [file, setFile] = useState<FileInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { requestPermission } = usePermissions();

  const pickFile = useCallback(async (types: string[] = ['*/*']) => {
    setLoading(true);
    setError(null);

    try {
      const result = await DocumentPicker.pick({
        type: types,
        copyTo: 'cachesDirectory',
      });

      if (result[0]) {
        const fileInfo = result[0];
        setFile({
          uri: fileInfo.uri,
          type: fileInfo.type || 'application/octet-stream',
          name: fileInfo.name || 'file',
          size: fileInfo.size || 0,
        });
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        setError(err instanceof Error ? err.message : 'Erro ao selecionar arquivo');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const saveFile = useCallback(async (content: string, fileName: string) => {
    setLoading(true);
    setError(null);

    try {
      const { granted } = await requestPermission(
        'android.permission.WRITE_EXTERNAL_STORAGE'
      );

      if (!granted) {
        throw new Error('Permissão de escrita negada');
      }

      const path = `${RNFS.DownloadDirectoryPath}/${fileName}`;
      await RNFS.writeFile(path, content, 'utf8');

      setFile({
        uri: `file://${path}`,
        type: 'text/plain',
        name: fileName,
        size: content.length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar arquivo');
    } finally {
      setLoading(false);
    }
  }, [requestPermission]);

  const readFile = useCallback(async (uri: string) => {
    setLoading(true);
    setError(null);

    try {
      const content = await RNFS.readFile(uri, 'utf8');
      return content;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao ler arquivo');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFile = useCallback(async (uri: string) => {
    setLoading(true);
    setError(null);

    try {
      await RNFS.unlink(uri);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir arquivo');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
  }, []);

  return {
    file,
    loading,
    error,
    pickFile,
    saveFile,
    readFile,
    deleteFile,
    clearFile,
  };
} 