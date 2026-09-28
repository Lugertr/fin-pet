// domain/lesson/lessonProgress.ts
// Прогресс урока из узлов — чистые функции над LessonPlan (решение
// пользователя 28.09.2026):
// - в узле сначала блок чтения (ситуация, карточки), затем действия по порядку;
// - не успел за смену — прогресс хранится, следующая смена продолжает с того же
//   места (currentPosition);
// - тест и мини-игру можно перепройти — засчитывается лучшая попытка; событие
//   решается один раз (его деньги уже ушли);
// - «идеально» — у каждого теста и мини-игры урока есть попытка без ошибок
//   (перепройти достаточно одно неидеальное действие); события не в счёт;
// - урок завершается на финальном узле (заключение); settleLesson сообщает,
//   впервые ли урок завершён и впервые ли он идеален — от этого зависят опыт,
//   монеты и звезда (награды — отдельно, этап 5).

import { LessonEventContent } from '@/domain/content/LessonContent';
import { LessonPlan, PlanActivity, PlanNode } from './LessonPlan';

export interface ActivityResult {
  completed: boolean;
  /** Хотя бы одна попытка без ошибок (для событий не используется). */
  perfect: boolean;
  attempts: number;
  /** Событие: выбранный вариант. */
  optionId?: string;
}

export interface LessonProgressState {
  lessonId: number;
  /** Узлы, чей блок чтения (ситуация, карточки) уже пройден. */
  readNodes: number[];
  /** Результаты действий по PlanActivity.id. */
  results: Record<string, ActivityResult>;
  /** Какое событие выпало из пула (по PlanActivity.id) — после перезапуска то же самое. */
  eventPicks: Record<string, string>;
  /** Первый раз пройден финальный узел. */
  completedAt: string | null;
  /** Первый раз урок стал идеальным — звезда. */
  perfectAt: string | null;
  /**
   * Отпечаток структуры урока, по которой записан прогресс
   * (LessonPlan.lessonStructureKey); null — неизвестен (новое состояние или
   * запись до миграции v12).
   */
  structureKey: string | null;
}

export type LessonPosition =
  | { kind: 'reading'; node: PlanNode }
  | { kind: 'activity'; node: PlanNode; activity: PlanActivity }
  /** Все действия пройдены — осталось заключение. */
  | { kind: 'final' }
  /** Урок уже завершён (дальше — только перечитать и перепройти). */
  | { kind: 'done' };

export function createLessonProgress(lessonId: number): LessonProgressState {
  return {
    lessonId,
    readNodes: [],
    results: {},
    eventPicks: {},
    completedAt: null,
    perfectAt: null,
    structureKey: null,
  };
}

/**
 * Прогресс записан по другой структуре урока (контент поменялся) — позиция
 * внутри урока начинается заново: прочитанное, результаты и выпавшие события
 * сбрасываются, иначе старые номера «этап.действие» засчитали бы другие
 * действия. Завершение урока и звезда сохраняются (§4.5, §8: заработанное не
 * отнимается). Совпадает — то же состояние.
 */
export function alignProgressWithStructure(
  state: LessonProgressState,
  structureKey: string
): LessonProgressState {
  if (state.structureKey === structureKey) return state;
  return { ...state, readNodes: [], results: {}, eventPicks: {}, structureKey };
}

function hasReading(node: PlanNode): boolean {
  return node.situation !== null || node.cards.length > 0;
}

function isReadingDone(state: LessonProgressState, node: PlanNode): boolean {
  return !hasReading(node) || state.readNodes.includes(node.index);
}

function isActivityDone(state: LessonProgressState, activity: PlanActivity): boolean {
  return state.results[activity.id]?.completed ?? false;
}

/**
 * Где ребёнок сейчас: первый узел с непрочитанным блоком или непройденным
 * действием. Завершённый урок — всегда «done», даже без результатов по узлам
 * (пройден до перехода на узлы и перенесён из старого прогресса).
 */
export function currentPosition(plan: LessonPlan, state: LessonProgressState): LessonPosition {
  if (state.completedAt) return { kind: 'done' };
  for (const node of plan.nodes) {
    if (!isReadingDone(state, node)) return { kind: 'reading', node };
    const next = node.activities.find((activity) => !isActivityDone(state, activity));
    if (next) return { kind: 'activity', node, activity: next };
  }
  return { kind: 'final' };
}

export function isNodeComplete(plan: LessonPlan, state: LessonProgressState, nodeIndex: number) {
  const node = plan.nodes[nodeIndex];
  if (!node) return false;
  if (state.completedAt) return true;
  return isReadingDone(state, node) && node.activities.every((a) => isActivityDone(state, a));
}

/** Узлов на треке: узлы урока + финальный (завершение и заключение). */
export function totalNodeCount(plan: LessonPlan): number {
  return plan.nodes.length + 1;
}

/** Пройдено узлов трека — «Работа: 2 из 5». */
export function completedNodeCount(plan: LessonPlan, state: LessonProgressState): number {
  if (state.completedAt) return totalNodeCount(plan);
  return plan.nodes.filter((node) => isNodeComplete(plan, state, node.index)).length;
}

/** Доля пройденного урока (узлы трека) — 1, если урок завершён. Для выплаты
 * за смену, закончившуюся раньше урока. */
export function lessonProgressRatio(plan: LessonPlan, state: LessonProgressState): number {
  return completedNodeCount(plan, state) / totalNodeCount(plan);
}

/**
 * Можно ли открыть узел с трека: пройденные — чтобы перечитать и перепройти,
 * и текущий. Будущие закрыты.
 */
export function isNodeUnlocked(
  plan: LessonPlan,
  state: LessonProgressState,
  nodeIndex: number
): boolean {
  const position = currentPosition(plan, state);
  if (position.kind === 'final' || position.kind === 'done') return nodeIndex < plan.nodes.length;
  return nodeIndex <= position.node.index;
}

export function markReadingDone(
  state: LessonProgressState,
  nodeIndex: number
): LessonProgressState {
  if (state.readNodes.includes(nodeIndex)) return state;
  return { ...state, readNodes: [...state.readNodes, nodeIndex] };
}

/**
 * Событие действия: выпавшее раньше или новое случайное из пула (и оно
 * запоминается). null — у действия нет событий (не событие или пустой пул).
 */
export function pickEvent(
  state: LessonProgressState,
  activity: PlanActivity,
  random: () => number = Math.random
): { state: LessonProgressState; event: LessonEventContent | null } {
  if (activity.content.type !== 'event' || activity.content.pool.length === 0) {
    return { state, event: null };
  }
  const { pool } = activity.content;
  const pickedId = state.eventPicks[activity.id];
  const picked = pool.find((event) => event.id === pickedId);
  if (picked) return { state, event: picked };

  const event = pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
  return {
    state: { ...state, eventPicks: { ...state.eventPicks, [activity.id]: event.id } },
    event,
  };
}

/**
 * Результат попытки. Тест и мини-игру можно перепройти: attempts растёт,
 * perfect — лучший из попыток. Решённое событие повторно не меняется.
 */
export function recordActivityResult(
  state: LessonProgressState,
  activity: PlanActivity,
  attempt: { perfect: boolean; optionId?: string }
): LessonProgressState {
  const previous = state.results[activity.id];
  if (activity.content.type === 'event' && previous?.completed) return state;

  return {
    ...state,
    results: {
      ...state.results,
      [activity.id]: {
        completed: true,
        perfect: (previous?.perfect ?? false) || attempt.perfect,
        attempts: (previous?.attempts ?? 0) + 1,
        optionId: attempt.optionId ?? previous?.optionId,
      },
    },
  };
}

function scoredActivities(plan: LessonPlan): PlanActivity[] {
  return plan.nodes.flatMap((node) =>
    node.activities.filter((a) => a.content.type === 'test' || a.content.type === 'minigame')
  );
}

/** У каждого теста и мини-игры есть попытка без ошибок (события не в счёт). */
export function isLessonPerfect(plan: LessonPlan, state: LessonProgressState): boolean {
  const scored = scoredActivities(plan);
  return scored.length > 0 && scored.every((a) => state.results[a.id]?.perfect === true);
}

export function allActivitiesCompleted(plan: LessonPlan, state: LessonProgressState): boolean {
  return plan.nodes.every((node) => node.activities.every((a) => isActivityDone(state, a)));
}

/**
 * Фиксирует завершение урока (финальный узел) и идеальность. Вызывается на
 * заключении и после перепрохождения уже завершённого урока. firstCompletion /
 * firstPerfect — впервые ли — чтобы награды выдавались один раз.
 */
export function settleLesson(
  plan: LessonPlan,
  state: LessonProgressState,
  nowIso: string
): { state: LessonProgressState; firstCompletion: boolean; firstPerfect: boolean } {
  if (!allActivitiesCompleted(plan, state)) {
    return { state, firstCompletion: false, firstPerfect: false };
  }
  const firstCompletion = state.completedAt === null;
  const firstPerfect = state.perfectAt === null && isLessonPerfect(plan, state);
  return {
    state: {
      ...state,
      completedAt: state.completedAt ?? nowIso,
      perfectAt: firstPerfect ? nowIso : state.perfectAt,
    },
    firstCompletion,
    firstPerfect,
  };
}

/** Урок начат, но не завершён: есть прочитанный этап или результат действия. */
export function isLessonStarted(state: LessonProgressState | undefined): boolean {
  if (!state || state.completedAt) return false;
  return state.readNodes.length > 0 || Object.keys(state.results).length > 0;
}

/** Звезда урока — он хоть раз пройден идеально. */
export function hasStar(state: LessonProgressState | undefined): boolean {
  return Boolean(state?.perfectAt);
}
