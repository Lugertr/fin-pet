// src/lib/stores/giftsStore.ts
// Подарки (§14 ТЗ). Решение пользователя 27.09.2026: подарок дают только за
// 7 дней подряд с Финни (claimDailyReward), и он скромный — немного монет и,
// если повезёт, скрытый коллекционный предмет (декор без бонусов, только из
// подарков). Мебели с бонусами и скинов в подарках нет: улучшения копятся в
// банке, облик питомца приходит с уровнем.
// guaranteed_choice-подарки больше не выдаются; chooseFromGift оставлен, чтобы
// открыть такие подарки, выданные до изменения и ещё лежащие в сохранении.

import { Gift, GiftRarity, GiftSource, rollCoinsForRarity, rollRarity } from '@/types/gifts';
import { equipSkin } from '@/lib/pet/petSkin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ShopItem, SHOP_CATALOG, useShopStore } from '../hooks/useShop';
import { useUserStore } from './userStore';

export type { Gift, GiftMode, GiftSource } from '@/types/gifts';

/** Результат раскрытия подарка — то, что реально показать игроку. */
export interface GiftRevealResult {
  /** null — в подарке только монеты (коллекционный предмет не выпал). */
  itemId: number | null;
  itemName: string;
  itemIcon: string;
  coins: number;
  rarity: GiftRarity | null; // null для guaranteed_choice
}

export interface GiftHistoryEntry {
  giftId: string;
  source: GiftSource;
  branchId: number | null;
  themeName?: string;
  sourceNodeId?: string | null;
  rarity: GiftRarity | null;
  itemIcon: string;
  itemName: string;
  itemId: number | null;
  coins: number;
  openedAt: string;
}

/** Подарок без предмета — только монеты. */
const COINS_ONLY = { itemName: 'Монеты', itemIcon: '🪙' };

function getOwnedItemIds(): Set<number> {
  const { ownedItems } = useShopStore.getState();
  return new Set(
    Object.keys(ownedItems)
      .map(Number)
      .filter((id) => ownedItems[id] > 0)
  );
}

/**
 * Коллекционный предмет выпавшей редкости — только скрытый декор (is_hidden:
 * есть лишь в подарках, без бонусов, §15.2 «Коллекционер»), ещё не собранный.
 * null — в подарке только монеты: для этой редкости скрытого предмета нет
 * или он уже собран (дубликатов и их обмена на монеты больше нет).
 */
function pickCollectible(rarity: GiftRarity, ownedIds: Set<number>): ShopItem | null {
  const candidates = SHOP_CATALOG.filter(
    (i) => i.is_hidden && i.rarity === rarity && !ownedIds.has(i.id)
  );
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

interface GiftsState {
  pendingGifts: Gift[];
  history: GiftHistoryEntry[];
  totalCoinsFromGifts: number;

  /** Единственный источник — streak_7 (7 дней подряд, см. lib/daily/claimDailyReward). */
  addRandomGift: (source: GiftSource, branchId?: number | null, themeName?: string) => Gift;
  /** Раскрывает random-подарок (рулетка редкости уже сделана при создании). */
  openGift: (giftId: string) => GiftRevealResult | null;
  /** Фиксирует выбор игрока в guaranteed_choice-подарке. */
  chooseFromGift: (giftId: string, chosenItemId: number) => GiftRevealResult | null;
  clearAll: () => void;
}

export const useGiftsStore = create<GiftsState>()(
  persist(
    (set, get) => ({
      pendingGifts: [],
      history: [],
      totalCoinsFromGifts: 0,

      addRandomGift: (source, branchId = null, themeName) => {
        const rarity = rollRarity();
        const newGift: Gift = {
          id: uuidv4(),
          mode: 'random',
          source,
          rarity,
          choiceOptions: null,
          branchId,
          themeName,
          isOpened: false,
          obtainedAt: new Date().toISOString(),
        };
        set((state) => ({ pendingGifts: [...state.pendingGifts, newGift] }));
        return newGift;
      },

      openGift: (giftId) => {
        const gift = get().pendingGifts.find((g) => g.id === giftId && !g.isOpened);
        if (!gift || gift.mode !== 'random' || !gift.rarity) return null;

        // Скромный подарок: немного монет (§14.2) и, если повезёт, ещё не
        // собранный коллекционный предмет. Без дубликатов и обмена их на монеты.
        const rolled = pickCollectible(gift.rarity, getOwnedItemIds());
        const coins = rollCoinsForRarity(gift.rarity);
        if (rolled) useShopStore.getState().addItem(rolled.id);

        const shown = rolled
          ? { itemName: rolled.name, itemIcon: rolled.icon, itemId: rolled.id }
          : { ...COINS_ONLY, itemId: null };
        useUserStore
          .getState()
          .recordTransaction(coins, 'gift_reward', `Подарок за 7 дней: ${shown.itemName}`);

        const historyEntry: GiftHistoryEntry = {
          giftId: gift.id,
          source: gift.source,
          branchId: gift.branchId,
          themeName: gift.themeName,
          sourceNodeId: gift.sourceNodeId,
          rarity: gift.rarity,
          itemIcon: shown.itemIcon,
          itemName: shown.itemName,
          itemId: shown.itemId,
          coins,
          openedAt: new Date().toISOString(),
        };

        set((state) => ({
          pendingGifts: state.pendingGifts.filter((g) => g.id !== giftId),
          history: [historyEntry, ...state.history],
          totalCoinsFromGifts: state.totalCoinsFromGifts + coins,
        }));

        return { ...shown, coins, rarity: gift.rarity };
      },

      chooseFromGift: (giftId, chosenItemId) => {
        const gift = get().pendingGifts.find((g) => g.id === giftId && !g.isOpened);
        if (!gift || gift.mode !== 'guaranteed_choice' || !gift.choiceOptions) return null;
        if (!gift.choiceOptions.includes(chosenItemId)) return null;

        const chosenItem = SHOP_CATALOG.find((i) => i.id === chosenItemId);
        if (!chosenItem) return null;

        // Дубликат — скромные монеты, а не половина цены (цены выросли в 5 раз).
        const isDuplicate = getOwnedItemIds().has(chosenItemId);
        const coins = isDuplicate ? rollCoinsForRarity('common') : 0;

        if (!isDuplicate) {
          useShopStore.getState().addItem(chosenItem.id);
          if (chosenItem.category === 'skin') void equipSkin(chosenItem);
        }
        if (coins > 0) {
          useUserStore
            .getState()
            .recordTransaction(coins, 'gift_reward', `Подарок (дубликат): ${chosenItem.name}`);
        }

        const historyEntry: GiftHistoryEntry = {
          giftId: gift.id,
          source: gift.source,
          branchId: gift.branchId,
          themeName: gift.themeName,
          sourceNodeId: gift.sourceNodeId,
          rarity: null,
          itemIcon: chosenItem.icon,
          itemName: chosenItem.name,
          itemId: chosenItem.id,
          coins,
          openedAt: new Date().toISOString(),
        };

        set((state) => ({
          pendingGifts: state.pendingGifts.filter((g) => g.id !== giftId),
          history: [historyEntry, ...state.history],
          totalCoinsFromGifts: state.totalCoinsFromGifts + coins,
        }));

        return {
          itemId: chosenItem.id,
          itemName: chosenItem.name,
          itemIcon: chosenItem.icon,
          coins,
          rarity: null,
        };
      },

      clearAll: () => {
        set({ pendingGifts: [], history: [], totalCoinsFromGifts: 0 });
      },
    }),
    {
      name: 'finsputnik-gifts-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function useGifts() {
  return useGiftsStore();
}
