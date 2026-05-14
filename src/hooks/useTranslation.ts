import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  pt: {
    // Autenticação
    'auth.login': 'Entrar',
    'auth.register': 'Registrar',
    'auth.email': 'Email',
    'auth.password': 'Senha',
    'auth.name': 'Nome',
    'auth.createAccount': 'Criar nova conta',
    'auth.loginError': 'Erro ao fazer login',
    'auth.registerError': 'Erro ao registrar',

    // Mensagens
    'messages.title': 'Mensagens',
    'messages.search': 'Buscar mensagens',
    'messages.all': 'Todas',
    'messages.edit': 'Editar',
    'messages.delete': 'Excluir',
    'messages.new': 'Nova Mensagem',
    'messages.editTitle': 'Editar Mensagem',
    'messages.category': 'Categoria',
    'messages.content': 'Conteúdo',
    'messages.required': 'Este campo é obrigatório',
    'messages.saveError': 'Erro ao salvar mensagem',

    // Relatórios
    'reports.title': 'Relatórios',
    'reports.total': 'Total de Mensagens',
    'reports.byCategory': 'Mensagens por Categoria',
    'reports.byPeriod': 'Mensagens por Período',
    'reports.period': 'Período',
    'reports.quantity': 'Quantidade',

    // Geral
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
  },
  en: {
    // Authentication
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Name',
    'auth.createAccount': 'Create new account',
    'auth.loginError': 'Login error',
    'auth.registerError': 'Registration error',

    // Messages
    'messages.title': 'Messages',
    'messages.search': 'Search messages',
    'messages.all': 'All',
    'messages.edit': 'Edit',
    'messages.delete': 'Delete',
    'messages.new': 'New Message',
    'messages.editTitle': 'Edit Message',
    'messages.category': 'Category',
    'messages.content': 'Content',
    'messages.required': 'This field is required',
    'messages.saveError': 'Error saving message',

    // Reports
    'reports.title': 'Reports',
    'reports.total': 'Total Messages',
    'reports.byCategory': 'Messages by Category',
    'reports.byPeriod': 'Messages by Period',
    'reports.period': 'Period',
    'reports.quantity': 'Quantity',

    // General
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
  },
};

const LANGUAGE_KEY = '@AssessorApp:language';

export function useTranslation() {
  const [language, setLanguage] = useState('pt');

  const t = useCallback((key: string) => {
    const keys = key.split('.');
    let translation = translations[language];

    for (const k of keys) {
      translation = translation[k];
      if (!translation) return key;
    }

    return translation;
  }, [language]);

  const changeLanguage = useCallback(async (newLanguage: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, newLanguage);
      setLanguage(newLanguage);
    } catch (error) {
      console.error('Erro ao salvar idioma:', error);
    }
  }, []);

  const loadLanguage = useCallback(async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Erro ao carregar idioma:', error);
    }
  }, []);

  return {
    t,
    language,
    changeLanguage,
    loadLanguage,
  };
} 