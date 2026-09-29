// domain/lesson/lessonEconomy.test.ts
// Экономика урока в смене (решение пользователя 29.09.2026): зарплата смены
// из price урока × надбавка предметов, энергия за этап, кофе, цена подсказки —
// всё из lessons.json, без полей — значения по умолчанию. Пример урока со
// всеми полями (content/lessons.example.json) обязан проходить проверку.

import exampleJson from '../../../content/lessons.example.json';
import lessonsJson from '../../../content/lessons.json';
import { LessonContent } from '@/domain/content/LessonContent';
import {
  DEFAULT_COFFEE,
  DEFAULT_HINT_PRICE,
  DEFAULT_LESSON_PRICE,
  DEFAULT_NODE_ENERGY_COST,
  economyErrors,
  hintPrice,
  lessonCoffee,
  lessonSalary,
  nodeEnergyCost,
} from './lessonEconomy';
import { validateNodeLesson } from './LessonPlan';

const EXAMPLE = (exampleJson as unknown as LessonContent[])[0];
const LESSONS = lessonsJson as unknown as LessonContent[];
const BARE: LessonContent = {
  ...EXAMPLE,
  price: undefined,
  nodeEnergyCost: undefined,
  coffee: undefined,
};

describe('lessonSalary — зарплата смены', () => {
  it('price урока без надбавки', () => {
    expect(lessonSalary({ price: 60 }, 0)).toBe(60);
  });

  it('надбавка предметов умножает price, монеты целые', () => {
    expect(lessonSalary({ price: 60 }, 50)).toBe(90);
    expect(lessonSalary({ price: 60 }, 33)).toBe(80);
    expect(Number.isInteger(lessonSalary({ price: 55 }, 15))).toBe(true);
  });

  it('без price — зарплата по умолчанию', () => {
    expect(lessonSalary({}, 0)).toBe(DEFAULT_LESSON_PRICE);
  });

  it('отрицательная надбавка не уменьшает зарплату', () => {
    expect(lessonSalary({ price: 60 }, -20)).toBe(60);
  });
});

describe('nodeEnergyCost — энергия за этап', () => {
  it('своя цена этапа важнее цены урока', () => {
    expect(nodeEnergyCost(EXAMPLE, 0)).toBe(10);
    expect(nodeEnergyCost(EXAMPLE, 1)).toBe(15);
  });

  it('без полей — по умолчанию', () => {
    expect(
      nodeEnergyCost({ ...BARE, nodes: [{ ...BARE.nodes[0], energyCost: undefined }] }, 0)
    ).toBe(DEFAULT_NODE_ENERGY_COST);
  });
});

describe('кофе и подсказки', () => {
  it('кофе урока или по умолчанию', () => {
    expect(lessonCoffee(EXAMPLE)).toEqual({ price: 30, energy: 10 });
    expect(lessonCoffee(BARE)).toEqual(DEFAULT_COFFEE);
  });

  it('подсказка платная только в мини-игре', () => {
    const activities = EXAMPLE.nodes.flatMap((node) => node.activities);
    const swipe = activities.find(
      (a) => a.type === 'minigame' && a.minigame_type === 'tinder_swipe'
    )!;
    const test = activities.find((a) => a.type === 'test')!;
    expect(hintPrice(swipe)).toBe(5);
    expect(hintPrice({ ...swipe, hintPrice: undefined } as typeof swipe)).toBe(DEFAULT_HINT_PRICE);
    expect(hintPrice({ ...swipe, hintPrice: 0 } as typeof swipe)).toBe(0);
    expect(hintPrice(test)).toBe(0);
  });
});

describe('economyErrors — проверка полей', () => {
  it('целые ≥ 0 — без ошибок', () => {
    expect(economyErrors(EXAMPLE)).toEqual([]);
  });

  it('дробные и отрицательные значения — ошибки', () => {
    const broken: LessonContent = {
      ...EXAMPLE,
      price: -10,
      nodeEnergyCost: 2.5,
      coffee: { price: 30, energy: -1 },
    };
    expect(economyErrors(broken)).toEqual([
      expect.stringContaining('price'),
      expect.stringContaining('nodeEnergyCost'),
      expect.stringContaining('coffee.energy'),
    ]);
  });
});

describe('content/lessons.example.json — пример урока со всеми полями', () => {
  it('проходит ту же проверку, что и уроки приложения', () => {
    expect(validateNodeLesson(EXAMPLE)).toEqual([]);
  });

  it('использует все поля экономики и все виды заданий', () => {
    expect(EXAMPLE.price).toBeDefined();
    expect(EXAMPLE.nodeEnergyCost).toBeDefined();
    expect(EXAMPLE.coffee).toBeDefined();
    expect(EXAMPLE.nodes.some((node) => node.energyCost !== undefined)).toBe(true);

    const activities = EXAMPLE.nodes.flatMap((node) => node.activities);
    const minigames = activities.flatMap((a) => (a.type === 'minigame' ? [a] : []));
    expect(new Set(minigames.map((m) => m.minigame_type))).toEqual(
      new Set(['quiz', 'tinder_swipe', 'five_letters'])
    );
    expect(minigames.some((m) => m.hintPrice !== undefined)).toBe(true);
    expect(activities.some((a) => a.type === 'test')).toBe(true);

    const options = activities.flatMap((a) =>
      a.type === 'event' ? a.pool.flatMap((event) => event.options) : []
    );
    expect(options.some((o) => o.energyCost !== undefined)).toBe(true);
    expect(new Set(options.map((o) => o.category))).toEqual(
      new Set(['mandatory', 'optional', null])
    );
  });

  it('пример — 1-й урок темы «Бюджет» в lessons.json, совпадает с файлом примера', () => {
    const inLessons = LESSONS.find((l) => l.id === EXAMPLE.id);
    expect(inLessons).toEqual(EXAMPLE);
    expect(EXAMPLE).toMatchObject({ branch_id: 1, order_index: 1 });
  });
});
