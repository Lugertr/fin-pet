// src/components/shared/AppHeaderStats/useAppHeaderPadding.ts
// Единые отступы вокруг AppHeaderStats на всех вкладках таб-бара — чтобы шапка
// стояла на одной и той же высоте и не «прыгала» при переключении вкладок.
// Раньше хаб считал отступ от safe area (insets.top + md), а остальные вкладки
// — фиксированным scale(56): на реальных устройствах это давало разницу
// в 10–20dp. Отступ от safe area корректен на любом устройстве (разная высота
// статус-бара/выреза), поэтому взят он.

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResponsive } from '@/theme';
import { spacing } from '@/theme/tokens';

export function useAppHeaderPadding() {
  const insets = useSafeAreaInsets();
  const { scale } = useResponsive();

  return {
    paddingTop: insets.top + scale(spacing.md),
    paddingBottom: scale(spacing.md),
    // lg, а не xxl: в шапке ещё и кнопка «?» — на экране 360dp иначе не
    // помещается кошелёк с четырёхзначной суммой.
    paddingHorizontal: scale(spacing.lg),
  };
}
