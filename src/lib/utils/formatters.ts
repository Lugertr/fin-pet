// lib/utils/formatters.ts
// Утилиты форматирования для «ФинСпутник»

import { COLORS, MOOD_BONUS_THRESHOLD } from '@/constants/theme';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Форматирование монет: 1250 -> "1,250 C"
 */
export function formatCoins(amount: number): string {
  return `${amount.toLocaleString('ru-RU')} C`;
}

/**
 * Форматирование энергии: 5 -> "5 E"
 */
export function formatEnergy(amount: number): string {
  return `${amount} E`;
}

/**
 * Относительное время: "2 часа назад", "вчера"
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ru });
  } catch {
    return dateString;
  }
}

/**
 * Полная дата: "15 января 2026, 14:30"
 */
export function formatFullDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'd MMMM yyyy, HH:mm', { locale: ru });
  } catch {
    return dateString;
  }
}

/**
 * Форматирование настроения: 75 -> "😄 75%"
 */
export function formatMood(mood: number): string {
  const emoji = getMoodEmoji(mood);
  return `${emoji} ${mood}%`;
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
export function getMoodColor(mood: number): string {
  if (mood > MOOD_BONUS_THRESHOLD) return COLORS.moodHigh;
  if (mood >= 20) return COLORS.moodMedium;
  return COLORS.moodLow;
}

/**
 * Расчет времени до полного восстановления настроения
 */
export function formatTimeUntilFullMood(currentMood: number, recoveryRate: number): string {
  if (currentMood >= 100) return 'Полное';

  const moodNeeded = 100 - currentMood;
  const hoursNeeded = moodNeeded / recoveryRate;

  if (hoursNeeded < 1) {
    const minutes = Math.ceil(hoursNeeded * 60);
    return `${minutes} мин`;
  }

  const hours = Math.floor(hoursNeeded);
  const minutes = Math.ceil((hoursNeeded - hours) * 60);

  if (minutes === 0) return `${hours} ч`;
  return `${hours} ч ${minutes} мин`;
}

/**
 * Форматирование процентов по вкладу
 */
export function formatDepositInterest(principal: number, interest: number): string {
  return `+${interest} C (${((interest / principal) * 100).toFixed(1)}%)`;
}

/**
 * Склонение слов в русском языке
 */
export function pluralize(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

/**
 * Пример: 3 урока, 5 уроков, 21 урок
 */
export function formatLessonsCount(count: number): string {
  return `${count} ${pluralize(count, 'урок', 'урока', 'уроков')}`;
}

/**
 * Пример: 2 дня, 5 дней, 21 день
 */
export function formatDaysCount(count: number): string {
  return `${count} ${pluralize(count, 'день', 'дня', 'дней')}`;
}
