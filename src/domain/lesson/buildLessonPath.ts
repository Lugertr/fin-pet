// domain/lesson/buildLessonPath.ts
// Собирает дорожку уроков для одной ветки — уроки по порядку. Уроки
// принимаются уже отфильтрованными по нужной ветке.

import { AnyLessonContent } from '@/domain/content/LessonContent';
import { LessonPathNode } from './LessonPathNode';

export function buildLessonPath(lessons: AnyLessonContent[]): LessonPathNode[] {
  return [...lessons]
    .sort((a, b) => a.order_index - b.order_index)
    .map((lesson) => ({ type: 'lesson', lesson }));
}
