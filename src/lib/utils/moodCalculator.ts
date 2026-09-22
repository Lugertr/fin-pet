// lib/utils/moodCalculator.ts
// Клиентский предикт настроения для оптимистичного UI

import { MOOD_MAX } from '@/constants/gameplay';

interface MoodCalculationInput {
  storedMood: number;
  lastUpdatedAt: string; // ISO datetime
  baseRecoveryRate: number;
  inventoryBuffs: number; // сумма баффов к скорости восстановления от декора
  /** §6.1 — до +50 к максимуму от декора. Пока нет предметов с этим эффектом (Этап 5), передавайте 0. */
  maxBonus?: number;
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
  const { storedMood, lastUpdatedAt, baseRecoveryRate, inventoryBuffs, maxBonus = 0 } = input;

  const now = new Date();
  const lastUpdated = new Date(lastUpdatedAt);

  // Разница в часах
  const diffMs = now.getTime() - lastUpdated.getTime();
  const hoursPassed = diffMs / (1000 * 60 * 60);

  // Общее восстановление в час
  const totalRecoveryRate = baseRecoveryRate + inventoryBuffs;

  // Сколько настроения восстановилось
  const moodRecovered = Math.floor(hoursPassed * totalRecoveryRate);

  // §6.3: min(100 + decor_max_bonus, stored + hours * rate); нижняя граница —
  // защита от рассинхронизации часов устройства (lastUpdatedAt в будущем
  // даёт отрицательные hoursPassed/moodRecovered без этого клэмпа)
  const currentMood = Math.max(0, Math.min(MOOD_MAX + maxBonus, storedMood + moodRecovered));

  return {
    currentMood,
    hoursPassed,
    moodRecovered,
    isBonusActive: currentMood > 50,
  };
}

/**
 * §6.4: при энергии < 30 питомец «голодный» — это подсказка, а не блокировка.
 * Уроки/бюджет/покупки/накопления/переход периода низкой энергией НЕ блокируются —
 * блокируются только Аркада и ИИ-помощник, каждый по своей стоимости (§6.2).
 */
export function isPetHungry(mood: number): boolean {
  return mood < 30;
}

/** Может ли питомец позволить себе действие, которое стоит `cost` энергии (§6.2: только Аркада и ИИ). */
export function canAffordEnergy(mood: number, cost: number): boolean {
  return mood >= cost;
}
