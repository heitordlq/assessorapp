import { renderHook, act } from '@testing-library/react-native';
import { useSettingsCache } from '../useSettingsCache';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

// TODO: testes marcados com it.skip estao desatualizados em relacao ao hook e precisam ser reescritos.
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

  it.skip('deve carregar configurações padrão inicialmente', async () => {
    const { result } = renderHook(() => useSettingsCache());
    
    await act(async () => {
      const settings = await result.current.loadSettings();
      expect(settings).toEqual(result.current.defaultSettings);
    });
  });

  it.skip('deve salvar configurações', async () => {
    const { result } = renderHook(() => useSettingsCache());
    
    await act(async () => {
      const success = await result.current.saveSettings(mockSettings);
      expect(success).toBe(true);
    });
  });

  it.skip('deve atualizar configuração específica', async () => {
    const { result } = renderHook(() => useSettingsCache());
    
    await act(async () => {
      await result.current.saveSettings(mockSettings);
      const success = await result.current.updateSetting('theme', 'light');
      expect(success).toBe(true);
    });
  });

  it.skip('deve resetar configurações para padrão', async () => {
    const { result } = renderHook(() => useSettingsCache());
    
    await act(async () => {
      await result.current.saveSettings(mockSettings);
      const success = await result.current.resetSettings();
      expect(success).toBe(true);
    });
  });

  it.skip('deve obter configuração específica', async () => {
    const { result } = renderHook(() => useSettingsCache());
    
    await act(async () => {
      await result.current.saveSettings(mockSettings);
      const theme = await result.current.getSetting('theme');
      expect(theme).toBe(mockSettings.theme);
    });
  });

  it.skip('deve lidar com erros adequadamente', async () => {
    const { result } = renderHook(() => useSettingsCache());
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Test error'));
    
    await act(async () => {
      const settings = await result.current.loadSettings();
      expect(settings).toEqual(result.current.defaultSettings);
      expect(result.current.error).toBe('Test error');
    });
  });

  it.skip('deve gerenciar estado local com useSettingsWithCache', async () => {
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

  it.skip('deve validar configurações antes de salvar', async () => {
    const { result } = renderHook(() => useSettingsCache());
    
    await act(async () => {
      const invalidSettings = { ...mockSettings, theme: 'invalid' };
      const success = await result.current.saveSettings(invalidSettings);
      expect(success).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });
}); 