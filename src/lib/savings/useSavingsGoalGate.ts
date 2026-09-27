// lib/savings/useSavingsGoalGate.ts
// Цель накопления должна быть выбрана всегда, пока есть что покупать
// (решение пользователя 28.09.2026). Хук отвечает, нужно ли сейчас просить
// ребёнка выбрать цель: после достигнутой цели, при заходе в приложение без
// цели (закрыл приложение, не выбрав), — и из каких вещей выбирать.
// Показ окна (RequiredGoalPicker) решают экраны: они знают, какие ещё модалки
// у них открыты.

import { useEffect, useMemo, useState } from 'react';

import { SHOP_CATALOG, ShopItem, useShopStore } from '@/lib/hooks/useShop';
import { useSavingsStore } from '@/lib/stores/savingsStore';
import { waitForHydration } from '@/lib/stores/waitForHydration';
import { getAvailableSavingsGoalItems } from './goalOptions';

export interface SavingsGoalGate {
  /** Банк загружен и инвентарь восстановлен — needsGoal можно верить. */
  ready: boolean;
  /** Цели нет, а купить ещё есть что — нужно окно выбора. */
  needsGoal: boolean;
  /** Цели, которые ещё можно купить (не в инвентаре). */
  availableGoals: ShopItem[];
  /** Только что достигнутая цель — окно выбора её поздравляет. */
  completedGoal: ShopItem | null;
  /** Сколько сейчас в банке — пойдёт на новую цель. */
  saved: number;
}

export function useSavingsGoalGate(): SavingsGoalGate {
  const savings = useSavingsStore((s) => s.savings);
  const savingsLoading = useSavingsStore((s) => s.isLoading);
  const lastCompletedGoalId = useSavingsStore((s) => s.lastCompletedGoalId);
  const ownedItems = useShopStore((s) => s.ownedItems);

  // Инвентарь восстанавливается из AsyncStorage асинхронно: до этого
  // ownedItems пуст и купленные вещи выглядели бы доступными целями.
  const [shopHydrated, setShopHydrated] = useState(() => useShopStore.persist.hasHydrated());
  useEffect(() => {
    if (shopHydrated) return;
    let cancelled = false;
    waitForHydration(useShopStore).then(() => {
      if (!cancelled) setShopHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [shopHydrated]);

  const availableGoals = useMemo(() => getAvailableSavingsGoalItems(ownedItems), [ownedItems]);
  const completedGoal = useMemo(
    () =>
      lastCompletedGoalId !== null
        ? (SHOP_CATALOG.find((item) => item.id === lastCompletedGoalId) ?? null)
        : null,
    [lastCompletedGoalId]
  );

  const ready = shopHydrated && !savingsLoading;
  const needsGoal =
    ready && savings !== null && savings.targetItemId === null && availableGoals.length > 0;

  return {
    ready,
    needsGoal,
    availableGoals,
    completedGoal,
    saved: savings?.currentAmount ?? 0,
  };
}
