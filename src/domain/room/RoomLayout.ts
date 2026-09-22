// domain/room/RoomLayout.ts
// Раскладка комнаты питомца — отдельная сущность от RoomSlot.ts (тот
// описывает АБСТРАКТНЫЕ категории слотов для магазинного decor — стена/пол/
// мебель — и не знает о конкретных пикселях). RoomLayout.ts описывает
// КОНКРЕТНУЮ визуальную раскладку: где именно на экране комнаты стоит
// каждый обязательный предмет (окно/копилка/ноутбук/кровать/ковёр/питомец).
//
// Все размеры/позиции — в процентах от реальных размеров комнаты (не
// фиксированные px и не scale()) — так каждый предмет остаётся
// пропорциональным независимо от того, насколько велика комната на
// конкретном экране (см. PetRoom.tsx, который меряет комнату через onLayout).
//
// Какая раскладка сейчас активна — определяется товаром category:'room' в
// equippedFurniture (см. useShop.ts), а не выбором в настройках: раскладка —
// это скин комнаты, покупается и надевается в Магазине/Инвентаре, как и
// остальная мебель (см. ROOM_VARIANT_TO_LAYOUT_ID ниже).

/** Прямоугольник одного места в комнате — ровно один вертикальный якорь
 * (top ИЛИ bottom) и один горизонтальный (left ИЛИ right), плюс размер.
 * width — % от ширины комнаты, height — % от высоты комнаты. */
export interface RoomBox {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  width: number;
  height: number;
}

export interface RoomLayout {
  id: string;
  name: string;
  window: RoomBox;
  piggybank: RoomBox;
  laptop: RoomBox;
  bed: RoomBox;
  carpet: RoomBox;
  /** Питомец центрируется по горизонтали самим PetRoom — здесь только высота
   * от низа (bottom) и размер как % от ширины комнаты, из которого PetRoom
   * считает реальный пиксельный size для PetSprite (см. onLayout). */
  pet: { bottom: number; sizePercent: number };
}

export const ROOM_LAYOUTS: Record<string, RoomLayout> = {
  classic: {
    id: 'classic',
    name: 'Классическая',
    window: { top: 6, left: 8, width: 50, height: 40 },
    piggybank: { top: 8, right: 8, width: 16, height: 13 },
    laptop: { bottom: 10, left: 6, width: 18, height: 14 },
    bed: { bottom: 10, right: 6, width: 18, height: 14 },
    carpet: { bottom: 4, left: 27, width: 46, height: 16 },
    pet: { bottom: 16, sizePercent: 32 },
  },
  alt: {
    id: 'alt',
    name: 'Уютная',
    window: { top: 5, left: 30, width: 40, height: 32 },
    piggybank: { bottom: 10, left: 6, width: 16, height: 13 },
    laptop: { top: 8, right: 8, width: 18, height: 14 },
    bed: { bottom: 10, right: 6, width: 18, height: 14 },
    carpet: { bottom: 4, left: 22, width: 56, height: 18 },
    pet: { bottom: 18, sizePercent: 30 },
  },
};

export const DEFAULT_ROOM_LAYOUT_ID = 'classic';

/** category:'room' в content/items.json (см. ItemContent.ts) — skin_variant
 * товара определяет, какая раскладка используется. 0 — «Классическая»
 * (стартовая, id 39), 1 — «Космическая комната» (покупная, id 40). Новый
 * скин комнаты переиспользует уже готовую раскладку «alt»/«Уютная» — меняется
 * только фон (см. ROOM_BACKGROUNDS в PetRoom.tsx), не расстановка. */
const ROOM_VARIANT_TO_LAYOUT_ID: Record<number, string> = {
  0: 'classic',
  1: 'alt',
};

/** Раскладка по экипированному скину комнаты (см. equippedFurniture['room']
 * в useShop.ts) — тот же принцип, что и у остальной мебели: всегда что-то
 * экипировано, начиная со стартового предмета. */
export function getRoomLayout(equippedRoomVariant: number): RoomLayout {
  const id = ROOM_VARIANT_TO_LAYOUT_ID[equippedRoomVariant] ?? DEFAULT_ROOM_LAYOUT_ID;
  return ROOM_LAYOUTS[id] ?? ROOM_LAYOUTS[DEFAULT_ROOM_LAYOUT_ID];
}

/** RN's DimensionValue ожидает именно шаблонный литерал `${number}%`, не
 * произвольную string — иначе TS ругается на присвоение в width/height/
 * top/bottom/left/right у View/Image/Animated.View стилей. */
type Percent = `${number}%`;
const percent = (value: number): Percent => `${value}%`;

/** RoomBox -> RN-стиль (position:absolute + %-якоря). Общий помощник, чтобы
 * не дублировать преобразование в каждом месте, где рендерится RoomBox. */
export function roomBoxToStyle(box: RoomBox): {
  position: 'absolute';
  top?: Percent;
  bottom?: Percent;
  left?: Percent;
  right?: Percent;
  width: Percent;
  height: Percent;
} {
  return {
    position: 'absolute',
    ...(box.top !== undefined ? { top: percent(box.top) } : {}),
    ...(box.bottom !== undefined ? { bottom: percent(box.bottom) } : {}),
    ...(box.left !== undefined ? { left: percent(box.left) } : {}),
    ...(box.right !== undefined ? { right: percent(box.right) } : {}),
    width: percent(box.width),
    height: percent(box.height),
  };
}
