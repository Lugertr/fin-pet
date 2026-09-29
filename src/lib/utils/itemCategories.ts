// lib/utils/itemCategories.ts
// Категории товаров (§12.2 ТЗ) — общие для магазина и инвентаря, раньше были
// продублированы дословно в обоих экранах под разными именами.

import { isFeatureEnabled } from '@/config/featureFlags';
import type { PetType } from '@/constants/petAssets';
import type { ItemContent } from '@/domain/content/ItemContent';
import type { IconName } from '@/types/icons';

export const ITEM_CATEGORIES: { id: string; name: string; icon: IconName }[] = [
  { id: 'all', name: 'Все', icon: 'apps' },
  { id: 'decor', name: 'Декор', icon: 'home' },
  { id: 'room', name: 'Комната', icon: 'image' },
  { id: 'food', name: 'Еда', icon: 'restaurant' },
  { id: 'skin', name: 'Скины', icon: 'color-palette' },
];

/**
 * Скин комнаты (category:'room', кроме стартового) закрыт, пока выключен флаг
 * room_skins (решение пользователя 28.09.2026): его нет в магазине и в
 * подарках, а уже купленный нельзя надеть — комната остаётся классической.
 */
export function isLockedRoomSkin(item: Pick<ItemContent, 'category' | 'is_starter'>): boolean {
  return item.category === 'room' && !item.is_starter && !isFeatureEnabled('room_skins');
}

/** Еды в магазине нет (решение пользователя 29.09.2026): энергию в смене
 * пополняет кофе (раз за смену, lessons.json), остальное — время. Товары и
 * код еды остаются. */
export const FOOD_IN_SHOP = false;

/** Вкладки магазина — без «Скинов»: облик питомца не продаётся, он приходит
 * с новым уровнем (решение пользователя 27.09.2026). В инвентаре вкладка есть.
 * «Еды» нет, пока FOOD_IN_SHOP выключен.
 * «Комнаты» нет, пока скины комнаты закрыты (isLockedRoomSkin) — иначе
 * вкладка была бы пустой: стартовая комната не продаётся. */
export const SHOP_ITEM_CATEGORIES = ITEM_CATEGORIES.filter(
  (category) =>
    category.id !== 'skin' &&
    (category.id !== 'food' || FOOD_IN_SHOP) &&
    (category.id !== 'room' || isFeatureEnabled('room_skins'))
);

/** Вкладка «Декор» объединяет обычный decor и обязательные предметы комнаты
 * (ноутбук/копилка/кровать/ковёр/окно, см. PetRoom.tsx) — они физически стоят
 * в той же комнате, показывать их отдельными вкладками избыточно (§13 ТЗ).
 * Скин самой комнаты (category:'room') — не «предмет», а весь фон+раскладка
 * сразу, поэтому у него своя вкладка «Комната», не «Декор». */
const DECOR_TAB_CATEGORIES = ['decor', 'laptop', 'piggybank', 'bed', 'carpet', 'window'];

export function itemMatchesCategoryFilter(itemCategory: string, selectedCategory: string): boolean {
  if (selectedCategory === 'all') return true;
  if (selectedCategory === 'decor') return DECOR_TAB_CATEGORIES.includes(itemCategory);
  return itemCategory === selectedCategory;
}

/** Скины (category:'skin') привязаны к конкретному виду питомца — скин
 * медведя не должен предлагаться на покупку и не должен выпадать в подарок
 * владельцу кота, и т.п. Остальные категории pet_type не имеют — им этот
 * фильтр не мешает. Общий для магазина (покупка) и подарков (розыгрыш). */
export function itemMatchesPetType(
  item: Pick<ItemContent, 'category' | 'pet_type'>,
  petType: PetType
): boolean {
  return item.category !== 'skin' || item.pet_type === petType;
}

/** Название категории конкретного товара для карточек/модалок (§12.3 — перед
 * покупкой видно категорию) — шире, чем ITEM_CATEGORIES: ноутбук/копилка/
 * кровать не отдельные вкладки, но у себя в карточке всё равно должны
 * показывать понятное имя, а не сырой ключ category. */
export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  decor: 'Декор',
  food: 'Еда',
  laptop: 'Ноутбук',
  piggybank: 'Копилка',
  bed: 'Кровать',
  carpet: 'Ковёр',
  window: 'Окно',
  room: 'Комната',
  skin: 'Скин',
};

/**
 * Продаётся ли вещь в магазине этого питомца — одно правило для витрины
 * магазина и выбора цели в банке: не скрытый трофей (только из подарков), не
 * стартовая вещь (есть у всех), не облик питомца (только за уровень), не
 * закрытый скин комнаты и подходит виду питомца.
 */
export function isShopItem(
  item: Pick<ItemContent, 'category' | 'pet_type' | 'is_hidden' | 'is_starter'>,
  petType: PetType
): boolean {
  return (
    !item.is_hidden &&
    !item.is_starter &&
    item.category !== 'skin' &&
    (item.category !== 'food' || FOOD_IN_SHOP) &&
    !isLockedRoomSkin(item) &&
    itemMatchesPetType(item, petType)
  );
}

/** Категории, на улучшения которых можно копить в банке (цель накопления). */
export const SAVINGS_GOAL_CATEGORIES: string[] = ['laptop', 'piggybank', 'bed'];

/**
 * Можно ли выбрать вещь целью накопления: только улучшения ноутбука, копилки
 * и кровати — вещей с игровыми бонусами (решение пользователя 27.09.2026).
 */
export function isSavingsGoalItem(
  item: Pick<ItemContent, 'category' | 'is_hidden' | 'is_starter'>
): boolean {
  return SAVINGS_GOAL_CATEGORIES.includes(item.category) && !item.is_starter && !item.is_hidden;
}
