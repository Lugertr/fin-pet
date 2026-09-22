// domain/lesson/buildLessonSteps.ts

import { FiveLettersWordContent, LessonContent } from '@/domain/content/LessonContent';
import { LessonStep } from './LessonStep';

// §9.3 — награда (1-й раз) по типу шага
export const LESSON_STEP_REWARDS = {
  theory: 10,
  minigame: 25, // середина диапазона 20–30⭐
  test: 50,
} as const;

export const TEST_PASS_THRESHOLD = 0.7; // §9.5

/**
 * Собирает полную композицию шагов урока (§9.1): теория→[мини-игра]→тест→
 * награда→планирование. Порядок фаз зафиксирован ТЗ, а вот включение
 * мини-игровой фазы зависит от данных — появляется только если у урока есть
 * вопросы с question_type: 'minigame' ИЛИ minigame_type: 'five_letters'
 * (у неё вместо вопросов — слово из общего банка, см. words ниже).
 *
 * Награда — ОДНА, в самом конце урока (сумма за пройденные фазы), а не по
 * реворду после каждой фазы: раньше 2-3 отдельных реворд+планирование
 * прерывали урок посреди прохождения, теперь это один момент в конце.
 * Условие на награду за фазу не нужно отдельно проверять здесь — сюда фаза
 * доходит уже пройденной: MinigameStep не даёт перейти дальше без верного
 * ответа на каждый вопрос (см. MinigameStep.tsx), TestStep требует
 * passThreshold (§9.5) и иначе предлагает повтор, а не пропуск.
 *
 * fiveLettersWords — общий банк слов (content/five_letters_words.json),
 * передаётся вызывающим кодом (см. lesson/[id].tsx), а не читается отсюда
 * напрямую: buildLessonSteps остаётся чистой функцией от данных, доступ к
 * content-репозиторию — на уровне хуков/экранов, как и для остального контента.
 */
export function buildLessonSteps(
  lesson: LessonContent,
  fiveLettersWords: FiveLettersWordContent[]
): LessonStep[] {
  const isFiveLetters = lesson.minigame_type === 'five_letters';
  const minigameQuestions = lesson.questions.filter((q) => q.question_type === 'minigame');
  const hasMinigame = isFiveLetters ? fiveLettersWords.length > 0 : minigameQuestions.length > 0;

  const steps: LessonStep[] = [{ type: 'theory', cards: lesson.theory_cards }];

  if (hasMinigame) {
    steps.push(
      isFiveLetters
        ? {
            type: 'minigame',
            minigameType: lesson.minigame_type,
            questions: [],
            words: [fiveLettersWords[Math.floor(Math.random() * fiveLettersWords.length)]],
          }
        : {
            type: 'minigame',
            minigameType: lesson.minigame_type,
            questions: minigameQuestions,
          }
    );
  }

  steps.push({
    type: 'test',
    questions: lesson.test_questions,
    passThreshold: TEST_PASS_THRESHOLD,
  });

  const totalCoins =
    LESSON_STEP_REWARDS.theory +
    (hasMinigame ? LESSON_STEP_REWARDS.minigame : 0) +
    LESSON_STEP_REWARDS.test;

  steps.push({ type: 'reward', coins: totalCoins, reason: 'Урок пройден' });
  steps.push({ type: 'resource_planning' });

  return steps;
}
