// domain/room/RoomLayout.test.ts
// Раскладка комнаты по координатам макета (фон 1024×1792, 27.09.2026).

import {
  fromBackgroundPx,
  getRoomLayout,
  ROOM_BACKGROUND_SIZE,
  roomBoxToStyle,
} from './RoomLayout';

/** Координаты из макета: левый верхний угол и размер в пикселях фона. */
const SPEC = {
  window: { left: 255.11, top: 190.47, width: 681.6, height: 618.79 },
  laptop: { left: 18, top: 775.14, width: 300.06, height: 185.24 },
  bed: { left: 464.6, top: 876.16, width: 533.29, height: 374.63 },
  piggybank: { left: 827.88, top: 1240.37, width: 183.64, height: 140.58 },
  carpet: { left: 285.55, top: 1405.78, width: 454, height: 146 },
} as const;

/** Центр места в пикселях фона. */
const center = (px: { left: number; top: number; width: number; height: number }) => ({
  x: px.left + px.width / 2,
  y: px.top + px.height / 2,
});

describe('раскладка комнаты', () => {
  it('все фоны — один стандартный размер 1024×1792 и одна раскладка', () => {
    expect(ROOM_BACKGROUND_SIZE).toEqual({ width: 1024, height: 1792 });
    expect(getRoomLayout(1)).toBe(getRoomLayout(0));
  });

  it.each(Object.keys(SPEC) as (keyof typeof SPEC)[])('%s — ровно по координатам макета', (key) => {
    const box = getRoomLayout(0)[key];
    const px = SPEC[key];
    expect(box).toEqual(fromBackgroundPx(px));
    // Предмет целиком внутри комнаты.
    expect((box.left ?? 0) + box.width).toBeLessThanOrEqual(100);
    expect((box.top ?? 0) + (box.height ?? 0)).toBeLessThanOrEqual(100);
  });

  it('уменьшенный ковёр стоит с тем же центром, что и прежний 917.1×423.56', () => {
    const before = center({ left: 54, top: 1267, width: 917.1, height: 423.56 });
    const after = center(SPEC.carpet);
    expect(after.x).toBeCloseTo(before.x, 5);
    expect(after.y).toBeCloseTo(before.y, 5);
  });

  it('на экране в масштабе фона размер предмета совпадает с макетом', () => {
    // Комната шириной 1024 px — масштаб 1:1 с фоном.
    const style = roomBoxToStyle(getRoomLayout(0).window, 1024, 1);
    expect(style.width).toBeCloseTo(681.6, 5);
    expect(style.height).toBeCloseTo(618.79, 5);
    expect(style.left).toBe(`${(255.11 / 1024) * 100}%`);
    expect(style.top).toBe(`${(190.47 / 1792) * 100}%`);
  });
});
