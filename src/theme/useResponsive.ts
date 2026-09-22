// src/theme/useResponsive.ts
// Хук адаптивности: определяет размер экрана и масштабирует значения

import { useWindowDimensions } from 'react-native';
import { breakpoints, fontSizes, spacing } from './tokens';

/**
 * Тип устройства по размеру экрана
 */
export type DeviceSize = 'small' | 'medium' | 'large' | 'tablet';

interface ResponsiveUtils {
  // Размеры экрана
  width: number;
  height: number;

  // Тип устройства
  deviceSize: DeviceSize;

  // Флаги для быстрой проверки
  isSmall: boolean;
  isMedium: boolean;
  isLarge: boolean;
  isTablet: boolean;

  // Масштабирование значений под экран
  scale: (size: number) => number;
  // Относительный размер в процентах от ширины
  wp: (percent: number) => number;
  // Относительный размер в процентах от высоты
  hp: (percent: number) => number;
  // Масштабированный отступ
  scaledSpacing: (key: keyof typeof spacing) => number;
  // Масштабированный шрифт
  scaledFont: (key: keyof typeof fontSizes) => number;
}

/**
 * Хук адаптивности
 *
 * Использование:
 *   const { scale, wp, isTablet } = useResponsive();
 *   <View style={{ width: wp(90), padding: scale(16) }} />
 */
export function useResponsive(): ResponsiveUtils {
  const { width, height } = useWindowDimensions();

  // Определяем тип устройства
  const deviceSize: DeviceSize =
    width >= breakpoints.tablet
      ? 'tablet'
      : width >= breakpoints.large
        ? 'large'
        : width >= breakpoints.medium
          ? 'medium'
          : 'small';

  // Коэффициент масштабирования (база — 390, как у iPhone 14). Ограничен с
  // обеих сторон: без нижней границы очень узкие экраны (сплит-скрин,
  // веб-окно) уменьшали персонажа/иконки безгранично, а без верхней —
  // большие экраны увеличивали их безгранично.
  const BASE_WIDTH = 390;
  const scaleFactor = Math.min(Math.max(width / BASE_WIDTH, 0.8), 1.3);

  // Масштабирование значения
  const scale = (size: number): number => Math.round(size * scaleFactor);

  // Проценты от ширины экрана
  const wp = (percent: number): number => (width * percent) / 100;

  // Проценты от высоты экрана
  const hp = (percent: number): number => (height * percent) / 100;

  // Масштабированный отступ из токенов
  const scaledSpacing = (key: keyof typeof spacing): number => scale(spacing[key]);

  // Масштабированный шрифт из токенов
  const scaledFont = (key: keyof typeof fontSizes): number => scale(fontSizes[key]);

  return {
    width,
    height,
    deviceSize,
    isSmall: deviceSize === 'small',
    isMedium: deviceSize === 'medium',
    isLarge: deviceSize === 'large',
    isTablet: deviceSize === 'tablet',
    scale,
    wp,
    hp,
    scaledSpacing,
    scaledFont,
  };
}
