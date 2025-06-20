import { useState, useCallback } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

interface PermissionStatus {
  granted: boolean;
  denied: boolean;
  blocked: boolean;
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<{ [key: string]: PermissionStatus }>({});

  const requestPermission = useCallback(async (permission: string) => {
    if (Platform.OS !== 'android') {
      return { granted: true, denied: false, blocked: false };
    }

    try {
      const result = await PermissionsAndroid.request(permission);

      const status: PermissionStatus = {
        granted: result === PermissionsAndroid.RESULTS.GRANTED,
        denied: result === PermissionsAndroid.RESULTS.DENIED,
        blocked: result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
      };

      setPermissions((prev) => ({
        ...prev,
        [permission]: status,
      }));

      return status;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      return { granted: false, denied: true, blocked: false };
    }
  }, []);

  const checkPermission = useCallback(async (permission: string) => {
    if (Platform.OS !== 'android') {
      return { granted: true, denied: false, blocked: false };
    }

    try {
      const result = await PermissionsAndroid.check(permission);

      const status: PermissionStatus = {
        granted: result,
        denied: !result,
        blocked: false,
      };

      setPermissions((prev) => ({
        ...prev,
        [permission]: status,
      }));

      return status;
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return { granted: false, denied: true, blocked: false };
    }
  }, []);

  const requestMultiplePermissions = useCallback(async (permissionsList: string[]) => {
    if (Platform.OS !== 'android') {
      return permissionsList.reduce((acc, permission) => ({
        ...acc,
        [permission]: { granted: true, denied: false, blocked: false },
      }), {});
    }

    try {
      const results = await PermissionsAndroid.requestMultiple(permissionsList);

      const newPermissions = permissionsList.reduce((acc, permission) => ({
        ...acc,
        [permission]: {
          granted: results[permission] === PermissionsAndroid.RESULTS.GRANTED,
          denied: results[permission] === PermissionsAndroid.RESULTS.DENIED,
          blocked: results[permission] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
        },
      }), {});

      setPermissions((prev) => ({
        ...prev,
        ...newPermissions,
      }));

      return newPermissions;
    } catch (error) {
      console.error('Erro ao solicitar múltiplas permissões:', error);
      return permissionsList.reduce((acc, permission) => ({
        ...acc,
        [permission]: { granted: false, denied: true, blocked: false },
      }), {});
    }
  }, []);

  return {
    permissions,
    requestPermission,
    checkPermission,
    requestMultiplePermissions,
  };
} 