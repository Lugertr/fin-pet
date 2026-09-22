// src/lib/stores/giftsStore.ts
// Подарки (§14 ТЗ): guaranteed_choice (выбор 1 из 2-3) и random (по таблице
// редкости §14.2), оба берут предметы из настоящего каталога SHOP_CATALOG.

import { Gift, GiftRarity, GiftSource, rollCoinsForRarity, rollRarity } from '@/types/gifts';
import { itemMatchesPetType } from '@/lib/utils/itemCategories';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ShopItem, SHOP_CATALOG, useShopStore } from '../hooks/useShop';
import { usePreferencesStore } from './preferencesStore';
import { useUserStore } from './userStore';

export type { Gift, GiftMode, GiftSource } from '@/types/gifts';

/** Результат раскрытия подарка — то, что реально показать игроку. */
export interface GiftRevealResult {
  itemId: number;
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
  itemId: number;
  coins: number;
  openedAt: string;
}

function getOwnedItemIds(): Set<number> {
  const { ownedItems } = useShopStore.getState();
  return new Set(
    Object.keys(ownedItems)
      .map(Number)
      .filter((id) => ownedItems[id] > 0)
  );
}

/**
 * §14.2: предмет нужной редкости из каталога; предпочитает ещё не купленные.
 * Скрытые предметы (§15.2 «Коллекционер») участвуют в розыгрыше наравне с
 * обычными, но не дублируются (§14.3) — если все скрытые этой редкости уже
 * собраны, откатываемся на обычные (дублируемые) предметы той же редкости.
 * Стартовые предметы (is_starter) никогда не разыгрываются — они и так
 * гарантированно есть у игрока с первого дня и ничего не стоят (§12.5), в
 * подарок как приз они бы пришли бесполезным дублем. Скины чужого вида
 * питомца (pet_type) тоже исключены — владельцу кота не должен выпасть скин
 * дракона (см. itemMatchesPetType).
 */
function pickItemForRarity(rarity: GiftRarity, ownedIds: Set<number>): ShopItem | null {
  const petType = usePreferencesStore.getState().petType;
  const candidates = SHOP_CATALOG.filter(
    (i) => i.rarity === rarity && !i.is_starter && itemMatchesPetType(i, petType)
  );
  if (candidates.length === 0) return null;
  const fresh = candidates.filter((i) => !ownedIds.has(i.id));
  if (fresh.length > 0) return fresh[Math.floor(Math.random() * fresh.length)];

  const duplicable = candidates.filter((i) => !i.is_hidden);
  const pool = duplicable.length > 0 ? duplicable : candidates;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** N случайных различных предметов каталога — варианты для guaranteed_choice. */
function pickChoiceOptions(count: number, ownedIds: Set<number>): number[] {
  const petType = usePreferencesStore.getState().petType;
  const eligible = SHOP_CATALOG.filter(
    (i) => !i.is_hidden && !i.is_starter && itemMatchesPetType(i, petType)
  );
  const fresh = eligible.filter((i) => !ownedIds.has(i.id));
  const pool = fresh.length >= count ? fresh : eligible;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((i) => i.id);
}

interface GiftsState {
  pendingGifts: Gift[];
  history: GiftHistoryEntry[];
  totalCoinsFromGifts: number;

  /** §14.1 случайные источники: branch_complete, streak_7, achievement, random_event. */
  addRandomGift: (
    source: GiftSource,
    branchId?: number | null,
    themeName?: string,
    sourceNodeId?: string
  ) => Gift;
  /** §14.1 гарантированные источники: level_complete (1 из 2-3), savings_hold (1 из 2), path_node. */
  addGuaranteedChoiceGift: (
    source: GiftSource,
    optionsCount: number,
    branchId?: number | null,
    themeName?: string,
    sourceNodeId?: string
  ) => Gift;
  hasUnopenedGiftForBranch: (branchId: number) => boolean;
  /** Подарок узла дорожки уроков уже открыт (проверяет history по sourceNodeId).
   * Ещё не открытый, но уже выданный подарок для узла ищите в pendingGifts
   * напрямую (state уже публичный) — не дублируем это отдельным методом. */
  hasClaimedNode: (nodeId: string) => boolean;
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

      addRandomGift: (source, branchId = null, themeName, sourceNodeId) => {
        const rarity = rollRarity();
        const newGift: Gift = {
          id: uuidv4(),
          mode: 'random',
          source,
          rarity,
          choiceOptions: null,
          branchId,
          themeName,
          sourceNodeId,
          isOpened: false,
          obtainedAt: new Date().toISOString(),
        };
        set((state) => ({ pendingGifts: [...state.pendingGifts, newGift] }));
        return newGift;
      },

      addGuaranteedChoiceGift: (source, optionsCount, branchId = null, themeName, sourceNodeId) => {
        const choiceOptions = pickChoiceOptions(optionsCount, getOwnedItemIds());
        const newGift: Gift = {
          id: uuidv4(),
          mode: 'guaranteed_choice',
          source,
          rarity: null,
          choiceOptions,
          branchId,
          themeName,
          sourceNodeId,
          isOpened: false,
          obtainedAt: new Date().toISOString(),
        };
        set((state) => ({ pendingGifts: [...state.pendingGifts, newGift] }));
        return newGift;
      },

      hasUnopenedGiftForBranch: (branchId) => {
        return get().pendingGifts.some((g) => g.branchId === branchId && !g.isOpened);
      },

      hasClaimedNode: (nodeId) => {
        return get().history.some((entry) => entry.sourceNodeId === nodeId);
      },

      openGift: (giftId) => {
        const gift = get().pendingGifts.find((g) => g.id === giftId && !g.isOpened);
        if (!gift || gift.mode !== 'random' || !gift.rarity) return null;

        const ownedIds = getOwnedItemIds();
        const rolled = pickItemForRarity(gift.rarity, ownedIds);
        if (!rolled) {
          console.warn('[Gifts] В каталоге нет предметов редкости:', gift.rarity);
          return null;
        }

        // §14.3: обычный дубликат -> доп. монеты вместо повторного предмета
        const isDuplicate = ownedIds.has(rolled.id);
        const baseCoins = rollCoinsForRarity(gift.rarity);
        const coins = isDuplicate ? baseCoins + Math.floor(rolled.price / 2) : baseCoins;

        if (!isDuplicate) {
          useShopStore.getState().addItem(rolled.id);
        }

        useUserStore.getState().recordTransaction(coins, 'gift_reward', `Подарок: ${rolled.name}`);

        const historyEntry: GiftHistoryEntry = {
          giftId: gift.id,
          source: gift.source,
          branchId: gift.branchId,
          themeName: gift.themeName,
          sourceNodeId: gift.sourceNodeId,
          rarity: gift.rarity,
          itemIcon: rolled.icon,
          itemName: rolled.name,
          itemId: rolled.id,
          coins,
          openedAt: new Date().toISOString(),
        };

        set((state) => ({
          pendingGifts: state.pendingGifts.filter((g) => g.id !== giftId),
          history: [historyEntry, ...state.history],
          totalCoinsFromGifts: state.totalCoinsFromGifts + coins,
        }));

        return {
          itemId: rolled.id,
          itemName: rolled.name,
          itemIcon: rolled.icon,
          coins,
          rarity: gift.rarity,
        };
      },

      chooseFromGift: (giftId, chosenItemId) => {
        const gift = get().pendingGifts.find((g) => g.id === giftId && !g.isOpened);
        if (!gift || gift.mode !== 'guaranteed_choice' || !gift.choiceOptions) return null;
        if (!gift.choiceOptions.includes(chosenItemId)) return null;

        const chosenItem = SHOP_CATALOG.find((i) => i.id === chosenItemId);
        if (!chosenItem) return null;

        // Гарантированный выбор не удваивает предметы — дубликат тоже конвертируется в монеты (§14.3)
        const isDuplicate = getOwnedItemIds().has(chosenItemId);
        const coins = isDuplicate ? Math.floor(chosenItem.price / 2) : 0;

        if (!isDuplicate) {
          useShopStore.getState().addItem(chosenItem.id);
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
