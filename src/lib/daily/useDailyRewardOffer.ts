// lib/daily/useDailyRewardOffer.ts
// Показывать ли сейчас модалку ежедневной награды (см. domain/daily/DailyReward.ts)
// и что в ней. Ждёт восстановления стора стрика из AsyncStorage — иначе на
// холодном старте lastClaimDate ещё null и окно всплыло бы повторно в тот же
// день. Пересчитывает «сегодня» при возврате приложения из фона (новый день
// мог начаться, пока приложение было свёрнуто).

import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { shouldOfferDailyReward } from '@/domain/daily/DailyReward';
import { dailyRewardForDay, useDailyStore } from '@/lib/hooks/useDaily';
import { useUserStore } from '@/lib/stores/userStore';
import { waitForHydration } from '@/lib/stores/waitForHydration';
import { claimDailyReward, DailyClaimResult } from './claimDailyReward';

export function useDailyRewardOffer(enabled: boolean) {
  const profileCreatedAt = useUserStore((s) => s.user?.created_at);
  const lastClaimDate = useDailyStore((s) => s.lastClaimDate);
  const currentStreak = useDailyStore((s) => s.currentStreak);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let cancelled = false;
    waitForHydration(useDailyStore).then(() => {
      if (cancelled) return;
      // Прерванный стрик сбрасывается до показа — в окне сразу верный день.
      useDailyStore.getState().checkAndUpdateStreak();
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        useDailyStore.getState().checkAndUpdateStreak();
        setNow(new Date());
      }
    });
    return () => subscription.remove();
  }, []);

  const visible =
    enabled && hydrated && shouldOfferDailyReward({ profileCreatedAt, lastClaimDate, now });
  const streakDay = currentStreak + 1;

  return {
    visible,
    streakDay,
    bonus: dailyRewardForDay(streakDay),
    claim: (): DailyClaimResult => claimDailyReward(),
  };
}
