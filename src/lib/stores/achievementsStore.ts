// lib/stores/achievementsStore.ts
// Достижения (§15 ТЗ): ручной сбор наград — прогресс считается автоматически,
// награда выдаётся только по кнопке «Забрать» (§15.1).
//
// Не импортирует useLessonsStore/useShopStore напрямую (во избежание цикла
// импортов — они сами вызывают методы этого стора). Вместо этого сырые
// счётчики (верные ответы, пополнения накоплений, скрытые предметы, прогресс
// по ветке) присылаются из мест, где они и так уже известны.

import {
  AchievementDefinition,
  AchievementStats,
  computeAchievementProgress,
  createEmptyUserAchievement,
  UserAchievementRecord,
} from '@/domain/achievement/Achievement';
import { getLocalContentRepository } from '@/data/content';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useGiftsStore } from './giftsStore';
import { useUserStore } from './userStore';

export const ACHIEVEMENTS: AchievementDefinition[] =
  getLocalContentRepository().getAchievementsSync();

interface ClaimResult {
  success: boolean;
  message: string;
}

interface AchievementsState {
  stats: AchievementStats;
  userAchievements: Record<number, UserAchievementRecord>;

  recordCorrectAnswer: () => void;
  recordSavingsDeposit: () => void;
  recordHiddenItemsOwned: (count: number) => void;
  recordBranchProgress: (branchId: number, completed: number, total: number) => void;
  recordLessonsCompleted: (count: number) => void;
  recordStreakDays: (count: number) => void;
  recordLevelReached: (level: number) => void;
  recordShopItemsOwned: (count: number) => void;
  claimAchievement: (achievementId: number) => ClaimResult;
  getStatus: (achievementId: number) => UserAchievementRecord;
  /** §17.2 «Сброс профиля» — весь прогресс достижений к исходному состоянию. */
  resetAll: () => void;
}

function recomputeAll(stats: AchievementStats, current: Record<number, UserAchievementRecord>) {
  const next: Record<number, UserAchievementRecord> = { ...current };
  for (const def of ACHIEVEMENTS) {
    const prev = next[def.id] ?? createEmptyUserAchievement(def.id);
    if (prev.isCompleted) continue; // §2 «прогресс не теряется» — не пересчитываем уже выполненное
    const progress = computeAchievementProgress(def, stats);
    next[def.id] = { ...prev, progress, isCompleted: progress >= 100 };
  }
  return next;
}

export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => ({
      stats: {
        savingsDepositsCount: 0,
        correctAnswersCount: 0,
        hiddenItemsOwnedCount: 0,
        branchProgress: {},
        lessonsCompletedCount: 0,
        streakDaysCount: 0,
        playerLevel: 1,
        shopItemsOwnedCount: 0,
      },
      userAchievements: {},

      recordCorrectAnswer: () => {
        const stats = { ...get().stats, correctAnswersCount: get().stats.correctAnswersCount + 1 };
        set({ stats, userAchievements: recomputeAll(stats, get().userAchievements) });
      },

      recordSavingsDeposit: () => {
        const stats = {
          ...get().stats,
          savingsDepositsCount: get().stats.savingsDepositsCount + 1,
        };
        set({ stats, userAchievements: recomputeAll(stats, get().userAchievements) });
      },

      recordHiddenItemsOwned: (count) => {
        const stats = { ...get().stats, hiddenItemsOwnedCount: count };
        set({ stats, userAchievements: recomputeAll(stats, get().userAchievements) });
      },

      recordBranchProgress: (branchId, completed, total) => {
        const stats = {
          ...get().stats,
          branchProgress: { ...get().stats.branchProgress, [branchId]: { completed, total } },
        };
        set({ stats, userAchievements: recomputeAll(stats, get().userAchievements) });
      },

      recordLessonsCompleted: (count) => {
        const stats = { ...get().stats, lessonsCompletedCount: count };
        set({ stats, userAchievements: recomputeAll(stats, get().userAchievements) });
      },

      recordStreakDays: (count) => {
        const stats = { ...get().stats, streakDaysCount: count };
        set({ stats, userAchievements: recomputeAll(stats, get().userAchievements) });
      },

      recordLevelReached: (level) => {
        const stats = { ...get().stats, playerLevel: level };
        set({ stats, userAchievements: recomputeAll(stats, get().userAchievements) });
      },

      recordShopItemsOwned: (count) => {
        const stats = { ...get().stats, shopItemsOwnedCount: count };
        set({ stats, userAchievements: recomputeAll(stats, get().userAchievements) });
      },

      getStatus: (achievementId) => {
        return get().userAchievements[achievementId] ?? createEmptyUserAchievement(achievementId);
      },

      claimAchievement: (achievementId) => {
        const def = ACHIEVEMENTS.find((a) => a.id === achievementId);
        if (!def) return { success: false, message: 'Достижение не найдено' };

        const status = get().getStatus(achievementId);
        if (!status.isCompleted) return { success: false, message: 'Условие ещё не выполнено' };
        if (status.isClaimed) return { success: false, message: 'Награда уже забрана' };

        if (def.reward_type === 'coins') {
          useUserStore
            .getState()
            .recordTransaction(def.reward_amount, 'achievement_reward', `Достижение: ${def.name}`);
        } else {
          // §14.1 «Достижение — по правилу конкретного достижения»
          if (def.gift_mode === 'guaranteed_choice') {
            useGiftsStore
              .getState()
              .addGuaranteedChoiceGift('achievement', def.gift_options_count ?? 2, null, def.name);
          } else {
            useGiftsStore.getState().addRandomGift('achievement', null, def.name);
          }
        }

        set({
          userAchievements: {
            ...get().userAchievements,
            [achievementId]: { ...status, isClaimed: true },
          },
        });

        return { success: true, message: `Награда получена: ${def.name}` };
      },

      resetAll: () =>
        set({
          stats: {
            savingsDepositsCount: 0,
            correctAnswersCount: 0,
            hiddenItemsOwnedCount: 0,
            branchProgress: {},
            lessonsCompletedCount: 0,
            streakDaysCount: 0,
            playerLevel: 1,
            shopItemsOwnedCount: 0,
          },
          userAchievements: {},
        }),
    }),
    {
      name: 'finsputnik-achievements-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function useAchievements() {
  return useAchievementsStore();
}
