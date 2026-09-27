// domain/lesson/buildLessonSteps.test.ts
// Композиция шагов урока (§9.1): у урока-викторины вопросы мини-игры и теста —
// одна пачка (решение пользователя 28.09.2026); укороченный урок демо-режима (§18).

import lessonsJson from '../../../content/lessons.json';
import { LessonContent, QuestionContent } from '@/domain/content/LessonContent';
import { LessonStep, TestStep } from './LessonStep';
import { buildLessonSteps, DEMO_LESSON_LIMITS, LESSON_STEP_REWARDS } from './buildLessonSteps';

const LESSONS = lessonsJson as LessonContent[];
const QUIZ_LESSON = LESSONS.find((l) => l.minigame_type === 'quiz')!;
const SWIPE_LESSON = LESSONS.find((l) => l.minigame_type === 'tinder_swipe')!;

const FULL_REWARD =
  LESSON_STEP_REWARDS.theory + LESSON_STEP_REWARDS.minigame + LESSON_STEP_REWARDS.test;

function testStep(steps: LessonStep[]): TestStep {
  const step = steps.find((s): s is TestStep => s.type === 'test');
  if (!step) throw new Error('нет шага теста');
  return step;
}

function question(id: number, text: string, type: 'minigame' | 'test'): QuestionContent {
  return {
    id,
    question_text: text,
    options: ['Да', 'Нет'],
    correct_answer: 'Да',
    question_type: type,
  };
}

describe('buildLessonSteps — урок-викторина: одна пачка вопросов', () => {
  it('нет отдельного шага мини-игры: теория → тест → награда', () => {
    const steps = buildLessonSteps(QUIZ_LESSON, []);
    expect(steps.map((s) => s.type)).toEqual(['theory', 'test', 'reward']);
  });

  it('вопросы мини-игры идут первыми, за ними — тест', () => {
    const lesson: LessonContent = {
      ...QUIZ_LESSON,
      questions: [question(1, 'Мини 1', 'minigame'), question(2, 'Мини 2', 'minigame')],
      test_questions: [question(11, 'Тест 1', 'test'), question(12, 'Тест 2', 'test')],
    };
    const ids = testStep(buildLessonSteps(lesson, [])).questions.map((q) => q.id);
    expect(ids).toEqual([1, 2, 11, 12]);
  });

  it('одинаковый вопрос в мини-игре и тесте — в пачке один раз', () => {
    const lesson: LessonContent = {
      ...QUIZ_LESSON,
      questions: [question(1, 'Что такое бюджет?', 'minigame')],
      test_questions: [
        question(101, 'Что такое бюджет? ', 'test'),
        question(102, 'Другой', 'test'),
      ],
    };
    const ids = testStep(buildLessonSteps(lesson, [])).questions.map((q) => q.id);
    expect(ids).toEqual([1, 102]);
  });

  it('награда та же, что с отдельной мини-игрой', () => {
    const steps = buildLessonSteps(QUIZ_LESSON, []);
    expect(steps[steps.length - 1]).toEqual({
      type: 'reward',
      coins: FULL_REWARD,
      reason: 'Урок пройден',
    });
  });

  it('контент: в каждом уроке-викторине пачка без повторов', () => {
    for (const lesson of LESSONS.filter((l) => l.minigame_type === 'quiz')) {
      const texts = testStep(buildLessonSteps(lesson, [])).questions.map((q) =>
        q.question_text.trim().toLowerCase()
      );
      expect(new Set(texts).size).toBe(texts.length);
    }
  });
});

describe('buildLessonSteps — «Свайпы» и «5 букв» остаются отдельной мини-игрой', () => {
  it('свайпы: теория → мини-игра → тест → награда, тест — только свои вопросы', () => {
    const steps = buildLessonSteps(SWIPE_LESSON, []);
    expect(steps.map((s) => s.type)).toEqual(['theory', 'minigame', 'test', 'reward']);
    expect(testStep(steps).questions).toHaveLength(SWIPE_LESSON.test_questions.length);
  });
});

describe('buildLessonSteps — демо-режим (§18)', () => {
  it('теория и тест укорочены, вопросы мини-игры — целиком в пачке, награда та же', () => {
    const full = buildLessonSteps(QUIZ_LESSON, []);
    const demo = buildLessonSteps(QUIZ_LESSON, [], true);
    expect(demo.map((s) => s.type)).toEqual(full.map((s) => s.type));

    const theory = demo[0];
    expect(theory.type === 'theory' && theory.cards).toHaveLength(DEMO_LESSON_LIMITS.theoryCards);
    const minigameCount = QUIZ_LESSON.questions.filter(
      (q) => q.question_type === 'minigame'
    ).length;
    expect(testStep(demo).questions.length).toBeLessThanOrEqual(
      minigameCount + DEMO_LESSON_LIMITS.testQuestions
    );
    expect(demo[demo.length - 1]).toEqual(full[full.length - 1]);
  });

  it('контент: в каждом уроке теории и теста не меньше демо-лимита', () => {
    for (const lesson of LESSONS) {
      expect(lesson.theory_cards.length).toBeGreaterThanOrEqual(DEMO_LESSON_LIMITS.theoryCards);
      expect(lesson.test_questions.length).toBeGreaterThanOrEqual(DEMO_LESSON_LIMITS.testQuestions);
    }
  });
});
