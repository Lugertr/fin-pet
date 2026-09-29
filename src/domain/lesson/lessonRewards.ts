// domain/lesson/lessonRewards.ts
// Награда за урок: опыт за первое прохождение и звезда за урок без ошибок
// (звезду ставит settleLesson). Монет за урок в кошелёк нет (решение
// пользователя 29.09.2026): урок оплачивается зарплатой смены — price урока
// (lessonEconomy.ts), и все деньги идут через бюджет работы.
// Опыт: у ветки 300 (XP_PER_LEVEL), он делится между её уроками — закрытая
// ветка даёт ровно +1 уровень; в демо-режиме каждый урок — новый уровень.
// Начисляет useLessonsStore.finishLesson — ровно в одном месте.

import { XP_PER_LEVEL } from '@/domain/player/PlayerLevel';

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

/** Опыт за урок сейчас: только первое прохождение; в демо — целый уровень. */
export function lessonRewardXp(input: {
  lesson: LessonRef;
  lessons: LessonRef[];
  firstCompletion: boolean;
  isDemo: boolean;
}): number {
  if (!input.firstCompletion) return 0;
  return input.isDemo ? XP_PER_LEVEL : lessonXp(input.lesson, input.lessons);
}
