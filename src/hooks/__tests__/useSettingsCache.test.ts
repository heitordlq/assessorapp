import { renderHook, act } from '@testing-library/react-hooks';
import { useSettingsCache } from '../useSettingsCache';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

describe('useSettingsCache', () => {
  const mockSettings = {
    theme: 'dark',
    language: 'pt-BR',
    notifications: true,
    fontSize: 'medium',
    soundEnabled: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('deve carregar configurações padrão inicialmente', async () => {
    const { result } = renderHook(() => useSettingsCache());
    
    await act(async () => {
      const settings = await result.current.loadSettings();
      expect(settings).toEqual(result.current.defaultSettings);
    });
  });

  it('deve salvar configurações', async () => {
    const { result } = renderHook(() => useSettingsCache());
    
    await act(async () => {
      const success = await result.current.saveSettings(mockSettings);
      expect(success).toBe(true);
    });
  });

  it('deve atualizar configuração específica', async () => {
    const { result } = renderHook(() => useSettingsCache());
    
    await act(async () => {
      await result.current.saveSettings(mockSettings);
      const success = await result.current.updateSetting('theme', 'light');
      expect(success).toBe(true);
    });
  });

  it('deve resetar configurações para padrão', async () => {
    const { result } = renderHook(() => useSettingsCache());
    
    await act(async () => {
      await result.current.saveSettings(mockSettings);
      const success = await result.current.resetSettings();
      expect(success).toBe(true);
    });
  });

  it('deve obter configuração específica', async () => {
    const { result } = renderHook(() => useSettingsCache());
    
    await act(async () => {
      await result.current.saveSettings(mockSettings);
      const theme = await result.current.getSetting('theme');
      expect(theme).toBe(mockSettings.theme);
    });
  });

  it('deve lidar com erros adequadamente', async () => {
    const { result } = renderHook(() => useSettingsCache());
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Test error'));
    
    await act(async () => {
      const settings = await result.current.loadSettings();
      expect(settings).toEqual(result.current.defaultSettings);
      expect(result.current.error).toBe('Test error');
    });
  });

  it('deve gerenciar estado local com useSettingsWithCache', async () => {
    const { result } = renderHook(() => useSettingsCache());
    const { result: settingsResult } = renderHook(() => result.current.useSettingsWithCache());
    
    await act(async () => {
      await settingsResult.current.updateSettings(mockSettings);
      expect(settingsResult.current.settings).toEqual(mockSettings);
      
      await settingsResult.current.updateSetting('theme', 'light');
      expect(settingsResult.current.settings.theme).toBe('light');
      
      await settingsResult.current.resetSettings();
      expect(settingsResult.current.settings).toEqual(result.current.defaultSettings);
    });
  });

  it('deve validar configurações antes de salvar', async () => {
    const { result } = renderHook(() => useSettingsCache());
    
    await act(async () => {
      const invalidSettings = { ...mockSettings, theme: 'invalid' };
      const success = await result.current.saveSettings(invalidSettings);
      expect(success).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });
}); 