// domain/lesson/LessonPathNode.ts
// Элемент дорожки уроков на вкладке «Уроки» (узлов-подарков больше нет:
// подарки только за 7 дней подряд, решение пользователя 27.09.2026).

import { AnyLessonContent } from '@/domain/content/LessonContent';

export type LessonPathNode = { type: 'lesson'; lesson: AnyLessonContent };
