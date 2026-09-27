// lib/adventure/useAdventureCountdown.ts
// Живой отсчёт оставшегося времени активного приключения — тикает раз в 30с
// (этого достаточно для отображаемой точности в минутах), пока приключение
// действительно активно; если его нет или оно ещё планируется/уже завершено —
// не тикает вообще. Общий хук для AdventureActiveView и хаба (автозавершение).
//
// §18.2 демо-режим: «приключения переключаются без ожидания» — восьмичасовой
// таймер активной фазы не подходит для демонстрации/проверки, поэтому в
// демо-профиле (тот же is_demo, что уже используется в isLessonAvailable)
// приключение считается готовым к завершению сразу, независимо от реального
// прошедшего времени. Остальная механика (задания, события) не меняется —
// демо просто снимает единственную блокировку, которая требует ожидания.

import { adventureProgressRatio, isTimeUp, remainingMs } from '@/domain/adventure/Adventure';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useAdventureStore } from '../stores/adventureStore';
import { useUserStore } from '../stores/userStore';

const TICK_MS = 30_000;

export function useAdventureCountdown() {
  const currentAdventure = useAdventureStore((s) => s.currentAdventure);
  const isDemo = useUserStore((s) => s.user?.is_demo ?? false);
  const isActive = currentAdventure?.status === 'active';
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => setNow(Date.now()), TICK_MS);
    // Пока приложение было в фоне, интервал не тикал — при возврате сразу
    // пересчитываем, а не ждём до 30с (иначе и таймер, и автозавершение
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
    timeUp: isDemo || isTimeUp(currentAdventure, now),
    /** Время вышло по реальным часам (без демо-послабления timeUp) — триггер
     * автозавершения (adventureStore.completeIfExpired): в демо приключение не
     * должно закрываться само сразу после старта. */
    expired: isTimeUp(currentAdventure, now),
    /** Доля пройденного времени (0..1) — та же величина, что определяет
     * пропорциональную награду при досрочном завершении (см.
     * adventureStore.completeAdventure); тут переиспользуется для визуализации
     * прогресс-бара, посчитана от того же «живого» now, что и remaining. */
    progressRatio: adventureProgressRatio(currentAdventure, now),
  };
}
