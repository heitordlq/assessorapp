import { useState, useCallback } from 'react';
import { useDataCache } from './useDataCache';

interface SettingsCacheOptions {
  ttl?: number;
  key: string;
}

interface Settings {
  theme: 'light' | 'dark';
  language: 'pt' | 'en';
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
  };
  privacy: {
    biometrics: boolean;
    autoLock: boolean;
    timeout: number;
  };
  data: {
    autoSync: boolean;
    cacheSize: number;
    clearOnLogout: boolean;
  };
}

const defaultSettings: Settings = {
  theme: 'light',
  language: 'pt',
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
  },
  privacy: {
    biometrics: false,
    autoLock: false,
    timeout: 300000, // 5 minutes
  },
  data: {
    autoSync: true,
    cacheSize: 100, // MB
    clearOnLogout: true,
  },
};

export function useSettingsCache() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getCachedData, setCachedData, removeCachedData } = useDataCache<Settings>();

  const loadSettings = useCallback(async ({ key, ttl }: SettingsCacheOptions) => {
    setLoading(true);
    setError(null);

    try {
      const cachedSettings = await getCachedData({ key, ttl });
      return cachedSettings || defaultSettings;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar configurações');
      return defaultSettings;
    } finally {
      setLoading(false);
    }
  }, [getCachedData]);

  const saveSettings = useCallback(async (settings: Partial<Settings>, { key }: SettingsCacheOptions) => {
    setLoading(true);
    setError(null);

    try {
      const currentSettings = await getCachedData({ key }) || defaultSettings;
      const newSettings = {
        ...currentSettings,
        ...settings,
      };

      await setCachedData(newSettings, { key });
      return newSettings;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar configurações');
      return null;
    } finally {
      setLoading(false);
    }
  }, [getCachedData, setCachedData]);

  const resetSettings = useCallback(async ({ key }: SettingsCacheOptions) => {
    setLoading(true);
    setError(null);

    try {
      await setCachedData(defaultSettings, { key });
      return defaultSettings;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao resetar configurações');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setCachedData]);

  const useSettingsWithCache = useCallback((options: SettingsCacheOptions) => {
    const [settings, setSettings] = useState<Settings>(defaultSettings);

    const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
      const updatedSettings = await saveSettings(newSettings, options);
      if (updatedSettings) {
        setSettings(updatedSettings);
      }
    }, [options, saveSettings]);

    const reset = useCallback(async () => {
      const defaultSettings = await resetSettings(options);
      if (defaultSettings) {
        setSettings(defaultSettings);
      }
    }, [options, resetSettings]);

    return {
      settings,
      updateSettings,
      reset,
    };
  }, [saveSettings, resetSettings]);

  return {
    loading,
    error,
    loadSettings,
    saveSettings,
    resetSettings,
    useSettingsWithCache,
  };
} 