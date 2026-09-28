// domain/lesson/LessonPlan.test.ts
// Урок из узлов (28.09.2026): план для плеера, адаптер старых уроков и
// правила состава — в том числе на всём content/lessons.json.

import lessonsJson from '../../../content/lessons.json';
import {
  AnyLessonContent,
  LessonActivityContent,
  LessonContent,
  NodeLessonContent,
  QuestionContent,
} from '@/domain/content/LessonContent';
import {
  DEMO_NODE_LESSON_LIMITS,
  buildLessonPlan,
  isNodeLesson,
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

describe('content/lessons.json', () => {
  const lessons = lessonsJson as unknown as AnyLessonContent[];

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
