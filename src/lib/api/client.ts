// lib/api/client.ts
// Настройка Axios клиента для работы с бэкендом «ФинСпутник»

import { API_BASE_URL, API_TIMEOUT } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Ключи для хранилища
const ACCESS_TOKEN_KEY = 'finsputnik_access_token';
const USER_ID_KEY = 'finsputnik_user_id';

/**
 * Безопасное хранилище токенов
 * На нативных платформах используется SecureStore (Keychain/KeyStore)
 * На Web — AsyncStorage (так как SecureStore недоступен)
 */
const secureStorage = {
  getItemAsync: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn(`[Storage] Ошибка чтения ключа ${key}:`, error);
      return null;
    }
  },

  setItemAsync: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.warn(`[Storage] Ошибка записи ключа ${key}:`, error);
    }
  },

  deleteItemAsync: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.warn(`[Storage] Ошибка удаления ключа ${key}:`, error);
    }
  },
};

/**
 * Axios instance с базовой конфигурацией
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Интерцептор запроса: добавляет токен авторизации
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await secureStorage.getItemAsync(ACCESS_TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('[API] Ошибка получения токена:', error);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/**
 * Интерцептор ответа: обрабатывает ошибки
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn('[API] 401: Требуется авторизация');
      // Можно добавить редирект на логин или очистку токена
    }

    if (error.response?.status === 404) {
      console.warn('[API] 404: Ресурс не найден');
    }

    if (error.response?.status === 500) {
      console.error('[API] 500: Внутренняя ошибка сервера');
    }

    const errorMessage =
      (error.response?.data as { detail?: string })?.detail ||
      error.message ||
      'Произошла ошибка при запросе к серверу';

    return Promise.reject(new ApiError(errorMessage, error.response?.status || 0));
  }
);

/**
 * Кастомный класс ошибки для типизации
 */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Хелперы для работы с токенами
 */
export const authStorage = {
  setAccessToken: (token: string) => secureStorage.setItemAsync(ACCESS_TOKEN_KEY, token),
  getAccessToken: () => secureStorage.getItemAsync(ACCESS_TOKEN_KEY),
  removeAccessToken: () => secureStorage.deleteItemAsync(ACCESS_TOKEN_KEY),
  setUserId: (userId: string) => secureStorage.setItemAsync(USER_ID_KEY, userId),
  getUserId: () => secureStorage.getItemAsync(USER_ID_KEY),
};
