// lib/adventure/useAdventureCountdown.ts
// Живой отсчёт до конца смены (24 часа от старта) — тикает раз в 30с (для
// точности в минутах этого достаточно), пока смена действительно активна;
// если её нет или она ещё планируется/уже завершена — не тикает вообще.
// Общий хук для экрана смены (AdventureActiveView) и хаба (автозавершение).

import { isTimeUp, remainingMs } from '@/domain/adventure/Adventure';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useAdventureStore } from '../stores/adventureStore';

const TICK_MS = 30_000;

export function useAdventureCountdown() {
  const currentAdventure = useAdventureStore((s) => s.currentAdventure);
  const isActive = currentAdventure?.status === 'active';
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => setNow(Date.now()), TICK_MS);
    // Пока приложение было в фоне, интервал не тикал — при возврате сразу
    // пересчитываем, а не ждём до 30с (иначе и отсчёт, и автозавершение
    // по истечении времени заметно запаздывали бы).
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(Date.now());
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [isActive]);

  if (!currentAdventure || !isActive) {
    return { active: false as const, adventure: null };
  }

  return {
    active: true as const,
    adventure: currentAdventure,
    remaining: remainingMs(currentAdventure, now),
    /** 24 часа смены вышли — триггер автозавершения (adventureStore.completeIfExpired). */
    expired: isTimeUp(currentAdventure, now),
  };
}
