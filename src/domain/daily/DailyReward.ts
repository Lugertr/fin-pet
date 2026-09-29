// domain/daily/DailyReward.ts
// Ежедневная награда (решение пользователя 27.09.2026): не карточка в профиле,
// а модальное окно при первом за день заходе в игру. В самый первый день игры
// не показывается — в этот день ребёнок получает стартовый капитал за
// создание персонажа.

import { differenceInCalendarDays, isSameDay, subDays } from 'date-fns';

export function shouldOfferDailyReward({
  profileCreatedAt,
  lastClaimDate,
  now,
}: {
  profileCreatedAt: string | null | undefined;
  lastClaimDate: string | null;
  now: Date;
}): boolean {
  // Профиль ещё не загружен — ничего не предлагаем, чтобы не показать окно
  // до того, как известно, первый ли это день.
  if (!profileCreatedAt) return false;
  if (isSameDay(new Date(profileCreatedAt), now)) return false;
  if (lastClaimDate && isSameDay(new Date(lastClaimDate), now)) return false;
  return true;
}

/** «Дней с Финни» — календарные дни с создания профиля, включая первый (в день создания — 1). */
export function daysWithFinni(profileCreatedAt: string | null | undefined, now: Date): number {
  if (!profileCreatedAt) return 1;
  return Math.max(1, differenceInCalendarDays(now, new Date(profileCreatedAt)) + 1);
}

/** Та же отметка времени сутками раньше — «Пропустить день» в демо (lib/daily/skipDemoDay). */
export function dayEarlier(iso: string): string {
  return subDays(new Date(iso), 1).toISOString();
}
