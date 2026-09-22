// domain/arcade/TrainerSelection.ts
// Логика выбора контента для Аркады (§10.3 ТЗ):
// пройденные ветки → исключить excluded_trainer_branches → случайная ветка из
// оставшихся → вопросы (10 для quiz, 5 для tinder_swipe) → перемешать.

import { LessonContent, MinigameType, QuestionContent } from '@/domain/content/LessonContent';

export const QUIZ_TRAINER_QUESTION_COUNT = 10;
export const TINDER_SWIPE_TRAINER_QUESTION_COUNT = 5;

export function getAvailableTrainerBranches(
  completedBranchIds: number[],
  excludedBranchIds: number[]
): number[] {
  return completedBranchIds.filter((id) => !excludedBranchIds.includes(id));
}

export function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)];
}

export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export interface TrainerSession {
  branchId: number;
  minigameType: MinigameType;
  questions: QuestionContent[];
}

/**
 * Собирает раунд тренажёра для ветки: случайно берёт один из типов мини-игр,
 * встречающихся в её уроках, собирает вопросы по всем урокам этого типа и
 * перемешивает до нужного количества (§9.4/§10.3). Возвращает null, если у
 * ветки вообще нет вопросов (контент ещё не наполнен).
 */
export function buildTrainerSession(
  branchId: number,
  lessonsInBranch: LessonContent[]
): TrainerSession | null {
  // 'five_letters' исключена: тренажёр набирает пул из QuestionContent[] по
  // всем урокам ветки этого типа и режет до фиксированного количества
  // раундов (10/5) — «5 букв» не вопрос-ответ, а одно неспешное слово на
  // несколько попыток, из общего банка слов, а не из урока. Она остаётся
  // мини-игрой конкретного урока (см. buildLessonSteps.ts), просто не
  // участвует в случайном выборе типа для Аркады.
  const typesAvailable = Array.from(
    new Set(lessonsInBranch.map((l) => l.minigame_type).filter((t) => t !== 'five_letters'))
  );
  const chosenType = pickRandom(typesAvailable);
  if (!chosenType) return null;

  const pool = lessonsInBranch
    .filter((l) => l.minigame_type === chosenType)
    .flatMap((l) => l.questions);
  if (pool.length === 0) return null;

  const targetCount =
    chosenType === 'tinder_swipe'
      ? TINDER_SWIPE_TRAINER_QUESTION_COUNT
      : QUIZ_TRAINER_QUESTION_COUNT;

  return {
    branchId,
    minigameType: chosenType,
    questions: shuffle(pool).slice(0, targetCount),
  };
}
