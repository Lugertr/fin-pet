// domain/lesson/lessonRewards.ts
// Награда за урок — вариант B (решение пользователя 28.09.2026):
// - первое прохождение: опыт и базовые монеты (§9.3: теория 10 + мини-игра 25,
//   если есть, + тест 50);
// - первый раз без ошибок (сразу или при перепрохождении): звезда и бонус
//   LESSON_PERFECT_BONUS — один раз за урок;
// - повторы без новой звезды — ничего.
// Монеты растут на надбавку: урок смены +10%, ноутбук — свой процент.
// Опыт: у ветки 300 (XP_PER_LEVEL), он делится между её уроками — закрытая
// ветка даёт ровно +1 уровень; в демо-режиме каждый урок — новый уровень.
// Начисляет награды useLessonsStore.finishLesson — ровно в одном месте.

import { XP_PER_LEVEL } from '@/domain/player/PlayerLevel';
import { LessonPlan } from './LessonPlan';

export const LESSON_STEP_REWARDS = {
  theory: 10,
  minigame: 25,
  test: 50,
} as const;

/** Бонус за первое прохождение урока без ошибок (вместе со звездой), до надбавок. */
export const LESSON_PERFECT_BONUS = 25;

/** Надбавка к монетам урока смены, %. */
export const SHIFT_LESSON_COIN_BONUS_PERCENT = 10;

/** Монеты за первое прохождение урока — до надбавок (урок смены, ноутбук). */
export function lessonCompletionCoins(plan: LessonPlan): number {
  const activities = plan.nodes.flatMap((node) => node.activities);
  const hasMinigame = activities.some((a) => a.content.type === 'minigame');
  const hasTest = activities.some((a) => a.content.type === 'test');
  return (
    LESSON_STEP_REWARDS.theory +
    (hasMinigame ? LESSON_STEP_REWARDS.minigame : 0) +
    (hasTest ? LESSON_STEP_REWARDS.test : 0)
  );
}

interface LessonRef {
  id: number;
  branch_id: number;
  order_index: number;
}

/**
 * Опыт за урок: XP_PER_LEVEL ветки поровну между её уроками, в целых — остаток
 * деления достаётся первым урокам по порядку. Сумма по ветке — ровно
 * XP_PER_LEVEL. 0 — урока нет в списке.
 */
export function lessonXp(lesson: LessonRef, lessons: LessonRef[]): number {
  const branch = lessons
    .filter((l) => l.branch_id === lesson.branch_id)
    .sort((a, b) => a.order_index - b.order_index);
  const index = branch.findIndex((l) => l.id === lesson.id);
  if (index < 0) return 0;
  const base = Math.floor(XP_PER_LEVEL / branch.length);
  const remainder = XP_PER_LEVEL - base * branch.length;
  return base + (index < remainder ? 1 : 0);
}

export interface LessonRewardInput {
  plan: LessonPlan;
  lesson: LessonRef;
  lessons: LessonRef[];
  /** Урок завершён впервые — опыт и базовые монеты. */
  firstCompletion: boolean;
  /** Урок впервые стал идеальным — бонус (звезду ставит settleLesson). */
  firstPerfect: boolean;
  /** Надбавка к монетам, %: урок смены и ноутбук. */
  coinBonusPercent: number;
  /** §18.2 демо-режим: урок — новый уровень. */
  isDemo: boolean;
}

export interface LessonRewardAmounts {
  /** Базовые монеты за первое прохождение (с надбавкой). */
  completionCoins: number;
  /** Бонус за идеальное прохождение (с надбавкой). */
  perfectCoins: number;
  xp: number;
}

/** Сколько дать за урок сейчас — все суммы целые, повтор без новой звезды — нули. */
export function lessonRewardAmounts(input: LessonRewardInput): LessonRewardAmounts {
  const multiplier = 1 + input.coinBonusPercent / 100;
  return {
    completionCoins: input.firstCompletion
      ? Math.round(lessonCompletionCoins(input.plan) * multiplier)
      : 0,
    perfectCoins: input.firstPerfect ? Math.round(LESSON_PERFECT_BONUS * multiplier) : 0,
    xp: input.firstCompletion
      ? input.isDemo
        ? XP_PER_LEVEL
        : lessonXp(input.lesson, input.lessons)
      : 0,
  };
}
