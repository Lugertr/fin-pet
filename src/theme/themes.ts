// src/theme/themes.ts
// Две темы: светлая, тёмная

import { colorPalettes } from './tokens';

/**
 * Семантические цвета — используются в компонентах
 * Меняя тему, меняем только эти значения
 */
export interface Theme {
  name: ThemeName;

  // Основные цвета
  primary: string;
  /** Вторичный акцент — CTA/выделения в уроках, квизах, шагах онбординга. */
  accent: string;
  accentLight: string;

  // Фоны
  background: string;
  surface: string;
  surfaceLight: string;
  /** Приподнятая поверхность (модалка, карточка со shadow) — сейчас всегда
   * совпадает с surface по значению, но это разные UI-роли: surface — фон
   * обычного блока, surfaceElevated — то, что визуально «парит» над ним. */
  surfaceElevated: string;

  // Текст
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Семантические цвета
  success: string;
  warning: string;
  error: string;
  /** Статус/уведомление «информация» — см. комментарий у rarityRare ниже про
   * то, почему они не объединены в один токен, хотя сейчас совпадают. */
  info: string;

  // Специальные цвета
  /** Монеты — сейчас всегда совпадает с rarityLegendary по значению (оба
   * «золотой» акцент), но это разные концепции: coins — валюта, rarityLegendary
   * — редкость предмета. Не сливать в один токен — могут разойтись, если
   * понадобится отличать легендарный предмет от просто «золотого» цвета денег. */
  coins: string;
  rarityCommon: string;
  /** Редкость «редкий» — сейчас всегда совпадает с info (оба голубой), но
   * info — это статус/уведомление, а rarityRare — категория предмета. */
  rarityRare: string;
  rarityEpic: string;
  rarityLegendary: string;

  // Обводки и разделители
  /** border — обводка компонента (карточка, инпут); divider — линия-разделитель
   * между блоками контента. Сейчас всегда совпадают по значению в обеих темах,
   * но это разные UI-роли — раздельные токены, чтобы можно было развести
   * визуально, не трогая обводки компонентов (и наоборот). */
  border: string;
  borderLight: string;
  divider: string;

  // Оверлеи и подложки
  overlay: string;

  /** Текст/иконки поверх цветного градиента — всегда белый, не зависит от темы. */
  onGradient: string;
  /** Текст/иконки поверх акцента warning (жёлто-оранжевый) — всегда тёмный,
   * т.к. warning недостаточно тёмный для белого текста ни в одной теме. */
  onWarning: string;

  // Градиенты (для фирменного стиля)
  gradients: {
    primary: [string, string];
    accent: [string, string];
    reward: [string, string];
    header: [string, string];
  };
}

export type ThemeName = 'light' | 'dark';

/**
 * Светлая тема
 */
export const lightTheme: Theme = {
  name: 'light',

  primary: colorPalettes.emerald[500],
  accent: colorPalettes.indigo[500],
  accentLight: colorPalettes.indigo[300],

  background: colorPalettes.slate[50],
  surface: '#FFFFFF',
  surfaceLight: colorPalettes.slate[100],
  surfaceElevated: '#FFFFFF',

  textPrimary: colorPalettes.slate[900],
  textSecondary: colorPalettes.slate[600],
  textMuted: colorPalettes.slate[400],

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

  onGradient: '#FFFFFF',
  onWarning: '#000000',

  gradients: {
    primary: [colorPalettes.emerald[500], colorPalettes.cyan[500]],
    accent: [colorPalettes.indigo[500], colorPalettes.indigo[600]],
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
  accent: colorPalettes.indigo[400],
  accentLight: colorPalettes.indigo[300],

  background: colorPalettes.slate[900],
  surface: colorPalettes.slate[800],
  surfaceLight: colorPalettes.slate[700],
  surfaceElevated: colorPalettes.slate[800],

  textPrimary: '#FFFFFF',
  textSecondary: colorPalettes.slate[400],
  textMuted: colorPalettes.slate[500],

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

  onGradient: '#FFFFFF',
  onWarning: '#000000',

  gradients: {
    primary: [colorPalettes.emerald[600], colorPalettes.cyan[600]],
    accent: [colorPalettes.indigo[600], colorPalettes.indigo[700]],
    reward: [colorPalettes.amber[500], colorPalettes.orange[600]],
    header: [colorPalettes.slate[800], colorPalettes.slate[900]],
  },
};

/**
 * Словарь всех тем для удобного доступа
 */
export const themes: Record<ThemeName, Theme> = {
  light: lightTheme,
  dark: darkTheme,
};
