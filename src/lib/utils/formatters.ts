// lib/utils/formatters.ts
// Утилиты форматирования для «Финни»

import { MOOD_BONUS_THRESHOLD } from '@/constants/gameplay';
import type { Theme } from '@/theme';

/** Число с разделителями разрядов: 1250 -> "1 250". */
export function formatNumber(amount: number): string {
  return amount.toLocaleString('ru-RU');
}

/** Знак валюты в интерфейсе (решение пользователя 27.09.2026): «80 C». */
export const COIN_SYMBOL = 'C';

/**
 * Сумма для показа на экране — везде, где видна цена/сумма (шапка, магазин,
 * план/факт, награды, итоги, тексты алертов): 1250 -> "1 250 C".
 * Неразрывный пробел — чтобы «C» не переносился на новую строку отдельно.
 */
export function formatPrice(amount: number): string {
  return `${formatNumber(amount)} ${COIN_SYMBOL}`;
}

/**
 * Монеты словом — только для подписей скринридера (accessibilityLabel):
 * 1 -> "1 монета", 3 -> "3 монеты", 1250 -> "1 250 монет". Буква «C» вслух
 * читается непонятно, поэтому на экране — formatPrice, а голосом — словом.
 */
export function formatCoins(amount: number): string {
  return `${formatNumber(amount)} ${pluralize(Math.abs(amount), 'монета', 'монеты', 'монет')}`;
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
