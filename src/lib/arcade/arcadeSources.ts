// lib/arcade/arcadeSources.ts
// Контент для раундов Аркады (уроки, карточки свайпов, слова «5 букв») —
// из content-репозитория, для чистых функций domain/arcade/TrainerSelection.ts.

import { getLocalContentRepository } from '@/data/content';
import { BranchArcadeSources } from '@/domain/arcade/TrainerSelection';
import { FIVE_LETTERS_WORDS, LESSONS } from '@/lib/hooks/useLessons';

export const ARCADE_SOURCES: BranchArcadeSources = {
  lessons: LESSONS,
  swipeCards: getLocalContentRepository().getArcadeSwipeCardsSync(),
  words: FIVE_LETTERS_WORDS,
};
