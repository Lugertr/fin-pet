// src/components/ui/Card/Card.tsx

import { useResponsive, useTheme } from '@/theme';
import { ReactNode } from 'react';
import { StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import { CardPadding, CardVariant, createCardStyles } from './Card.styles';

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  onPress?: () => void;
  /** Доп. вёрстка поверх фона/паддинга/радиуса варианта — например,
   * flexDirection:'row' для карточки-строки (иконка + инфо + цена). */
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, variant = 'default', padding = 'md', onPress, style }: CardProps) {
  const { theme } = useTheme();
  const { scale } = useResponsive();
  const styles = createCardStyles({ theme, variant, padding, scale });

  // Кликабельная версия
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.container, style]}>
        {children}
      </TouchableOpacity>
    );
  }

  // Обычная версия
  return <View style={[styles.container, style]}>{children}</View>;
}
