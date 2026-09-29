// lib/utils/itemCategories.test.ts
// Скины комнаты закрыты флагом room_skins (выключен в content/features.json);
// еда в магазине скрыта (FOOD_IN_SHOP).

import itemsJson from '../../../content/items.json';
import { isFeatureEnabled } from '@/config/featureFlags';
import { ItemContent } from '@/domain/content/ItemContent';
import { isLockedRoomSkin, isShopItem, SHOP_ITEM_CATEGORIES } from './itemCategories';

const SHOP_CATALOG = itemsJson as ItemContent[];

const roomItems = SHOP_CATALOG.filter((i) => i.category === 'room');

describe('скины комнаты закрыты флагом room_skins', () => {
  it('флаг выключен', () => {
    expect(isFeatureEnabled('room_skins')).toBe(false);
  });

  it('платных скинов комнаты нет в магазине, стартовая комната не закрыта', () => {
    const paid = roomItems.filter((i) => !i.is_starter);
    expect(paid.length).toBeGreaterThan(0);
    for (const item of paid) {
      expect(isLockedRoomSkin(item)).toBe(true);
      expect(isShopItem(item, 'cat')).toBe(false);
    }
    for (const item of roomItems.filter((i) => i.is_starter)) {
      expect(isLockedRoomSkin(item)).toBe(false);
    }
  });

  it('в магазине нет вкладки «Комната»', () => {
    expect(SHOP_ITEM_CATEGORIES.map((c) => c.id)).not.toContain('room');
  });

  it('остальная мебель по-прежнему продаётся', () => {
    const furniture = SHOP_CATALOG.filter(
      (i) =>
        ['laptop', 'piggybank', 'bed', 'carpet', 'window'].includes(i.category) && !i.is_starter
    );
    expect(furniture.every((i) => isShopItem(i, 'cat'))).toBe(true);
  });
});

describe('еда скрыта из магазина (решение 29.09.2026)', () => {
  it('нет ни вкладки, ни товаров еды', () => {
    expect(SHOP_ITEM_CATEGORIES.map((c) => c.id)).not.toContain('food');
    const food = SHOP_CATALOG.filter((i) => i.category === 'food');
    expect(food.length).toBeGreaterThan(0);
    expect(food.some((i) => isShopItem(i, 'cat'))).toBe(false);
  });
});
