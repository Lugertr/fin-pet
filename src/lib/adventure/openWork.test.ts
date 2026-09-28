// lib/adventure/openWork.test.ts
// Вход в «Работу»: смена — новый урок, поэтому когда все уроки пройдены,
// новую смену не начать — вместо планирования объяснение (решение
// пользователя 28.09.2026).

import { router } from 'expo-router';

import { createLessonProgress } from '@/domain/lesson/lessonProgress';
import { LESSONS, useLessonsStore } from '@/lib/hooks/useLessons';
import { useAdventureStore } from '@/lib/stores/adventureStore';
import { useAlertStore } from '@/lib/stores/alertStore';
import { hasLessonsForShift, openWorkOrExplain } from './openWork';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

function completeLessons(ids: number[]): void {
  useLessonsStore.setState({
    lessonStates: Object.fromEntries(
      ids.map((id) => [
        id,
        { ...createLessonProgress(id), completedAt: '2026-09-28T10:00:00.000Z' },
      ])
    ),
  });
}

beforeEach(() => {
  jest.mocked(router.push).mockClear();
  useLessonsStore.setState({ lessonStates: {} });
  useAdventureStore.setState({ currentAdventure: null });
  useAlertStore.setState({ title: '' });
});

describe('openWorkOrExplain', () => {
  it('есть непройденные уроки — планирование', () => {
    completeLessons([LESSONS[0].id]);
    expect(hasLessonsForShift()).toBe(true);
    expect(openWorkOrExplain()).toBe(true);
    expect(router.push).toHaveBeenCalledWith('/(modal)/adventure-planning');
  });

  it('все уроки пройдены — смену не начать, объяснение вместо планирования', () => {
    completeLessons(LESSONS.map((l) => l.id));
    expect(hasLessonsForShift()).toBe(false);
    expect(openWorkOrExplain()).toBe(false);
    expect(router.push).not.toHaveBeenCalled();
    expect(useAlertStore.getState().title).toBe('Все уроки пройдены!');
  });
});
