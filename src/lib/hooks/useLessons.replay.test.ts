// lib/hooks/useLessons.replay.test.ts
// §9 ТЗ: «пройденный — доступен для повтора без награды»; опыт за уроки не
// начисляется вовсе — только за завершение приключения (решение 27.09.2026).

import { useGiftsStore } from '@/lib/stores/giftsStore';
import { LESSONS, useLessonsStore } from './useLessons';

beforeEach(() => {
  useLessonsStore.getState().resetProgress();
  useGiftsStore.getState().clearAll();
});

describe('useLessonsStore.markLessonCompleted', () => {
  it('урок не даёт опыта — опыт только за завершение приключения', () => {
    useLessonsStore.getState().markLessonCompleted(LESSONS[0].id);

    expect(useLessonsStore.getState().totalXp).toBe(0);
    expect(useLessonsStore.getState().progress[LESSONS[0].id]?.status).toBe('completed');
  });

  it('урок подарков не выдаёт — ни в первый раз, ни при повторе (подарки только за 7 дней)', () => {
    const lessonId = LESSONS[0].id;

    useLessonsStore.getState().markLessonCompleted(lessonId);
    const giftsAfterFirst = useGiftsStore.getState().pendingGifts.length;
    useLessonsStore.getState().markLessonCompleted(lessonId);

    expect(giftsAfterFirst).toBe(0);
    expect(useGiftsStore.getState().pendingGifts.length).toBe(0);
  });
});
