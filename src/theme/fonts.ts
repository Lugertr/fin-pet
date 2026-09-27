// src/theme/fonts.ts
// Шрифт приложения — Manrope (OFL-1.1, файлы из @expo-google-fonts/manrope,
// лежат в бандле — работает офлайн и в Expo Go). Каждая жирность — отдельный
// файл и отдельное имя семейства (так их регистрирует expo-font), поэтому
// fontWeight сам по себе нужный файл не выбирает: Text/TextInput из
// components/ui/Text подставляют fontFamily по fontWeight стиля.

import { Manrope_400Regular } from '@expo-google-fonts/manrope/400Regular';
import { Manrope_500Medium } from '@expo-google-fonts/manrope/500Medium';
import { Manrope_600SemiBold } from '@expo-google-fonts/manrope/600SemiBold';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { Manrope_800ExtraBold } from '@expo-google-fonts/manrope/800ExtraBold';
import type { TextStyle } from 'react-native';

/** Имена семейств по жирностям fontWeights (tokens.ts). */
export const fontFamilies = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
} as const;

/** Файлы шрифта для useFonts — только используемые жирности. */
export const FONT_SOURCES = {
  [fontFamilies.regular]: Manrope_400Regular,
  [fontFamilies.medium]: Manrope_500Medium,
  [fontFamilies.semibold]: Manrope_600SemiBold,
  [fontFamilies.bold]: Manrope_700Bold,
  [fontFamilies.extrabold]: Manrope_800ExtraBold,
};

const NAMED_WEIGHTS: Record<string, number> = {
  thin: 100,
  ultralight: 200,
  light: 300,
  normal: 400,
  regular: 400,
  condensed: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  condensedBold: 700,
  heavy: 800,
  black: 900,
};

/** Семейство Manrope под fontWeight стиля; тоньше 400 — Regular (более
 * тонких файлов не подключаем), толще 800 — ExtraBold. */
export function fontFamilyForWeight(weight: TextStyle['fontWeight']): string {
  const numeric =
    weight === undefined
      ? 400
      : typeof weight === 'number'
        ? weight
        : (NAMED_WEIGHTS[weight] ?? (Number.parseInt(weight, 10) || 400));

  if (numeric >= 800) return fontFamilies.extrabold;
  if (numeric >= 700) return fontFamilies.bold;
  if (numeric >= 600) return fontFamilies.semibold;
  if (numeric >= 500) return fontFamilies.medium;
  return fontFamilies.regular;
}
