// src/theme/themes.ts
// Три темы: светлая, тёмная, AMOLED

import { colorPalettes } from './tokens';

/**
 * Семантические цвета — используются в компонентах
 * Меняя тему, меняем только эти значения
 */
export interface Theme {
  name: ThemeName;

  // Основные цвета
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentLight: string;

  // Фоны
  background: string;
  surface: string;
  surfaceLight: string;
  surfaceElevated: string;

  // Текст
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverted: string;

  // Семантические цвета
  success: string;
  warning: string;
  error: string;
  info: string;

  // Специальные цвета
  coins: string; // Монеты
  rarityCommon: string;
  rarityRare: string;
  rarityEpic: string;
  rarityLegendary: string;

  // Обводки и разделители
  border: string;
  borderLight: string;
  divider: string;

  // Оверлеи и подложки
  overlay: string;
  backdrop: string;

  // Градиенты (для фирменного стиля)
  gradients: {
    primary: [string, string];
    accent: [string, string];
    reward: [string, string];
    header: [string, string];
  };
}

export type ThemeName = 'light' | 'dark' | 'amoled';

/**
 * Светлая тема
 */
export const lightTheme: Theme = {
  name: 'light',

  primary: colorPalettes.emerald[500],
  primaryLight: colorPalettes.emerald[300],
  primaryDark: colorPalettes.emerald[700],
  accent: colorPalettes.cyan[500],
  accentLight: colorPalettes.cyan[300],

  background: colorPalettes.slate[50],
  surface: '#FFFFFF',
  surfaceLight: colorPalettes.slate[100],
  surfaceElevated: '#FFFFFF',

  textPrimary: colorPalettes.slate[900],
  textSecondary: colorPalettes.slate[600],
  textMuted: colorPalettes.slate[400],
  textInverted: '#FFFFFF',

  success: colorPalettes.emerald[500],
  warning: colorPalettes.orange[500],
  error: colorPalettes.red[500],
  info: colorPalettes.cyan[500],

  coins: colorPalettes.amber[500],
  rarityCommon: colorPalettes.slate[500],
  rarityRare: colorPalettes.cyan[500],
  rarityEpic: colorPalettes.violet[500],
  rarityLegendary: colorPalettes.amber[500],

  border: colorPalettes.slate[200],
  borderLight: colorPalettes.slate[100],
  divider: colorPalettes.slate[200],

  overlay: 'rgba(0, 0, 0, 0.5)',
  backdrop: 'rgba(255, 255, 255, 0.9)',

  gradients: {
    primary: [colorPalettes.emerald[500], colorPalettes.cyan[500]],
    accent: [colorPalettes.cyan[500], colorPalettes.emerald[400]],
    reward: [colorPalettes.amber[400], colorPalettes.orange[500]],
    header: [colorPalettes.emerald[600], colorPalettes.cyan[600]],
  },
};

/**
 * Тёмная тема (основная)
 */
export const darkTheme: Theme = {
  name: 'dark',

  primary: colorPalettes.emerald[500],
  primaryLight: colorPalettes.emerald[400],
  primaryDark: colorPalettes.emerald[600],
  accent: colorPalettes.cyan[500],
  accentLight: colorPalettes.cyan[400],

  background: colorPalettes.slate[900],
  surface: colorPalettes.slate[800],
  surfaceLight: colorPalettes.slate[700],
  surfaceElevated: colorPalettes.slate[800],

  textPrimary: '#FFFFFF',
  textSecondary: colorPalettes.slate[400],
  textMuted: colorPalettes.slate[500],
  textInverted: colorPalettes.slate[900],

  success: colorPalettes.emerald[400],
  warning: colorPalettes.orange[400],
  error: colorPalettes.red[400],
  info: colorPalettes.cyan[400],

  coins: colorPalettes.amber[400],
  rarityCommon: colorPalettes.slate[400],
  rarityRare: colorPalettes.cyan[400],
  rarityEpic: colorPalettes.violet[400],
  rarityLegendary: colorPalettes.amber[400],

  border: colorPalettes.slate[700],
  borderLight: colorPalettes.slate[800],
  divider: colorPalettes.slate[700],

  overlay: 'rgba(0, 0, 0, 0.7)',
  backdrop: 'rgba(15, 23, 42, 0.9)',

  gradients: {
    primary: [colorPalettes.emerald[600], colorPalettes.cyan[600]],
    accent: [colorPalettes.cyan[600], colorPalettes.emerald[500]],
    reward: [colorPalettes.amber[500], colorPalettes.orange[600]],
    header: [colorPalettes.slate[800], colorPalettes.slate[900]],
  },
};

/**
 * AMOLED тема (глубокий чёрный для экономии батареи)
 */
export const amoledTheme: Theme = {
  name: 'amoled',

  primary: colorPalettes.emerald[400],
  primaryLight: colorPalettes.emerald[300],
  primaryDark: colorPalettes.emerald[500],
  accent: colorPalettes.cyan[400],
  accentLight: colorPalettes.cyan[300],

  background: '#000000',
  surface: colorPalettes.slate[950],
  surfaceLight: colorPalettes.slate[900],
  surfaceElevated: colorPalettes.slate[900],

  textPrimary: '#FFFFFF',
  textSecondary: colorPalettes.slate[400],
  textMuted: colorPalettes.slate[500],
  textInverted: '#000000',

  success: colorPalettes.emerald[400],
  warning: colorPalettes.orange[400],
  error: colorPalettes.red[400],
  info: colorPalettes.cyan[400],

  coins: colorPalettes.amber[400],
  rarityCommon: colorPalettes.slate[400],
  rarityRare: colorPalettes.cyan[400],
  rarityEpic: colorPalettes.violet[400],
  rarityLegendary: colorPalettes.amber[400],

  border: colorPalettes.slate[800],
  borderLight: colorPalettes.slate[900],
  divider: colorPalettes.slate[800],

  overlay: 'rgba(0, 0, 0, 0.8)',
  backdrop: 'rgba(0, 0, 0, 0.95)',

  gradients: {
    primary: [colorPalettes.emerald[700], colorPalettes.cyan[700]],
    accent: [colorPalettes.cyan[700], colorPalettes.emerald[600]],
    reward: [colorPalettes.amber[600], colorPalettes.orange[700]],
    header: ['#000000', colorPalettes.slate[950]],
  },
};

/**
 * Словарь всех тем для удобного доступа
 */
export const themes: Record<ThemeName, Theme> = {
  light: lightTheme,
  dark: darkTheme,
  amoled: amoledTheme,
};
