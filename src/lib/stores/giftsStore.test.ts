// lib/stores/giftsStore.test.ts
// Подарки (решение пользователя 27.09.2026): только за 7 дней подряд и
// скромные — немного монет и, возможно, скрытый коллекционный предмет;
// мебели с бонусами и скинов в подарках нет, дубликатов тоже.

import { Gift, GiftRarity } from '@/types/gifts';
import { SHOP_CATALOG, useShopStore } from '../hooks/useShop';
import { useGiftsStore } from './giftsStore';
import { useUserStore } from './userStore';

function seedUser() {
  useUserStore.getState().setUser({
    id: 'test-profile',
    username: 'Тест',
    liquid_balance: 0,
    created_at: new Date().toISOString(),
    is_demo: false,
  });
}

function pendingGift(rarity: GiftRarity): Gift {
  return {
    id: `gift-${rarity}`,
    mode: 'random',
    source: 'streak_7',
    rarity,
    choiceOptions: null,
    branchId: null,
    isOpened: false,
    obtainedAt: new Date().toISOString(),
  };
}

beforeEach(() => {
  seedUser();
  useShopStore.setState({ ownedItems: {} });
  useGiftsStore.setState({ pendingGifts: [], history: [], totalCoinsFromGifts: 0 });
});

describe('подарок за 7 дней', () => {
  it('обычная редкость — только немного монет, без предметов', () => {
    useGiftsStore.setState({ pendingGifts: [pendingGift('common')] });

    const result = useGiftsStore.getState().openGift('gift-common');

    expect(result?.itemId).toBeNull();
    expect(result?.coins).toBeGreaterThanOrEqual(10);
    expect(result?.coins).toBeLessThanOrEqual(30);
    expect(useShopStore.getState().ownedItems).toEqual({});
  });

  it('предмет, если выпал, — только скрытый коллекционный декор (без бонусов, не скин)', () => {
    for (const rarity of ['rare', 'epic', 'legendary'] as GiftRarity[]) {
      useShopStore.setState({ ownedItems: {} });
      useGiftsStore.setState({ pendingGifts: [pendingGift(rarity)] });

      const result = useGiftsStore.getState().openGift(`gift-${rarity}`);
      const item = SHOP_CATALOG.find((i) => i.id === result?.itemId);

      expect(item).toBeDefined();
      expect(item?.is_hidden).toBe(true);
      expect(item?.category).not.toBe('skin');
      expect(item?.coin_bonus_percent ?? 0).toBe(0);
      expect(item?.energy_max_bonus ?? 0).toBe(0);
      expect(item?.savings_bonus_rate ?? 0).toBe(0);
      expect(result?.coins).toBeLessThanOrEqual(100);
    }
  });

  it('уже собранный предмет не повторяется и не превращается в большие деньги', () => {
    const collectible = SHOP_CATALOG.find((i) => i.is_hidden && i.rarity === 'rare')!;
    useShopStore.setState({ ownedItems: { [collectible.id]: 1 } });
    useGiftsStore.setState({ pendingGifts: [pendingGift('rare')] });

    const result = useGiftsStore.getState().openGift('gift-rare');

    expect(result?.itemId).toBeNull();
    expect(result?.coins).toBeLessThanOrEqual(40);
    expect(useShopStore.getState().ownedItems[collectible.id]).toBe(1);
  });
});
