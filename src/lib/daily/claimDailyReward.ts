// lib/daily/claimDailyReward.ts
// Забрать ежедневную награду со всеми последствиями — вынесено из профиля
// (раньше карточка «Ежедневная награда» жила там) для модалки на хабе:
// стрик + монеты в кошелёк (леджер) + подарок за каждые 7 дней стрика (§14.1).

import { useDailyStore } from '@/lib/hooks/useDaily';
import { useGiftsStore } from '@/lib/stores/giftsStore';
import { useUserStore } from '@/lib/stores/userStore';

export interface DailyClaimResult {
  success: boolean;
  bonus: number;
  newStreak: number;
  giftGranted: boolean;
}

export function claimDailyReward(): DailyClaimResult {
  const result = useDailyStore.getState().claimDailyBonus();
  if (!result.success) return { ...result, giftGranted: false };

  useUserStore
    .getState()
    .recordTransaction(result.bonus, 'daily_bonus', `Стрик, день ${result.newStreak}`);

  const giftGranted = result.newStreak % 7 === 0;
  if (giftGranted) {
    useGiftsStore
      .getState()
      .addRandomGift('streak_7', null, `${result.newStreak} дней подряд с Финни`);
  }

  return { ...result, giftGranted };
}
