// constants/theme.ts
// Цветовая схема и константы для «ФинСпутник»

export const COLORS = {
  // Основные цвета
  primary: '#6366F1', // индиго
  primaryDark: '#4F46E5',
  secondary: '#22C55E', // зелёный (финансы)
  accent: '#F59E0B', // оранжевый (настроение)

  // Фоны
  background: '#0F172A', // тёмный фон
  surface: '#1E293B', // карточки
  surfaceLight: '#334155',

  // Текст
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  // Настроение
  moodHigh: '#22C55E', // > 50%
  moodMedium: '#F59E0B', // 20-50%
  moodLow: '#EF4444', // < 20%

  // Экономика
  coins: '#FBBF24', // золотой
  energy: '#38BDF8', // голубой

  // Успех/Ошибка
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// API
export const API_BASE_URL = 'http://localhost:8000'; // для MVP
export const API_TIMEOUT = 10000; // 10 секунд

// Настроение
export const MOOD_MAX = 100;
export const MOOD_BLOCK_THRESHOLD = 0;
export const MOOD_BONUS_THRESHOLD = 50;

// Экономика
export const LESSON_COMPLETION_BONUS = 50;
export const DAILY_AI_FREE_QUESTIONS = 5;
export const AI_QUESTION_ENERGY_COST = 2;
