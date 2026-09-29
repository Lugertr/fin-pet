// domain/lesson/lessonProgress.test.ts
// Прогресс урока из узлов (28.09.2026): порядок «Теория → этапы заданий»
// (29.09.2026), трек «N из M», продолжение с того же места, перепрохождение
// и «идеально».

import { LessonContent } from '@/domain/content/LessonContent';
import { LessonPlan, planForLesson } from './LessonPlan';
import {
  LessonProgressState,
  alignProgressWithStructure,
  completeAllActivities,
  completedNodeCount,
  createLessonProgress,
  currentPosition,
  hasStar,
  isLessonPerfect,
  isNodeUnlocked,
  markReadingDone,
  pickEvent,
  recordActivityResult,
  settleLesson,
  totalNodeCount,
} from './lessonProgress';

const card = { title: 'Бюджет', text: 'Бюджет — это план.' };
const question = {
  id: 1,
  question_text: 'Что такое бюджет?',
  options: ['План', 'Копилка'],
  correct_answer: 'План',
  question_type: 'test' as const,
};
const cinema = {
  id: 'cinema',
  title: 'Кино',
  description: 'Друг зовёт в кино.',
  icon: '🎬',
  options: [
    { id: 'go', label: 'Пойти', category: 'optional' as const, coinAmount: -20 },
    { id: 'skip', label: 'Не идти', category: null, coinAmount: 0 },
  ],
};
const fair = { ...cinema, id: 'fair', title: 'Ярмарка' };

const LESSON: LessonContent = {
  id: 7,
  branch_id: 1,
  title: 'Урок',
  order_index: 1,
  situation: { title: 'Ситуация', text: 'Тебе дали 100 монет.' },
  nodes: [
    {
      cards: [card],
      activities: [
        { type: 'test', questions: [question] },
        { type: 'event', pool: [cinema, fair] },
      ],
    },
    { cards: [card], activities: [{ type: 'minigame', minigame_type: 'five_letters' }] },
  ],
  conclusion: { title: 'Итог', text: 'Молодец!' },
};

const plan: LessonPlan = planForLesson(LESSON);
// Этап 0 — «Теория», задания — в этапах 1 и 2.
const [testActivity, eventActivity] = plan.nodes[1].activities;
const [gameActivity] = plan.nodes[2].activities;

/** Проходит весь урок; perfectTest — без ошибок ли тест. */
function playThrough(perfectTest: boolean): LessonProgressState {
  let state = createLessonProgress(LESSON.id);
  state = markReadingDone(state, 0);
  state = recordActivityResult(state, testActivity, { perfect: perfectTest });
  state = recordActivityResult(state, eventActivity, { perfect: true, optionId: 'skip' });
  state = recordActivityResult(state, gameActivity, { perfect: true });
  return state;
}

describe('currentPosition — порядок урока', () => {
  it('сначала «Теория», потом задания по порядку, потом заключение', () => {
    let state = createLessonProgress(LESSON.id);
    expect(currentPosition(plan, state)).toMatchObject({ kind: 'reading', node: { index: 0 } });

    state = markReadingDone(state, 0);
    expect(currentPosition(plan, state)).toMatchObject({
      kind: 'activity',
      activity: { id: '0.0' },
    });

    state = recordActivityResult(state, testActivity, { perfect: true });
    expect(currentPosition(plan, state)).toMatchObject({
      kind: 'activity',
      activity: { id: '0.1' },
    });

    // У этапа заданий нет карточек — сразу задание, без чтения.
    state = recordActivityResult(state, eventActivity, { perfect: true, optionId: 'go' });
    expect(currentPosition(plan, state)).toMatchObject({
      kind: 'activity',
      node: { index: 2 },
      activity: { id: '1.0' },
    });

    state = recordActivityResult(state, gameActivity, { perfect: false });
    expect(currentPosition(plan, state)).toEqual({ kind: 'final' });

    state = settleLesson(plan, state, '2026-09-28T10:00:00.000Z').state;
    expect(currentPosition(plan, state)).toEqual({ kind: 'done' });
  });

  it('продолжение с того же места — позиция считается только по сохранённому состоянию', () => {
    let state = markReadingDone(createLessonProgress(LESSON.id), 0);
    state = recordActivityResult(state, testActivity, { perfect: true });
    const restored: LessonProgressState = JSON.parse(JSON.stringify(state));
    expect(currentPosition(plan, restored)).toMatchObject({
      kind: 'activity',
      activity: { id: '0.1' },
    });
  });
});

describe('трек «N из M»', () => {
  it('«Теория» + этапы заданий + финиш', () => {
    expect(totalNodeCount(plan)).toBe(4);
    let state = createLessonProgress(LESSON.id);
    expect(completedNodeCount(plan, state)).toBe(0);

    state = markReadingDone(state, 0);
    expect(completedNodeCount(plan, state)).toBe(1);

    state = playThrough(true);
    expect(completedNodeCount(plan, state)).toBe(3);
    state = settleLesson(plan, state, '2026-09-28T10:00:00.000Z').state;
    expect(completedNodeCount(plan, state)).toBe(4);
  });

  it('открыть можно пройденные этапы и текущий, будущие — нет', () => {
    const state = markReadingDone(createLessonProgress(LESSON.id), 0);
    expect(isNodeUnlocked(plan, state, 0)).toBe(true);
    expect(isNodeUnlocked(plan, state, 1)).toBe(true);
    expect(isNodeUnlocked(plan, state, 2)).toBe(false);
    expect(isNodeUnlocked(plan, playThrough(true), 2)).toBe(true);
  });
});

describe('урок, пройденный до перехода на узлы (перенесён из старого прогресса)', () => {
  const imported: LessonProgressState = {
    ...createLessonProgress(LESSON.id),
    completedAt: '2026-09-20T10:00:00.000Z',
  };

  it('завершён целиком: позиция «done», трек заполнен, узлы открыты', () => {
    expect(currentPosition(plan, imported)).toEqual({ kind: 'done' });
    expect(completedNodeCount(plan, imported)).toBe(totalNodeCount(plan));
    expect(isNodeUnlocked(plan, imported, 1)).toBe(true);
  });

  it('звезды нет — её дают, только когда все тесты и игры пройдены без ошибок', () => {
    expect(hasStar(imported)).toBe(false);
    const retried = recordActivityResult(imported, testActivity, { perfect: true });
    expect(settleLesson(plan, retried, '2026-09-28T10:00:00.000Z').firstPerfect).toBe(false);
  });
});

describe('события внутри урока', () => {
  it('выпавшее событие запоминается и не меняется после перезапуска', () => {
    const first = pickEvent(createLessonProgress(LESSON.id), eventActivity, () => 0.99);
    expect(first.event?.id).toBe('fair');
    const again = pickEvent(first.state, eventActivity, () => 0);
    expect(again.event?.id).toBe('fair');
  });

  it('решённое событие повторно не перезаписывается', () => {
    let state = recordActivityResult(createLessonProgress(LESSON.id), eventActivity, {
      perfect: true,
      optionId: 'go',
    });
    state = recordActivityResult(state, eventActivity, { perfect: true, optionId: 'skip' });
    expect(state.results['0.1']).toMatchObject({ optionId: 'go', attempts: 1 });
  });

  it('не событие — ничего не выбирается', () => {
    expect(pickEvent(createLessonProgress(LESSON.id), testActivity).event).toBeNull();
  });
});

describe('перепрохождение и «идеально»', () => {
  it('засчитывается лучшая попытка, счётчик попыток растёт', () => {
    let state = recordActivityResult(createLessonProgress(LESSON.id), testActivity, {
      perfect: false,
    });
    state = recordActivityResult(state, testActivity, { perfect: true });
    state = recordActivityResult(state, testActivity, { perfect: false });
    expect(state.results['0.0']).toMatchObject({ perfect: true, attempts: 3 });
  });

  it('события на «идеально» не влияют', () => {
    expect(isLessonPerfect(plan, playThrough(true))).toBe(true);
    expect(isLessonPerfect(plan, playThrough(false))).toBe(false);
  });

  it('первое завершение с ошибками: награда за прохождение, звезды нет', () => {
    const { state, firstCompletion, firstPerfect } = settleLesson(
      plan,
      playThrough(false),
      '2026-09-28T10:00:00.000Z'
    );
    expect(firstCompletion).toBe(true);
    expect(firstPerfect).toBe(false);
    expect(hasStar(state)).toBe(false);
  });

  it('перепройти неидеальный тест — звезда один раз, повторно — ничего', () => {
    let state = settleLesson(plan, playThrough(false), '2026-09-28T10:00:00.000Z').state;

    state = recordActivityResult(state, testActivity, { perfect: true });
    const retry = settleLesson(plan, state, '2026-09-29T10:00:00.000Z');
    expect(retry.firstCompletion).toBe(false);
    expect(retry.firstPerfect).toBe(true);
    expect(hasStar(retry.state)).toBe(true);

    const again = settleLesson(plan, retry.state, '2026-09-30T10:00:00.000Z');
    expect(again.firstPerfect).toBe(false);
    expect(again.state.perfectAt).toBe('2026-09-29T10:00:00.000Z');
  });

  it('не всё пройдено — урок не завершается', () => {
    const partial = markReadingDone(createLessonProgress(LESSON.id), 0);
    expect(settleLesson(plan, partial, '2026-09-28T10:00:00.000Z')).toMatchObject({
      firstCompletion: false,
      state: { completedAt: null },
    });
  });
});

describe('alignProgressWithStructure — контент урока поменялся', () => {
  const started: LessonProgressState = {
    ...createLessonProgress(7),
    readNodes: [0],
    results: { '0.0': { completed: true, perfect: true, attempts: 1 } },
    eventPicks: { '0.1': 'x' },
    structureKey: 'test,event|test',
  };

  it('та же структура — то же состояние', () => {
    expect(alignProgressWithStructure(started, 'test,event|test')).toBe(started);
  });

  it('другая структура — позиция с начала, отпечаток новый', () => {
    const aligned = alignProgressWithStructure(started, 'minigame:quiz,event|test');
    expect(aligned).toMatchObject({
      readNodes: [],
      results: {},
      eventPicks: {},
      structureKey: 'minigame:quiz,event|test',
    });
  });

  it('отпечаток неизвестен (запись до миграции v12) — тоже с начала', () => {
    const aligned = alignProgressWithStructure(
      { ...started, structureKey: null },
      'test,event|test'
    );
    expect(aligned.results).toEqual({});
    expect(aligned.structureKey).toBe('test,event|test');
  });

  it('завершение и звезда не отнимаются', () => {
    const done = {
      ...started,
      completedAt: '2026-09-20T10:00:00.000Z',
      perfectAt: '2026-09-21T10:00:00.000Z',
    };
    const aligned = alignProgressWithStructure(done, 'test|test');
    expect(aligned.completedAt).toBe(done.completedAt);
    expect(hasStar(aligned)).toBe(true);
  });
});

describe('completeAllActivities — «Завершить урок» в демо', () => {
  it('засчитывает все этапы: дальше только заключение, урок завершается', () => {
    const state = completeAllActivities(plan, createLessonProgress(LESSON.id));

    expect(currentPosition(plan, state)).toEqual({ kind: 'final' });
    expect(completedNodeCount(plan, state)).toBe(plan.nodes.length);
    expect(settleLesson(plan, state, '2026-09-29T10:00:00.000Z').firstCompletion).toBe(true);
  });

  it('без звезды: пропуск — не прохождение без ошибок', () => {
    const state = completeAllActivities(plan, createLessonProgress(LESSON.id));
    const settled = settleLesson(plan, state, '2026-09-29T10:00:00.000Z');

    expect(isLessonPerfect(plan, state)).toBe(false);
    expect(settled.firstPerfect).toBe(false);
    expect(hasStar(settled.state)).toBe(false);
  });

  it('уже пройденное не меняется: результат и выбор в событии остаются', () => {
    let state = createLessonProgress(LESSON.id);
    state = markReadingDone(state, 0);
    state = recordActivityResult(state, testActivity, { perfect: true });
    state = recordActivityResult(state, eventActivity, { perfect: true, optionId: 'skip' });

    const next = completeAllActivities(plan, state);

    expect(next.results[testActivity.id]).toEqual(state.results[testActivity.id]);
    expect(next.results[eventActivity.id]?.optionId).toBe('skip');
    expect(next.results[gameActivity.id]).toEqual({ completed: true, perfect: false, attempts: 0 });
  });
});
