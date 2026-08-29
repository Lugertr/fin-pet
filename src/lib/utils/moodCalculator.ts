// lib/utils/moodCalculator.ts
// Клиентский предикт настроения для оптимистичного UI

import { MOOD_MAX } from '@/constants/theme';

interface MoodCalculationInput {
  storedMood: number;
  lastUpdatedAt: string; // ISO datetime
  baseRecoveryRate: number;
  inventoryBuffs: number; // сумма баффов от декора
}

interface MoodCalculationResult {
  currentMood: number;
  hoursPassed: number;
  moodRecovered: number;
  isBonusActive: boolean; // настроение > 50% дает бонус
}

/**
 * Вычисляет актуальное настроение на клиенте
 * (оптимистичный UI до запроса к серверу)
 */
export function calculateCurrentMood(input: MoodCalculationInput): MoodCalculationResult {
  const { storedMood, lastUpdatedAt, baseRecoveryRate, inventoryBuffs } = input;

  const now = new Date();
  const lastUpdated = new Date(lastUpdatedAt);

  // Разница в часах
  const diffMs = now.getTime() - lastUpdated.getTime();
  const hoursPassed = diffMs / (1000 * 60 * 60);

  // Общее восстановление в час
  const totalRecoveryRate = baseRecoveryRate + inventoryBuffs;

  // Сколько настроения восстановилось
  const moodRecovered = Math.floor(hoursPassed * totalRecoveryRate);

  // Актуальное настроение (не более максимума)
  const currentMood = Math.min(MOOD_MAX, storedMood + moodRecovered);

  return {
    currentMood,
    hoursPassed,
    moodRecovered,
    isBonusActive: currentMood > 50,
  };
}

/**
 * Проверяет, заблокирован ли доступ к урокам
 */
export function isMoodBlocked(mood: number): boolean {
  return mood <= 0;
}

/**
 * Проверяет, активен ли бонус к доходу
 */
export function isMoodBonusActive(mood: number): boolean {
  return mood > 50;
}

/**
 * Возвращает текст блокировки при нулевом настроении
 */
export function getMoodBlockMessage(mood: number): string | null {
  if (mood <= 0) {
    return 'Питомец совсем устал! Восстановите его настроение, чтобы продолжить обучение.';
  }
  if (mood <= 20) {
    return 'Питомец устал. Бонус к доходу не активен.';
  }
  return null;
}
