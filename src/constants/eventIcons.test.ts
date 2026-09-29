// constants/eventIcons.test.ts
// Иконка события в content/lessons: эмодзи, персонаж (question/reward) или ключ
// картинки из EVENT_ICON_IMAGES — опечатка в ключе не должна тихо стать
// «эмодзи» из латинских букв.

import { ALL_LESSONS } from '@/data/content/lessonFiles';
import { LessonContent } from '@/domain/content/LessonContent';
import { isUnknownEventIconKey, resolveEventIcon } from './eventIcons';

const LESSONS = ALL_LESSONS;

const eventIcons = (lessons: LessonContent[]) =>
  lessons.flatMap((lesson) =>
    lesson.nodes.flatMap((node) =>
      node.activities.flatMap((a) =>
        a.type === 'event' ? a.pool.map((e) => ({ at: `${lesson.id}/${e.id}`, icon: e.icon })) : []
      )
    )
  );

describe('resolveEventIcon', () => {
  it('question и reward — персонаж', () => {
    expect(resolveEventIcon('question')).toEqual({ kind: 'pet', emotion: 'question' });
    expect(resolveEventIcon('reward')).toEqual({ kind: 'pet', emotion: 'reward' });
  });

  it('ключ из реестра — картинка', () => {
    expect(resolveEventIcon('laptop').kind).toBe('image');
  });

  it('остальное — эмодзи', () => {
    expect(resolveEventIcon('🚌')).toEqual({ kind: 'emoji', text: '🚌' });
  });

  it('неизвестный ключ — опечатка, эмодзи — нет', () => {
    expect(isUnknownEventIconKey('laptopp')).toBe(true);
    expect(isUnknownEventIconKey('🚌')).toBe(false);
    expect(isUnknownEventIconKey('question')).toBe(false);
  });
});

describe('иконки событий в контенте', () => {
  it('у каждого события иконка есть и она известна', () => {
    const icons = eventIcons(LESSONS);
    expect(icons.length).toBeGreaterThan(0);
    const bad = icons.filter(({ icon }) => !icon?.trim() || isUnknownEventIconKey(icon));
    expect(bad).toEqual([]);
  });
});
