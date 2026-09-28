// domain/lesson/buildLessonPath.test.ts
// Дорожка уроков на вкладке «Уроки»: звезда у идеально пройденных уроков,
// отметка «продолжить» у начатого, «следующий» — с него начнётся смена.

import lessonsJson from '../../../content/lessons.json';
import { LessonContent } from '@/domain/content/LessonContent';
import { buildLessonPath } from './buildLessonPath';
import { planForLesson } from './LessonPlan';
import { LessonProgressState, createLessonProgress, totalNodeCount } from './lessonProgress';

const LESSONS = lessonsJson as unknown as LessonContent[];
const BUDGET = LESSONS.filter((l) => l.branch_id === 1);
const [FIRST, SECOND, THIRD] = [...BUDGET].sort((a, b) => a.order_index - b.order_index);

function done(lessonId: number, perfect: boolean): LessonProgressState {
  return {
    ...createLessonProgress(lessonId),
    completedAt: '2026-09-20T10:00:00.000Z',
    perfectAt: perfect ? '2026-09-20T10:00:00.000Z' : null,
  };
}

describe('buildLessonPath', () => {
  it('по порядку; ничего не пройдено — первый «следующий», остальные закрыты', () => {
    const path = buildLessonPath([THIRD, FIRST, SECOND], {});
    expect(path.map((item) => item.lesson.id)).toEqual([FIRST.id, SECOND.id, THIRD.id]);
    expect(path.map((item) => item.status)).toEqual(['next', 'locked', 'locked']);
  });

  it('звезда — у пройденного без ошибок; начатый — «продолжить» с числом этапов', () => {
    const started = { ...createLessonProgress(THIRD.id), readNodes: [0] };
    const path = buildLessonPath(BUDGET, {
      [FIRST.id]: done(FIRST.id, true),
      [SECOND.id]: done(SECOND.id, false),
      [THIRD.id]: started,
    });
    const byId = Object.fromEntries(path.map((item) => [item.lesson.id, item]));
    expect(byId[FIRST.id].status).toBe('perfect');
    expect(byId[SECOND.id].status).toBe('completed');
    expect(byId[SECOND.id].nodesDone).toBe(byId[SECOND.id].nodesTotal);
    expect(byId[THIRD.id]).toMatchObject({
      status: 'started',
      nodesDone: 0,
      nodesTotal: totalNodeCount(planForLesson(THIRD)),
    });
  });

  it('первый урок пройден — «следующим» становится второй', () => {
    const path = buildLessonPath(BUDGET, { [FIRST.id]: done(FIRST.id, false) });
    expect(path.map((item) => item.status)).toEqual(['completed', 'next', 'locked']);
  });

  it('демо — этапов столько же, сколько на треке демо-смены', () => {
    const [item] = buildLessonPath([FIRST], {}, true);
    expect(item.nodesTotal).toBe(totalNodeCount(planForLesson(FIRST, true)));
  });
});
