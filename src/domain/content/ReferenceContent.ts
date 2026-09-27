// domain/content/ReferenceContent.ts
// Справочный контент раздела «Прогресс» (решение пользователя 27.09.2026):
// словарь игры и документы. Лежит в content/*.json (§25 ТЗ), не в UI.

/** Слово словаря игры — объяснение простыми словами для 7–11 лет. */
export interface GlossaryTermContent {
  id: string;
  term: string;
  definition: string;
}

/**
 * Документ (PDF) раздела «Документы». Список пока пустой — сами файлы и их
 * просмотр появятся позже; экран уже читает список из content/documents.json.
 */
export interface DocumentContent {
  id: string;
  title: string;
  description: string;
  /** Путь к PDF в assets/ — для будущего просмотрщика. */
  file: string;
}

/**
 * Поиск по словарю: без учёта регистра и «ё/е», по слову и объяснению.
 * Пустой запрос — весь словарь.
 */
export function filterGlossary(terms: GlossaryTermContent[], query: string): GlossaryTermContent[] {
  const normalize = (text: string) => text.toLowerCase().replace(/ё/g, 'е').trim();
  const needle = normalize(query);
  if (!needle) return terms;
  return terms.filter(
    (item) => normalize(item.term).includes(needle) || normalize(item.definition).includes(needle)
  );
}

/**
 * Экраны с подсказкой «?» (решение пользователя 27.09.2026: у каждого экрана
 * детского приложения — кнопка с объяснением). Тексты — в content/screen_help.json.
 */
export const SCREEN_HELP_IDS = [
  'onboarding',
  'hub',
  'adventure',
  'adventure_planning',
  'adventure_summary',
  'lessons',
  'lesson',
  'ai_chat',
  'shop',
  'inventory',
  'gifts',
  'gift_reveal',
  'savings',
  'progress',
  'achievements',
  'glossary',
  'documents',
  'settings',
  'transactions',
  'arcade_lobby',
  'game_quiz',
  'game_swipes',
  'game_five_letters',
  'parents',
] as const;

export type ScreenHelpId = (typeof SCREEN_HELP_IDS)[number];

export interface ScreenHelpContent {
  id: ScreenHelpId;
  /** Заголовок окна подсказки. */
  title: string;
  /** 2–6 коротких пунктов: эмодзи + одно-два предложения. */
  items: { emoji: string; text: string }[];
}
