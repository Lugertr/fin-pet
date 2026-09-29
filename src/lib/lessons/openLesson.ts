// lib/lessons/openLesson.ts
// Единое правило открытия урока напрямую — с вкладки «Уроки» и по ссылке из
// ИИ-помощника (решение пользователя 28.09.2026: в уроки можно играть и вне
// смены, по порядку внутри темы):
// - пройденный урок — всегда (перечитать, перепройти ради звезды, §9);
// - доступный — начатый или следующий по порядку в своей теме;
// - в демо-режиме — любой урок (§18.2: «задания доступны сразу все»);
// - иначе — объясняем, что сначала нужен предыдущий урок темы.
// Урок, открытый вне смены, идёт целиком; урок смены — по этапам, его события
// платит бюджет работы, монет на 10% больше (LessonPlayer).

import { router } from 'expo-router';

import { ensureStageEnergy } from '@/lib/adventure/stageEnergy';
import { LESSONS, useLessonsStore } from '@/lib/hooks/useLessons';
import { useUserStore } from '@/lib/stores/userStore';
import { Alert } from '@/lib/utils/alert';

export function canOpenLessonDirectly(lessonId: number): boolean {
  const lessons = useLessonsStore.getState();
  if (lessons.progress[lessonId]?.status === 'completed') return true;
  if (useUserStore.getState().user?.is_demo) return true;
  return lessons.isLessonAvailable(lessonId);
}

/** Открывает урок, если можно; иначе показывает объяснение. Возвращает, открыт ли урок. */
export function openLessonOrExplain(lessonId: number): boolean {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  if (canOpenLessonDirectly(lessonId)) {
    // Урок смены с вкладки: новый этап стоит энергии, как и с экрана работы.
    const completed = useLessonsStore.getState().progress[lessonId]?.status === 'completed';
    if (lesson && !completed && !ensureStageEnergy(lesson.id, lesson.branch_id)) return false;
    router.push(`/(modal)/lesson/${lessonId}` as never);
    return true;
  }

  // Ближайший предыдущий урок темы — его и нужно пройти.
  const previous = LESSONS.filter((l) => l.branch_id === lesson?.branch_id)
    .sort((a, b) => b.order_index - a.order_index)
    .find((l) => l.order_index < (lesson?.order_index ?? 0));
  Alert.alert(
    'Урок пока закрыт',
    previous
      ? `Уроки темы идут по порядку — сначала пройди «${previous.title}».`
      : 'Уроки темы идут по порядку — сначала пройди предыдущий урок.'
  );
  return false;
}
