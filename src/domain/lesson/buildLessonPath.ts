// domain/lesson/buildLessonPath.ts
// Собирает дорожку уроков для одной ветки — уроки по порядку и их состояние
// (звезда, пройден, начат, следующий, закрыт). Уроки принимаются уже
// отфильтрованными по нужной ветке.

import { AnyLessonContent } from '@/domain/content/LessonContent';
import { planForLesson } from './LessonPlan';
import { LessonPathNode, LessonPathStatus } from './LessonPathNode';
import {
  LessonProgressState,
  completedNodeCount,
  createLessonProgress,
  hasStar,
  isLessonStarted,
  totalNodeCount,
} from './lessonProgress';

export function buildLessonPath(
  lessons: AnyLessonContent[],
  states: Record<number, LessonProgressState>,
  /** Демо-режим — укороченный урок, этапов на треке меньше (как в смене). */
  demo = false
): LessonPathNode[] {
  const ordered = [...lessons].sort((a, b) => a.order_index - b.order_index);
  const nextId = ordered.find((lesson) => !states[lesson.id]?.completedAt)?.id;

  return ordered.map((lesson) => {
    const state = states[lesson.id] ?? createLessonProgress(lesson.id);
    const plan = planForLesson(lesson, demo);
    let status: LessonPathStatus;
    if (state.completedAt) status = hasStar(state) ? 'perfect' : 'completed';
    else if (isLessonStarted(state)) status = 'started';
    else if (lesson.id === nextId) status = 'next';
    else status = 'locked';
    return {
      type: 'lesson',
      lesson,
      status,
      nodesDone: completedNodeCount(plan, state),
      nodesTotal: totalNodeCount(plan),
    };
  });
}
