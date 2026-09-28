// lib/adventure/openWork.ts
// Единый вход в «Работу» — кнопка на хабе, ноутбук в комнате, «Новая работа»
// в итогах смены: идёт смена — её экран, иначе — планирование. Смена — это
// новый урок, поэтому когда все уроки пройдены, новую смену не начать
// (решение пользователя 28.09.2026): вместо планирования объясняем, чем
// заняться дальше — звёзды за повторы и Аркада.

import { router } from 'expo-router';

import { LESSONS, useLessonsStore } from '@/lib/hooks/useLessons';
import { useAdventureStore } from '@/lib/stores/adventureStore';
import { Alert } from '@/lib/utils/alert';

/** Остался ли хоть один непройденный урок — материал для новой смены. */
export function hasLessonsForShift(): boolean {
  const { lessonStates } = useLessonsStore.getState();
  return LESSONS.some((lesson) => !lessonStates[lesson.id]?.completedAt);
}

/** Открывает экран смены или планирование; все уроки пройдены — объяснение. Возвращает, открыт ли экран. */
export function openWorkOrExplain(): boolean {
  if (useAdventureStore.getState().currentAdventure?.status === 'active') {
    router.push('/(modal)/adventure' as never);
    return true;
  }
  if (!hasLessonsForShift()) {
    Alert.alert(
      'Все уроки пройдены!',
      'Новых смен больше нет — каждая смена была новым уроком. Повторяй уроки на вкладке «Уроки», чтобы собрать звёзды ★, и тренируйся в Аркаде.'
    );
    return false;
  }
  router.push('/(modal)/adventure-planning' as never);
  return true;
}
