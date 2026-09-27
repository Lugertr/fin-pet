// domain/arcade/TrainerSelection.ts
// Контент для Аркады (решение пользователя 27.09.2026): Аркада открывается из
// приключения и даёт сыграть в любую из мини-игр по теме (компетенции)
// приключения — «Викторину», «Свайпы» или «5 букв». Раньше раунд собирался по
// случайной пройденной теме (§10.3 ранней версии ТЗ).

import {
  ArcadeSwipeCardsContent,
  FiveLettersWordContent,
  LessonContent,
  QuestionContent,
} from '@/domain/content/LessonContent';

export type ArcadeGameType = 'quiz' | 'tinder_swipe' | 'five_letters';

/** Порядок игр в списке Аркады. */
export const ARCADE_GAME_TYPES: ArcadeGameType[] = ['quiz', 'tinder_swipe', 'five_letters'];

export const QUIZ_TRAINER_QUESTION_COUNT = 10;
export const TINDER_SWIPE_TRAINER_QUESTION_COUNT = 5;
export const FIVE_LETTERS_TRAINER_WORD_COUNT = 3;

/**
 * Раунд Аркады по теме приключения ускоряет его, но слабее урока (решение
 * пользователя 27.09.2026): урок-задание — 45 минут, раунд Аркады — до 15,
 * пропорционально доле верных ответов (все неверные — не ускоряет).
 */
export const ARCADE_MAX_TIME_BONUS_MINUTES = 15;

export function arcadeTimeBonusMinutes(correctAnswers: number, roundLength: number): number {
  if (roundLength <= 0 || correctAnswers <= 0) return 0;
  const share = Math.min(1, correctAnswers / roundLength);
  return Math.floor(ARCADE_MAX_TIME_BONUS_MINUTES * share);
}

export interface TrainerSession {
  branchId: number;
  minigameType: ArcadeGameType;
  /** quiz / tinder_swipe — вопросы раунда. */
  questions: QuestionContent[];
  /** five_letters — слова раунда (одно слово = один «вопрос»). */
  words: FiveLettersWordContent[];
  /**
   * Раунд засчитывается как задание приключения — только когда его запустила
   * кнопка задания (тема уже пройдена на 100%, §7.5). Раунды, выбранные в
   * Аркаде, — просто тренировка и таймер приключения не ускоряют.
   */
  countsAsQuest: boolean;
}

/** Весь контент темы, из которого собираются раунды. */
export interface BranchArcadeSources {
  lessons: LessonContent[];
  swipeCards: ArcadeSwipeCardsContent[];
  words: FiveLettersWordContent[];
}

export function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)];
}

export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Пул контента одной игры по теме:
 * - quiz — вопросы мини-игр-квизов и итоговых тестов всех уроков темы;
 * - tinder_swipe — свайпы из уроков темы + карточки Аркады для темы;
 * - five_letters — слова банка, привязанные к теме (branch_ids).
 */
function gamePool(
  type: ArcadeGameType,
  branchId: number,
  sources: BranchArcadeSources
): { questions: QuestionContent[]; words: FiveLettersWordContent[] } {
  const lessons = sources.lessons.filter((l) => l.branch_id === branchId);
  switch (type) {
    case 'quiz':
      return {
        questions: [
          ...lessons
            .filter((l) => l.minigame_type === 'quiz')
            .flatMap((l) => l.questions.filter((q) => q.question_type === 'minigame')),
          ...lessons.flatMap((l) => l.test_questions),
        ],
        words: [],
      };
    case 'tinder_swipe':
      return {
        questions: [
          ...lessons
            .filter((l) => l.minigame_type === 'tinder_swipe')
            .flatMap((l) => l.questions.filter((q) => q.question_type === 'minigame')),
          ...sources.swipeCards
            .filter((set) => set.branch_id === branchId)
            .flatMap((set) => set.cards),
        ],
        words: [],
      };
    case 'five_letters':
      return {
        questions: [],
        words: sources.words.filter((w) => w.branch_ids?.includes(branchId)),
      };
  }
}

const ROUND_LIMIT: Record<ArcadeGameType, number> = {
  quiz: QUIZ_TRAINER_QUESTION_COUNT,
  tinder_swipe: TINDER_SWIPE_TRAINER_QUESTION_COUNT,
  five_letters: FIVE_LETTERS_TRAINER_WORD_COUNT,
};

/**
 * Демо-режим (§18, решение пользователя 28.09.2026): все три игры Аркады
 * показываются за полминуты — короткие раунды. Ускорение приключения считается
 * по доле верных ответов (arcadeTimeBonusMinutes), так что короче — не выгоднее.
 */
export const DEMO_ROUND_LIMIT: Record<ArcadeGameType, number> = {
  quiz: 3,
  tinder_swipe: 3,
  five_letters: 1,
};

function roundLimit(type: ArcadeGameType, demo: boolean): number {
  return (demo ? DEMO_ROUND_LIMIT : ROUND_LIMIT)[type];
}

/** Сколько «вопросов» в раунде (слов для «5 букв»). */
export function trainerRoundLength(session: TrainerSession): number {
  return session.minigameType === 'five_letters' ? session.words.length : session.questions.length;
}

/**
 * Раунд выбранной игры по теме: перемешанный пул, не больше лимита игры
 * (10 вопросов / 5 карточек / 3 слова; в демо — DEMO_ROUND_LIMIT). null — для
 * темы нет контента этой игры.
 */
export function buildBranchGameSession(
  type: ArcadeGameType,
  branchId: number,
  sources: BranchArcadeSources,
  countsAsQuest = false,
  demo = false
): TrainerSession | null {
  const pool = gamePool(type, branchId, sources);
  const questions = shuffle(pool.questions).slice(0, roundLimit(type, demo));
  const words = shuffle(pool.words).slice(0, roundLimit(type, demo));
  const session: TrainerSession = { branchId, minigameType: type, questions, words, countsAsQuest };
  return trainerRoundLength(session) > 0 ? session : null;
}

/** Игры, в которые по теме можно сыграть, и длина их раунда — для списка Аркады. */
export function listBranchGames(
  branchId: number,
  sources: BranchArcadeSources,
  demo = false
): { type: ArcadeGameType; roundLength: number }[] {
  return ARCADE_GAME_TYPES.map((type) => {
    const pool = gamePool(type, branchId, sources);
    const available = type === 'five_letters' ? pool.words.length : pool.questions.length;
    return { type, roundLength: Math.min(available, roundLimit(type, demo)) };
  }).filter((game) => game.roundLength > 0);
}

/**
 * Задание приключения для темы, уже пройденной на 100% (§7.5): раунд случайной
 * игры этой темы, засчитывается как задание.
 */
export function buildQuestTrainerSession(
  branchId: number,
  sources: BranchArcadeSources,
  demo = false
): TrainerSession | null {
  const game = pickRandom(listBranchGames(branchId, sources, demo));
  return game ? buildBranchGameSession(game.type, branchId, sources, true, demo) : null;
}
