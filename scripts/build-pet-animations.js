// scripts/build-pet-animations.js
// Готовит Lottie-анимации питомцев для приложения (запуск: npm run pets:animations).
//
// Источник — .lottie-файлы (dotLottie = zip с JSON внутри), которые лежат
// рядом с SVG: assets/images/pets/<вид>/<вид>_<состояние>.lottie, где
// состояние — happy (бодрый) или sleepy (уставший). Скрипт:
//   1. распаковывает JSON анимации (без зависимостей — zip читается вручную);
//   2. нормализует его, чтобы одинаково играл на Android (lottie-android) и
//      в вебе (dotlottie-web): добавляет пропущенные обязательные поля слоёв
//      и заменяет текстовые слои («Z» шрифтом Nunito) на векторные буквы —
//      шрифта в приложении нет, без него буквы не рисуются, а lottie-android
//      может упасть с «Font asset not found»;
//   3. выводит палитры скинов: скин = перекраска классического облика, и SVG
//      v1/v2 отличаются от v0 только цветами — пары «цвет v0 → цвет vN»
//      берутся из них, а оттенки анимации, которых в SVG нет (тень, ночные
//      цвета спящего робота), пересчитываются от ближайшего такого цвета;
//   4. пишет assets/animations/pets/<вид>_<состояние>.json и palettes.json.
// Перекраска применяется в рантайме (domain/pet/petAnimation.ts), поэтому в
// бандле одна копия каждой анимации, а не по копии на скин.

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '..');
const PETS_DIR = path.join(ROOT, 'assets/images/pets');
const OUT_DIR = path.join(ROOT, 'assets/animations/pets');
const PET_TYPES = ['robot', 'bear', 'cat'];
const STATES = ['happy', 'sleepy'];
/** Для SVG, где цвет v0 не совпал с цветом анимации: насколько близким (ΔE
 * в CIELAB) должен быть ближайший цвет v0, чтобы оттенок перекрашивался. */
const NEAREST_ANCHOR_MAX_DELTA_E = 20;

// ---------------------------------------------------------------- zip / .lottie

function readZipEntries(buffer) {
  let eocd = -1;
  for (let i = buffer.length - 22; i >= 0; i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('не zip-архив (нет End of Central Directory)');

  const count = buffer.readUInt16LE(eocd + 10);
  let offset = buffer.readUInt32LE(eocd + 16);
  const entries = new Map();
  for (let i = 0; i < count; i++) {
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString('utf8', offset + 46, offset + 46 + nameLength);

    const dataStart =
      localOffset +
      30 +
      buffer.readUInt16LE(localOffset + 26) +
      buffer.readUInt16LE(localOffset + 28);
    const raw = buffer.subarray(dataStart, dataStart + compressedSize);
    if (method !== 0 && method !== 8) throw new Error(`${name}: неподдерживаемое сжатие ${method}`);
    entries.set(name, method === 8 ? zlib.inflateRawSync(raw) : raw);

    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

function readLottieAnimation(file) {
  const entries = readZipEntries(fs.readFileSync(file));
  const manifest = JSON.parse(entries.get('manifest.json').toString('utf8'));
  const id = manifest.animations[0].id;
  const json = entries.get(`animations/${id}.json`) ?? entries.get(`a/${id}.json`);
  if (!json) throw new Error(`${file}: в архиве нет анимации ${id}`);
  return JSON.parse(json.toString('utf8'));
}

// ---------------------------------------------------------------- нормализация

/** Векторная «Z»: многоугольник по базовой линии (y = 0 — низ буквы). */
function zGlyphVertices(fontSize, upper) {
  const h = (upper ? 0.7 : 0.5) * fontSize;
  const w = (upper ? 0.55 : 0.47) * fontSize;
  const t = 0.12 * fontSize; // толщина штриха
  const d = 1.28 * t; // горизонтальная толщина диагонали ≈ t по перпендикуляру
  return {
    width: w,
    points: [
      [0, -h],
      [w, -h],
      [w, -h + t],
      [d, -t],
      [w, -t],
      [w, 0],
      [0, 0],
      [0, -t],
      [w - d, -h + t],
      [0, -h + t],
    ],
  };
}

function staticProp(k) {
  return { a: 0, k };
}

/** Текстовый слой → слой-фигура с теми же трансформом и цветом. Поддержаны
 * только буквы Z/z (так сделаны «Zzz» спящих анимаций) — на любом другом
 * тексте скрипт падает, чтобы не выпустить анимацию с пустым местом. */
function textLayerToShapeLayer(layer, file) {
  const keyframes = layer.t.d.k;
  if (keyframes.length > 1) {
    console.warn(`  ! ${file}: у текста «${layer.nm}» анимирован сам текст — берётся первый кадр`);
  }
  const doc = keyframes[0].s;
  const size = doc.s;
  const gap = 0.08 * size;
  const glyphs = [];
  let cursor = 0;
  for (const ch of doc.t) {
    if (ch !== 'Z' && ch !== 'z') {
      throw new Error(
        `${file}: текст «${doc.t}» — поддержаны только буквы Z/z, перерисуйте его фигурой`
      );
    }
    const glyph = zGlyphVertices(size, ch === 'Z');
    glyphs.push(glyph.points.map(([x, y]) => [x + cursor, y]));
    cursor += glyph.width + gap;
  }
  const lineWidth = cursor - gap;
  const shift = doc.j === 1 ? -lineWidth : doc.j === 2 ? -lineWidth / 2 : 0;
  const color = [...doc.fc.slice(0, 3), 1];
  const strokeWidth = 0.05 * size; // скругляет углы, как у шрифта Nunito

  const items = glyphs.map((points) => ({
    ty: 'sh',
    ks: staticProp({
      c: true,
      v: points.map(([x, y]) => [x + shift, y]),
      i: points.map(() => [0, 0]),
      o: points.map(() => [0, 0]),
    }),
  }));
  items.push(
    { ty: 'fl', c: staticProp(color), o: staticProp(100), r: 1, bm: 0 },
    {
      ty: 'st',
      c: staticProp(color),
      o: staticProp(100),
      w: staticProp(strokeWidth),
      lc: 2,
      lj: 2,
      bm: 0,
    },
    {
      ty: 'tr',
      p: staticProp([0, 0]),
      a: staticProp([0, 0]),
      s: staticProp([100, 100]),
      r: staticProp(0),
      o: staticProp(100),
    }
  );

  const { t: _text, ...rest } = layer;
  return { ...rest, ty: 4, shapes: [{ ty: 'gr', nm: `glyph ${doc.t}`, it: items }] };
}

function normalizeLayers(layers, file, stats) {
  return layers.map((layer) => {
    let next = { sr: 1, ddd: 0, ao: 0, ...layer };
    if (next.ty === 5) {
      next = textLayerToShapeLayer(next, file);
      stats.textLayers++;
    }
    return next;
  });
}

function roundNumbers(value) {
  if (Array.isArray(value)) return value.map(roundNumbers);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, child] of Object.entries(value)) out[key] = roundNumbers(child);
    return out;
  }
  // 3 знака: ошибка цвета ≤ 0.0005·255 < 0.5 — hex после округления тот же.
  return typeof value === 'number' ? Math.round(value * 1000) / 1000 : value;
}

function normalizeAnimation(animation, file) {
  const stats = { textLayers: 0 };
  const result = { ...animation, layers: normalizeLayers(animation.layers, file, stats) };
  if (Array.isArray(result.assets)) {
    result.assets = result.assets.map((asset) =>
      asset.layers ? { ...asset, layers: normalizeLayers(asset.layers, file, stats) } : asset
    );
  }
  delete result.fonts;
  delete result.chars;
  return { animation: roundNumbers(result), stats };
}

// ---------------------------------------------------------------- цвета

const toHex = (rgb) =>
  '#' +
  rgb
    .slice(0, 3)
    .map((c) =>
      Math.round(Math.min(1, Math.max(0, c)) * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')
    .toUpperCase();
const hexToRgb255 = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/** Все цвета заливок/обводок анимации (статичные и в ключевых кадрах). */
function collectColors(node, out) {
  if (Array.isArray(node)) {
    node.forEach((child) => collectColors(child, out));
    return out;
  }
  if (node && typeof node === 'object') {
    if ((node.ty === 'gf' || node.ty === 'gs') && node.g) {
      console.warn('  ! градиентная заливка — её цвета не перекрашиваются');
    }
    if ((node.ty === 'fl' || node.ty === 'st') && node.c) {
      if (node.c.a === 1) {
        for (const kf of node.c.k) {
          if (kf.s) out.add(toHex(kf.s));
          if (kf.e) out.add(toHex(kf.e));
        }
      } else {
        out.add(toHex(node.c.k));
      }
    }
    Object.values(node).forEach((child) => collectColors(child, out));
  }
  return out;
}

function rgbToLab([r, g, b]) {
  const lin = (c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const x = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
  const y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  const z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

function deltaE(hexA, hexB) {
  const a = rgbToLab(hexToRgb255(hexA));
  const b = rgbToLab(hexToRgb255(hexB));
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function rgbToHsl([r, g, b]) {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === R
      ? ((G - B) / d + (G < B ? 6 : 0)) / 6
      : max === G
        ? ((B - R) / d + 2) / 6
        : ((R - G) / d + 4) / 6;
  return [h, s, l];
}

function hslToHex([h, s, l]) {
  const hue = (p, q, t) => {
    const tt = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  if (s === 0) return toHex([l, l, l]);
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return toHex([hue(p, q, h + 1 / 3), hue(p, q, h), hue(p, q, h - 1 / 3)]);
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** Оттенок, которого нет в SVG: тот же сдвиг тона/насыщенности/светлоты,
 * что у ближайшего цвета v0 при переходе к его цвету в скине. */
function shiftLikeAnchor(color, anchorFrom, anchorTo) {
  const [h, s, l] = rgbToHsl(hexToRgb255(color));
  const [hA, sA, lA] = rgbToHsl(hexToRgb255(anchorFrom));
  const [hT, sT, lT] = rgbToHsl(hexToRgb255(anchorTo));
  return hslToHex([
    (((hT + (h - hA)) % 1) + 1) % 1,
    clamp01(sT + (s - sA)),
    clamp01(lT + (l - lA)),
  ]);
}

const HEX_COLOR = /#[0-9a-fA-F]{6}\b/g;

/** Скин после переэкспорта из редактора: пути те же, но координаты округлены
 * иначе, и точного совпадения геометрии нет. Тогда элемент ищется по первой
 * точке (M пути, cx/cy, x/y) — не дальше этого числа пикселей. */
const POSITION_MATCH_MAX_PX = 3;
/** Меньшая доля сопоставленных элементов — у скина свой рисунок, не перекраска. */
const MIN_MATCHED_SHARE = 0.75;
/** Сколько сопоставленных элементов должны подтвердить пару «цвет v0 → цвет скина». */
const MIN_ANCHOR_VOTES = 2;

/** Элементы SVG с цветами: «геометрия» (тег и атрибуты без цветов), цвета и
 * первая точка — для сопоставления с элементами скина. */
function svgColoredElements(file) {
  const elements = fs.readFileSync(file, 'utf8').match(/<[a-zA-Z][^>]*>/g) || [];
  return elements.flatMap((element) => {
    const colors = (element.match(HEX_COLOR) || []).map((c) => c.toUpperCase());
    if (colors.length === 0) return [];
    const move = /\bd="M\s*([-\d.]+)[ ,]([-\d.]+)/.exec(element);
    const center = /\bcx="([-\d.]+)"[^>]*\bcy="([-\d.]+)"/.exec(element);
    const corner = /\bx="([-\d.]+)"[^>]*\by="([-\d.]+)"/.exec(element);
    const point = move || center || corner;
    return [
      {
        key: element.replace(HEX_COLOR, '#'),
        colors,
        point: point ? [Number(point[1]), Number(point[2])] : null,
      },
    ];
  });
}

/** Парный элемент скина: сначала с той же геометрией, иначе — ближайший по
 * первой точке с тем же числом цветов (элемент скина может стать парой не
 * одному элементу v0 — для голосования за цвета это не мешает). null — пары
 * нет. */
function matchSkinElement(element, skinElements) {
  const exact = skinElements.findIndex((e) => e.key === element.key);
  if (exact >= 0) return exact;
  if (!element.point) return null;
  let best = null;
  let bestDistance = Infinity;
  skinElements.forEach((e, i) => {
    if (!e.point || e.colors.length !== element.colors.length) return;
    const distance = Math.hypot(e.point[0] - element.point[0], e.point[1] - element.point[1]);
    if (distance < bestDistance) {
      best = i;
      bestDistance = distance;
    }
  });
  return bestDistance <= POSITION_MATCH_MAX_PX ? best : null;
}

/** Пары «цвет v0 → цвет скина» из SVG: файлы скинов отличаются от v0 только
 * цветами, но порядок элементов местами разный (а после переэкспорта — и
 * округление координат), поэтому элементы сопоставляются по геометрии или
 * положению, а при расхождениях для цвета v0 берётся самый частый парный
 * цвет. Сопоставилось мало элементов — у скина свой рисунок: ошибка, палитры
 * нет (см. main). */
function deriveAnchors(petType, variant) {
  const votes = new Map();
  for (const state of ['idle', 'sleeping']) {
    const base = path.join(PETS_DIR, petType, 'v0', `${state}.svg`);
    const skin = path.join(PETS_DIR, petType, `v${variant}`, `${state}.svg`);
    if (!fs.existsSync(base) || !fs.existsSync(skin)) continue;
    const baseElements = svgColoredElements(base);
    const skinElements = svgColoredElements(skin);
    let matched = 0;
    for (const element of baseElements) {
      const index = matchSkinElement(element, skinElements);
      if (index === null) continue;
      matched += 1;
      element.colors.forEach((color, j) => {
        const counter = votes.get(color) ?? new Map();
        const target = skinElements[index].colors[j];
        counter.set(target, (counter.get(target) ?? 0) + 1);
        votes.set(color, counter);
      });
    }
    if (matched < baseElements.length * MIN_MATCHED_SHARE) {
      throw new Error(
        `${petType} v${variant}/${state}.svg: рисунок отличается от v0 не только цветом ` +
          `(сопоставлено ${matched} из ${baseElements.length} элементов)`
      );
    }
  }
  const anchors = {};
  for (const [color, counter] of votes) {
    const [target, count] = [...counter.entries()].sort((a, b) => b[1] - a[1])[0];
    // Пара по одному-единственному элементу (после переэкспорта мог
    // сопоставиться не тот) — ненадёжна: такой цвет не перекрашиваем.
    if (count < MIN_ANCHOR_VOTES && target !== color) continue;
    anchors[color] = target;
  }
  return anchors;
}

function buildPalette(colors, anchors) {
  const palette = {};
  const report = [];
  for (const color of [...colors].sort()) {
    let target = anchors[color];
    let how = 'как в SVG';
    if (target === undefined) {
      const [nearest, distance] = Object.keys(anchors)
        .map((anchor) => [anchor, deltaE(color, anchor)])
        .sort((a, b) => a[1] - b[1])[0] ?? [null, Infinity];
      if (nearest && distance <= NEAREST_ANCHOR_MAX_DELTA_E && anchors[nearest] !== nearest) {
        target = shiftLikeAnchor(color, nearest, anchors[nearest]);
        how = `от ${nearest} (ΔE ${distance.toFixed(1)})`;
      } else {
        target = color;
        how = 'не перекрашивается';
      }
    }
    if (target !== color) palette[color] = target;
    report.push(`    ${color} → ${target}  ${how}`);
  }
  return { palette, report };
}

// ---------------------------------------------------------------- main

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const palettes = {};

  for (const petType of PET_TYPES) {
    const petColors = new Set();
    for (const state of STATES) {
      const source = path.join(PETS_DIR, petType, `${petType}_${state}.lottie`);
      if (!fs.existsSync(source)) {
        console.log(`${petType}_${state}: нет ${path.relative(ROOT, source)} — пропуск`);
        continue;
      }
      const { animation, stats } = normalizeAnimation(readLottieAnimation(source), source);
      collectColors(animation, petColors);
      const target = path.join(OUT_DIR, `${petType}_${state}.json`);
      fs.writeFileSync(target, JSON.stringify(animation));
      console.log(
        `${petType}_${state}: ${animation.w}×${animation.h}, ${animation.op - animation.ip} кадров ` +
          `@${animation.fr} fps, текстовых слоёв заменено: ${stats.textLayers} → ${path.relative(ROOT, target)}`
      );
    }

    const variants = fs
      .readdirSync(path.join(PETS_DIR, petType))
      .map((dir) => /^v(\d+)$/.exec(dir))
      .filter((match) => match && match[1] !== '0')
      .map((match) => Number(match[1]))
      .sort((a, b) => a - b);
    for (const variant of variants) {
      // Скин со своим рисунком (не перекраска v0, например облики мишки):
      // палитры нет — анимация по нажатию для него не играет, остаётся SVG
      // (domain/pet/Pet.ts getAnimation).
      let anchors;
      try {
        anchors = deriveAnchors(petType, variant);
      } catch (error) {
        console.log(`  палитра ${petType} v${variant}: нет — ${error.message}`);
        continue;
      }
      const { palette, report } = buildPalette(petColors, anchors);
      palettes[petType] = { ...palettes[petType], [variant]: palette };
      console.log(`  палитра ${petType} v${variant}:`);
      report.forEach((line) => console.log(line));
    }
  }

  fs.writeFileSync(path.join(OUT_DIR, 'palettes.json'), JSON.stringify(palettes, null, 2) + '\n');
  console.log(`палитры скинов → ${path.relative(ROOT, path.join(OUT_DIR, 'palettes.json'))}`);
}

main();
