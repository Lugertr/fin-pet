// theme/fonts.test.ts
// Жирность стиля → файл Manrope: у каждой жирности своё семейство, и если
// сопоставление ошибётся, текст будет не той толщины (или системным шрифтом).

import { fontFamilies, fontFamilyForWeight, FONT_SOURCES } from './fonts';
import { fontWeights } from './tokens';

describe('fontFamilyForWeight', () => {
  it('каждый токен fontWeights получает свой файл Manrope', () => {
    expect(fontFamilyForWeight(fontWeights.regular)).toBe(fontFamilies.regular);
    expect(fontFamilyForWeight(fontWeights.medium)).toBe(fontFamilies.medium);
    expect(fontFamilyForWeight(fontWeights.semibold)).toBe(fontFamilies.semibold);
    expect(fontFamilyForWeight(fontWeights.bold)).toBe(fontFamilies.bold);
    expect(fontFamilyForWeight(fontWeights.extrabold)).toBe(fontFamilies.extrabold);
  });

  it('без жирности и с именованными жирностями', () => {
    expect(fontFamilyForWeight(undefined)).toBe(fontFamilies.regular);
    expect(fontFamilyForWeight('normal')).toBe(fontFamilies.regular);
    expect(fontFamilyForWeight('bold')).toBe(fontFamilies.bold);
    expect(fontFamilyForWeight(600)).toBe(fontFamilies.semibold);
  });

  it('вне диапазона файлов — ближайший подключённый', () => {
    expect(fontFamilyForWeight('100')).toBe(fontFamilies.regular);
    expect(fontFamilyForWeight('light')).toBe(fontFamilies.regular);
    expect(fontFamilyForWeight('900')).toBe(fontFamilies.extrabold);
    expect(fontFamilyForWeight('black')).toBe(fontFamilies.extrabold);
  });

  it('у каждого семейства есть файл для загрузки', () => {
    for (const family of Object.values(fontFamilies)) {
      expect(FONT_SOURCES[family]).toBeDefined();
    }
  });
});
