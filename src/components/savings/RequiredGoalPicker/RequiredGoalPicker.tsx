// src/components/savings/RequiredGoalPicker/RequiredGoalPicker.tsx
// Обязательный выбор цели накопления (решение пользователя 28.09.2026): пока
// есть что покупать, цель выбрана всегда. Окно всплывает, когда цели нет —
// после достигнутой цели (с поздравлением) и при заходе в приложение, если
// в прошлый раз ребёнок закрыл приложение, не выбрав. Закрыть можно только
// выбором. Когда показывать (visible), решает экран: он знает о своих модалках
// (итоги приключения, ежедневная награда, алерты), чтобы окна шли по очереди.

import { GoalPickerModal } from '../GoalPickerModal';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { ShopItem } from '@/lib/hooks/useShop';
import type { SavingsGoalGate } from '@/lib/savings/useSavingsGoalGate';
import { useSavingsStore } from '@/lib/stores/savingsStore';

export function RequiredGoalPicker({
  gate,
  visible,
}: {
  gate: SavingsGoalGate;
  /** Экран свободен от других окон; остальное (нужна ли цель) — в gate. */
  visible: boolean;
}) {
  const { triggerHaptic } = useFeedback();
  const setTarget = useSavingsStore((s) => s.setTarget);
  const clearCompletedGoal = useSavingsStore((s) => s.clearCompletedGoal);

  const handlePick = (item: ShopItem) => {
    triggerHaptic('selection');
    // Сначала убираем поздравление: если на новую цель уже накоплено,
    // setTarget купит её сразу и окно поздравит уже с ней.
    clearCompletedGoal();
    void setTarget(item.id);
  };

  return (
    <GoalPickerModal
      visible={visible && gate.needsGoal}
      goals={gate.availableGoals}
      onPick={handlePick}
      required
      completedItem={gate.completedGoal}
      saved={gate.saved}
    />
  );
}
