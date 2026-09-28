// lib/lessons/openLesson.test.ts
// Единое правило открытия урока напрямую (вкладка «Уроки», ИИ-помощник):
// пройденный — повтор (§9), в демо — любой (§18.2), иначе — только в приключении.

import { createLessonProgress } from '@/domain/lesson/lessonProgress';
import { LESSONS, useLessonsStore } from '@/lib/hooks/useLessons';
import { useAlertStore } from '@/lib/stores/alertStore';
import { useUserStore } from '@/lib/stores/userStore';
import { canOpenLessonDirectly, openLessonOrExplain } from './openLesson';

function seedUser(isDemo: boolean): void {
  useUserStore.getState().setUser({
    id: 'test-profile',
    username: 'Тест',
    liquid_balance: 0,
    created_at: new Date().toISOString(),
    is_demo: isDemo,
  });
}

beforeEach(() => {
  useLessonsStore.getState().resetProgress();
});

describe('canOpenLessonDirectly', () => {
  const lessonId = LESSONS[0].id;

  it('новый урок в обычном режиме напрямую не открывается — только в приключении', () => {
    seedUser(false);
    expect(canOpenLessonDirectly(lessonId)).toBe(false);
  });

  it('пройденный урок открывается для повтора', () => {
    seedUser(false);
    useLessonsStore.getState().saveLessonState({
      ...createLessonProgress(lessonId),
      completedAt: new Date().toISOString(),
    });
    expect(canOpenLessonDirectly(lessonId)).toBe(true);
  });

  it('в демо-режиме открывается любой урок (§18.2 «задания доступны сразу все»)', () => {
    seedUser(true);
    expect(canOpenLessonDirectly(lessonId)).toBe(true);
  });
});

describe('openLessonOrExplain — объяснение вместо открытия', () => {
  const lesson = LESSONS[0];

  it('новый урок — где проходятся новые уроки', () => {
    seedUser(false);
    expect(openLessonOrExplain(lesson.id)).toBe(false);
    expect(useAlertStore.getState().title).toBe('Новые уроки — в работе');
  });

  it('начатый урок — что он продолжится в смене с того же места', () => {
    seedUser(false);
    useLessonsStore
      .getState()
      .saveLessonState({ ...createLessonProgress(lesson.id), readNodes: [0] });
    expect(openLessonOrExplain(lesson.id)).toBe(false);
    expect(useAlertStore.getState().title).toBe('Урок уже начат');
    expect(useAlertStore.getState().message).toContain(`«${lesson.title}»`);
  });
});
