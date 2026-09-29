// lib/hooks/useLessons.rewards.test.ts
// Награда за урок начисляется ровно в одном месте —
// useLessonsStore.finishLesson: первое прохождение — опыт; первая звезда
// (сразу или при перепрохождении) — только звезда; монет за урок нет —
// урок оплачивается зарплатой смены (решение 29.09.2026); тема целиком —
// ровно +1 уровень; в демо урок — уровень. Подарков уроки не дают.

import { LessonPlan, planForLesson } from '@/domain/lesson/LessonPlan';
import { LessonProgressState, createLessonProgress, hasStar } from '@/domain/lesson/lessonProgress';
import { lessonXp } from '@/domain/lesson/lessonRewards';
import { computeLevel } from '@/domain/player/PlayerLevel';
import { useGiftsStore } from '@/lib/stores/giftsStore';
import { useUserStore } from '@/lib/stores/userStore';
import { LESSONS, useLessonsStore } from './useLessons';
import { useShopStore } from './useShop';

const BUDGET_LESSONS = LESSONS.filter((l) => l.branch_id === 1).sort(
  (a, b) => a.order_index - b.order_index
);
const LESSON = BUDGET_LESSONS[0];
const PLAN = planForLesson(LESSON);

/** Все этапы пройдены; perfect — каждый тест и игра без ошибок. */
function allDone(plan: LessonPlan, perfect: boolean): LessonProgressState {
  let state = createLessonProgress(plan.lessonId);
  for (const node of plan.nodes) {
    state = { ...state, readNodes: [...state.readNodes, node.index] };
    for (const activity of node.activities) {
      state = {
        ...state,
        results: {
          ...state.results,
          [activity.id]: { completed: true, perfect, attempts: 1 },
        },
      };
    }
  }
  return state;
}

function seedUser(isDemo = false): void {
  useUserStore.getState().setUser({
    id: 'test-profile',
    username: 'Тест',
    liquid_balance: 0,
    created_at: new Date().toISOString(),
    is_demo: isDemo,
  });
}

const wallet = () => useUserStore.getState().user?.liquid_balance ?? 0;

beforeEach(() => {
  useLessonsStore.getState().resetProgress();
  useShopStore.getState().resetInventory();
  useGiftsStore.getState().clearAll();
  seedUser();
});

describe('finishLesson — награда за урок: опыт и звезда, без монет', () => {
  it('первое прохождение — опыт, монет в кошелёк нет; повтор — ничего', () => {
    const first = useLessonsStore.getState().finishLesson(PLAN, allDone(PLAN, false));

    expect(first.reward).toMatchObject({ xp: lessonXp(LESSON, LESSONS) });
    expect(wallet()).toBe(0);
    expect(useLessonsStore.getState().totalXp).toBe(lessonXp(LESSON, LESSONS));
    expect(hasStar(first.state)).toBe(false);

    const again = useLessonsStore.getState().finishLesson(PLAN, first.state);
    expect(again.reward).toMatchObject({ xp: 0, levelUp: null });
  });

  it('звезда при перепрохождении — один раз, без опыта и монет', () => {
    const first = useLessonsStore.getState().finishLesson(PLAN, allDone(PLAN, false));
    const xpAfterFirst = useLessonsStore.getState().totalXp;

    const retried = { ...allDone(PLAN, true), completedAt: first.state.completedAt };
    const perfect = useLessonsStore.getState().finishLesson(PLAN, retried);
    expect(perfect.firstPerfect).toBe(true);
    expect(hasStar(perfect.state)).toBe(true);
    expect(perfect.reward.xp).toBe(0);

    const again = useLessonsStore.getState().finishLesson(PLAN, perfect.state);
    expect(again.firstPerfect).toBe(false);
    expect(useLessonsStore.getState().totalXp).toBe(xpAfterFirst);
    expect(wallet()).toBe(0);
  });

  it('не всё пройдено — урок не завершён и ничего не начислено', () => {
    const result = useLessonsStore.getState().finishLesson(PLAN, createLessonProgress(LESSON.id));
    expect(result.firstCompletion).toBe(false);
    expect(result.reward).toMatchObject({ xp: 0, levelUp: null });
  });

  it('уроки подарков не выдают — ни в первый раз, ни при повторе', () => {
    const first = useLessonsStore.getState().finishLesson(PLAN, allDone(PLAN, false));
    useLessonsStore.getState().finishLesson(PLAN, first.state);
    expect(useGiftsStore.getState().pendingGifts.length).toBe(0);
  });
});

describe('finishLesson — опыт и уровни', () => {
  it('тема «Бюджет» целиком — ровно +1 уровень, на последнем уроке', () => {
    const levelUps = BUDGET_LESSONS.map((lesson) => {
      const plan = planForLesson(lesson);
      return useLessonsStore.getState().finishLesson(plan, allDone(plan, false)).reward.levelUp;
    });

    expect(levelUps.slice(0, -1)).toEqual(BUDGET_LESSONS.slice(0, -1).map(() => null));
    expect(levelUps[levelUps.length - 1]).toMatchObject({ from: 1, to: 2 });
    expect(computeLevel(useLessonsStore.getState().totalXp).level).toBe(2);
  });

  it('демо-режим — каждый урок даёт новый уровень', () => {
    seedUser(true);
    BUDGET_LESSONS.forEach((lesson, index) => {
      const plan = planForLesson(lesson, true);
      const { reward } = useLessonsStore.getState().finishLesson(plan, allDone(plan, false));
      expect(reward.levelUp?.to).toBe(index + 2);
    });
  });
});

describe('completeLessonNow — «Завершить урок» в демо', () => {
  it('урок завершён сразу: целый уровень опыта, без звезды', () => {
    seedUser(true);

    const result = useLessonsStore.getState().completeLessonNow(LESSON.id);

    expect(result?.firstCompletion).toBe(true);
    expect(result?.reward.xp).toBe(computeLevel(0).xpForNext);
    expect(result?.reward.levelUp?.to).toBe(2);
    expect(hasStar(useLessonsStore.getState().lessonStates[LESSON.id])).toBe(false);
    expect(useLessonsStore.getState().lessonStates[LESSON.id]?.completedAt).not.toBeNull();
  });

  it('уже пройденный урок второй раз не засчитывается — опыт не удваивается', () => {
    seedUser(true);
    useLessonsStore.getState().completeLessonNow(LESSON.id);
    const xp = useLessonsStore.getState().totalXp;

    expect(useLessonsStore.getState().completeLessonNow(LESSON.id)).toBeNull();
    expect(useLessonsStore.getState().totalXp).toBe(xp);
  });
});
