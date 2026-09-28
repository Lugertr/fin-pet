// domain/lesson/lessonRewards.test.ts
// Награда за урок — вариант B (решение пользователя 28.09.2026) и опыт:
// тема уроков целиком — ровно +1 уровень (CLAUDE.md: рост «стадии» — здесь
// уровня игрока), монеты только целые.

import lessonsJson from '../../../content/lessons.json';
import { LessonContent } from '@/domain/content/LessonContent';
import { XP_PER_LEVEL, computeLevel } from '@/domain/player/PlayerLevel';
import { planForLesson } from './LessonPlan';
import {
  LESSON_PERFECT_BONUS,
  lessonCompletionCoins,
  lessonRewardAmounts,
  lessonXp,
} from './lessonRewards';

const LESSONS = lessonsJson as unknown as LessonContent[];
const BRANCH_IDS = [...new Set(LESSONS.map((l) => l.branch_id))];

describe('lessonXp — опыт темы делится между её уроками', () => {
  it.each(BRANCH_IDS)('тема %i: сумма опыта уроков — ровно один уровень', (branchId) => {
    const branch = LESSONS.filter((l) => l.branch_id === branchId);
    const xps = branch.map((lesson) => lessonXp(lesson, LESSONS));
    expect(xps.every((xp) => Number.isInteger(xp) && xp > 0)).toBe(true);
    expect(xps.reduce((sum, xp) => sum + xp, 0)).toBe(XP_PER_LEVEL);
  });

  it.each(BRANCH_IDS)('тема %i целиком — +1 уровень с любого опыта', (branchId) => {
    const branchXp = LESSONS.filter((l) => l.branch_id === branchId).reduce(
      (sum, lesson) => sum + lessonXp(lesson, LESSONS),
      0
    );
    for (let xp = 0; xp <= 3 * XP_PER_LEVEL; xp += 17) {
      expect(computeLevel(xp + branchXp).level).toBe(computeLevel(xp).level + 1);
    }
  });

  it('3 урока — по 100; не делится нацело — остаток первым урокам', () => {
    const three = [1, 2, 3].map((i) => ({ id: i, branch_id: 1, order_index: i }));
    expect(three.map((l) => lessonXp(l, three))).toEqual([100, 100, 100]);

    const seven = [1, 2, 3, 4, 5, 6, 7].map((i) => ({ id: i, branch_id: 2, order_index: i }));
    expect(seven.map((l) => lessonXp(l, seven))).toEqual([43, 43, 43, 43, 43, 43, 42]);
  });

  it('урока нет в списке — 0', () => {
    expect(lessonXp({ id: 999, branch_id: 1, order_index: 1 }, LESSONS)).toBe(0);
  });
});

describe('lessonRewardAmounts — вариант B', () => {
  const lesson = LESSONS.find((l) => l.branch_id === 1 && l.order_index === 1)!;
  const plan = planForLesson(lesson);
  const base = {
    plan,
    lesson,
    lessons: LESSONS,
    coinBonusPercent: 0,
    isDemo: false,
  };

  it('первое прохождение с ошибками — монеты и опыт, без бонуса', () => {
    expect(lessonRewardAmounts({ ...base, firstCompletion: true, firstPerfect: false })).toEqual({
      completionCoins: lessonCompletionCoins(plan),
      perfectCoins: 0,
      xp: lessonXp(lesson, LESSONS),
    });
  });

  it('первое прохождение без ошибок — ещё и бонус за звезду', () => {
    const reward = lessonRewardAmounts({ ...base, firstCompletion: true, firstPerfect: true });
    expect(reward.completionCoins).toBe(lessonCompletionCoins(plan));
    expect(reward.perfectCoins).toBe(LESSON_PERFECT_BONUS);
  });

  it('звезда при перепрохождении — только бонус, без монет за прохождение и опыта', () => {
    expect(lessonRewardAmounts({ ...base, firstCompletion: false, firstPerfect: true })).toEqual({
      completionCoins: 0,
      perfectCoins: LESSON_PERFECT_BONUS,
      xp: 0,
    });
  });

  it('повтор без новой звезды — ничего', () => {
    expect(lessonRewardAmounts({ ...base, firstCompletion: false, firstPerfect: false })).toEqual({
      completionCoins: 0,
      perfectCoins: 0,
      xp: 0,
    });
  });

  it('надбавки (урок смены, ноутбук) — на монеты, суммы целые; опыт не меняют', () => {
    const reward = lessonRewardAmounts({
      ...base,
      coinBonusPercent: 10 + 5,
      firstCompletion: true,
      firstPerfect: true,
    });
    expect(reward.completionCoins).toBe(Math.round(lessonCompletionCoins(plan) * 1.15));
    expect(reward.perfectCoins).toBe(Math.round(LESSON_PERFECT_BONUS * 1.15));
    expect(Number.isInteger(reward.completionCoins)).toBe(true);
    expect(Number.isInteger(reward.perfectCoins)).toBe(true);
    expect(reward.xp).toBe(lessonXp(lesson, LESSONS));
  });

  it('демо-режим — урок даёт целый уровень опыта', () => {
    const reward = lessonRewardAmounts({
      ...base,
      isDemo: true,
      firstCompletion: true,
      firstPerfect: false,
    });
    expect(reward.xp).toBe(XP_PER_LEVEL);
  });
});
