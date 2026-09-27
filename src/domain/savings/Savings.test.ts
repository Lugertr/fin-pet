// domain/savings/Savings.test.ts
// CLAUDE.md: «накопления: ... прогресс к цели» — часть покрытия (бонус за
// пополнение); перевод/снятие/невозможность уйти в минус — интеграционные
// тесты стора, см. lib/stores/savingsStore.test.ts.

import { computeDepositBonus, goalCompletionBonus } from './Savings';

describe('computeDepositBonus (§11.4 — бонус только за новые деньги)', () => {
  it('считает целочисленный процент от суммы пополнения', () => {
    expect(computeDepositBonus(1000, 0, 1)).toEqual({ bonus: 10, creditLeft: 0 });
  });

  it('округляет вниз (никаких дробных монет на балансе)', () => {
    expect(computeDepositBonus(999, 0, 1).bonus).toBe(9); // 9.99 -> 9
  });

  it('не зависит от уже накопленной суммы — пополнения по 1 монете ничего не дают', () => {
    expect(computeDepositBonus(1, 0, 1).bonus).toBe(0);
  });

  it('возврат снятых монет бонуса не даёт (закрыт цикл «снял — положил»)', () => {
    expect(computeDepositBonus(300, 300, 1)).toEqual({ bonus: 0, creditLeft: 0 });
  });

  it('бонус только на часть сверх ранее снятого', () => {
    // 500 пополнение, из них 300 — возврат снятого, 200 — новые деньги
    expect(computeDepositBonus(500, 300, 1)).toEqual({ bonus: 2, creditLeft: 0 });
    // пополнение меньше снятого — остаток «долга» сохраняется
    expect(computeDepositBonus(100, 300, 1)).toEqual({ bonus: 0, creditLeft: 200 });
  });

  it('растёт вместе со ставкой бонуса (эффект копилки)', () => {
    const base = computeDepositBonus(1000, 0, 1).bonus;
    const withPiggybank = computeDepositBonus(1000, 0, 1 + 2).bonus; // +2 от купленной копилки
    expect(withPiggybank).toBeGreaterThan(base);
  });
});

describe('goalCompletionBonus (§11.5 — +10% цены цели)', () => {
  it('10% цены целым числом, округление вниз', () => {
    expect(goalCompletionBonus(500)).toBe(50);
    expect(goalCompletionBonus(1255)).toBe(125); // 125.5 -> 125
    expect(goalCompletionBonus(9)).toBe(0);
  });
});
