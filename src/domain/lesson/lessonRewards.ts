// domain/lesson/lessonRewards.ts
// Монеты за урок (§9.3). Пока — прежние суммы за фазы, одна награда в конце
// урока за первое прохождение: теория 10 + мини-игра 25 (если есть) + тест 50.
// Награда по варианту B (опыт, базовые монеты, бонус и звезда за идеальный
// урок) — этап 5 переосмысления приключения.

import { LessonPlan } from './LessonPlan';

export const LESSON_STEP_REWARDS = {
  theory: 10,
  minigame: 25,
  test: 50,
} as const;

/** Монеты за первое прохождение урока — до надбавок (задание приключения, ноутбук). */
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
