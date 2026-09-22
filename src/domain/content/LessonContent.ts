// domain/content/LessonContent.ts
// Форма данных, как она лежит в content/*.json (§25 ТЗ — контент отделён от UI).

/** Иконка+короткая подпись под вариантом ответа в сетке квиза. Опционально —
 * при отсутствии UI показывает дефолтную иконку-букву, без подписи. */
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

/** Узел-подарок в дорожке уроков (§14 — переиспользует систему подарков). */
export interface GiftPathNodeContent {
  id: string;
  branch_id: number;
  /** Вставляется в дорожку сразу после урока с этим order_index в той же ветке. */
  after_order_index: number;
}
