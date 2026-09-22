// domain/lesson/buildLessonPath.ts
// Собирает дорожку уроков для одной ветки: уроки + узлы-подарки, слитые в
// один отсортированный список. Уроки и узлы-подарки принимаются уже
// отфильтрованными по нужной ветке — эта функция только сортирует и сливает.

import { GiftPathNodeContent, LessonContent } from '@/domain/content/LessonContent';
import { LessonPathNode } from './LessonPathNode';

export function buildLessonPath(
  lessons: LessonContent[],
  giftNodes: GiftPathNodeContent[]
): LessonPathNode[] {
  const sortedLessons = [...lessons].sort((a, b) => a.order_index - b.order_index);
  const path: LessonPathNode[] = [];

  for (const lesson of sortedLessons) {
    path.push({ type: 'lesson', lesson });

    const giftsAfterThisLesson = giftNodes
      .filter((node) => node.after_order_index === lesson.order_index)
      .sort((a, b) => a.id.localeCompare(b.id));
    for (const node of giftsAfterThisLesson) {
      path.push({ type: 'gift', node });
    }
  }

  return path;
}
