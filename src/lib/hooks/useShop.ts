// lib/hooks/useShop.ts
// Хук для управления магазином, инвентарём, размещением по слотам и продажей (§12, §13 ТЗ)

import { getLocalContentRepository } from '@/data/content';
import { ItemContent } from '@/domain/content/ItemContent';
import { getSlotsForCategory } from '@/domain/room/RoomSlot';
import { useAchievementsStore } from '@/lib/stores/achievementsStore';
import { usePeriodStore } from '@/lib/stores/periodStore';
import { usePetStore } from '@/lib/stores/petStore';
import { useUserStore } from '@/lib/stores/userStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Форма товара — из content/items.json (§25 ТЗ), не отсюда.
export type ShopItem = ItemContent;

export const SHOP_CATALOG: ShopItem[] = getLocalContentRepository().getItemsSync();

/** 6 фиксированных мест в комнате питомца (см. PetRoom.tsx) — на каждом
 * всегда что-то стоит, начиная со стартового предмета этой же категории.
 * room — это скин самой комнаты (фон + расстановка предметов), а не отдельный
 * видимый объект, но подчиняется той же механике «всегда что-то экипировано». */
export const FURNITURE_CATEGORIES = [
  'laptop',
  'piggybank',
  'bed',
  'carpet',
  'window',
  'room',
] as const;
export type FurnitureCategory = (typeof FURNITURE_CATEGORIES)[number];

/** Стартовые предметы (is_starter) — выдаются один раз при онбординге
 * (см. onboarding.tsx) и перевыдаются при «Сбросе профиля» (см. profileReset.ts),
 * чтобы в каждой из категорий FURNITURE_CATEGORIES всегда было хоть что-то. */
export const STARTER_FURNITURE_ITEM_IDS: number[] = SHOP_CATALOG.filter(
  (item) => item.is_starter
).map((item) => item.id);

interface ShopActionResult {
  success: boolean;
  message: string;
}

interface ShopState {
  ownedItems: { [itemId: number]: number }; // itemId -> quantity
  /** §13.1/§13.3: slot -> itemId. 1 предмет на слот, слоты фиксированы (1-6). */
  placedDecor: { [slot: number]: number };
  /** Что сейчас стоит в комнате по каждой из 5 фиксированных категорий мебели
   * (category -> itemId). В отличие от placedDecor — не про слоты, всегда
   * ровно 1 запись на категорию, никогда не пусто после онбординга. */
  equippedFurniture: { [category: string]: number };

  // Actions
  purchaseItem: (itemId: number, quantity?: number) => ShopActionResult;
  /** §12.4 — продажа купленного декора/еды/скинов за 50% цены. Базовые и скрытые (is_hidden) предметы не продаются. */
  sellItem: (itemId: number, quantity?: number) => ShopActionResult;
  /** Пополнение инвентаря без оплаты — источник для подарков (§14) и стартовой мебели. */
  addItem: (itemId: number, quantity?: number) => void;
  /** §12.2 — еда даёт мгновенную энергию при использовании. */
  consumeItem: (itemId: number) => ShopActionResult;
  /** Размещает декор в подходящий слот по slot_category (§13.1); если все слоты этой категории заняты — заменяет первый. */
  placeDecor: (itemId: number) => ShopActionResult;
  removeDecor: (itemId: number) => void;
  /** Ставит купленный предмет мебели в комнату — заменяет то, что сейчас стоит
   * в этой же категории (лаптоп/диван/копилка/окно/ковёр). */
  equipFurniture: (itemId: number) => ShopActionResult;
  getOwnedItems: () => (ShopItem & { quantity: number })[];
  /** Размещённый декор со слотом — для UI (позиция в комнате). */
  getPlacedDecor: () => (ShopItem & { slot: number })[];
  /** Сумма energy_recovery_bonus размещённого декора + экипированной мебели (§12.2 «уют/освещение»). */
  getTotalEnergyRecoveryBonus: () => number;
  /** Сумма energy_max_bonus размещённого декора + экипированной мебели (§12.2 «мебель/растения», §6.1). */
  getTotalEnergyMaxBonus: () => number;
  /** coin_bonus_percent: декор считается только размещённым, остальные категории (ноутбук) — по факту владения. */
  getTotalCoinBonusPercent: () => number;
  /** Сумма ai_cost_reduction по всем купленным предметам (§16.2 «облако»). */
  getAiCostReduction: () => number;
  /** Сумма savings_bonus_rate по всем купленным предметам (копилки, §11.4). */
  getSavingsBonusRateBonus: () => number;
  /** §17.2 «Сброс профиля» — инвентарь и размещённый декор к исходному состоянию. */
  resetInventory: () => void;
}

function findPlacedSlot(placedDecor: { [slot: number]: number }, itemId: number): number | null {
  const entry = Object.entries(placedDecor).find(([, id]) => id === itemId);
  return entry ? Number(entry[0]) : null;
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      ownedItems: {},
      placedDecor: {},
      equippedFurniture: {},

      purchaseItem: (itemId, quantity = 1) => {
        const item = SHOP_CATALOG.find((i) => i.id === itemId);
        if (!item) {
          return { success: false, message: 'Товар не найден' };
        }
        if (item.is_hidden) {
          return { success: false, message: 'Этот предмет можно получить только в подарок' };
        }
        if (item.is_starter) {
          return { success: false, message: 'Этот предмет уже есть у вас по умолчанию' };
        }

        const { user } = useUserStore.getState();
        if (!user) {
          return { success: false, message: 'Пользователь не найден' };
        }

        const totalCost = item.price * quantity;
        if (user.liquid_balance < totalCost) {
          return { success: false, message: 'Недостаточно монет' };
        }

        // Списываем монеты и пишем транзакцию в леджер
        useUserStore
          .getState()
          .recordTransaction(-totalCost, 'purchase', `Покупка: ${item.name} x${quantity}`);

        // §7.3/§12.2: обязательное/желаемое — по expense_type товара, не по категории
        usePeriodStore.getState().recordFact(item.expense_type, totalCost);

        get().addItem(itemId, quantity);

        return { success: true, message: `Куплено: ${item.name} x${quantity}` };
      },

      sellItem: (itemId, quantity = 1) => {
        const item = SHOP_CATALOG.find((i) => i.id === itemId);
        if (!item) {
          return { success: false, message: 'Товар не найден' };
        }
        if (item.is_hidden) {
          return { success: false, message: 'Этот предмет нельзя продать' };
        }
        if (item.is_starter) {
          return { success: false, message: 'Базовый предмет нельзя продать' };
        }

        const { ownedItems, placedDecor, equippedFurniture } = get();
        const owned = ownedItems[itemId] || 0;
        if (owned < quantity) {
          return { success: false, message: 'Недостаточно предметов для продажи' };
        }

        const refund = Math.floor((item.price * quantity) / 2); // §12.4 — 50% цены
        const remaining = owned - quantity;

        const newOwnedItems = { ...ownedItems };
        if (remaining > 0) {
          newOwnedItems[itemId] = remaining;
        } else {
          delete newOwnedItems[itemId];
        }

        // §13.2: при продаже размещённого предмета слот пустеет
        let newPlacedDecor = placedDecor;
        if (remaining <= 0) {
          const slot = findPlacedSlot(placedDecor, itemId);
          if (slot !== null) {
            newPlacedDecor = { ...placedDecor };
            delete newPlacedDecor[slot];
          }
        }

        // Если продан именно тот предмет мебели, что сейчас стоит в комнате —
        // комната откатывается на стартовый предмет этой категории (его
        // нельзя продать, поэтому он всегда есть во владении).
        let newEquippedFurniture = equippedFurniture;
        if (
          remaining <= 0 &&
          FURNITURE_CATEGORIES.includes(item.category as FurnitureCategory) &&
          equippedFurniture[item.category] === itemId
        ) {
          const starter = SHOP_CATALOG.find((i) => i.is_starter && i.category === item.category);
          newEquippedFurniture = { ...equippedFurniture };
          if (starter) {
            newEquippedFurniture[item.category] = starter.id;
          } else {
            delete newEquippedFurniture[item.category];
          }
        }

        set({
          ownedItems: newOwnedItems,
          placedDecor: newPlacedDecor,
          equippedFurniture: newEquippedFurniture,
        });

        useUserStore
          .getState()
          .recordTransaction(refund, 'item_sale', `Продажа: ${item.name} x${quantity}`);

        return { success: true, message: `Продано: ${item.name} x${quantity} за ${refund}⭐` };
      },

      addItem: (itemId, quantity = 1) => {
        const item = SHOP_CATALOG.find((i) => i.id === itemId);
        if (!item) return;

        const { ownedItems } = get();
        const currentQuantity = ownedItems[itemId] || 0;

        set({ ownedItems: { ...ownedItems, [itemId]: currentQuantity + quantity } });

        // АВТО-РАЗМЕЩЕНИЕ декора при первом получении
        if (item.category === 'decor' && findPlacedSlot(get().placedDecor, itemId) === null) {
          get().placeDecor(itemId);
        }

        // §15.2 «Коллекционер» — считаем только скрытые предметы (получены из подарков)
        if (item.is_hidden) {
          const hiddenOwnedCount = Object.keys(get().ownedItems)
            .map(Number)
            .filter((id) => (get().ownedItems[id] || 0) > 0)
            .filter((id) => SHOP_CATALOG.find((i) => i.id === id)?.is_hidden).length;
          useAchievementsStore.getState().recordHiddenItemsOwned(hiddenOwnedCount);
        }
      },

      consumeItem: (itemId) => {
        const item = SHOP_CATALOG.find((i) => i.id === itemId);
        if (!item || item.category !== 'food') {
          return { success: false, message: 'Этот предмет нельзя использовать' };
        }

        const { ownedItems } = get();
        const owned = ownedItems[itemId] || 0;
        if (owned < 1) {
          return { success: false, message: 'Этого предмета нет в инвентаре' };
        }

        const newOwnedItems = { ...ownedItems };
        if (owned - 1 > 0) {
          newOwnedItems[itemId] = owned - 1;
        } else {
          delete newOwnedItems[itemId];
        }
        set({ ownedItems: newOwnedItems });

        usePetStore.getState().restoreEnergy(item.energy_restore);

        return { success: true, message: `${item.name}: +${item.energy_restore}⚡` };
      },

      placeDecor: (itemId) => {
        const item = SHOP_CATALOG.find((i) => i.id === itemId);
        if (!item || item.category !== 'decor' || !item.slot_category) {
          return { success: false, message: 'Этот предмет нельзя разместить в комнате' };
        }

        const { ownedItems, placedDecor } = get();
        if (!ownedItems[itemId] || ownedItems[itemId] < 1) {
          return { success: false, message: 'Этого предмета нет в инвентаре' };
        }

        if (findPlacedSlot(placedDecor, itemId) !== null) {
          return { success: true, message: 'Уже размещено' };
        }

        const candidateSlots = getSlotsForCategory(item.slot_category);
        if (candidateSlots.length === 0) {
          return { success: false, message: 'Для этого предмета нет подходящего слота' };
        }

        // §13.2: 1 предмет на слот — сперва ищем пустой слот этой категории, иначе заменяем первый
        const emptySlot = candidateSlots.find((s) => placedDecor[s.slot] === undefined);
        const targetSlot = emptySlot ?? candidateSlots[0];

        set({ placedDecor: { ...placedDecor, [targetSlot.slot]: itemId } });
        return { success: true, message: `${item.name} размещён` };
      },

      removeDecor: (itemId) => {
        const { placedDecor } = get();
        const slot = findPlacedSlot(placedDecor, itemId);
        if (slot === null) return;

        const newPlacedDecor = { ...placedDecor };
        delete newPlacedDecor[slot];
        set({ placedDecor: newPlacedDecor });
      },

      equipFurniture: (itemId) => {
        const item = SHOP_CATALOG.find((i) => i.id === itemId);
        if (!item || !FURNITURE_CATEGORIES.includes(item.category as FurnitureCategory)) {
          return { success: false, message: 'Этот предмет нельзя поставить в комнату' };
        }

        const { ownedItems, equippedFurniture } = get();
        if (!ownedItems[itemId] || ownedItems[itemId] < 1) {
          return { success: false, message: 'Этого предмета нет в инвентаре' };
        }

        set({ equippedFurniture: { ...equippedFurniture, [item.category]: itemId } });
        return { success: true, message: `${item.name} теперь в комнате` };
      },

      getOwnedItems: () => {
        const { ownedItems } = get();
        return SHOP_CATALOG.filter((item) => ownedItems[item.id] > 0).map((item) => ({
          ...item,
          quantity: ownedItems[item.id],
        }));
      },

      getPlacedDecor: () => {
        const { placedDecor } = get();
        return Object.entries(placedDecor)
          .map(([slot, itemId]) => {
            const item = SHOP_CATALOG.find((i) => i.id === itemId);
            return item ? { ...item, slot: Number(slot) } : null;
          })
          .filter((entry): entry is ShopItem & { slot: number } => entry !== null);
      },

      getTotalEnergyRecoveryBonus: () => {
        const { placedDecor, equippedFurniture } = get();
        const ids = [...Object.values(placedDecor), ...Object.values(equippedFurniture)];
        return ids.reduce((total, itemId) => {
          const item = SHOP_CATALOG.find((i) => i.id === itemId);
          return total + (item?.energy_recovery_bonus || 0);
        }, 0);
      },

      getTotalEnergyMaxBonus: () => {
        const { placedDecor, equippedFurniture } = get();
        const ids = [...Object.values(placedDecor), ...Object.values(equippedFurniture)];
        return ids.reduce((total, itemId) => {
          const item = SHOP_CATALOG.find((i) => i.id === itemId);
          return total + (item?.energy_max_bonus || 0);
        }, 0);
      },

      getTotalCoinBonusPercent: () => {
        const { ownedItems, placedDecor } = get();
        const placedIds = new Set(Object.values(placedDecor));
        return Object.keys(ownedItems).reduce((total, itemIdKey) => {
          const itemId = Number(itemIdKey);
          const item = SHOP_CATALOG.find((i) => i.id === itemId);
          if (!item) return total;
          // §13: декор считается только когда размещён; остальные категории — по владению
          if (item.category === 'decor' && !placedIds.has(itemId)) return total;
          return total + (item.coin_bonus_percent || 0);
        }, 0);
      },

      getAiCostReduction: () => {
        const { ownedItems } = get();
        return Object.keys(ownedItems).reduce((total, itemIdKey) => {
          const item = SHOP_CATALOG.find((i) => i.id === Number(itemIdKey));
          return total + (item?.ai_cost_reduction || 0);
        }, 0);
      },

      getSavingsBonusRateBonus: () => {
        const { ownedItems } = get();
        return Object.keys(ownedItems).reduce((total, itemIdKey) => {
          const item = SHOP_CATALOG.find((i) => i.id === Number(itemIdKey));
          return total + (item?.savings_bonus_rate || 0);
        }, 0);
      },

      resetInventory: () => set({ ownedItems: {}, placedDecor: {}, equippedFurniture: {} }),
    }),
    {
      name: 'finsputnik-shop-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
