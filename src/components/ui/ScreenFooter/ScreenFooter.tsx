// src/components/ui/ScreenFooter/ScreenFooter.tsx
// Подвал экрана/шага с кнопкой(ами) действия — снаружи ScrollView, поэтому
// не зависит от длины контента и всегда видим. Раньше этот расчёт (отступ
// снизу safe-area + паддинги) был только в онбординге — здесь он общий.

import { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResponsive } from '@/theme';
import { spacing } from '@/theme/tokens';

interface ScreenFooterProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ScreenFooter({ children, style }: ScreenFooterProps) {
  const insets = useSafeAreaInsets();
  const { scale } = useResponsive();

  return (
    <View
      style={[
        {
          paddingHorizontal: scale(spacing.xxl),
          paddingTop: scale(spacing.md),
          paddingBottom: insets.bottom + scale(spacing.md),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
