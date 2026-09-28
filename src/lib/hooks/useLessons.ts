// lib/hooks/useLessons.ts
// Хук для работы с уроками: ветки, прогресс, мини-игры, награды за урок.
// Награда за урок (вариант B, domain/lesson/lessonRewards.ts) начисляется
// здесь, в finishLesson, — ровно в одном месте: экран награды её только
// показывает.
//
// Учебный прогресс — в SQLite (миграция v9, решение пользователя 28.09.2026):
// состояние каждого урока из узлов (domain/lesson/lessonProgress.ts) и опыт
// игрока. Стор — кэш в памяти: грузится load() при старте и после онбординга,
// каждое изменение сразу пишется в SQLite.

import { getLocalContentRepository } from '@/data/content';
import {
  AnyLessonContent,
  BranchContent,
  FiveLettersWordContent,
  QuestionContent,
} from '@/domain/content/LessonContent';
import {
  computeLevel,
  getLevelTitle,
  LEVEL_REWARDS,
  LOOK_REWARD_LEVELS,
  pickLookToGrant,
} from '@/domain/player/PlayerLevel';
import { getLessonProgressRepository } from '@/data/local/repositories';
import { LessonPlan } from '@/domain/lesson/LessonPlan';
import {
  LessonProgressState,
  createLessonProgress,
  settleLesson,
} from '@/domain/lesson/lessonProgress';
import {
  LessonRewardAmounts,
  SHIFT_LESSON_COIN_BONUS_PERCENT,
  lessonRewardAmounts,
} from '@/domain/lesson/lessonRewards';
import { create } from 'zustand';
import { importLegacyLessonProgress } from '../lessons/importLegacyLessonProgress';
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
/** Урок любого формата: из узлов или старый (идёт через адаптер, см. LessonPlan.ts). */
export type Lesson = AnyLessonContent;
export type Question = QuestionContent;
export type Branch = BranchContent;

export interface LessonProgress {
  lesson_id: number;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number;
  completed_at: string | null;
}

/** Награда за урок — уже начислена (finishLesson), для экрана награды. */
export interface LessonRewardResult extends LessonRewardAmounts {
  /** Всего монет на счёт: базовые + бонус за идеальное прохождение. */
  coins: number;
  /** Переход уровня от опыта урока, если случился. */
  levelUp: LevelUpResult | null;
}

export interface LessonFinishResult {
  state: LessonProgressState;
  firstCompletion: boolean;
  firstPerfect: boolean;
  reward: LessonRewardResult;
}

const NO_REWARD: LessonRewardAmounts = { completionCoins: 0, perfectCoins: 0, xp: 0 };

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

/** Статус урока в прежнем виде — для экранов, которые ещё не перешли на узлы. */
function toLegacyProgress(
  states: Record<number, LessonProgressState>
): Record<number, LessonProgress> {
  const progress: Record<number, LessonProgress> = {};
  for (const state of Object.values(states)) {
    progress[state.lessonId] = {
      lesson_id: state.lessonId,
      // Строка урока появляется при первом открытии — значит, он начат.
      status: state.completedAt ? 'completed' : 'in_progress',
      score: 0,
      completed_at: state.completedAt,
    };
  }
  return progress;
}

/** Профиль, чей прогресс сейчас в сторе, — туда и пишем. */
function currentProfileId(): string | null {
  return useUserStore.getState().user?.id ?? null;
}

function persistLessonState(state: LessonProgressState): void {
  const profileId = currentProfileId();
  if (!profileId) return;
  getLessonProgressRepository()
    .save(profileId, state)
    .catch((error) => console.warn('[Lessons] Не удалось сохранить прогресс урока:', error));
}

function persistTotalXp(totalXp: number): void {
  const profileId = currentProfileId();
  if (!profileId) return;
  getLessonProgressRepository()
    .saveTotalXp(profileId, totalXp)
    .catch((error) => console.warn('[Lessons] Не удалось сохранить опыт:', error));
}

type LoadStatus = 'idle' | 'loading' | 'loaded';

/** Первое завершение урока: прогресс ветки и число пройденных уроков — для достижений. */
function reportLessonCompleted(
  lessonId: number,
  lessonStates: Record<number, LessonProgressState>,
  getBranchProgress: (id: number) => { completed: number; total: number }
): void {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  if (lesson) reportBranchProgress(lesson.branch_id, getBranchProgress);
  const completedCount = Object.values(lessonStates).filter((state) => state.completedAt).length;
  useAchievementsStore.getState().recordLessonsCompleted(completedCount);
}

interface LessonsState {
  /** Состояние уроков из узлов по id урока — источник истины (SQLite). */
  lessonStates: Record<number, LessonProgressState>;
  /** Производное от lessonStates: статус урока в прежнем виде. */
  progress: { [lessonId: number]: LessonProgress };
  totalXp: number;
  /** 'loading' — прогресс профиля читается из SQLite (см. waitForLessonsLoaded). */
  loadStatus: LoadStatus;

  // Actions
  /** Читает прогресс профиля из SQLite (и один раз переносит старый из AsyncStorage). */
  load: (profileId: string) => Promise<void>;
  /** Сохраняет состояние урока из узлов (плеер урока). */
  saveLessonState: (state: LessonProgressState) => void;
  /**
   * Финальный узел или перепрохождение завершённого урока: фиксирует
   * завершение и звезду (settleLesson), сохраняет и начисляет награду
   * (вариант B): первое завершение — опыт и монеты, первая звезда — бонус;
   * при первом завершении — ещё прогресс ветки и достижения. shiftLesson —
   * урок смены (+10% монет).
   */
  finishLesson: (
    plan: LessonPlan,
    state: LessonProgressState,
    options?: { shiftLesson?: boolean }
  ) => LessonFinishResult;
  startLesson: (lessonId: number) => Lesson;
  isLessonAvailable: (lessonId: number) => boolean;
  getBranchProgress: (branchId: number) => { completed: number; total: number };
  /** Первый ещё не пройденный урок ветки в порядке order_index — «следующее задание». */
  getNextLessonInBranch: (branchId: number) => Lesson | null;
  /**
   * Начисляет опыт игроку и выдаёт награду за каждый пересечённый уровень.
   * Источник опыта — первое завершение урока (finishLesson); level-up
   * считается ровно здесь. Возвращает переход уровня, если он случился (для
   * карточки на экране награды урока), иначе null.
   */
  addXp: (amount: number) => LevelUpResult | null;
  /** §17.2 «Сброс профиля» — прогресс уроков к исходному состоянию в памяти (SQLite чистит profileReset). */
  resetProgress: () => void;
}

export const useLessonsStore = create<LessonsState>()((set, get) => {
  const setLessonStates = (lessonStates: Record<number, LessonProgressState>) =>
    set({ lessonStates, progress: toLegacyProgress(lessonStates) });

  const isCompleted = (lessonId: number) => Boolean(get().lessonStates[lessonId]?.completedAt);

  return {
    lessonStates: {},
    progress: {},
    totalXp: 0,
    loadStatus: 'idle',

    load: async (profileId) => {
      set({ loadStatus: 'loading' });
      const repository = getLessonProgressRepository();
      try {
        await importLegacyLessonProgress(profileId, repository);
      } catch (error) {
        console.warn('[Lessons] Не удалось перенести старый прогресс уроков:', error);
      }
      try {
        const [states, totalXp] = await Promise.all([
          repository.getAllForProfile(profileId),
          repository.getTotalXp(profileId),
        ]);
        setLessonStates(Object.fromEntries(states.map((state) => [state.lessonId, state])));
        set({ totalXp, loadStatus: 'loaded' });
      } catch (error) {
        console.error('[Lessons] Не удалось загрузить прогресс уроков:', error);
        set({ loadStatus: 'loaded' });
      }
    },

    saveLessonState: (state) => {
      setLessonStates({ ...get().lessonStates, [state.lessonId]: state });
      persistLessonState(state);
    },

    finishLesson: (plan, state, options = {}) => {
      const result = settleLesson(plan, state, new Date().toISOString());
      get().saveLessonState(result.state);

      const lesson = LESSONS.find((l) => l.id === plan.lessonId);
      const amounts = lesson
        ? lessonRewardAmounts({
            plan,
            lesson,
            lessons: LESSONS,
            firstCompletion: result.firstCompletion,
            firstPerfect: result.firstPerfect,
            coinBonusPercent:
              (options.shiftLesson ? SHIFT_LESSON_COIN_BONUS_PERCENT : 0) +
              useShopStore.getState().getTotalCoinBonusPercent(),
            isDemo: useUserStore.getState().user?.is_demo ?? false,
          })
        : NO_REWARD;
      const { recordTransaction } = useUserStore.getState();
      if (amounts.completionCoins > 0) {
        recordTransaction(amounts.completionCoins, 'lesson_reward', `Урок «${lesson?.title}»`);
      }
      if (amounts.perfectCoins > 0) {
        recordTransaction(
          amounts.perfectCoins,
          'lesson_reward',
          `Звезда за урок «${lesson?.title}»`
        );
      }
      const levelUp = amounts.xp > 0 ? get().addXp(amounts.xp) : null;

      if (result.firstCompletion) {
        reportLessonCompleted(plan.lessonId, get().lessonStates, get().getBranchProgress);
      }
      return {
        ...result,
        reward: { ...amounts, coins: amounts.completionCoins + amounts.perfectCoins, levelUp },
      };
    },

    startLesson: (lessonId) => {
      const lesson = LESSONS.find((l) => l.id === lessonId);
      if (!lesson) throw new Error('Урок не найден');

      if (!get().lessonStates[lessonId]) get().saveLessonState(createLessonProgress(lessonId));
      return lesson;
    },

    isLessonAvailable: (lessonId) => {
      const lesson = LESSONS.find((l) => l.id === lessonId);
      if (!lesson) return false;

      // §18.2 демо-режим: задания доступны сразу все, без порядка прохождения
      if (useUserStore.getState().user?.is_demo) return true;

      const lessonsInBranch = LESSONS.filter((l) => l.branch_id === lesson.branch_id).sort(
        (a, b) => a.order_index - b.order_index
      );

      const currentIndex = lessonsInBranch.findIndex((l) => l.id === lessonId);
      if (currentIndex === 0) return true;

      return isCompleted(lessonsInBranch[currentIndex - 1].id);
    },

    getBranchProgress: (branchId) => {
      const lessonsInBranch = LESSONS.filter((l) => l.branch_id === branchId);
      const completed = lessonsInBranch.filter((l) => isCompleted(l.id)).length;
      return { completed, total: lessonsInBranch.length };
    },

    getNextLessonInBranch: (branchId) => {
      const lessonsInBranch = LESSONS.filter((l) => l.branch_id === branchId).sort(
        (a, b) => a.order_index - b.order_index
      );
      return lessonsInBranch.find((l) => !isCompleted(l.id)) ?? null;
    },

    addXp: (amount) => {
      const prevLevel = computeLevel(get().totalXp).level;
      const nextTotalXp = get().totalXp + amount;
      const nextLevel = computeLevel(nextTotalXp).level;

      set({ totalXp: nextTotalXp });
      persistTotalXp(nextTotalXp);

      if (nextLevel <= prevLevel) return null;
      const granted = grantLevelUpRewards(prevLevel, nextLevel);
      return { from: prevLevel, to: nextLevel, ...granted };
    },

    resetProgress: () => set({ lessonStates: {}, progress: {}, totalXp: 0 }),
  };
});

/**
 * Дождаться, пока прогресс профиля дочитается из SQLite (если он сейчас
 * читается): начисление опыта до этого было бы затёрто загрузкой. Не дольше
 * timeoutMs — ошибка чтения не должна подвесить вызывающего.
 */
export function waitForLessonsLoaded(timeoutMs = 3_000): Promise<void> {
  if (useLessonsStore.getState().loadStatus !== 'loading') return Promise.resolve();
  return new Promise((resolve) => {
    const unsubscribe = useLessonsStore.subscribe((state) => {
      if (state.loadStatus === 'loading') return;
      clearTimeout(timeout);
      unsubscribe();
      resolve();
    });
    const timeout = setTimeout(() => {
      unsubscribe();
      resolve();
    }, timeoutMs);
  });
}
