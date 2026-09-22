// lib/hooks/useDaily.ts
// Хук для управления ежедневными наградами и стриками

import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSameDay, startOfDay } from 'date-fns';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface DailyState {
  currentStreak: number;
  lastClaimDate: string | null; // ISO date
  totalClaimed: number;
  hasClaimedToday: boolean;

  // Actions
  claimDailyBonus: () => { success: boolean; bonus: number; newStreak: number };
  resetStreak: () => void;
  checkAndUpdateStreak: () => void;
}

// Бонусы за каждый день стрика
const DAILY_REWARDS = [
  50, // День 1
  75, // День 2
  100, // День 3
  125, // День 4
  150, // День 5
  200, // День 6
  500, // День 7 (супер-кейс)
];

export const useDailyStore = create<DailyState>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      lastClaimDate: null,
      totalClaimed: 0,
      hasClaimedToday: false,

      claimDailyBonus: () => {
        const { currentStreak, lastClaimDate, totalClaimed } = get();
        const today = startOfDay(new Date()).toISOString();
        const lastClaim = lastClaimDate ? startOfDay(new Date(lastClaimDate)) : null;
        const todayDate = startOfDay(new Date());

        // Проверяем, не получал ли пользователь награду сегодня
        if (lastClaim && isSameDay(lastClaim, todayDate)) {
          return { success: false, bonus: 0, newStreak: currentStreak };
        }

        // Проверяем, не прервался ли стрик (больше 1 дня разницы)
        let newStreak = currentStreak;
        if (lastClaim) {
          const daysDiff = Math.floor(
            (todayDate.getTime() - lastClaim.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysDiff > 1) {
            newStreak = 0; // Стрик прервался
          }
        }

        // Увеличиваем стрик
        newStreak += 1;

        // Получаем бонус (циклически, если стрик больше 7 дней)
        const rewardIndex = (newStreak - 1) % DAILY_REWARDS.length;
        const bonus = DAILY_REWARDS[rewardIndex];

        set({
          currentStreak: newStreak,
          lastClaimDate: today,
          totalClaimed: totalClaimed + bonus,
          hasClaimedToday: true,
        });

        return { success: true, bonus, newStreak };
      },

      resetStreak: () => {
        set({
          currentStreak: 0,
          lastClaimDate: null,
          hasClaimedToday: false,
        });
      },

      checkAndUpdateStreak: () => {
        const { lastClaimDate } = get();
        if (!lastClaimDate) return;

        const lastClaim = startOfDay(new Date(lastClaimDate));
        const today = startOfDay(new Date());
        const daysDiff = Math.floor(
          (today.getTime() - lastClaim.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Если прошло больше 1 дня, сбрасываем стрик
        if (daysDiff > 1) {
          set({
            currentStreak: 0,
            hasClaimedToday: false,
          });
        } else if (daysDiff === 0) {
          set({ hasClaimedToday: true });
        } else {
          set({ hasClaimedToday: false });
        }
      },
    }),
    {
      name: 'finsputnik-daily-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
