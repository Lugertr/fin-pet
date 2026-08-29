// lib/hooks/usePet.ts
// Хуки для работы с питомцем и настроением
// В MVP-режиме без бэкенда — отключены (данные в Zustand)

import { QUERY_KEYS } from '@/lib/api/queryClient';
import { usePetStore } from '@/lib/stores/petStore';
import { PetResponse } from '@/types/api';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

// TODO: Раскомментировать при подключении реального API
// import { apiClient } from '@/lib/api/client';
// import { ENDPOINTS } from '@/lib/api/endpoints';

/**
 * Получение состояния питомца
 * В MVP-режиме отключено — настроение считается локально
 */
export function usePet() {
  const { setPet, setMoodBuffs, updateFromServer } = usePetStore();

  return useQuery({
    queryKey: QUERY_KEYS.pet,
    // Временно отключено: данные берутся из Zustand store
    enabled: false,
    queryFn: async (): Promise<PetResponse> => {
      // TODO: Раскомментировать при подключении API
      // const { data } = await apiClient.get<PetResponse>(ENDPOINTS.pet.current);
      // if (data.pet) {
      //   setPet(data.pet);
      //   setMoodBuffs(data.mood_buffs);
      //   updateFromServer(data.pet, data.current_mood);
      // }
      // return data;

      // Заглушка
      return {
        pet: { id: 1, user_id: '', mood: 100, last_mood_updated_at: '', base_recovery_rate: 5 },
        current_mood: 100,
        mood_buffs: 0,
        hours_until_full: 0,
      };
    },
    refetchInterval: 30 * 1000,
  });
}

/**
 * Таймер для периодического обновления настроения на клиенте
 */
export function useMoodRefreshTimer(intervalMs: number = 10000) {
  const { refreshMood } = usePetStore();

  useEffect(() => {
    const timer = setInterval(() => {
      refreshMood();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [refreshMood, intervalMs]);
}
