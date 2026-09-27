// domain/content/ItemContent.ts
// Форма товара, как она лежит в content/items.json (§12.5 ТЗ).

export type ItemCategory =
  | 'decor'
  | 'food'
  | 'skin'
  | 'laptop'
  | 'piggybank'
  | 'bed'
  | 'carpet'
  | 'window'
  | 'room'
  | string;
export type ExpenseType = 'mandatory' | 'optional';
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface ItemContent {
  id: number;
  name: string;
  category: ItemCategory;
  expense_type: ExpenseType;
  price: number;
  icon: string;
  description: string;
  /** Еда — мгновенное восстановление энергии (§12.2) */
  energy_restore: number;
  /** Мебель/растения — +максимум энергии (§12.2, §6.1) */
  energy_max_bonus: number;
  /** Уют/освещение — +скорость восстановления энергии в час */
  energy_recovery_bonus: number;
  /** Ноутбуки/декор стен — +% монет за уроки */
  coin_bonus_percent: number;
  /** Копилки — +bonus_rate накоплений (§11.4) */
  savings_bonus_rate: number;
  /** Предметы ИИ («облако») — −⚡ за вопрос ИИ (§6.2, §16.2) */
  ai_cost_reduction: number;
  is_hidden?: boolean;
  /** Стартовый предмет своей категории — выдаётся один раз при онбординге
   * (см. onboarding.tsx), price всегда 0, не продаётся и не покупается заново
   * (см. sellItem/purchasableCatalog). Отдельный флаг от is_hidden — это не
   * подарок, не должен считаться в ачивке «Коллекционер» скрытых предметов. */
  is_starter?: boolean;
  rarity?: ItemRarity;
  /** Только для category === 'decor' — какой слот комнаты подходит (§13.1). */
  slot_category?: 'wall' | 'furniture_large' | 'floor' | 'furniture_small' | 'accessory';
  /** Только для category === 'skin' — какому типу питомца подходит скин. */
  pet_type?: 'robot' | 'bear' | 'cat';
  /** Индекс визуального варианта товара — общий для всех категорий с
   * несколькими вариантами арта (см. PetRoom.tsx, getBodyAsset).
   * Для category === 'skin': 0 — встроенный «Классический» (без товарной
   * строки), 1/2 — покупные, соответствуют PetSpecies.getBodyAsset.
   * Для laptop/piggybank/bed/carpet/window/room: 0 — стартовый бесплатный
   * предмет (у него ЕСТЬ товарная строка, is_starter: true), 1/2 —
   * платные апгрейды. Для room допустимы только 0/1 (2 скина комнаты). */
  skin_variant?: 0 | 1 | 2;
  /** Только для category === 'skin' — hex для кружка-свотча в UI выбора цвета, без
   * рантайм-парсинга SVG. */
  swatch_color?: string;
}
