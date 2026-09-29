// domain/lesson/lessonRewards.test.ts
// Награда за урок — опыт: тема уроков целиком — ровно +1 уровень (CLAUDE.md:
// рост «стадии» — здесь уровня игрока). Монет за урок нет (29.09.2026).

import lessonsJson from '../../../content/lessons.json';
import { LessonContent } from '@/domain/content/LessonContent';
import { XP_PER_LEVEL, computeLevel } from '@/domain/player/PlayerLevel';
import { lessonRewardXp, lessonXp } from './lessonRewards';

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

describe('lessonRewardXp — опыт за урок (монет за урок нет, решение 29.09.2026)', () => {
  const lesson = LESSONS.find((l) => l.branch_id === 1 && l.order_index === 1)!;
  const base = { lesson, lessons: LESSONS, isDemo: false };

  it('первое прохождение — опыт урока', () => {
    expect(lessonRewardXp({ ...base, firstCompletion: true })).toBe(lessonXp(lesson, LESSONS));
  });

  it('повтор — ничего', () => {
    expect(lessonRewardXp({ ...base, firstCompletion: false })).toBe(0);
  });

  it('демо-режим — урок даёт целый уровень опыта', () => {
    expect(lessonRewardXp({ ...base, isDemo: true, firstCompletion: true })).toBe(XP_PER_LEVEL);
  });
});
