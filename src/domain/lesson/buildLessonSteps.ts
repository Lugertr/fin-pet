// domain/lesson/buildLessonSteps.ts

import {
  FiveLettersWordContent,
  LessonContent,
  QuestionContent,
} from '@/domain/content/LessonContent';
import { LessonStep } from './LessonStep';

// §9.3 — награда (1-й раз) по типу шага
export const LESSON_STEP_REWARDS = {
  theory: 10,
  minigame: 25, // середина диапазона 20–30 монет
  test: 50,
} as const;

export const TEST_PASS_THRESHOLD = 0.7; // §9.5

/**
 * Демо-режим (§18, решение пользователя 28.09.2026): весь сценарий — за 1–2
 * минуты, поэтому урок укороченный — первые карточки теории и первые вопросы
 * теста; мини-игра целиком (в ней 1–2 вопроса). Порядок фаз, порог теста и
 * награда те же, что в обычном уроке.
 */
export const DEMO_LESSON_LIMITS = {
  theoryCards: 2,
  testQuestions: 2,
} as const;

/** Вопросы одной пачкой без повторов: одинаковый текст вопроса — один раз. */
function withoutRepeats(questions: QuestionContent[]): QuestionContent[] {
  const seen = new Set<string>();
  return questions.filter((q) => {
    const key = q.question_text.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Собирает полную композицию шагов урока (§9.1): теория→[мини-игра]→тест→
 * награда→планирование.
 *
 * Урок-викторина (решение пользователя 28.09.2026): мини-игра «Викторина» и
 * тест — один и тот же формат, и раньше они шли двумя пачками подряд
 * («Вопрос 1 из 1», затем «Вопрос 1 из 5»). Теперь вопросы мини-игры идут
 * первыми в общей пачке теста (повторы по тексту убираются), отдельного шага
 * мини-игры нет; награда за её фазу остаётся. У «Свайпов» и «5 букв» —
 * другая игра, они по-прежнему отдельный шаг. Порядок фаз зафиксирован ТЗ, а вот включение
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
  fiveLettersWords: FiveLettersWordContent[],
  demo = false
): LessonStep[] {
  const theoryCards = demo
    ? lesson.theory_cards.slice(0, DEMO_LESSON_LIMITS.theoryCards)
    : lesson.theory_cards;
  const testQuestions = demo
    ? lesson.test_questions.slice(0, DEMO_LESSON_LIMITS.testQuestions)
    : lesson.test_questions;
  const isFiveLetters = lesson.minigame_type === 'five_letters';
  const minigameQuestions = lesson.questions.filter((q) => q.question_type === 'minigame');
  const hasMinigame = isFiveLetters ? fiveLettersWords.length > 0 : minigameQuestions.length > 0;
  const minigameInTest = hasMinigame && lesson.minigame_type === 'quiz';

  const steps: LessonStep[] = [{ type: 'theory', cards: theoryCards }];

  if (hasMinigame && !minigameInTest) {
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
    questions: minigameInTest
      ? withoutRepeats([...minigameQuestions, ...testQuestions])
      : testQuestions,
    passThreshold: TEST_PASS_THRESHOLD,
  });

  const totalCoins =
    LESSON_STEP_REWARDS.theory +
    (hasMinigame ? LESSON_STEP_REWARDS.minigame : 0) +
    LESSON_STEP_REWARDS.test;

  steps.push({ type: 'reward', coins: totalCoins, reason: 'Урок пройден' });

  return steps;
}
