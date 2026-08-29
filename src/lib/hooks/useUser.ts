// lib/hooks/useUser.ts
// Хуки для работы с данными пользователя
// В MVP-режиме без бэкенда — возвращают null (данные берутся из Zustand сторов)

import { QUERY_KEYS } from '@/lib/api/queryClient';
import { useUserStore } from '@/lib/stores/userStore';
import { OnboardingRequest, OnboardingResponse, UserResponse } from '@/types/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// TODO: Раскомментировать при подключении реального API
// import { apiClient } from '@/lib/api/client';
// import { ENDPOINTS } from '@/lib/api/endpoints';

/**
 * Получение данных пользователя с питомцем
 * В MVP-режиме возвращает null — все данные уже в Zustand сторах
 */
export function useUser() {
  const { setUser, setPet, setNetWorth, setOnboarded } = useUserStore();

  return useQuery({
    queryKey: QUERY_KEYS.userProfile,
    // Временно отключено: данные берутся из Zustand store
    enabled: false,
    queryFn: async (): Promise<UserResponse> => {
      // TODO: Раскомментировать при подключении API
      // const { data } = await apiClient.get<UserResponse>(ENDPOINTS.user.profile);
      // setUser(data.user);
      // if (data.pet) setPet(data.pet);
      // setNetWorth(data.total_net_worth);
      // setOnboarded(true);
      // return data;

      // Заглушка: возвращаем null
      return {
        user: { id: '', username: '', liquid_balance: 0, created_at: '' },
        pet: null,
        total_net_worth: 0,
      };
    },
  });
}

/**
 * Онбординг: создание пользователя и питомца
 * В MVP-режиме работает через Zustand store (см. onboarding.tsx)
 */
export function useOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: OnboardingRequest): Promise<OnboardingResponse> => {
      // TODO: Раскомментировать при подключении API
      // const { data } = await apiClient.post<OnboardingResponse>(
      //   ENDPOINTS.auth.onboarding,
      //   payload
      // );
      // return data;

      // Заглушка
      return {
        user: { id: '', username: payload.username, liquid_balance: 500, created_at: '' },
        pet: { id: 1, user_id: '', mood: 100, last_mood_updated_at: '', base_recovery_rate: 5 },
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user });
    },
  });
}

/**
 * Получение истории транзакций
 */
export function useTransactions() {
  return useQuery({
    queryKey: QUERY_KEYS.transactions,
    enabled: false,
    queryFn: async () => {
      // TODO: Раскомментировать при подключении API
      // const { data } = await apiClient.get(ENDPOINTS.user.transactions);
      // return data;
      return { transactions: [], total_count: 0 };
    },
  });
}
