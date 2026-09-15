// src/components/ui/Card/Card.tsx

import { useTheme } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { CardPadding, CardVariant, createCardStyles } from './Card.styles';

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  gradient?: [string, string];
  onPress?: () => void;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  gradient,
  onPress,
}: CardProps) {
  const { theme } = useTheme();
  const styles = createCardStyles({ theme, variant, padding });

  // Градиентная версия
  if (variant === 'gradient' && gradient) {
    return (
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.innerGradient}
      >
        {children}
      </LinearGradient>
    );
  }

  // Кликабельная версия
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.container}>
        {children}
      </TouchableOpacity>
    );
  }

  // Обычная версия
  return <View style={styles.container}>{children}</View>;
}
