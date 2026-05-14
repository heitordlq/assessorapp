import { useState, useCallback } from 'react';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { useStore } from './useStore';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface UseApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (config?: AxiosRequestConfig) => Promise<void>;
}

export function useApi<T>(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'): UseApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (config?: AxiosRequestConfig) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.request<T>({
        url,
        method,
        ...config,
      });

      setData(response.data);
    } catch (err) {
      const error = err as AxiosError;
      setError(error.response?.data?.message || 'Erro na requisição');
    } finally {
      setLoading(false);
    }
  }, [url, method]);

  return {
    data,
    loading,
    error,
    execute,
  };
} 