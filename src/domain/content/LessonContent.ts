// domain/content/LessonContent.ts
// Форма данных, как она лежит в content/*.json (§25 ТЗ — контент отделён от UI).

/** Иконка+короткая подпись под вариантом ответа в квизе. Опционально — при
 * отсутствии UI показывает дефолтную иконку-букву, без подписи. */
export interface QuestionOptionDetail {
  icon?: string;
  sublabel?: string;
}

export interface QuestionContent {
  id: number;
  question_text: string;
  /** Для «Свайпов» — ровно [ответ «нет» (влево ✗), ответ «да» (вправо ✓)],
   * а question_text — вопрос «да / нет» (см. TinderSwipeGame). */
  options: string[];
  correct_answer: string;
  question_type: 'minigame' | 'test';
  /** Тот же порядок/длина, что options. */
  optionDetails?: QuestionOptionDetail[];
  /** Только для minigame_type: 'tinder_swipe' — текст баннера обратной связи
   * после свайпа («Рискованно: …» / «Безопасно: …», см. TinderSwipeGame). */
  explanation?: string;
  /** Только для minigame_type: 'tinder_swipe' — текст под ссылкой «Подсказка»
   * (см. TinderSwipeGame); ссылка не показывается, если поле не задано. */
  hint?: string;
}

export interface TheoryCardContent {
  title: string;
  /** Поддерживает инлайн-выделение термина через **term** (см. lib/utils/richText.ts). */
  text: string;
  /** Доп. факт в зелёном баннере под карточкой; тоже поддерживает **term**. */
  bonusFact?: string;
}

export type MinigameType = 'quiz' | 'tinder_swipe' | 'five_letters' | string; // расширяемо новыми типами мини-игр

/** Слово для мини-игры «5 букв» (content/five_letters_words.json) — общий
 * банк слов, не привязан к конкретному уроку (см. buildLessonSteps.ts,
 * который сам выбирает случайное слово оттуда для урока с
 * minigame_type: 'five_letters'). */
export interface FiveLettersWordContent {
  /** Ровно 5 кириллических букв, заглавные. */
  word: string;
  hint: string;
  /** Темы (ветки), к которым относится слово, — для «5 букв» в Аркаде
   * приключения. Уроки берут слово из всего банка без учёта этого поля. */
  branch_ids?: number[];
}

/**
 * Карточки свайпов для Аркады приключения по теме (content/arcade_swipe_cards.json).
 * Дополняют свайп-вопросы уроков: у большинства тем уроков со свайпами нет,
 * а в Аркаде по теме приключения доступны все мини-игры.
 */
export interface ArcadeSwipeCardsContent {
  branch_id: number;
  cards: QuestionContent[];
}

// ── Урок из узлов (решение пользователя 28.09.2026) ──
// Ситуация по теме → узлы-блоки → заключение. Каждый узел начинается с
// карточек (у первого — ещё и с ситуации), дальше действия: тест, мини-игра,
// событие. Каждый узел — точка прогресс-трека смены; последний узел трека —
// завершение урока с заключением. Правила состава — validateNodeLesson.

/** Вводная ситуация урока — показывается в начале первого узла. */
export interface LessonSituationContent {
  title: string;
  /** Поддерживает **term** (lib/utils/richText.ts), как карточки теории. */
  text: string;
}

/** Заключение — финальный узел урока. */
export interface LessonConclusionContent {
  title: string;
  text: string;
}

export interface LessonEventOptionContent {
  id: string;
  label: string;
  /** mandatory — трата на нужное, optional — на желаемое, null — без траты. */
  category: 'mandatory' | 'optional' | null;
  /** Целые монеты бюджета смены: отрицательное — трата, положительное — пополнение. */
  coinAmount: number;
  /** Сколько энергии стоит этот вариант в смене (например, «0 C, −30⚡»
   * вместо траты на нужное). Нет — 0. */
  energyCost?: number;
}

/** Событие внутри урока — выбор, связанный с ситуацией урока; не привязано ко времени. */
export interface LessonEventContent {
  id: string;
  title: string;
  description: string;
  /** Эмодзи, "question" / "reward" (персонаж — питомец ребёнка) или ключ
   * картинки из constants/eventIcons.ts (например, "laptop"). */
  icon: string;
  /** Первый вариант — главный: выделенная кнопка, под ней — как он ляжет на план. */
  options: LessonEventOptionContent[];
}

export interface LessonTestActivityContent {
  type: 'test';
  questions: QuestionContent[];
}

export interface LessonMinigameActivityContent {
  type: 'minigame';
  minigame_type: MinigameType;
  /** quiz / tinder_swipe — вопросы игры; five_letters — не нужны (слово из общего банка). */
  questions?: QuestionContent[];
  /** five_letters: слово из общего банка (content/five_letters_words.json);
   * без него — случайное слово темы урока. */
  word?: string;
  /** Цена подсказки в игре (свайпы — hint вопроса, «5 букв» — hint слова): в
   * смене — из бюджета работы, вне смены — из кошелька. Нет — по умолчанию
   * (domain/lesson/lessonEconomy.ts); 0 — бесплатно. */
  hintPrice?: number;
}

export interface LessonEventActivityContent {
  type: 'event';
  /** «Случайное событие»: из пула выпадает одно, выбор запоминается в прогрессе. */
  pool: LessonEventContent[];
}

export type LessonActivityContent =
  LessonTestActivityContent | LessonMinigameActivityContent | LessonEventActivityContent;

export interface LessonNodeContent {
  /** Блок чтения узла — всегда первым, его можно перечитать. */
  cards: TheoryCardContent[];
  activities: LessonActivityContent[];
  /** Энергия за этот этап в смене — вместо nodeEnergyCost урока. */
  energyCost?: number;
}

/** Кофе в смене — один раз за смену, из бюджета работы (в «Хочу»). */
export interface LessonCoffeeContent {
  /** Цена, монеты бюджета работы. */
  price: number;
  /** Сколько энергии прибавляет. */
  energy: number;
}

/** Урок — как он лежит в content/lessons/*.json (формат — README, «Формат урока»). */
export interface LessonContent {
  id: number;
  branch_id: number;
  title: string;
  order_index: number;
  situation: LessonSituationContent;
  nodes: LessonNodeContent[];
  conclusion: LessonConclusionContent;
  /** Зарплата смены по этому уроку — стартовый бюджет работы (до надбавки
   * предметов: ноутбук, декор). Нет — по умолчанию (lessonEconomy.ts). */
  price?: number;
  /** Энергия за каждый этап урока в смене (кроме финального). Нет — по умолчанию. */
  nodeEnergyCost?: number;
  /** Кофе в смене по этому уроку. Нет — по умолчанию. */
  coffee?: LessonCoffeeContent;
}

export interface BranchContent {
  id: number;
  name: string;
  description: string;
}
