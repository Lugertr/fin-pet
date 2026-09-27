// domain/room/RoomLayout.ts
// Раскладка комнаты питомца — отдельная сущность от RoomSlot.ts (тот
// описывает АБСТРАКТНЫЕ категории слотов для магазинного decor — стена/пол/
// мебель — и не знает о конкретных пикселях). RoomLayout.ts описывает
// КОНКРЕТНУЮ визуальную раскладку: где именно на экране комнаты стоит
// каждый обязательный предмет (окно/копилка/ноутбук/кровать/ковёр/питомец).
//
// Все позиции — в процентах от реальных размеров комнаты (не фиксированные
// px и не scale()) — так каждый предмет остаётся пропорциональным независимо
// от того, насколько велика комната на конкретном экране (см. PetRoom.tsx,
// который меряет комнату через onLayout).
//
// У каждого места задан ТОЛЬКО width (% от ширины комнаты) — высота места не
// хранится здесь, а считается в момент рендера из реального соотношения
// сторон конкретного SVG (см. lib/utils/imageAspectRatio.ts), иначе при
// несовпадении заданной высоты с реальной картинка обрезалась/растягивалась
// бы (contentFit не спасает, если сама рамка места уже неправильных пропорций).
//
// Какая раскладка сейчас активна — определяется товаром category:'room' в
// equippedFurniture (см. useShop.ts), а не выбором в настройках: раскладка —
// это скин комнаты, покупается и надевается в Магазине/Инвентаре, как и
// остальная мебель (см. ROOM_VARIANT_TO_LAYOUT_ID ниже).

/** Размер всех фонов комнаты (room-background*.svg) — стандарт 1024×1792.
 * Координаты предметов задаются в пикселях этого холста (см. fromBackgroundPx). */
export const ROOM_BACKGROUND_SIZE = { width: 1024, height: 1792 } as const;

/** Соотношение сторон фона комнаты (ширина / высота). */
export const ROOM_ASPECT_RATIO = ROOM_BACKGROUND_SIZE.width / ROOM_BACKGROUND_SIZE.height;

/** Прямоугольник одного места в комнате — ровно один вертикальный якорь
 * (top ИЛИ bottom) и один горизонтальный (left ИЛИ right), плюс ширина.
 * width — % от ширины комнаты; height — % от высоты комнаты (если не задана,
 * вычисляется из реальных пропорций ассета, см. roomBoxToStyle). */
export interface RoomBox {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  width: number;
  height?: number;
}

/**
 * Место предмета по пикселям фона 1024×1792 (левый верхний угол + размер) —
 * в проценты комнаты. Так раскладку можно брать прямо из макета.
 */
export function fromBackgroundPx(px: {
  left: number;
  top: number;
  width: number;
  height: number;
}): RoomBox {
  const { width: W, height: H } = ROOM_BACKGROUND_SIZE;
  return {
    left: (px.left / W) * 100,
    top: (px.top / H) * 100,
    width: (px.width / W) * 100,
    height: (px.height / H) * 100,
  };
}

/** Правый край места в % от правого края комнаты (для подписей справа). */
export function boxRight(box: RoomBox): number {
  if (box.right !== undefined) return box.right;
  return 100 - (box.left ?? 0) - box.width;
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

// Координаты предметов — по макету пользователя (27.09.2026), в пикселях фона
// 1024×1792 (левый верхний угол + размер). Все фоны комнаты одного размера,
// поэтому раскладка одна для всех (классическая и космическая комнаты).
export const ROOM_LAYOUTS: Record<string, RoomLayout> = {
  classic: {
    id: 'classic',
    name: 'Классическая',
    window: fromBackgroundPx({ left: 255.11, top: 190.47, width: 681.6, height: 618.79 }),
    laptop: fromBackgroundPx({ left: 18, top: 775.14, width: 300.06, height: 185.24 }),
    // Кровать рисуется раньше питомца (см. PetRoom.tsx) — он стоит перед ней.
    bed: fromBackgroundPx({ left: 464.6, top: 876.16, width: 533.29, height: 374.63 }),
    piggybank: fromBackgroundPx({ left: 827.88, top: 1240.37, width: 183.64, height: 140.58 }),
    carpet: fromBackgroundPx({ left: 285.55, top: 1405.78, width: 454, height: 146 }),
    pet: { bottom: 12, sizePercent: 30 },
  },
};

export const DEFAULT_ROOM_LAYOUT_ID = 'classic';

/** category:'room' в content/items.json (см. ItemContent.ts) — skin_variant
 * товара определяет раскладку. Все фоны одного размера (1024×1792), поэтому
 * и «Классическая» (id 39), и «Космическая» (id 40) комнаты используют одну
 * раскладку — меняется только фон (ROOM_BACKGROUNDS, constants/itemAssets). */
const ROOM_VARIANT_TO_LAYOUT_ID: Record<number, string> = {
  0: 'classic',
  1: 'classic',
};

/** Раскладка по экипированному скину комнаты (см. equippedFurniture['room']
 * в useShop.ts) — тот же принцип, что и у остальной мебели: всегда что-то
 * экипировано, начиная со стартового предмета. */
export function getRoomLayout(equippedRoomVariant: number): RoomLayout {
  const id = ROOM_VARIANT_TO_LAYOUT_ID[equippedRoomVariant] ?? DEFAULT_ROOM_LAYOUT_ID;
  return ROOM_LAYOUTS[id] ?? ROOM_LAYOUTS[DEFAULT_ROOM_LAYOUT_ID];
}

/** RN's DimensionValue ожидает именно шаблонный литерал `${number}%`, не
 * произвольную string — иначе TS ругается на присвоение в top/bottom/left/
 * right у View/Image/Animated.View стилей. */
type Percent = `${number}%`;
const percent = (value: number): Percent => `${value}%`;

/**
 * RoomBox -> RN-стиль: позиция — % (top/bottom/left/right) относительно
 * комнаты, а ширина/высота — в пикселях: ширина из width%, высота из height%
 * (от высоты комнаты), а если её нет — из реального aspectRatio ассета.
 * Картинка внутри — contentFit="contain", поэтому не растягивается.
 */
export function roomBoxToStyle(
  box: RoomBox,
  roomWidthPx: number,
  aspectRatio: number
): {
  position: 'absolute';
  top?: Percent;
  bottom?: Percent;
  left?: Percent;
  right?: Percent;
  width: number;
  height: number;
} {
  const width = (roomWidthPx * box.width) / 100;
  const roomHeightPx = roomWidthPx / ROOM_ASPECT_RATIO;
  const height =
    box.height !== undefined
      ? (roomHeightPx * box.height) / 100
      : aspectRatio > 0
        ? width / aspectRatio
        : width;
  return {
    position: 'absolute',
    ...(box.top !== undefined ? { top: percent(box.top) } : {}),
    ...(box.bottom !== undefined ? { bottom: percent(box.bottom) } : {}),
    ...(box.left !== undefined ? { left: percent(box.left) } : {}),
    ...(box.right !== undefined ? { right: percent(box.right) } : {}),
    width,
    height,
  };
}
