// domain/lesson/LessonStep.ts
// Урок как композиция шагов (§9.1 ТЗ + уточнение архитектуры от 2026-09-15):
// теория → мини-игра → тест, между наградами и планированием ресурсов (§9.6).
// Порядок фаз в §9.1 зафиксирован, поэтому шаги для конкретного урока собирает
// buildLessonSteps() из контента, а не задаётся произвольно в JSON — но сам
// набор типов шагов открыт для расширения (новый тип = новый case в раннере).

import {
  FiveLettersWordContent,
  MinigameType,
  QuestionContent,
  TheoryCardContent,
} from '@/domain/content/LessonContent';

export type LessonStepType =
  'theory' | 'minigame' | 'test' | 'reward' | 'resource_planning' | 'modal';

export interface TheoryStep {
  type: 'theory';
  cards: TheoryCardContent[];
}

export interface MinigameStep {
  type: 'minigame';
  minigameType: MinigameType;
  /** Для 'quiz'/'tinder_swipe' — вопросы урока (question_type: 'minigame').
   * Для 'five_letters' — пустой массив, слово приходит через words ниже. */
  questions: QuestionContent[];
  /** Только для minigameType: 'five_letters' — целевые слова раунда (обычно
   * одно), выбранные из общего банка content/five_letters_words.json (см.
   * buildLessonSteps.ts). Слово не привязано к конкретному уроку — банк общий. */
  words?: FiveLettersWordContent[];
}

export interface TestStep {
  type: 'test';
  questions: QuestionContent[];
  passThreshold: number; // §9.5 — 0.7
}

export interface RewardStep {
  type: 'reward';
  coins: number;
  reason: string;
}

/** §9.6: слайдер распределения кошелёк/накопления после награды. Данных не несёт. */
export interface ResourcePlanningStep {
  type: 'resource_planning';
}

/** Точка расширения для информационных/решающих попапов внутри урока. */
export interface ModalStep {
  type: 'modal';
  title: string;
  message: string;
  ctaLabel: string;
}

export type LessonStep =
  TheoryStep | MinigameStep | TestStep | RewardStep | ResourcePlanningStep | ModalStep;
