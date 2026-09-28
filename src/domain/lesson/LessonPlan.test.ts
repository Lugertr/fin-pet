// domain/lesson/LessonPlan.test.ts
// Урок из узлов (28.09.2026): план для плеера, адаптер старых уроков и
// правила состава — в том числе на всём content/lessons.json.

import fiveLettersWordsJson from '../../../content/five_letters_words.json';
import lessonsJson from '../../../content/lessons.json';
import {
  AnyLessonContent,
  FiveLettersWordContent,
  LessonActivityContent,
  LessonContent,
  NodeLessonContent,
  QuestionContent,
} from '@/domain/content/LessonContent';
import {
  DEMO_NODE_LESSON_LIMITS,
  buildLessonPlan,
  fiveLettersWordFor,
  isNodeLesson,
  lessonQuestionPools,
  lessonStructureKey,
  planForLesson,
  planFromLegacyLesson,
  validateNodeLesson,
} from './LessonPlan';

let nextQuestionId = 1;
function question(overrides: Partial<QuestionContent> = {}): QuestionContent {
  return {
    id: nextQuestionId++,
    question_text: 'Что такое бюджет?',
    options: ['План доходов и расходов', 'Копилка'],
    correct_answer: 'План доходов и расходов',
    question_type: 'test',
    ...overrides,
  };
}

function test(count = 2): LessonActivityContent {
  return { type: 'test', questions: Array.from({ length: count }, () => question()) };
}

let nextEventId = 1;
function event(): LessonActivityContent {
  const id = `event-${nextEventId++}`;
  return {
    type: 'event',
    pool: [
      {
        id,
        title: 'Друг зовёт в кино',
        description: 'Билет стоит 20 монет.',
        icon: '🎬',
        options: [
          { id: 'go', label: 'Пойти', category: 'optional', coinAmount: -20 },
          { id: 'skip', label: 'Остаться дома', category: null, coinAmount: 0 },
        ],
      },
    ],
  };
}

const card = { title: 'Бюджет', text: 'Бюджет — это план.' };

function lesson(overrides: Partial<NodeLessonContent> = {}): NodeLessonContent {
  return {
    id: 100,
    branch_id: 1,
    title: 'Что такое бюджет?',
    order_index: 1,
    situation: { title: 'Карманные деньги', text: 'Тебе дали 100 монет на неделю.' },
    nodes: [
      { cards: [card, card], activities: [test(3), event()] },
      { cards: [card], activities: [{ type: 'minigame', minigame_type: 'five_letters' }] },
      { cards: [card], activities: [event(), test(2)] },
    ],
    conclusion: { title: 'Итог', text: 'Бюджет помогает не потратить всё сразу.' },
    ...overrides,
  };
}

describe('buildLessonPlan', () => {
  it('узлы с id действий «узел.действие», ситуация только у первого узла', () => {
    const plan = buildLessonPlan(lesson());
    expect(plan.nodes).toHaveLength(3);
    expect(plan.nodes[0].situation?.title).toBe('Карманные деньги');
    expect(plan.nodes[1].situation).toBeNull();
    expect(plan.nodes[2].activities.map((a) => a.id)).toEqual(['2.0', '2.1']);
    expect(plan.conclusion?.title).toBe('Итог');
  });

  it('отпечаток структуры — типы действий по этапам; тексты на него не влияют', () => {
    const plan = buildLessonPlan(lesson());
    const key = lessonStructureKey(plan);
    expect(key.split('|')).toHaveLength(plan.nodes.length);
    expect(key.split('|')[0]).toBe(
      plan.nodes[0].activities
        .map(({ content }) =>
          content.type === 'minigame' ? `minigame:${content.minigame_type}` : content.type
        )
        .join(',')
    );
    const renamed = lesson();
    renamed.nodes[0].cards = [{ title: 'Другое', text: 'Другой текст' }];
    expect(lessonStructureKey(buildLessonPlan(renamed))).toBe(key);
    // Демо-план — те же номера действий у оставшихся этапов.
    expect(key.startsWith(lessonStructureKey(buildLessonPlan(lesson(), true)))).toBe(true);
  });

  it('тип узла на треке — по первому действию', () => {
    expect(buildLessonPlan(lesson()).nodes.map((n) => n.kind)).toEqual([
      'test',
      'minigame',
      'event',
    ]);
  });

  it('демо: первые узлы, по одной карточке, короткие тесты', () => {
    const plan = buildLessonPlan(lesson(), true);
    expect(plan.nodes).toHaveLength(DEMO_NODE_LESSON_LIMITS.nodes);
    expect(plan.nodes[0].cards).toHaveLength(DEMO_NODE_LESSON_LIMITS.cardsPerNode);
    const firstTest = plan.nodes[0].activities[0].content;
    expect(firstTest.type === 'test' && firstTest.questions).toHaveLength(
      DEMO_NODE_LESSON_LIMITS.testQuestions
    );
  });
});

describe('planFromLegacyLesson — старые уроки на время перевода', () => {
  const legacy: LessonContent = {
    id: 1,
    branch_id: 1,
    title: 'Старый урок',
    order_index: 1,
    minigame_type: 'tinder_swipe',
    questions: [question({ question_type: 'minigame' })],
    theory_cards: [card, card, card, card],
    test_questions: [question(), question()],
  };

  it('мини-игра с первой половиной карточек, тест — со второй', () => {
    const plan = planFromLegacyLesson(legacy);
    expect(plan.nodes.map((n) => [n.cards.length, n.kind])).toEqual([
      [2, 'minigame'],
      [2, 'test'],
    ]);
    expect(plan.nodes[0].situation).toBeNull();
    expect(plan.conclusion).toBeNull();
  });

  it('без мини-игры — один узел с тестом', () => {
    const plan = planFromLegacyLesson({ ...legacy, minigame_type: 'quiz', questions: [] });
    expect(plan.nodes).toHaveLength(1);
    expect(plan.nodes[0].kind).toBe('test');
  });
});

describe('validateNodeLesson', () => {
  it('корректный урок — без ошибок', () => {
    expect(validateNodeLesson(lesson())).toEqual([]);
  });

  it('нет ситуации или заключения', () => {
    const errors = validateNodeLesson(
      lesson({ situation: { title: '', text: '' }, conclusion: { title: 'Итог', text: ' ' } })
    );
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('нет ситуации'),
        expect.stringContaining('нет заключения'),
      ])
    );
  });

  it('первый узел — тест или мини-игра и событие', () => {
    const errors = validateNodeLesson(lesson({ nodes: [{ cards: [card], activities: [test()] }] }));
    expect(errors).toEqual([expect.stringContaining('в первом узле нужно событие')]);
  });

  it('узел без карточек или без действий', () => {
    const base = lesson();
    const errors = validateNodeLesson(
      lesson({ nodes: [...base.nodes, { cards: [], activities: [] }] })
    );
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('нет карточек'),
        expect.stringContaining('нет действий'),
      ])
    );
  });

  it('два события подряд нельзя — и внутри узла, и на стыке узлов', () => {
    const inside = lesson({
      nodes: [{ cards: [card], activities: [test(), event(), event()] }],
    });
    expect(validateNodeLesson(inside)).toEqual([expect.stringContaining('два события подряд')]);

    const across = lesson({
      nodes: [
        { cards: [card], activities: [test(), event()] },
        { cards: [card], activities: [event(), test()] },
      ],
    });
    expect(validateNodeLesson(across)).toEqual([expect.stringContaining('два события подряд')]);
  });

  it('узел из одного события допустим, если рядом не событие', () => {
    const ok = lesson({
      nodes: [
        { cards: [card], activities: [event(), test()] },
        { cards: [card], activities: [event()] },
        { cards: [card], activities: [test()] },
      ],
    });
    expect(validateNodeLesson(ok)).toEqual([]);
  });

  it('вопрос: верный ответ среди вариантов, id не повторяются', () => {
    const broken = question({ correct_answer: 'Нет такого' });
    const errors = validateNodeLesson(
      lesson({
        nodes: [
          { cards: [card], activities: [{ type: 'test', questions: [broken, broken] }, event()] },
        ],
      })
    );
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('верного ответа нет среди вариантов'),
        expect.stringContaining('повторяется'),
      ])
    );
  });

  it('событие: есть бесплатный вариант, трата — с корзиной', () => {
    const paidOnly: LessonActivityContent = {
      type: 'event',
      pool: [
        {
          id: 'paid',
          title: 'Ярмарка',
          description: 'Всё продаётся.',
          icon: '🎪',
          options: [
            { id: 'a', label: 'Купить', category: null, coinAmount: -10 },
            { id: 'b', label: 'Купить другое', category: 'optional', coinAmount: -5 },
          ],
        },
      ],
    };
    const errors = validateNodeLesson(
      lesson({ nodes: [{ cards: [card], activities: [test(), paidOnly] }] })
    );
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('нет бесплатного варианта'),
        expect.stringContaining('без корзины'),
      ])
    );
  });

  it('свайп — вопрос «да / нет»: два варианта, текст с «?»', () => {
    const swipes = (questions: QuestionContent[]): LessonActivityContent => ({
      type: 'minigame',
      minigame_type: 'tinder_swipe',
      questions,
    });
    const good = question({
      question_text: 'Купить?',
      options: ['Нет', 'Да'],
      correct_answer: 'Нет',
    });
    const noQuestion = question({
      question_text: 'Купи',
      options: ['Нет', 'Да'],
      correct_answer: 'Нет',
    });
    const threeOptions = question({
      question_text: 'Купить?',
      options: ['Нет', 'Да', 'Может'],
      correct_answer: 'Нет',
    });
    const base = lesson();
    const withSwipes = (q: QuestionContent[]) =>
      validateNodeLesson({
        ...base,
        nodes: [base.nodes[0], { ...base.nodes[1], activities: [swipes(q)] }, base.nodes[2]],
      });
    expect(withSwipes([good])).toEqual([]);
    expect(withSwipes([noQuestion]).join()).toContain('«да / нет»');
    expect(withSwipes([threeOptions]).join()).toContain('«да / нет»');
  });

  it('неизвестная мини-игра', () => {
    const errors = validateNodeLesson(
      lesson({
        nodes: [
          {
            cards: [card],
            activities: [{ type: 'minigame', minigame_type: 'tetris', questions: [] }, event()],
          },
        ],
      })
    );
    expect(errors).toEqual([expect.stringContaining('неизвестная мини-игра')]);
  });
});

describe('lessonQuestionPools — вопросы уроков для Аркады', () => {
  it('урок из узлов: тесты и викторины — в квиз, свайпы — в свайпы', () => {
    const swipe = question({
      question_type: 'minigame',
      options: ['Да', 'Нет'],
      correct_answer: 'Да',
    });
    const quizQuestion = question({ question_type: 'minigame' });
    const pools = lessonQuestionPools(
      lesson({
        nodes: [
          {
            cards: [card],
            activities: [
              test(2),
              event(),
              { type: 'minigame', minigame_type: 'quiz', questions: [quizQuestion] },
              { type: 'minigame', minigame_type: 'tinder_swipe', questions: [swipe] },
            ],
          },
        ],
      })
    );
    expect(pools.quiz).toHaveLength(3);
    expect(pools.swipes).toEqual([swipe]);
  });
});

describe('fiveLettersWordFor — слово для «5 букв»', () => {
  const bank: FiveLettersWordContent[] = [
    { word: 'ДОХОД', hint: 'Приходящие деньги', branch_ids: [1] },
    { word: 'НАЛОГ', hint: 'Платёж государству', branch_ids: [1] },
    { word: 'ВКЛАД', hint: 'Деньги в банке', branch_ids: [3] },
  ];
  const game: LessonActivityContent = { type: 'minigame', minigame_type: 'five_letters' };

  it('заданное в контенте слово', () => {
    expect(fiveLettersWordFor({ ...game, word: 'ВКЛАД' }, 1, bank)?.word).toBe('ВКЛАД');
  });

  it('иначе — случайное слово темы урока', () => {
    expect(fiveLettersWordFor(game, 1, bank, () => 0.99)?.word).toBe('НАЛОГ');
    expect(fiveLettersWordFor(game, 3, bank)?.word).toBe('ВКЛАД');
  });

  it('у темы нет слов — любое из банка; банк пуст — null', () => {
    expect(fiveLettersWordFor(game, 7, bank, () => 0)?.word).toBe('ДОХОД');
    expect(fiveLettersWordFor(game, 1, [])).toBeNull();
  });

  it('слово в контенте — ровно 5 заглавных русских букв', () => {
    const errors = validateNodeLesson(
      lesson({
        nodes: [{ cards: [card], activities: [{ ...game, word: 'бюджет' }, test(), event()] }],
      })
    );
    expect(errors).toEqual([expect.stringContaining('ровно 5 заглавных русских букв')]);
  });
});

describe('content/lessons.json', () => {
  const lessons = lessonsJson as unknown as AnyLessonContent[];

  it('все уроки — в формате этапов (узлов)', () => {
    expect(lessons.length).toBeGreaterThan(0);
    expect(lessons.filter((l) => !isNodeLesson(l)).map((l) => l.id)).toEqual([]);
  });

  it('в каждой теме уроки пронумерованы по порядку, без пропусков и повторов', () => {
    const branchIds = [...new Set(lessons.map((l) => l.branch_id))];
    for (const branchId of branchIds) {
      const order = lessons
        .filter((l) => l.branch_id === branchId)
        .map((l) => l.order_index)
        .sort((a, b) => a - b);
      expect(order).toEqual(order.map((_, i) => i + 1));
    }
  });

  it('слова «5 букв», заданные в уроках, есть в общем банке', () => {
    const bank = new Set((fiveLettersWordsJson as FiveLettersWordContent[]).map((w) => w.word));
    const words = lessons
      .filter(isNodeLesson)
      .flatMap((l) => l.nodes.flatMap((n) => n.activities))
      .flatMap((a) => (a.type === 'minigame' && a.word ? [a.word] : []));
    for (const word of words) expect(bank.has(word)).toBe(true);
  });

  it('id вопросов уникальны во всём контенте уроков', () => {
    const ids = lessons.flatMap((l) => {
      const pools = lessonQuestionPools(l);
      return [...pools.quiz, ...pools.swipes].map((q) => q.id);
    });
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('уроки из узлов соблюдают правила состава', () => {
    const errors = lessons.filter(isNodeLesson).flatMap(validateNodeLesson);
    expect(errors).toEqual([]);
  });

  it('у каждого урока (и старого, через адаптер) есть узлы с действиями', () => {
    for (const item of lessons) {
      const plan = planForLesson(item);
      expect(plan.nodes.length).toBeGreaterThan(0);
      for (const node of plan.nodes) expect(node.activities.length).toBeGreaterThan(0);
    }
  });
});
