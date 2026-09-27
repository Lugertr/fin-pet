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

export interface LessonContent {
  id: number;
  branch_id: number;
  title: string;
  order_index: number;
  minigame_type: MinigameType;
  questions: QuestionContent[];
  theory_cards: TheoryCardContent[];
  test_questions: QuestionContent[];
}

export interface BranchContent {
  id: number;
  name: string;
  description: string;
}
