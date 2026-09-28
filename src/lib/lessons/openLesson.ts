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
    'Новые уроки — в работе',
    adventureActive
      ? 'Новые уроки проходятся в смене: жми «Начать задание» на экране работы.'
      : 'Новые уроки проходятся в смене — нажми «Начать работу» на хабе.'
  );
  return false;
}
