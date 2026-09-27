// src/components/shared/CoinAmount/CoinIcon.tsx
// Иконка монеты — только декоративная иллюстрация (онбординг, плитка
// статистики). Суммы на экране пишутся как «80 C» (formatPrice/CoinAmount,
// решение пользователя 27.09.2026), иконку рядом с суммой не ставим. SVG, а не эмодзи 🪙:
// эмодзи монеты появилось только в Android 11 и на более старых устройствах
// рисуется пустым квадратом, а SVG выглядит одинаково везде.
// Декоративная: смысл («N монет») озвучивает CoinAmount/окружающий текст.
// Скрытие от скринридера — на обёртке View через кроссплатформенный
// aria-hidden, а не на самом Svg: в вебе react-native-svg отдаёт все пропсы
// DOM-элементу <svg>, и нативные importantForAccessibility/
// accessibilityElementsHidden давали предупреждение React о неизвестном атрибуте.

import { View } from 'react-native';
import Svg, { Circle, Polygon } from 'react-native-svg';

import { useTheme } from '@/theme';
import { colorPalettes } from '@/theme/tokens';

/** Пятиконечная звезда в центре монеты (viewBox 24×24). */
const STAR_POINTS =
  '12,7 13.29,10.22 16.76,10.45 14.09,12.68 14.94,16.05 12,14.2 9.06,16.05 9.91,12.68 7.24,10.45 10.71,10.22';

export function CoinIcon({ size }: { size: number }) {
  const { theme } = useTheme();

  return (
    <View aria-hidden>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle cx={12} cy={12} r={11} fill={theme.coins} />
        <Circle
          cx={12}
          cy={12}
          r={8.5}
          fill={colorPalettes.amber[400]}
          stroke={colorPalettes.amber[600]}
          strokeWidth={1}
        />
        <Polygon points={STAR_POINTS} fill={colorPalettes.amber[600]} />
      </Svg>
    </View>
  );
}
