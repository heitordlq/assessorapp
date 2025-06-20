import { useState, useCallback } from 'react';
import ReactNativeBiometrics from 'react-native-biometrics';
import { usePermissions } from './usePermissions';

interface BiometricState {
  available: boolean;
  enrolled: boolean;
  type: string;
}

export function useBiometrics() {
  const [biometricState, setBiometricState] = useState<BiometricState>({
    available: false,
    enrolled: false,
    type: 'none',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { requestPermission } = usePermissions();

  const rnBiometrics = new ReactNativeBiometrics({
    allowDeviceCredentials: true,
  });

  const checkBiometrics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      const { available: enrolled } = await rnBiometrics.isSensorAvailable();

      setBiometricState({
        available,
        enrolled,
        type: biometryType,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar biometria');
    } finally {
      setLoading(false);
    }
  }, []);

  const authenticate = useCallback(async (promptMessage: string = 'Autenticar') => {
    setLoading(true);
    setError(null);

    try {
      const { granted } = await requestPermission(
        'android.permission.USE_BIOMETRIC'
      );

      if (!granted) {
        throw new Error('Permissão de biometria negada');
      }

      const { success, error } = await rnBiometrics.simplePrompt({
        promptMessage,
        cancelButtonText: 'Cancelar',
      });

      if (!success) {
        throw new Error(error || 'Autenticação cancelada');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na autenticação biométrica');
      return false;
    } finally {
      setLoading(false);
    }
  }, [requestPermission]);

  const createKeys = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { publicKey } = await rnBiometrics.createKeys();
      return publicKey;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar chaves biométricas');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteKeys = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await rnBiometrics.deleteKeys();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir chaves biométricas');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    ...biometricState,
    loading,
    error,
    checkBiometrics,
    authenticate,
    createKeys,
    deleteKeys,
  };
} 