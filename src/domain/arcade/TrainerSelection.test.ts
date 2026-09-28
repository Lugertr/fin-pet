// domain/arcade/TrainerSelection.test.ts
// Аркада приключения: любая мини-игра по теме приключения (решение 27.09.2026).

import arcadeSwipeCardsJson from '../../../content/arcade_swipe_cards.json';
import branchesJson from '../../../content/branches.json';
import fiveLettersWordsJson from '../../../content/five_letters_words.json';
import lessonsJson from '../../../content/lessons.json';
import {
  ArcadeSwipeCardsContent,
  BranchContent,
  FiveLettersWordContent,
  LessonContent,
  QuestionContent,
} from '@/domain/content/LessonContent';
import { lessonQuestionPools } from '@/domain/lesson/LessonPlan';
import {
  ARCADE_MAX_TIME_BONUS_MINUTES,
  arcadeTimeBonusMinutes,
  BranchArcadeSources,
  buildBranchGameSession,
  buildQuestTrainerSession,
  DEMO_ROUND_LIMIT,
  FIVE_LETTERS_TRAINER_WORD_COUNT,
  listBranchGames,
  QUIZ_TRAINER_QUESTION_COUNT,
  TINDER_SWIPE_TRAINER_QUESTION_COUNT,
  trainerRoundLength,
} from './TrainerSelection';

function question(id: number, type: 'minigame' | 'test' = 'minigame'): QuestionContent {
  return {
    id,
    question_text: `Вопрос ${id}`,
    options: ['Да', 'Нет'],
    correct_answer: 'Да',
    question_type: type,
  };
}

function lesson(
  id: number,
  branchId: number,
  minigameType: string,
  questions: QuestionContent[],
  tests: QuestionContent[]
): LessonContent {
  return {
    id,
    branch_id: branchId,
    title: `Урок ${id}`,
    order_index: id,
    minigame_type: minigameType,
    questions,
    theory_cards: [],
    test_questions: tests,
  };
}

const sources: BranchArcadeSources = {
  lessons: [
    lesson(1, 1, 'quiz', [question(1)], [question(11, 'test'), question(12, 'test')]),
    lesson(2, 1, 'tinder_swipe', [question(2)], [question(21, 'test')]),
    lesson(3, 2, 'quiz', [question(3)], [question(31, 'test')]),
  ],
  swipeCards: [{ branch_id: 1, cards: [question(101), question(102)] }],
  words: [
    { word: 'ДОХОД', hint: '', branch_ids: [1] },
    { word: 'ВКЛАД', hint: '', branch_ids: [2] },
    { word: 'НАЛОГ', hint: '' },
  ],
};

describe('listBranchGames', () => {
  it('тема с викториной, свайпами и словами — все три игры', () => {
    expect(listBranchGames(1, sources)).toEqual([
      { type: 'quiz', roundLength: 4 },
      { type: 'tinder_swipe', roundLength: 3 },
      { type: 'five_letters', roundLength: 1 },
    ]);
  });

  it('игр без контента для темы в списке нет', () => {
    expect(listBranchGames(2, sources).map((g) => g.type)).toEqual(['quiz', 'five_letters']);
  });
});

describe('buildBranchGameSession', () => {
  it('викторина: вопросы мини-игр-квизов и тестов только этой темы, без свайпов', () => {
    const session = buildBranchGameSession('quiz', 1, sources);
    const ids = session!.questions.map((q) => q.id).sort((a, b) => a - b);
    expect(ids).toEqual([1, 11, 12, 21]);
    expect(session!.countsAsQuest).toBe(false);
  });

  it('свайпы: из уроков темы и карточек Аркады', () => {
    const ids = buildBranchGameSession('tinder_swipe', 1, sources)!
      .questions.map((q) => q.id)
      .sort((a, b) => a - b);
    expect(ids).toEqual([2, 101, 102]);
  });

  it('«5 букв»: только слова, привязанные к теме', () => {
    const session = buildBranchGameSession('five_letters', 2, sources);
    expect(session!.words.map((w) => w.word)).toEqual(['ВКЛАД']);
    expect(trainerRoundLength(session!)).toBe(1);
  });

  it('нет контента — null', () => {
    expect(buildBranchGameSession('tinder_swipe', 2, sources)).toBeNull();
  });

  it('раунд не длиннее лимита игры', () => {
    const many: BranchArcadeSources = {
      lessons: [
        lesson(
          1,
          1,
          'quiz',
          Array.from({ length: 30 }, (_, i) => question(i + 1)),
          []
        ),
      ],
      swipeCards: [{ branch_id: 1, cards: Array.from({ length: 9 }, (_, i) => question(100 + i)) }],
      words: Array.from({ length: 7 }, (_, i) => ({ word: `СЛОВ${i}`, hint: '', branch_ids: [1] })),
    };
    expect(buildBranchGameSession('quiz', 1, many)!.questions).toHaveLength(
      QUIZ_TRAINER_QUESTION_COUNT
    );
    expect(buildBranchGameSession('tinder_swipe', 1, many)!.questions).toHaveLength(
      TINDER_SWIPE_TRAINER_QUESTION_COUNT
    );
    expect(buildBranchGameSession('five_letters', 1, many)!.words).toHaveLength(
      FIVE_LETTERS_TRAINER_WORD_COUNT
    );
  });
});

describe('buildQuestTrainerSession', () => {
  it('раунд-задание (тема пройдена на 100%) засчитывается как задание', () => {
    const session = buildQuestTrainerSession(1, sources);
    expect(session).not.toBeNull();
    expect(session!.countsAsQuest).toBe(true);
    expect(session!.branchId).toBe(1);
  });
});

describe('контент Аркады', () => {
  const realSources: BranchArcadeSources = {
    lessons: lessonsJson as LessonContent[],
    swipeCards: arcadeSwipeCardsJson as ArcadeSwipeCardsContent[],
    words: fiveLettersWordsJson as FiveLettersWordContent[],
  };

  it('в каждой теме доступны все три мини-игры', () => {
    for (const branch of branchesJson as BranchContent[]) {
      expect(listBranchGames(branch.id, realSources).map((g) => g.type)).toEqual([
        'quiz',
        'tinder_swipe',
        'five_letters',
      ]);
    }
  });

  it('у карточки свайпа два варианта, верный — один из них; id не пересекаются с уроками', () => {
    const lessonIds = new Set(
      realSources.lessons
        .flatMap((l) => {
          const pools = lessonQuestionPools(l);
          return [...pools.quiz, ...pools.swipes];
        })
        .map((q) => q.id)
    );
    for (const set of realSources.swipeCards) {
      for (const card of set.cards) {
        expect(card.options).toHaveLength(2);
        expect(card.options).toContain(card.correct_answer);
        expect(card.explanation).toBeTruthy();
        expect(lessonIds.has(card.id)).toBe(false);
      }
    }
  });
});

describe('arcadeTimeBonusMinutes (Аркада ускоряет слабее урока)', () => {
  it('идеальный раунд — 15 минут, меньше урока-задания (45)', () => {
    expect(arcadeTimeBonusMinutes(10, 10)).toBe(ARCADE_MAX_TIME_BONUS_MINUTES);
    expect(ARCADE_MAX_TIME_BONUS_MINUTES).toBeLessThan(45);
  });

  it('пропорционально верным ответам, без ошибок в плюс', () => {
    expect(arcadeTimeBonusMinutes(5, 10)).toBe(7);
    expect(arcadeTimeBonusMinutes(0, 10)).toBe(0);
    expect(arcadeTimeBonusMinutes(3, 0)).toBe(0);
  });
});

describe('демо-режим (§18): короткие раунды Аркады', () => {
  const big: BranchArcadeSources = {
    lessons: [
      lesson(
        1,
        1,
        'quiz',
        Array.from({ length: 12 }, (_, i) => question(i + 1)),
        []
      ),
    ],
    swipeCards: [{ branch_id: 1, cards: Array.from({ length: 8 }, (_, i) => question(100 + i)) }],
    words: ['ДОХОД', 'ВКЛАД', 'НАЛОГ'].map((word) => ({ word, hint: '', branch_ids: [1] })),
  };

  it('в демо раунд не длиннее DEMO_ROUND_LIMIT, без демо — обычный', () => {
    expect(listBranchGames(1, big, true)).toEqual([
      { type: 'quiz', roundLength: DEMO_ROUND_LIMIT.quiz },
      { type: 'tinder_swipe', roundLength: DEMO_ROUND_LIMIT.tinder_swipe },
      { type: 'five_letters', roundLength: DEMO_ROUND_LIMIT.five_letters },
    ]);
    expect(listBranchGames(1, big).map((g) => g.roundLength)).toEqual([
      QUIZ_TRAINER_QUESTION_COUNT,
      TINDER_SWIPE_TRAINER_QUESTION_COUNT,
      FIVE_LETTERS_TRAINER_WORD_COUNT,
    ]);
  });

  it('buildBranchGameSession и задание-тренировка в демо — тоже короткие', () => {
    for (const type of ['quiz', 'tinder_swipe', 'five_letters'] as const) {
      const session = buildBranchGameSession(type, 1, big, false, true);
      expect(trainerRoundLength(session!)).toBe(DEMO_ROUND_LIMIT[type]);
    }
    const quest = buildQuestTrainerSession(1, big, true);
    expect(trainerRoundLength(quest!)).toBeLessThanOrEqual(3);
    expect(quest!.countsAsQuest).toBe(true);
  });
});
