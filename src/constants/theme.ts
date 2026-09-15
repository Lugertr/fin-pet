// constants/theme.ts
// ОБРАТНАЯ СОВМЕСТИМОСТЬ: реэкспорт из новой системы тем
// Постепенно заменяйте использование этого файла на импорт из '@/theme'

import { darkTheme } from '@/theme/themes';
import { durations, fontSizes, radius, spacing } from '@/theme/tokens';

/**
 * @deprecated Используйте `useTheme()` из '@/theme' вместо этого объекта.
 * Оставлено для обратной совместимости со старым кодом.
 */
export const COLORS = {
  primary: darkTheme.primary,
  accent: darkTheme.accent,
  background: darkTheme.background,
  surface: darkTheme.surface,
  surfaceLight: darkTheme.surfaceLight,
  textPrimary: darkTheme.textPrimary,
  textSecondary: darkTheme.textSecondary,
  textMuted: darkTheme.textMuted,
  success: darkTheme.success,
  warning: darkTheme.warning,
  error: darkTheme.error,
  info: darkTheme.info,
  coins: darkTheme.coins,
};

/**
 * @deprecated Используйте `spacing` из '@/theme'
 */
export const SPACING = spacing;

/**
 * @deprecated Используйте `radius` из '@/theme'
 */
export const RADIUS = radius;

/**
 * @deprecated Используйте `fontSizes` из '@/theme'
 */
export const FONT_SIZES = fontSizes;

/**
 * @deprecated Используйте `durations` из '@/theme'
 */
export const DURATIONS = durations;

// Настройка API (оставляем как было)
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
export const API_TIMEOUT = 10000;

// Лимиты
export const DAILY_AI_FREE_QUESTIONS = 5;
export const AI_QUESTION_ENERGY_COST = 10;
