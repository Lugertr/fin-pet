// domain/pet/petAnimation.test.ts
// Перекраска Lottie под скин и связь «каталог скинов ↔ палитры ↔ анимации»:
// скин из магазина должен менять цвет анимации, а свотч в каталоге —
// совпадать с её цветами (иначе кружок выбора облика врёт о цвете).

import itemsJson from '../../../content/items.json';
import { PetMoodState, PetType } from '@/constants/petAssets';
import { getPetSpecies } from './petSpeciesRegistry';
import { getSkinPalette, LottieAnimation, recolorLottie } from './petAnimation';

const PET_TYPES: PetType[] = ['robot', 'bear', 'cat'];
const STATES: PetMoodState[] = ['idle', 'sleeping'];

function toHex(rgb: number[]): string {
  return (
    '#' +
    rgb
      .slice(0, 3)
      .map((c) =>
        Math.round(c * 255)
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
      .toUpperCase()
  );
}

/** Цвета заливок/обводок анимации, включая ключевые кадры. */
function collectColors(node: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(node)) {
    node.forEach((child) => collectColors(child, out));
  } else if (node && typeof node === 'object') {
    const obj = node as Record<string, any>;
    if ((obj.ty === 'fl' || obj.ty === 'st') && obj.c) {
      if (obj.c.a === 1) {
        obj.c.k.forEach((kf: any) => kf.s && out.add(toHex(kf.s)));
      } else {
        out.add(toHex(obj.c.k));
      }
    }
    Object.values(obj).forEach((child) => collectColors(child, out));
  }
  return out;
}

function hasTextLayers(node: unknown): boolean {
  if (Array.isArray(node)) return node.some(hasTextLayers);
  if (!node || typeof node !== 'object') return false;
  const obj = node as Record<string, unknown>;
  return obj.ty === 5 || Object.values(obj).some(hasTextLayers);
}

describe('recolorLottie', () => {
  const animation: LottieAnimation = {
    v: '5.12.2',
    fr: 30,
    ip: 0,
    op: 10,
    w: 100,
    h: 100,
    assets: [],
    layers: [
      {
        ty: 4,
        shapes: [
          { ty: 'fl', c: { a: 0, k: [1, 0, 0, 0.5] } },
          {
            ty: 'st',
            c: {
              a: 1,
              k: [
                { t: 0, s: [1, 0, 0, 1], e: [0, 0, 1, 1] },
                { t: 10, s: [0, 0, 1, 1] },
              ],
            },
          },
          { ty: 'fl', c: { a: 0, k: [0, 1, 0, 1] } },
        ],
      },
    ],
  };
  const palette = { '#FF0000': '#00FFFF', '#0000FF': '#FFFF00' };

  it('меняет статичные и ключевые цвета по палитре, альфу сохраняет', () => {
    const result = recolorLottie(animation, palette) as any;
    const [fill, stroke, untouched] = result.layers[0].shapes;
    expect(fill.c.k).toEqual([0, 1, 1, 0.5]);
    expect(stroke.c.k[0].s).toEqual([0, 1, 1, 1]);
    expect(stroke.c.k[0].e).toEqual([1, 1, 0, 1]);
    expect(stroke.c.k[1].s).toEqual([1, 1, 0, 1]);
    expect(untouched.c.k).toEqual([0, 1, 0, 1]);
  });

  it('не меняет исходник; без палитры возвращает его же', () => {
    const before = JSON.stringify(animation);
    recolorLottie(animation, palette);
    expect(JSON.stringify(animation)).toBe(before);
    expect(recolorLottie(animation, null)).toBe(animation);
  });
});

describe('getSkinPalette', () => {
  it('у классического облика перекраски нет', () => {
    expect(getSkinPalette('robot', 0)).toBeNull();
    expect(getSkinPalette('cat', 0)).toBeNull();
    expect(getSkinPalette('bear', 0)).toBeNull();
  });

  it('§4.3: у каждого вида три облика — классический и два цветных (9 комбинаций)', () => {
    for (const petType of PET_TYPES) {
      const variants = itemsJson
        .filter((item) => item.category === 'skin' && item.pet_type === petType)
        .map((item) => item.skin_variant)
        .sort();
      expect({ petType, variants }).toEqual({ petType, variants: [0, 1, 2] });
    }
  });

  it('у каждого скина из каталога есть палитра его вида', () => {
    const skins = itemsJson.filter(
      (item) => item.category === 'skin' && (item.skin_variant ?? 0) > 0
    );
    expect(skins.length).toBeGreaterThan(0);
    for (const skin of skins) {
      expect(getSkinPalette(skin.pet_type as PetType, skin.skin_variant!)).not.toBeNull();
    }
  });
});

describe('PetSpecies.getAnimation', () => {
  it('у всех видов есть весёлая анимация; спящая — у робота и кота', () => {
    for (const petType of PET_TYPES) {
      expect(getPetSpecies(petType).getAnimation('idle')).not.toBeNull();
    }
    expect(getPetSpecies('robot').getAnimation('sleeping')).not.toBeNull();
    expect(getPetSpecies('cat').getAnimation('sleeping')).not.toBeNull();
    // Без анимации — статичный SVG (PetSprite).
    expect(getPetSpecies('bear').getAnimation('sleeping')).toBeNull();
  });

  it('по нажатию играется короткий отрывок (≤ 6 с), а не весь исходник', () => {
    for (const petType of PET_TYPES) {
      for (const state of STATES) {
        const animation = getPetSpecies(petType).getAnimation(state);
        if (!animation) continue;
        const { ip, op, fr } = animation.source;
        expect(op).toBeGreaterThan(ip);
        expect((op - ip) / fr).toBeLessThanOrEqual(6);
      }
    }
  });

  it('в анимациях нет текстовых слоёв — шрифтов в приложении нет', () => {
    for (const petType of PET_TYPES) {
      for (const state of STATES) {
        const animation = getPetSpecies(petType).getAnimation(state);
        if (animation) expect(hasTextLayers(animation.source)).toBe(false);
      }
    }
  });

  it('скин перекрашивает тело: у оранжевого робота нет исходного синего', () => {
    const robot = getPetSpecies('robot');
    const classic = collectColors(robot.getAnimation('idle', 0)!.source);
    const orange = collectColors(robot.getAnimation('idle', 1)!.source);
    expect(classic.has('#615CEF')).toBe(true);
    expect(orange.has('#615CEF')).toBe(false);
    expect(orange.has('#F3A231')).toBe(true);
  });

  it('скин без палитры (свой рисунок) — без анимации, остаётся SVG', () => {
    expect(getPetSpecies('bear').getAnimation('idle', 7)).toBeNull();
    expect(getPetSpecies('bear').getAnimation('idle', 1)).not.toBeNull();
  });

  it('перекраска считается один раз на состояние и скин', () => {
    const cat = getPetSpecies('cat');
    expect(cat.getAnimation('idle', 2)).toBe(cat.getAnimation('idle', 2));
    expect(cat.getAnimation('idle', 2)).not.toBe(cat.getAnimation('idle', 1));
  });

  it('свотч облика в каталоге — один из цветов его анимации', () => {
    const looks = itemsJson.filter((item) => item.category === 'skin');
    for (const look of looks) {
      const animation = getPetSpecies(look.pet_type as PetType).getAnimation(
        'idle',
        look.skin_variant ?? 0
      );
      expect({ id: look.id, colors: [...collectColors(animation!.source)] }).toEqual({
        id: look.id,
        colors: expect.arrayContaining([look.swatch_color]),
      });
    }
  });
});
