// lib/stores/lifetimeStatsStore.ts
// Статистика «за всё время» для профиля (сетка «Статистика приключений» в
// редизайне) — монотонно растущие счётчики, не путать с текущим балансом
// (который может уменьшаться при тратах). Пока один счётчик — заработанные
// монеты, начисляется из userStore.recordTransaction на каждое положительное
// начисление, поэтому автоматически корректен для всех источников монет
// (уроки, достижения, подарки, ежедневный бонус, level-up).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface LifetimeStatsState {
  lifetimeCoinsEarned: number;
  recordCoinsEarned: (amount: number) => void;
  /** §17.2 «Сброс профиля» / «Удаление профиля» — счётчик к исходному состоянию. */
  reset: () => void;
}

export const useLifetimeStatsStore = create<LifetimeStatsState>()(
  persist(
    (set, get) => ({
      lifetimeCoinsEarned: 0,

      recordCoinsEarned: (amount) => {
        if (amount <= 0) return;
        set({ lifetimeCoinsEarned: get().lifetimeCoinsEarned + amount });
      },

      reset: () => set({ lifetimeCoinsEarned: 0 }),
    }),
    {
      name: 'finsputnik-lifetime-stats-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
