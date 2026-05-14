import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
  };
}

const lightTheme: Theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#FFFFFF',
    text: '#000000',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    info: '#5856D6',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    fontFamily: 'System',
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
    },
  },
};

const darkTheme: Theme = {
  colors: {
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    background: '#000000',
    text: '#FFFFFF',
    error: '#FF453A',
    success: '#32D74B',
    warning: '#FF9F0A',
    info: '#5E5CE6',
  },
  spacing: lightTheme.spacing,
  typography: lightTheme.typography,
};

const THEME_KEY = '@AssessorApp:theme';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(lightTheme);
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = useCallback(async () => {
    const newTheme = isDark ? lightTheme : darkTheme;
    setTheme(newTheme);
    setIsDark(!isDark);

    try {
      await AsyncStorage.setItem(THEME_KEY, JSON.stringify({ isDark: !isDark }));
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  }, [isDark]);

  const loadTheme = useCallback(async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme) {
        const { isDark: savedIsDark } = JSON.parse(savedTheme);
        setIsDark(savedIsDark);
        setTheme(savedIsDark ? darkTheme : lightTheme);
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
    }
  }, []);

  return {
    theme,
    isDark,
    toggleTheme,
    loadTheme,
  };
} 