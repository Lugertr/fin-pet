// lib/hooks/useLessons.ts
// Хук для работы с уроками: ветки, прогресс, мини-игры.
// Бонус +10% коинов за приоритетную ветку применяется в StepRunner
// (см. src/components/lesson/StepRunner/StepRunner.tsx), не здесь.

import { getLocalContentRepository } from '@/data/content';
import {
  BranchContent,
  FiveLettersWordContent,
  LessonContent,
  QuestionContent,
} from '@/domain/content/LessonContent';
import {
  computeLevel,
  getLevelTitle,
  LEVEL_REWARDS,
  LOOK_REWARD_LEVELS,
  pickLookToGrant,
} from '@/domain/player/PlayerLevel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useAchievementsStore } from '../stores/achievementsStore';
import { usePetStore } from '../stores/petStore';
import { usePreferencesStore } from '../stores/preferencesStore';
import { equipSkin, getSkinsForPetType } from '../pet/petSkin';
import { SHOP_CATALOG, useShopStore } from './useShop';
import { useUserStore } from '../stores/userStore';

/**
 * Выдаёт настроенную в PlayerLevel награду за каждый пересечённый уровень —
 * монеты/предмет из таблицы, плюс на уровнях из LOOK_REWARD_LEVELS (2 и 3)
 * облик питомца, которого у ребёнка ещё нет (PlayerLevel.pickLookToGrant):
 * цветной сразу надевается, классический просто появляется в инвентаре.
 */
/** Возвращает, что реально выдано — для объяснения награды на экране (§8.4). */
function grantLevelUpRewards(
  fromLevel: number,
  toLevel: number
): { coins: number; skinName: string | null } {
  const petType = usePreferencesStore.getState().petType;
  let coins = 0;
  let skinName: string | null = null;

  for (let level = fromLevel + 1; level <= toLevel; level += 1) {
    const reward = LEVEL_REWARDS[level];
    if (reward?.coins) {
      useUserStore
        .getState()
        .recordTransaction(reward.coins, 'level_up', `Уровень ${level}: ${getLevelTitle(level)}`);
      coins += reward.coins;
    }
    if (reward?.itemId) {
      useShopStore.getState().addItem(reward.itemId, 1);
    }

    if (LOOK_REWARD_LEVELS.includes(level)) {
      const { ownedItems } = useShopStore.getState();
      const itemId = pickLookToGrant(
        getSkinsForPetType(petType),
        Object.keys(ownedItems)
          .map(Number)
          .filter((id) => ownedItems[id] > 0),
        usePetStore.getState().equippedSkinVariant
      );
      const skinItem = itemId !== null ? SHOP_CATALOG.find((i) => i.id === itemId) : undefined;
      // Уже имеющийся облик второй раз не выдаём (и не обещаем «новый»); у
      // вида с одним обликом (сейчас — мишка) выдавать нечего.
      if (skinItem) {
        useShopStore.getState().addItem(skinItem.id, 1);
        if ((skinItem.skin_variant ?? 0) > 0) void equipSkin(skinItem);
        skinName = skinItem.name;
      }
    }
  }
  useAchievementsStore.getState().recordLevelReached(toLevel);
  return { coins, skinName };
}

/** §15.2 «Кибер-защитник»: сообщает achievementsStore актуальный прогресс по ветке. */
function reportBranchProgress(
  branchId: number,
  getBranchProgress: (id: number) => { completed: number; total: number }
) {
  const { completed, total } = getBranchProgress(branchId);
  useAchievementsStore.getState().recordBranchProgress(branchId, completed, total);
}

// Содержимое веток/уроков живёт в content/*.json (§25 ТЗ), не здесь —
// см. LocalJsonContentRepository. Типы переиспользуют форму контента.
export type Lesson = LessonContent;
export type Question = QuestionContent;
export type Branch = BranchContent;

export interface LessonProgress {
  lesson_id: number;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number;
  completed_at: string | null;
}

export interface LevelUpResult {
  from: number;
  to: number;
  /** Монеты, реально начисленные за все пересечённые уровни. */
  coins: number;
  /** Название выданного и надетого скина, если он действительно выдан. */
  skinName: string | null;
}

// Ветки и уроки — из бандла content/*.json через репозиторий (см. заголовок файла)
const contentRepository = getLocalContentRepository();
export const BRANCHES: Branch[] = contentRepository.getBranchesSync();
export const LESSONS: Lesson[] = contentRepository.getLessonsSync();
/** Общий банк слов для мини-игры «5 букв» (не привязан к уроку) — см.
 * buildLessonSteps.ts, который выбирает случайное слово отсюда для уроков с
 * minigame_type: 'five_letters'. */
export const FIVE_LETTERS_WORDS: FiveLettersWordContent[] =
  contentRepository.getFiveLettersWordsSync();

interface LessonsState {
  progress: { [lessonId: number]: LessonProgress };
  completedBranches: number[];
  totalXp: number;

  // Actions
  startLesson: (lessonId: number) => Lesson;
  /**
   * Для уроков с полной композицией шагов (buildLessonSteps): награды уже выданы
   * пошагово через reward-шаги, здесь только фиксируется прогресс, без доп. монет.
   */
  markLessonCompleted: (lessonId: number) => void;
  isLessonAvailable: (lessonId: number) => boolean;
  getBranchProgress: (branchId: number) => { completed: number; total: number };
  /** Первый ещё не пройденный урок ветки в порядке order_index — «следующее задание». */
  getNextLessonInBranch: (branchId: number) => Lesson | null;
  /**
   * Начисляет опыт игроку и выдаёт награду за каждый пересечённый уровень.
   * Единственный источник опыта — завершение приключения
   * (adventureStore.completeAdventure) — level-up считается ровно один раз,
   * независимо от источника опыта. Возвращает переход уровня, если он
   * случился (для UI-карточки на экране итогов приключения), иначе null.
   */
  addXp: (amount: number) => LevelUpResult | null;
  /** §17.2 «Сброс профиля» — прогресс уроков к исходному состоянию. */
  resetProgress: () => void;
}

export const useLessonsStore = create<LessonsState>()(
  persist(
    (set, get) => ({
      progress: {},
      completedBranches: [],
      totalXp: 0,

      startLesson: (lessonId) => {
        const lesson = LESSONS.find((l) => l.id === lessonId);
        if (!lesson) throw new Error('Урок не найден');

        const { progress } = get();
        if (!progress[lessonId]) {
          set({
            progress: {
              ...progress,
              [lessonId]: {
                lesson_id: lessonId,
                status: 'in_progress',
                score: 0,
                completed_at: null,
              },
            },
          });
        }

        return lesson;
      },

      markLessonCompleted: (lessonId) => {
        const { progress } = get();
        // §9: пройденный урок доступен для повтора без награды (монеты за
        // повтор не начисляет RewardStep). Подарков за уроки нет — только за
        // 7 дней подряд (решение пользователя 27.09.2026).
        if (progress[lessonId]?.status === 'completed') return;

        const lesson = LESSONS.find((l) => l.id === lessonId);

        const nextProgress = {
          ...progress,
          [lessonId]: {
            lesson_id: lessonId,
            status: 'completed' as const,
            score: progress[lessonId]?.score || 0,
            completed_at: new Date().toISOString(),
          },
        };
        set({ progress: nextProgress });
        // Опыт за уроки не начисляется — только за завершение приключения
        // (решение пользователя 27.09.2026, см. adventureStore ADVENTURE_XP).

        if (lesson) reportBranchProgress(lesson.branch_id, get().getBranchProgress);

        const completedCount = Object.values(nextProgress).filter(
          (p) => p.status === 'completed'
        ).length;
        useAchievementsStore.getState().recordLessonsCompleted(completedCount);
      },

      isLessonAvailable: (lessonId) => {
        const lesson = LESSONS.find((l) => l.id === lessonId);
        if (!lesson) return false;

        // §18.2 демо-режим: задания доступны сразу все, без порядка прохождения
        if (useUserStore.getState().user?.is_demo) return true;

        const { progress } = get();
        const lessonsInBranch = LESSONS.filter((l) => l.branch_id === lesson.branch_id).sort(
          (a, b) => a.order_index - b.order_index
        );

        const currentIndex = lessonsInBranch.findIndex((l) => l.id === lessonId);
        if (currentIndex === 0) return true;

        const prevLesson = lessonsInBranch[currentIndex - 1];
        return progress[prevLesson.id]?.status === 'completed';
      },

      getBranchProgress: (branchId) => {
        const { progress } = get();
        const lessonsInBranch = LESSONS.filter((l) => l.branch_id === branchId);
        const completed = lessonsInBranch.filter(
          (l) => progress[l.id]?.status === 'completed'
        ).length;
        return { completed, total: lessonsInBranch.length };
      },

      getNextLessonInBranch: (branchId) => {
        const { progress } = get();
        const lessonsInBranch = LESSONS.filter((l) => l.branch_id === branchId).sort(
          (a, b) => a.order_index - b.order_index
        );
        return lessonsInBranch.find((l) => progress[l.id]?.status !== 'completed') ?? null;
      },

      addXp: (amount) => {
        const prevLevel = computeLevel(get().totalXp).level;
        const nextTotalXp = get().totalXp + amount;
        const nextLevel = computeLevel(nextTotalXp).level;

        set({ totalXp: nextTotalXp });

        if (nextLevel <= prevLevel) return null;
        const granted = grantLevelUpRewards(prevLevel, nextLevel);
        return { from: prevLevel, to: nextLevel, ...granted };
      },

      resetProgress: () => set({ progress: {}, completedBranches: [], totalXp: 0 }),
    }),
    {
      name: 'finsputnik-lessons-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
