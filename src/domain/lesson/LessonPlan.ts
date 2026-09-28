// domain/lesson/LessonPlan.ts
// Урок из узлов (решение пользователя 28.09.2026): ситуация по теме → узлы-
// блоки → заключение. Узел = блок чтения (ситуация у первого узла + карточки
// теории, всегда первым и перечитываемый) + действия: тест, мини-игра,
// событие. Каждый узел — точка прогресс-трека смены, последняя точка трека —
// завершение урока с заключением.
//
// Здесь — чистые функции над контентом: план урока для плеера
// (buildLessonPlan), адаптер уроков старого формата на время перевода
// контента (planFromLegacyLesson) и правила состава урока
// (validateNodeLesson), которые проверяет тест контента.

import {
  AnyLessonContent,
  FiveLettersWordContent,
  LessonActivityContent,
  LessonConclusionContent,
  LessonContent,
  LessonSituationContent,
  NodeLessonContent,
  QuestionContent,
  TheoryCardContent,
} from '@/domain/content/LessonContent';

/** §9.5 — доля верных ответов, чтобы тест засчитался. */
export const TEST_PASS_THRESHOLD = 0.7;

export const KNOWN_MINIGAME_TYPES = ['quiz', 'tinder_swipe', 'five_letters'] as const;

/**
 * Демо-режим (§18): показ за 1–2 минуты — первые узлы урока, по одной
 * карточке в узле и короткие тесты. Мини-игры и события — целиком.
 */
export const DEMO_NODE_LESSON_LIMITS = {
  nodes: 2,
  cardsPerNode: 1,
  testQuestions: 2,
} as const;

/** Прежний укороченный урок (теория и тест) — для уроков старого формата в демо. */
const DEMO_LEGACY_LIMITS = {
  theoryCards: 2,
  testQuestions: 2,
} as const;

/** Тип узла на треке — по его первому действию. */
export type LessonNodeKind = LessonActivityContent['type'];

export interface PlanActivity {
  /** «узел.действие» (например, «0.1») — ключ результата в прогрессе урока. */
  id: string;
  nodeIndex: number;
  content: LessonActivityContent;
}

export interface PlanNode {
  index: number;
  /** Ситуация урока — только у первого узла (у старых уроков её нет). */
  situation: LessonSituationContent | null;
  cards: TheoryCardContent[];
  activities: PlanActivity[];
  kind: LessonNodeKind;
}

export interface LessonPlan {
  lessonId: number;
  branchId: number;
  title: string;
  nodes: PlanNode[];
  /** null — урок старого формата: заключение общее, его подставляет плеер. */
  conclusion: LessonConclusionContent | null;
}

export function isNodeLesson(lesson: AnyLessonContent): lesson is NodeLessonContent {
  return 'nodes' in lesson;
}

export function activityId(nodeIndex: number, activityIndex: number): string {
  return `${nodeIndex}.${activityIndex}`;
}

function makeNode(
  index: number,
  situation: LessonSituationContent | null,
  cards: TheoryCardContent[],
  activities: LessonActivityContent[]
): PlanNode {
  return {
    index,
    situation,
    cards,
    activities: activities.map((content, activityIndex) => ({
      id: activityId(index, activityIndex),
      nodeIndex: index,
      content,
    })),
    kind: activities[0]?.type ?? 'test',
  };
}

function trimForDemo(activity: LessonActivityContent): LessonActivityContent {
  if (activity.type !== 'test') return activity;
  return {
    ...activity,
    questions: activity.questions.slice(0, DEMO_NODE_LESSON_LIMITS.testQuestions),
  };
}

export function buildLessonPlan(lesson: NodeLessonContent, demo = false): LessonPlan {
  const nodes = demo ? lesson.nodes.slice(0, DEMO_NODE_LESSON_LIMITS.nodes) : lesson.nodes;
  return {
    lessonId: lesson.id,
    branchId: lesson.branch_id,
    title: lesson.title,
    nodes: nodes.map((node, index) =>
      makeNode(
        index,
        index === 0 ? lesson.situation : null,
        demo ? node.cards.slice(0, DEMO_NODE_LESSON_LIMITS.cardsPerNode) : node.cards,
        demo ? node.activities.map(trimForDemo) : node.activities
      )
    ),
    conclusion: lesson.conclusion,
  };
}

/**
 * Урок старого формата (теория → мини-игра → тест) как узлы — пока контент
 * переводится (этапы 3 и 6): первая половина карточек + мини-игра, затем
 * остальные карточки + тест; без мини-игры — один узел. Ситуации, событий и
 * заключения у таких уроков нет.
 */
export function planFromLegacyLesson(lesson: LessonContent, demo = false): LessonPlan {
  const cards = demo
    ? lesson.theory_cards.slice(0, DEMO_LEGACY_LIMITS.theoryCards)
    : lesson.theory_cards;
  const testQuestions = demo
    ? lesson.test_questions.slice(0, DEMO_LEGACY_LIMITS.testQuestions)
    : lesson.test_questions;
  const test: LessonActivityContent = { type: 'test', questions: testQuestions };

  const minigameQuestions = lesson.questions.filter((q) => q.question_type === 'minigame');
  const minigame: LessonActivityContent | null =
    lesson.minigame_type === 'five_letters'
      ? { type: 'minigame', minigame_type: 'five_letters' }
      : minigameQuestions.length > 0
        ? { type: 'minigame', minigame_type: lesson.minigame_type, questions: minigameQuestions }
        : null;

  const half = Math.ceil(cards.length / 2);
  const nodes = minigame
    ? [
        makeNode(0, null, cards.slice(0, half), [minigame]),
        makeNode(1, null, cards.slice(half), [test]),
      ]
    : [makeNode(0, null, cards, [test])];

  return {
    lessonId: lesson.id,
    branchId: lesson.branch_id,
    title: lesson.title,
    nodes,
    conclusion: null,
  };
}

/** План урока любого формата (узлы — как есть, старый — через адаптер). */
export function planForLesson(lesson: AnyLessonContent, demo = false): LessonPlan {
  return isNodeLesson(lesson) ? buildLessonPlan(lesson, demo) : planFromLegacyLesson(lesson, demo);
}

// ── Правила состава урока (проверяются тестом контента) ──

function isBlank(text: string | undefined): boolean {
  return !text || text.trim() === '';
}

function questionErrors(where: string, questions: QuestionContent[]): string[] {
  const errors: string[] = [];
  if (questions.length === 0) errors.push(`${where}: нет вопросов`);
  for (const q of questions) {
    if (isBlank(q.question_text)) errors.push(`${where}: вопрос ${q.id} без текста`);
    if (q.options.length < 2) errors.push(`${where}: у вопроса ${q.id} меньше двух вариантов`);
    if (!q.options.includes(q.correct_answer)) {
      errors.push(`${where}: у вопроса ${q.id} верного ответа нет среди вариантов`);
    }
  }
  return errors;
}

/**
 * Ошибки состава урока из узлов; пустой список — урок корректен.
 * - есть ситуация и заключение, хотя бы один узел;
 * - каждый узел начинается с карточек и содержит хотя бы одно действие;
 * - первый узел — по ситуации: тест или мини-игра и событие;
 * - два события подряд нельзя (по всей цепочке действий урока);
 * - вопросы с вариантами и верным ответом, id вопросов в уроке не повторяются;
 * - мини-игра известного типа (quiz и tinder_swipe — с вопросами);
 * - событие: 2–3 варианта с разными id, есть бесплатный, трата — с корзиной
 *   (нужное / желаемое), суммы целые (§7.6).
 */
export function validateNodeLesson(lesson: NodeLessonContent): string[] {
  const errors: string[] = [];
  const at = `урок ${lesson.id}`;

  if (isBlank(lesson.situation?.title) || isBlank(lesson.situation?.text)) {
    errors.push(`${at}: нет ситуации`);
  }
  if (isBlank(lesson.conclusion?.title) || isBlank(lesson.conclusion?.text)) {
    errors.push(`${at}: нет заключения`);
  }
  if (lesson.nodes.length === 0) errors.push(`${at}: нет узлов`);

  const questionIds = new Set<number>();
  const eventIds = new Set<string>();
  let previousType: LessonActivityContent['type'] | null = null;

  lesson.nodes.forEach((node, nodeIndex) => {
    const nodeAt = `${at}, узел ${nodeIndex + 1}`;
    if (node.cards.length === 0) errors.push(`${nodeAt}: нет карточек`);
    for (const card of node.cards) {
      if (isBlank(card.title) || isBlank(card.text)) errors.push(`${nodeAt}: пустая карточка`);
    }
    if (node.activities.length === 0) errors.push(`${nodeAt}: нет действий`);

    if (nodeIndex === 0) {
      const types = node.activities.map((a) => a.type);
      if (!types.includes('test') && !types.includes('minigame')) {
        errors.push(`${nodeAt}: в первом узле нужен тест или мини-игра`);
      }
      if (!types.includes('event')) errors.push(`${nodeAt}: в первом узле нужно событие`);
    }

    node.activities.forEach((activity, activityIndex) => {
      const activityAt = `${nodeAt}, действие ${activityIndex + 1}`;
      if (activity.type === 'event' && previousType === 'event') {
        errors.push(`${activityAt}: два события подряд`);
      }
      previousType = activity.type;

      const questions =
        activity.type === 'test' || activity.type === 'minigame' ? (activity.questions ?? []) : [];
      for (const q of questions) {
        if (questionIds.has(q.id)) errors.push(`${activityAt}: id вопроса ${q.id} повторяется`);
        questionIds.add(q.id);
      }

      if (activity.type === 'test') {
        errors.push(...questionErrors(activityAt, activity.questions));
      } else if (activity.type === 'minigame') {
        if (!(KNOWN_MINIGAME_TYPES as readonly string[]).includes(activity.minigame_type)) {
          errors.push(`${activityAt}: неизвестная мини-игра ${activity.minigame_type}`);
        } else if (activity.minigame_type !== 'five_letters') {
          errors.push(...questionErrors(activityAt, activity.questions ?? []));
        } else if (activity.word !== undefined && !/^[А-ЯЁ]{5}$/.test(activity.word)) {
          errors.push(`${activityAt}: слово «5 букв» — ровно 5 заглавных русских букв`);
        }
      } else {
        if (activity.pool.length === 0) errors.push(`${activityAt}: пустой пул событий`);
        for (const event of activity.pool) {
          const eventAt = `${activityAt}, событие ${event.id}`;
          if (eventIds.has(event.id)) errors.push(`${eventAt}: id события повторяется`);
          eventIds.add(event.id);
          if (isBlank(event.title) || isBlank(event.description)) {
            errors.push(`${eventAt}: нет заголовка или описания`);
          }
          if (event.options.length < 2 || event.options.length > 3) {
            errors.push(`${eventAt}: нужно 2–3 варианта`);
          }
          if (new Set(event.options.map((o) => o.id)).size !== event.options.length) {
            errors.push(`${eventAt}: id вариантов повторяются`);
          }
          if (!event.options.some((o) => o.coinAmount >= 0)) {
            errors.push(`${eventAt}: нет бесплатного варианта`);
          }
          for (const option of event.options) {
            if (!Number.isInteger(option.coinAmount)) {
              errors.push(`${eventAt}: сумма варианта ${option.id} не целая`);
            }
            if (option.coinAmount < 0 && option.category === null) {
              errors.push(`${eventAt}: трата ${option.id} без корзины (нужное / желаемое)`);
            }
          }
        }
      }
    });
  });

  return errors;
}

// ── Вопросы и слова уроков для игр ──

/** Вопросы урока любого формата по играм — для Аркады по теме. */
export function lessonQuestionPools(lesson: AnyLessonContent): {
  quiz: QuestionContent[];
  swipes: QuestionContent[];
} {
  if (!isNodeLesson(lesson)) {
    const minigame = lesson.questions.filter((q) => q.question_type === 'minigame');
    return {
      quiz: [...(lesson.minigame_type === 'quiz' ? minigame : []), ...lesson.test_questions],
      swipes: lesson.minigame_type === 'tinder_swipe' ? minigame : [],
    };
  }
  const activities = lesson.nodes.flatMap((node) => node.activities);
  const quiz: QuestionContent[] = [];
  const swipes: QuestionContent[] = [];
  for (const activity of activities) {
    if (activity.type === 'test') quiz.push(...activity.questions);
    else if (activity.type === 'minigame' && activity.minigame_type === 'quiz') {
      quiz.push(...(activity.questions ?? []));
    } else if (activity.type === 'minigame' && activity.minigame_type === 'tinder_swipe') {
      swipes.push(...(activity.questions ?? []));
    }
  }
  return { quiz, swipes };
}

/**
 * Слово для «5 букв» в уроке: заданное в контенте, иначе случайное слово темы,
 * иначе — любое из банка. null — банк пуст.
 */
export function fiveLettersWordFor(
  activity: LessonActivityContent,
  branchId: number,
  bank: FiveLettersWordContent[],
  random: () => number = Math.random
): FiveLettersWordContent | null {
  if (activity.type === 'minigame' && activity.word) {
    const exact = bank.find((w) => w.word === activity.word);
    if (exact) return exact;
  }
  const themed = bank.filter((w) => w.branch_ids?.includes(branchId));
  const pool = themed.length > 0 ? themed : bank;
  if (pool.length === 0) return null;
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
}
