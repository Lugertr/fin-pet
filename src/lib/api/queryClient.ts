// lib/api/queryClient.ts
// Настройка TanStack Query для управления серверным состоянием

import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

/**
 * Глобальный экземпляр QueryClient
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Время, после которого данные считаются устаревшими
      // Для настроения питомца нужно чаще обновлять
      staleTime: 30 * 1000, // 30 секунд
      // Время хранения неактивных данных в кэше
      gcTime: 5 * 60 * 1000, // 5 минут
      // Количество повторных попыток при ошибке
      retry: 2,
      // Не обновлять автоматически при фокусе окна (для мобильных)
      refetchOnWindowFocus: false,
      // Обновлять при переподключении к сети
      refetchOnReconnect: true,
    },
    mutations: {
      // Для мутаций (отправка ответов, покупки) повтор не нужен
      retry: 0,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Глобальная обработка ошибок запросов
      console.error(`[QueryCache] Ошибка запроса ${query.queryKey}:`, error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, variables, context, mutation) => {
      // Глобальная обработка ошибок мутаций
      console.error('[MutationCache] Ошибка мутации:', error);
    },
  }),
});

/**
 * Ключи для инвалидации кэша
 */
export const QUERY_KEYS = {
  // Пользователь
  user: ['user'] as const,
  userProfile: ['user', 'profile'] as const,

  // Питомец
  pet: ['pet'] as const,
  petMood: ['pet', 'mood'] as const,

  // Ветки и уроки
  branches: ['branches'] as const,
  branchLessons: (branchId: number) => ['branches', branchId, 'lessons'] as const,
  lessonDetail: (lessonId: number) => ['lessons', lessonId] as const,
  lessonProgress: ['lessons', 'progress'] as const,

  // Вклады
  deposits: ['deposits'] as const,
  depositDetail: (depositId: number) => ['deposits', depositId] as const,

  // Магазин и инвентарь
  shopItems: ['shop', 'items'] as const,
  inventory: ['inventory'] as const,

  // Транзакции
  transactions: ['transactions'] as const,

  // Дейлики
  dailyBonus: ['daily', 'bonus'] as const,
  dailyStreak: ['daily', 'streak'] as const,

  // Аналитика
  spiderChart: ['analytics', 'spider-chart'] as const,
  netWorth: ['analytics', 'net-worth'] as const,
} as const;
