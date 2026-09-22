// lib/utils/formatters.ts
// Утилиты форматирования для «Финни»

import { MOOD_BONUS_THRESHOLD } from '@/constants/gameplay';
import type { Theme } from '@/theme';

/**
 * Форматирование монет: 1250 -> "1,250 C"
 */
export function formatCoins(amount: number): string {
  return `${amount.toLocaleString('ru-RU')} C`;
}

/**
 * Эмодзи для уровня настроения
 */
export function getMoodEmoji(mood: number): string {
  if (mood >= 80) return '😄';
  if (mood >= 50) return '🙂';
  if (mood >= 20) return '😐';
  if (mood >= 10) return '😟';
  return '😫';
}

/**
 * Цвет для уровня настроения
 */
export function getMoodColor(mood: number, theme: Theme): string {
  if (mood > MOOD_BONUS_THRESHOLD) return theme.success;
  if (mood >= 20) return theme.warning;
  return theme.error;
}

/**
 * Склонение слов в русском языке
 */
function pluralize(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

/**
 * Пример: 2 дня, 5 дней, 21 день
 */
export function formatDaysCount(count: number): string {
  return `${count} ${pluralize(count, 'день', 'дня', 'дней')}`;
}
