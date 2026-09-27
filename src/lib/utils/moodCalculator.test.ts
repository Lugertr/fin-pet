// lib/utils/moodCalculator.test.ts
// CLAUDE.md: «восстановление энергии по времени» (§6.3).

import { calculateCurrentMood, canAffordEnergy, isPetHungry } from './moodCalculator';

describe('calculateCurrentMood (восстановление энергии по времени)', () => {
  it('восстанавливает энергию пропорционально прошедшим часам и базовой скорости', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const result = calculateCurrentMood({
      storedMood: 50,
      lastUpdatedAt: twoHoursAgo,
      baseRecoveryRate: 12.5,
      inventoryBuffs: 0,
    });
    // 2ч * 12.5/ч = 25 -> 50 + 25 = 75
    expect(result.currentMood).toBe(75);
    expect(result.hoursPassed).toBeCloseTo(2, 1);
  });

  it('не восстанавливает энергию выше 100 без бонуса от декора', () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const result = calculateCurrentMood({
      storedMood: 90,
      lastUpdatedAt: oneDayAgo,
      baseRecoveryRate: 12.5,
      inventoryBuffs: 0,
    });
    expect(result.currentMood).toBe(100);
  });

  it('декор поднимает потолок восстановления выше 100 (§6.1 maxBonus)', () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const result = calculateCurrentMood({
      storedMood: 90,
      lastUpdatedAt: oneDayAgo,
      baseRecoveryRate: 12.5,
      inventoryBuffs: 0,
      maxBonus: 20,
    });
    expect(result.currentMood).toBe(120);
  });

  it('инвентарные баффы ускоряют восстановление', () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const withoutBuff = calculateCurrentMood({
      storedMood: 0,
      lastUpdatedAt: oneHourAgo,
      baseRecoveryRate: 12.5,
      inventoryBuffs: 0,
    });
    const withBuff = calculateCurrentMood({
      storedMood: 0,
      lastUpdatedAt: oneHourAgo,
      baseRecoveryRate: 12.5,
      inventoryBuffs: 10,
    });
    expect(withBuff.currentMood).toBeGreaterThan(withoutBuff.currentMood);
  });

  it('не уходит в отрицательные значения при рассинхронизации часов (lastUpdatedAt в будущем)', () => {
    const inFuture = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const result = calculateCurrentMood({
      storedMood: 10,
      lastUpdatedAt: inFuture,
      baseRecoveryRate: 12.5,
      inventoryBuffs: 0,
    });
    expect(result.currentMood).toBeGreaterThanOrEqual(0);
  });
});

describe('isPetHungry / canAffordEnergy', () => {
  it('питомец «голодный» при энергии ниже 30, но это не блокировка', () => {
    expect(isPetHungry(29)).toBe(true);
    expect(isPetHungry(30)).toBe(false);
  });

  it('canAffordEnergy разрешает действие только при достаточной энергии', () => {
    expect(canAffordEnergy(10, 10)).toBe(true);
    expect(canAffordEnergy(9, 10)).toBe(false);
  });
});
