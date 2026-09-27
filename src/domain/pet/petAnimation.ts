// domain/pet/petAnimation.ts
// Lottie-анимации тела питомца и их перекраска под скин. Скин — это та же
// анимация другого цвета, поэтому в бандле по одному JSON на вид+состояние
// (assets/animations/pets, готовит scripts/build-pet-animations.js), а цвета
// скина подставляются здесь по палитре palettes.json («цвет классического
// облика → цвет скина», выведена из SVG v0/v1/v2 тем же скриптом).

import { PetType } from '@/constants/petAssets';
import palettesJson from '../../../assets/animations/pets/palettes.json';

/** JSON Lottie (bodymovin): обязательные поля формата, остальное — как есть. */
export interface LottieAnimation {
  v: string;
  fr: number;
  ip: number;
  op: number;
  w: number;
  h: number;
  assets: unknown[];
  layers: unknown[];
  [key: string]: unknown;
}

/** '#RRGGBB' классического облика → '#RRGGBB' скина. */
export type SkinPalette = Readonly<Record<string, string>>;

/** Где в кадре анимации стоит тело питомца — рамка idle-SVG того же вида
 * (анимации нарисованы в масштабе SVG 1:1). По ней анимация совмещается с
 * местом, которое раскладка отводит под питомца, а сердечки/«Zzz» вокруг
 * тела выходят за эту рамку. Координаты — пиксели кадра анимации. */
export interface PetAnimationBody {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Анимация одного состояния вида: JSON и нужно ли её зацикливать. */
export interface PetAnimationAsset {
  json: LottieAnimation;
  loop: boolean;
}

/** Готовая к показу анимация: уже в цветах скина. */
export interface PetAnimation {
  source: LottieAnimation;
  loop: boolean;
  canvasWidth: number;
  canvasHeight: number;
  body: PetAnimationBody;
}

const PALETTES = palettesJson as Partial<Record<PetType, Record<string, SkinPalette>>>;

/** Палитра скина; null — скин совпадает с классическим обликом (variant 0)
 * или под него нет перекраски (например, у мишки только классический). */
export function getSkinPalette(petType: PetType, skinVariant: number): SkinPalette | null {
  const palette = PALETTES[petType]?.[String(skinVariant)];
  return palette && Object.keys(palette).length > 0 ? palette : null;
}

function toHex(rgb: readonly number[]): string {
  return (
    '#' +
    rgb
      .slice(0, 3)
      .map((channel) =>
        Math.round(Math.min(1, Math.max(0, channel)) * 255)
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
      .toUpperCase()
  );
}

function hexToRgb(hex: string): number[] {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
}

/** Цвет Lottie — [r, g, b] или [r, g, b, a] в долях 0..1; альфа сохраняется. */
function recolorValue(value: unknown, palette: SkinPalette): unknown {
  if (!Array.isArray(value) || value.length < 3) return value;
  const target = palette[toHex(value as number[])];
  return target ? [...hexToRgb(target), ...value.slice(3)] : value;
}

type LottieNode = Record<string, unknown>;

/** Цвет заливки/обводки: статичный ({a: 0, k: [r,g,b,a]}) или ключевые кадры
 * ({a: 1, k: [{s, e?}, ...]}). */
function recolorColorProperty(color: LottieNode, palette: SkinPalette): LottieNode {
  if (color.a === 1 && Array.isArray(color.k)) {
    return {
      ...color,
      k: (color.k as LottieNode[]).map((keyframe) => ({
        ...keyframe,
        ...(keyframe.s !== undefined && { s: recolorValue(keyframe.s, palette) }),
        ...(keyframe.e !== undefined && { e: recolorValue(keyframe.e, palette) }),
      })),
    };
  }
  return { ...color, k: recolorValue(color.k, palette) };
}

function recolorNode(node: unknown, palette: SkinPalette): unknown {
  if (Array.isArray(node)) return node.map((child) => recolorNode(child, palette));
  if (node === null || typeof node !== 'object') return node;

  const result: LottieNode = {};
  for (const [key, child] of Object.entries(node)) result[key] = recolorNode(child, palette);
  if ((result.ty === 'fl' || result.ty === 'st') && result.c && typeof result.c === 'object') {
    result.c = recolorColorProperty(result.c as LottieNode, palette);
  }
  return result;
}

/** Копия анимации с цветами заливок/обводок по палитре; исходник не меняется.
 * Цвета вне палитры (сердечки, звёзды, белки глаз) остаются как есть. */
export function recolorLottie(
  animation: LottieAnimation,
  palette: SkinPalette | null
): LottieAnimation {
  if (!palette) return animation;
  return recolorNode(animation, palette) as LottieAnimation;
}
