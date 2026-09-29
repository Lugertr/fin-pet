// lib/daily/skipDemoDay.ts
// Демо-режим: «Пропустить день» на хабе (решение пользователя 29.09.2026) —
// проверить ежедневную награду, не дожидаясь завтра. Для ежедневной награды
// проходят сутки: дата создания профиля и дата последней награды сдвигаются
// на день назад. Окно награды появляется сразу (в день создания профиля его
// нет), стрик продолжается — семь пропусков с наградой дают подарок за неделю;
// пропуск без награды, как и настоящий, стрик прерывает. «Дней с Финни»
// растёт вместе с датой создания. Энергия, смена и остальное идут по
// настоящим часам.

import { getProfileRepository } from '@/data/local/repositories';
import { dayEarlier } from '@/domain/daily/DailyReward';
import { useDailyStore } from '@/lib/hooks/useDaily';
import { useUserStore } from '@/lib/stores/userStore';

/** false — не демо-профиль или профиль не загружен (ничего не менялось). */
export async function skipDemoDay(): Promise<boolean> {
  const user = useUserStore.getState().user;
  if (!user?.is_demo || !user.created_at) return false;

  const createdAt = dayEarlier(user.created_at);
  await getProfileRepository().setCreatedAt(user.id, createdAt);
  useUserStore.getState().setUser({ ...user, created_at: createdAt });

  const { lastClaimDate } = useDailyStore.getState();
  if (lastClaimDate) useDailyStore.setState({ lastClaimDate: dayEarlier(lastClaimDate) });
  // Пропущенный без награды день прерывает стрик — окно покажет верный день.
  useDailyStore.getState().checkAndUpdateStreak();
  return true;
}
