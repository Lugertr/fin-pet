// lib/lessons/openLesson.ts
// Единое правило открытия урока напрямую — с вкладки «Уроки» и по ссылке из
// ИИ-помощника (новые уроки в обычном режиме проходятся только как задания
// приключения — кнопкой «Выполнить задание», см. AdventureActiveView):
// - пройденный урок — всегда, как повтор без награды (§9);
// - в демо-режиме — любой урок (§18.2: «задания доступны сразу все»);
// - иначе — объясняем, где проходятся новые уроки.

import { router } from 'expo-router';

import { useLessonsStore } from '@/lib/hooks/useLessons';
import { useAdventureStore } from '@/lib/stores/adventureStore';
import { useUserStore } from '@/lib/stores/userStore';
import { Alert } from '@/lib/utils/alert';

export function canOpenLessonDirectly(lessonId: number): boolean {
  if (useLessonsStore.getState().progress[lessonId]?.status === 'completed') return true;
  return useUserStore.getState().user?.is_demo ?? false;
}

/** Открывает урок, если можно; иначе показывает объяснение. Возвращает, открыт ли урок. */
export function openLessonOrExplain(lessonId: number): boolean {
  if (canOpenLessonDirectly(lessonId)) {
    router.push(`/(modal)/lesson/${lessonId}` as never);
    return true;
  }

  const adventureActive = useAdventureStore.getState().currentAdventure?.status === 'active';
  Alert.alert(
    'Уроки — в приключении',
    adventureActive
      ? 'Новые уроки — это задания приключения: жми «Выполнить задание» на вкладке «Приключение».'
      : 'Новые уроки проходятся в приключении — начни его на вкладке «Хаб».'
  );
  return false;
}
