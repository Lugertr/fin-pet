// lib/lessons/openLesson.test.ts
// Единое правило открытия урока напрямую (вкладка «Уроки», ИИ-помощник),
// решение пользователя 28.09.2026: в уроки можно играть и вне смены — по
// порядку внутри темы; пройденный — повтор (§9), в демо — любой (§18.2).

import { router } from 'expo-router';

import { createLessonProgress } from '@/domain/lesson/lessonProgress';
import { LESSONS, useLessonsStore } from '@/lib/hooks/useLessons';
import { useAlertStore } from '@/lib/stores/alertStore';
import { useUserStore } from '@/lib/stores/userStore';
import { canOpenLessonDirectly, openLessonOrExplain } from './openLesson';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

const [FIRST, SECOND, THIRD] = LESSONS.filter((l) => l.branch_id === 1).sort(
  (a, b) => a.order_index - b.order_index
);

function seedUser(isDemo: boolean): void {
  useUserStore.getState().setUser({
    id: 'test-profile',
    username: 'Тест',
    liquid_balance: 0,
    created_at: new Date().toISOString(),
    is_demo: isDemo,
  });
}

function complete(lessonId: number): void {
  useLessonsStore.getState().saveLessonState({
    ...createLessonProgress(lessonId),
    completedAt: new Date().toISOString(),
  });
}

beforeEach(() => {
  jest.mocked(router.push).mockClear();
  useLessonsStore.getState().resetProgress();
  useAlertStore.setState({ title: '' });
});

describe('canOpenLessonDirectly — уроки по порядку, и вне смены тоже', () => {
  it('первый урок темы открывается сразу', () => {
    seedUser(false);
    expect(canOpenLessonDirectly(FIRST.id)).toBe(true);
  });

  it('следующий открывается, когда пройден предыдущий', () => {
    seedUser(false);
    expect(canOpenLessonDirectly(SECOND.id)).toBe(false);
    complete(FIRST.id);
    expect(canOpenLessonDirectly(SECOND.id)).toBe(true);
    expect(canOpenLessonDirectly(THIRD.id)).toBe(false);
  });

  it('пройденный урок открывается для повтора', () => {
    seedUser(false);
    complete(FIRST.id);
    expect(canOpenLessonDirectly(FIRST.id)).toBe(true);
  });

  it('в демо-режиме открывается любой урок (§18.2 «задания доступны сразу все»)', () => {
    seedUser(true);
    expect(canOpenLessonDirectly(THIRD.id)).toBe(true);
  });
});

describe('openLessonOrExplain', () => {
  it('доступный урок — открывается', () => {
    seedUser(false);
    expect(openLessonOrExplain(FIRST.id)).toBe(true);
    expect(router.push).toHaveBeenCalledWith(`/(modal)/lesson/${FIRST.id}`);
  });

  it('закрытый урок — объяснение, какой пройти раньше', () => {
    seedUser(false);
    complete(FIRST.id);
    expect(openLessonOrExplain(THIRD.id)).toBe(false);
    expect(router.push).not.toHaveBeenCalled();
    expect(useAlertStore.getState().title).toBe('Урок пока закрыт');
    expect(useAlertStore.getState().message).toContain(`«${SECOND.title}»`);
  });
});
