// domain/lesson/LessonPathNode.ts
// Элемент дорожки уроков на вкладке «Уроки»: урок или узел-подарок,
// объединённые и отсортированные функцией buildLessonPath.

import { GiftPathNodeContent, LessonContent } from '@/domain/content/LessonContent';

export type LessonPathNode =
  { type: 'lesson'; lesson: LessonContent } | { type: 'gift'; node: GiftPathNodeContent };
