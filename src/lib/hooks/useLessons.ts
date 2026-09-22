// lib/hooks/useLessons.ts
// Хук для работы с уроками: ветки, прогресс, мини-игры.
// Бонус +10% коинов за приоритетную ветку применяется в StepRunner
// (см. src/components/lesson/StepRunner/StepRunner.tsx), не здесь.

import { getLocalContentRepository } from '@/data/content';
import {
  BranchContent,
  FiveLettersWordContent,
  GiftPathNodeContent,
  LessonContent,
  QuestionContent,
} from '@/domain/content/LessonContent';
import {
  computeLevel,
  getLevelTitle,
  LEVEL_REWARDS,
  XP_PER_LESSON,
} from '@/domain/player/PlayerLevel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useAchievementsStore } from '../stores/achievementsStore';
import { useGiftsStore } from '../stores/giftsStore';
import { useShopStore } from './useShop';
import { useUserStore } from '../stores/userStore';

/** Выдаёт настроенную в PlayerLevel награду за каждый пересечённый уровень. */
function grantLevelUpRewards(fromLevel: number, toLevel: number) {
  for (let level = fromLevel + 1; level <= toLevel; level += 1) {
    const reward = LEVEL_REWARDS[level];
    if (!reward) continue;
    if (reward.coins) {
      useUserStore
        .getState()
        .recordTransaction(reward.coins, 'level_up', `Уровень ${level}: ${getLevelTitle(level)}`);
    }
    if (reward.itemId) {
      useShopStore.getState().addItem(reward.itemId, 1);
    }
  }
  useAchievementsStore.getState().recordLevelReached(toLevel);
}

/** §14.1: завершение урока («уровня») — гарантированный выбор 1 из 2-3 предметов. */
function grantLevelCompleteGift(lessonTitle?: string) {
  const optionsCount = Math.random() < 0.5 ? 2 : 3;
  useGiftsStore
    .getState()
    .addGuaranteedChoiceGift('level_complete', optionsCount, null, lessonTitle);
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

// Ветки и уроки — из бандла content/*.json через репозиторий (см. заголовок файла)
const contentRepository = getLocalContentRepository();
export const BRANCHES: Branch[] = contentRepository.getBranchesSync();
export const LESSONS: Lesson[] = contentRepository.getLessonsSync();
export const GIFT_PATH_NODES: GiftPathNodeContent[] = contentRepository.getGiftPathNodesSync();
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
  /** Зеркалит правило isLessonAvailable для узла-подарка: доступен, когда
   * пройден урок с order_index === node.after_order_index в его ветке. */
  isGiftNodeAvailable: (nodeId: string) => boolean;
  getBranchProgress: (branchId: number) => { completed: number; total: number };
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
        const lesson = LESSONS.find((l) => l.id === lessonId);
        grantLevelCompleteGift(lesson?.title);

        const { progress } = get();
        const nextProgress = {
          ...progress,
          [lessonId]: {
            lesson_id: lessonId,
            status: 'completed' as const,
            score: progress[lessonId]?.score || 0,
            completed_at: new Date().toISOString(),
          },
        };
        const prevLevel = computeLevel(get().totalXp).level;
        const nextTotalXp = get().totalXp + XP_PER_LESSON;
        const nextLevel = computeLevel(nextTotalXp).level;

        set({ progress: nextProgress, totalXp: nextTotalXp });

        if (lesson) reportBranchProgress(lesson.branch_id, get().getBranchProgress);

        const completedCount = Object.values(nextProgress).filter(
          (p) => p.status === 'completed'
        ).length;
        useAchievementsStore.getState().recordLessonsCompleted(completedCount);

        if (nextLevel > prevLevel) grantLevelUpRewards(prevLevel, nextLevel);
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

      isGiftNodeAvailable: (nodeId) => {
        const node = GIFT_PATH_NODES.find((n) => n.id === nodeId);
        if (!node) return false;

        // §18.2 демо-режим: задания доступны сразу все, без порядка прохождения
        if (useUserStore.getState().user?.is_demo) return true;

        const anchorLesson = LESSONS.find(
          (l) => l.branch_id === node.branch_id && l.order_index === node.after_order_index
        );
        if (!anchorLesson) return false;

        const { progress } = get();
        return progress[anchorLesson.id]?.status === 'completed';
      },

      getBranchProgress: (branchId) => {
        const { progress } = get();
        const lessonsInBranch = LESSONS.filter((l) => l.branch_id === branchId);
        const completed = lessonsInBranch.filter(
          (l) => progress[l.id]?.status === 'completed'
        ).length;
        return { completed, total: lessonsInBranch.length };
      },

      resetProgress: () => set({ progress: {}, completedBranches: [], totalXp: 0 }),
    }),
    {
      name: 'finsputnik-lessons-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
