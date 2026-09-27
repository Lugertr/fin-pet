// lib/lessons/openLesson.test.ts
// Единое правило открытия урока напрямую (вкладка «Уроки», ИИ-помощник):
// пройденный — повтор (§9), в демо — любой (§18.2), иначе — только в приключении.

import { LESSONS, useLessonsStore } from '@/lib/hooks/useLessons';
import { useUserStore } from '@/lib/stores/userStore';
import { canOpenLessonDirectly } from './openLesson';

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
    useLessonsStore.getState().markLessonCompleted(lessonId);
    expect(canOpenLessonDirectly(lessonId)).toBe(true);
  });

  it('в демо-режиме открывается любой урок (§18.2 «задания доступны сразу все»)', () => {
    seedUser(true);
    expect(canOpenLessonDirectly(lessonId)).toBe(true);
  });
});
