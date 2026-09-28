// domain/lesson/LessonPathNode.ts
// Элемент дорожки уроков на вкладке «Уроки» (узлов-подарков больше нет:
// подарки только за 7 дней подряд, решение пользователя 27.09.2026).

import { LessonContent } from '@/domain/content/LessonContent';

/**
 * Состояние урока на дорожке:
 * - perfect — пройден без ошибок (звезда);
 * - completed — пройден;
 * - started — начат («Начат · 1/4»), продолжится с того же этапа;
 * - next — следующий непройденный урок темы: его можно пройти с вкладки, и с
 *   него начнётся смена по теме;
 * - locked — дальше по порядку (сначала предыдущий урок темы).
 */
export type LessonPathStatus = 'perfect' | 'completed' | 'started' | 'next' | 'locked';

export interface LessonPathNode {
  type: 'lesson';
  lesson: LessonContent;
  status: LessonPathStatus;
  /** Этапы трека («этап 2 из 4»): пройдено и всего, с финальным. */
  nodesDone: number;
  nodesTotal: number;
}
