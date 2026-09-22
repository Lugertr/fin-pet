// domain/room/RoomSlot.ts
// Слоты комнаты (§13.1 ТЗ). 1 предмет на слот, предмет подходит по категории
// слота, эффекты не стакаются в пределах одного слота (§13.2).

export type SlotCategory = 'wall' | 'furniture_large' | 'floor' | 'furniture_small' | 'accessory';

export interface RoomSlotDefinition {
  slot: number;
  category: SlotCategory;
  label: string;
}

export const ROOM_SLOTS: RoomSlotDefinition[] = [
  { slot: 1, category: 'wall', label: 'Стена 1' },
  { slot: 2, category: 'wall', label: 'Стена 2' },
  { slot: 3, category: 'furniture_large', label: 'Крупная мебель' },
  { slot: 4, category: 'floor', label: 'Пол' },
  { slot: 5, category: 'furniture_small', label: 'Малая мебель' },
  { slot: 6, category: 'accessory', label: 'Аксессуар' },
];

export function getSlotsForCategory(category: SlotCategory): RoomSlotDefinition[] {
  return ROOM_SLOTS.filter((s) => s.category === category);
}
